// Content Generation Agent.
// Produces website title/description, Instagram caption, WhatsApp sales message, SEO block.
// Generates ONLY from verified vehicle data. Never invents specifications.

import { generateStructured } from './ai.js';
import { sanitizeGeneratedContent } from './schemas.js';
import type { GeneratedContent, VehicleExtractedData } from '../../src/types/ai.js';

const SYSTEM_INSTRUCTIONS = `
You are the content agent for "KM Car Deals", a trusted multi-brand pre-owned car dealership in Kalaburagi, Karnataka, India.
Generate marketing content for a vehicle listing using ONLY the provided verified facts.
PRICING RULE (hard rule, applies to ALL public copy):
- The asking price is INTERNAL only. It must NEVER appear in the Instagram caption, WhatsApp sales message, website title, website description, or SEO copy.
- Instead, public copy invites buyers to reach out for the price (e.g. "Reach out for the price", "Call/WhatsApp for the best price").
- The model may still SEE the price in the input data — it just must not publish it.
Rules:
- NEVER invent or guess specifications beyond the provided data.
- Website title: concise, e.g. "2022 Toyota Fortuner 2.8 4x2 Automatic" (no price).
- Website description: professional, factual, 2-3 sentences, under 60 words. Mention 150-point inspection + honest condition. No made-up specs. No price — invite contact.
- Instagram caption: include vehicle, year, fuel, transmission, km, ownership, KM Car Deals branding, and a clear CTA (call/WhatsApp) that asks buyers to reach out for the price. Use line breaks and a couple of emojis only if tasteful. NEVER include a ₹ amount.
- WhatsApp sales message: short, readable, scannable. NO price — invite the recipient to reach out.
- SEO: title (<70 chars), meta description (<160 chars), 5-8 keywords, slug (kebab-case, lowercase). No price anywhere.
`;

export async function generateVehicleContent(
  conversationId: string,
  data: VehicleExtractedData,
  draftId: string
): Promise<GeneratedContent> {
  const prompt = [
    'VERIFIED VEHICLE DATA (JSON — the only facts you may use):',
    JSON.stringify(data, null, 2),
    '---',
    'RESPOND WITH VALID JSON ONLY, keys: website_title, website_description, instagram_caption, whatsapp_sales_message, seo (with title, meta_description, keywords array, slug).',
  ].join('\n');

  const content = sanitizeGeneratedContent(
    normalizeContent(
      await generateStructured<RawContent>({
        prompt,
        system: SYSTEM_INSTRUCTIONS,
        schemaDescription: 'vehicle marketing content JSON',
        agent: 'content',
        event: 'generate_content',
        conversationId,
        entity: 'vehicle_draft',
        entityId: draftId,
        maxRetries: 2,
      }),
      data
    )
  );
  return content;
}

interface RawContent {
  website_title?: string;
  websiteTitle?: string;
  website_description?: string;
  websiteDescription?: string;
  instagram_caption?: string;
  instagramCaption?: string;
  whatsapp_sales_message?: string;
  whatsappSalesMessage?: string;
  seo?: {
    title?: string;
    meta_description?: string;
    metaDescription?: string;
    keywords?: string[];
    slug?: string;
  };
}

function normalizeContent(raw: RawContent, data: VehicleExtractedData): GeneratedContent {
  const title =
    raw.website_title ||
    raw.websiteTitle ||
    `${data.manufacturingYear || ''} ${data.brand || ''} ${data.model || ''} ${data.variant || ''}`.trim();

  const fallbackDescription = `${title} available at KM Car Deals, Kalaburagi. ` +
    `${data.fuelType || ''} ${data.transmission || ''} ${data.bodyType || ''}, ` +
    `${data.odometerKm ? data.odometerKm.toLocaleString('en-IN') + ' km' : ''}, ${data.ownerCount || ''}. ` +
    `150-point inspected and ready for immediate delivery.`;

  const fallbackCaption = [
    `🚗 ${title}`,
    data.fuelType ? `⛽ ${data.fuelType}` : null,
    data.transmission ? `⚙️ ${data.transmission}` : null,
    data.odometerKm ? `📊 ${data.odometerKm.toLocaleString('en-IN')} km` : null,
    data.ownerCount ? `👤 ${data.ownerCount}` : null,
    `📍 ${data.location || 'Kalaburagi'}`,
    ``,
    `Reach out for the price — call/WhatsApp KM Car Deals and book a test drive!`,
  ].filter(Boolean).join('\n');

  const fallbackWhatsApp = [
    `*${title}*`,
    data.fuelType ? `• Fuel: ${data.fuelType}` : null,
    data.transmission ? `• Transmission: ${data.transmission}` : null,
    data.odometerKm ? `• Driven: ${data.odometerKm.toLocaleString('en-IN')} km` : null,
    data.ownerCount ? `• Owner: ${data.ownerCount}` : null,
    ``,
    `Interested? Visit KM Car Deals, Kalaburagi or message us — reach out for the price.`,
  ].filter(Boolean).join('\n');

  const brandLower = (data.brand || 'car').toLowerCase();
  const slugBase = [data.manufacturingYear, data.brand, data.model, data.variant]
    .filter(Boolean)
    .map((s: any) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''))
    .join('-');

  const seo = {
    title: (raw.seo?.title || title).slice(0, 70),
    metaDescription: (raw.seo?.meta_description || raw.seo?.metaDescription || fallbackDescription).slice(0, 160),
    keywords: (raw.seo?.keywords?.length ? raw.seo.keywords.slice(0, 8) : [brandLower, 'pre-owned', data.bodyType || 'car', 'Kalaburagi']),
    slug: (raw.seo?.slug || slugBase || brandLower).toLowerCase().replace(/[^a-z0-9-]/g, ''),
  };

  return {
    websiteTitle: title,
    websiteDescription: (raw.website_description || raw.websiteDescription || fallbackDescription).slice(0, 500),
    instagramCaption: (raw.instagram_caption || raw.instagramCaption || fallbackCaption).slice(0, 2200),
    whatsappSalesMessage: (raw.whatsapp_sales_message || raw.whatsappSalesMessage || fallbackWhatsApp).slice(0, 2000),
    seo,
  };
}