// Provider-agnostic AI facade — the single entry point business logic uses.
//
// Replaces the old server/ai/gemini.ts wrapper. Responsibilities:
//   - select the active provider (env-driven, default Ollama)
//   - forward calls (structured JSON, free text, vision, audio)
//   - record usage to ai_usage_log (fire-and-forget, never blocks callers)
//   - expose active models + provider health for status endpoints

import { getAIProvider, getProviderHealth } from './provider/index.js';
import { getActiveModels } from './provider/config.js';
import { logAiUsage } from './audit.js';
import type {
  AIProvider,
  AudioInput,
  ImageAnalysisOptions,
  ProcessEnv,
  ProviderHealth,
  RequestMeta,
  StructuredOutputOptions,
  TextOptions,
} from './provider/types.js';

export type {
  AIProvider,
  AudioInput,
  ImageAnalysisOptions,
  ProcessEnv,
  ProviderHealth,
  RequestMeta,
  StructuredOutputOptions,
  TextOptions,
};
export { AiProviderError } from './provider/types.js';
export { getActiveModels } from './provider/config.js';

function modelFor(agent: string | undefined): string {
  const { text } = getActiveModels();
  return text || agent || 'ollama';
}

async function recordUsage(
  meta: RequestMeta,
  status: 'ok' | 'error',
  start: number,
  detail?: { entity?: string; entityId?: string; conversationId?: string }
): Promise<void> {
  try {
    await logAiUsage({
      entity: detail?.entity || meta.agent || 'unknown',
      entityId: detail?.entityId || 'unknown',
      agent: meta.agent || 'ai',
      model: modelFor(meta.agent),
      event: meta.event || 'generate',
      status,
      durationMs: Date.now() - start,
      conversationId: detail?.conversationId || meta.conversationId,
    });
  } catch {
    // logging must never break the caller
  }
}

export async function generateStructured<T>(opts: StructuredOutputOptions<T>): Promise<T> {
  const provider = getAIProvider();
  const start = Date.now();
  try {
    const value = await provider.generateStructured<T>(opts);
    void recordUsage(opts, 'ok', start, { entity: opts.entity, entityId: opts.entityId });
    return value;
  } catch (err) {
    void recordUsage(opts, 'error', start, { entity: opts.entity, entityId: opts.entityId });
    throw err;
  }
}

export async function generateText(opts: TextOptions): Promise<string> {
  const provider = getAIProvider();
  const start = Date.now();
  try {
    const text = await provider.generateText(opts);
    void recordUsage(opts, 'ok', start);
    return text;
  } catch (err) {
    void recordUsage(opts, 'error', start);
    throw err;
  }
}

export async function analyzeImages<T>(opts: ImageAnalysisOptions<T>): Promise<T> {
  const provider = getAIProvider();
  const start = Date.now();
  try {
    const value = await provider.analyzeImage<T>(opts);
    void recordUsage(opts, 'ok', start, { entity: opts.entity, entityId: opts.entityId });
    return value;
  } catch (err) {
    void recordUsage(opts, 'error', start, { entity: opts.entity, entityId: opts.entityId });
    throw err;
  }
}

/** Best-effort transcription. Unsupported providers return null (never faked). */
export async function transcribeAudio(
  input: AudioInput,
  opts?: { conversationId?: string; timeoutMs?: number }
): Promise<string | null> {
  const provider = getAIProvider();
  if (!provider.transcribeAudio) return null;
  const start = Date.now();
  try {
    const text = await provider.transcribeAudio(input, opts);
    if (typeof text === 'string' && text.trim()) {
      void recordUsage(
        { agent: 'transcription', event: 'transcribe_audio', conversationId: opts?.conversationId },
        'ok',
        start,
        { entity: 'audio', entityId: 'message' }
      );
    }
    return text;
  } catch (err) {
    void recordUsage(
      { agent: 'transcription', event: 'transcribe_audio', conversationId: opts?.conversationId },
      'error',
      start,
      { entity: 'audio', entityId: 'message' }
    );
    return null; // transcription is never allowed to break the message pipeline
  }
}

export const providerHealth = getProviderHealth;
export const getActiveTextModel = () => getActiveModels().text;
export const getActiveVisionModel = () => getActiveModels().vision;