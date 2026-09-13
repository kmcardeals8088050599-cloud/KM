// Data-access layer for the AI vehicle system tables.
// Follows existing conventions in server/db.ts: snake_case rows, camelCase app objects.

import { supabase } from '../supabase.js';
import { generateId } from '../db.js';
import type {
  VehicleDraftState,
  ParticipantType,
  FieldProvenanceMap,
  ConfidenceMap,
  VehicleExtractedData,
  GeneratedContent,
  PublishEntry,
  PublishChannel,
  PublishStatus,
  InboundMessage,
  MessageAttachment,
  AdminCommand,
} from '../../src/types/ai.js';

// ---------------------------------------------------------------------------
// Vehicle Draft
// ---------------------------------------------------------------------------

export interface VehicleDraft {
  id: string;
  conversationId?: string;
  state: VehicleDraftState;
  data: VehicleExtractedData;
  confidence: ConfidenceMap;
  provenance: FieldProvenanceMap;
  lockedFields: string[];
  source?: string;
  sellerName?: string;
  sellerPhone?: string;
  sellerId?: string;
  dealerId?: string;
  content?: GeneratedContent;
  images?: any[];
  documents?: any[];
  publishResult?: { entries: PublishEntry[] };
  publishedCarId?: string;
  error?: any;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  soldAt?: string;
}

function rowToDraft(row: any): VehicleDraft {
  return {
    id: row.id,
    conversationId: row.conversation_id || undefined,
    state: row.state as VehicleDraftState,
    data: row.data || {},
    confidence: row.confidence || {},
    provenance: row.provenance || {},
    lockedFields: row.locked_fields || [],
    source: row.source || undefined,
    sellerName: row.seller_name || undefined,
    sellerPhone: row.seller_phone || undefined,
    sellerId: row.seller_id || undefined,
    dealerId: row.dealer_id || undefined,
    content: row.content || undefined,
    images: row.images || [],
    documents: row.documents || [],
    publishResult: row.publish_result || undefined,
    publishedCarId: row.published_car_id || undefined,
    error: row.error || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at || undefined,
    soldAt: row.sold_at || undefined,
  };
}

export const DRAFT_FIELDS = [
  'id',
  'conversation_id',
  'state',
  'data',
  'confidence',
  'provenance',
  'locked_fields',
  'source',
  'seller_name',
  'seller_phone',
  'seller_id',
  'dealer_id',
  'content',
  'images',
  'documents',
  'publish_result',
  'published_car_id',
  'error',
  'created_at',
  'updated_at',
];

export async function draftToRow(draft: Partial<VehicleDraft>): Promise<Record<string, any>> {
  const row: Record<string, any> = {};
  if (draft.conversationId !== undefined) row.conversation_id = draft.conversationId;
  if (draft.state !== undefined) row.state = draft.state;
  if (draft.data !== undefined) row.data = draft.data;
  if (draft.confidence !== undefined) row.confidence = draft.confidence;
  if (draft.provenance !== undefined) row.provenance = draft.provenance;
  if (draft.lockedFields !== undefined) row.locked_fields = draft.lockedFields;
  if (draft.source !== undefined) row.source = draft.source;
  if (draft.sellerName !== undefined) row.seller_name = draft.sellerName;
  if (draft.sellerPhone !== undefined) row.seller_phone = draft.sellerPhone;
  if (draft.sellerId !== undefined) row.seller_id = draft.sellerId;
  if (draft.dealerId !== undefined) row.dealer_id = draft.dealerId;
  if (draft.content !== undefined) row.content = draft.content;
  if (draft.images !== undefined) row.images = draft.images;
  if (draft.documents !== undefined) row.documents = draft.documents;
  if (draft.publishResult !== undefined) row.publish_result = draft.publishResult;
  if (draft.publishedCarId !== undefined) row.published_car_id = draft.publishedCarId;
  if (draft.error !== undefined) row.error = draft.error;
  if (draft.publishedAt !== undefined) row.published_at = draft.publishedAt;
  if (draft.soldAt !== undefined) row.sold_at = draft.soldAt;
  return row;
}

export async function createVehicleDraft(input: {
  conversationId?: string;
  state: VehicleDraftState;
  data?: VehicleExtractedData;
  source?: string;
  sellerName?: string;
  sellerPhone?: string;
  sellerId?: string;
  dealerId?: string;
}): Promise<VehicleDraft> {
  const id = generateId('vd');
  const now = new Date().toISOString();
  const row = {
    id,
    conversation_id: input.conversationId || null,
    state: input.state,
    data: input.data || {},
    confidence: {},
    provenance: {},
    locked_fields: [],
    source: input.source || 'whatsapp',
    seller_name: input.sellerName || null,
    seller_phone: input.sellerPhone || null,
    seller_id: input.sellerId || null,
    dealer_id: input.dealerId || null,
    content: null,
    images: [],
    documents: [],
    publish_result: null,
    published_car_id: null,
    error: null,
    created_at: now,
    updated_at: now,
  };
  const { data, error } = await supabase.from('vehicle_drafts').insert(row).select().single();
  if (error) throw new Error(`Failed to create vehicle draft: ${error.message}`);
  return rowToDraft(data);
}

