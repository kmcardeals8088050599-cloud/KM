// Publishing Orchestrator.
//
// Deterministic application code is the final authority. AI is never the authority here.
// Reuses existing `cars` create/update logic (server/db.ts) — no bypass of business logic.
// Tracks website / instagram / whatsapp statuses INDEPENDENTLY, idempotently.

import {
  getVehicleDraft,
  updateVehicleDraft,
  storePublishEntry,
} from './db.js';
import { createCar, updateCar, getCarById } from '../db.js';
import { appendAudit } from './audit.js';
import { assertTransition } from './state-machine.js';
import { computeCompletion, detectConflicts } from './validation.js';
import { MIN_PHOTOS_FOR_PUBLISH } from './config.js';

/**
 * Deterministic publish gate: a listing must satisfy EVERY requirement (required
 * data fields + a shown minimum of photos) before it may move to the website.
 * This runs at approve time — never trust stale validation results.
 */
function assertRequirementsMet(draft: any): void {
  const data = draft.data || {};
  const completion = computeCompletion(data);
  const conflicts = detectConflicts(data);
  const imageCount = Array.isArray(draft.images) ? draft.images.length : 0;

  const gaps: string[] = [
    ...completion.missingRequired,
    ...(imageCount < MIN_PHOTOS_FOR_PUBLISH ? [`photos (min ${MIN_PHOTOS_FOR_PUBLISH}, have ${imageCount})`] : []),
  ];

  if (gaps.length === 0 && conflicts.length === 0) return;

  throw new Error(
    'Cannot publish — requirements not met. ' +
      (gaps.length > 0 ? `Missing: ${gaps.join(', ')}. ` : '') +
      (conflicts.length > 0 ? `Conflicts to verify: ${conflicts.join(' ')} ` : '') +
      'Complete every requirement before uploading to the catalogue.'
  );
}

async function retry<T>(fn: () => Promise<T>, retries = 3, delayMs = 350): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      const msg = (err?.message || '').toLowerCase();
      const transient = /gateway timeout|timeout|too many|530|543|overloaded|connection|network/i.test(msg);
      if (attempt >= retries || !transient) throw err;
      await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
    }
  }
}

// One draft == exactly one car, forever. The car id is derived from the draft id so
// a partial publish (createCar succeeded, later steps hit a gateway timeout) can never
// strand an orphan or cause a duplicate: the next attempt reuses the same row.
function deterministicCarId(draftId: string): string {
  return `car-${draftId.replace(/^vd-/, '')}`;
}
import type { PublishResult, PublishEntry, VehicleDraftState } from '../../src/types/ai.js';
import { publishToInstagram } from './instagram.js';
import { sendWhatsAppText, publishCatalogueProduct } from './whatsapp-api.js';

export interface PublishContext {
  requestId: string;
  actor: string;
  actorType: 'admin' | 'system';
}

const FUEL_ALLOWED = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'];
const TRANS_ALLOWED = ['Manual', 'Automatic'];
const BODY_ALLOWED = ['SUV', 'Sedan', 'Hatchback', 'Luxury', 'MUV'];

function draftToCarPayload(draft: any) {
  const data = draft.data || {};
  const fuel = FUEL_ALLOWED.includes(data.fuelType) ? data.fuelType : FUEL_ALLOWED[0];
  const transmission = TRANS_ALLOWED.includes(data.transmission) ? data.transmission : TRANS_ALLOWED[0];
  const body = BODY_ALLOWED.includes(data.bodyType) ? data.bodyType : BODY_ALLOWED[0];
  const title = draft.content?.websiteTitle ||
    `${data.manufacturingYear || ''} ${data.brand || ''} ${data.model || ''} ${data.variant || ''}`.trim();

  const images = (draft.images || []).map((img: any) => img.originalUrl).filter(Boolean);

  return {
    title,
    brand: data.brand || 'Unknown',
    model: data.model || 'Unknown',
    variant: data.variant,
    year: data.manufacturingYear || 2022,
    fuelType: fuel,
    transmission,
    bodyType: body,
    ownerCount: data.ownerCount || '1st Owner',
    status: 'Available' as const,
    color: data.color,
    location: data.location,
    price: typeof data.price === 'number' ? data.price : undefined,
    kilometers: typeof data.odometerKm === 'number' ? data.odometerKm : undefined,
    features: Array.isArray(data.features) ? data.features : [],
    description: draft.content?.websiteDescription || data.description,
    images: images,
    specs: { rto: data.location || 'KA-32 (Kalaburagi)' },
  };
}

