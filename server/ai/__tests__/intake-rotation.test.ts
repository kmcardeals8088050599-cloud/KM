import { describe, it, expect, vi, beforeEach } from 'vitest';

// runIntake pulls in most of the pipeline. Mock every side-effecting module and drive
// the draft-rotation branch directly: a finished draft on the dealer's single thread
// must start a NEW car when a credible vehicle arrives, and stay silent on chatter.
const h = vi.hoisted(() => ({
  extraction: { data: { brand: 'Mahindra', model: 'Thar' }, confidence: {}, provenance: {} } as any,
  latestDraft: null as any,
  freshDraft: {
    id: 'vd-conv-1-1',
    conversationId: 'conv-1',
    state: 'RECEIVED',
    data: {},
    confidence: {},
    provenance: {},
    lockedFields: [],
    images: [],
    createdAt: '2026-01-02T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  } as any,
  messages: [] as any[],
  extractCalls: [] as any[],
  startNextCalls: [] as any[],
}));

vi.mock('../db.js', () => ({
  getOrCreateConversation: vi.fn(async () => ({ id: 'conv-1', metadata: {} })),
  updateConversation: vi.fn(async () => ({})),
  getVehicleDraftByConversation: vi.fn(async () => h.latestDraft),
  getOrCreateDraftForConversation: vi.fn(async () => h.latestDraft),
  startNextDraftForConversation: vi.fn(async (_c: string, input: any) => {
    h.startNextCalls.push(input);
    return h.freshDraft;
  }),
  updateVehicleDraft: vi.fn(async (_id: string, patch: any) => ({ ...(h.latestDraft || h.freshDraft), ...patch })),
  getVehicleDraft: vi.fn(async () => h.freshDraft),
  listConversationMessages: vi.fn(async () => h.messages),
  markMessageProcessed: vi.fn(async () => {}),
  bumpProcessingAttempt: vi.fn(async () => {}),
}));
vi.mock('../extraction.js', () => ({
  extractVehicleFromConversation: vi.fn(async (arg: any) => {
    h.extractCalls.push(arg);
    return h.extraction;
  }),
}));
vi.mock('../validation.js', () => ({
  validateDraft: vi.fn(() => ({
    readyToReview: false,
    conflicts: [],
    missingFieldRequest: { missing: ['price'], message: 'need price', questions: [], severity: 'low' as const },
  })),
}));
vi.mock('../content.js', () => ({ generateVehicleContent: vi.fn(async () => null) }));
vi.mock('../images.js', () => ({ classifyAndAnalyze: vi.fn(async () => ({ images: [], warnings: [] })) }));
vi.mock('../audit.js', () => ({ appendAudit: vi.fn(async () => {}), logAiUsage: vi.fn(async () => {}) }));
vi.mock('../state-machine.js', () => ({ assertTransition: vi.fn() }));
vi.mock('../ai.js', () => ({ getActiveModels: vi.fn(() => ({ text: 'test', vision: 'test' })), analyzeImages: vi.fn(async () => ({})) }));
vi.mock('../publisher.js', () => ({ approveDraft: vi.fn(async () => ({ draft: { state: 'PUBLISHED' } })) }));
vi.mock('../whatsapp-api.js', () => ({
  sendWhatsAppText: vi.fn(async () => ({ ok: true })),
  notifyAdmin: vi.fn(async () => ({ ok: true })),
  resolveMediaUrl: vi.fn(async () => null),
  storeRemoteMedia: vi.fn(async () => null),
  isAdminSender: vi.fn(() => true),
}));
vi.mock('../../supabase.js', () => ({ supabase: { from: () => ({ update: () => ({ eq: () => ({}) }) }) } }));

import { runIntake } from '../intake.js';
import { startNextDraftForConversation, markMessageProcessed } from '../db.js';
import { sendWhatsAppText } from '../whatsapp-api.js';

const CTX = { requestId: 'req-1', fromPhone: '918123991847', participantType: 'admin' as const };
const msg = (id: string, text: string, createdAt: string) => ({
  id, externalId: id, conversationId: 'conv-1', role: 'from', text, media: [], createdAt,
});
const publishedDraft = {
  id: 'vd-conv-1', conversationId: 'conv-1', state: 'PUBLISHED',
  data: { brand: 'Toyota', model: 'Fortuner' }, confidence: {}, provenance: {},
  lockedFields: [], images: [],
  createdAt: '2025-12-31T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
  h.extractCalls = [];
  h.startNextCalls = [];
  h.extraction = { data: { brand: 'Mahindra', model: 'Thar' }, confidence: {}, provenance: {} };
  h.latestDraft = null;
  h.messages = [];
});

describe('runIntake — draft rotation on a finished car (dealer-only, one thread, many cars)', () => {
  it('starts a NEW draft and scopes extraction to post-finish messages', async () => {
    h.latestDraft = publishedDraft;
    h.messages = [
      msg('m-old', 'Toyota Fortuner 2022 details', '2025-12-31T12:00:00.000Z'), // before finish
      msg('m-new', 'Mahindra Thar 2023, 20000 km', '2026-01-02T12:00:00.000Z'),  // after finish
    ];

    await runIntake('conv-1', 'm-new', CTX);

    expect(startNextDraftForConversation).toHaveBeenCalledTimes(1);
    // Extraction saw ONLY the new car's message — never the previous, already-published one.
    const transcript = h.extractCalls[0].transcript as string;
    expect(transcript).toContain('Thar');
    expect(transcript).not.toContain('Fortuner');
    expect(h.extractCalls[0].existing).toBeNull(); // blank slate for the new car
  });

  it('ignores stray chatter after a finished car — no new draft, no nag', async () => {
    h.latestDraft = publishedDraft;
    h.extraction = { data: { brand: 'unknown', model: 'unknown' }, confidence: {}, provenance: {} };
    h.messages = [msg('m-new', 'thanks bye', '2026-01-02T12:00:00.000Z')];

    await runIntake('conv-1', 'm-new', CTX);

    expect(startNextDraftForConversation).not.toHaveBeenCalled();
    expect(markMessageProcessed).toHaveBeenCalledTimes(1);
    expect(sendWhatsAppText).not.toHaveBeenCalled();
  });

  it('does NOT rotate while the current draft is still in progress', async () => {
    h.latestDraft = { ...publishedDraft, state: 'INCOMPLETE' };
    h.messages = [msg('m-1', 'Toyota Fortuner 2022, 48000 km', '2026-01-02T12:00:00.000Z')];

    await runIntake('conv-1', 'm-1', CTX);

    expect(startNextDraftForConversation).not.toHaveBeenCalled();
    // Merges into the existing draft rather than a blank slate.
    expect(h.extractCalls[0].existing).toEqual({ brand: 'Toyota', model: 'Fortuner' });
  });
});
