# KM Car Deals — AI Vehicle System Architecture

Status: Architecture Audit (Phase 0) + Implementation blueprint
Owner: KM Car Deals Engineering
Stack Target: Extends the existing React + Vite + Express + Supabase + Vercel Blob + Gemini application.

> **Note (2026-09-09):** the AI provider integration described below as "Google Gemini /
> `@google/genai`" has been replaced by a provider-agnostic facade defaulting to **local
> Ollama** (`server/ai/provider/`, `server/ai/ai.ts`). Gemini references below reflect the
> pre-migration blueprint. See `docs/LOCAL_AI_MIGRATION.md` and `docs/LOCAL_AI_SETUP.md`
> for the current design.

This document is produced **before** any implementation code. It documents the existing
application, the proposed AI architecture, integration points, schema changes, environment
variables, risks, and the migration / testing strategy. All implementation respects the
non-negotiable rules at the end and the phased plan.

---

## 1. Existing Architecture

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React 19, TypeScript, Vite 6 | SPA, `react-router-dom` v7, Tailwind CSS v4, `motion` (framer-motion), `lucide-react` |
| Backend | Express 4 (`server.ts`) | Single app factory `createApp()`, JWT auth, server-side rendered SPA fallback in dev |
| API surface | `/api/*` | Express routes: cars CRUD, leads, exchanges, auth, upload tokens, admin AI desc, daily report |
| Database | Supabase (PostgreSQL) | Tables: `cars`, `leads`, `exchange_requests`, `users`. Service-role client in `server/supabase.ts` |
| Object storage | Vercel Blob | Direct-browser upload with server-issued upload tokens (`@vercel/blob/client`) |
| AI | Google Gemini (`@google/genai` v2) | Currently only used for `/api/admin/generate-description` |
| WhatsApp | `server/whatsapp.ts` | **Outbound only** alert helper. Uses Meta Business Cloud API if configured, otherwise logs a `wa.me` fallback |
| Auth | JWT (`jsonwebtoken`) + bcrypt | `users` table; `authenticateAdmin` middleware enforces `role === 'admin'` |
| Validation | `zod` v4 | Per-resource schemas in `server/validations.ts` |
| Deployment | Vercel | `api/index.ts` imports `createApp()`; `vercel.json` rewrites `/api/*` and SPA fallback |
| Tests | **None currently** | No test runner, no `*.test.ts` files |
| Docs | **None currently** | No `docs/` directory |

### Module layout (existing)
```
server.ts                     Express app factory + all API routes
api/index.ts                  Vercel serverless entry
server/db.ts                  Supabase data-access layer (snake_case <-> camelCase)
server/validations.ts         zod schemas
server/middleware/auth.ts     JWT admin auth
server/supabase.ts            Supabase service-role client
server/upload.ts              Vercel Blob upload-token + delete helpers
server/whatsapp.ts            Outbound WhatsApp notification build/send helpers
server/seed.ts                Seed script
src/types/index.ts            Shared TypeScript domain types
src/lib/api.ts                Frontend API client + local filter helper
src/lib/upload.ts             Frontend Vercel Blob upload helper
src/components/admin/...      Admin dashboard (overview/cars/leads/exchanges/alerts)
```

## 2. Existing Vehicle Lifecycle

1. Admin logs in (`/api/auth/login`) → JWT.
2. Admin opens the **Cars Inventory** tab in `AdminDashboard`.
3. Admin uses the **Add/Edit Car modal** (`handleOpenCarModal` + `handleSaveCar`).
4. Photos uploaded via `ImageUploader` → Vercel Blob (path `cars/...`) → URLs.
5. `createCarApi` / `updateCarApi` POST/PUT `/api/cars`.
6. `server/db.ts createCar`/`updateCar` writes to Supabase `cars`.
7. Vehicle appears with `status` (`Available` | `Reserved` | `Sold`).

There is **no draft / approval / review workflow**. A car is either created live or not.

## 3. Existing Database Schema

Defined in `supabase-schema.sql`. Key tables:

- **cars**: `id`, `title`, `brand`, `model`, `year`, `fuel_type`, `transmission`,
  `body_type`, `owner_count`, `status`, `images` (JSONB `[]`), `specs` (JSONB `{ rto }`),
  `created_at`.
  - Note: price, kilometres, colour, insurance, engine, features, description, registration
    number were **removed** in earlier commits. The canonical model in this repo is a
    **minimal** inventory row.
