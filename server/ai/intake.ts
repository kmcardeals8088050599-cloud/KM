// AI Vehicle Intake Agent — the orchestrator that runs after a WhatsApp message is stored.
//
// Flow per message:
//   conversation → draft (create if none) → RECEIVED → PROCESSING
//   → build transcript → AI extraction (merge, respect locked fields)
//   → run image pipeline for new image attachments
//   → deterministic validation
//   → if ready: generate content → READY_FOR_REVIEW → notify admin
//   → else: send follow-up questions → INCOMPLETE
//
// This runs as a fire-and-forget job after the webhook returns 200 (strictly async).
// It is observable: every failure marks the message with an error and the draft a failure state.

import {
  getOrCreateConversation,
  updateConversation,
  getVehicleDraftByConversation,
  getOrCreateDraftForConversation,
  updateVehicleDraft,
  getVehicleDraft,
  listConversationMessages,
  StoredMessage,
} from './db.js';
import { extractVehicleFromConversation } from './extraction.js';
import { validateDraft } from './validation.js';
import { generateVehicleContent } from './content.js';
import { buildTranscript } from './transcript.js';
import { classifyAndAnalyze } from './images.js';
import { appendAudit, logAiUsage } from './audit.js';
import { sendWhatsAppText, notifyAdmin, resolveMediaUrl, storeRemoteMedia } from './whatsapp-api.js';
import { markMessageProcessed, bumpProcessingAttempt } from './db.js';
import { assertTransition } from './state-machine.js';
import { getActiveModels } from './ai.js';
import { approveDraft } from './publisher.js';
import { AUTO_PUBLISH } from './config.js';
import { supabase } from '../supabase.js';
import { VehicleExtractedData } from '../../src/types/ai.js';

export interface IntakeContext {
  requestId: string;
  fromPhone: string;
  participantType: 'seller' | 'dealer' | 'admin' | 'buyer';
}

