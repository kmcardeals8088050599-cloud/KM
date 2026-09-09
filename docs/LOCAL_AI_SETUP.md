# LOCAL AI SETUP — Ollama Runbook

How to run the AI pipeline locally with a provider-agnostic provider (default: **Ollama**).
No Google cloud key required anywhere.

---

## 1. Install Ollama

| OS | Command / URL |
|---|---|
| Windows | `winget install Ollama.Ollama` or https://ollama.com/download |
| macOS | `brew install ollama` or DMG from https://ollama.com/download |
| Linux | `curl -fsSL https://ollama.com/install.sh | sh` |

Verify the daemon is running:

```bash
ollama serve   # starts if not already running (Windows app does this in the tray)
ollama list    # should print an empty table or your pulled models
```

## 2. Pull the models

```bash
ollama pull qwen2.5:7b      # text / structured extraction
ollama pull qwen2.5vl:7b    # vision (multimodal) classification
```

The application **never downloads models at startup** — pull them manually.
You can substitute any compatible model by overriding the env vars (see §4).

> Vision is optional. If `OLLAMA_VISION_MODEL` is left empty, image classification
> falls back to the deterministic heuristic pipeline (with a warning) and
> `/api/ai/status` reports `aiVisionModelAvailable: false`. Text extraction keeps working.

## 3. Configure the environment

Your `.env` (mirrors `.env.example`):

```dotenv
# Local AI provider (no cloud key)
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b
OLLAMA_VISION_MODEL=qwen2.5vl:7b
AI_REQUEST_TIMEOUT_MS=120000
AI_MAX_RETRIES=2
AI_MAX_CONCURRENCY=4
```

Nothing reads `GEMINI_API_KEY` anymore. Unset `AI_PROVIDER` → the default `ollama` is used.

## 4. Run the app

```bash
npm install
npm run dev          # server on the configured port, Vite dev server for the admin UI
```

Smoke-check AI readiness:

```bash
# admin-authenticated
curl -H "Authorization: Bearer <token>" http://localhost:<port>/api/ai/status
```

Expected AI fields:

```json
{
  "aiProvider": "ollama",
  "aiProviderConfigured": true,
  "aiProviderAvailable": true,
  "aiModelAvailable": true,
  "aiVisionModelAvailable": true
}
```

`aiProviderAvailable` reflects a live `GET /api/tags` check against
`OLLAMA_BASE_URL`. If `aiModelAvailable` is false, pull the model:
`ollama pull qwen2.5:7b`.

## 5. End-to-end (local) verification

The test suite is fully hermetic — it stubs the provider at the module boundary and needs
**no** Ollama running:

```bash
npm test              # 80 tests: unit + provider + full E2E flow over real HTTP
npm run lint          # tsc --noEmit
npm run build         # vite + esbuild server bundle
```

## 6. Provider configuration reference

| Variable | Default | Meaning |
|---|---|---|
| `AI_PROVIDER` | `ollama` | Provider id (registry in `server/ai/provider/index.ts`). Unknown → config error surfaced in AI Ops |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama HTTP endpoint (trailing slashes stripped) |
| `OLLAMA_MODEL` | `qwen2.5:7b` | Text / structured-reasoning model |
| `OLLAMA_VISION_MODEL` | `qwen2.5vl:7b` | Vision model; empty → vision unavailable (heuristic fallback) |
| `AI_REQUEST_TIMEOUT_MS` | `120000` | Per-request timeout (AbortController) |
| `AI_MAX_RETRIES` | `2` | Retries on transient errors / malformed output |
| `AI_MAX_CONCURRENCY` | `4` | Max concurrent AI requests from this process |

## 7. Production deployment

**Vercel/serverless cannot reach `localhost`.** Point `OLLAMA_BASE_URL` at a private,
secured inference endpoint (TLS, allowlisted, authenticated) running Ollama — never expose
Ollama publicly. Health and availability are exposed via `/api/ai/status` and `/api/health`;
no secrets are ever returned.