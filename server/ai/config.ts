// AI system configuration — not secrets, just runtime behaviour toggles and branding.

import type { BrandingConfig } from '../../src/types/ai.js';

export const AI_CONFIG = {
  maxImagesPerVehicle: 20,
  webhookMaxAgeSeconds: 300,
  followUpMaxQuestions: 5,
  followUpRetryLimit: 3,
  // Professional listing floor: a car is only PUBLISHABLE with at least this many photos.
  minPhotosForPublish: 3,
} as const;

export const MIN_PHOTOS_FOR_PUBLISH = AI_CONFIG.minPhotosForPublish;

// When enabled, a complete intake publishes the listing immediately — no admin
// approval step. The only WhatsApp conversation is the ask-for-missing-fields
// follow-up with the sender (and admin notifications).
export const AUTO_PUBLISH: boolean =
  ['1', 'true', 'yes', 'on'].includes((process.env.AUTO_PUBLISH || '').toLowerCase());

export const BRAND_CONFIG: BrandingConfig = {
  brandName: 'KM Car Deals',
  tagline: 'Trusted Multi Brand Pre-Owned Cars',
  logo: '',
  backgroundStyle: 'studio',
  backgroundPrompt: 'Professional automotive studio background with gradient floor and subtle spotlight, neutral tones, suitable for pre-owned car marketplace',
  primaryBrandColor: '#d97706',
  secondaryBrandColor: '#f59e0b',
  watermark: 'KM Car Deals • Kalaburagi',
  numberPlateDisplayPolicy: 'branded',
  maskedPlateText: '****-**-****',
  brandedPlateText: 'KM CAR DEALS',
  imageAspectRatios: {
    website: '16:9',
    instagramFeed: '1:1',
    instagramStory: '9:16',
    whatsapp: '16:9',
    thumbnail: '4:3',
  },
};

// Canonical field-name → readable label map for extraction / validation messages.
export const FIELD_LABELS: Record<string, string> = {
  brand: 'Brand',
  model: 'Model',
  variant: 'Variant',
  manufacturingYear: 'Manufacturing year',
  registrationYear: 'Registration year',
  registrationNumber: 'Registration number',
  fuelType: 'Fuel type',
  transmission: 'Transmission',
  bodyType: 'Body type',
  color: 'Colour',
  interiorColor: 'Interior colour',
  odometerKm: 'Kilometres driven',
  ownerCount: 'Owner count',
  price: 'Asking price',
  condition: 'Condition',
  accidentHistory: 'Accident history',
  serviceHistory: 'Service history',
  insuranceValidUntil: 'Insurance valid until',
  rcStatus: 'RC status',
  location: 'Location',
  features: 'Features',
  negotiable: 'Negotiable price',
  financeAvailable: 'Finance available',
  drivetrain: 'Drivetrain',
  engineCc: 'Engine (CC)',
  engine: 'Engine details',
};

// Fields that MUST be present for a listing to be READY_FOR_REVIEW (based on existing
// createCarSchema requirements). A catalogue car cannot be uploaded until EVERY one
// of these is present in the draft, alongside at least MIN_PHOTOS_FOR_PUBLISH photos.
export const REQUIRED_FOR_PUBLISH: string[] = [
  'brand',
  'model',
  'manufacturingYear',
  'fuelType',
  'transmission',
  'bodyType',
  'ownerCount',
  'odometerKm',
  'price',
];

// Fields that should be collected for a good listing but can be null for a draft.
export const DESIRED_FIELDS: string[] = [
  ...REQUIRED_FOR_PUBLISH,
  'variant',
  'registrationYear',
  'odometerKm',
  'color',
  'condition',
  'accidentHistory',
  'serviceHistory',
  'rcStatus',
  'location',
  'features',
  'registrationNumber',
];

// Price parser: handles strings like "32.5 lakh", "3250000", "32,50,000", "32.5L", "₹32.5 lakh"
export function parseIndianPrice(text: string): number | null {
  const cleaned = text.replace(/[₹,\s]/g, '').toLowerCase();
  // Matches: "32.5lakh", "32.5l", "3250000", "32.50lakh"
  const lakhMatch = cleaned.match(/([\d.]+)\s*(lakh|l)$/);
  if (lakhMatch) {
    const val = parseFloat(lakhMatch[1]);
    return Math.round(val * 100000);
  }
  // Just a number → could be lakhs or full rupees; assume rupees if > 50000
  const numeric = cleaned.replace(/[^0-9.]/g, '');
  if (numeric) {
    const val = parseFloat(numeric);
    if (!isNaN(val)) return val > 50000 ? Math.round(val) : Math.round(val * 100000);
  }
  return null;
}

// KM parser: handles "48000", "48k", "48,000 km", "48000kms"
export function parseOdometer(text: string): number | null {
  const cleaned = text.replace(/[,.\s]/g, '').toLowerCase();
  // Compact shorthand "48k" → 48,000. Fully-spelled "48000km" is already absolute.
  const thToggle = cleaned.match(/^(\d+)k$/);
  if (thToggle) return parseInt(thToggle[1]) * 1000;
  const num = cleaned.replace(/[^0-9]/g, '');
  if (num) {
    const val = parseInt(num);
    if (!isNaN(val) && val > 0) return val;
  }
  return null;
}

// Year parser: handles "2022", "22", "2022 model"
export function parseYear(text: string): number | null {
  const cleaned = text.replace(/[^0-9\s]/g, ' ').trim();
  const match = cleaned.match(/\b(19|20)\d{2}\b/);
  if (match) return parseInt(match[0]);
  // 2-digit year
  const twoDigit = cleaned.match(/\b(\d{2})\b/);
  if (twoDigit) {
    const val = parseInt(twoDigit[1]);
    if (val >= 0 && val <= 30) return 2000 + val;
    if (val >= 70 && val <= 99) return 1900 + val;
  }
  return null;
}
