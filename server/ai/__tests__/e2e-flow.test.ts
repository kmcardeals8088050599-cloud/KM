// END-TO-END INTEGRATION TEST — the real Express app over HTTP.
//
// This drives the complete production flow with ONLY the impossible-external services
// faked at the module boundary (Supabase is an in-memory PostgREST-compatible fake,
// the Ollama AI provider returns deterministic JSON). Everything else — routes,
// middleware, JWT auth, state machine, publisher, audit, publish_log — is the real
// wired application.
//
// Flow exercised:
//   health → webhook verify + ingest (+ idempotency) → login → intake-text
//   → draft READY_FOR_REVIEW → drafts list → approve → PUBLISHED + publish_log
//   → public cars list → price change (regression guard) → mark sold → auth negatives.

import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import type { Server } from 'http';

// ---------------------------------------------------------------------------
// AI provider mock — deterministic structured JSON per agent prompt.
// Sits at the same module boundary as the real app (server/ai/provider/ollama),
// so the full pipeline (facade → extraction/content agents → zod gates) is real.
// ---------------------------------------------------------------------------
vi.mock('../provider/ollama.js', () => {
  function respond(combined: string): string {
    if (combined.includes('You are the vehicle intake agent')) {
      return JSON.stringify({
        brand: 'Toyota',
        model: 'Fortuner',
        variant: '2.8 4x2',
        manufacturing_year: 2022,
        fuel_type: 'Diesel',
        transmission: 'Automatic',
        body_type: 'SUV',
        odometer_km: 48000,
        owner_count: '1st Owner',
        price: 3250000,
        location: 'Kalaburagi',
        confidence: {
          brand: 0.98, model: 0.98, manufacturing_year: 0.99, fuel_type: 0.97,
          transmission: 0.97, body_type: 0.9, odometer_km: 0.99,
          owner_count: 0.95, price: 0.99,
        },
        provenance: {
          brand: { source: 'whatsapp_text', confidence: 'high' },
          model: { source: 'whatsapp_text', confidence: 'high' },
          manufacturing_year: { source: 'whatsapp_text', confidence: 'high' },
          fuel_type: { source: 'ai_inference', confidence: 'high' },
          transmission: { source: 'ai_inference', confidence: 'high' },
          body_type: { source: 'ai_inference', confidence: 'medium' },
          odometer_km: { source: 'whatsapp_text', confidence: 'high' },
          owner_count: { source: 'whatsapp_text', confidence: 'high' },
          price: { source: 'whatsapp_text', confidence: 'high' },
        },
        unknown: [],
        notes: 'Extracted from E2E sample.',
      });
    }
    if (combined.includes('You are the content agent')) {
      return JSON.stringify({
        website_title: '2022 Toyota Fortuner 2.8 4x2 Automatic',
        website_description:
          '2022 Toyota Fortuner 2.8 4x2 Automatic, first owner, 48,000 km, diesel. 150-point inspected and ready for immediate delivery at KM Car Deals, Kalaburagi.',
        instagram_caption:
          '🚗 2022 Toyota Fortuner 2.8 4x2 Automatic\n⛽ Diesel | ⚙️ Automatic | 48,000 km | 1st Owner\n📍 Kalaburagi\n\nReach out for the price — call/WhatsApp KM Car Deals and book a test drive!',
        whatsapp_sales_message:
          '*2022 Toyota Fortuner 2.8 4x2 Automatic*\n• Fuel: Diesel\n• Transmission: Automatic\n• Driven: 48,000 km\n• Owner: 1st Owner\n\nInterested? Visit KM Car Deals, Kalaburagi — reach out for the price.',
        seo: {
          title: '2022 Toyota Fortuner 2.8 4x2 Automatic in Kalaburagi',
          meta_description: 'Buy a 2022 Toyota Fortuner 2.8 4x2 Automatic in Kalaburagi. First owner, 48,000 km. 150-point inspected.',
          keywords: ['toyota', 'fortuner', 'suv', 'pre-owned', 'kalaburagi'],
          slug: '2022-toyota-fortuner-28-4x2-automatic',
        },
      });
    }
    return JSON.stringify({});
  }

  class OllamaProvider {
    readonly id = 'ollama';
    generateStructured = vi.fn(async (opts: any) =>
      JSON.parse(respond(`${opts.system || ''}\n${opts.prompt || ''}`))
    );
    generateText = vi.fn(async () => 'Mock AI description for KM Car Deals.');
    analyzeImage = vi.fn(async () => ({ images: [] }));
    transcribeAudio = vi.fn(async () => null);
    healthCheck = vi.fn(async () => ({
      provider: 'ollama',
      configured: true,
      available: true,
      modelAvailable: true,
      visionModelAvailable: false,
      baseUrl: 'http://localhost:11434',
      model: 'qwen2.5:7b',
    }));
  }
  return { OllamaProvider };
});

