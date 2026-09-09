import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const putMock = vi.hoisted(() => vi.fn());

vi.mock('@vercel/blob', () => ({ put: putMock }));

import { storeRemoteMedia } from '../whatsapp-api.js';

function fakeFetchResponse(body: Blob, contentType: string): Response {
  return {
    ok: true,
    blob: async () => body,
    headers: new Headers({ 'content-type': contentType }),
  } as unknown as Response;
}

describe('storeRemoteMedia', () => {
  beforeEach(() => {
    putMock.mockReset();
    putMock.mockImplementation(async (pathname: string, _blob: Blob, _opts: any) => ({
      url: `https://blob.vercel-storage.com/${pathname}`,
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('stores an image and returns its durable URL', async () => {
    const body = new Blob(['fake-image'], { type: 'image/jpeg' });
    vi.stubGlobal('fetch', vi.fn(async () => fakeFetchResponse(body, 'image/jpeg')));

    const url = await storeRemoteMedia('https://placeholder.in/img', 'whatsapp/wamid-1');

    expect(putMock).toHaveBeenCalledTimes(1);
    const [pathname] = putMock.mock.calls[0];
    expect(pathname).toMatch(/^whatsapp\/wamid-1\/\d+-[a-z0-9]+\.jpg$/);
    expect(url).toMatch(/^https:\/\/blob\.vercel-storage\.com\//);
  });

  it('stores an audio voice note (fixes dead transcription path)', async () => {
    const body = new Blob(['fake-ogg'], { type: 'audio/ogg' });
    vi.stubGlobal('fetch', vi.fn(async () => fakeFetchResponse(body, 'audio/ogg')));

    const url = await storeRemoteMedia('https://placeholder.in/voice.ogg', 'whatsapp/wamid-2');

    expect(putMock).toHaveBeenCalledTimes(1);
    expect(url).toMatch(/\.ogg$/);
  });

  it('rejects non-media payloads without calling blob put', async () => {
    const body = new Blob(['fake-doc'], { type: 'application/pdf' });
    vi.stubGlobal('fetch', vi.fn(async () => fakeFetchResponse(body, 'application/pdf')));

    const url = await storeRemoteMedia('https://placeholder.in/doc.pdf', 'whatsapp/wamid-3');

    expect(url).toBeNull();
    expect(putMock).not.toHaveBeenCalled();
  });
});