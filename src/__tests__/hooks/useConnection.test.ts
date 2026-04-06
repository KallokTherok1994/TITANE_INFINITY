import { describe, expect, it } from 'vitest';

import { deriveConnectionState } from '@/hooks/useConnection';

describe('useConnection truth helpers', () => {
  it('reports OFFLINE when backend truth is unavailable and no provider is proven', () => {
    expect(deriveConnectionState(false, [])).toBe('OFFLINE');
  });

  it('reports LOCAL_ONLY only when a real local provider is present', () => {
    expect(
      deriveConnectionState(false, [
        {
          provider: 'local',
          available: true,
          latency_ms: 0,
          models: ['echo'],
        },
      ])
    ).toBe('LOCAL_ONLY');
  });

  it('reports PARTIAL when only some non-local providers are reachable', () => {
    expect(
      deriveConnectionState(false, [
        {
          provider: 'gemini',
          available: false,
          latency_ms: 0,
          models: [],
        },
        {
          provider: 'ollama',
          available: true,
          latency_ms: 90,
          models: ['gemma2:2b'],
        },
      ])
    ).toBe('PARTIAL');
  });
});