- **leads**: `id`, `name`, `phone`, `email`, `car_id`, `car_title`, `type`, `message`, `status`, `notes`, `created_at`.
- **exchange_requests**: `id`, `customer_name`, `phone`, `current_brand`, `current_model`,
  `current_year`, `current_kilometers`, `fuel_type`, `transmission`, `expected_price`,
  `comments`, `images`, `target_car_id`, `target_car_title`, `status`, `created_at`.
- **users**: `id`, `username`, `password_hash`, `name`, `role`, `created_at`.

Constraints / relationships: `leads.car_id` and `exchange_requests.target_car_id` are
loose string references (not FKs). RLS enabled; `cars` publicly readable; admin full access.

## 4. Existing Image Pipeline

- Frontend validates type (jpeg/png/webp) + 5 MB limit, then calls
  `uploadImages()` → Vercel Blob client-side direct upload (path `cars/<ts>-<i>-<file>`).
- Upload token issued by `POST /api/upload/token/car` (admin auth) /
  `POST /api/upload/token/exchange` (rate limited).
- Resulting public URLs stored in `cars.images` (JSONB array, max 10 in API / 15 in UI).
- Blobs deleted via `deleteBlobsForUrls` when images are replaced or a car is deleted.
- **No**: classification, quality analysis, background replacement, branding, resizing,
  or variant generation. Originals are used directly.

## 5. Existing Authentication

- Username/password (bcrypt) against `users`.
- On success, JWT signed with `JWT_SECRET` (8h expiry) containing `{ username, role, name }`.
- `authenticateAdmin` middleware verifies `Bearer` token and `role === 'admin'`.
- Frontend stores token in `localStorage` (`km_admin_token`).
- Default admin auto-created by `ensureDefaultAdmin()` (password from `ADMIN_PASSWORD`).

## 6. Existing APIs

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/health` | public | health check |
| GET | `/api/cars` / `/api/cars/:id` | public | inventory browse |
| POST | `/api/leads` | public | submit inquiry |
| POST | `/api/exchange-requests` | public | submit exchange request |
| POST | `/api/auth/login` | public (rate-limited) | login |
| POST | `/api/upload/token/car` | admin | car image upload token |
| POST | `/api/upload/token/exchange` | public (RL) | exchange image upload token |
| GET | `/api/leads`, `/api/exchange-requests`, `/api/stats` | admin | admin data |
| PATCH | `/api/leads/:id`, `/api/exchange-requests/:id` | admin | update status |
| POST/PUT/DELETE | `/api/cars(/…)` | admin | car CRUD |
| POST | `/api/admin/generate-description` | admin | Gemini description |
| POST | `/api/admin/daily-report` | admin | daily summary + WhatsApp |

## 7. Existing Deployment

- Vercel serverless single function at `/api` (Express app imported by `api/index.ts`).
- Static SPA built by `vite build` (`dist`), served by Vercel; `vercel.json` rewrites.
- Local dev: `npm run dev` (`tsx server.ts`); production standalone `node dist/server.cjs`.
- Vercel Blob for storage, Supabase for DB.
- **No** background workers, cron, queues, Redis, or long-running job infra.
- Env vars read via `dotenv` (server) and Vercel env config (prod). No `.env.local` committed.

## 8. Proposed AI Architecture

```
WhatsApp ──► WhatsApp Webhook
                 │  (verify + receive + idempotency)
                 ▼
        Message Ingestion Service      server/ai/ingestion.ts
                 │
                 ▼
        Conversation / Session Manager  server/ai/conversations.ts
                 │
                 ▼
        AI Vehicle Intake Agent         server/ai/extraction.ts  (Gemini)
                 │
                 ▼
        Structured Vehicle Draft        server/ai/draft.ts       + DB vehicle_drafts
                 │
                 ▼
        Validation Engine + Missing Info Agent  server/ai/validation.ts
                 │
                 ▼
        Image Processing Pipeline       server/ai/images.ts      (+ Vercel Blob)
                 │
                 ▼
        Content Generation              server/ai/content.ts     (Gemini)
                 │
                 ▼
        Human Approval (READY_FOR_REVIEW)
                 │
                 ▼
        Canonical Vehicle Record  ──►  cars (website listing)
                 │
                 ▼
        Publishing Orchestrator         server/ai/publisher.ts
                 ├── Website (existing createCar/updateCar)
                 ├── Instagram (official API, best effort)  server/ai/instagram.ts
                 └── WhatsApp content (outbound send)        server/whatsapp.ts
                 ▼
        Analytics / Audit / Logs        server/ai/audit.ts
