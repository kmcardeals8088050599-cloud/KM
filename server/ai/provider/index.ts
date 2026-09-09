// Provider registry + selection. Adding a new provider = register a factory here.

import { OllamaProvider } from './ollama.js';
import { AiProviderError, type AIProvider, type ProcessEnv, type ProviderHealth } from './types.js';
import { AI_PROVIDER_DEFAULT } from './config.js';

const REGISTRY: Record<string, () => AIProvider> = {
  ollama: () => new OllamaProvider(),
};

export function getAIProvider(env: ProcessEnv = process.env): AIProvider {
  const id = (env.AI_PROVIDER || AI_PROVIDER_DEFAULT).trim().toLowerCase();
  const factory = REGISTRY[id];
  if (!factory) {
    throw new AiProviderError(
      `Unsupported AI_PROVIDER "${id}". Supported: ${Object.keys(REGISTRY).join(', ')}`,
      'config',
      false
    );
  }
  return factory();
}

/** Non-throwing health assessment for status endpoints. */
export async function getProviderHealth(env: ProcessEnv = process.env): Promise<ProviderHealth> {
  const id = (env.AI_PROVIDER || AI_PROVIDER_DEFAULT).trim().toLowerCase();
  try {
    return await getAIProvider(env).healthCheck({ timeoutMs: 3_000 });
  } catch (err: any) {
    return {
      provider: id,
      configured: false,
      available: false,
      modelAvailable: false,
      visionModelAvailable: false,
      baseUrl: '',
      error: err instanceof AiProviderError ? err.message : String(err?.message || err),
    };
  }
}