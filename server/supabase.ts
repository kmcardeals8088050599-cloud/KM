import { createClient, SupabaseClient } from '@supabase/supabase-js';

let clientPromise: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (clientPromise) return clientPromise;

  const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
  const supabaseServiceKey = (process.env.SUPABASE_SERVICE_KEY || '').trim();

  if (!supabaseUrl || !supabaseServiceKey) {
    // The production boot guard (server/prod-guards.ts) refuses to start when these
    // are missing — this error only surfaces on a genuinely unhandled path.
    throw new Error(
      '[SUPABASE] Missing SUPABASE_URL or SUPABASE_SERVICE_KEY. ' +
        'Set them via .env (dev) / Vercel env vars (production); the production boot guard enforces them first.'
    );
  }

  // Server-side client using service_role key (bypasses RLS for admin operations)
  clientPromise = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return clientPromise;
}

// Lazily-initialized client: no module-load side effects, so a misconfigured
// environment fails with the boot guard's clear message instead of an import-time crash.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver);
  },
});