// ---------------------------------------------------------------------------
// Supabase mock — in-memory PostgREST-compatible fake covering the query surface
// used by server/db.ts + server/ai/*.
// ---------------------------------------------------------------------------
type Row = Record<string, any>;
interface Filter { op: 'eq' | 'is' | 'not' | 'gte' | 'lte' | 'lt' | 'gt'; col: string; val: any }

vi.mock('../../supabase.js', () => {
  class QueryBuilder {
    private filters: Filter[] = [];
    private orderBy: { col: string; asc: boolean }[] = [];
    private limitN: number | null = null;
    private rangeN: [number, number] | null = null;
    private countRequested = false;
    private head = false;
    private mode: 'select' | 'insert' | 'update' | 'delete' = 'select';
    private payload: any = null;
    private returning = false;
    private singleMode = false;

    constructor(private table: Row[]) {}

    select(_cols?: any, opts?: any) {
      if (opts?.count) this.countRequested = true;
      if (opts?.head) this.head = true;
      return this;
    }
    eq(col: string, val: any): this { this.filters.push({ op: 'eq', col, val }); return this; }
    is(col: string, val: any): this { this.filters.push({ op: 'is', col, val }); return this; }
    not(col: string, val: any): this { this.filters.push({ op: 'not', col, val }); return this; }
    gte(col: string, val: any): this { this.filters.push({ op: 'gte', col, val }); return this; }
    lte(col: string, val: any): this { this.filters.push({ op: 'lte', col, val }); return this; }
    lt(col: string, val: any): this { this.filters.push({ op: 'lt', col, val }); return this; }
    gt(col: string, val: any): this { this.filters.push({ op: 'gt', col, val }); return this; }
    order(col: string, opts?: { ascending?: boolean }): this { this.orderBy.push({ col, asc: opts?.ascending !== false }); return this; }
    limit(n: number): this { this.limitN = n; return this; }
    range(a: number, b: number): this { this.rangeN = [a, b]; return this; }
    single(): this { this.singleMode = true; return this; }
    insert(payload: any): this { this.mode = 'insert'; this.payload = payload; return this; }
    update(payload: any): this { this.mode = 'update'; this.payload = payload; return this; }
    delete(): this { this.mode = 'delete'; return this; }

    private matches(row: Row): boolean {
      for (const f of this.filters) {
        if (f.op === 'eq' && row[f.col] !== f.val) return false;
        if (f.op === 'is' && (f.val === null ? row[f.col] !== null : row[f.col] !== f.val)) return false;
        if (f.op === 'not' && row[f.col] === f.val) return false;
        if (f.op === 'gte' && !(row[f.col] >= f.val)) return false;
        if (f.op === 'lte' && !(row[f.col] <= f.val)) return false;
        if (f.op === 'lt' && !(row[f.col] < f.val)) return false;
        if (f.op === 'gt' && !(row[f.col] > f.val)) return false;
      }
      return true;
    }

    private run(): { data: Row[] | Row | null; count?: number; error: { message: string } | null } {
      if (this.mode === 'insert') {
        const row: Row = { ...this.payload };
        this.table.push(row);
        return { data: row, error: null };
      }
      if (this.mode === 'update') {
        const matched = this.table.filter(r => this.matches(r));
        for (const r of matched) Object.assign(r, this.payload);
        return this.pack(matched, undefined);
      }
      if (this.mode === 'delete') {
        const before = this.table.length;
        const kept = this.table.filter(r => !this.matches(r));
        this.table.length = 0;
        this.table.push(...kept);
        const deletedCount = before - kept.length;
        return { data: null, count: deletedCount, error: null };
      }
      // select
      let rows = this.table.filter(r => this.matches(r));
      for (const o of this.orderBy) {
        rows = [...rows].sort((a, b) => {
          const av = a[o.col];
          const bv = b[o.col];
          if (av === bv) return 0;
          const cmp = av > bv ? 1 : -1;
          return o.asc ? cmp : -cmp;
        });
      }
      const count = rows.length;
      if (this.countRequested) {
        return { data: this.head ? [] : rows, count, error: null };
      }
      if (this.rangeN) {
        rows = rows.slice(this.rangeN[0], this.rangeN[1] + 1);
      } else if (this.limitN !== null) {
        rows = rows.slice(0, this.limitN);
      }
      return this.pack(rows, count);
    }

    private pack(rows: Row[], count?: number): { data: Row[] | Row | null; count?: number; error: { message: string } | null } {
      if (this.singleMode) {
        if (rows.length === 1) return { data: rows[0], error: null };
        return { data: null, error: { message: 'The result contains 0 rows' } };
      }
      if (!this.returning && (this.mode === 'insert' || this.mode === 'update')) {
        return { data: null, error: null };
      }
      return { data: rows, count, error: null };
    }

    then<T = any>(resolve: (v: any) => T, reject: (e: any) => never): Promise<T> {
      return Promise.resolve(this.run()).then(resolve, reject) as Promise<T>;
    }
  }

  const tables: Record<string, Row[]> = {
    cars: [],
    users: [],
    leads: [],
    exchange_requests: [],
    vehicle_drafts: [],
    whatsapp_conversations: [],
    whatsapp_messages: [],
    vehicle_audit_log: [],
    ai_usage_log: [],
    publish_log: [],
  };

  return {
    supabase: {
      from(name: string) {
        tables[name] = tables[name] || [];
        return new QueryBuilder(tables[name]);
      },
    },
    __tables: tables,
  };
});

