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
import { createCar, updateCar } from '../db.js';
import { appendAudit } from './audit.js';
import { assertTransition } from './state-machine.js';
import type { PublishResult, PublishEntry, VehicleDraftState } from '../../src/types/ai.js';
import { publishToInstagram } from './instagram.js';
import { sendWhatsAppText } from './whatsapp-api.js';

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
    year: data.manufacturingYear || 2022,
    fuelType: fuel,
    transmission,
    bodyType: body,
    ownerCount: data.ownerCount || '1st Owner',
    status: 'Available' as const,
    images: images.slice(0, 15),
    specs: { rto: data.location || 'KA-32 (Kalaburagi)' },
  };
}

export async function approveDraft(draftId: string, ctx: PublishContext): Promise<{ draft: any; car: any; result: PublishResult }> {
  const draft = await getVehicleDraft(draftId);
  if (!draft) throw new Error('Draft not found');

  // REVIEW → APPROVED (admin)
  assertTransition(draft.state as VehicleDraftState, 'APPROVED', 'admin');
  const approved = await updateVehicleDraft(draftId, { state: 'APPROVED' });

  const car = draftToCarPayload(approved);
  const created = await createCar(car);

  await updateVehicleDraft(draftId, { publishedCarId: created.id });

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
  const websiteEntry = result.entries.find(e => e.channel === 'website');
  const finalState: VehicleDraftState = websiteEntry?.status === 'success' ? 'PUBLISHED' : 'PUBLISH_FAILED';
  assertTransition('APPROVED', finalState, 'system');
  await updateVehicleDraft(draftId, {
    state: finalState,
    publishedAt: finalState === 'PUBLISHED' ? new Date().toISOString() : undefined,
  });

  return { draft: await getVehicleDraft(draftId), car: created, result };
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

  // 3. WhatsApp catalogue content — best effort.
  const wa = await publishWhatsAppContent(draft, ctx);
  entries.push(wa);

  await updateVehicleDraft(draftId, { publishResult: { entries } });

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