export async function runIntake(conversationId: string, messageId: string, ctx: IntakeContext): Promise<void> {
  const startedAt = Date.now();
  try {
    const conversation = await getOrCreateConversation(ctx.fromPhone, ctx.participantType);

    // Deterministic find-or-create: concurrent webhook invocations for the same
    // conversation converge on the SAME draft row, never duplicates.
    let draft = await getOrCreateDraftForConversation(conversationId, {
      state: 'RECEIVED',
      sellerPhone: ctx.fromPhone,
      sellerName: ctx.participantType === 'admin' ? 'Admin' : undefined,
      source: 'whatsapp',
    });
    if (['APPROVED', 'PUBLISHED', 'UPDATED', 'SOLD', 'ARCHIVED'].includes(draft.state)) {
      await markMessageProcessed(messageId);
      return;
    }

    await retry(() => updateConversation(conversationId, { vehicleDraftId: draft.id, state: 'collecting' }));

    // RECEIVED → PROCESSING (system). Failed drafts are retried on new messages.
    if (draft.state === 'RECEIVED' || draft.state === 'INCOMPLETE' || draft.state === 'PROCESSING_FAILED' || draft.state === 'IMAGE_PROCESSING_FAILED' || draft.state === 'PUBLISH_FAILED') {
      assertTransition(draft.state, 'PROCESSING', 'system');
      draft = await retry(() => updateVehicleDraft(draft.id, { state: 'PROCESSING' }));
    }

    const storedMessages = await listConversationMessages(conversationId);
    const messages = await ensureMediaUrls(storedMessages);
    const transcript = buildTranscript(messages);

    // 1. AI structured extraction (merge with existing data, respect locked fields)
    const extraction = await extractVehicleFromConversation({
      conversationId,
      transcript,
      existing: draft.data,
      lockedFields: draft.lockedFields,
    });

    const mergedData: VehicleExtractedData = extraction.data;

    // One thread == one vehicle. A different credible identity is rejected instead of
    // being merged into the existing listing (keeps the live data consistent).
    const vehicleConflict = detectVehicleConflict(draft.data, mergedData);
    if (vehicleConflict) {
      await markMessageProcessed(messageId);
      await sendWhatsAppText(
        ctx.fromPhone,
        ['⚠️', vehicleConflict, '', 'I did not change the existing listing.'].join('\n')
      );
      await notifyAdmin(
        `🚧 Conflicting data in ${draft.id}: ${vehicleConflict.split('—').pop().trim()}`
      );
      return;
    }

    await retry(() =>
      updateVehicleDraft(draft.id, {
        data: mergedData,
        confidence: { ...draft.confidence, ...extraction.confidence },
        provenance: { ...draft.provenance, ...extraction.provenance },
      })
    );

    await appendAudit({
      actor: 'ai-extraction-agent',
      actorType: 'system',
      action: 'extract_merge',
      entity: 'vehicle_draft',
      entityId: draft.id,
      newValue: mergedData,
      source: 'whatsapp',
      conversationId,
      requestId: ctx.requestId,
    });

    // 2. Image pipeline for image attachments
    await processImagesForMessage(draft.id, conversationId, messages, ctx);

    // 3. Validation
    const validation = validateDraft(mergedData);

    const targetState = validation.readyToReview ? 'READY_FOR_REVIEW' : 'INCOMPLETE';

    // Move READY_FOR_REVIEW → PROCESSING first when new info makes it incomplete again.
    if (draft.state === 'READY_FOR_REVIEW' && targetState !== 'READY_FOR_REVIEW') {
      assertTransition(draft.state, 'PROCESSING', 'system');
      draft = await retry(() => updateVehicleDraft(draft.id, { state: 'PROCESSING' }));
    }

    // Auto-publish only accepts a credible vehicle identity; placeholder brand/model
    // ("unknown") means we still need the sender to provide the real details on WhatsApp.
    const credibleIdentity = nonPlaceholder(mergedData.brand) && nonPlaceholder(mergedData.model);

    if (validation.readyToReview && (!AUTO_PUBLISH || credibleIdentity)) {
      // 4. Content generation (skip re-generating when already in review with content)
      let content = draft.content;
      if (!content) {
        try {
          content = await generateVehicleContent(conversationId, mergedData, draft.id);
        } catch (err: any) {
          await logAiUsage({
            entity: 'vehicle_draft',
            entityId: draft.id,
            agent: 'content',
            model: getActiveModels().text,
            event: 'generate_content',
            status: 'error',
            durationMs: Date.now() - startedAt,
            conversationId,
          });
          console.error('[Intake] Content generation failed:', err.message);
        }
      }
      if (content) await retry(() => updateVehicleDraft(draft.id, { content }));

      const wasInReview = draft.state === 'READY_FOR_REVIEW';
      if (!wasInReview) {
        assertTransition(draft.state, 'READY_FOR_REVIEW', 'system');
        draft = await retry(() => updateVehicleDraft(draft.id, { state: 'READY_FOR_REVIEW' }));
      } else {
        draft = await retry(() => updateVehicleDraft(draft.id, { error: null }));
      }
      await retry(() => updateConversation(conversationId, { state: 'ready_for_review' }));

      await markMessageProcessed(messageId);

      if (AUTO_PUBLISH) {
        await autoPublishDraft(draft.id, ctx);
      } else if (!wasInReview) {
        const title = mergedData.brand + ' ' + mergedData.model;
        await notifyAdmin(
          [ '🚘 *Draft Ready — KM Car Deals*',
            '',
            `${mergedData.manufacturingYear || ''} ${title} ${mergedData.variant || ''}`.trim(),
            `${mergedData.fuelType || ''} | ${mergedData.transmission || ''} | ${mergedData.bodyType || ''}`,
            `${mergedData.odometerKm ? mergedData.odometerKm.toLocaleString('en-IN') + ' KM' : ''}${mergedData.ownerCount ? ' | ' + mergedData.ownerCount : ''}`,
            mergedData.price ? `💰 ₹${mergedData.price >= 100000 ? (mergedData.price / 100000).toLocaleString('en-IN', { maximumFractionDigits: 2 }) + ' Lakh' : mergedData.price.toLocaleString('en-IN')}` : '',
            `${imagesCount(draft.images)} images attached.`,
            '',
            `Draft: ${draft.id}`,
          ].filter(Boolean).join('\n')
        );
      }
      return;
    }

    // Not ready → send follow-up questions (idempotent transition)
    if (draft.state !== 'INCOMPLETE') {
      assertTransition(draft.state, 'INCOMPLETE', 'system');
      draft = await retry(() => updateVehicleDraft(draft.id, { state: 'INCOMPLETE' }));
    }
    await retry(() => updateConversation(conversationId, { state: 'waiting_answer' }));

    const req = validation.missingFieldRequest;
    if (req) {
      await sendWhatsAppText(ctx.fromPhone, req.message);
    } else {
      await sendWhatsAppText(ctx.fromPhone, 'Please send the remaining vehicle details so I can complete the listing.');
    }
    await markMessageProcessed(messageId);
  } catch (err: any) {
    console.error('[Intake] Failed:', err.message);
    await markProcessingFailure(conversationId, messageId, err, ctx);
  }
}

