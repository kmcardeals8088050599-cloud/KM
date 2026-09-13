// AI Vehicle System — domain types.
// These are shared between server modules and (optionally) the frontend admin UI.

// ---------------------------------------------------------------------------
// Vehicle Draft state machine
// ---------------------------------------------------------------------------
export type VehicleDraftState =
  | 'RECEIVED'
  | 'PROCESSING'
  | 'INCOMPLETE'
  | 'READY_FOR_REVIEW'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'UPDATED'
  | 'SOLD'
  | 'ARCHIVED'
  | 'PROCESSING_FAILED'
  | 'PUBLISH_FAILED'
  | 'IMAGE_PROCESSING_FAILED';

// Allowed transitions per source (actor type).
export const VEHICLE_DRAFT_TRANSITIONS: Record<
  VehicleDraftState,
  { system: VehicleDraftState[]; admin: VehicleDraftState[] }
> = {
  RECEIVED: { system: ['PROCESSING', 'PROCESSING_FAILED'], admin: ['ARCHIVED'] },
  PROCESSING: {
    system: ['INCOMPLETE', 'READY_FOR_REVIEW', 'PROCESSING_FAILED', 'IMAGE_PROCESSING_FAILED'],
    admin: ['ARCHIVED']
  },
  INCOMPLETE: { system: ['PROCESSING', 'READY_FOR_REVIEW', 'PROCESSING_FAILED'], admin: ['ARCHIVED', 'READY_FOR_REVIEW'] },
  READY_FOR_REVIEW: { system: ['PROCESSING', 'ARCHIVED', 'APPROVED'], admin: ['APPROVED', 'ARCHIVED', 'PROCESSING'] },
  APPROVED: { system: ['PUBLISHED', 'PUBLISH_FAILED', 'PROCESSING_FAILED'], admin: ['ARCHIVED', 'READY_FOR_REVIEW'] },
  PUBLISHED: { system: ['UPDATED', 'SOLD', 'ARCHIVED'], admin: ['SOLD', 'ARCHIVED', 'UPDATED'] },
  UPDATED: { system: ['PUBLISHED', 'SOLD', 'ARCHIVED', 'PUBLISH_FAILED'], admin: ['SOLD', 'ARCHIVED'] },
  SOLD: { system: ['ARCHIVED'], admin: ['ARCHIVED', 'PUBLISHED'] },
  ARCHIVED: { system: ['RECEIVED'], admin: ['RECEIVED'] },
  PROCESSING_FAILED: { system: ['PROCESSING'], admin: ['PROCESSING', 'ARCHIVED', 'READY_FOR_REVIEW'] },
  PUBLISH_FAILED: { system: ['PROCESSING', 'PUBLISHED'], admin: ['PUBLISHED', 'PROCESSING', 'ARCHIVED'] },
  IMAGE_PROCESSING_FAILED: { system: ['PROCESSING'], admin: ['PROCESSING', 'ARCHIVED', 'READY_FOR_REVIEW'] }
};

// ---------------------------------------------------------------------------
// Field provenance / confidence
// ---------------------------------------------------------------------------
export type FieldSource =
  | 'whatsapp_text'
  | 'whatsapp_voice'
  | 'ai_inference'
  | 'document'
  | 'image_detection'
  | 'rc_card'
  | 'admin'
  | 'system';

export type FieldConfidence = 'low' | 'medium' | 'high';

export interface FieldProvenance {
  value?: unknown;
  source: FieldSource;
  confidence: FieldConfidence;
  locked?: boolean;
  verifiedBy?: string; // e.g. 'document:rc' when a doc corroborates
  notes?: string;
}

export type FieldProvenanceMap = Record<string, FieldProvenance>;

export type ConfidenceMap = Record<string, number>;

// ---------------------------------------------------------------------------
// Extracted / canonical vehicle data
// ---------------------------------------------------------------------------
export interface VehicleExtractedData {
  brand?: string;
  model?: string;
  variant?: string;
  manufacturingYear?: number;
  registrationYear?: number;
  registrationNumber?: string;
  actualRegistration?: string;
  displayRegistration?: string;
  fuelType?: string;
  transmission?: string;
  drivetrain?: string;
  bodyType?: string;
  color?: string;
  interiorColor?: string;
  odometerKm?: number;
  ownerCount?: string;
  engine?: string;
  engineCc?: number;
  price?: number;
  negotiable?: boolean;
  financeAvailable?: boolean;
  location?: string;
  condition?: string;
  accidentHistory?: string;
  serviceHistory?: string;
  insuranceValidUntil?: string;
  rcStatus?: string;
  features?: string[];
  description?: string;
}

// Raw output of the extraction agent.
export interface ExtractionResult {
  data: VehicleExtractedData;
  confidence: ConfidenceMap;
  provenance: FieldProvenanceMap;
  unknown: string[]; // fields the model could not determine
  notes: string;
}

