import { describe, expect, it } from 'vitest';
import { DEFAULT_OLLAMA_MODEL, DEFAULT_OLLAMA_URL } from '@/config/ollamaDefaults';
import {
  mergeRuntimeConfigWithOllamaStatus,
  normalizeOllamaRuntimeStatus,
  normalizeRuntimeConfig,
} from '../ConfigurationHub';

describe('ConfigurationHub runtime config helpers', () => {
  it('normalizes runtime config with explicit ollama truth fields', () => {
    const config = normalizeRuntimeConfig({
      ollamaUrl: 'https://titane.example.com',
      ollamaModel: 'llama3.1:latest',
      ollamaEndpointKind: 'remote_cloudflare',
      ollamaEndpointSource: 'runtime_persisted',
      ollamaModelSource: 'runtime_persisted',
      ollamaNetworkUsed: true,
      ollamaHealth: 'healthy',
      secretsMode: 'encrypted',
      geminiConfigured: false,
      timestamp: 123,
    });

    expect(config.ollama_endpoint_kind).toBe('remote_cloudflare');
    expect(config.ollama_endpoint_source).toBe('runtime_persisted');
    expect(config.ollama_network_used).toBe(true);
    expect(config.ollama_health).toBe('healthy');
  });

  it('merges backend ollama status over runtime snapshot defaults', () => {
    const runtime = normalizeRuntimeConfig({
      ollamaUrl: DEFAULT_OLLAMA_URL,
      ollamaModel: DEFAULT_OLLAMA_MODEL,
      secretsMode: 'encrypted',
      geminiConfigured: false,
      timestamp: 1,
    });
    const status = normalizeOllamaRuntimeStatus({
      ok: true,
      content: {
        available: true,
        url: 'https://titane.example.com',
        model: 'llama3.1:latest',
        endpoint_kind: 'remote_cloudflare',
        endpoint_source: 'runtime_persisted',
        model_source: 'runtime_persisted',
        network_used: true,
        health: 'healthy',
      },
    });

    const merged = mergeRuntimeConfigWithOllamaStatus(runtime, status);

    expect(merged.ollama_url).toBe('https://titane.example.com');
    expect(merged.ollama_endpoint_kind).toBe('remote_cloudflare');
    expect(merged.ollama_endpoint_source).toBe('runtime_persisted');
    expect(merged.ollama_network_used).toBe(true);
    expect(merged.ollama_health).toBe('healthy');
  });
});