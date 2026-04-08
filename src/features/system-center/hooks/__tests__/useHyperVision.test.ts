import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHyperVision } from '../useHyperVision';
import { tauriClient } from '../../../../lib/tauriClient';

vi.mock('../../../../lib/tauriClient', () => ({
  tauriClient: {
    scHypervisionGetState: vi.fn(),
    scHypervisionGetMetrics: vi.fn(),
    scHypervisionGetLayers: vi.fn(),
    scHypervisionGetAnomalies: vi.fn(),
    scHypervisionStart: vi.fn(),
    scHypervisionStop: vi.fn(),
    scHypervisionClearAnomalies: vi.fn(),
    scHypervisionResolveAnomaly: vi.fn(),
  },
}));

const mockedTauriClient = vi.mocked(tauriClient);

const hypervisionState = {
  is_monitoring: true,
  monitoring_level: 'standard',
  timestamp: Date.now(),
};

const metrics = {
  cpu_usage: 10,
  memory_usage: 20,
  disk_usage: 30,
  fps: 60,
  latency: 5,
  temperature: 42,
  timestamp: Date.now(),
};

describe('useHyperVision', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    mockedTauriClient.scHypervisionGetState.mockResolvedValue(hypervisionState as never);
    mockedTauriClient.scHypervisionStart.mockResolvedValue(hypervisionState as never);
    mockedTauriClient.scHypervisionGetLayers.mockResolvedValue([] as never);
    mockedTauriClient.scHypervisionGetAnomalies.mockResolvedValue([] as never);
    mockedTauriClient.scHypervisionGetMetrics.mockResolvedValue(metrics as never);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('avoids overlapping polling refreshes while the previous metrics cycle is still pending', async () => {
    let resolveMetrics: ((value: typeof metrics) => void) | null = null;

    mockedTauriClient.scHypervisionGetMetrics.mockImplementation(
      () =>
        new Promise(resolve => {
          resolveMetrics = resolve as (value: typeof metrics) => void;
        }) as never
    );

    const { result, unmount } = renderHook(() => useHyperVision(true, 10));

    await act(async () => {
      void result.current.startMonitoring();
      await Promise.resolve();
    });

    await act(async () => {
      vi.advanceTimersByTime(50);
      await Promise.resolve();
    });

    expect(mockedTauriClient.scHypervisionGetMetrics).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveMetrics?.(metrics);
      await Promise.resolve();
      await result.current.stopMonitoring();
    });

    unmount();
  });

  it('loads monitoring state and metrics after start', async () => {
    const { result, unmount } = renderHook(() => useHyperVision(true, 10));

    await act(async () => {
      await result.current.startMonitoring();
    });

    expect(result.current.isMonitoring).toBe(true);
    expect(result.current.state).toEqual(hypervisionState);
    expect(result.current.metrics).toEqual(metrics);

    await act(async () => {
      await result.current.stopMonitoring();
    });

    unmount();
  });
});
