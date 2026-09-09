# LOCAL AI MIGRATION — Gemini → Provider-Agnostic AI (Ollama)

**Date:** 2026-09-09
**Scope:** Replace the Google Gemini dependency for the vehicle AI workflow with a
provider-agnostic `AIProvider` abstraction defaulting to **Ollama** while preserving all
existing behaviour (vehicle extraction, validation, content, vision heuristics, conversation
memory, human-approval gate, publishing, and the green E2E harness).

---

## 1. Current Gemini integration (audit result)

Gemini is used through the `@google/genai` SDK (`GoogleGenAI` class) and one thin shared
wrapper. There is **no Gemini SDK leakage anywhere else** — every AI call site goes through
the wrapper or, in two places, through the SDK directly.

| File | Usage | Gemini surface |
|---|---|---|
| `server/ai/gemini.ts` | Shared wrapper `callGeminiJson()` (JSON mode, retries, fenced-JSON fallback parsing, usage logging) | `GoogleGenAI`, `GEMINI_API_KEY`, `responseMimeType: application/json`, default model `gemini-2.0-flash` |
| `server/ai/extraction.ts` | Vehicle intake extraction agent | `callGeminiJson` + `AI_CONFIG.extractionModel` |
| `server/ai/content.ts` | Website/IG/WhatsApp/SEO content agent | `callGeminiJson` + `AI_CONFIG.contentModel` |
| `server/ai/validation.ts` | `aiResolveValidation` conflict resolution | `callGeminiJson` + `AI_CONFIG.extractionModel` |
| `server/ai/images.ts` | `classifyAndAnalyze` vision classification | `callGeminiJson` + `AI_CONFIG.imageModel` (**images are NOT actually transmitted** — prompt sends `dataUrlTruncated:true` placeholders; real output is heuristic + weak inference) |
| `server/ai/audio.ts` | `transcribeAudioUrl` voice-note transcription | Direct `GoogleGenAI` with inline audio, `AI_CONFIG.transcriptionModel` |
| `server.ts` | `POST /api/admin/generate-description` | Direct `GoogleGenAI` + `GEMINI_API_KEY` + hardcoded `gemini-2.0-flash` |
| `server/ai/config.ts` | Hardcoded model names | `extractionModel`/`contentModel`/`imageModel`/`transcriptionModel` = `gemini-2.0-flash` |
| `server/ai/routes.ts` | `/api/ai/status` | `geminiConfigured` = `Boolean(GEMINI_API_KEY)` |
| `.env.example` | Env docs | `GEMINI_API_KEY` |
| `package.json` | Dependency | `@google/genai ^2.4.0` (+ `allowScripts` entry, + slots in `package-lock.json` / `bun.lock`) |
| `src/components/admin/AIOpsPanel.tsx` | Status card | `status.geminiConfigured` |
| `server/ai/__tests__/e2e-flow.test.ts` | E2E mock | `vi.mock('@google/genai', …)` deterministic JSON per agent prompt; sets `GEMINI_API_KEY`; asserts `geminiConfigured` |
| docs | `docs/AI_VEHICLE_SYSTEM_ARCHITECTURE.md`, `docs/END_TO_END_TRACE.md`, `docs/FINAL_ENGINEERING_AUDIT.md`, `README.md` | Gemini references |

### Every code path using Gemini (call graph)

1. **Extraction:** WhatsApp/admin text → `runIntake`/`createDraftFromText` → `extractVehicleFromConversation` → `callGeminiJson` → `normalizeExtraction` (FIELD_MAP, provenance/confidence, `unknown`, never-fabricate).
2. **Content:** `generateVehicleContent` → `callGeminiJson` → `normalizeContent` (fallbacks per field, SEO slug sanitizer).
3. **Validation resolution:** `aiResolveValidation` → `callGeminiJson` (only when conflicts exist).
4. **Image classification:** `classifyAndAnalyze` → `callGeminiJson` (heuristic fallback when unavailable — this is the ONLY vision entry point, and today it never receives pixels).
5. **Transcription:** inbound audio → `transcribeAudioUrl` → `GoogleGenAI` inline audio → fold transcript into message; `null` when unconfigured (graceful).
6. **Admin description generator:** `POST /api/admin/generate-description` → `GoogleGenAI` direct.

### What must be replaced

- The `GoogleGenAI` import sites (`gemini.ts`, `audio.ts`, `server.ts`).
- `GEMINI_API_KEY` gating / readiness signal.
- Hardcoded model names (`gemini-2.0-flash`) in `config.ts` and `server.ts`.
- `callGeminiJson` naming/semantics → provider-agnostic facade.
- The E2E `@google/genai` mock.
- The `.env.example`, status payload, and AI-ops UI labels.