// Find-or-create a draft for a conversation. The id is deterministic on the
// conversation so concurrent intakes converge on one draft row (PK conflicts
// fall back to the already-created row instead of creating duplicates).
export async function getOrCreateDraftForConversation(
  conversationId: string,
  input: Omit<Parameters<typeof createVehicleDraft>[0], 'id' | 'conversationId'>
): Promise<VehicleDraft> {
  const existing = await getVehicleDraftByConversation(conversationId);
  if (existing) return existing;

  const id = `vd-${conversationId}`;
  const now = new Date().toISOString();
  const row = {
    id,
    conversation_id: conversationId,
    state: input.state,
    data: input.data || {},
    confidence: {},
    provenance: {},
    locked_fields: [],
    source: input.source || 'whatsapp',
    seller_name: input.sellerName || null,
    seller_phone: input.sellerPhone || null,
    seller_id: input.sellerId || null,
    dealer_id: input.dealerId || null,
    content: null,
    images: [],
    documents: [],
    publish_result: null,
    published_car_id: null,
    error: null,
    created_at: now,
    updated_at: now,
  };
  const { data, error } = await supabase.from('vehicle_drafts').insert(row).select().single();
  if (!error) return rowToDraft(data);

  if (error.code === '23505' || /duplicate key/i.test(error.message || '')) {
    const retry = await getVehicleDraftByConversation(conversationId);
    if (retry) return retry;
  }
  throw new Error(`Failed to create vehicle draft: ${error.message}`);
}

export async function getVehicleDraft(id: string): Promise<VehicleDraft | null> {
  const { data, error } = await supabase
    .from('vehicle_drafts')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return rowToDraft(data);
}

export async function getVehicleDraftByConversation(conversationId: string): Promise<VehicleDraft | null> {
  const { data, error } = await supabase
    .from('vehicle_drafts')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(1);
  if (error || !data || data.length === 0) return null;
  return rowToDraft(data[0]);
}

export async function listVehicleDrafts(opts?: {
  state?: VehicleDraftState | 'all';
  limit?: number;
  offset?: number;
}): Promise<VehicleDraft[]> {
  let query = supabase.from('vehicle_drafts').select('*');
  if (opts?.state && opts.state !== 'all') {
    query = query.eq('state', opts.state);
  }
  query = query
    .order('created_at', { ascending: false })
    .limit(opts?.limit || 100)
    .range(opts?.offset || 0, (opts?.offset || 0) + (opts?.limit || 100) - 1);
  const { data, error } = await query;
  if (error) throw new Error(`Failed to list vehicle drafts: ${error.message}`);
  return (data || []).map(rowToDraft);
}

export async function updateVehicleDraft(id: string, patch: Partial<VehicleDraft>): Promise<VehicleDraft> {
  const row = await draftToRow(patch);
  row.updated_at = new Date().toISOString();
  const { data, error } = await supabase
    .from('vehicle_drafts')
    .update(row)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(`Failed to update vehicle draft: ${error.message}`);
  return rowToDraft(data);
}

// ---------------------------------------------------------------------------
// WhatsApp conversations
// ---------------------------------------------------------------------------

export interface Conversation {
  id: string;
  externalPhone: string;
  participantType: ParticipantType;
  state: string;
  vehicleDraftId?: string;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, any>;
}

function rowToConversation(row: any): Conversation {
  return {
    id: row.id,
    externalPhone: row.external_phone,
    participantType: row.participant_type as ParticipantType,
    state: row.state,
    vehicleDraftId: row.vehicle_draft_id || undefined,
    lastActivity: row.last_activity,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    metadata: row.metadata || {},
  };
}

// Deterministic id keyed on phone so concurrent webhook invocations for the same
// sender converge on the SAME conversation row instead of racing to insert dupes.
function conversationIdFor(phone: string): string {
  return `conv-${phone}`;
}

