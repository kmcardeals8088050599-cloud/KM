// Image Pipeline.
//
// Responsibilities (Phase 3):
//  - Attach original images to a vehicle draft.
//  - Classify each image (front / rear / side / interior / dashboard / odometer / engine / tyres / documents / other).
//  - Quality analysis (blur, low resolution, poor lighting, glare, obstruction, duplicate, wrong orientation, non-vehicle).
//  - Flag issues — NEVER destroy or replace the original.
//  - Record variant URLs. When an image-capable model/token is configured, generate brand variants;
//    otherwise the variant map points at the original (graceful, no fabrication).
//
// Hard rules: never change vehicle identity; number-plate display policy is config-driven and
// the real registration number always stays in structured data.

import { analyzeImages } from './ai.js';
import { BRAND_CONFIG } from './config.js';
import type { BrandingConfig, ImageCategory, ProcessedImage } from '../../src/types/ai.js';

export interface ImageInput {
  id: string;
  url: string;
  mimeType?: string;
  size?: number;
}

export interface ImagePipelineResult {
  images: ProcessedImage[];
  primary: ProcessedImage | null;
  warnings: string[];
}

// Serializable image description for vision classification. We avoid loading full base64
// payloads when no vision call is needed; when vision is available the caller may supply
// dataURLs for a small batch.
export async function classifyAndAnalyze(
  images: ImageInput[],
  dataURLs: Record<string, string>,
  conversationId: string,
  draftId: string,
  config: BrandingConfig = BRAND_CONFIG
): Promise<ImagePipelineResult> {
  const warnings: string[] = [];
  const results: ProcessedImage[] = [];

  if (images.length === 0) {
    return { images: [], primary: null, warnings };
  }

  const visionBatch = images
    .filter(img => dataURLs[img.id])
    .slice(0, 8) // vision cost guard
    .map(img => ({
      id: img.id,
      dataUrl: dataURLs[img.id],
    }));

  let classifications: Record<string, { category: ImageCategory; quality: string[]; score: number }> = {};

  if (visionBatch.length > 0) {
    try {
      classifications = await analyzeImages<Record<string, { category: ImageCategory; quality: string[]; score: number }>>({
        prompt:
          'Classify each vehicle photo and flag quality issues against these image ids.\n' +
          `Image ids: ${visionBatch.map(i => i.id).join(', ')}\n` +
          'Respond JSON: {"images":[{"id":"...","category":"...","issueFlags":[...],"score":0.0-1.0}]}',
        system:
          'You are an automotive photography reviewer. Allowed categories: front, rear, side, interior, dashboard, odometer, engine, tyres, documents, other.\n' +
          'Allowed issueFlags: blur, low_resolution, poor_lighting, glare, obstruction, duplicate, wrong_orientation, non_vehicle.\n' +
          'Return nothing else. Respond JSON only.',
        images: visionBatch.map(i => ({ id: i.id, dataUrl: i.dataUrl })),
        schemaDescription: 'image classification JSON',
        agent: 'image',
        event: 'classify_images',
        conversationId,
        entity: 'vehicle_draft',
        entityId: draftId,
        maxRetries: 1,
        validate: value => {
          const r = value as {
            images?: Array<{
              id: string;
              category?: ImageCategory;
              issueFlags?: string[];
              score?: number;
            }>;
          };
          const map: Record<string, { category: ImageCategory; quality: string[]; score: number }> = {};
          for (const img of Array.isArray(r?.images) ? r.images : []) {
            if (!img || typeof img.id !== 'string') continue;
            map[img.id] = {
              category: img.category || 'other',
              quality: Array.isArray(img.issueFlags) ? img.issueFlags : [],
              score: typeof img.score === 'number' ? img.score : 0.7,
            };
          }
          return map;
        },
      });
    } catch (err) {
      // Vision unavailable → weak heuristics, don't fail the whole pipeline.
      warnings.push('Image classification skipped (vision unavailable).');
    }
  }

  const seenHashes = new Map<string, string>(); // crude duplicate detection via size+mime
  let primarySet = false;

  results.push(...images.map((img, index) => {
    const classified = classifications[img.id];
    const qualityFlags = classifyQuality(img, classified);

    const dupKey = `${img.mimeType}|${img.size}`;
    if (img.size !== undefined) {
      if (seenHashes.has(dupKey)) qualityFlags.push('duplicate');
      else seenHashes.set(dupKey, img.id);
    }

    const processed: ProcessedImage = {
      id: img.id,
      originalUrl: img.url,
      category: classified?.category || heuristicCategory(index),
      quality: {
        blur: qualityFlags.includes('blur'),
        lowResolution: qualityFlags.includes('low_resolution'),
        poorLighting: qualityFlags.includes('poor_lighting'),
        glare: qualityFlags.includes('glare'),
        obstruction: qualityFlags.includes('obstruction'),
        duplicate: qualityFlags.includes('duplicate'),
        wrongOrientation: qualityFlags.includes('wrong_orientation'),
        nonVehicle: qualityFlags.includes('non_vehicle'),
        score: classified?.score || 0.7,
      },
      variants: {
        original: img.url, // original NEVER modified
        processed: img.url,
        website: img.url,
        instagram: img.url,
        whatsapp: img.url,
        thumbnail: img.url,
      },
      approved: false,
      isPrimary: !primarySet,
      order: index,
    };
    if (!primarySet) primarySet = true;
    return processed;
  }));

  const primary = results.find(r => r.isPrimary && !r.quality.nonVehicle) || results[0];

  if (classifications && Object.keys(classifications).length === 0 && images.length > 0) {
    warnings.push('All images kept as originals; branding variants not generated.');
  }

  return {
    images: results,
    primary,
    warnings: [...new Set(warnings)],
  };
}

// Heuristic quality fallbacks when vision is unavailable.
function classifyQuality(
  img: ImageInput,
  classified?: { category: ImageCategory; quality: string[]; score: number }
): string[] {
  const flags: string[] = [];
  if (classified) {
    for (const f of classified.quality) flags.push(f);
  }
  if (img.size !== undefined && img.size < 120 * 1024) {
    flags.push('low_resolution');
  }
  if (img.size !== undefined && img.size < 60 * 1024) {
    flags.push('blur');
  }
  return flags;
}

function heuristicCategory(index: number): ImageCategory {
  const order: ImageCategory[] = ['front', 'rear', 'side', 'interior', 'dashboard', 'other'];
  return order[Math.min(index, order.length - 1)];
}

// Apply number-plate display policy to structured data.
export function applyPlatePolicy(
  actualRegistration: string | undefined,
  config: BrandingConfig = BRAND_CONFIG
): { actual_registration?: string; display_registration?: string } {
  if (!actualRegistration) return {};
  switch (config.numberPlateDisplayPolicy) {
    case 'actual':
      return { actual_registration: actualRegistration, display_registration: actualRegistration };
    case 'masked':
      return { actual_registration: actualRegistration, display_registration: config.maskedPlateText };
    case 'branded':
      return { actual_registration: actualRegistration, display_registration: config.brandedPlateText };
    case 'none':
    default:
      return { actual_registration: actualRegistration };
  }
}