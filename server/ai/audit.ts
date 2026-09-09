// Audit trail + AI usage logging.
// Every AI action is recorded; no direct writes.

import { supabase } from '../supabase.js';
import { generateId } from '../db.js';
import type { AuditEntry, AiUsageEntry } from '../../src/types/ai.js';

// ---------------------------------------------------------------------------
// Audit trail
// ---------------------------------------------------------------------------

export async function appendAudit(entry: {
  actor: string;
  actorType: string;
  action: string;
  entity: string;
  entityId: string;
  oldValue?: unknown;
  newValue?: unknown;
  source: string;
  requestId?: string;
  conversationId?: string;
}): Promise<AuditEntry> {
  const id = generateId('aud');
  const row = {
    id,
    actor: entry.actor,
    actor_type: entry.actorType,
    action: entry.action,
    entity: entry.entity,
    entity_id: entry.entityId,
    old_value: entry.oldValue != null ? JSON.stringify(entry.oldValue) : null,
    new_value: entry.newValue != null ? JSON.stringify(entry.newValue) : null,
    source: entry.source,
    request_id: entry.requestId || null,
    conversation_id: entry.conversationId || null,
    created_at: new Date().toISOString(),
  };
  const { error } = await supabase.from('vehicle_audit_log').insert(row);
  if (error) {
    console.error('[AUDIT] Failed to write audit entry:', error.message);
  }
  return {
    id,
    actor: entry.actor,
    actorType: entry.actorType,
    action: entry.action,
    entity: entry.entity,
    entityId: entry.entityId,
    oldValue: entry.oldValue,
    newValue: entry.newValue,
    source: entry.source,
    requestId: entry.requestId,
    conversationId: entry.conversationId,
    createdAt: row.created_at,
  };
}

// Helper to track a field change with full provenance.
export async function auditFieldChange(
  vehicleDraftId: string,
  field: string,
  oldValue: unknown,
  newValue: unknown,
  actor: string,
  actorType: string,
  source: string,
  conversationId?: string,
  requestId?: string
): Promise<void> {
  await appendAudit({
    actor,
    actorType,
    action: `field_changed:${field}`,
    entity: 'vehicle_draft',
    entityId: vehicleDraftId,
    oldValue,
    newValue,
    source,
    conversationId,
    requestId,
  });
}

// ---------------------------------------------------------------------------
// AI usage tracking
// ---------------------------------------------------------------------------

export async function logAiUsage(entry: {
  entity: string;
  entityId: string;
  agent: string;
  model: string;
  event: string;
  status: 'ok' | 'error';
  promptTokens?: number;
  completionTokens?: number;
  durationMs: number;
  conversationId?: string;
}): Promise<AiUsageEntry> {
  const id = generateId('aiu');
  const row = {
    id,
    entity: entry.entity,
    entity_id: entry.entityId,
    agent: entry.agent,
    model: entry.model,
    event: entry.event,
    status: entry.status,
    prompt_tokens: entry.promptTokens || null,
    completion_tokens: entry.completionTokens || null,
    duration_ms: entry.durationMs,
    conversation_id: entry.conversationId || null,
    created_at: new Date().toISOString(),
  };
  const { error } = await supabase.from('ai_usage_log').insert(row);
  if (error) console.error('[AI USAGE] Failed to log:', error.message);
  return {
    id,
    entity: entry.entity,
    entityId: entry.entityId,
    agent: entry.agent,
    model: entry.model,
    event: entry.event,
    status: entry.status,
    promptTokens: entry.promptTokens,
    completionTokens: entry.completionTokens,
    durationMs: entry.durationMs,
    conversationId: entry.conversationId,
    createdAt: row.created_at,
  };
}
