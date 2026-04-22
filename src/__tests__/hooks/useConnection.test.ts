import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { REFRESH_INTERVALS } from '@/constants/timeouts';
import { deriveConnectionState, useConnection } from '@/hooks/useConnection';
import { tauriClient } from '@/services/tauriClient';

vi.mock('@/services/tauriClient', () => ({
  tauriClient: {
    chatCheckProviders: vi.fn(),
    chatGetProvidersStatus: vi.fn(),
  },
}));

describe('useConnection truth helpers', () => {
  const mockedTauriClient = vi.mocked(tauriClient);

  beforeEach(() => {
    vi.useFakeTimers();
    mockedTauriClient.chatCheckProviders.mockReset();
    mockedTauriClient.chatGetProvidersStatus.mockReset();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

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
          models: ['llama3.1:latest'],
        },
      ])
    ).toBe('PARTIAL');
  });

  it('avoids overlapping connection checks while a previous provider probe is still pending', async () => {
    let releaseProbe:
      | ((
          value: Array<{
            provider: string;
            available: boolean;
            latency_ms: number;
            models: string[];
          }>
        ) => void)
      | null = null;

    mockedTauriClient.chatCheckProviders.mockImplementation(
      () =>
        new Promise(resolve => {
          releaseProbe = resolve as typeof releaseProbe;
        })
    );

    const { unmount } = renderHook(() => useConnection());

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockedTauriClient.chatCheckProviders).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(REFRESH_INTERVALS.SLOW);
      await Promise.resolve();
    });

    expect(mockedTauriClient.chatCheckProviders).toHaveBeenCalledTimes(1);

    await act(async () => {
      releaseProbe?.([
        {
          provider: 'ollama',
          available: true,
          latency_ms: 42,
          models: ['llama3.2'],
        },
      ]);
      await Promise.resolve();
    });

    unmount();
  });
});
