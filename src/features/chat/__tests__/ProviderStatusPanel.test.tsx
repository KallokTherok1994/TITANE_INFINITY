import { describe, expect, it } from 'vitest';

import { mapBackendProviderStatus } from '../ProviderStatusPanel';

describe('ProviderStatusPanel truth mapping', () => {
  it('maps unavailable providers to offline without inventing latency', () => {
    const result = mapBackendProviderStatus({
      provider: 'ollama',
      available: false,
      latency_ms: 842,
      models: ['qwen2.5'],
      error: 'Ollama unreachable',
    });

    expect(result.name).toBe('Ollama');
    expect(result.status).toBe('offline');
    expect(result.latency).toBeUndefined();
    expect(result.error).toBe('Ollama unreachable');
  });

  it('marks slow available providers as degraded', () => {
    const result = mapBackendProviderStatus(
      {
        provider: 'gemini',
        available: true,
        latency_ms: 3200,
        models: ['gemini-2.0-flash-exp'],
      },
      61
    );

    expect(result.name).toBe('Gemini');
    expect(result.status).toBe('degraded');
    expect(result.latency).toBe(3200);
    expect(result.cacheHitRate).toBe(61);
  });

  it('preserves local fallback as explicit backend truth', () => {
    const result = mapBackendProviderStatus({
      provider: 'local',
      available: true,
      latency_ms: 12,
      models: ['echo'],
    });

    expect(result.name).toBe('Fallback local');
    expect(result.status).toBe('online');
  });
});
