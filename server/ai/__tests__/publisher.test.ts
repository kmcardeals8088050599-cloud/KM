import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Isolate the publisher from real Supabase / Instagram / WhatsApp side effects.
const h = vi.hoisted(() => {
  const store = new Map<string, any>();
  const cars = new Map<string, any>();
  return {
    store,
    cars,
    getVehicleDraft: vi.fn(async (id: string) => store.get(id) || null),
    updateVehicleDraft: vi.fn(async (id: string, patch: any) => {
      const next = { ...(store.get(id) || {}), ...patch };
      store.set(id, next);
      return next;
    }),
    getCarById: vi.fn(async (id: string) => cars.get(id) || null),
    updateCar: vi.fn(async (id: string, patch: any) => {
      const next = { ...(cars.get(id) || { id }), ...patch };
      cars.set(id, next);
      return next;
    }),
    createCar: vi.fn(async (payload: any, id?: string) => {
      const row = { id: id || 'car-1', ...payload };
      cars.set(row.id, row);
      return row;
    }),
  };
});

vi.mock('../db.js', () => ({
  getVehicleDraft: h.getVehicleDraft,
  updateVehicleDraft: h.updateVehicleDraft,
  storePublishEntry: vi.fn(async () => {}),
}));
vi.mock('../audit.js', () => ({ appendAudit: vi.fn(async () => {}) }));
vi.mock('../../db.js', () => ({
  updateCar: h.updateCar,
  getCarById: h.getCarById,
  createCar: h.createCar,
}));
vi.mock('../instagram.js', () => ({
  publishToInstagram: vi.fn(async () => ({
    channel: 'instagram',
    status: 'skipped',
    retryCount: 0,
    requestId: 'req-x',
    updatedAt: new Date().toISOString(),
  })),
}));
vi.mock('../whatsapp-api.js', () => ({
  sendWhatsAppText: vi.fn(),
  publishCatalogueProduct: vi.fn(),
}));

import { publishChannels, approveDraft } from '../publisher.js';
import { storePublishEntry } from '../db.js';
import { sendWhatsAppText, publishCatalogueProduct } from '../whatsapp-api.js';

const draftStore = h.store;

const baseDraft = {
  id: 'vd-test',
  state: 'APPROVED',
  data: { brand: 'Toyota', model: 'Fortuner', manufacturingYear: 2022, fuelType: 'Diesel', transmission: 'Automatic', bodyType: 'SUV', ownerCount: '1st Owner', odometerKm: 48000, price: 3250000 },
  content: { whatsappSalesMessage: 'Toyota Fortuner 2022 for sale.', websiteTitle: 'Toyota Fortuner 2022' },
  images: ['https://blob.test/cars/1.jpg', 'https://blob.test/cars/2.jpg', 'https://blob.test/cars/3.jpg'],
  sellerPhone: '918123991847',
  conversationId: 'conv-1',
};

beforeEach(() => {
  vi.clearAllMocks();
  draftStore.clear();
  h.cars.clear();
});

describe('publishChannels — whatsapp channel honesty', () => {
  it('never reports success when no outbound message was actually sent (skipped on unconfigured)', async () => {
    draftStore.set(baseDraft.id, { ...baseDraft });
    (sendWhatsAppText as any).mockResolvedValue({ ok: false, error: 'WHATSAPP_API not configured' });

    const result = await publishChannels(baseDraft.id, 'car-1', {
      requestId: 'req-x',
      actor: 'admin',
      actorType: 'admin',
    });

    const wa = result.entries.find(e => e.channel === 'whatsapp');
    expect(wa?.status).not.toBe('success');
    expect(wa?.status).toBe('skipped');
  });

  it('reports success only when the send actually succeeded', async () => {
    draftStore.set(baseDraft.id, { ...baseDraft });
    (sendWhatsAppText as any).mockResolvedValue({ ok: true });

    const result = await publishChannels(baseDraft.id, 'car-1', {
      requestId: 'req-x',
      actor: 'admin',
      actorType: 'admin',
    });

    const wa = result.entries.find(e => e.channel === 'whatsapp');
    expect(wa?.status).toBe('success');
    expect(storePublishEntry).toHaveBeenCalledWith(
      expect.objectContaining({ channel: 'whatsapp', status: 'success' })
    );
  });

  it('skips when there is no whatsapp sales content', async () => {
    draftStore.set(baseDraft.id, { ...baseDraft, content: {} });
    const result = await publishChannels(baseDraft.id, 'car-1', {
      requestId: 'req-x',
      actor: 'admin',
      actorType: 'admin',
    });
    const wa = result.entries.find(e => e.channel === 'whatsapp');
    expect(wa?.status).toBe('skipped');
    expect(sendWhatsAppText).not.toHaveBeenCalled();
  });
});

