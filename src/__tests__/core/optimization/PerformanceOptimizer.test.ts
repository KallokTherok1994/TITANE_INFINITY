import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

const secureInvokeMock = vi.hoisted(() => vi.fn());
const detectEnvironmentMock = vi.hoisted(() => vi.fn(() => ({ isTauri: true })));

vi.mock('@/lib/security', () => ({
  secureInvoke: secureInvokeMock,
}));

vi.mock('@/core/tauri/environment', () => ({
  detectEnvironment: detectEnvironmentMock,
}));

describe('PerformanceOptimizer monitoring perf guards', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetModules();
    vi.clearAllMocks();

    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible',
    });
  });

  afterEach(async () => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('does not run backend metrics polling when page is hidden', async () => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'hidden',
    });

    secureInvokeMock.mockResolvedValue({
      cpu_usage: 5,
      gpu_usage: 5,
      memory_usage: 10,
      memory_available: 100,
      fps: 60,
      frame_time: 16,
      render_time: 8,
      idle_time: 8,
      gc_time: 0,
      network_latency: 5,
      timestamp: Date.now(),
    });

    const { PerfOptimizer } = await import('@/core/optimization/PerformanceOptimizer');

    PerfOptimizer.startMonitoring(10);
    await vi.advanceTimersByTimeAsync(60);
    PerfOptimizer.stopMonitoring();

    expect(secureInvokeMock).not.toHaveBeenCalled();
  });

  it('prevents overlapping monitoring cycles when backend call is slow', async () => {
    let resolveMetrics: ((value: unknown) => void) | null = null;

    secureInvokeMock.mockImplementation((command: string) => {
      if (command === 'performance_get_metrics') {
        return new Promise(resolve => {
          resolveMetrics = resolve;
        });
      }
      return Promise.resolve(undefined);
    });

    const { PerfOptimizer } = await import('@/core/optimization/PerformanceOptimizer');

    PerfOptimizer.startMonitoring(10);
    await vi.advanceTimersByTimeAsync(80);

    expect(secureInvokeMock).toHaveBeenCalledTimes(1);
    expect(secureInvokeMock).toHaveBeenCalledWith('performance_get_metrics');

    resolveMetrics?.({
      cpu_usage: 5,
      gpu_usage: 5,
      memory_usage: 10,
      memory_available: 100,
      fps: 60,
      frame_time: 16,
      render_time: 8,
      idle_time: 8,
      gc_time: 0,
      network_latency: 5,
      timestamp: Date.now(),
    });

    await vi.advanceTimersByTimeAsync(20);
    PerfOptimizer.stopMonitoring();
  });
});
