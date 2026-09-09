// Voice message processing — download securely, transcribe via the AI provider, preserve original.
// Original audio is stored (via storeRemoteMedia), transcript is merged into extraction.
// Best-effort: if the provider has no transcription capability it returns null (message still kept).

import { transcribeAudio } from './ai.js';

export async function transcribeAudioUrl(url: string, conversationId?: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    const mime = res.headers.get('content-type') || 'audio/mp4';
    const transcript = await transcribeAudio(
      { base64: buffer.toString('base64'), mimeType: mime },
      { conversationId }
    );
    if (typeof transcript === 'string' && transcript.trim()) {
      return transcript.trim();
    }
    return null;
  } catch (err) {
    console.warn('[Audio] Transcription failed:', err);
    return null;
  }
}