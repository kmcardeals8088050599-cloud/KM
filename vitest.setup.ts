// Vitest global setup: provide placeholder env so module-level clients can
// construct (server/supabase.ts throws when SUPABASE_URL is empty).
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
process.env.SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'test-service-key';