// Repair stored attachments whose ephemeral Media URL was lost at ingest time (e.g.
// a transient blob-store failure). The mediaId is always kept, so we re-resolve a
// fresh download URL and persist it back onto the message, making the attachment
// usable by the image pipeline on reprocess.
async function ensureMediaUrls(messages: StoredMessage[]): Promise<StoredMessage[]> {
  const repaired: StoredMessage[] = [];
  for (const m of messages) {
    const media = (m.media || []).map(a => ({ ...a }));
    let changed = false;
    for (const a of media) {
      if (a.kind === 'image' && !a.url && a.mediaId) {
        const url = await resolveMediaUrl(a.mediaId);
        if (url) {
          a.url = (await storeRemoteMedia(url, `whatsapp/${m.externalId}`)) || url;
          changed = true;
        }
      }
    }
    if (changed) {
      await supabase.from('whatsapp_messages').update({ media }).eq('id', m.id);
      repaired.push({ ...m, media });
    } else {
      repaired.push(m);
    }
  }
  return repaired;
}

async function processImagesForMessage(
  draftId: string,
  conversationId: string,
  messages: StoredMessage[],
  ctx: IntakeContext
): Promise<void> {
  const draft = await getVehicleDraft(draftId);
  if (!draft) return;

  const imageAttachments = collectImageAttachments(messages);
  if (imageAttachments.length === 0) return;

  const existingIds = new Set((draft.images || []).map((i: any) => i.id));
  const newImages = imageAttachments.filter(img => !existingIds.has(img.id));
  if (newImages.length === 0) return;

  try {
    const result = await classifyAndAnalyze(newImages, {}, conversationId, draftId);
    const combined = [...(draft.images || []), ...result.images];
    await updateVehicleDraft(draftId, { images: combined });
    await appendAudit({
      actor: 'ai-image-agent',
      actorType: 'system',
      action: 'images_analyzed',
      entity: 'vehicle_draft',
      entityId: draftId,
      newValue: { added: newImages.length, total: combined.length, warnings: result.warnings },
      source: 'whatsapp',
      conversationId,
      requestId: ctx.requestId,
    });
  } catch (err: any) {
    await appendAudit({
      actor: 'ai-image-agent',
      actorType: 'system',
      action: 'images_failed',
      entity: 'vehicle_draft',
      entityId: draftId,
      newValue: { error: err.message },
      source: 'whatsapp',
      conversationId,
      requestId: ctx.requestId,
    });
  }
}

function collectImageAttachments(messages: StoredMessage[]): { id: string; url: string; mimeType?: string; size?: number }[] {
  const out: { id: string; url: string; mimeType?: string; size?: number }[] = [];
  for (const m of messages) {
    for (const att of m.media || []) {
      if (att.kind === 'image' && att.url) {
        out.push({ id: att.mediaId || `${m.id}-${out.length}`, url: att.url, mimeType: att.mimeType, size: att.size });
      }
    }
  }
  return out;
}

function imagesCount(images: any[]): number {
  return Array.isArray(images) ? images.length : 0;
}

const PLACEHOLDER_RE = /^(unknown|unk|n\/a|na|none|not given|not stated|-)$/i;

function nonPlaceholder(v: unknown): boolean {
  return typeof v === 'string' && v.trim().length > 0 && !PLACEHOLDER_RE.test(v.trim());
}

// Transient Supabase/gateway failures (observed during the hosted outage) abort an
// otherwise-fine intake run. A tiny bounded retry turns them into a non-event.
async function retry<T>(fn: () => Promise<T>, retries = 2, delayMs = 350): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      const msg = String(err?.message || err || '');
      const transient = /gateway timeout|timeout|too many|530|543|overloaded|pool\\_state|connection/i.test(msg);
      if (attempt >= retries || !transient) throw err;
      await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
    }
  }
}

