import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { tauriClient } from '../../../../lib/tauriClient';

import { useSystemLogs } from '../useSystemLogs';

vi.mock('../../../../lib/tauriClient', () => ({
  tauriClient: {
    scGetLogs: vi.fn(),
    scGetLogStats: vi.fn(),
    scClearLogs: vi.fn(),
    scAddLog: vi.fn(),
  },
}));

describe('useSystemLogs', () => {
  const mockedTauriClient = vi.mocked(tauriClient);
  const logs = [
    {
      id: 'log-1',
      timestamp: Date.now(),
      level: 'Info',
      source: 'system',
      message: 'ready',
    },
  ];
  const stats = {
    total_entries: 1,
    by_level: { Info: 1 },
    by_source: { system: 1 },
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mockedTauriClient.scGetLogs.mockResolvedValue(logs as never);
    mockedTauriClient.scGetLogStats.mockResolvedValue(stats as never);
    mockedTauriClient.scClearLogs.mockResolvedValue(undefined as never);
    mockedTauriClient.scAddLog.mockResolvedValue(undefined as never);
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('avoids overlapping log refreshes while the previous refresh is still pending', async () => {
    let resolveLogs: ((value: typeof logs) => void) | null = null;
    let resolveStats: ((value: typeof stats) => void) | null = null;

    mockedTauriClient.scGetLogs.mockImplementation(
      () =>
        new Promise(resolve => {
          resolveLogs = resolve as (value: typeof logs) => void;
        }) as never
    );
    mockedTauriClient.scGetLogStats.mockImplementation(
      () =>
        new Promise(resolve => {
          resolveStats = resolve as (value: typeof stats) => void;
        }) as never
    );

    const { unmount } = renderHook(() => useSystemLogs(true, 1000));

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockedTauriClient.scGetLogs).toHaveBeenCalledTimes(1);
    expect(mockedTauriClient.scGetLogStats).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(1000);
      await Promise.resolve();
    });

    expect(mockedTauriClient.scGetLogs).toHaveBeenCalledTimes(1);
    expect(mockedTauriClient.scGetLogStats).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveLogs?.(logs);
      resolveStats?.(stats);
      await Promise.resolve();
    });

    unmount();
  });
});