// Missing-field request produced by the validation agent.
export interface MissingFieldRequest {
  missing: string[];
  message: string; // a compact, single WhatsApp reply
  questions: string[];
  severity: 'none' | 'low' | 'high';
}

// ---------------------------------------------------------------------------
// Conversation / messages
// ---------------------------------------------------------------------------
export type ParticipantType = 'seller' | 'dealer' | 'admin' | 'buyer';

export interface MessageAttachment {
  kind: 'image' | 'document' | 'audio' | 'video';
  mediaId?: string;
  url?: string;
  mimeType?: string;
  ext?: string;
  size?: number;
  text?: string; // OCR / transcript fragment
}

export interface InboundMessage {
  externalId: string; // Meta wamid.id → idempotency key
  from: string;       // sender phone (e.g. 918123991847)
  participantType?: ParticipantType;
  type: 'text' | 'image' | 'audio' | 'document' | 'video' | 'unknown';
  text?: string;
  attachments?: MessageAttachment[];
  timestamp?: string;
}

// ---------------------------------------------------------------------------
// Driver / sender identification
// ---------------------------------------------------------------------------
export interface SenderIdentity {
  phone: string;
  participantType: ParticipantType;
  name?: string;
  sellerId?: string;
  dealerId?: string;
}

// ---------------------------------------------------------------------------
// Generated content bundle
// ---------------------------------------------------------------------------
export interface GeneratedContent {
  websiteTitle: string;
  websiteDescription: string;
  instagramCaption: string;
  whatsappSalesMessage: string;
  seo: {
    title: string;
    metaDescription: string;
    keywords: string[];
    slug: string;
  };
}

// ---------------------------------------------------------------------------
// Publish results (per-channel, independent)
// ---------------------------------------------------------------------------
export type PublishChannel =
  | 'website'
  | 'instagram'
  | 'whatsapp'            // plain sales-text message to seller/admin
  | 'whatsapp_catalogue'  // WhatsApp Business Catalogue product (Catalog API)
  | 'whatsapp_status';    // WhatsApp Status — not supported by the Cloud API, recorded honestly
export type PublishStatus = 'pending' | 'success' | 'failed' | 'skipped';

export interface PublishEntry {
  channel: PublishChannel;
  status: PublishStatus;
  externalId?: string;
  url?: string;
  error?: string;
  retryCount: number;
  requestId: string;
  updatedAt: string;
}

export interface PublishResult {
  entries: PublishEntry[];
}

// ---------------------------------------------------------------------------
// Image pipeline
// ---------------------------------------------------------------------------
export type ImageCategory =
  | 'front'
  | 'rear'
  | 'side'
  | 'interior'
  | 'dashboard'
  | 'odometer'
  | 'engine'
  | 'tyres'
  | 'documents'
  | 'other';

export interface ImageVariant {
  original?: string;
  processed?: string;
  website?: string;
  instagram?: string;
  whatsapp?: string;
  thumbnail?: string;
}

export interface ProcessedImage {
  id: string;
  originalUrl: string;
  category: ImageCategory;
  quality: {
    blur: boolean;
    lowResolution: boolean;
    poorLighting: boolean;
    glare: boolean;
    obstruction: boolean;
    duplicate: boolean;
    wrongOrientation: boolean;
    nonVehicle: boolean;
    score: number; // 0..1, higher = better
  };
  variants: ImageVariant;
  approved: boolean;
  isPrimary: boolean;
  order: number;
}

// Branding configuration (editable without code changes).
export interface BrandingConfig {
  brandName: string;
  tagline: string;
  logo?: string;
  backgroundStyle: string;
  backgroundPrompt: string;
  primaryBrandColor: string;
  secondaryBrandColor: string;
  watermark: string;
  numberPlateDisplayPolicy: 'actual' | 'masked' | 'branded' | 'none';
  maskedPlateText: string;
  brandedPlateText: string;
  imageAspectRatios: {
    website: string;
    instagramFeed: string;
    instagramStory: string;
    whatsapp: string;
    thumbnail: string;
  };
}

// Vehicle AI message classification used by the admin WhatsApp control + handler.
export type AdminCommand =
  | 'show_pending'
  | 'show_today'
  | 'show_draft'
  | 'approve'
  | 'reject'
  | 'change_price'
  | 'publish'
  | 'mark_sold'
  | 'regenerate_images'
  | 'regenerate_content';

// ---------------------------------------------------------------------------
// AI usage / audit records
// ---------------------------------------------------------------------------
export interface AuditEntry {
  id: string;
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
  createdAt: string;
}

export interface AiUsageEntry {
  id: string;
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
  createdAt: string;
}