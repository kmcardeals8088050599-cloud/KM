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
  startNextDraftForConversation,
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
import { sendWhatsAppText, notifyAdmin, resolveMediaUrl, storeRemoteMedia, isAdminSender } from './whatsapp-api.js';
import { markMessageProcessed, bumpProcessingAttempt } from './db.js';
import { assertTransition } from './state-machine.js';
import { getActiveModels, analyzeImages } from './ai.js';
import { approveDraft } from './publisher.js';
import { AI_CONFIG, AUTO_PUBLISH, MIN_PHOTOS_FOR_PUBLISH, FIELD_LABELS, FOLLOWUP_COOLDOWN_MS, FOLLOWUP_RETRY_LIMIT } from './config.js';
import { rcCardExtractionSchema } from './schemas.js';
import { supabase } from '../supabase.js';
import { VehicleExtractedData, MissingFieldRequest } from '../../src/types/ai.js';

export interface IntakeContext {
  requestId: string;
  fromPhone: string;
  participantType: 'seller' | 'dealer' | 'admin' | 'buyer';
}

// A finished draft: the car is live or gone, so the next credible vehicle on this
// thread starts a NEW draft instead of being dropped.
const TERMINAL_DRAFT_STATES = ['APPROVED', 'PUBLISHED', 'UPDATED', 'SOLD', 'ARCHIVED'];

