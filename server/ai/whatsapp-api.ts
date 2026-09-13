// WhatsApp Business Cloud API — outbound helper + inbound media resolution.
// Production path uses the official Meta API. Never uses unofficial automation.
// All calls are fire-and-forget safe and never throw to the caller.

import { put } from '@vercel/blob';

export function whatsappConfig(): {
  configured: boolean;
  apiUrl?: string;
  token?: string;
  phoneNumberId?: string;
} {
  const token = process.env.WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_API_TOKEN || '';
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
  const apiUrl =
    process.env.WHATSAPP_API_URL ||
    (phoneNumberId
      ? `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`
      : '');
  return { configured: Boolean(token && apiUrl), apiUrl, token, phoneNumberId };
}

export async function sendWhatsAppText(to: string, body: string): Promise<{ ok: boolean; error?: string }> {
  const { configured, apiUrl, token } = whatsappConfig();
  if (!configured || !apiUrl || !token) {
    console.log('[WhatsApp]: Not configured. Logging message only:\n' + body);
    return { ok: false, error: 'WHATSAPP_API not configured' };
  }
  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: body.slice(0, 4000) },
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { ok: false, error: JSON.stringify(err).slice(0, 500) };
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

// Admin notification helper — reuses existing admin phone env or the incoming sender.
export async function notifyAdmin(text: string): Promise<{ ok: boolean; error?: string }> {
  const adminPhone = process.env.WHATSAPP_ADMIN_PHONE || '';
  if (!adminPhone) {
    console.log('[Admin notify]:', text);
    return { ok: false, error: 'WHATSAPP_ADMIN_PHONE not set' };
  }
  return sendWhatsAppText(adminPhone, text);
}

// Resolve a Meta media id → temporary download URL.
export async function resolveMediaUrl(mediaId: string): Promise<string | null> {
  const { token, configured } = whatsappConfig();
  if (!configured || !token) return null;
  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${mediaId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.url || null;
  } catch {
    return null;
  }
}

// Download remote media and persist a durable copy in Vercel Blob.
// Returns the durable public URL. Images and audio (voice notes need a stable
// URL for transcription) are stored; other types are left to their functional paths.
// Meta's media download URLs require the WhatsApp token as an Authorization header.
export async function storeRemoteMedia(url: string, prefix: string): Promise<string | null> {
  try {
    const token = whatsappConfig().token;
    const headers: Record<string, string> = {};
    if (token && /lookaside\.fbsbx\.com|graph\.facebook\.com|fbcdn\.net/.test(url)) {
      headers.Authorization = `Bearer ${token}`;
    }
    const res = await fetch(url, { headers });
    if (!res.ok) return null;
    const blob = await res.blob();
    const kind = blob.type.startsWith('audio/') ? 'audio' : blob.type.startsWith('image/') ? 'image' : null;
    if (!kind) return null;
    const mimeType = blob.type.split('/')[1] || (kind === 'audio' ? 'mp4' : 'jpg');
    const ext = kind === 'image' ? mimeType.replace('jpeg', 'jpg') : mimeType;
    const pathname = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const stored = await put(pathname, blob, { access: 'public', addRandomSuffix: false });
    return stored.url;
  } catch (err) {
    console.warn('[Media] Failed to store remote media:', err);
    return null;
  }
}