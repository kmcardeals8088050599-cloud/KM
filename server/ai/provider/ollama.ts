// Ollama REST provider (Ollama HTTP API, local-first, no cloud keys).
//
//  - generateText        → POST /api/generate, stream:false, returns .response
//  - generateStructured  → same endpoint with format:"json" + fenced-JSON fallback parsing
//  - analyzeImage        → same endpoint with multimodal base64 frames (vision model)
//  - transcribeAudio     → unsupported (honest null; the caller keeps the original audio)
//  - healthCheck         → GET /api/tags (model inventory)
//
// Retry policy: transient network/timeout errors and unparseable output are retried
// with small backoff up to maxRetries. Output is validated through opts.validate when
// provided; invalid output is retried, then surfaces as AiProviderError('invalid_output').

import {
  AiProviderError,
  type AIProvider,
  type AudioInput,
  type ImageAnalysisOptions,
  type ProviderHealth,
  type ProcessEnv,
  type StructuredOutputOptions,
  type TextOptions,
} from './types.js';
import { readProviderConfig, type ProviderConfig } from './config.js';

const RETRY_BACKOFF_MS = 300;

export class OllamaProvider implements AIProvider {
  readonly id = 'ollama';

  async generateStructured<T>(opts: StructuredOutputOptions<T>, env: ProcessEnv = process.env): Promise<T> {
    const cfg = readProviderConfig(env);
    assertTextModel(cfg);
    const body = {
      model: cfg.ollamaModel,
      system: opts.system,
      prompt: opts.prompt,
      stream: false,
      format: 'json',
      options: { temperature: opts.temperature ?? 0.2 },
    };
    return this.withRetry<T>(opts, cfg, async () => {
      const json = await this.request(cfg, '/api/generate', body, opts.timeoutMs);
      const raw = typeof json.response === 'string' ? json.response : '';
      if (!raw.trim()) {
        throw new AiProviderError('Ollama returned an empty response', 'invalid_output', true);
      }
      let value: unknown;
      try {
        value = extractJson(raw);
      } catch (err: any) {
        throw new AiProviderError(
          `Ollama returned unparseable JSON: ${err?.message || String(err)}`,
          'invalid_output',
          true
        );
      }
      if (opts.validate) {
        try {
          value = opts.validate(value);
        } catch (err: any) {
          throw new AiProviderError(
            `Ollama output failed validation: ${err?.message || String(err)}`,
            'invalid_output',
            true
          );
        }
      }
      return value as T;
    });
  }

  async generateText(opts: TextOptions, env: ProcessEnv = process.env): Promise<string> {
    const cfg = readProviderConfig(env);
    assertTextModel(cfg);
    const body = {
      model: cfg.ollamaModel,
      system: opts.system,
      prompt: opts.prompt,
      stream: false,
      options: { temperature: opts.temperature ?? 0.7 },
    };
    return this.withRetry<string>(opts, cfg, async () => {
      const json = await this.request(cfg, '/api/generate', body, opts.timeoutMs);
      return typeof json.response === 'string' ? json.response.trim() : '';
    });
  }

  async analyzeImage<T>(opts: ImageAnalysisOptions<T>, env: ProcessEnv = process.env): Promise<T> {
    const cfg = readProviderConfig(env);
    const visionModel = cfg.ollamaVisionModel;
    if (!visionModel) {
      throw new AiProviderError('OLLAMA_VISION_MODEL not configured', 'not_configured', false);
    }
    if (opts.images.length === 0) {
      throw new AiProviderError('analyzeImage requires at least one image', 'config', false);
    }
    const body = {
      model: visionModel,
      system: opts.system,
      prompt: opts.prompt,
      stream: false,
      format: 'json',
      images: opts.images.map(i => extractBase64(i.dataUrl)),
      options: { temperature: opts.temperature ?? 0.2 },
    };
    return this.withRetry<T>(opts, cfg, async () => {
      const json = await this.request(cfg, '/api/generate', body, opts.timeoutMs);
      const raw = typeof json.response === 'string' ? json.response : '';
      let value: unknown;
      try {
        value = extractJson(raw);
      } catch (err: any) {
        throw new AiProviderError(
          `Ollama vision returned unparseable JSON: ${err?.message || String(err)}`,
          'invalid_output',
          true
        );
      }
      if (opts.validate) value = opts.validate(value);
      return value as T;
    });
  }

  /** Ollama has no audio-input modality in this deployment → honest null (no fake transcripts). */
  async transcribeAudio(_input: AudioInput, _opts?: { conversationId?: string; timeoutMs?: number }): Promise<string | null> {
    return null;
  }