### What must remain provider-agnostic (and is genuinely provider-file-agnostic already)

- Vehicle state machine, drafts, `READY_FOR_REVIEW → human approval → PUBLISHED` gate.
- `normalizeExtraction` / `normalizeContent` sanitizers + validation + provenance/confidence.
- Publisher, publish_log, audit, queue-status.
- All of `server/ai/db.ts`, `webhook.ts`, `intake.ts` orchestration (just swaps the AI call).
- The image pipeline contract (`ProcessedImage`, variants, quality flags, originals never mutated).

---

## 2. Target architecture

```
Business logic (extraction, content, validation, images, audio, admin generator)
        │  depends ONLY on
        ▼
   server/ai/ai.ts  (provider-agnostic facade + usage logging + schema validation hook)
        │
        ▼
   AIProvider interface
        ├── generateText({…})
        ├── generateStructured({…})   // strict JSON + retry, never fabricate
        ├── analyzeImage({…})         // multimodal vision
        ├── transcribeAudio({…})      // optional capability (Ollama: unsupported → null)
        └── healthCheck()             // configured/available/model/vision
        │
        ▼
   server/ai/provider/ollama.ts  (provider: Ollama REST API, JSON format, timeouts, backoff)
        │
        ▼
   Ollama HTTP API  (http://<OLLAMA_BASE_URL>/api/*)
```

Adding another provider later means implementing `AIProvider` and registering it in
`server/ai/provider/index.ts` — business logic is untouched.

---

## 3. Configuration (single source of truth)

Centralised in `server/ai/provider/config.ts` and mirrored in `.env.example`:

| Variable | Default | Meaning |
|---|---|---|
| `AI_PROVIDER` | `ollama` | Active provider id (registry-based; unknown value → config error surfaced in AI Ops) |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama HTTP endpoint (must be overridden in production; never hardcode localhost for prod) |
| `OLLAMA_MODEL` | `qwen2.5:7b` | Text / structured-reasoning model |
| `OLLAMA_VISION_MODEL` | `qwen2.5vl:7b` | Vision (multimodal) model; unset → vision capability reports unavailable |
| `AI_REQUEST_TIMEOUT_MS` | `120000` | Per-request timeout (AbortController) |
| `AI_MAX_RETRIES` | `2` | Structured-output retries on transient/malformed output |
| `AI_MAX_CONCURRENCY` | `4` | Max concurrent AI requests from this process |

The application starts with **no Gemini key**; nothing reads `GEMINI_API_KEY` anymore. Models
are **not** hardcoded in business logic (only the centralized defaults above).

### Model selection rationale

- **Text/structured:** `qwen2.5:7b` — Qwen2.5 class (per spec §4). Supports Ollama `format: json`
  structured output, good reasoning, strong multilingual (English + Indian-language-ish input),
  tool calling for future admin-command use, and runs on commodity hardware (~8 GB VRAM at Q4).
- **Vision:** `qwen2.5vl:7b` — Qwen2.5-VL class. Multimodal, JSON capable, suitable for vehicle
  detection/classification/quality. Kept independently configurable from the text model.

Both are pulled manually (`ollama pull …`); the app **never downloads models at startup**.

---

## 4. Structured vehicle extraction (contract preservation)

`generateStructured<T>()` promises:

- requests JSON output (`format: 'json'`);
- robust parse (`extractJson` handles bare JSON and fenced blocks);
- **controlled retry** (bounded `AI_MAX_RETRIES`, small exponential backoff) on transient
  failures or non-object output;
- optional zod **schema validation / coercion** at the pipeline boundary
  (`vehicleExtractedDataSchema`, `generatedContentSchema` in `server/ai/schemas.ts`);
- throws typed provider errors → existing intake path already turns this into
  `PROCESSING_FAILED` + audit + preserved message + retryable state (no corrupt records).

`normalizeExtraction` (FIELD_MAP, provenance, confidence, `unknown`) is **unchanged**; content
generation, missing-field questions, and the `READY_FOR_REVIEW` workflow are unchanged.

## 5. Conversation memory

Nothing changes structurally: webhook → `getOrCreateConversation(fromPhone)`,
`persistInboundMessage(externalId)` (idempotent), `runIntake` looks up
`getVehicleDraftByConversation(conversationId)` and **merges** into the existing draft
(`existing` + `lockedFields` passed to extraction). Multiple messages therefore converge on
**one** vehicle draft; the provider simply receives the accumulated transcript via
`buildTranscript` (ordered, sender-labelled). Provenance/confidence/missing-field state are
carried by the existing merge logic, not by the provider.

