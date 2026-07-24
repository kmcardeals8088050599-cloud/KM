import { upload } from '@vercel/blob/client';
import { getAuthToken } from './api';

export interface ImageUploadOutcome {
  file: File;
  url?: string;
  error?: string;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Only JPG, PNG, or WEBP images are allowed';
  }
  if (file.size > MAX_BYTES) {
    return 'Image must be smaller than 5MB';
  }
  return null;
}

export async function uploadImages(
  files: File[],
  kind: 'car' | 'exchange',
  onProgress?: (fileIndex: number, percentage: number) => void
): Promise<ImageUploadOutcome[]> {
  const handleUploadUrl = kind === 'car' ? '/api/upload/token/car' : '/api/upload/token/exchange';
  const pathPrefix = kind === 'car' ? 'cars' : 'exchanges';
  const headers: Record<string, string> = {};
  if (kind === 'car') {
    const token = getAuthToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  return Promise.all(
    files.map(async (file, i) => {
      const validationError = validateImageFile(file);
      if (validationError) {
        return { file, error: validationError };
      }
      try {
        const blob = await upload(`${pathPrefix}/${Date.now()}-${i}-${file.name}`, file, {
          access: 'public',
          handleUploadUrl,
          headers,
          onUploadProgress: event => onProgress?.(i, event.percentage)
        });
        return { file, url: blob.url };
      } catch (err: any) {
        return { file, error: err.message || 'Upload failed' };
      }
    })
  );
}
