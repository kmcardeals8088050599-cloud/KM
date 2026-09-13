// AI System HTTP routes (mounted under /api by server.ts).
// - /api/whatsapp/webhook  (public, verified)
// - /api/ai/*              (admin JWT)

import { Router } from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import { verifyWebhook, processWebhookBody } from './webhook.js';
import {
  getVehicleDraft,
  listVehicleDrafts,
  listPublishEntries,
  listConversationMessages,
  updateVehicleDraft,
} from './db.js';
import { approveDraft, markDraftArchived, markDraftSold, updateDraftPrice } from './publisher.js';
import { reprocessDraft } from './intake.js';
import { listUnprocessedMessages } from './db.js';
import { isAdminSender } from './admin-commands.js';
import { runIntake } from './intake.js';
import { extractVehicleFromConversation } from './extraction.js';
import { generateVehicleContent } from './content.js';
import { validateDraft } from './validation.js';
import { getRedisBackedQueueSummary } from './queue-status.js';
import { providerHealth } from './ai.js';

const ai = Router();

// ---------------------------------------------------------------------------
// WhatsApp webhook ingestion
// ---------------------------------------------------------------------------
ai.get('/whatsapp/webhook', verifyWebhook);

// ---------------------------------------------------------------------------
// Rescue worker: manually drain messages the webhook stored but couldn't process
// in-band (e.g. an invocation that was killed before intake finished). The primary
// mechanism is now waitUntil (webhook keeps the job alive); this endpoint is a
// belt-and-suspenders manual/automated trigger. Guarded by CRON_SECRET or
// WORKQUEUE_SECRET when configured.
// ---------------------------------------------------------------------------
function cronAuthorized(req: import('express').Request): boolean {
  const expected = process.env.CRON_SECRET || process.env.WORKQUEUE_SECRET || '';
  if (!expected) return true; // local dev
  const auth = req.get('authorization') || '';
  return auth === `Bearer ${expected}`;
}

async function drainWorkQueue(limit: number) {
  const pending = await listUnprocessedMessages(limit, 6);
  const results: { messageId: string; conversationId: string; status: string; error?: string }[] = [];
  for (const msg of pending) {
    const requestId = `cron-${Date.now()}-${msg.id}`;
    const ctx = {
      requestId,
      fromPhone: msg.fromPhone,
      participantType: isAdminSender(msg.fromPhone) ? ('admin' as const) : ('seller' as const),
    };
    try {
      await runIntake(msg.conversationId, msg.id, ctx);
      results.push({ messageId: msg.id, conversationId: msg.conversationId, status: 'ok' });
    } catch (err: any) {
      results.push({ messageId: msg.id, conversationId: msg.conversationId, status: 'error', error: err.message });
    }
  }
  return results;
}

