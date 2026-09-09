// Provider-agnostic AI contract.
//
// The application NEVER talks to a specific AI vendor directly. Business logic
// depends on this interface only, so switching providers is a registry change.

/** Process env shape (kept minimal to avoid a hard NodeJS namespace dependency). */
export type ProcessEnv = Record<string, string | undefined>;

export interface RequestMeta {
  /** Usage-logging tag, e.g. 'extraction' | 'content' | 'image' | 'validation'. */
  agent?: string;
  /** Usage-logging event name. */
  event?: string;
  /** Tracing/idempotency context. */
  conversationId?: string;
}

export interface StructuredOutputOptions<T> extends RequestMeta {
  /** Untrusted user content — treated strictly as DATA by the provider. */
  prompt: string;
  /** Hard system instructions. Sent on its own channel, never mixed with user data. */
  system?: string;
  /** Human description of the expected JSON shape (goes in logs/docs, not the payload). */
  schemaDescription?: string;
  /** Optional pipeline-level validation/coercion (e.g. zod schema). Applied before returning. */
  validate?: (value: unknown) => T;
  entity?: string;
  entityId?: string;
  maxRetries?: number;
  timeoutMs?: number;
  temperature?: number;
}

export interface TextOptions extends RequestMeta {
  prompt: string;
  system?: string;
  maxRetries?: number;
  timeoutMs?: number;
  temperature?: number;
}

export interface ImageInput {
  id: string;
  dataUrl: string; // data:image/*;base64,<pixels>
}

export interface ImageAnalysisOptions<T> extends RequestMeta {
  prompt: string;
  system?: string;
  images: ImageInput[];
  schemaDescription?: string;
  entity?: string;
  entityId?: string;
  validate?: (value: unknown) => T;
  maxRetries?: number;
  timeoutMs?: number;
  temperature?: number;
}

export interface AudioInput {
  url?: string;
  base64?: string;
  mimeType?: string;
}

/** Independent per-call health assessment of the active AI provider. */
export interface ProviderHealth {
  provider: string;
  configured: boolean; // provider selected + text model configured (env-level)
  available: boolean; // provider endpoint reachable
  modelAvailable: boolean; // configured text model present in provider
  visionModelAvailable: boolean; // configured vision model present (false when none configured)
  baseUrl: string;
  model?: string;
  visionModel?: string;
  error?: string;
}

export type AiProviderErrorCode =
  | 'not_configured'
  | 'unavailable'
  | 'timeout'
  | 'invalid_output'
  | 'config'
  | 'capability_unsupported';

export class AiProviderError extends Error {
  constructor(
    message: string,
    public readonly code: AiProviderErrorCode,
    public readonly retryable: boolean
  ) {
    super(message);
    this.name = 'AiProviderError';
  }
}

export interface AIProvider {
  readonly id: string;
  generateStructured<T>(opts: StructuredOutputOptions<T>): Promise<T>;
  generateText(opts: TextOptions): Promise<string>;
  analyzeImage<T>(opts: ImageAnalysisOptions<T>): Promise<T>;
  /** Returns null when the provider has no audio modality (honest unsupported — never faked). */
  transcribeAudio?(input: AudioInput, opts?: { conversationId?: string; timeoutMs?: number }): Promise<string | null>;
  healthCheck(opts?: { timeoutMs?: number }): Promise<ProviderHealth>;
}