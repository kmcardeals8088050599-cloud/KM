# KM CAR DEALS AI — FINAL ENGINEERING AUDIT

**Date:** 2026-09-08
**Scope:** AI Vehicle System (WhatsApp ingestion → extraction → review → publishing) plus its integration with the existing KM Car Deals site (cars, leads, exchanges, admin).
**Method:** full source read of every AI module + integration point, targeted greps, real `npm test` / `npm run lint` / `npm run build`, live boot smoke test against a local Supabase stub, live webhook handshake test, and a committed **end-to-end integration test** (`e2e-flow.test.ts`) that boots the REAL wired Express app over HTTP with only Supabase/the AI provider faked at module boundaries and drives the full production flow: webhook ingest + idempotency → login → intake → review → approve → website publish → price lock → sold.
**Constraint honored:** no new features added; the AI provider was made provider-agnostic (Gemini → local Ollama) and no production deployment was performed. Only genuine correctness/security/honesty defects were fixed.

---

## Overall Status

> **READY FOR CONFIGURATION**

The implementation is real and code-verified (all integrations call official APIs; no mocks in production code; no parallel fake inventory; tests 80/80 including a full HTTP-level end-to-end run through the wired app; typecheck clean; production build succeeds). It was **not** exercised against live Supabase/Ollama/Meta/Instagram because no credentials or local inference server were available, and the Meta webhook must still be registered for a real account. Therefore it is not yet "PRODUCTION READY" on faith alone — it is ready for a configured live dry run.

> **Update (2026-09-09):** the AI provider is now **provider-agnostic, defaulting to local Ollama** (Gemini dependency fully removed). See `docs/LOCAL_AI_MIGRATION.md` (design + checklist), `docs/LOCAL_AI_SETUP.md` (runbook), and `docs/LOCAL_AI_FINAL_AUDIT.md` (migration audit + gate results).
>
> **Update 2 (2026-09-09):** production hardening added — fail-fast boot guard (`server/prod-guards.ts`, 11 tests) that refuses default secrets / localhost AI / wildcard CORS, `trust proxy` behind Vercel, and a full go-live runbook (`docs/PRODUCTION_DEPLOYMENT.md`).

---

## End-to-End Flow

| Stage | Status | Evidence |
|---|---|---|
| WhatsApp webhook | ✅ Implemented, handshake verified live | `server/ai/webhook.ts` — GET `verifyWebhook` echoes `hub.challenge` when token matches (verified 200/403 live); POST `processWebhookBody` acks 200, dedupes on `wamid.id` |
| Message storage | ✅ Implemented | `server/ai/db.ts` `persistInboundMessage` → `whatsapp_messages` (UNIQUE `external_id`); tested (webhook.test.ts idempotency) |
| Conversation | ✅ Implemented | `getOrCreateConversation` → `whatsapp_conversations` keyed by `external_phone` |
| AI extraction | ✅ Implemented | `server/ai/extraction.ts` `extractVehicleFromConversation` → `generateStructured` (provider-agnostic facade, default Ollama `qwen2.5:7b`); locked-field merge; tested (extraction.test.ts) |
| Validation | ✅ Implemented | `server/ai/validation.ts` deterministic (`REQUIRED_FOR_PUBLISH`, conflict detection); tested (validation.test.ts) |
| Vehicle draft | ✅ Implemented | `vehicle_drafts` row; full state machine (`state-machine.ts`, 10 tests) |
| Image ingestion | ✅ Implemented | `enrichMessage` → `resolveMediaUrl` → `storeRemoteMedia` (durable Vercel Blob copy) |
| Image processing | ✅ Implemented (graceful) | `images.ts` `classifyAndAnalyze` — vision classification (8/batch) + heuristic fallback; originals NEVER modified; variants fall back to original when no image model/token |
| Content generation | ✅ Implemented | `content.ts` `generateVehicleContent` → `GeneratedContent` (title/description/IG caption/WA message/SEO) |
| AI Ops | ✅ Implemented | `AIOpsPanel.tsx` + `/api/ai/*` admin routes; `/api/ai/status` readiness + counts |
| Approval | ✅ Implemented | `publisher.ts` `approveDraft` → `assertTransition(…, 'APPROVED','admin')` → `createCar` |
| Website publishing | ✅ Implemented | `ensureWebsitePublished` → `updateCar` on existing `cars` (no parallel inventory); state `PUBLISHED`/`PUBLISH_FAILED`; boot smoke `/` 200 |
| Instagram | ✅ Implemented (code path) | `instagram.ts` official two-phase Graph API (container → poll → publish); carousel support; unconfigured → clean `skipped`; **not live-tested** (no account/token) |
| WhatsApp response | ✅ Implemented (honest) | `sendWhatsAppText` official Meta API; unconfigured → console only + `ok:false`; admin notify + follow-up questions; **fix**: publish channel reported `success` with no send → now success only on real transmission |

