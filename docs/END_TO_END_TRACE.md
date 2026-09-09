# KM Car Deals — End-to-End Trace of the AI Vehicle System

This document traces the complete WhatsApp → review → publish → lifecycle flow of the AI
vehicle system. Every stage lists: entry file, function, DB table, inputs, outputs, the
next stage, and error handling.

> Note (2026-09-09): the AI provider stage below (formerly "Gemini") now runs through the
> provider-agnostic `server/ai/ai.ts` facade (default local Ollama); the E2E harness mocks
> `server/ai/provider/ollama.js`. See `docs/LOCAL_AI_MIGRATION.md` for the current wiring.

---

## Stage 0 — Server bootstrap

|            | |
|------------|-|
| File       | `server.ts` / `api/index.ts` |
| Function   | `createApp()` → `startServer()` |
| Inputs     | `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `PORT`, `NODE_ENV`, `VERCEL` |
| Output     | Express app; `express.static('dist')` + SPA fallback in production, Vite middleware in dev |
| DB tables  | none |
| Next stage | All routes registered, including `/api` → `server/ai/routes.ts` (`ai` router) and the legacy `/api/cars`, `/api/leads`, `/api/exchange-requests`, `/api/stats`, `/api/auth/*` |
| Error path | `ensureDefaultAdmin()` (server/db.ts) creates `admin` only if `users` has none; requires a real Supabase auth client |

---

## Stage 1 — WhatsApp webhook ingress

|            | |
|------------|-|
| File       | `server/ai/routes.ts` → `server/ai/webhook.ts` |
| Functions  | `verifyWebhook` (GET), `processWebhookBody` (POST) |
| Inputs     | GET: `hub.mode`, `hub.verify_token`, `hub.challenge`. POST: Meta `{ entry: [{ changes: [{ value: { messages: [...] } }] }] }` |
| Output     | GET: echoes `hub.challenge` (200) when `hub.verify_token === WHATSAPP_VERIFY_TOKEN`, else 403. POST: always `200 { received: true, stored, skipped }` |
| Next stage | Per-message: idempotency check → enrich → persist → fire-and-forget intake/admin handler |
| Error path | Any processing error is logged and the webhook still acks 200. Meta is never retry-looped. |

Empirically verified with the boot smoke test: bad verify token → `403`, correct token → challenge echoed.

## Stage 2 — Idempotency + persistence

|            | |
|------------|-|
| File       | `server/ai/db.ts` |
| Functions  | `getMessageByExternalId`, `persistInboundMessage`, `getOrCreateConversation` |
| Table      | `whatsapp_messages` (unique `external_id` = Meta `wamid.id`), `whatsapp_conversations` |
| Inputs     | `externalId`, `conversationId`, `fromPhone`, `type`, `text`, `media[]` |
| Output     | Stored message with `processed=false`, `processing_attempts=0`; conversation created or reused per `external_phone` |
| Next stage | `runIntake` (seller) or `handleAdminMessage` (admin phone) |
| Error path | Duplicate `external_id` → skipped, never double-processed. Insert failure → thrown, caught by webhook → acks 200 with `stored: 0`. |

## Stage 3 — Media enrichment

|            | |
|------------|-|
| File       | `server/ai/webhook.ts` (`enrichMessage`), `server/ai/whatsapp-api.ts` |
| Functions  | `resolveMediaUrl`, `storeRemoteMedia` |
| Output     | Durable Vercel Blob URL for `image/*` and `audio/*`; `MessageAttachment[]` |
| Next stage | Attachments stored in `whatsapp_messages.media`; images consumed again at intake; audio fed to `transcribeAudioUrl` |
| Error path | Unconfigured WhatsApp → `resolveMediaUrl` returns null (attachments stored without URL). Non-media payloads → not stored. Transcription failure → `text: null`, message still kept. |

> Note: prior to this audit, `storeRemoteMedia` accepted only `image/*`, making the audio
> voice-note transcription path unreachable. Fixed (see FINAL_ENGINEERING_AUDIT §16).

## Stage 4 — AI intake orchestrator

|            | |
|------------|-|
| File       | `server/ai/intake.ts` |
| Function   | `runIntake(conversationId, messageId, ctx)` |
| Table      | `vehicle_drafts`, `whatsapp_conversations` |
| Flow       | get/create draft → `RECEIVED`→`PROCESSING` → build transcript → extraction → image pipeline → validation → content → review or incomplete |
| Next stage | `READY_FOR_REVIEW` → admin notify / dashboard. `INCOMPLETE` → follow-up WhatsApp questions |
| Error path | Any failure → `PROCESSING_FAILED` + `whatsapp_messages.last_error`/`processing_attempts` bump + audit |

### 4a. Extraction

|            | |
|------------|-|
| File       | `server/ai/extraction.ts` |
| Function   | `extractVehicleFromConversation` |
| Inputs     | Transcript (text + audio transcript + image summaries), existing `draft.data`, `lockedFields` |
| Output     | `ExtractionResult { data, confidence, provenance, unknown, notes }`; merged into draft respecting `lockedFields` |
| Error path | Gemini failure → `PROCESSING_FAILED`; locked-field merge protects admin-set values |

### 4b. Image pipeline

|            | |
|------------|-|
| File       | `server/ai/images.ts` |
| Function   | `classifyAndAnalyze` |
| Inputs     | New image attachments (id, url, mime, size) |
| Output     | `ProcessedImage[]` (category, quality flags, variants map, primary flag). Variants fall back to original URL — no fabrication when no image model/token |
| Error path | Vision unavailable → heuristic `classifyQuality` + `heuristicCategory`; never fails the pipeline. Duplicate detection is heuristic (mime+size). |

### 4c. Validation

|            | |
|------------|-|
| File       | `server/ai/validation.ts` |
| Function   | `validateDraft`, `computeCompletion`, `detectConflicts` |
| Inputs     | Merged `VehicleExtractedData` |
| Output     | `ValidationResult { readyToReview, missingRequired, missingDesired, conflicts, missingFieldRequest }` |
| Rules      | Required: brand, model, manufacturingYear, fuelType, transmission, bodyType, ownerCount, price (`REQUIRED_FOR_PUBLISH`). Conflicts: reg year < mfg year, EVs with manual gearbox, odometer range, price range |
| Next stage | `READY_FOR_REVIEW` flow or INCOMPLETE follow-up |

### 4d. Content generation

|            | |
|------------|-|
| File       | `server/ai/content.ts` |
| Function   | `generateVehicleContent` |
| Inputs     | Verified data only |
| Output     | `GeneratedContent { websiteTitle, websiteDescription, instagramCaption, whatsappSalesMessage, seo }` |
| Error path | Failure logged + `ai_usage_log` 'error'; draft may still reach review with older content |

### 4e. Admin notify / follow-up

|            | |
|------------|-|
| File       | `server/ai/whatsapp-api.ts` (`notifyAdmin`, `sendWhatsAppText`) |
| Output     | WhatsApp summary to `WHATSAPP_ADMIN_PHONE`; or follow-up questions to the seller |
| Error path | Unconfigured WhatsApp → message logged to console only, returns `ok:false` |

## Stage 5 — Review (human in the loop)

|            | |
|------------|-|
| Entry      | Admin UI `AIOpsPanel.tsx` → `src/lib/api.ts` → `/api/ai/drafts`, `/api/ai/drafts/:id` |
| WhatsApp   | `server/ai/admin-commands.ts` (`detectAdminCommand`, `routeCommand`, confirmation gate) |
| Actions    | approve, reject/archive, mark sold, change price, publish, regenerate images/content |
| Output     | Draft transitions via `state-machine.ts` (`assertTransition`); all actions audited in `vehicle_audit_log` |
| Error path | Invalid transition → 400 with message; admin WhatsApp confirm failures → `confirm_execute_failed` audit; destructive actions require explicit confirmation |

## Stage 6 — Publish

|            | |
|------------|-|
| File       | `server/ai/publisher.ts` |
| Function   | `approveDraft` → `publishChannels` |
| Table      | `cars`, `publish_log`, `vehicle_drafts` |
| Channels   | website (`ensureWebsitePublished`, `updateCar` idempotent), instagram (`publishToInstagram`, two-phase Media Container + media_publish), whatsapp (`publishWhatsAppContent`) |
| Output     | `PublishResult { entries[] }` per channel, persisted to `publish_log`; state → `PUBLISHED` (website ok) else `PUBLISH_FAILED` |
| Error path | Per-channel independent: a failed Instagram never rolls back a successful website publish |

> Honesty fix: `whatsapp` channel now only reports `success` after a real
> `sendWhatsAppText` transmission to a configured recipient; otherwise `skipped`

## Stage 7 — Post-publish lifecycle

|            | |
|------------|-|
| File       | `server/ai/publisher.ts` |
| Functions  | `markDraftSold` (updates `cars.status='Sold'` + `sold_at`), `updateDraftPrice` (draft data + locked + provenance + audit) |
| Admin UI   | `aiMarkSold`, `aiUpdatePrice` (₿ in lakh, validated 1 … 150,000,000 INR) |
| Error path | Invalid price → 400. `updateCar` on price was an empty no-op (removed; `cars` has no price column) |

## Stage 8 — Observability

|            | |
|------------|-|
| Files      | `server/ai/audit.ts` (`appendAudit`, `logAiUsage`), `server/ai/queue-status.ts` (`getRedisBackedQueueSummary`) |
| Tables     | `vehicle_audit_log`, `ai_usage_log`, `whatsapp_messages` (processed/attempts/last_error) |
| API        | `/api/ai/status` (config readiness + per-state draft counts + queue summary), `/api/ai/drafts/:id/audit` |
| Output     | Full provenance trail for every AI action and field change |

---

## Database tables involved

| Table | Purpose | Written by |
|-------|---------|------------|
| `whatsapp_messages` | inbound events, idempotency, job bookkeeping | webhook, intake |
| `whatsapp_conversations` | session + admin pending-action metadata | webhook, intake, admin-commands |
| `vehicle_drafts` | canonical AI state + data/confidence/provenance/locked | intake, publisher, admin-commands |
| `vehicle_audit_log` | full audit trail | audit.ts |
| `ai_usage_log` | AI cost/token tracking | gemini.ts, audio.ts, intake.ts |
| `publish_log` | per-channel publish status | publisher.ts, instagram.ts |
| `cars` (legacy) | published listing, canonical website row | server/db.ts, publisher.ts |
| `leads`, `exchange_requests`, `users` (legacy) | existing site, untouched by AI system | server/db.ts |

## Key invariants enforced

1. Idempotent webhook ingestion keyed on Meta `wamid.id`.
2. Webhook always acks 200; processing is fire-and-forget and observable in DB.
3. Deterministic app code is the authority, not the AI (white-lists, validation, state machine).
4. Original images are never modified; variants degrade gracefully to originals.
5. Per-channel publish independence; no rollback cascades.
6. Every AI action and field change is audited.

---

## Automated end-to-end proof (`e2e-flow.test.ts`)

The stages above are also exercised in code, over **real HTTP**, by
`server/ai/__tests__/e2e-flow.test.ts`. It boots the actual wired `createApp()` (all routes,
middleware, JWT auth, queue-status, publisher, and the legacy `/api/cars` inventory) on an
ephemeral port. Only services that cannot exist in CI are faked at the module boundary:

- Supabase → in-memory PostgREST-compatible in-memory fake (`server/supabase.js` mock).
- Gemini → deterministic JSON per agent (`@google/genai` mock).
- WhatsApp/Instagram remain **unconfigured**, so the real code paths must degrade honestly.

The 13 stages it asserts (all green on 2026-09-08, `npm test` → **62/62**):

| # | Assertion |
|---|-----------|
| 0 | `GET /api/health` → 200 `{ status:'ok', database:'connected' }` |
| 1 | Webhook GET handshake: correct token echoes challenge (200), wrong token → 403 |
| 2 | Webhook POST ingest stores exactly once; identical resend → `stored:0, skipped:1` (idempotency over HTTP) |
| 3 | `POST /api/auth/login` admin → JWT + `role:'admin'` |
| 4 | AI routes without token → 401 |
| 5 | `POST /api/ai/intake-text` (Toyota Fortuner sample) → draft `READY_FOR_REVIEW`, full extracted data + content + SEO slug |
| 6 | Draft visible in `GET /api/ai/drafts` and counted by `GET /api/ai/status` (`geminiConfigured:true`) |
| 7 | `POST /api/ai/drafts/:id/approve` → `PUBLISHED`; publish_log has independent entries: website `success`, instagram `skipped`, whatsapp `skipped` (unconfigured) |
| 8 | The published car exists in the **real** `/api/cars` list (no parallel inventory) |
| 9 | `POST .../price` persists + locks `price` (regression guard for the empty-`updateCar` defect) |
| 10 | `POST .../sold` flips both the canonical `cars` row and the draft to `Sold` |
| 11 | Invalid price (`-5`) → 400 |
| 12 | Invalid JWT on approve → 401 |