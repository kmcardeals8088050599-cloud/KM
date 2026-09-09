-- KM Car Deals — AI Vehicle System Schema (ADDITIVE)
-- Run AFTER supabase-schema.sql in the Supabase SQL editor.
-- These tables are purely additive; existing tables are untouched.
-- Never destructive. Rollback = stop using these tables/routes.

-- Queue-worker / job bookkeeping (lightweight, DB-backed)
CREATE TABLE IF NOT EXISTS vehicle_drafts (
  id TEXT PRIMARY KEY DEFAULT 'vd-' || extract(epoch from now()) || '-' || substr(md5(random()::text), 1, 6),
  conversation_id TEXT,
  state TEXT NOT NULL DEFAULT 'RECEIVED',
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  confidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  locked_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  source TEXT NOT NULL DEFAULT 'whatsapp',
  seller_name TEXT,
  seller_phone TEXT,
  seller_id TEXT,
  dealer_id TEXT,
  content JSONB,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  documents JSONB NOT NULL DEFAULT '[]'::jsonb,
  publish_result JSONB,
  published_car_id TEXT,
  error JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ,
  sold_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_vehicle_drafts_state ON vehicle_drafts(state);
CREATE INDEX IF NOT EXISTS idx_vehicle_drafts_conversation ON vehicle_drafts(conversation_id);

-- WhatsApp conversations (session manager)
CREATE TABLE IF NOT EXISTS whatsapp_conversations (
  id TEXT PRIMARY KEY DEFAULT 'conv-' || extract(epoch from now()) || '-' || substr(md5(random()::text), 1, 6),
  external_phone TEXT NOT NULL,
  participant_type TEXT NOT NULL DEFAULT 'seller',
  state TEXT NOT NULL DEFAULT 'idle',
  vehicle_draft_id TEXT,
  last_activity TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_phone ON whatsapp_conversations(external_phone);

-- WhatsApp messages (inbound events, idempotency by external_id)
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id TEXT PRIMARY KEY DEFAULT 'msg-' || extract(epoch from now()) || '-' || substr(md5(random()::text), 1, 6),
  external_id TEXT UNIQUE NOT NULL,
  conversation_id TEXT,
  from_phone TEXT NOT NULL,
  type TEXT NOT NULL,
  text TEXT DEFAULT '',
  media JSONB NOT NULL DEFAULT '[]'::jsonb,
  role TEXT NOT NULL DEFAULT 'from',
  processed BOOLEAN NOT NULL DEFAULT false,
  processing_attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_external ON whatsapp_messages(external_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_conversation ON whatsapp_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_processed ON whatsapp_messages(processed);

-- Audit trail (every AI action)
CREATE TABLE IF NOT EXISTS vehicle_audit_log (
  id TEXT PRIMARY KEY DEFAULT 'aud-' || extract(epoch from now()) || '-' || substr(md5(random()::text), 1, 6),
  actor TEXT NOT NULL,
  actor_type TEXT NOT NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  old_value JSONB,
  new_value JSONB,
  source TEXT,
  request_id TEXT,
  conversation_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_vehicle_audit_entity ON vehicle_audit_log(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_audit_created ON vehicle_audit_log(created_at);

-- AI usage / cost tracking
CREATE TABLE IF NOT EXISTS ai_usage_log (
  id TEXT PRIMARY KEY DEFAULT 'aiu-' || extract(epoch from now()) || '-' || substr(md5(random()::text), 1, 6),
  entity TEXT,
  entity_id TEXT,
  agent TEXT,
  model TEXT,
  event TEXT,
  status TEXT,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  duration_ms INTEGER,
  conversation_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_usage_entity ON ai_usage_log(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created ON ai_usage_log(created_at);

-- Publish log (per-channel, independent)
CREATE TABLE IF NOT EXISTS publish_log (
  id TEXT PRIMARY KEY DEFAULT 'pub-' || extract(epoch from now()) || '-' || substr(md5(random()::text), 1, 6),
  vehicle_draft_id TEXT,
  car_id TEXT,
  channel TEXT NOT NULL,
  status TEXT NOT NULL,
  external_id TEXT,
  url TEXT,
  error TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  request_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_publish_log_draft ON publish_log(vehicle_draft_id);
CREATE INDEX IF NOT EXISTS idx_publish_log_channel ON publish_log(channel, status);

-- RLS: keep the same posture as existing tables.
-- These tables are backend-only (service role); no public reads.
ALTER TABLE vehicle_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE publish_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No public access to vehicle_drafts" ON vehicle_drafts FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "No public access to whatsapp_conversations" ON whatsapp_conversations FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "No public access to whatsapp_messages" ON whatsapp_messages FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "No public access to vehicle_audit_log" ON vehicle_audit_log FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "No public access to ai_usage_log" ON ai_usage_log FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "No public access to publish_log" ON publish_log FOR ALL USING (false) WITH CHECK (false);