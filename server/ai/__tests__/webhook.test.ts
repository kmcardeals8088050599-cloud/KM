import { describe, it, expect, vi, beforeEach } from 'vitest';

// Isolate the webhook from real Supabase/Gemini/WhatsApp side effects.
vi.mock('../db.js', async () => {
  const store = new Map<string, any>();
  return {
    getMessageByExternalId: vi.fn(async (externalId: string) => store.get(externalId) || null),
    persistInboundMessage: vi.fn(async (input: any) => {
      const msg = { id: 'msg-1', ...input, processed: false };
      store.set(input.externalId, msg);
      return msg;
    }),
    getOrCreateConversation: vi.fn(async (phone: string) => ({
      id: 'conv-1',
      externalPhone: phone,
      participantType: 'seller',
      state: 'idle',
      metadata: {},
      lastActivity: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })),
    listUnprocessedMessages: vi.fn(async () => []),
    detectAdminCommand: vi.fn(() => null),
    updateConversation: vi.fn(async () => ({})),
  };
});
vi.mock('../intake.js', () => ({ runIntake: vi.fn(async () => {}) }));
vi.mock('../admin-commands.js', () => ({
  handleAdminMessage: vi.fn(async () => {}),
  isAdminSender: vi.fn(() => false),
}));
vi.mock('../whatsapp-api.js', () => ({
  resolveMediaUrl: vi.fn(async () => null),
  storeRemoteMedia: vi.fn(async () => null),
  sendWhatsAppText: vi.fn(async () => ({ ok: true })),
  notifyAdmin: vi.fn(async () => ({ ok: true })),
  isAdminSender: vi.fn(() => false),
}));
vi.mock('../audio.js', () => ({ transcribeAudioUrl: vi.fn(async () => null) }));

import { processWebhookBody } from '../webhook.js';
import { getMessageByExternalId, persistInboundMessage, detectAdminCommand, getOrCreateConversation, updateConversation, listUnprocessedMessages } from '../db.js';
import { runIntake } from '../intake.js';
import { handleAdminMessage } from '../admin-commands.js';
import { isAdminSender } from '../whatsapp-api.js';

const samplePayload = (wamid: string) => ({
  object: 'whatsapp_business_account',
  entry: [
    {
      id: '{}',
      changes: [
        {
          value: {
            messaging_product: 'whatsapp',
            messages: [
              {
                from: '918123991847',
                id: wamid,
                timestamp: '1720000000',
                type: 'text',
                text: { body: 'Toyota Fortuner 2022' },
              },
            ],
          },
          field: 'messages',
        },
      ],
    },
  ],
});

describe('processWebhookBody', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('stores a text message and triggers intake once', async () => {
    const result = await processWebhookBody(samplePayload('wamid-1'));
    expect(result.stored).toBe(1);
    expect(persistInboundMessage).toHaveBeenCalledTimes(1);
    expect(runIntake).toHaveBeenCalledTimes(1);
  });

  it('never processes the same message twice (idempotency)', async () => {
    await processWebhookBody(samplePayload('wamid-dup'));
    const second = await processWebhookBody(samplePayload('wamid-dup'));
    expect(second.stored).toBe(0);
    expect(second.skipped).toBe(1);
    expect(persistInboundMessage).toHaveBeenCalledTimes(1);
    expect(runIntake).toHaveBeenCalledTimes(1);
  });

  it('ignores non-message changes', async () => {
    const result = await processWebhookBody({ entry: [{ changes: [{ value: { statuses: [{}] } }] }] });
    expect(result.stored).toBe(0);
    expect(getMessageByExternalId).not.toHaveBeenCalled();
  });
});

