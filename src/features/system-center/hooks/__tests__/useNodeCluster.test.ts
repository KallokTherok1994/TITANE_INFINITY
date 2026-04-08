import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { tauriClient } from '../../../../lib/tauriClient';

import { useNodeCluster } from '../useNodeCluster';

vi.mock('../../../../lib/tauriClient', () => ({
  tauriClient: {
    scGetClusterStatus: vi.fn(),
    scGetClusterPeers: vi.fn(),
    scInitializeCluster: vi.fn(),
    scShutdownCluster: vi.fn(),
  },
}));

describe('useNodeCluster', () => {
  const mockedTauriClient = vi.mocked(tauriClient);
  const clusterStatus = {
    initialized: true,
    peers: [],
    stats: {
      node_id: 'node-1',
      role: 'Root',
      peer_count: 0,
      total_health: 100,
      avg_load: 12,
      uptime_seconds: 42,
      is_initialized: true,
    },
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mockedTauriClient.scGetClusterStatus.mockResolvedValue(clusterStatus as never);
    mockedTauriClient.scGetClusterPeers.mockResolvedValue([] as never);
    mockedTauriClient.scInitializeCluster.mockResolvedValue(undefined as never);
    mockedTauriClient.scShutdownCluster.mockResolvedValue(undefined as never);
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('avoids overlapping polling refreshes while the previous cluster status request is still pending', async () => {
    let releaseRequest: ((value: typeof clusterStatus) => void) | null = null;

    mockedTauriClient.scGetClusterStatus
      .mockResolvedValueOnce(clusterStatus as never)
      .mockImplementationOnce(
        () =>
          new Promise(resolve => {
            releaseRequest = resolve as (value: typeof clusterStatus) => void;
          }) as never
      );

    const { result, unmount } = renderHook(() => useNodeCluster(true, 1000));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isInitialized).toBe(true);
    expect(mockedTauriClient.scGetClusterStatus).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(1000);
      await Promise.resolve();
    });

    expect(mockedTauriClient.scGetClusterStatus).toHaveBeenCalledTimes(2);

    await act(async () => {
      vi.advanceTimersByTime(1000);
      await Promise.resolve();
    });

    expect(mockedTauriClient.scGetClusterStatus).toHaveBeenCalledTimes(2);

    await act(async () => {
      releaseRequest?.(clusterStatus);
      await Promise.resolve();
    });

    unmount();
  });
});
