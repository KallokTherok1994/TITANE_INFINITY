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

vi.mock('../hooks/useTitaneCore');

const mockedUseTitaneCore = vi.mocked(useTitaneCore);

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
  useSingularityState.setState({ enginesData: createDefaultEnginesSlice() });
};

const createCoreMock = () => ({
  systemStatus: null,
  loading: false,
  error: null,
  getSystemStatus: vi.fn(),
  getHeliosMetrics: vi.fn(),
  getHarmoniaFlows: vi.fn(),
  getNexusGraph: vi.fn(),
  getSentinelStatus: vi.fn(),
  getWatchdogData: vi.fn(),
  getSelfHealData: vi.fn(),
  getAdaptiveData: vi.fn(),
});

describe('useEngineSubscription Hook', () => {
  type TitaneCore = ReturnType<typeof useTitaneCore>;
  type CoreMock = ReturnType<typeof createCoreMock>;

  let coreMock: CoreMock;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    resetEngineStore();
    coreMock = createCoreMock();
    mockedUseTitaneCore.mockReturnValue(coreMock as unknown as TitaneCore);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const flushAsyncUpdates = async () => {
    await act(async () => {
      await Promise.resolve();
    });
  };

  const advanceTimers = async (ms: number) => {
    await act(async () => {
      vi.advanceTimersByTime(ms);
    });
    await flushAsyncUpdates();
  };

  it('should expose the current engine slice from the store', async () => {
    const { result } = renderHook(() => useEngineSubscription('nexus'));

    await flushAsyncUpdates();

    const storeSlice = useSingularityState.getState().enginesData.nexus;
    expect(result.current).toEqual(storeSlice);
  });

  it('should fetch engine data on mount and update loading flags', async () => {
    const mockData = { status: 'active', uptime: 1000 };
    coreMock.getNexusGraph.mockResolvedValue(mockData);

    const { result } = renderHook(() => useEngineSubscription('nexus'));
    await flushAsyncUpdates();

    expect(coreMock.getNexusGraph).toHaveBeenCalledTimes(1);

    await flushAsyncUpdates();

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockData);
  });

  it('should handle fetch errors without crashing', async () => {
    coreMock.getNexusGraph.mockRejectedValue(new Error('Failed to fetch engine data'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useEngineSubscription('nexus'));
    await flushAsyncUpdates();

    expect(consoleSpy).toHaveBeenCalled();
    await flushAsyncUpdates();

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();

    consoleSpy.mockRestore();
  });

  it('should poll for updates using the configured engine interval', async () => {
    const mockData = { status: 'active', uptime: 1000 };
    coreMock.getNexusGraph.mockResolvedValue(mockData);

    renderHook(() => useEngineSubscription('nexus'));
    await flushAsyncUpdates();

    expect(coreMock.getNexusGraph).toHaveBeenCalledTimes(1);

    await advanceTimers(5000);

    expect(coreMock.getNexusGraph).toHaveBeenCalledTimes(2);
  });

  it('should cleanup polling on unmount', async () => {
    coreMock.getWatchdogData.mockResolvedValue({ status: 'active' });

    const { unmount } = renderHook(() => useEngineSubscription('watchdog'));
    await flushAsyncUpdates();

    expect(coreMock.getWatchdogData).toHaveBeenCalledTimes(1);

    unmount();

    await advanceTimers(4000);

    expect(coreMock.getWatchdogData).toHaveBeenCalledTimes(1);
  });
});
