// AI provider configuration — read from environment at call time so tests and
// deployments can configure the provider without redeploys.
//
// Defaults target a local Ollama installation; every value is overridable.

import type { ProcessEnv } from './types.js';

export const AI_PROVIDER_DEFAULT = 'ollama';
export const OLLAMA_BASE_URL_DEFAULT = 'http://localhost:11434';
export const OLLAMA_MODEL_DEFAULT = 'qwen2.5:7b';
export const OLLAMA_VISION_MODEL_DEFAULT = 'qwen2.5vl:7b';
export const AI_TIMEOUT_MS_DEFAULT = 120_000;
export const AI_MAX_RETRIES_DEFAULT = 2;
export const AI_MAX_CONCURRENCY_DEFAULT = 4;

export interface ProviderConfig {
  provider: string;
  ollamaBaseUrl: string;
  ollamaModel: string;
  ollamaVisionModel?: string;
  timeoutMs: number;
  maxRetries: number;
  maxConcurrency: number;
}

function toInt(envValue: string | undefined, fallback: number, min: number): number {
  if (!envValue) return fallback;
  const n = Number.parseInt(envValue, 10);
  if (Number.isNaN(n) || n < min) return fallback;
  return n;
}

export function readProviderConfig(env: ProcessEnv = process.env): ProviderConfig {
  const provider = (env.AI_PROVIDER || AI_PROVIDER_DEFAULT).trim().toLowerCase();
  return {
    provider,
    ollamaBaseUrl: (env.OLLAMA_BASE_URL || OLLAMA_BASE_URL_DEFAULT).trim().replace(/\/+$/, ''),
    ollamaModel: (env.OLLAMA_MODEL || OLLAMA_MODEL_DEFAULT).trim(),
    ollamaVisionModel:
      env.OLLAMA_VISION_MODEL && env.OLLAMA_VISION_MODEL.trim()
        ? env.OLLAMA_VISION_MODEL.trim()
        : undefined,
    timeoutMs: toInt(env.AI_REQUEST_TIMEOUT_MS, AI_TIMEOUT_MS_DEFAULT, 1_000),
    maxRetries: toInt(env.AI_MAX_RETRIES, AI_MAX_RETRIES_DEFAULT, 0),
    maxConcurrency: toInt(env.AI_MAX_CONCURRENCY, AI_MAX_CONCURRENCY_DEFAULT, 1),
  };
}

/** Text + optional vision model used for usage logging and status. */
export function getActiveModels(env: ProcessEnv = process.env): {
  text: string;
  vision?: string;
} {
  const cfg = readProviderConfig(env);
  return { text: cfg.ollamaModel, vision: cfg.ollamaVisionModel };
}