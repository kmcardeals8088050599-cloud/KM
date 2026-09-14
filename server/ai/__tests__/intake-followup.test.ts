import { describe, it, expect, vi, beforeEach } from 'vitest';

// The follow-up asker touches the conversation store, WhatsApp send, and usage log.
// Mock only those; getActiveModels (provider/config) is pure and left real.
const h = vi.hoisted(() => {
  const state: { metadata: Record<string, any> } = { metadata: {} };
  return {
    state,
    sendWhatsAppText: vi.fn(async (..._args: any[]) => ({ ok: true })),
    getOrCreateConversation: vi.fn(async () => ({ id: 'conv-1', metadata: state.metadata })),
    updateConversation: vi.fn(async (_id: string, patch: any) => {
      if (patch?.metadata !== undefined) state.metadata = patch.metadata;
      return { id: 'conv-1', metadata: state.metadata };
    }),
    logAiUsage: vi.fn(async () => {}),
  };
});

vi.mock('../db.js', () => ({
  getOrCreateConversation: h.getOrCreateConversation,
  updateConversation: h.updateConversation,
}));
vi.mock('../whatsapp-api.js', () => ({ sendWhatsAppText: h.sendWhatsAppText }));
vi.mock('../audit.js', () => ({ logAiUsage: h.logAiUsage, appendAudit: vi.fn(async () => {}) }));

import { sendMissingFieldRequest } from '../intake.js';
import { FOLLOWUP_COOLDOWN_MS, FOLLOWUP_RETRY_LIMIT, MIN_PHOTOS_FOR_PUBLISH } from '../config.js';

const PHONE = '918123991847';
const req = (missing: string[], message = 'need stuff') => ({ missing, message, questions: [], severity: 'low' as const });
const lastMessage = () => h.sendWhatsAppText.mock.calls.at(-1)?.[1] as string | undefined;

beforeEach(() => {
  vi.clearAllMocks();
  h.state.metadata = {};
});

describe('sendMissingFieldRequest — professional, non-repeating follow-ups', () => {
  it('asks ONE consolidated question listing every missing field', async () => {
    await sendMissingFieldRequest('conv-1', PHONE, 'admin', req(['price', 'photos']), 1, Date.now());
    expect(h.sendWhatsAppText).toHaveBeenCalledTimes(1);
    const msg = lastMessage()!;
    expect(msg).toContain('Asking price');
    expect(msg).toContain(`at least ${MIN_PHOTOS_FOR_PUBLISH}`);
    expect(msg).toContain('I have 1 so far');
    // Ledger advanced for exactly the fields asked.
    expect(h.state.metadata.missingAsks.price.count).toBe(1);
    expect(h.state.metadata.missingAsks.photos.count).toBe(1);
  });

  it('does NOT repeat the same fields within the cooldown window', async () => {
    await sendMissingFieldRequest('conv-1', PHONE, 'admin', req(['price']), 3, Date.now());
    await sendMissingFieldRequest('conv-1', PHONE, 'admin', req(['price']), 3, Date.now());
    await sendMissingFieldRequest('conv-1', PHONE, 'admin', req(['price']), 3, Date.now());
    expect(h.sendWhatsAppText).toHaveBeenCalledTimes(1); // only the first ask went out
  });

  it('asks only the DELTA — a newly-missing field, never re-listing one already asked', async () => {
    // price was asked moments ago; odometer is new.
    h.state.metadata.missingAsks = { price: { at: Date.now(), count: 1 } };
    await sendMissingFieldRequest('conv-1', PHONE, 'admin', req(['price', 'odometerKm']), 3, Date.now());
    const msg = lastMessage()!;
    expect(msg).toContain('Kilometres driven');
    expect(msg).not.toContain('Asking price');
  });

  it('re-asks a field only after the cooldown has elapsed', async () => {
    h.state.metadata.missingAsks = { price: { at: Date.now() - FOLLOWUP_COOLDOWN_MS - 1000, count: 1 } };
    await sendMissingFieldRequest('conv-1', PHONE, 'admin', req(['price']), 3, Date.now());
    expect(h.sendWhatsAppText).toHaveBeenCalledTimes(1);
    expect(h.state.metadata.missingAsks.price.count).toBe(2);
  });

  it('stops nagging a field once it hits the retry cap', async () => {
    h.state.metadata.missingAsks = { price: { at: Date.now() - FOLLOWUP_COOLDOWN_MS - 1000, count: FOLLOWUP_RETRY_LIMIT } };
    await sendMissingFieldRequest('conv-1', PHONE, 'admin', req(['price']), 3, Date.now());
    expect(h.sendWhatsAppText).not.toHaveBeenCalled();
  });

  it('sends a conflict/verification notice once and tracks it separately', async () => {
    const conflict = { missing: [], message: '⚠️ Verification required: price looks unrealistic.', questions: [], severity: 'low' as const };
    await sendMissingFieldRequest('conv-1', PHONE, 'admin', conflict, 3, Date.now());
    await sendMissingFieldRequest('conv-1', PHONE, 'admin', conflict, 3, Date.now());
    expect(h.sendWhatsAppText).toHaveBeenCalledTimes(1);
    expect(lastMessage()).toContain('Verification required');
    expect(h.state.metadata.missingAsks.__conflict__.count).toBe(1);
  });

  it('stays silent when there is nothing specific to ask', async () => {
    const emptyReq = { missing: [], message: '', questions: [], severity: 'low' as const };
    await sendMissingFieldRequest('conv-1', PHONE, 'admin', null, 3, Date.now());
    await sendMissingFieldRequest('conv-1', PHONE, 'admin', emptyReq, 3, Date.now());
    expect(h.sendWhatsAppText).not.toHaveBeenCalled();
  });
});