export async function approveDraft(draftId: string, ctx: PublishContext): Promise<{ draft: any; car: any; result: PublishResult }> {
  const draft = await getVehicleDraft(draftId);
  if (!draft) throw new Error('Draft not found');

  // Professional gate: nothing is uploaded to the catalogue until every requirement is met.
  assertRequirementsMet(draft);

  // REVIEW → APPROVED (admin or system auto-publish). Idempotent: an already-APPROVED
  // draft is a retry of a partial publish, so it may be approved again.
  const approved = draft.state === 'APPROVED' ? draft : (assertTransition(draft.state as VehicleDraftState, 'APPROVED', ctx.actorType), await retry(() => updateVehicleDraft(draftId, { state: 'APPROVED' })));

  // Idempotent car creation: reuse an existing published car, else the deterministic
  // car id for this draft if a partial publish already created the row, else create.
  const carId = approved.publishedCarId || deterministicCarId(draftId);
  let existing = approved.publishedCarId ? await getCarById(approved.publishedCarId) : null;
  if (!existing) existing = await getCarById(carId);
  let created;
  if (existing) {
    created = await updateCar(existing.id, draftToCarPayload(approved));
  } else {
    created = await createCar(draftToCarPayload(approved), carId);
  }

  await retry(() => updateVehicleDraft(draftId, { publishedCarId: created.id }));

  await appendAudit({
    actor: ctx.actor,
    actorType: ctx.actorType,
    action: 'approve_and_create_car',
    entity: 'vehicle_draft',
    entityId: draftId,
    oldValue: { state: draft.state },
    newValue: { carId: created.id, carTitle: created.title },
    source: ctx.actorType,
    requestId: ctx.requestId,
    conversationId: draft.conversationId,
  });

  const result = await publishChannels(draftId, created.id, ctx);

  // APPROVED → PUBLISHED (system) if the website channel succeeded; otherwise PUBLISH_FAILED.
  const websiteEntry = result.entries.find((e) => e.channel === 'website');
  const finalState: VehicleDraftState = websiteEntry?.status === 'success' ? 'PUBLISHED' : 'PUBLISH_FAILED';
  assertTransition('APPROVED', finalState, 'system');
  await retry(() =>
    updateVehicleDraft(draftId, {
      state: finalState,
      publishedAt: finalState === 'PUBLISHED' ? new Date().toISOString() : undefined,
    })
  );

  return { draft: await retry(() => getVehicleDraft(draftId)), car: created, result };
}

// Publish to website (create/update), instagram, whatsapp-content — independent statuses.
export async function publishChannels(
  draftId: string,
  carId: string,
  ctx: PublishContext
): Promise<PublishResult> {
  const draft = await getVehicleDraft(draftId);
  if (!draft) throw new Error('Draft not found');

  const entries: PublishEntry[] = [];

  // 1. Website — uses existing createCar (already done in approveDraft). For updates, reuse updateCar.
  const websiteStatus = await ensureWebsitePublished(draftId, carId, ctx);
  entries.push(websiteStatus);

  // 2. Instagram — best effort, independent.
  const ig = await publishToInstagram(draft, ctx);
  entries.push(ig);

  // 3. WhatsApp sales-text message — best effort.
  const wa = await publishWhatsAppContent(draft, ctx);
  entries.push(wa);

  // 4. WhatsApp Business Catalogue product — best effort, independent.
  const waCatalogue = await publishWhatsAppCatalogue(draft, carId, ctx);
  entries.push(waCatalogue);

  // 5. WhatsApp Status — not supported by the Cloud API; recorded honestly.
  const waStatus = await recordWhatsAppStatus(draft, ctx);
  entries.push(waStatus);

  await retry(() => updateVehicleDraft(draftId, { publishResult: { entries } }));

  return { entries };
}

async function ensureWebsitePublished(
  draftId: string,
  carId: string,
  ctx: PublishContext
): Promise<PublishEntry> {
  const base: PublishEntry = {
    channel: 'website',
    status: 'pending',
    retryCount: 0,
    requestId: ctx.requestId,
    updatedAt: new Date().toISOString(),
  };
  try {
    const draft = await getVehicleDraft(draftId);
    if (!draft) throw new Error('Draft not found');
    const payload = draftToCarPayload(draft);
    await updateCar(carId, payload); // idempotent upsert of canonical row
    const entry: PublishEntry = {
      ...base,
      status: 'success',
      url: undefined,
      externalId: carId,
    };
    await storePublishEntry({
      vehicleDraftId: draftId,
      carId,
      channel: 'website',
      status: 'success',
      externalId: carId,
      requestId: ctx.requestId,
    });
    return entry;
  } catch (err: any) {
    const entry: PublishEntry = { ...base, status: 'failed', error: err.message };
    await storePublishEntry({
      vehicleDraftId: draftId,
      carId,
      channel: 'website',
      status: 'failed',
      error: err.message,
      requestId: ctx.requestId,
    });
    return entry;
  }
}

