<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js

The AI pipeline is provider-agnostic and defaults to a **local Ollama** server
(after the Gemini → local-AI migration; see `docs/LOCAL_AI_MIGRATION.md`).

1. Install dependencies:
   `npm install`
2. Set up local AI (or any `AI_PROVIDER` you register):
   - Install Ollama and pull the models (`qwen2.5:7b` text, `qwen2.5vl:7b` vision),
     or point `OLLAMA_BASE_URL` at your inference server — see `docs/LOCAL_AI_SETUP.md`.
   - No `GEMINI_API_KEY` is required. Copy `.env.example` to `.env`; at minimum set
     `SUPABASE_URL`/`SUPABASE_SERVICE_KEY`/`JWT_SECRET`/`ADMIN_PASSWORD` plus the
     WhatsApp variables for real messaging.
3. Run the app:
   `npm run dev`

Run the hermetic test suite, typecheck, and build:

```bash
npm test
npm run lint
npm run build
```

See `docs/LOCAL_AI_FINAL_AUDIT.md` for the migration audit + gate results.

## Deploying to production

Follow `docs/PRODUCTION_DEPLOYMENT.md` in order — it covers the Ollama inference host
(AI must not point at localhost), Supabase, Meta WhatsApp webhook, secrets, and the
10-minute go-live dry run. In production the app **refuses to boot** with default
`JWT_SECRET`/`ADMIN_PASSWORD`, wildcard CORS, a localhost AI endpoint, or missing Supabase
credentials (`server/prod-guards.ts`).