export async function getOrCreateConversation(phone: string, senderType: ParticipantType = 'seller'): Promise<Conversation> {
  const id = conversationIdFor(phone);

  const { data: byId, error: byIdErr } = await supabase
    .from('whatsapp_conversations')
    .select('*')
    .eq('id', id)
    .single();
  if (!byIdErr && byId) return rowToConversation(byId);

  // Backfill for conversations created before deterministic ids (legacy rows).
  let { data, error } = await supabase
    .from('whatsapp_conversations')
    .select('*')
    .eq('external_phone', phone)
    .order('updated_at', { ascending: false })
    .limit(1);
  if (error) throw new Error(`Failed to fetch conversation: ${error.message}`);
  if (data && data.length > 0) {
    return rowToConversation(data[0]);
  }

  const now = new Date().toISOString();
  const { data: inserted, error: insertErr } = await supabase
    .from('whatsapp_conversations')
    .insert({
      id,
      external_phone: phone,
      participant_type: senderType,
      state: 'idle',
      last_activity: now,
      created_at: now,
      updated_at: now,
      metadata: {},
    })
    .select()
    .single();
  if (!insertErr) return rowToConversation(inserted);

  // Duplicate-key race (another invocation inserted first) → return theirs.
  if (insertErr.code === '23505' || /duplicate key/i.test(insertErr.message || '')) {
    const { data: retry } = await supabase
      .from('whatsapp_conversations')
      .select('*')
      .eq('external_phone', phone)
      .order('updated_at', { ascending: false })
      .limit(1);
    if (retry && retry.length > 0) return rowToConversation(retry[0]);
  }
  throw new Error(`Failed to create conversation: ${insertErr.message}`);
}

export async function updateConversation(id: string, patch: Partial<Conversation>): Promise<Conversation> {
  const row: Record<string, any> = {};
  if (patch.participantType !== undefined) row.participant_type = patch.participantType;
  if (patch.state !== undefined) row.state = patch.state;
  if (patch.vehicleDraftId !== undefined) row.vehicle_draft_id = patch.vehicleDraftId;
  if (patch.metadata !== undefined) row.metadata = patch.metadata;
  row.last_activity = new Date().toISOString();
  row.updated_at = new Date().toISOString();
  const { data, error } = await supabase
    .from('whatsapp_conversations')
    .update(row)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(`Failed to update conversation: ${error.message}`);
  return rowToConversation(data);
}

// ---------------------------------------------------------------------------
// WhatsApp messages (idempotency-critical)
// ---------------------------------------------------------------------------

export interface StoredMessage {
  id: string;
  externalId: string;
  conversationId: string;
  fromPhone: string;
  type: string;
  text?: string;
  media?: MessageAttachment[];
  role: string;
  processed: boolean;
  processingAttempts: number;
  lastError?: string;
  createdAt: string;
  processedAt?: string;
}

function rowToMessage(row: any): StoredMessage {
  return {
    id: row.id,
    externalId: row.external_id,
    conversationId: row.conversation_id,
    fromPhone: row.from_phone,
    type: row.type,
    text: row.text || undefined,
    media: row.media || [],
    role: row.role,
    processed: row.processed,
    processingAttempts: row.processing_attempts || 0,
    lastError: row.last_error || undefined,
    createdAt: row.created_at,
    processedAt: row.processed_at || undefined,
  };
}

export async function getMessageByExternalId(externalId: string): Promise<StoredMessage | null> {
  const { data, error } = await supabase
    .from('whatsapp_messages')
    .select('*')
    .eq('external_id', externalId)
    .single();
  if (error || !data) return null;
  return rowToMessage(data);
}

export async function listUnprocessedMessages(limit = 10, maxAttempts = 6): Promise<StoredMessage[]> {
  const { data, error } = await supabase
    .from('whatsapp_messages')
    .select('*')
    .eq('processed', false)
    .lt('processing_attempts', maxAttempts)
    .order('created_at', { ascending: true })
    .limit(limit);
  if (error) {
    throw new Error(`Failed to list unprocessed messages: ${error.message}`);
  }
  return (data || []).map(rowToMessage);
}

export async function persistInboundMessage(input: {
  externalId: string;
  conversationId: string;
  fromPhone: string;
  type: string;
  text?: string;
  media?: MessageAttachment[];
  role?: string;
}): Promise<StoredMessage> {
  const existing = await getMessageByExternalId(input.externalId);
  if (existing) return existing; // idempotency: never store the same message twice

  const id = generateId('msg');
  const now = new Date().toISOString();
  const row = {
    id,
    external_id: input.externalId,
    conversation_id: input.conversationId,
    from_phone: input.fromPhone,
    type: input.type,
    text: input.text || '',
    media: input.media || [],
    role: input.role || 'from',
    processed: false,
    processing_attempts: 0,
    created_at: now,
  };
  const { data, error } = await supabase.from('whatsapp_messages').insert(row).select().single();
  if (error) throw new Error(`Failed to persist message: ${error.message}`);
  return rowToMessage(data);
}