async function publishWhatsAppContent(draft: any, ctx: PublishContext): Promise<PublishEntry> {
  const base: PublishEntry = {
    channel: 'whatsapp',
    status: 'pending',
    retryCount: 0,
    requestId: ctx.requestId,
    updatedAt: new Date().toISOString(),
  };
  try {
    const waMsg = draft.content?.whatsappSalesMessage || '';
    const recipient = draft.sellerPhone || process.env.WHATSAPP_ADMIN_PHONE || '';
    // WhatsApp catalogue publish is not implemented. Only report success when a
    // real outbound message was actually transmitted; otherwise skip honestly.
    if (!waMsg) {
      const skip: PublishEntry = { ...base, status: 'skipped', error: 'no whatsapp content' };
      await storePublishEntry({ vehicleDraftId: draft.id, channel: 'whatsapp', status: 'skipped', error: skip.error, requestId: ctx.requestId });
      return skip;
    }
    if (!recipient) {
      const skip: PublishEntry = { ...base, status: 'skipped', error: 'no recipient phone configured' };
      await storePublishEntry({ vehicleDraftId: draft.id, channel: 'whatsapp', status: 'skipped', error: skip.error, requestId: ctx.requestId });
      return skip;
    }
    const { ok, error } = await sendWhatsAppText(recipient, waMsg);
    if (!ok) {
      const entry: PublishEntry = { ...base, status: 'skipped', error: error || 'whatsapp send failed' };
      await storePublishEntry({ vehicleDraftId: draft.id, channel: 'whatsapp', status: 'skipped', error: entry.error, requestId: ctx.requestId });
      return entry;
    }
    const entry: PublishEntry = { ...base, status: 'success' };
    await storePublishEntry({ vehicleDraftId: draft.id, channel: 'whatsapp', status: 'success', requestId: ctx.requestId });
    return entry;
  } catch (err: any) {
    const entry: PublishEntry = { ...base, status: 'failed', error: err.message };
    await storePublishEntry({ vehicleDraftId: draft.id, channel: 'whatsapp', status: 'failed', error: err.message, requestId: ctx.requestId });
    return entry;
  }
}

async function publishWhatsAppCatalogue(draft: any, carId: string, ctx: PublishContext): Promise<PublishEntry> {
  const base: PublishEntry = {
    channel: 'whatsapp_catalogue',
    status: 'pending',
    retryCount: 0,
    requestId: ctx.requestId,
    updatedAt: new Date().toISOString(),
  };
  try {
    const data = draft.data || {};
    const image = (draft.images || [])
      .map((img: any) => (typeof img === 'string' ? img : img?.variants?.whatsapp || img?.originalUrl))
      .filter(Boolean)[0];
    const siteUrl = (process.env.PUBLIC_SITE_URL || '').replace(/\/+$/, '');
    const name =
      draft.content?.websiteTitle ||
      `${data.manufacturingYear || ''} ${data.brand || ''} ${data.model || ''} ${data.variant || ''}`.trim();
    const description =
      draft.content?.whatsappSalesMessage ||
      draft.content?.websiteDescription ||
      data.description ||
      name;

    // The Catalog API needs a public image and a product URL. Skip honestly if absent.
    if (!image) {
      const skip: PublishEntry = { ...base, status: 'skipped', error: 'no public image for catalogue product' };
      await storePublishEntry({ vehicleDraftId: draft.id, carId, channel: 'whatsapp_catalogue', status: 'skipped', error: skip.error, requestId: ctx.requestId });
      return skip;
    }
    if (!siteUrl) {
      const skip: PublishEntry = { ...base, status: 'skipped', error: 'PUBLIC_SITE_URL not configured for catalogue product link' };
      await storePublishEntry({ vehicleDraftId: draft.id, carId, channel: 'whatsapp_catalogue', status: 'skipped', error: skip.error, requestId: ctx.requestId });
      return skip;
    }

    const price = typeof data.price === 'number' ? data.price : 0;
    const { ok, skipped, externalId, error } = await publishCatalogueProduct({
      retailerId: carId, // stable id → re-publish upserts instead of duplicating
      name,
      description,
      price,
      currency: 'INR',
      imageUrl: image,
      url: `${siteUrl}/inventory/${carId}`,
      availability: 'in stock',
      condition: 'used',
      brand: data.brand || undefined,
    });

    if (skipped) {
      const skip: PublishEntry = { ...base, status: 'skipped', error: error || 'catalogue not configured' };
      await storePublishEntry({ vehicleDraftId: draft.id, carId, channel: 'whatsapp_catalogue', status: 'skipped', error: skip.error, requestId: ctx.requestId });
      return skip;
    }
    if (!ok) {
      const fail: PublishEntry = { ...base, status: 'failed', error: error || 'catalogue publish failed' };
      await storePublishEntry({ vehicleDraftId: draft.id, carId, channel: 'whatsapp_catalogue', status: 'failed', error: fail.error, requestId: ctx.requestId });
      return fail;
    }

    const entry: PublishEntry = { ...base, status: 'success', externalId };
    await storePublishEntry({ vehicleDraftId: draft.id, carId, channel: 'whatsapp_catalogue', status: 'success', externalId, requestId: ctx.requestId });
    await appendAudit({
      actor: ctx.actor,
      actorType: ctx.actorType,
      action: 'whatsapp_catalogue_published',
      entity: 'vehicle_draft',
      entityId: draft.id,
      newValue: { carId, productId: externalId },
      source: ctx.actorType,
      requestId: ctx.requestId,
      conversationId: draft.conversationId,
    });
    return entry;
  } catch (err: any) {
    const entry: PublishEntry = { ...base, status: 'failed', error: err.message };
    await storePublishEntry({ vehicleDraftId: draft.id, carId, channel: 'whatsapp_catalogue', status: 'failed', error: err.message, requestId: ctx.requestId });
    return entry;
  }
}