```

Separate AI responsibilities into focused agents (intake, extraction, validation, content,
image, publishing). Deterministic application code governs all state transitions, writes,
pricing, publishing, permissions, validation, and idempotency.

## 9. Integration Points With Existing Functionality

| Capability | Reuse existing |
|-----------|----------------|
| Auth / admin authorization | `authenticateAdmin`, `users` table, JWT |
| Vehicle persistence | extend `cars` table / `server/db.ts` car functions |
| Image storage | Vercel Blob via `server/upload.ts` + `src/lib/upload.ts` |
| AI text generation | Gemini via `@google/genai` (same client used in `generate-description`) |
| WhatsApp outbound | `server/whatsapp.ts` `sendWhatsAppAlert` |
| Validation | `zod` conventions in `server/validations.ts` |
| API structure | `server.ts` route factory, `/api/*` |
| Frontend admin shell | `AdminDashboard` tabs (add e.g. `stragglers`) |

## 10. Required Schema Changes (non-destructive adds)

New tables (all additive; existing rows untouched):

- **vehicle_drafts** — canonical AI ingestion record.
  Columns: `id`, `conversation_id`, `state`, `brand`, `model`, `variant`, `manufacturing_year`,
  `registration_year`, `registration_number`, `actual_registration`, `display_registration`,
  `fuel_type`, `transmission`, `drivetrain`, `body_type`, `color`, `interior_color`,
  `odometer_km`, `owner_count`, `engine`, `engine_cc`, `price`, `negotiable`,
  `finance_available`, `location`, `condition`, `accident_history`, `service_history`,
  `insurance_valid_until`, `rc_status`, `features` (JSONB), `description`, `source`,
  `seller_name`, `seller_phone`, `seller_id`, `dealer_id`, `confidence` (JSONB),
  `field_provenance` (JSONB), `content` (JSONB), `images` (JSONB), `documents` (JSONB),
  `locked_fields` (JSONB), `publish_result` (JSONB), `published_car_id`,
  `error` (JSONB), `created_at`, `updated_at`, `published_at`, `sold_at`.
- **whatsapp_messages** — raw inbound events (idempotency via `external_id`).
  Columns: `id`, `external_id` UNIQUE, `conversation_id`, `from_phone`, `type`,
  `text`, `media_id`, `media_url`, `mime_type`, `audio_transcript`, `role`,
  `processed`, `processing_attempts`, `last_error`, `created_at`, `processed_at`.
- **whatsapp_conversations** — session manager.
  Columns: `id`, `external_phone`, `participant_type`, `state`, `vehicle_draft_id`,
  `last_activity`, `created_at`, `updated_at`, `metadata` (JSONB).
- **vehicle_audit_log** — audit trail.
  Columns: `id`, `actor`, `actor_type`, `action`, `entity`, `entity_id`, `old_value` (JSONB),
  `new_value` (JSONB), `source`, `request_id`, `conversation_id`, `created_at`.
- **ai_usage_log** — AI/processing cost & latency tracking.
  Columns: `id`, `entity`, `entity_id`, `agent`, `model`, `prompt_tokens`, `completion_tokens`,
  `duration_ms`, `event`, `status`, `conversation_id`, `created_at`.
- **publish_log** — one row per channel attempt (website/instagram/whatsapp).
  Columns: `id`, `vehicle_draft_id`, `car_id`, `channel`, `status`, `external_id`,
  `url`, `error`, `retry_count`, `request_id`, `created_at`, `updated_at`.

All use the existing `generateId(prefix)` convention for text PKs or `uuid`.

## 11. Required Environment Variables

Add to `.env.example` (only what the implementation actually uses):

```
WHATSAPP_VERIFY_TOKEN=""        # webhook verification (Meta sends this back as challenge)
WHATSAPP_ACCESS_TOKEN=""        # system-user access token for Business Cloud API
WHATSAPP_PHONE_NUMBER_ID=""     # business phone number id
WHATSAPP_API_URL=""             # outbound messages endpoint (already used by whatsapp.ts)
WHATSAPP_ADMIN_PHONE=""         # already present

# Instagram / Meta (Phase 5) — optional, no-op when unset
INSTAGRAM_ACCOUNT_ID=""
IG_USER_ACCESS_TOKEN=""
META_GRAPH_URL="https://graph.facebook.com/v19.0"

# AI (Gemini) — already present as GEMINI_API_KEY; reuse
GEMINI_API_KEY=""

# Image generation model (Gemini image), optional
GEMINI_IMAGE_MODEL="gemini-2.0-flash"   # or imagen … when available
```

## 12. Risks

1. **Webhook timing / retries** — Meta may redeliver webhooks; idempotency on `external_id` is mandatory.
2. **Prompt injection** — WhatsApp text is untrusted data. Never execute admin actions from message content without auth + confirmation.
3. **No background queue** — Vercel serverless has execution limits. All heavy work should be fast or delegated; keep webhook path to store-and-return-200.
4. **AI hallucination** — never fabricate specs; use provenance + confidence, null unknown fields, require human approval before publish.
5. **Image-gen fidelity** — restrict generative changes to background/environment; preserve vehicle identity.
6. **Instagram credential availability** — no-op gracefully when unconfigured; never roll back website publish because Instagram failed.
7. **Build/test environment** — repository currently has no runtime/CI/test harness; must be introduced carefully.
8. **Do not break existing admin** — all additions are additive; existing routes and schema untouched.

## 13. Backward-Compatible Strategy

- All new tables added with `IF NOT EXISTS`; no alteration or drop of existing columns.
- Existing `/api/cars`, leads, exchanges, auth unchanged.
- New AI routes are additive (`/api/ai/*`, `/api/whatsapp/*`).
- Image storage stays on Vercel Blob; new pipelines append new blob variants without modifying originals.
- `cars` table remains the public inventory source of truth; `vehicle_drafts` is the ingestion/in-review source.

## 14. Migration Strategy

1. Apply `supabase-schema.sql` additions (new `vehicle_drafts`, `whatsapp_*`, `vehicle_audit_log`,
   `ai_usage_log`, `publish_log` tables) in Supabase SQL editor.
2. All writes go through `server/ai/*` modules which use the existing `server/supabase.ts` client.
3. Rollback = simply do not use the new tables/routes; originals unaffected.

## 15. Testing Strategy

- Unit: extraction field parsing, validation, state transitions, missing-field detection,
  price/km/year parsing, conversation merging, permission checks, idempotency dedupe.
- Integration: WhatsApp webhook → storage → extraction → draft → image → approval → website publish.
- Failure: duplicate webhook, duplicate message, AI timeout, image failure, storage failure,
  instagram failure, invalid sender, unauthorized command, conflicting data.
- E2E: simulate a full seller submission → review → publish.
- Framework: `vitest` (fits Vite/TS repo) with `server/ai/**/*.test.ts`.
- Run with `npm test` (`vitest run`). Static type gate remains `npm run lint` (`tsc --noEmit`).

---

## Phased Implementation Plan

- **PHASE 1 — Vehicle AI Core (this deliverable)**
  - Canonical `vehicle_drafts` + state machine + audit log + provenance/locking.
  - Gemini structured extraction + validation + missing-field detection + content generation.
- **PHASE 2 — WhatsApp Ingestion**
  - Webhook (verify/receive/idempotent), message storage, conversation sessions,
    text/image/voice(document) ingestion, follow-up questions, WhatsApp admin control.
- **PHASE 3 — Image Pipeline**
  - Originals to Blob, classification, quality flagging, variant generation, KM branding config,
    number-plate display policy, admin preview.
- **PHASE 4 — Website Integration**
  - Draft → approve → publish (existing `cars`), sold/archive, admin AI-ops UI.
- **PHASE 5 — Instagram**
  - Official Graph API publishing with independent status + retry.
- **PHASE 6 — Buyer AI** (after ingestion is stable).

## Non-Negotiable Rules (Recap)

1. Do not break existing KM Car Deals functionality.
2. Do not rewrite working code unnecessarily.
3. Do not fabricate vehicle information.
4. Do not allow AI to directly execute arbitrary database operations.
5. Do not automatically publish unapproved vehicles in the initial version.
6. Do not modify original vehicle photographs.
7. Do not change the actual vehicle identity through image generation.
8. Do not expose real registration publicly without policy approval.
9. Do not use unofficial WhatsApp automation for production.
10. Do not use Instagram browser automation where official API exists.
11. Do not commit secrets.
12. Every external webhook must be authenticated/verified.
13. Every important action must be auditable.
14. Every external publishing operation must be idempotent.
15. Website, Instagram, WhatsApp publication statuses tracked independently.
16. AI-generated information must have provenance.
17. Human-edited information protected from accidental AI overwrites.
18. Long-running processing must be asynchronous.
19. Failed jobs observable and retryable.
20. Existing data must remain backward compatible.

## Definition of Done

A seller can send WhatsApp text + photos; the system extracts into a draft, flags missing
fields, asks only necessary follow-ups, processes images, generates listing + social content,
and presents a draft for human approval. After approval the vehicle is published on the website
(and Instagram where permitted), each channel tracked independently, and every step is
traceable from message → conversation → draft → images → AI decisions → approval → publication.