describe('publishChannels — whatsapp catalogue + status honesty', () => {
  const ORIGINAL_SITE_URL = process.env.PUBLIC_SITE_URL;
  beforeEach(() => {
    process.env.PUBLIC_SITE_URL = 'https://kmcardeals.example';
  });
  afterEach(() => {
    if (ORIGINAL_SITE_URL === undefined) delete process.env.PUBLIC_SITE_URL;
    else process.env.PUBLIC_SITE_URL = ORIGINAL_SITE_URL;
  });

  it('pushes a catalogue product and reports success when the Catalog API accepts it', async () => {
    draftStore.set(baseDraft.id, { ...baseDraft });
    (sendWhatsAppText as any).mockResolvedValue({ ok: true });
    (publishCatalogueProduct as any).mockResolvedValue({ ok: true, externalId: 'prod-123' });

    const result = await publishChannels(baseDraft.id, 'car-1', {
      requestId: 'req-x',
      actor: 'admin',
      actorType: 'admin',
    });

    const cat = result.entries.find(e => e.channel === 'whatsapp_catalogue');
    expect(cat?.status).toBe('success');
    expect(cat?.externalId).toBe('prod-123');
    expect(publishCatalogueProduct).toHaveBeenCalledWith(
      expect.objectContaining({
        retailerId: 'car-1',
        currency: 'INR',
        url: 'https://kmcardeals.example/inventory/car-1',
      })
    );
  });

  it('reports an honest skip when the catalogue is not Commerce-configured', async () => {
    draftStore.set(baseDraft.id, { ...baseDraft });
    (sendWhatsAppText as any).mockResolvedValue({ ok: true });
    (publishCatalogueProduct as any).mockResolvedValue({
      ok: false,
      skipped: true,
      error: 'WhatsApp catalogue not configured (WHATSAPP_CATALOG_ID)',
    });

    const result = await publishChannels(baseDraft.id, 'car-1', {
      requestId: 'req-x',
      actor: 'admin',
      actorType: 'admin',
    });

    const cat = result.entries.find(e => e.channel === 'whatsapp_catalogue');
    expect(cat?.status).toBe('skipped');
    expect(cat?.status).not.toBe('success');
  });

  it('always records whatsapp_status as an honest skip (Cloud API has no Status endpoint)', async () => {
    draftStore.set(baseDraft.id, { ...baseDraft });
    (sendWhatsAppText as any).mockResolvedValue({ ok: true });
    (publishCatalogueProduct as any).mockResolvedValue({ ok: true, externalId: 'prod-123' });

    const result = await publishChannels(baseDraft.id, 'car-1', {
      requestId: 'req-x',
      actor: 'admin',
      actorType: 'admin',
    });

    const status = result.entries.find(e => e.channel === 'whatsapp_status');
    expect(status?.status).toBe('skipped');
    expect(status?.error).toMatch(/not supported by WhatsApp Cloud API/i);
  });
});

describe('approveDraft — publish requirements gate', () => {
  it('blocks publishing when fewer than 3 photos are attached', async () => {
    draftStore.set('vd-no-photos', {
      ...baseDraft,
      id: 'vd-no-photos',
      state: 'READY_FOR_REVIEW',
      images: ['https://blob.test/cars/1.jpg'],
      publishedCarId: undefined,
    });

    await expect(
      approveDraft('vd-no-photos', { requestId: 'req-1', actor: 'admin', actorType: 'admin' })
    ).rejects.toThrow(/photos/);
    expect(h.createCar).not.toHaveBeenCalled();
  });

  it('blocks publishing when the odometer is missing', async () => {
    draftStore.set('vd-no-odometer', {
      ...baseDraft,
      id: 'vd-no-odometer',
      state: 'READY_FOR_REVIEW',
      data: { ...baseDraft.data, odometerKm: undefined },
      publishedCarId: undefined,
    });

    await expect(
      approveDraft('vd-no-odometer', { requestId: 'req-1', actor: 'admin', actorType: 'admin' })
    ).rejects.toThrow(/odometer/);
    expect(h.createCar).not.toHaveBeenCalled();
  });

  it('rejects price-less vehicles (no admin asking price, no upload)', async () => {
    draftStore.set('vd-no-price', {
      ...baseDraft,
      id: 'vd-no-price',
      state: 'READY_FOR_REVIEW',
      data: { ...baseDraft.data, price: undefined },
      publishedCarId: undefined,
    });

    await expect(
      approveDraft('vd-no-price', { requestId: 'req-1', actor: 'admin', actorType: 'admin' })
    ).rejects.toThrow(/price/);
    expect(h.createCar).not.toHaveBeenCalled();
  });
});

describe('approveDraft — idempotent car creation (no orphan duplicates)', () => {
  it('reuses the deterministic car on a partial-publish retry instead of creating a second', async () => {
    // Draft starts in READY_FOR_REVIEW with no published car (first attempt).
    draftStore.set('vd-pub', {
      ...baseDraft,
      id: 'vd-pub',
      state: 'READY_FOR_REVIEW',
      publishedCarId: undefined,
    });

    // First publish attempt: state moves APPROVED and a car is created.
    const first = await approveDraft('vd-pub', { requestId: 'req-1', actor: 'system', actorType: 'system' });
    expect(first.car).toBeTruthy();
    expect(first.car.id).toBe('car-pub'); // deterministic

    // Simulate a gateway timeout: publishedCarId never linked, state stuck APPROVED.
    const d = draftStore.get('vd-pub');
    draftStore.set('vd-pub', { ...d, publishedCarId: undefined, state: 'APPROVED' });

    // Second publish attempt (retry): must NOT create a new car row.
    h.createCar.mockClear();
    const second = await approveDraft('vd-pub', { requestId: 'req-2', actor: 'system', actorType: 'system' });

    expect(h.createCar).not.toHaveBeenCalled();
    expect(second.car.id).toBe('car-pub');
    expect(draftStore.get('vd-pub').publishedCarId).toBe('car-pub');
  });
});