// WhatsApp Status cannot be posted through the official WhatsApp Business Cloud API —
// Meta exposes no Status endpoint, and this system never uses unofficial automation.
// Rather than imply a post happened, we always record an honest, explicit skip.
async function recordWhatsAppStatus(draft: any, ctx: PublishContext): Promise<PublishEntry> {
  const skip: PublishEntry = {
    channel: 'whatsapp_status',
    status: 'skipped',
    retryCount: 0,
    requestId: ctx.requestId,
    updatedAt: new Date().toISOString(),
    error: 'not supported by WhatsApp Cloud API',
  };
  await storePublishEntry({
    vehicleDraftId: draft.id,
    channel: 'whatsapp_status',
    status: 'skipped',
    error: skip.error,
    requestId: ctx.requestId,
  });
  return skip;
}

export async function markDraftArchived(draftId: string, ctx: PublishContext, reason?: string): Promise<void> {
  const draft = await getVehicleDraft(draftId);
  if (!draft) throw new Error('Draft not found');
  assertTransition(draft.state as VehicleDraftState, 'ARCHIVED', 'admin');
  await updateVehicleDraft(draftId, { state: 'ARCHIVED', error: reason ? { reason } : draft.error });
  await appendAudit({
    actor: ctx.actor,
    actorType: ctx.actorType,
    action: 'reject_archive',
    entity: 'vehicle_draft',
    entityId: draftId,
    oldValue: { state: draft.state },
    newValue: { state: 'ARCHIVED', reason },
    source: ctx.actorType,
    requestId: ctx.requestId,
    conversationId: draft.conversationId,
  });
}

export async function markDraftSold(draftId: string, ctx: PublishContext): Promise<void> {
  const draft = await getVehicleDraft(draftId);
  if (!draft) throw new Error('Draft not found');
  assertTransition(draft.state as VehicleDraftState, 'SOLD', 'admin');
  if (draft.publishedCarId) {
    await updateCar(draft.publishedCarId, { status: 'Sold' });
  }
  await updateVehicleDraft(draftId, { state: 'SOLD', soldAt: new Date().toISOString() });
  await appendAudit({
    actor: ctx.actor,
    actorType: ctx.actorType,
    action: 'mark_sold',
    entity: 'vehicle_draft',
    entityId: draftId,
    newValue: { state: 'SOLD', carId: draft.publishedCarId },
    source: ctx.actorType,
    requestId: ctx.requestId,
    conversationId: draft.conversationId,
  });
}

// Price update — deterministic, validated, locked, audited.
export async function updateDraftPrice(
  draftId: string,
  newPrice: number,
  ctx: PublishContext
): Promise<{ draft: any }> {
  const draft = await getVehicleDraft(draftId);
  if (!draft) throw new Error('Draft not found');
  if (!newPrice || newPrice <= 0 || newPrice > 150000000) throw new Error('Invalid price');

  const oldPrice = draft.data.price;
  await updateVehicleDraft(draftId, {
    data: { ...draft.data, price: newPrice },
    lockedFields: Array.from(new Set([...(draft.lockedFields || []), 'price'])),
    provenance: {
      ...(draft.provenance || {}),
      price: { value: newPrice, source: 'admin', confidence: 'high', locked: true },
    },
  });

  await appendAudit({
    actor: ctx.actor,
    actorType: 'admin',
    action: 'change_price',
    entity: 'vehicle_draft',
    entityId: draftId,
    oldValue: { price: oldPrice },
    newValue: { price: newPrice },
    source: 'whatsapp:admin',
    requestId: ctx.requestId,
    conversationId: draft.conversationId,
  });

  return { draft: await getVehicleDraft(draftId) };
}