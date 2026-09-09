// Conversation transcript builder — converts stored messages into a single, LLM-friendly
// transcript with ordering. Preserves message type markers (text, audio transcript, image summary).

import type { StoredMessage } from './db.js';
import type { MessageAttachment } from '../../src/types/ai.js';

export function buildTranscript(messages: StoredMessage[]): string {
  const lines: string[] = [];

  for (const msg of messages) {
    const time = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour12: false }) : '';
    const sender = msg.role === 'from' ? 'Seller' : 'System';

    if (msg.text) {
      lines.push(`[${time}] ${sender}: ${msg.text}`);
    }
    if (msg.media && msg.media.length > 0) {
      for (const att of msg.media) {
        lines.push(`[${time}] ${sender} sent ${describeAttachment(att)}`);
      }
    }
  }

  return lines.join('\n');
}

function describeAttachment(att: MessageAttachment): string {
  switch (att.kind) {
    case 'image':
      return `[image: ${att.text || `${att.mimeType || ''}`.trim()}]`.replace('[]', 'photo');
    case 'audio':
      return `[voice message transcription: ${att.text || 'unavailable'}]`;
    case 'document':
      return `[document: ${att.text || att.mimeType || 'attachment'}]`;
    case 'video':
      return '[video attachment]';
    default:
      return '[attachment]';
  }
}