// Production configuration guard — fail fast when a deployment would boot with
// development fallbacks or unreachable/over-permissive settings.
//
// Only enforced when NODE_ENV === 'production' (Vercel sets this automatically;
// local dev and the hermetic test suite run with NODE_ENV=test and are unaffected).

const DEV_JWT_SECRET = 'km_car_deals_jwt_secret_change_in_production_2026';
const JWT_PLACEHOLDER = 'change-this-to-a-strong-random-secret';
const DEV_ADMIN_PASSWORD = 'kmadmin2026';

export interface ProductionConfigReport {
  errors: string[];
  warnings: string[];
  production: boolean;
}

function isProduction(env: NodeJS.ProcessEnv): boolean {
  return (env.NODE_ENV || '').trim().toLowerCase() === 'production';
}

function isLocalhostHost(host: string): boolean {
  const h = host.trim().toLowerCase();
  return h === 'localhost' || h === '127.0.0.1' || h === '::1' || h === '[::1]' || h === '0.0.0.0';
}

function ollamaHost(env: NodeJS.ProcessEnv): string {
  const raw = (env.OLLAMA_BASE_URL || '').trim() || 'http://localhost:11434';
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `http://${raw}`);
    return url.hostname;
  } catch {
    return raw;
  }
}

/** Collect every production misconfiguration without throwing (for tests/UI). */
export function collectProductionMisconfig(env: NodeJS.ProcessEnv = process.env): ProductionConfigReport {
  const production = isProduction(env);
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!production) return { errors, warnings, production };

  const jwt = (env.JWT_SECRET || '').trim();
  if (!jwt || jwt === DEV_JWT_SECRET || jwt === JWT_PLACEHOLDER || jwt.length < 32) {
    errors.push(
      'JWT_SECRET must be set to a strong random secret (>= 32 chars) in production. ' +
        'The development fallback and .env.example placeholder are refused.'
    );
  }

  const adminPassword = (env.ADMIN_PASSWORD || '').trim();
  if (!adminPassword || adminPassword === DEV_ADMIN_PASSWORD || adminPassword.length < 8) {
    errors.push(
      'ADMIN_PASSWORD must be set to a strong password (>= 8 chars, not the default "kmadmin2026").'
    );
  }

  const baseUrl = (env.OLLAMA_BASE_URL || '').trim() || 'http://localhost:11434';
  if (isLocalhostHost(ollamaHost(env))) {
    errors.push(
      `OLLAMA_BASE_URL (${baseUrl}) points at a localhost host, which is unreachable from any production host. ` +
        'Set it to a private, secured inference endpoint (TLS, allowlisted).'
    );
  }

  const origin = (env.ALLOWED_ORIGIN || '').trim();
  if (!origin || origin === '*') {
    errors.push(
      'ALLOWED_ORIGIN must be your deployed origin (e.g. https://kmcardeals.in). Wildcard CORS is refused in production.'
    );
  }

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    errors.push('SUPABASE_URL and SUPABASE_SERVICE_KEY are required in production.');
  }

  const requiredForWhatsApp = ['WHATSAPP_VERIFY_TOKEN', 'WHATSAPP_ACCESS_TOKEN', 'WHATSAPP_PHONE_NUMBER_ID'];
  for (const key of requiredForWhatsApp) {
    if (!env[key]) warnings.push(`${key} is missing — inbound/outbound WhatsApp will not work.`);
  }
  if (!env.WHATSAPP_ADMIN_PHONE) {
    warnings.push('WHATSAPP_ADMIN_PHONE is missing — no admin notifications/commands on WhatsApp.');
  }
  if (!env.BLOB_READ_WRITE_TOKEN) {
    warnings.push('BLOB_READ_WRITE_TOKEN is missing — image/media uploads to Vercel Blob will fail.');
  }

  return { errors, warnings, production };
}

/** Refuse to boot the application when the production config is unsafe or unreachable. */
export function assertProductionConfig(env: NodeJS.ProcessEnv = process.env): void {
  if (!isProduction(env)) return;
  const report = collectProductionMisconfig(env);
  for (const warning of report.warnings) {
    console.warn(`[PROD] ${warning}`);
  }
  if (report.errors.length > 0) {
    throw new Error(
      `Refusing to start in production — fix these first:\n` +
        report.errors.map(e => `  - ${e}`).join('\n') +
        `\nSee docs/PRODUCTION_DEPLOYMENT.md for the full runbook.`
    );
  }
}