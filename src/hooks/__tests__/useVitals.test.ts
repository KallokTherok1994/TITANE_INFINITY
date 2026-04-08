import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { tauriClient } from '../../services/tauriClient';
import { useVitals } from '../useVitals';

vi.mock('../../services/tauriClient', () => ({
  tauriClient: {
    getSystemVitals: vi.fn(),
  },
}));

describe('useVitals', () => {
  const mockedTauriClient = vi.mocked(tauriClient);

  beforeEach(() => {
    vi.useFakeTimers();
    mockedTauriClient.getSystemVitals.mockReset();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('avoids overlapping vitals polling while the previous system vitals request is still pending', async () => {
    let releaseRequest: ((value: any) => void) | null = null;

    mockedTauriClient.getSystemVitals.mockImplementation(
      () =>
        new Promise(resolve => {
          releaseRequest = resolve;
        })
    );

    const { unmount } = renderHook(() =>
      useVitals({ enabled: true, adaptive: false, pollInterval: 1000 })
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockedTauriClient.getSystemVitals).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(1000);
      await Promise.resolve();
    });

    expect(mockedTauriClient.getSystemVitals).toHaveBeenCalledTimes(1);

    await act(async () => {
      releaseRequest?.({
        cpu_usage: 10,
        memory_usage: 20,
        disk_usage: 30,
        uptime: 1000,
      });
      await Promise.resolve();
    });

    unmount();
  });
});
