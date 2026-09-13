# KM CAR DEALS — PRODUCTION DEPLOYMENT RUNBOOK

Everything required to take the AI vehicle platform live. The code is hardened and gated,
but the steps below touch services only you can create/configure. Follow them in order.

---

## 0. What "production ready" already means in code

- **Fail-fast config guard** (`server/prod-guards.ts`): with `NODE_ENV=production`, the app
  **refuses to boot** if `JWT_SECRET`/`ADMIN_PASSWORD` are dev defaults, `OLLAMA_BASE_URL`
  points at localhost, CORS is wildcard, or Supabase credentials are missing. Missing
  WhatsApp/Instagram/Blob wiring logs warnings (features degrade) but does not block boot.
- Rate limits on login (10/15min), API (100/min), uploads (30/15min); `helmet` headers;
  5 MB JSON bodies; `trust proxy` behind Vercel so rate limiters see real client IPs.
- Webhook idempotency, JWT auth, zod-validated AI output, human-approval publish gate,
  price private to admins, honest no-fake AI fallbacks. 91 hermetic tests.

> You cannot (and should not) skip a guard error — it exists to keep a misconfigured
> deployment from silently doing wrong things. Fix the listed env var and redeploy.

---

## 1. AI inference endpoint (Ollama) — first, because nothing works without it

Vercel/serverless **cannot** reach `localhost`. You need a reachable Ollama host.

| Option | Effort | Notes |
|---|---|---|
| Cheap VM (e.g. RunPod/Kamatera/OVH ~$20/mo, 16 GB RAM) + Ollama | Recommended | `ollama pull qwen2.5:7b` and `qwen2.5vl:7b`; run behind nginx with TLS + IP allowlist + a shared secret header (Ollama has no native auth) |
| Existing always-on server | Easiest if you have one | Same setup as above |
| Managed LLM proxy later | Future | The `AIProvider` registry makes swapping providers a code change, not a rearchitecture |

Minimal hardened Ollama service (systemd):
```
[Service]
ExecStart=/usr/local/bin/ollama serve
Environment="OLLAMA_HOST=127.0.0.1:11434"
Restart=always
```
Expose via nginx on a private hostname (`ai.kminternal.example.com`) with TLS and
`allow 1.2.3.4/32` style rules + a token header checked by a small proxy (e.g. `caddy
reverse-proxy { header_up X-LLM-Key {env.LLM_KEY} }`). **Never put Ollama on the public
internet unprotected.**

Set `OLLAMA_BASE_URL=https://ai.kminternal.example.com` (not localhost) or the boot guard will stop you.

## 2. Supabase

1. Create a project. Copy `Project URL` → `SUPABASE_URL` and `Settings → API → service_role`
   secret → `SUPABASE_SERVICE_KEY`.
2. Run `supabase-schema.sql` then `ai-schema.sql` in the SQL editor (both idempotent/additive).
3. `database:"connected"` on `/api/health` confirms success after deploy.

## 3. Meta WhatsApp (the front door)

1. Create/finalize the **WhatsApp Business App**, add the phone number to Cloud API.
2. Env vars from Meta: `WHATSAPP_ACCESS_TOKEN` (system user token),
   `WHATSAPP_PHONE_NUMBER_ID`, and your `WHATSAPP_VERIFY_TOKEN` (any random string you choose).
3. **After deploy**, register the webhook: in Meta → WhatsApp → Configuration, callback
   `https://<your-domain>/api/whatsapp/webhook`, verify token = `WHATSAPP_VERIFY_TOKEN`,
   subscribe to `messages`. Meta will GET-verify the handshake (returns `hub.challenge`).
4. `WHATSAPP_ADMIN_PHONE` = the number that gets notifications and can run admin commands.

> Until the webhook subscription is active, Meta will not deliver messages. Meta requires
> **HTTPS** — you must deploy first, then register the callback.

## 4. Optional channels

- **Instagram publishing**: `INSTAGRAM_ACCOUNT_ID` + `IG_USER_ACCESS_TOKEN` (a personal IG
  account connected via the Meta Business Suite with `instagram_content_publish`). If unset,
  publishing cleanly reports `skipped` — the website still works.