export async function markMessageProcessed(id: string, wasError?: string): Promise<void> {
  const row: Record<string, any> = {
    processed: !wasError,
    last_error: wasError || null,
    processed_at: wasError ? null : new Date().toISOString(),
  };
  await supabase.from('whatsapp_messages').update(row).eq('id', id);
}

export async function bumpProcessingAttempt(id: string, reason?: string): Promise<void> {
  const { data } = await supabase.from('whatsapp_messages').select('processing_attempts').eq('id', id).single();
  const attempts = (data?.processing_attempts || 0) + 1;
  await supabase
    .from('whatsapp_messages')
    .update({ processing_attempts: attempts, last_error: reason || null })
    .eq('id', id);
}

export async function listConversationMessages(conversationId: string): Promise<StoredMessage[]> {
  const { data, error } = await supabase
    .from('whatsapp_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(200);
  if (error) throw new Error(`Failed to fetch conversation messages: ${error.message}`);
  return (data || []).map(rowToMessage);
}

// ---------------------------------------------------------------------------
// Publish log
// ---------------------------------------------------------------------------

export interface StoredPublishEntry extends PublishEntry {
  id: string;
  vehicleDraftId: string;
  carId?: string;
}

export async function storePublishEntry(entry: {
  vehicleDraftId: string;
  carId?: string;
  channel: string;
  status: string;
  externalId?: string;
  url?: string;
  error?: string;
  retryCount?: number;
  requestId?: string;
}): Promise<void> {
  const id = generateId('pub');
  const { error } = await supabase.from('publish_log').insert({
    id,
    vehicle_draft_id: entry.vehicleDraftId,
    car_id: entry.carId || null,
    channel: entry.channel,
    status: entry.status,
    external_id: entry.externalId || null,
    url: entry.url || null,
    error: entry.error || null,
    retry_count: entry.retryCount || 0,
    request_id: entry.requestId || null,
  });
  if (error) console.error('[PUBLISH] Failed to store publish entry:', error.message);
}

export async function listPublishEntries(vehicleDraftId: string): Promise<StoredPublishEntry[]> {
  const { data, error } = await supabase
    .from('publish_log')
    .select('*')
    .eq('vehicle_draft_id', vehicleDraftId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(`Failed to fetch publish entries: ${error.message}`);
  return (data || []).map((r: any) => ({
    id: r.id,
    vehicleDraftId: r.vehicle_draft_id,
    carId: r.car_id,
    channel: r.channel as PublishChannel,
    status: r.status as PublishStatus,
    externalId: r.external_id,
    url: r.url,
    error: r.error,
    retryCount: r.retry_count,
    requestId: r.request_id,
    updatedAt: r.updated_at,
  }));
}

// ---------------------------------------------------------------------------
// Admin command intent detection (deterministic, before any AI call)
// ---------------------------------------------------------------------------

export interface AdminCommandMatch {
  command: AdminCommand;
  draftId?: string;
  carTitle?: string;
  value?: string;
  confirmationText?: string;
}

export function detectAdminCommand(text: string): AdminCommandMatch | null {
  const t = text.trim().toLowerCase();
  const draftMatch = t.match(/\b(vd-[\w-]+|kmc-[\w-]+)\b/i);

  if (/^(show|list|pending|inbox|today)/.test(t) && /(pending|review|draft|today|submissions)/.test(t)) {
    if (/today/.test(t)) return { command: 'show_today' };
    return { command: 'show_pending' };
  }
  if (/^(show|open|get)\s+(the\s+)?(fortuner|draft)/.test(t) || /^show\s+draft\b/i.test(t)) {
    return { command: 'show_draft', draftId: draftMatch?.[1] };
  }
  if (/(approve|reject|confirm|yes|publish|mark\s+sold|regenerate|change\s+price)/.test(t)) {
    if (/approve/.test(t)) return { command: 'approve', draftId: draftMatch?.[1] };
    if (/reject/.test(t)) return { command: 'reject', draftId: draftMatch?.[1] };
    if (/publish/.test(t)) return { command: 'publish', draftId: draftMatch?.[1] };
    if (/mark\s+sold/.test(t)) return { command: 'mark_sold', draftId: draftMatch?.[1] };
    if (/regenerate\s+(image|photo)/.test(t)) return { command: 'regenerate_images', draftId: draftMatch?.[1] };
    if (/regenerate\s+(content|desc|description)/.test(t)) return { command: 'regenerate_content', draftId: draftMatch?.[1] };
  }
  if (/change\s+price/.test(t)) {
    const priceMatch = t.match(/change\s+price\s+of\s+([\w-]+)\s+to\s+(.+)/i);
    return {
      command: 'change_price',
      draftId: draftMatch?.[1],
      value: priceMatch?.[2] || draftMatch?.[2],
    };
  }
  return null;
}

// Import-time type alias for explicit argument reuse.
export type { InboundMessage };