ai.get('/ai/workqueue', async (req, res) => {
  if (!cronAuthorized(req)) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  try {
    const limit = Math.max(1, Math.min(Number(req.query.limit) || 10, 20));
    const results = await drainWorkQueue(limit);
    res.json({ processed: results.length, results });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// TEMP diagnostic: exercise Meta media resolve + durable store end-to-end.
ai.get('/ai/blobprobe', async (req, res) => {
  if (!cronAuthorized(req)) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  const mediaId = String(req.query.mediaId || '1981794675868107');
  try {
    const { resolveMediaUrl } = await import('./whatsapp-api.js');
    const cfg = (await import('./whatsapp-api.js')).whatsappConfig();
    const url = await resolveMediaUrl(mediaId);
    let fetchStatus = -1, fetchCt = '', fetchErr = '', putErr = '', putUrl = '';
    if (url) {
      try {
        const headers: Record<string, string> = {};
        if (cfg.token) headers.Authorization = `Bearer ${cfg.token}`;
        const r = await fetch(url, { headers });
        fetchStatus = r.status; fetchCt = r.headers.get('content-type') || '';
        if (r.ok) {
          const b = await r.blob();
          try {
            const { put } = await import('@vercel/blob');
            const stored = await put(`probe/${Date.now()}.jpg`, b, { access: 'public', addRandomSuffix: false });
            putUrl = stored.url.slice(0, 90);
          } catch (e: any) {
            putErr = `status=${e.status} ${e.message}`;
          }
        }
      } catch (e: any) {
        fetchErr = e.message;
      }
    }
    res.json({
      mediaId,
      mediaUrl: url ? url.slice(0, 80) : null,
      fetchWithTokenStatus: fetchStatus,
      fetchErr,
      contentType: fetchCt,
      putErr,
      putUrl,
      blobTokenSet: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      blobStoreId: process.env.BLOB_STORE_ID || '(unset)',
      waTokenSet: Boolean(cfg.token),
      waConfigured: cfg.configured,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message, stack: (err.stack || '').slice(0, 600) });
  }
});

ai.post('/whatsapp/webhook', async (req, res) => {
  try {
    const result = await processWebhookBody(req.body);
    res.status(200).json({ received: true, ...result });
  } catch (err: any) {
    // Meta expects 200 whenever payload is valid; log and ack, never retry-loop the sender.
    console.error('[Webhook] Processing error:', err.message);
    res.status(200).json({ received: true, stored: 0, skipped: 0 });
  }
});

// ---------------------------------------------------------------------------
// AI status + admin views
// ---------------------------------------------------------------------------
ai.get('/ai/status', authenticateAdmin, async (_req, res) => {
  const drafts = await listVehicleDrafts({ state: 'all', limit: 1000 });
  const byState = drafts.reduce<Record<string, number>>((acc, d) => {
    acc[d.state] = (acc[d.state] || 0) + 1;
    return acc;
  }, {});
  const queue = await getRedisBackedQueueSummary().catch(() => null);
  const ai = await Promise.race([
    providerHealth(),
    new Promise<null>(resolve => setTimeout(() => resolve(null), 3500)),
  ]).catch(() => null);
  res.json({
    aiProvider: ai?.provider ?? (process.env.AI_PROVIDER || 'ollama'),
    aiProviderConfigured: ai?.configured ?? false,
    aiProviderAvailable: ai?.available ?? false,
    aiModelAvailable: ai?.modelAvailable ?? false,
    aiVisionModelAvailable: ai?.visionModelAvailable ?? false,
    aiProviderError: ai?.error || (ai ? null : 'AI health check timed out'),
    whatsappConfigured: Boolean(process.env.WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_API_TOKEN),
    instagramConfigured: Boolean(process.env.INSTAGRAM_ACCOUNT_ID && process.env.IG_USER_ACCESS_TOKEN),
    adminPhone: process.env.WHATSAPP_ADMIN_PHONE || null,
    draftsTotal: drafts.length,
    byState,
    queue,
  });
});

ai.get('/ai/drafts', authenticateAdmin, async (req, res) => {
  try {
    const state = (req.query.state as string) || 'all';
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    const drafts = await listVehicleDrafts({ state: state as any, limit });
    res.json(drafts);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to list drafts', details: err.message });
  }
});

ai.get('/ai/drafts/:id', authenticateAdmin, async (req, res) => {
  try {
    const draft = await getVehicleDraft(req.params.id);
    if (!draft) {
      res.status(404).json({ error: 'Draft not found' });
      return;
    }
    const messages = draft.conversationId ? await listConversationMessages(draft.conversationId) : [];
    const publishLog = await listPublishEntries(draft.id);
    res.json({ draft, messages, publishLog });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch draft', details: err.message });
  }
});

ai.get('/ai/drafts/:id/audit', authenticateAdmin, async (req, res) => {
  try {
    const { supabase } = await import('../supabase.js');
    const { data, error } = await supabase
      .from('vehicle_audit_log')
      .select('*')
      .eq('entity_id', req.params.id)
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch audit log', details: err.message });
  }
});

// ---------------------------------------------------------------------------
// AI workflow actions (admin)
// ---------------------------------------------------------------------------

function publishCtx(req: any, requestId: string) {
  return {
    requestId,
    actor: req.user?.username || 'admin',
    actorType: 'admin',
  } as const;
}

ai.post('/ai/drafts/:id/approve', authenticateAdmin, async (req, res) => {
  try {
    const result = await approveDraft(req.params.id, publishCtx(req, `req-${Date.now()}`));
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

ai.post('/ai/drafts/:id/reject', authenticateAdmin, async (req, res) => {
  try {
    await markDraftArchived(req.params.id, publishCtx(req, `req-${Date.now()}`), req.body?.reason || 'Rejected by admin');
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

ai.post('/ai/drafts/:id/sold', authenticateAdmin, async (req, res) => {
  try {
    await markDraftSold(req.params.id, publishCtx(req, `req-${Date.now()}`));
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

ai.post('/ai/drafts/:id/price', authenticateAdmin, async (req, res) => {
  try {
    const price = Number(req.body?.price);
    if (!price || isNaN(price)) {
      res.status(400).json({ error: 'price is required (in rupees)' });
      return;
    }
    const result = await updateDraftPrice(req.params.id, price, publishCtx(req, `req-${Date.now()}`));
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

ai.post('/ai/drafts/:id/regenerate', authenticateAdmin, async (req, res) => {
  try {
    await reprocessDraft(req.params.id, {
      requestId: `req-${Date.now()}`,
      fromPhone: 'admin',
      participantType: 'admin',
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Manual draft creation from admin (no WhatsApp needed for a quick path)
// ---------------------------------------------------------------------------
ai.post('/ai/intake-text', authenticateAdmin, async (req, res) => {
  try {
    const text: string = req.body?.text || '';
    if (!text.trim()) {
      res.status(400).json({ error: 'text is required' });
      return;
    }
    const draft = await createDraftFromText(text, req.user?.username || 'admin');
    res.json({ success: true, draft });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

async function createDraftFromText(text: string, adminUsername: string) {
  const { createVehicleDraft } = await import('./db.js');
  const transcript = `[manual admin submission] ${text}`;
  const draft = await createVehicleDraft({
    state: 'PROCESSING',
    sellerName: adminUsername,
    source: 'admin',
  });
  const extraction = await extractVehicleFromConversation({
    conversationId: draft.id,
    transcript,
  });
  const validation = validateDraft(extraction.data);
  let content;
  try {
    content = await generateVehicleContent(draft.id, extraction.data, draft.id);
  } catch {
    content = undefined;
  }
  const state = validation.readyToReview ? 'READY_FOR_REVIEW' : 'INCOMPLETE';
  return updateVehicleDraft(draft.id, {
    data: extraction.data,
    confidence: extraction.confidence,
    provenance: extraction.provenance,
    content,
    state,
    error: validation.readyToReview ? null : { missing: validation.missingRequired },
  });
}

export default ai;