// ---------------------------------------------------------------------------
// Real app + HTTP server
// ---------------------------------------------------------------------------
import http from 'http';

async function startApp(): Promise<{ baseUrl: string; close: () => Promise<void> }> {
  const { createApp } = await import('../../../server.js');
  const app = await createApp();
  const server: Server = await new Promise(resolve => {
    const s = http.createServer(app);
    s.listen(0, '127.0.0.1', () => resolve(s));
  });
  const addr = server.address();
  const port = typeof addr === 'object' && addr ? addr.port : 3000;
  return {
    baseUrl: `http://127.0.0.1:${port}`,
    close: () => new Promise<void>(r => server.close(() => r())),
  };
}

describe('END-TO-END: KM Car Deals AI — production flow over real HTTP', () => {
  let baseUrl = '';
  let close = async () => {};

  beforeAll(async () => {
    process.env.VERCEL = '1'; // server.ts skips startServer() when VERCEL is set
    process.env.AI_PROVIDER = 'ollama';
    process.env.WHATSAPP_VERIFY_TOKEN = 'verify-token';
    const s = await startApp();
    baseUrl = s.baseUrl;
    close = s.close;
  }, 20000);

  afterAll(async () => {
    await close();
  });

  async function api(path: string, init?: RequestInit): Promise<{ status: number; body: any }> {
    const res = await fetch(`${baseUrl}${path}`, init);
    const text = await res.text();
    let body: any = null;
    try { body = text ? JSON.parse(text) : null; } catch { body = text; }
    return { status: res.status, body };
  }

  const json = (body: unknown): RequestInit => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

  it('stage 0: health endpoint reports database connected', async () => {
    const { status, body } = await api('/api/health');
    expect(status).toBe(200);
    expect(body).toMatchObject({ status: 'ok', database: 'connected' });
  });

  it('stage 1: webhook verification handshake (Meta GET)', async () => {
    const ok = await api('/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=verify-token&hub.challenge=CHALLENGE_123');
    expect(ok.status).toBe(200);
    expect(ok.body).toBe('CHALLENGE_123');

    const bad = await api('/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=CHALLENGE_123');
    expect(bad.status).toBe(403);
  });

  it('stage 2: webhook ingest stores a message exactly once (idempotency over HTTP)', async () => {
    const payload = {
      object: 'whatsapp_business_account',
      entry: [{
        changes: [{
          value: {
            messaging_product: 'whatsapp',
            messages: [{
              from: '918123991847',
              id: 'wamid-e2e-1',
              timestamp: '1720000000',
              type: 'text',
              text: { body: 'Toyota Fortuner 2022' },
            }],
          },
          field: 'messages',
        }],
      }],
    };
    const first = await api('/api/whatsapp/webhook', json(payload));
    expect(first.status).toBe(200);
    expect(first.body).toMatchObject({ received: true, stored: 1 });

    const second = await api('/api/whatsapp/webhook', json(payload));
    expect(second.status).toBe(200);
    expect(second.body).toMatchObject({ stored: 0, skipped: 1 });
  });

  it('stage 3: admin can authenticate', async () => {
    const { status, body } = await api('/api/auth/login', json({ username: 'admin', password: 'kmadmin2026' }));
    expect(status).toBe(200);
    expect(body.token).toBeTruthy();
    expect(body.user.role).toBe('admin');
  });

  let token = '';
  let draftId = '';
  let carId = '';

  it('stage 4: admin auth required on AI routes', async () => {
    const anon = await api('/api/ai/drafts');
    expect(anon.status).toBe(401);
  });

  it('stage 5: manual intake creates a READY_FOR_REVIEW draft (extraction → validation → content)', async () => {
    token = (await api('/api/auth/login', json({ username: 'admin', password: 'kmadmin2026' }))).body.token;
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

    const { status, body } = await api('/api/ai/intake-text', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        text: 'Toyota Fortuner 2022, 2.8 diesel automatic, 48000 km, first owner, ₹32.5 lakh',
      }),
    });

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.draft.state).toBe('READY_FOR_REVIEW');
    expect(body.draft.data).toMatchObject({
      brand: 'Toyota',
      model: 'Fortuner',
      manufacturingYear: 2022,
      fuelType: 'Diesel',
      transmission: 'Automatic',
      bodyType: 'SUV',
      odometerKm: 48000,
      ownerCount: '1st Owner',
      price: 3250000,
    });
    expect(body.draft.content?.websiteTitle).toContain('Fortuner');
    expect(body.draft.content?.seo?.slug).toBeTruthy();
    // Public copy must never quote the asking price — buyers are invited to reach out.
    const publicCopy = [
      body.draft.content?.websiteTitle || '',
      body.draft.content?.websiteDescription || '',
      body.draft.content?.instagramCaption || '',
      body.draft.content?.whatsappSalesMessage || '',
      body.draft.content?.seo?.metaDescription || '',
    ].join('\n');
    expect(publicCopy).not.toMatch(/₹| lakh|lakh\b/i);
    // The public copy must explicitly invite buyers to reach out.
    expect(publicCopy).toMatch(/reach out/i);
    // ...but the price is still captured privately for the admin workflow.
    expect(body.draft.data.price).toBe(3250000);
    draftId = body.draft.id;
  });

  it('stage 6: draft is listed in AI ops and admin /api/ai/status reflects it', async () => {
    const headers = { Authorization: `Bearer ${token}` };
    const list = await api('/api/ai/drafts', { headers });
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body)).toBe(true);
    expect(list.body.some((d: any) => d.id === draftId && d.state === 'READY_FOR_REVIEW')).toBe(true);

    const status = await api('/api/ai/status', { headers });
    expect(status.status).toBe(200);
    expect(status.body.aiProvider).toBe('ollama');
    expect(status.body.aiProviderConfigured).toBe(true);
    expect(status.body.aiModelAvailable).toBe(true);
    expect(status.body.draftsTotal).toBeGreaterThanOrEqual(1);
  });

  it('stage 7: approval publishes to the website via the REAL publisher + state machine', async () => {
    // Publish gate: a draft becomes publishable only with >= 3 gallery photos.
    // The intake sample has text only, so attach gallery photos before approving.
    const { updateVehicleDraft } = await import('../db.js');
    await updateVehicleDraft(draftId, {
      images: ['https://blob.e2e/cars/1.jpg', 'https://blob.e2e/cars/2.jpg', 'https://blob.e2e/cars/3.jpg'],
    });

    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    const { status, body } = await api(`/api/ai/drafts/${draftId}/approve`, { method: 'POST', headers });
    expect(status).toBe(200);
    expect(body.car).toBeTruthy();
    carId = body.car.id;

    // Draft is now PUBLISHED with per-channel entries in publish_log.
    const detail = await api(`/api/ai/drafts/${draftId}`, { headers: { Authorization: `Bearer ${token}` } });
    expect(detail.status).toBe(200);
    expect(detail.body.draft.state).toBe('PUBLISHED');
    expect(detail.body.draft.publishedCarId).toBe(carId);
    const entries = detail.body.publishLog as { channel: string; status: string }[];
    const byChannel = Object.fromEntries(entries.map(e => [e.channel, e.status]));
    expect(byChannel['website']).toBe('success');
    expect(byChannel['instagram']).toBe('skipped'); // unconfigured → clean skip, no rollback
    expect(byChannel['whatsapp']).toBe('skipped');  // no recipient phone configured → honest skip
  });

  it('stage 8: the published car is the real /api/cars inventory (no parallel system)', async () => {
    const { status, body } = await api('/api/cars');
    expect(status).toBe(200);
    const car = (body as any[]).find((c: any) => c.id === carId);
    expect(car).toBeTruthy();
    expect(car.title).toBe('2022 Toyota Fortuner 2.8 4x2 Automatic');
    expect(car.brand).toBe('Toyota');
    expect(car.status).toBe('Available');
  });

  it('stage 9: price change succeeds and is persisted + locked (regression: empty updateCar bug)', async () => {
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    const { status, body } = await api(`/api/ai/drafts/${draftId}/price`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ price: 3150000 }),
    });
    expect(status).toBe(200);
    expect(body.success).toBe(true);

    const detail = await api(`/api/ai/drafts/${draftId}`, { headers: { Authorization: `Bearer ${token}` } });
    expect(detail.body.draft.data.price).toBe(3150000);
    expect(detail.body.draft.lockedFields).toContain('price');
  });

  it('stage 10: mark sold flips the canonical car to Sold', async () => {
    const headers = { Authorization: `Bearer ${token}` };
    const { status } = await api(`/api/ai/drafts/${draftId}/sold`, { method: 'POST', headers });
    expect(status).toBe(200);

    const cars = await api('/api/cars');
    const car = (cars.body as any[]).find((c: any) => c.id === carId);
    expect(car.status).toBe('Sold');

    const detail = await api(`/api/ai/drafts/${draftId}`, { headers });
    expect(detail.body.draft.state).toBe('SOLD');
  });

  it('stage 11: invalid price is rejected (validation boundary)', async () => {
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    const bad = await api(`/api/ai/drafts/${draftId}/price`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ price: -5 }),
    });
    expect(bad.status).toBe(400);
  });

  it('stage 12: bad token on publish actions is rejected (401)', async () => {
    const bad = await api(`/api/ai/drafts/${draftId}/approve`, {
      method: 'POST',
      headers: { Authorization: 'Bearer not-a-real-token' },
    });
    expect(bad.status).toBe(401);
  });
});