describe('processWebhookBody — dealer-operator smart routing', () => {
  const payload = (wamid: string, body: string, from = '910000000000') => ({
    object: 'whatsapp_business_account',
    entry: [{
      changes: [{
        value: {
          messaging_product: 'whatsapp',
          messages: [{ from, id: wamid, timestamp: '1720000000', type: 'text', text: { body } }],
        },
        field: 'messages',
      }],
    }],
  });
  const conv = (metadata: Record<string, any> = {}) => ({
    id: 'conv-1',
    externalPhone: '910000000000',
    participantType: 'admin',
    state: 'idle',
    metadata,
    lastActivity: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  beforeEach(() => {
    (isAdminSender as any).mockReset();
    (detectAdminCommand as any).mockReset();
    (getOrCreateConversation as any).mockReset();
    (updateConversation as any).mockReset();
    (updateConversation as any).mockResolvedValue({});
    (listUnprocessedMessages as any).mockReset();
    (listUnprocessedMessages as any).mockResolvedValue([]);
    (runIntake as any).mockReset();
    (handleAdminMessage as any).mockReset();
    (runIntake as any).mockResolvedValue(undefined);
    (handleAdminMessage as any).mockResolvedValue(undefined);
  });

  it('routes an admin car submission (no command match) to intake, not the command agent', async () => {
    (isAdminSender as any).mockReturnValue(true);
    (detectAdminCommand as any).mockReturnValue(null);
    (getOrCreateConversation as any).mockResolvedValue(conv());

    await processWebhookBody(payload('wamid-admin-car', 'Toyota Fortuner 2022 diesel 48k'));

    expect(runIntake).toHaveBeenCalledTimes(1);
    expect(handleAdminMessage).not.toHaveBeenCalled();
    // The submission carries admin trust into intake.
    expect((runIntake as any).mock.calls[0][2]).toMatchObject({ participantType: 'admin' });
  });

  it('routes a recognized admin command to the command agent, not intake', async () => {
    (isAdminSender as any).mockReturnValue(true);
    (detectAdminCommand as any).mockReturnValue({ command: 'show_pending' });
    (getOrCreateConversation as any).mockResolvedValue(conv());

    await processWebhookBody(payload('wamid-admin-cmd', 'show pending'));

    expect(handleAdminMessage).toHaveBeenCalledTimes(1);
    expect(runIntake).not.toHaveBeenCalled();
  });

  it('routes a confirmation reply ("yes") to the command agent when an action is pending', async () => {
    (isAdminSender as any).mockReturnValue(true);
    (detectAdminCommand as any).mockReturnValue(null); // bare "yes" is not a command
    (getOrCreateConversation as any).mockResolvedValue(conv({ pendingAction: { action: 'approve', draftId: 'vd-1' } }));

    await processWebhookBody(payload('wamid-admin-yes', 'yes'));

    expect(handleAdminMessage).toHaveBeenCalledTimes(1);
    expect(runIntake).not.toHaveBeenCalled();
  });

  it('treats a car description sent while a confirmation is pending as a submission — clears the stale pending action, runs intake', async () => {
    (isAdminSender as any).mockReturnValue(true);
    (detectAdminCommand as any).mockReturnValue(null);
    (getOrCreateConversation as any).mockResolvedValue(conv({ pendingAction: { action: 'approve', draftId: 'vd-1' } }));

    // Long, car-like text that starts with "yes" must NOT be read as a confirmation.
    await processWebhookBody(payload('wamid-admin-car-midconfirm', 'yes but first — Mahindra Thar 2023, 20000 km, ₹18 lakh'));

    expect(handleAdminMessage).not.toHaveBeenCalled();
    expect(runIntake).toHaveBeenCalledTimes(1);
    // The stale pending action is dropped so a later stray "yes" can't fire it.
    expect((updateConversation as any).mock.calls.some((c: any[]) => c[1]?.metadata?.pendingAction === null)).toBe(true);
  });

  it('always routes a non-admin sender to intake', async () => {
    (isAdminSender as any).mockReturnValue(false);
    (detectAdminCommand as any).mockReturnValue(null);
    (getOrCreateConversation as any).mockResolvedValue(conv({ participantType: 'seller' } as any));

    await processWebhookBody(payload('wamid-seller', 'Mahindra Thar 2023'));

    expect(runIntake).toHaveBeenCalledTimes(1);
    expect(handleAdminMessage).not.toHaveBeenCalled();
  });

  it('routes a BACKLOG admin command through the command agent, not intake', async () => {
    (isAdminSender as any).mockReturnValue(true);
    // Live message is a car (intake); the queued backlog message is a command.
    (detectAdminCommand as any).mockImplementation((t: string) =>
      /^show pending/i.test(t.trim()) ? { command: 'show_pending' } : null
    );
    (getOrCreateConversation as any).mockResolvedValue(conv());
    (listUnprocessedMessages as any).mockResolvedValue([
      { id: 'lm-1', externalId: 'lm-1', conversationId: 'conv-1', fromPhone: '910000000000', role: 'from', text: 'show pending', processed: false },
    ]);

    await processWebhookBody(payload('wamid-main-car', 'Toyota Fortuner 2022 diesel 48k'));

    // Live car message → intake.
    expect(runIntake).toHaveBeenCalledTimes(1);
    // Backlog command → command agent (previously it was wrongly run through intake).
    expect(handleAdminMessage).toHaveBeenCalledTimes(1);
    expect((handleAdminMessage as any).mock.calls[0][2]).toBe('show pending');
  });
});