  async healthCheck(opts?: { timeoutMs?: number }, env: ProcessEnv = process.env): Promise<ProviderHealth> {
    const cfg = readProviderConfig(env);
    const timeout = Math.min(opts?.timeoutMs ?? 3_000, cfg.timeoutMs);
    const base: ProviderHealth = {
      provider: cfg.provider,
      configured: Boolean(cfg.ollamaModel),
      available: false,
      modelAvailable: false,
      visionModelAvailable: false,
      baseUrl: cfg.ollamaBaseUrl,
      model: cfg.ollamaModel,
      visionModel: cfg.ollamaVisionModel,
    };
    try {
      const json = await this.request(cfg, '/api/tags', undefined, timeout, 'GET');
      const names = new Set(
        (Array.isArray(json.models) ? json.models : []).map((m: { name?: string }) =>
          normalizeModelName(m?.name || '')
        )
      );
      return {
        ...base,
        available: true,
        modelAvailable: names.has(normalizeModelName(cfg.ollamaModel)),
        visionModelAvailable: cfg.ollamaVisionModel
          ? names.has(normalizeModelName(cfg.ollamaVisionModel))
          : false,
      };
    } catch (err: any) {
      return {
        ...base,
        available: false,
        error: err instanceof AiProviderError ? err.message : String(err?.message || err),
      };
    }
  }

  // -------------------------------------------------------------------------
  // Internals
  // -------------------------------------------------------------------------

  private async withRetry<T>(
    opts: { maxRetries?: number },
    cfg: ProviderConfig,
    run: () => Promise<T>
  ): Promise<T> {
    const maxRetries = opts.maxRetries ?? cfg.maxRetries;
    const attempts = maxRetries + 1;
    let attempt = 0;
    for (;;) {
      try {
        return await run();
      } catch (err) {
        const retryable = isRetryable(err);
        attempt += 1;
        if (retryable && attempt < attempts) {
          await sleep(RETRY_BACKOFF_MS * attempt);
          continue;
        }
        if (err instanceof AiProviderError) throw err;
        throw new AiProviderError(`Ollama request failed: ${String(err)}`, 'unavailable', true);
      }
    }
  }

  private async request(
    cfg: ProviderConfig,
    path: string,
    body: Record<string, unknown> | undefined,
    timeoutMs: number = cfg.timeoutMs,
    method: 'POST' | 'GET' = 'POST'
  ): Promise<any> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(`${cfg.ollamaBaseUrl}${path}`, {
        method,
        headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
      const text = await res.text();
      if (!res.ok) {
        const snippet = text.slice(0, 300);
        throw new AiProviderError(
          `Ollama API error ${res.status}: ${snippet || 'no body'}`,
          'unavailable',
          true
        );
      }
      if (!text.trim()) return {};
      try {
        return JSON.parse(text);
      } catch {
        throw new AiProviderError('Ollama returned a non-JSON response', 'invalid_output', true);
      }
    } catch (err: any) {
      if (err instanceof AiProviderError) throw err;
      if (isAbortError(err)) {
        throw new AiProviderError(`Ollama request timed out after ${timeoutMs}ms`, 'timeout', true);
      }
      throw new AiProviderError(`Ollama request failed: ${err?.message || String(err)}`, 'unavailable', true);
    } finally {
      clearTimeout(timer);
    }
  }
}

function assertTextModel(cfg: ProviderConfig): void {
  if (!cfg.ollamaModel) {
    throw new AiProviderError('OLLAMA_MODEL not configured', 'not_configured', false);
  }
}

function isRetryable(err: unknown): boolean {
  return err instanceof AiProviderError && err.retryable;
}

function isAbortError(err: any): boolean {
  return (
    err?.name === 'AbortError' ||
    err?.name === 'TimeoutError' ||
    (typeof err?.message === 'string' && /aborted|timed out/i.test(err.message))
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** JSON.parse with tolerance for markdown fences and stray prose. */
function extractJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenced) return JSON.parse(fenced[1].trim());
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start >= 0 && end > start) return JSON.parse(raw.slice(start, end + 1));
    const arrStart = raw.indexOf('[');
    const arrEnd = raw.lastIndexOf(']');
    if (arrStart >= 0 && arrEnd > arrStart) return JSON.parse(raw.slice(arrStart, arrEnd + 1));
    throw new Error('Could not parse JSON from Ollama output');
  }
}

/** Strip "data:<mime>;base64," prefix → raw base64 payload. */
function extractBase64(dataUrl: string): string {
  const comma = dataUrl.indexOf(',');
  if (comma >= 0 && /^data:[^,]+;base64$/i.test(dataUrl.slice(0, comma))) {
    return dataUrl.slice(comma + 1);
  }
  return dataUrl;
}

/** "qwen2.5:7b" and "qwen2.5:7b:latest" are the same model. */
function normalizeModelName(name: string): string {
  const base = name.trim();
  return base.endsWith(':latest') ? base.slice(0, base.length - ':latest'.length) : base;
}