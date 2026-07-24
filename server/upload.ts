import { Request, Response } from 'express';
import { del } from '@vercel/blob';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

async function issueUploadToken(req: Request, res: Response, pathPrefix: string): Promise<void> {
  try {
    const body = req.body as HandleUploadBody;
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname: string) => {
        if (!pathname.startsWith(`${pathPrefix}/`)) {
          throw new Error('Invalid upload path');
        }
        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: MAX_IMAGE_BYTES,
          addRandomSuffix: true
        };
      }
    });
    res.json(jsonResponse);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Upload token request failed' });
  }
}

export async function carUploadToken(req: Request, res: Response): Promise<void> {
  await issueUploadToken(req, res, 'cars');
}

export async function exchangeUploadToken(req: Request, res: Response): Promise<void> {
  await issueUploadToken(req, res, 'exchanges');
}

export async function deleteBlobsForUrls(urls: string[]): Promise<void> {
  await Promise.all(
    urls.map(url => del(url).catch(() => {}))
  );
}