- **WhatsApp Business Catalogue**: `WHATSAPP_CATALOG_ID` (a Commerce-enabled WhatsApp Business
  account's catalog id) + `PUBLIC_SITE_URL` (your deployed site origin, used for the product
  link `/inventory/<carId>`). When set, each published car is pushed as a catalogue product via
  the official Meta Catalog API, idempotent on the car id (`retailer_id`). When unset, the
  channel reports an honest `skipped — not configured`; the website/Instagram channels are
  unaffected. The token must carry the `catalog_management` / WhatsApp Business Messaging scope.
- **WhatsApp Status**: intentionally **not** published. Meta's WhatsApp Business Cloud API
  exposes no Status endpoint, and this system never uses unofficial automation. Every publish
  records an honest `whatsapp_status: skipped (not supported by WhatsApp Cloud API)` entry
  rather than implying a post happened.
- **Vercel Blob** (media/photos): `BLOB_READ_WRITE_TOKEN` from your Vercel project.

## 5. Core secrets (boot guard enforces these)

```dotenv
NODE_ENV=production                    # Vercel sets this automatically
JWT_SECRET=<random, >= 32 chars>      # e.g. openssl rand -hex 32
ADMIN_PASSWORD=<strong, >= 8 chars>    # default "kmadmin2026" is REFUSED in prod
ALLOWED_ORIGIN=https://your-domain.in  # your actual deployed origin, never *
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...
OLLAMA_BASE_URL=https://ai.kminternal.example.com
OLLAMA_MODEL=qwen2.5:7b
OLLAMA_VISION_MODEL=qwen2.5vl:7b       # optional — empty disables vision politely
AI_REQUEST_TIMEOUT_MS=120000
AI_MAX_RETRIES=2
```

## 6. Deploy (Vercel)

1. Push to GitHub → import repo in Vercel (framework: **Vite**; build uses `vite build`;
   `vercel.json` routes `/api/*` to the server function and the rest to the SPA).
2. Add **every** env var above in Project → Settings → Environment Variables.
3. Deploy. Check in order:
   - `https://<domain>/api/health` → 200 `database:"connected"`
   - `https://<domain>/api/ai/status` (login as admin) → `aiProviderAvailable: true`,
     `aiModelAvailable: true`
4. Register the Meta webhook (step 3) once the domain is live.

## 7. Go-live verification (10-minute dry run)

1. Message your WhatsApp number: *"Toyota Fortuner 2022, 2.8 diesel automatic, 48,000 km,
   first owner"* + 2 photos.
2. Confirm the seller gets follow-up questions (if fields are missing) and your admin number
   gets the *"Draft Ready"* notification.
3. Log into `/admin` → AI Ops → approve the draft.
4. Confirm the car appears in **website catalogue**; confirmed **success** entries in
   publish log; **Instagram/WhatsApp** posted (if configured) — with **no price** in the copy.
5. Change the price in AI Ops → confirm it persists and locks; public site still shows no price.

## 8. Post-launch hygiene (required)

- Change the admin password after the first login (or set a fresh `ADMIN_PASSWORD` and redeploy).
- Verify `JWT_SECRET` is not the dev fallback (boot guard already refuses it).
- Confirm no test/stub image URLs leaked into the live `cars` table.
- Keep the Ollama host allowlisted/TLS'd; rotate the shared secret regularly.

---

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| Boot fails with "Refusing to start in production" | Guard found a dev fallback — see the listed var; set and redeploy |
| `aiProviderAvailable: false` | `OLLAMA_BASE_URL` unreachable from the server (not localhost); models not pulled on the host |
| Webhook "Unable to verify" in Meta | Wrong `WHATSAPP_VERIFY_TOKEN` or callback not HTTPS |
| Draft stuck `PROCESSING_FAILED` | AI call failed; check `/api/ai/status` `aiProviderError` and server logs |
| Instagram `skipped` | `INSTAGRAM_ACCOUNT_ID`/`IG_USER_ACCESS_TOKEN` missing or token lacks publish scope |
| Media uploads 500 | `BLOB_READ_WRITE_TOKEN` missing/expired |