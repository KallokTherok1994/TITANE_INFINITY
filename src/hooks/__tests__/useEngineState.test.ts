import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useEngineState } from '../useEngineState';
import { tauriClient } from '../../services/tauriClient';

vi.mock('../../services/tauriClient', () => ({
  tauriClient: {
    getSingularityState: vi.fn(),
  },
}));

describe('useEngineState', () => {
  const mockedTauriClient = vi.mocked(tauriClient);

  beforeEach(() => {
    vi.useFakeTimers();
    mockedTauriClient.getSingularityState.mockReset();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('avoids overlapping polling fetches while the previous state request is still pending', async () => {
    let releaseRequest: ((value: any) => void) | null = null;

    mockedTauriClient.getSingularityState.mockImplementation(
      () =>
        new Promise(resolve => {
          releaseRequest = resolve;
        })
    );

    const { unmount } = renderHook(() =>
      useEngineState({ enabled: true, pollInterval: 1000 })
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockedTauriClient.getSingularityState).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(1000);
      await Promise.resolve();
    });

    expect(mockedTauriClient.getSingularityState).toHaveBeenCalledTimes(1);

    await act(async () => {
      if (releaseRequest) {
        releaseRequest({});
      }
      await Promise.resolve();
    });

    unmount();
  });
});