---

## Tests

Command run: `npm test` → `vitest run` — **80 passed / 80 (10 files)**.

| Suite | Tests | Result |
|---|---|---|
| `parsing.test.ts` | 13 | ✅ |
| `state-machine.test.ts` | 10 | ✅ |
| `validation.test.ts` | 6 | ✅ |
| `extraction.test.ts` | 3 | ✅ |
| `commands.test.ts` | 8 | ✅ |
| `webhook.test.ts` | 3 | ✅ |
| `publisher.test.ts` (new) | 3 | ✅ |
| `whatsapp-api.test.ts` (new) | 3 | ✅ |
| `provider/__tests__/ollama.test.ts` (new) | 18 | ✅ |
| `e2e-flow.test.ts` (new) | 13 | ✅ |

`e2e-flow.test.ts` boots the real `createApp()` (routes, middleware, JWT auth, state machine, publisher, existing `cars` API) over HTTP with only Supabase (in-memory PostgREST-compatible fake) and the Ollama provider (deterministic JSON) mocked at the module boundary, then verifies: health 200; webhook handshake 200/403; webhook ingest stored exactly once (HTTP-level idempotency); login → JWT; 401 without token; admin intake → READY_FOR_REVIEW draft (extraction → validation → content); drafts list + `/api/ai/status` (`aiProviderConfigured`); approve → PUBLISHED with independent website/instagram/whatsapp entries (instagram + whatsapp cleanly `skipped` unconfigured); the published car appears in the real `/api/cars` inventory; price change persists + locks `price` (regression guard for the empty-`updateCar` bug); invalid price rejected 400; mark sold flips car + draft to Sold; bad token → 401.

`npm run lint` (`tsc --noEmit`): **clean, 0 errors.** `npm run build`: **succeeds** (Vite `dist/` + esbuild `dist/server.cjs`).

---

## Critical Problems

1. **No real E2E executed.** Live Supabase, Ollama (or any inference backend), Meta, Instagram credentials/environments are unavailable here. Code paths are unit-verified, the full wired app is integration-verified over HTTP (`e2e-flow.test.ts`), and the provider is unit-verified against a stubbed Ollama HTTP API (18 tests), but a real inference run and a real post are unverified (per §17 rule: cannot claim "everything is ready").
2. **Meta webhook subscription not registered.** Requires HTTPS callback URL + `WHATSAPP_VERIFY_TOKEN` set in the Meta App dashboard; the repo cannot do this.
3. ~~**Gemini output is not schema-validated at runtime.**~~ **Resolved by the local-AI migration.** Provider output is now validated at the pipeline boundary with zod schemas (`server/ai/schemas.ts`: `vehicleExtractedDataSchema`, `generatedContentSchema`, `conflictResolutionSchema` — unknown keys stripped, integers/booleans coerced, strings/int bounded) plus the deterministic sanitizers (`normalizeExtraction` FIELD_MAP, `normalizeContent`, white-lists, conflict detection).
4. **Production secrets must be overridden.** `JWT_SECRET` and `ADMIN_PASSWORD` have dev fallbacks (`km_car_deals_jwt_secret_change_in_production_2026`, `kmadmin2026`); both must be set in prod.
5. **Instagram live behavior unverified** (token/account absent; two-phase API implemented per Meta docs, degrades cleanly when unconfigured).
6. **No `006_run_all.sql` / `007_idempotency_fixes.sql` exist.** Repo has only `supabase-schema.sql` (legacy) and `ai-schema.sql` (AI). `ai-schema.sql` is additive + idempotent; nothing to apply against a fresh project yet.
7. **Local AI is not exercised against a real model.** Hermetic tests stub the provider; recommend a configured live dry run with a local Ollama server before relying on output quality (see `docs/LOCAL_AI_SETUP.md`).

