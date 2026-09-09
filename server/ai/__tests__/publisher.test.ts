import { describe, it, expect, vi, beforeEach } from 'vitest';

// Isolate the publisher from real Supabase / Instagram / WhatsApp side effects.
const h = vi.hoisted(() => {
  const store = new Map<string, any>();
  return {
    store,
    getVehicleDraft: vi.fn(async (id: string) => store.get(id) || null),
    updateVehicleDraft: vi.fn(async (id: string, patch: any) => {
      const next = { ...(store.get(id) || {}), ...patch };
      store.set(id, next);
      return next;
    }),
  };
});

vi.mock('../db.js', () => ({
  getVehicleDraft: h.getVehicleDraft,
  updateVehicleDraft: h.updateVehicleDraft,
  storePublishEntry: vi.fn(async () => {}),
}));
vi.mock('../audit.js', () => ({ appendAudit: vi.fn(async () => {}) }));
vi.mock('../../db.js', async () => {
  return {
    updateCar: vi.fn(async () => ({ id: 'car-1', title: 'car' })),
    getCarById: vi.fn(async () => null),
    createCar: vi.fn(async () => ({ id: 'car-1' })),
  };
});
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
}));

import { publishChannels } from '../publisher.js';
import { storePublishEntry } from '../db.js';
import { sendWhatsAppText } from '../whatsapp-api.js';

const draftStore = h.store;

const baseDraft = {
  id: 'vd-test',
  state: 'APPROVED',
  data: { brand: 'Toyota', model: 'Fortuner', manufacturingYear: 2022, fuelType: 'Diesel', transmission: 'Automatic', bodyType: 'SUV', ownerCount: '1st Owner', odometerKm: 48000, price: 3250000 },
  content: { whatsappSalesMessage: 'Toyota Fortuner 2022 for sale.' },
  images: [],
  sellerPhone: '918123991847',
  conversationId: 'conv-1',
};

beforeEach(() => {
  vi.clearAllMocks();
  draftStore.clear();
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
