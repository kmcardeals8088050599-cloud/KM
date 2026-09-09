// Lightweight queue/worker status — DB-backed.
//
// The repo has no Redis/queue infra and deploys to Vercel serverless. Wrong jobs are tracked
// in `whatsapp_messages` (processed flag, processing_attempts, last_error) instead.
// This module reports that state for the admin AI-ops view. If a real queue (Redis/BullMQ)
// is added later, this function is the single swap point.

import { supabase } from '../supabase.js';

export interface QueueSummary {
  pending: number;
  processing: number;
  failed: number;
  deadLetter: number;
}

export async function getRedisBackedQueueSummary(): Promise<QueueSummary> {
  const [pending, failed, dead] = await Promise.all([
    supabase.from('whatsapp_messages').select('id', { count: 'exact', head: true }).eq('processed', false).is('last_error', null).lte('processing_attempts', 4).limit(1),
    supabase.from('whatsapp_messages').select('id', { count: 'exact', head: true }).eq('processed', false).not('last_error', 'is', null).lte('processing_attempts', 4).limit(1),
    supabase.from('whatsapp_messages').select('id', { count: 'exact', head: true }).gte('processing_attempts', 5).limit(1),
  ]);

  return {
    pending: pending.count ?? 0,
    processing: 0,
    failed: failed.count ?? 0,
    deadLetter: dead.count ?? 0,
  };
}