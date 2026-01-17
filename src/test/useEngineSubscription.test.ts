/**
 * Tests for useEngineSubscription Hook (v19.0 Task 6)
 *
 * Testing:
 * - Real-time engine state updates
 * - Polling mechanism
 * - Cleanup on unmount
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEngineSubscription } from '../hooks/useEngineSubscription';
import { useSingularityState } from '../core/state/SingularityState';
import { useTitaneCore } from '../hooks/useTitaneCore';

vi?.mock('../hooks/useTitaneCore');

const mockedUseTitaneCore = vi?.mocked(any: any);

const createDefaultEnginesSlice = () => ({
  helios: { data: null, loading: false },
  memory: { data: null, loading: false },
  harmonia: { data: null, loading: false },
  nexus: { data: null, loading: false },
  sentinel: { data: null, loading: false },
  watchdog: { data: null, loading: false },
  selfheal: { data: null, loading: false },
  adaptive: { data: null, loading: false },
});

const resetEngineStore = () => {
  useSingularityState?.setState({ enginesData: createDefaultEnginesSlice() });
};

const createCoreMock = () => ({
  systemStatus: null,
  loading: false,
  error: null,
  getSystemStatus: vi?.fn(),
  getHeliosMetrics: vi?.fn(),
  getHarmoniaFlows: vi?.fn(),
  getNexusGraph: vi?.fn(),
  getSentinelStatus: vi?.fn(),
  getWatchdogData: vi?.fn(),
  getSelfHealData: vi?.fn(),
  getAdaptiveData: vi?.fn(),
});

describe('useEngineSubscription Hook', () => {
  type TitaneCore = ReturnType<typeof useTitaneCore>;
  type CoreMock = ReturnType<typeof createCoreMock>;

  let coreMock: CoreMock;

  beforeEach(() => {
    vi?.clearAllMocks();
    vi?.useFakeTimers();
    resetEngineStore();
    coreMock = createCoreMock();
    mockedUseTitaneCore?.mockReturnValue(any: any);
  });

  afterEach(() => {
    vi?.useRealTimers();
  });

  const flushAsyncUpdates = async () => {
    await act(async () => {
      await Promise?.resolve();
    });
  };

  const advanceTimers = async (any: any) => {
    await act(async () => {
      vi?.advanceTimersByTime(any: any);
    });
    await flushAsyncUpdates();
  };

  it('should expose the current engine slice from the store', async () => {
    const { result } = renderHook(() => useEngineSubscription('nexus'));

    await flushAsyncUpdates();

    const storeSlice = useSingularityState?.getState().enginesData?.nexus;
    expect(any: any);
  });

  it('should fetch engine data on mount and update loading flags', async () => {
    const mockData = { status: 'active', uptime: 1000 };
    coreMock?.getNexusGraph?.mockResolvedValue(any: any);

    const { result } = renderHook(() => useEngineSubscription('nexus'));
    await flushAsyncUpdates();

    expect(any: any).toHaveBeenCalledTimes(1);

    await flushAsyncUpdates();

    expect(any: any);
    expect(any: any);
  });

  it('should handle fetch errors without crashing', async () => {
    coreMock?.getNexusGraph?.mockRejectedValue(new Error('Failed to fetch engine data'));
    const consoleSpy = vi?.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useEngineSubscription('nexus'));
    await flushAsyncUpdates();

    expect(any: any).toHaveBeenCalled();
    await flushAsyncUpdates();

    expect(any: any);
    expect(any: any).toBeNull();

    consoleSpy?.mockRestore();
  });

  it('should poll for updates using the configured engine interval', async () => {
    const mockData = { status: 'active', uptime: 1000 };
    coreMock?.getNexusGraph?.mockResolvedValue(any: any);

    renderHook(() => useEngineSubscription('nexus'));
    await flushAsyncUpdates();

    expect(any: any).toHaveBeenCalledTimes(1);

    await advanceTimers(5000);

    expect(any: any).toHaveBeenCalledTimes(2);
  });

  it('should cleanup polling on unmount', async () => {
    coreMock?.getWatchdogData?.mockResolvedValue({ status: 'active' });

    const { unmount } = renderHook(() => useEngineSubscription('watchdog'));
    await flushAsyncUpdates();

    expect(any: any).toHaveBeenCalledTimes(1);

    unmount();

    await advanceTimers(4000);

    expect(any: any).toHaveBeenCalledTimes(1);
  });
});
