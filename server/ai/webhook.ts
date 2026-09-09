// WhatsApp Webhook — official Business Cloud API ingress.
//
// Idempotency: every inbound event keyed on external_id (Meta wamid.id). A message that
// has already been stored is never processed twice. Webhook returns 200 after storing;
// all AI processing is fire-and-forget (async job), keeping the webhook fast and safe.

import type { Request, Response } from 'express';
import {
  getMessageByExternalId,
  persistInboundMessage,
  getOrCreateConversation,
} from './db.js';
import { resolveMediaUrl, storeRemoteMedia } from './whatsapp-api.js';
import { runIntake } from './intake.js';
import { handleAdminMessage, isAdminSender } from './admin-commands.js';
import { transcribeAudioUrl } from './audio.js';
import type { InboundMessage, MessageAttachment } from '../../src/types/ai.js';

// --- Verification (GET) ---
export function verifyWebhook(req: Request, res: Response): void {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    res.status(200).send(challenge);
    return;
  }
  res.status(403).send('Forbidden');
}

// --- Ingress (POST) ---
export async function processWebhookBody(body: any): Promise<{ stored: number; skipped: number }> {
  const entries = body?.entry;
  if (!Array.isArray(entries)) return { stored: 0, skipped: 0 };

  let stored = 0;
  let skipped = 0;

  for (const entry of entries) {
    const changes = entry?.changes;
    if (!Array.isArray(changes)) continue;
    for (const change of changes) {
      const value = change?.value;
      const messages = value?.messages;
      if (!Array.isArray(messages)) continue;

      for (const raw of messages) {
        const externalId: string | undefined = raw?.id;
        if (!externalId) {
          skipped++;
          continue;
        }

        // Idempotency gate
        const existing = await getMessageByExternalId(externalId);
        if (existing) {
          skipped++;
          continue;
        }

        const fromPhone: string = raw?.from || '';
        const timestamp: string = raw?.timestamp || '';
        const senderIsAdmin = isAdminSender(fromPhone);

        const inbound: InboundMessage = {
          externalId,
          from: fromPhone,
          participantType: senderIsAdmin ? 'admin' : 'seller',
          type: raw?.type || 'unknown',
          timestamp,
        };

        await enrichMessage(inbound, raw);

        // Conversation session
        const conversation = await getOrCreateConversation(fromPhone, inbound.participantType || 'seller');

        await persistInboundMessage({
          externalId,
          conversationId: conversation.id,
          fromPhone,
          type: inbound.type,
          text: inbound.text,
          media: inbound.attachments,
        });

        const requestId = `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const ctx = {
          requestId,
          fromPhone,
          participantType: senderIsAdmin ? 'admin' as const : 'seller' as const,
        };

        if (senderIsAdmin) {
          // Admin control responses are processed eagerly (fast, deterministic).
          void handleAdminMessage(conversation.id, fromPhone, inbound.text || '', requestId).catch(err =>
            console.error('[Webhook] Admin handler failed:', err)
          );
        } else {
          void runIntake(conversation.id, externalId, ctx).catch(err =>
            console.error('[Webhook] Intake job failed:', err)
          );
        }
        stored++;
      }
    }
  }

  return { stored, skipped };
}

// Enrich the raw Meta message: copy text, resolve media URLs into durable blob copies.
async function enrichMessage(
  inbound: InboundMessage,
  raw: any
): Promise<void> {
  const type = raw.type;
  const attachments: MessageAttachment[] = [];

  if (type === 'text') {
    inbound.text = raw.text?.body || '';
  }

  if (type === 'image') {
    const mediaId = raw.image?.id;
    const mime = raw.image?.mime_type;
    const url = await resolveMediaUrl(mediaId);
    const durable = url ? await storeRemoteMedia(url, `whatsapp/${inbound.externalId}`) : url;
    attachments.push({ kind: 'image', mediaId, url: durable || undefined, mimeType: mime });
  }

  if (type === 'audio') {
    const mediaId = raw.audio?.id;
    const mime = raw.audio?.mime_type;
    const url = await resolveMediaUrl(mediaId);
    const durable = url ? await storeRemoteMedia(url, `whatsapp/${inbound.externalId}`) : url;
    const transcript = durable ? await transcribeAudioUrl(durable, undefined) : null;
    attachments.push({ kind: 'audio', mediaId, url: durable || undefined, mimeType: mime, text: transcript || undefined });
    if (transcript) inbound.text = `[Voice message] ${transcript}`;
  }

  if (type === 'document') {
    const mediaId = raw.document?.id;
    const url = await resolveMediaUrl(mediaId);
    const durable = url ? await storeRemoteMedia(url, `whatsapp/${inbound.externalId}`) : url;
    attachments.push({ kind: 'document', mediaId, url: durable || undefined, mimeType: raw.document?.mime_type });
  }

  if (type === 'video') {
    const mediaId = raw.video?.id;
    const url = await resolveMediaUrl(mediaId);
    const durable = url ? await storeRemoteMedia(url, `whatsapp/${inbound.externalId}`) : url;
    attachments.push({ kind: 'video', mediaId, url: durable || undefined, mimeType: raw.video?.mime_type });
  }

  inbound.attachments = attachments.length > 0 ? attachments : undefined;
  inbound.type = (type as InboundMessage['type']) || 'unknown';
}