## 6. Missing information

Deterministic `computeCompletion` (config-driven `REQUIRED_FOR_PUBLISH` / `DESIRED_FIELDS`)
already decides *what* to ask and only asks for absent fields (bounded by
`followUpMaxQuestions`). Provider role is limited to extraction; follow-up content is built by
the application, so repeated asking for supplied fields is impossible by construction.

## 7. Prompt-injection defense

- Seller messages, documents, OCR text, and descriptions are passed to the provider as
  **untrusted payload in the `prompt` (user) slot**, never in the `system` slot.
- Hard rules (never fabricate, treat messages as data, output JSON schema) live in the `system`
  slot which user content cannot replace.
- Publishing requires `READY_FOR_REVIEW` → human approve; model output can never move a draft
  to `APPROVED`/`PUBLISHED` (state machine `assertTransition` is the authority).
- Post-response sanitizers whitelist fields; zod validation rejects arbitrary shapes, so
  malformed output cannot create arbitrary DB fields.

## 8. Vision / image understanding

`analyzeImage()` is wired into `classifyAndAnalyze` with the **same contract and offline
fallback**: vision available → real pixels sent to the vision model; unavailable → heuristic
classification + quality flags (never fabricated). Visual inference is stored as
provenance `image_detection` at `medium` confidence where the pipeline supports it and is never
elevated to confirmed facts (no registration/mileage/price/VIN claims from a photo — the
extraction agent only merges `image_detection` text into `unknown`/inference as before).

## 9. Image editing is a separate concern

The current implementation performs **no pixel editing**: `variants` map every URL to the
original (documented placeholder for a future dedicated image-processing provider). This
migration keeps that separation — the vision model only *understands*, it never *edits*.

## 10. Failure handling & performance

- Provider timeouts (`AI_REQUEST_TIMEOUT_MS` via `AbortController`), bounded retries with
  backoff, and a concurrency cap (`AI_MAX_CONCURRENCY`).
- Intake already runs **fire-and-forget** after the webhook acks 200, so large vision runs
  never block the webhook.
- Provider failure: intake marks the message error (`bumpProcessingAttempt`, `last_error`),
  draft → `PROCESSING_FAILED` (or keeps partial INCOMPLETE state), everything is preserved and
  retryable, and the AI-ops status surfaces provider availability + last error.

## 11. Development requirements

- Ollama installed and running on `localhost:11434`.
- `ollama pull qwen2.5:7b` and `ollama pull qwen2.5vl:7b`.
- `.env`: `AI_PROVIDER=ollama`, `OLLAMA_BASE_URL`, `OLLAMA_MODEL`, `OLLAMA_VISION_MODEL`
  (rest of the stack: Supabase/Supabase stubs, no Gemini key required).
- See `docs/LOCAL_AI_SETUP.md` for the full runbook.

## 12. Production deployment requirements (critical)

**Vercel/serverless cannot reach `localhost:11434`.** Two modes are documented:

```
DEVELOPMENT                       PRODUCTION
Developer machine                 Vercel / Application
 ├── Application                          │
 └── Ollama (localhost:11434)             ▼
                    Private / secured network endpoint (TLS, allowlisted, auth)
                                        ▼
                           Dedicated AI inference server (Ollama + local models)
```

- `OLLAMA_BASE_URL` points at the private inference endpoint in production (no hardcoded
  localhost).
- Ollama must **not** be exposed publicly; protect with network controls/allowlist/TLS.
- Health + ready states are exposed via `/api/ai/status` (admin-authenticated) and a
  non-blocking summary in `/api/health`; no secrets are ever returned.

---

## Migration checklist (what this change does)

- [x] Audit + this document.
- [x] `AIProvider` interface + central config.
- [x] `OllamaProvider` implementation.
- [x] Facade `server/ai/ai.ts` replaces `server/ai/gemini.ts` (deleted).
- [x] Call sites (extraction/content/validation/images/audio + `/api/admin/generate-description`) on the facade.
- [x] Provider health states in `/api/ai/status` + `/api/health`; UI card updated.
- [x] E2E harness mocks the provider boundary (deterministic, no local Ollama required).
- [x] Ollama provider unit tests (parse, invalid JSON, retry, selection, config, unavailable, vision, injection boundary).
- [x] Gemini dependency removed (`@google/genai`, `GEMINI_API_KEY`, hardcoded models).
- [x] `docs/LOCAL_AI_SETUP.md` + `docs/LOCAL_AI_FINAL_AUDIT.md`.
- [x] Regression: `npm test`, `npm run lint`, `npm run build`, production E2E.