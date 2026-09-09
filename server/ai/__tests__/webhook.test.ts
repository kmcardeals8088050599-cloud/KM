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
}));
vi.mock('../audio.js', () => ({ transcribeAudioUrl: vi.fn(async () => null) }));

import { processWebhookBody } from '../webhook.js';
import { getMessageByExternalId, persistInboundMessage } from '../db.js';
import { runIntake } from '../intake.js';

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