---

## Configuration Required (human-only)

1. Supabase: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` (service_role).
2. Local AI provider (default Ollama): `AI_PROVIDER=ollama`, `OLLAMA_BASE_URL` (default `http://localhost:11434`), `OLLAMA_MODEL` (default `qwen2.5:7b`), `OLLAMA_VISION_MODEL` (optional, default `qwen2.5vl:7b`) — see `docs/LOCAL_AI_SETUP.md`. No cloud AI key required.
3. Meta WhatsApp: `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN`; set callback URL `https://<your-domain>/api/whatsapp/webhook` in Meta App → WhatsApp → Configuration.
4. Meta Instagram: `INSTAGRAM_ACCOUNT_ID`, `IG_USER_ACCESS_TOKEN` (for publishing; optional — skipped cleanly otherwise).
5. Notifications/admin commands: `WHATSAPP_ADMIN_PHONE`.
6. Vercel Blob: `BLOB_READ_WRITE_TOKEN`.
7. Production override: `JWT_SECRET`, `ADMIN_PASSWORD` (change from defaults).
8. Optional: `WHATSAPP_API_URL` (legacy override). `META_GRAPH_URL`, `PORT`, `ALLOWED_ORIGIN` already default correctly.

---

## Files Changed

**This verification pass (3 bug fixes, 1 doc fix, 3 new test files, 2 new docs):**
- `server/ai/publisher.ts` — whatsapp channel no longer reports false `success`; removed empty `updateCar(publishedCarId,{})` on price change.
- `server/ai/whatsapp-api.ts` — `storeRemoteMedia` now persists `audio/*` (voice-note transcription was unreachable).
- `.env.example` — documented `SUPABASE_SERVICE_KEY` (was wrongly `SUPABASE_ANON_KEY`).
- `server/ai/__tests__/publisher.test.ts` — new (3 tests).
- `server/ai/__tests__/whatsapp-api.test.ts` — new (3 tests).
- `server/ai/__tests__/e2e-flow.test.ts` — new (13 tests): full HTTP-level run through the real wired app (with only Supabase + AI provider faked).
- `docs/END_TO_END_TRACE.md` — new (§1 deliverable).
- `docs/FINAL_ENGINEERING_AUDIT.md` — new (§17 deliverable, this file).

**Local-AI migration (2026-09-09):** provider-agnostic facade replaces `server/ai/gemini.ts` (deleted); new `server/ai/provider/` (types, config, `OllamaProvider`, registry), zod pipeline schemas, provider unit tests (18), `/api/ai/status` provider-health fields, `AIOpsPanel` provider card, docs (`LOCAL_AI_MIGRATION.md`, `LOCAL_AI_SETUP.md`, `LOCAL_AI_FINAL_AUDIT.md`). `@google/genai` and `GEMINI_API_KEY` fully removed. See `docs/LOCAL_AI_MIGRATION.md`.

