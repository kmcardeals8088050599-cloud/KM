// Zod schemas for the AI boundary.
//
// Malformed model output must never become database columns or invalid listing
// values. Every agent output that feeds structured data is gated through these.
// Coercion keeps valid-but-loosely-typed output (e.g. price as "3250000" or
// "32.5 lakh" already normalized) flowing; anything genuinely malformed throws,
// which fails the pipeline loudly instead of persisting garbage.

import { z } from 'zod';
import type { GeneratedContent, VehicleExtractedData } from '../../src/types/ai.js';

const boundedString = (max: number) => z.string().trim().max(max);
const boundedInt = (min: number, max: number) => z.coerce.number().int().min(min).max(max);

// ---------------------------------------------------------------------------
// Vehicle extraction
// ---------------------------------------------------------------------------
export const vehicleExtractedDataSchema = z.object({
  brand: boundedString(200).optional(),
  model: boundedString(200).optional(),
  variant: boundedString(300).optional(),
  manufacturingYear: boundedInt(1950, 2100).optional(),
  registrationYear: boundedInt(1950, 2100).optional(),
  registrationNumber: boundedString(60).optional(),
  actualRegistration: boundedString(60).optional(),
  displayRegistration: boundedString(60).optional(),
  fuelType: boundedString(60).optional(),
  transmission: boundedString(60).optional(),
  drivetrain: boundedString(60).optional(),
  bodyType: boundedString(60).optional(),
  color: boundedString(60).optional(),
  interiorColor: boundedString(60).optional(),
  odometerKm: boundedInt(0, 9_999_999).optional(),
  ownerCount: boundedString(60).optional(),
  engine: boundedString(200).optional(),
  engineCc: boundedInt(1, 100_000).optional(),
  price: boundedInt(0, 500_000_000).optional(),
  negotiable: z.coerce.boolean().optional(),
  financeAvailable: z.coerce.boolean().optional(),
  location: boundedString(200).optional(),
  condition: boundedString(200).optional(),
  accidentHistory: boundedString(300).optional(),
  serviceHistory: boundedString(300).optional(),
  insuranceValidUntil: boundedString(100).optional(),
  rcStatus: boundedString(100).optional(),
  features: z.array(boundedString(200)).max(200).optional(),
  description: boundedString(2000).optional(),
});

/**
 * Validate + coerce raw extraction data into a clean VehicleExtractedData.
 * Unknown keys are stripped (they can never reach the DB), numbers are coerced,
 * over-long strings are rejected (they cannot turn into column data).
 */
export function sanitizeExtractedData(data: unknown): VehicleExtractedData {
  return vehicleExtractedDataSchema.parse(data);
}

// ---------------------------------------------------------------------------
// Generated content
// ---------------------------------------------------------------------------
export const generatedContentSchema = z.object({
  websiteTitle: boundedString(200),
  websiteDescription: boundedString(500),
  instagramCaption: boundedString(2200),
  whatsappSalesMessage: boundedString(2000),
  seo: z.object({
    title: boundedString(70),
    metaDescription: boundedString(160),
    keywords: z.array(boundedString(100)).max(20),
    slug: boundedString(200).regex(/^[a-z0-9-]+$/),
  }),
});

/** Final gate on generated marketing content (shape is guaranteed by normalizeContent fallbacks). */
export function sanitizeGeneratedContent(content: GeneratedContent): GeneratedContent {
  return generatedContentSchema.parse(content);
}

// ---------------------------------------------------------------------------
// Conflict-resolution agent
// ---------------------------------------------------------------------------
export const conflictResolutionSchema = z.object({
  resolved: z.coerce.boolean(),
  notes: boundedString(500).optional(),
});

// ---------------------------------------------------------------------------
// RC-card document reader (vision OCR into validated RC fields)
// ---------------------------------------------------------------------------
export const rcCardExtractionSchema = z.object({
  registrationNumber: boundedString(60).optional(),
  ownerName: boundedString(200).optional(),
  model: boundedString(200).optional(),
  fuelType: boundedString(60).optional(),
  registrationYear: boundedInt(1950, 2100).optional(),
  insuranceValidUntil: boundedString(100).optional(),
  rcStatus: boundedString(100).optional(),
  notes: boundedString(300).optional(),
});