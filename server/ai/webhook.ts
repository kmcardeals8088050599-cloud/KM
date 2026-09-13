// WhatsApp Webhook — official Business Cloud API ingress.
//
// Idempotency: every inbound event keyed on external_id (Meta wamid.id). A message that
// has already been stored is never processed twice. Webhook returns 200 after storing;
// AI processing runs as a background job kept alive via waitUntil (Vercel Fluid freezes
// bare fire-and-forget promises once the handler returns), keeping the webhook fast.

import type { Request, Response } from 'express';
import {
  getMessageByExternalId,
  persistInboundMessage,
  getOrCreateConversation,
  listUnprocessedMessages,
} from './db.js';
import { resolveMediaUrl, storeRemoteMedia, isAdminSender } from './whatsapp-api.js';
import { runIntake } from './intake.js';
import { handleAdminMessage } from './admin-commands.js';
import { transcribeAudioUrl } from './audio.js';
import type { InboundMessage, MessageAttachment } from '../../src/types/ai.js';

// Cap an intake run so the webhook always returns 200. If the AI work outlives the
// budget the message stays unprocessed and the guarded /api/ai/workqueue rescues it.
const INTAKE_TIMEOUT_MS = 90_000;

async function runIntakeWithinTimeout(
  conversationId: string,
  messageId: string,
  ctx: { requestId: string; fromPhone: string; participantType: 'seller' | 'dealer' | 'buyer' | 'admin' }
): Promise<void> {
  let timer: NodeJS.Timeout | undefined;
  const guard = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`intake exceeded ${INTAKE_TIMEOUT_MS}ms`)), INTAKE_TIMEOUT_MS);
  });
  try {
    await Promise.race([runIntake(conversationId, messageId, ctx), guard]);
  } catch (err: any) {
    console.error('[Webhook] Intake did not finish in-band:', err.message);
  } finally {
    clearTimeout(timer);
  }
}

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
          // Admin control responses processed in-band (fast, safe to await).
          await handleAdminMessage(conversation.id, fromPhone, inbound.text || '', requestId);
        } else {
          // Seller intake processed in-band. Vercel Fluid freezes bare fire-and-forget
          // promises once the handler returns, so awaiting here is what actually gets
          // the AI work done; the timeout guard keeps the 200 bounded.
          await runIntakeWithinTimeout(conversation.id, externalId, ctx);
        }
        stored++;

        // In-band catch-up: clear this conversation's earlier backlog within the same
        // invocation while we still have budget (Cloudflare edges cut the call ~100s).
        const budgetUntil = Date.now() + INTAKE_TIMEOUT_MS;
        const leftover = (await listUnprocessedMessages(6, 6))
          .filter((m) => m.conversationId === conversation.id && m.id !== externalId)
          .slice(0, 2);
        for (const lm of leftover) {
          if (Date.now() > budgetUntil - 5_000) break;
          await runIntakeWithinTimeout(lm.conversationId, lm.id, ctx);
        }
      }
    }
  }

  return { stored, skipped };
}

// Keep a usable URL no matter what: prefer the durable blob copy, but fall back to
// the (time-limited) Meta download URL when the blob store fails, so the image is
// never silently rendered useless to the extraction/vision pipeline.
async function durableMediaUrl(url: string | null, prefix: string): Promise<string | null> {
  if (!url) return null;
  const stored = await storeRemoteMedia(url, prefix);
  return stored || url;
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
    const durable = await durableMediaUrl(url, `whatsapp/${inbound.externalId}`);
    attachments.push({ kind: 'image', mediaId, url: durable || undefined, mimeType: mime });
  }

  if (type === 'audio') {
    const mediaId = raw.audio?.id;
    const mime = raw.audio?.mime_type;
    const url = await resolveMediaUrl(mediaId);
    const durable = await durableMediaUrl(url, `whatsapp/${inbound.externalId}`);
    const transcript = durable ? await transcribeAudioUrl(durable, undefined) : null;
    attachments.push({ kind: 'audio', mediaId, url: durable || undefined, mimeType: mime, text: transcript || undefined });
    if (transcript) inbound.text = `[Voice message] ${transcript}`;
  }

  if (type === 'document') {
    const mediaId = raw.document?.id;
    const url = await resolveMediaUrl(mediaId);
    const durable = await durableMediaUrl(url, `whatsapp/${inbound.externalId}`);
    attachments.push({ kind: 'document', mediaId, url: durable || undefined, mimeType: raw.document?.mime_type });
  }

  if (type === 'video') {
    const mediaId = raw.video?.id;
    const url = await resolveMediaUrl(mediaId);
    const durable = await durableMediaUrl(url, `whatsapp/${inbound.externalId}`);
    attachments.push({ kind: 'video', mediaId, url: durable || undefined, mimeType: raw.video?.mime_type });
  }

  inbound.attachments = attachments.length > 0 ? attachments : undefined;
  inbound.type = (type as InboundMessage['type']) || 'unknown';
}