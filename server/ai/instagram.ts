// Instagram Publishing — official Meta Instagram Graph API only.
// No browser automation. Website/Instagram/WhatsApp statuses stay independent;
// a failed Instagram publish NEVER rolls back a successful website publish.

import type { PublishEntry } from '../../src/types/ai.js';
import { storePublishEntry } from './db.js';
import { appendAudit } from './audit.js';

interface IgConfig {
  accountId: string;
  token: string;
  graphUrl: string;
  configured: boolean;
}

function igConfig(): IgConfig {
  const accountId = process.env.INSTAGRAM_ACCOUNT_ID || '';
  const token = process.env.IG_USER_ACCESS_TOKEN || '';
  const graphUrl = process.env.META_GRAPH_URL || 'https://graph.facebook.com/v19.0';
  return { accountId, token, graphUrl, configured: Boolean(accountId && token) };
}

export interface IgContext {
  requestId: string;
  actor: string;
  actorType: 'admin' | 'system';
}

export async function publishToInstagram(draft: any, ctx: IgContext): Promise<PublishEntry> {
  const base: PublishEntry = {
    channel: 'instagram',
    status: 'pending',
    retryCount: 0,
    requestId: ctx.requestId,
    updatedAt: new Date().toISOString(),
  };
  const cfg = igConfig();
  if (!cfg.configured) {
    const skip: PublishEntry = { ...base, status: 'skipped', error: 'Instagram not configured' };
    await storePublishEntry({ vehicleDraftId: draft.id, channel: 'instagram', status: 'skipped', requestId: ctx.requestId });
    return skip;
  }

  try {
    const imageUrls = (draft.images || []).map((img: any) => img.variants?.website || img.originalUrl).filter(Boolean).slice(0, 10);
    if (imageUrls.length === 0) {
      const fail: PublishEntry = { ...base, status: 'failed', error: 'No images to publish' };
      await storePublishEntry({ vehicleDraftId: draft.id, channel: 'instagram', status: 'failed', error: 'No images', requestId: ctx.requestId });
      return fail;
    }

    const caption = (draft.content?.instagramCaption || '').slice(0, 2200);
    const posts = imageUrls.length > 1 ? await publishCarousel(cfg, imageUrls, caption) : await publishSingle(cfg, imageUrls[0], caption);

    if (posts) {
      const entry: PublishEntry = { ...base, status: 'success', externalId: Array.isArray(posts) ? posts.join(',') : String(posts) };
      await storePublishEntry({
        vehicleDraftId: draft.id,
        channel: 'instagram',
        status: 'success',
        externalId: entry.externalId,
        requestId: ctx.requestId,
      });
      await appendAudit({
        actor: ctx.actor,
        actorType: ctx.actorType,
        action: 'instagram_published',
        entity: 'vehicle_draft',
        entityId: draft.id,
        newValue: { postIds: posts },
        source: 'system',
        requestId: ctx.requestId,
        conversationId: draft.conversationId,
      });
      return entry;
    }

    const fail: PublishEntry = { ...base, status: 'failed', error: 'Instagram publish returned no post id' };
    await storePublishEntry({ vehicleDraftId: draft.id, channel: 'instagram', status: 'failed', error: 'No post id', requestId: ctx.requestId });
    return fail;
  } catch (err: any) {
    const fail: PublishEntry = { ...base, status: 'failed', error: err.message };
    await storePublishEntry({ vehicleDraftId: draft.id, channel: 'instagram', status: 'failed', error: err.message, requestId: ctx.requestId });
    return fail;
  }
}

async function publishSingle(cfg: IgConfig, imageUrl: string, caption: string): Promise<string | null> {
  const container = await createContainer(cfg, { imageUrl, caption, isCarouselItem: false });
  return publishContainer(cfg, container);
}

async function publishCarousel(cfg: IgConfig, imageUrls: string[], caption: string): Promise<string[] | null> {
  const itemIds: string[] = [];
  for (const url of imageUrls) {
    const id = await createContainer(cfg, { imageUrl: url, caption: url === imageUrls[0] ? caption : '', isCarouselItem: true });
    if (id) itemIds.push(id);
    await new Promise(r => setTimeout(r, 750)); // IG rate-limit friendliness
  }
  if (itemIds.length === 0) return null;

  const carousel = await createContainer(cfg, {
    carouselItemIds: itemIds,
    caption,
    isCarouselItem: false,
  });
  const publishedId = await publishContainer(cfg, carousel);
  if (!publishedId) return null;
  return [publishedId];
}

async function createContainer(
  cfg: IgConfig,
  params: {
    imageUrl?: string;
    caption?: string;
    isCarouselItem?: boolean;
    carouselItemIds?: string[];
  }
): Promise<string | null> {
  const body: Record<string, string> = { access_token: cfg.token };
  if (params.imageUrl) {
    body.image_url = params.imageUrl;
  }
  if (params.caption) {
    body.caption = params.caption;
  }
  if (params.isCarouselItem) {
    body.is_carousel_item = 'true';
  }
  if (params.carouselItemIds) {
    body.children = params.carouselItemIds.join(',');
    body.media_type = 'CAROUSEL';
  }
  const res = await fetch(`${cfg.graphUrl}/${cfg.accountId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`IG create container failed: ${JSON.stringify(data)}`);
  if (data.error) throw new Error(`IG error: ${JSON.stringify(data.error)}`);
  return data.id || null;
}

async function publishContainer(cfg: IgConfig, containerId: string | null): Promise<string | null> {
  if (!containerId) return null;
  // Publishing is a two-phase op in the Graph API; poll container status first.
  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 1500));
    const statusRes = await fetch(
      `${cfg.graphUrl}/${containerId}?fields=status_code&access_token=${cfg.token}`
    ).then(r => r.json().catch(() => ({})));
    const status = statusRes.status_code;
    if (status === 'FINISHED') break;
    if (status === 'ERROR' || status === 'EXPIRED') throw new Error(`IG container ${status}`);
  }
  const res = await fetch(`${cfg.graphUrl}/${cfg.accountId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_token: cfg.token, creation_id: containerId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`IG media_publish failed: ${JSON.stringify(data)}`);
  return data.id || null;
}

export { igConfig }; // for readiness check in health route