export async function runIntake(conversationId: string, messageId: string, ctx: IntakeContext): Promise<void> {
  const startedAt = Date.now();
  try {
    const conversation = await getOrCreateConversation(ctx.fromPhone, ctx.participantType);

    const newDraftInput = {
      state: 'RECEIVED' as const,
      sellerPhone: ctx.fromPhone,
      sellerName: ctx.participantType === 'admin' ? 'Admin' : undefined,
      source: 'whatsapp',
    };

    const storedMessages = await listConversationMessages(conversationId);
    let draft = await getVehicleDraftByConversation(conversationId);
    let messages: StoredMessage[];
    let extraction: Awaited<ReturnType<typeof extractVehicleFromConversation>> | null = null;

    if (draft && TERMINAL_DRAFT_STATES.includes(draft.state)) {
      // Dealer-operator model: this ONE thread carries many cars over time. When the
      // current draft is finished, the next message is potentially a NEW car — so scope
      // the transcript to messages that arrived AFTER it finished and only open a fresh
      // draft when they describe a credible vehicle. Stray chatter ("thanks", "ok") is
      // ignored silently: no phantom draft, no follow-up nag.
      const boundary = Date.parse(draft.updatedAt || draft.createdAt || '') || 0;
      messages = await ensureMediaUrls(
        storedMessages.filter((m) => (Date.parse(m.createdAt || '') || 0) > boundary)
      );
      extraction = await extractVehicleFromConversation({
        conversationId,
        transcript: buildTranscript(messages),
        existing: null,
        lockedFields: [],
      });
      if (!(nonPlaceholder(extraction.data.brand) && nonPlaceholder(extraction.data.model))) {
        await markMessageProcessed(messageId);
        return;
      }
      draft = await startNextDraftForConversation(conversationId, newDraftInput);
    } else {
      // Deterministic find-or-create: concurrent webhook invocations for the same
      // conversation converge on the SAME draft row, never duplicates.
      draft = draft || (await getOrCreateDraftForConversation(conversationId, newDraftInput));
      messages = await ensureMediaUrls(storedMessages);
    }

    await retry(() => updateConversation(conversationId, { vehicleDraftId: draft.id, state: 'collecting' }));

    // RECEIVED → PROCESSING (system). Failed drafts are retried on new messages.
    if (draft.state === 'RECEIVED' || draft.state === 'INCOMPLETE' || draft.state === 'PROCESSING_FAILED' || draft.state === 'IMAGE_PROCESSING_FAILED' || draft.state === 'PUBLISH_FAILED') {
      assertTransition(draft.state, 'PROCESSING', 'system');
      draft = await retry(() => updateVehicleDraft(draft.id, { state: 'PROCESSING' }));
    }

    const transcript = buildTranscript(messages);

    // 1. AI structured extraction (merge with existing data, respect locked fields).
    //    The rotation path already extracted against a blank slate; reuse that result.
    if (!extraction) {
      extraction = await extractVehicleFromConversation({
        conversationId,
        transcript,
        existing: draft.data,
        lockedFields: draft.lockedFields,
      });
    }

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

    // 3. Validation — a professional listing needs the required data fields AND
    //    a believable set of photos before it can ever be considered ready.
    const validation = validateDraft(mergedData);
    const imageCount = Array.isArray(draft.images) ? draft.images.length : 0;
    const needsPhotos = imageCount < MIN_PHOTOS_FOR_PUBLISH;
    const readyToReview = validation.readyToReview && !needsPhotos;

    let missingFieldRequest: MissingFieldRequest | null = validation.missingFieldRequest || null;
    if (needsPhotos) {
      const photoLine = `Please send at least ${MIN_PHOTOS_FOR_PUBLISH} clear photos of the car — I have ${imageCount} so far.`;
      missingFieldRequest = missingFieldRequest
        ? {
            ...missingFieldRequest,
            missing: [...new Set([...missingFieldRequest.missing, 'photos'])],
            message: [missingFieldRequest.message, photoLine].join('\n'),
            questions: [...missingFieldRequest.questions, 'Photos of the car?'],
            severity: 'high',
          }
        : { missing: ['photos'], message: photoLine, questions: ['Photos of the car?'], severity: 'low' };
    }

    const targetState = readyToReview ? 'READY_FOR_REVIEW' : 'INCOMPLETE';

    // Move READY_FOR_REVIEW → PROCESSING first when new info makes it incomplete again.
    if (draft.state === 'READY_FOR_REVIEW' && targetState !== 'READY_FOR_REVIEW') {
      assertTransition(draft.state, 'PROCESSING', 'system');
      draft = await retry(() => updateVehicleDraft(draft.id, { state: 'PROCESSING' }));
    }

    // The dealer/admin is a trusted operator: their own submissions publish automatically
    // once complete. AUTO_PUBLISH extends the same behavior to every sender when enabled.
    const shouldAutoPublish = AUTO_PUBLISH || ctx.participantType === 'admin';

    // Auto-publish only accepts a credible vehicle identity; placeholder brand/model
    // ("unknown") means we still need the sender to provide the real details on WhatsApp.
    const credibleIdentity = nonPlaceholder(mergedData.brand) && nonPlaceholder(mergedData.model);

    if (readyToReview && (!shouldAutoPublish || credibleIdentity)) {
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

      if (shouldAutoPublish) {
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

    await sendMissingFieldRequest(
      conversationId,
      ctx.fromPhone,
      ctx.participantType,
      missingFieldRequest,
      imageCount,
      startedAt
    );
    await markMessageProcessed(messageId);
  } catch (err: any) {
    console.error('[Intake] Failed:', err.message);
    await markProcessingFailure(conversationId, messageId, err, ctx);
  }
}

// Ledger key under which the verification/conflict prompt is tracked (it has no field name).
const CONFLICT_ASK_KEY = '__conflict__';

// Ask for missing details like a professional: ONE consolidated question listing only
// the fields we have NOT already asked about recently. A per-field ledger on the
// conversation metadata (`missingAsks`) records when each field was last asked and how
// many times, so a burst of photos/messages never triggers a repeat prompt, a field
// asked within the cooldown is never re-listed, and nothing is nagged more than
// FOLLOWUP_RETRY_LIMIT times. The ledger is re-read fresh right before sending to keep
// concurrent webhook invocations from double-asking.
export async function sendMissingFieldRequest(
  conversationId: string,
  fromPhone: string,
  participantType: IntakeContext['participantType'],
  req: MissingFieldRequest | null,
  imageCount: number,
  startedAt: number
): Promise<void> {
  const missing = (req?.missing || []).map(k => k.trim()).filter(Boolean);
  const conflictNotice = missing.length === 0 ? (req?.message || '').trim() : '';
  if (missing.length === 0 && !conflictNotice) return; // nothing specific to ask — never nag

  // Fresh read narrows the race window between parallel webhook invocations.
  const conversation = await getOrCreateConversation(fromPhone, participantType);
  const metadata = conversation.metadata || {};
  const asks: Record<string, { at: number; count: number }> = metadata.missingAsks || {};
  const now = Date.now();

  const askable = (key: string): boolean => {
    const prev = asks[key];
    if (!prev) return true;
    if (prev.count >= FOLLOWUP_RETRY_LIMIT) return false; // asked enough — leave it on the dashboard
    return now - prev.at >= FOLLOWUP_COOLDOWN_MS;
  };

  let freshKeys: string[];
  let message: string;

  if (conflictNotice) {
    // Verification/conflict prompt: tracked under its own key so it is sent once per
    // cooldown and capped, exactly like a field ask.
    if (!askable(CONFLICT_ASK_KEY)) return;
    freshKeys = [CONFLICT_ASK_KEY];
    message = conflictNotice;
  } else {
    freshKeys = missing.filter(askable);
    if (freshKeys.length === 0) return; // everything outstanding was already asked recently
    const lines = freshKeys.slice(0, AI_CONFIG.followUpMaxQuestions).map((field, i) => {
      if (field === 'photos') {
        return `${i + 1}. Clear photos of the car (at least ${MIN_PHOTOS_FOR_PUBLISH} — I have ${imageCount} so far)`;
      }
      return `${i + 1}. ${FIELD_LABELS[field] || field}`;
    });
    message = ['I can create the listing, but I still need:', ...lines].join('\n');
  }

  await sendWhatsAppText(fromPhone, message);

  // Advance the ledger only for the keys actually asked.
  const nextAsks = { ...asks };
  for (const key of freshKeys) {
    const prev = nextAsks[key] || { at: 0, count: 0 };
    nextAsks[key] = { at: now, count: prev.count + 1 };
  }
  await retry(() =>
    updateConversation(conversationId, { metadata: { ...metadata, missingAsks: nextAsks } })
  );
  await logAiUsage({
    entity: 'whatsapp_message',
    entityId: conversationId,
    agent: 'intake',
    model: getActiveModels().text,
    event: 'ask_missing_fields',
    status: 'ok',
    durationMs: Date.now() - startedAt,
    conversationId,
  });
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
    // Load up to a bounded batch of thumbnails as base64 so vision classification can
    // actually run (documents → RC-card extraction needs it too). Never blocks the
    // pipeline: any download failure just means heuristic fallback.
    const dataURLs: Record<string, string> = {};
    for (const img of newImages.slice(0, 6)) {
      try {
        const b64 = await toBase64Image(img.url);
        if (b64) dataURLs[img.id] = b64;
      } catch {
        /* vision unavailable for this image — heuristic category */
      }
    }

    const result = await classifyAndAnalyze(newImages, dataURLs, conversationId, draftId);
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

    // RC card present? Mine it for verified owner/registration details.
    const rcImages = result.images.filter(
      i => i.category === 'documents' && !i.quality.nonVehicle && dataURLs[i.id]
    );
    if (rcImages.length > 0 && draftId) {
      await extractRcDetailsFromImages(draftId, conversationId, ctx, rcImages.slice(0, 2), dataURLs);
    }
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

// Fetch a stored image into a base64 data URL for vision analysis. Returns null for
// oversized / non-image payloads so a single hostile attachment can never blow the budget.
async function toBase64Image(url: string, maxBytes = 6 * 1024 * 1024): Promise<string | null> {
  const res = await fetch(url);
  if (!res.ok) return null;
  const type = res.headers.get('content-type') || 'image/jpeg';
  if (!type.startsWith('image/')) return null;
  const buf = new Uint8Array(await res.arrayBuffer());
  if (buf.byteLength === 0 || buf.byteLength > maxBytes) return null;
  let bin = '';
  const chunk = 0x8000;
  for (let i = 0; i < buf.length; i += chunk) {
    bin += String.fromCharCode.apply(null, Array.from(buf.subarray(i, i + chunk)));
  }
  return `data:${type};base64,${btoa(bin)}`;
}

// When a Registration Certificate photo arrives, read the visible fields and merge
// them into the draft as HIGH-confidence, source='rc_card' data. Locked fields are
// never overwritten; the owner name populates sellerName when still unknown.
async function extractRcDetailsFromImages(
  draftId: string,
  conversationId: string,
  ctx: IntakeContext,
  rcImages: { id: string; originalUrl: string }[],
  dataURLs: Record<string, string>
): Promise<void> {
  const draft = await getVehicleDraft(draftId);
  if (!draft) return;

  const locked = new Set(draft.lockedFields || []);
  const patches: Record<string, unknown> = {};
  let provenance = { ...(draft.provenance || {}) };
  let ownerName: string | null = null;

  for (const img of rcImages) {
    const dataUrl = dataURLs[img.id];
    if (!dataUrl) continue;
    try {
      const rc = await analyzeImages<Record<string, unknown>>({
        prompt: [
          'Read the Indian Registration Certificate (RC) in this image. Extract ONLY fields that are clearly legible.',
          'Respond JSON: {"registrationNumber":"KA32 MP1234","ownerName":"First Last","model":"","fuelType":"Diesel","registrationYear":2021,"insuranceValidUntil":"2025-12-31","rcStatus":"Valid","notes":"..."}',
          'A registration number looks like "KA 32 MP 1234". Never guess an unreadable value — leave it empty.',
        ].join('\n'),
        system:
          'You are an automotive document reader. The RC is a legal document; extract text faithfully and return JSON only. ' +
          'Missing/inaccurate OCR must never fabricate data for a vehicle listing. Uppercase-normalise the registration number.',
        images: [{ id: img.id, dataUrl }],
        schemaDescription: 'RC-card extraction JSON',
        agent: 'rc-card',
        event: 'extract_rc',
        conversationId,
        entity: 'vehicle_draft',
        entityId: draftId,
        maxRetries: 1,
        validate: value => rcCardExtractionSchema.parse(value),
      });

      const regNumber = normalizeRegistration(String(rc.registrationNumber || ''));
      const fuel = typeof rc.fuelType === 'string' ? rc.fuelType : undefined;
      const model = typeof rc.model === 'string' ? rc.model : undefined;
      const regYear = typeof rc.registrationYear === 'number' ? rc.registrationYear : undefined;
      const insurance = typeof rc.insuranceValidUntil === 'string' ? rc.insuranceValidUntil : undefined;
      const rcStatus = typeof rc.rcStatus === 'string' ? rc.rcStatus : 'RC verified from card photo';
      ownerName = typeof rc.ownerName === 'string' && rc.ownerName.trim() ? rc.ownerName.trim() : ownerName;

      const merge = (key: keyof VehicleExtractedData, value: unknown) => {
        if (value === undefined || value === null || value === '' || locked.has(key)) return;
        patches[key as string] = value;
        provenance[key as string] = { source: 'rc_card', confidence: 'high', verifiedBy: 'document:rc' };
      };

      merge('registrationNumber', regNumber);
      merge('actualRegistration', regNumber);
      merge('fuelType', fuel);
      merge('model', model);
      merge('registrationYear', regYear);
      merge('insuranceValidUntil', insurance);
      if (!locked.has('rcStatus')) {
        patches['rcStatus'] = rcStatus;
        provenance['rcStatus'] = { source: 'rc_card', confidence: 'high', verifiedBy: 'document:rc' };
      }

      if (Object.keys(patches).length > 0) break; // one good RC read is enough
    } catch (err: any) {
      console.warn('[Intake] RC extraction failed:', err.message);
    }
  }

  if (Object.keys(patches).length === 0) return;

  const patch: Record<string, any> = {
    data: { ...(draft.data || {}), ...patches },
    provenance,
  };
  if (ownerName && !draft.sellerName) patch.sellerName = ownerName;

  await retry(() => updateVehicleDraft(draftId, patch));
  await appendAudit({
    actor: 'ai-rc-agent',
    actorType: 'system',
    action: 'rc_extract',
    entity: 'vehicle_draft',
    entityId: draftId,
    newValue: { fields: Object.keys(patches), ownerName },
    source: 'whatsapp',
    conversationId,
    requestId: ctx.requestId,
  });
  await notifyAdmin(
    ownerName
      ? `📄 RC card read for ${draftId}: added ${Object.keys(patches).join(', ')} (owner ${ownerName}).`
      : `📄 RC card read for ${draftId}: added ${Object.keys(patches).join(', ')}.`
  );
}

function normalizeRegistration(raw: string): string | null {
  const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleaned) return null;
  const m = cleaned.match(/^([A-Z]{2}\s?\d{1,2}\s?[A-Z]{1,2}\s?\d{1,4})$/);
  if (m && (cleaned.includes(' ') || cleaned.length >= 8)) return m[1].replace(/\s+/g, ' ').trim();
  return null;
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
      // Skip the seller-facing "LIVE" blast when the seller IS the admin — they already
      // receive the Auto-Published notify below, so a second message is pure noise.
      if (pub.sellerPhone && !isAdminSender(pub.sellerPhone)) {
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
      await notifyAdmin([
        '🚘 *Auto-Published*',
        '',
        title,
        `Car: ${pub.publishedCarId}`,
        pub.sellerPhone ? `Seller: ${pub.sellerPhone}` : '',
      ].filter(Boolean).join('\n'));
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
    const conversation = await getOrCreateConversation(ctx.fromPhone, ctx.participantType);
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