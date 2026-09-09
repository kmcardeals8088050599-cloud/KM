import { describe, it, expect, afterEach } from 'vitest';
import { collectProductionMisconfig, assertProductionConfig } from '../prod-guards.js';

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

function goodEnv(): NodeJS.ProcessEnv {
  return {
    NODE_ENV: 'production',
    JWT_SECRET: 'x'.repeat(48),
    ADMIN_PASSWORD: 'sTr0ng-Pa55word!',
    OLLAMA_BASE_URL: 'https://ai.internal.example.com:443',
    ALLOWED_ORIGIN: 'https://kmcardeals.in',
    SUPABASE_URL: 'https://xyz.supabase.co',
    SUPABASE_SERVICE_KEY: 'service-role-key',
    WHATSAPP_VERIFY_TOKEN: 'verify',
    WHATSAPP_ACCESS_TOKEN: 'token',
    WHATSAPP_PHONE_NUMBER_ID: '123',
    BLOB_READ_WRITE_TOKEN: 'blob',
  };
}

describe('collectProductionMisconfig', () => {
  it('is a no-op outside production (dev/test must keep working)', () => {
    const report = collectProductionMisconfig({ ...goodEnv(), NODE_ENV: 'test', ALLOWED_ORIGIN: '*', OLLAMA_BASE_URL: 'http://localhost:11434' });
    expect(report.production).toBe(false);
    expect(report.errors).toEqual([]);
  });

  it("flags every dev fallback in production: JWT_SECRET, ADMIN_PASSWORD, localhost Ollama, wildcard CORS, missing Supabase", () => {
    const report = collectProductionMisconfig({
      NODE_ENV: 'production',
      ALLOWED_ORIGIN: '*',
    });

    const joined = report.errors.join('\n');
    expect(report.errors.length).toBe(5);
    expect(joined).toContain('JWT_SECRET');
    expect(joined).toContain('ADMIN_PASSWORD');
    expect(joined).toContain('OLLAMA_BASE_URL');
    expect(joined).toContain('ALLOWED_ORIGIN');
    expect(joined).toContain('SUPABASE_URL');
  });

  it('rejects the .env.example JWT placeholder and the short default admin password', () => {
    const report = collectProductionMisconfig({
      ...goodEnv(),
      JWT_SECRET: 'change-this-to-a-strong-random-secret',
      ADMIN_PASSWORD: 'kmadmin2026',
    });
    const joined = report.errors.join('\n');
    expect(joined).toContain('JWT_SECRET');
    expect(joined).toContain('ADMIN_PASSWORD');
  });

  it.each(['http://localhost:11434', 'http://127.0.0.1:11434', 'http://[::1]:11434'])(
    'refuses localhost AI endpoint %s in production',
    baseUrl => {
      const report = collectProductionMisconfig({ ...goodEnv(), OLLAMA_BASE_URL: baseUrl });
      expect(report.errors.join('\n')).toContain('OLLAMA_BASE_URL');
    }
  );

  it('accepts a fully configured production env', () => {
    const report = collectProductionMisconfig(goodEnv());
    expect(report.errors).toEqual([]);
    expect(report.production).toBe(true);
  });

  it('warns (without failing) on missing WhatsApp/Blob optional wiring', () => {
    const report = collectProductionMisconfig({ ...goodEnv(), WHATSAPP_VERIFY_TOKEN: '', WHATSAPP_ADMIN_PHONE: '', BLOB_READ_WRITE_TOKEN: '' });
    expect(report.errors).toEqual([]);
    expect(report.warnings.some(w => w.includes('WHATSAPP_VERIFY_TOKEN'))).toBe(true);
    expect(report.warnings.some(w => w.includes('WHATSAPP_ADMIN_PHONE'))).toBe(true);
    expect(report.warnings.some(w => w.includes('BLOB_READ_WRITE_TOKEN'))).toBe(true);
  });
});

describe('assertProductionConfig', () => {
  it('throws a detailed, actionable error in production when misconfigured', () => {
    expect(() => assertProductionConfig({ NODE_ENV: 'production', ALLOWED_ORIGIN: '*' })).toThrow(
      /Refusing to start in production/
    );
  });

  it('is silent with a valid production config', () => {
    expect(() => assertProductionConfig(goodEnv())).not.toThrow();
  });

  it('is a no-op when NODE_ENV is not production', () => {
    expect(() => assertProductionConfig({ NODE_ENV: 'development', ALLOWED_ORIGIN: '*' })).not.toThrow();
  });
});