**Previously committed implementation (not changed this pass):** `server/ai/*`, `api/index.ts`, `server.ts`, `server/db.ts`, `src/types/ai.ts`, `src/lib/api.ts`, `src/components/admin/AIOpsPanel.tsx`, `AiDraft` DTOs, `vitest.config.ts`, `vitest.setup.ts`, `package.json`.

---

## Database Changes

- No migrations `006` / `007` exist in the repo (verified by glob).
- `ai-schema.sql` (root) is the only AI migration: 6 tables, all `CREATE ... IF NOT EXISTS` (idempotent, re-runnable, additive). No DROPs, no ALTERs on legacy tables.
  - Tables: `vehicle_drafts`, `whatsapp_conversations`, `whatsapp_messages`, `vehicle_audit_log`, `ai_usage_log`, `publish_log`.
  - Indexes on all hot query paths; RLS enabled on all 6 with no public policies (service_role only); `whatsapp_messages.external_id` UNIQUE backs idempotency.
- **No SQL was executed** against any environment during this audit.

---

## External Services

1. **Local AI provider (Ollama)** — provider-agnostic facade (Extraction, content, image classification, admin description) via `server/ai/ai.ts`; default Ollama REST API (`qwen2.5:7b` text/structured, `qwen2.5vl:7b` vision). Vision unset → heuristic fallback; audio transcription unsupported by Ollama → honest `null`. *Required* for AI features; degrades gracefully when the provider is unavailable (typed errors, intake marks `PROCESSING_FAILED`, admin sees availability in AI Ops). Gemini dependency fully removed.
2. **Meta WhatsApp Business Cloud API** — Graph `v19.0/{phone_number_id}/messages` (outbound), `v19.0/{media_id}` (media download). *Required* for live webhook + replies.
3. **Meta Instagram Graph API** — media container + publish. *Optional* (clean `skipped` when unconfigured).
4. **Supabase** — Postgres storage + auth (service_role client). *Required*.
5. **Vercel Blob** — durable media/image storage. *Required* in production.

---

## Final Go-Live Procedure

1. **Create Supabase project** → run `supabase-schema.sql`, then `ai-schema.sql` (SQL editor). Copy URL + service_role key.
2. **Set env vars** (Vercel or local `.env`): `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `JWT_SECRET`, `ADMIN_PASSWORD`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ADMIN_PHONE`, `BLOB_READ_WRITE_TOKEN`, (optional) `INSTAGRAM_ACCOUNT_ID`, `IG_USER_ACCESS_TOKEN`, and the local-AI block: `AI_PROVIDER`, `OLLAMA_BASE_URL`, `OLLAMA_MODEL`, `OLLAMA_VISION_MODEL` (see `docs/LOCAL_AI_SETUP.md`).
3. **Deploy** to Vercel (or `npm run build` + serve `dist/server.cjs` on a persistent host). Confirm `/api/health` → 200 `database:"connected"`.
4. **Register the webhook** in Meta App → WhatsApp → Configuration: callback `https://<your-domain>/api/whatsapp/webhook`, verify token = `WHATSAPP_VERIFY_TOKEN`, subscribe to `messages`. Confirm the Meta dashboard reports "Webhook setup successful".
5. **Verify admin covers**: log into `/admin`, run "Run AI Intake" with the sample: `Toyota Fortuner 2022, 2.8 diesel automatic, 48,000 km, first owner, ₹32.5 lakh`. Confirm draft → READY_FOR_REVIEW.
6. **Approve** the draft in AI Ops. Confirm `cars` list shows the new listing (website publishing).
7. **Send a WhatsApp message** to the number from a non-admin phone → confirm a draft is created and the seller receives follow-up questions; confirm the admin number receives the ready notification.
8. **Instagram (optional)**: connect a Meta IG account with `instagram_basic`/`instagram_content_publish`, set tokens, approve a draft with images, confirm media_publish succeeds.
9. **Post-go-live hygiene**: log in as `admin`, change password; verify `JWT_SECRET` is changed; confirm no test/stub URLs leaked into the deployed `cars` table.