// One WhatsApp thread == one vehicle. A second, credible incoming identity (different
// model/brand) must never be merged into the first listing. Returns a human reason.
function trustModelName(m: string | undefined): string {
  const n = (m || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  return n.split(/\s+/).filter(Boolean).join(' ');
}
export function detectVehicleConflict(existing: VehicleExtractedData | null, merged: VehicleExtractedData): string | null {
  if (!existing) return null;
  const oldRaw = typeof existing.model === 'string' ? existing.model : '';
  const newRaw = typeof merged.model === 'string' ? merged.model : '';
  if (!nonPlaceholder(oldRaw) || !nonPlaceholder(newRaw)) return null;
  const oldModel = trustModelName(oldRaw);
  const newModel = trustModelName(newRaw);
  if (!oldModel || !newModel) return null;
  const oldKey = oldModel.split(/\s+/)[0];
  const newKey = newModel.split(/\s+/)[0];
  if (oldKey !== newKey) {
    return `this thread already has a listing for "${existing.brand || ''} ${oldRaw}" — "${merged.brand || ''} ${newRaw}" is a different vehicle. Please send the second car's details from a NEW WhatsApp thread.`;
  }
  return null;
}

// AUTO_PUBLISH path: no admin approval step. When intake is complete + credible,
// the listing is published automatically and the seller + admin are notified on WhatsApp.
async function autoPublishDraft(draftId: string, ctx: IntakeContext): Promise<void> {
  try {
    const { draft: pub } = await approveDraft(draftId, {
      requestId: ctx.requestId,
      actor: 'ai-intake-agent',
      actorType: 'system',
    });
    if (pub.state === 'PUBLISHED') {
      const title = pub.content?.websiteTitle || `${pub.data?.brand || ''} ${pub.data?.model || ''}`.trim();
      if (pub.sellerPhone) {
        await sendWhatsAppText(
          pub.sellerPhone,
          [
            '🎉 *Your car is LIVE on kmcardeals.com!*',
            '',
            title,
            'https://kmcardeals.com',
            '',
            'We will call you to complete the paperwork. Thanks for listing with KM Car Deals!',
          ].join('\n')
        );
      }
      await notifyAdmin(
        [
          '🚘 *Auto-Published*',
          '',
          title,
          `Car: ${pub.publishedCarId}`,
          pub.sellerPhone ? `Seller: ${pub.sellerPhone}` : '',
        ].filter(Boolean).join('\n')
      );
    } else {
      await notifyAdmin(`⚠️ Auto-publish did not complete for draft ${draftId} (state ${pub.state}).`);
    }
  } catch (err: any) {
    console.error('[Intake] Auto-publish failed:', err.message);
    await notifyAdmin(`⚠️ Auto-publish failed for draft ${draftId}: ${err.message}`);
  }
}

async function markProcessingFailure(
  conversationId: string,
  messageId: string,
  err: Error,
  ctx: IntakeContext
): Promise<void> {
  try {
    const conversation = await getOrCreateConversation(ctx.fromPhone, 'seller');
    const draft = await getVehicleDraftByConversation(conversationId);
    if (draft && (draft.state === 'PROCESSING' || draft.state === 'RECEIVED' || draft.state === 'INCOMPLETE')) {
      await updateVehicleDraft(draft.id, {
        state: 'PROCESSING_FAILED',
        error: { message: err.message, at: new Date().toISOString() },
      });
    }
    await appendAudit({
      actor: 'ai-intake-agent',
      actorType: 'system',
      action: 'processing_failed',
      entity: 'whatsapp_message',
      entityId: messageId,
      newValue: { error: err.message },
      source: 'whatsapp',
      conversationId,
      requestId: ctx.requestId,
    });
    await bumpProcessingAttempt(messageId, err.message).catch(() => undefined);
  } catch (auditErr) {
    console.error('[Intake] Failure audit failed:', auditErr);
  }
}

// Reprocess a draft: re-run extraction with all messages + regenerate content.
export async function reprocessDraft(draftId: string, ctx: IntakeContext): Promise<void> {
  const draft = await getVehicleDraft(draftId);
  if (!draft || !draft.conversationId) throw new Error('Draft not found or has no conversation');

  const conversation = await getOrCreateConversation(ctx.fromPhone, 'admin');
  if (draft.state === 'PUBLISHED' || draft.state === 'SOLD') {
    throw new Error('Cannot reprocess a published/sold draft');
  }
  await updateVehicleDraft(draftId, { state: 'PROCESSING' });
  try {
    const messages = await listConversationMessages(conversation.id);
    const transcript = buildTranscript(messages);
    const extraction = await extractVehicleFromConversation({
      conversationId: conversation.id,
      transcript,
      existing: draft.data,
      lockedFields: draft.lockedFields,
    });
    const content = await generateVehicleContent(conversation.id, extraction.data, draftId);
    await updateVehicleDraft(draftId, {
      data: extraction.data,
      confidence: extraction.confidence,
      provenance: extraction.provenance,
      content,
      state: 'READY_FOR_REVIEW',
      error: null,
    });
    await appendAudit({
      actor: ctx.participantType === 'admin' ? 'admin' : 'system',
      actorType: ctx.participantType,
      action: 'reprocess',
      entity: 'vehicle_draft',
      entityId: draftId,
      source: ctx.participantType,
      conversationId: conversation.id,
      requestId: ctx.requestId,
    });
  } catch (err: any) {
    await updateVehicleDraft(draftId, { state: 'PROCESSING_FAILED', error: { message: err.message } });
    throw err;
  }
}