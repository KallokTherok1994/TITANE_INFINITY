import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useProviderStatus } from '@/hooks/useProviderStatus';
import { tauriClient } from '@/services/tauriClient';

vi.mock('@/services/tauriClient', () => ({
  tauriClient: {
    chatGetProvidersStatus: vi.fn(),
    chatCheckProviders: vi.fn(),
  },
}));

describe('useProviderStatus', () => {
  const mockedTauriClient = vi.mocked(tauriClient);

  beforeEach(() => {
    vi.useFakeTimers();
    mockedTauriClient.chatGetProvidersStatus.mockReset();
    mockedTauriClient.chatCheckProviders.mockReset();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('avoids overlapping auto-refresh calls while the previous provider status request is still pending', async () => {
    let releaseRefresh:
      | ((
          value: Array<{
            provider: string;
            available: boolean;
            latency_ms: number;
            models: string[];
          }>
        ) => void)
      | null = null;

    mockedTauriClient.chatGetProvidersStatus.mockImplementation(
      () =>
        new Promise(resolve => {
          releaseRefresh = resolve as typeof releaseRefresh;
        })
    );

    const { unmount } = renderHook(() =>
      useProviderStatus({
        autoRefresh: true,
        refreshInterval: 10,
      })
    );

    await act(async () => {
      await Promise.resolve();
    });

    const initialCallCount = mockedTauriClient.chatGetProvidersStatus.mock.calls.length;
    expect(initialCallCount).toBeGreaterThan(0);

    await act(async () => {
      vi.advanceTimersByTime(50);
      await Promise.resolve();
    });

    expect(mockedTauriClient.chatGetProvidersStatus).toHaveBeenCalledTimes(
      initialCallCount
    );

    await act(async () => {
      releaseRefresh?.([
        {
          provider: 'ollama',
          available: true,
          latency_ms: 25,
          models: ['llama3.2'],
        },
      ]);
      await Promise.resolve();
    });

    unmount();
  });
});
