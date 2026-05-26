import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const fetchAllMock = vi.fn();
const loggerWarnMock = vi.fn();
const loggerInfoMock = vi.fn();

vi.mock('../../stores/systemStore', () => ({
  useSystemStore: {
    getState: vi.fn(() => ({
      fetchAll: fetchAllMock,
    })),
  },
}));

vi.mock('../../utils/logger', () => ({
  createLogger: vi.fn(() => ({
    info: loggerInfoMock,
    warn: loggerWarnMock,
  })),
}));

describe('startSystemHealthPolling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    fetchAllMock.mockReset();
    loggerWarnMock.mockReset();
    loggerInfoMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('does not overlap a slow fetchAll call with the next polling tick', async () => {
    let releaseFetch: (() => void) | null = null;

    fetchAllMock.mockImplementation(
      () =>
        new Promise<void>(resolve => {
          releaseFetch = resolve;
        })
    );

    vi.resetModules();
    const { startSystemHealthPolling } = await import('../systemHealthPoller');

    const handle = startSystemHealthPolling(1000);

    await act(async () => {
      await Promise.resolve();
    });

    expect(fetchAllMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(1000);
      await Promise.resolve();
    });

    expect(fetchAllMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      releaseFetch?.();
      await Promise.resolve();
    });

    handle.stop();
  });

  // v35.1.2 — WeakSet/Set-based handle tracking idempotency
  it('idempotent: calling stop() twice on same handle does not break the poller', async () => {
    fetchAllMock.mockResolvedValue(undefined);

    vi.resetModules();
    const {
      startSystemHealthPolling,
      __getSystemHealthPollerStateForTests,
      __resetSystemHealthPollerForTests,
    } = await import('../systemHealthPoller');
    __resetSystemHealthPollerForTests();

    const h1 = startSystemHealthPolling(5000);
    const h2 = startSystemHealthPolling(5000);

    expect(__getSystemHealthPollerStateForTests().liveHandleCount).toBe(2);
    expect(__getSystemHealthPollerStateForTests().active).toBe(true);

    h1.stop();
    h1.stop(); // double-stop must not decrement past 1
    expect(__getSystemHealthPollerStateForTests().liveHandleCount).toBe(1);
    expect(__getSystemHealthPollerStateForTests().active).toBe(true);

    h2.stop();
    expect(__getSystemHealthPollerStateForTests().liveHandleCount).toBe(0);
    expect(__getSystemHealthPollerStateForTests().active).toBe(false);
  });

  it('survives multiple rapid mount/unmount cycles without leaking interval', async () => {
    fetchAllMock.mockResolvedValue(undefined);

    vi.resetModules();
    const {
      startSystemHealthPolling,
      __getSystemHealthPollerStateForTests,
      __resetSystemHealthPollerForTests,
    } = await import('../systemHealthPoller');
    __resetSystemHealthPollerForTests();

    for (let i = 0; i < 10; i += 1) {
      const h = startSystemHealthPolling(5000);
      h.stop();
    }

    expect(__getSystemHealthPollerStateForTests().liveHandleCount).toBe(0);
    expect(__getSystemHealthPollerStateForTests().active).toBe(false);
  });

  it('does not crash if fetchAll throws synchronously', async () => {
    fetchAllMock.mockImplementation(() => {
      throw new Error('synchronous boom');
    });

    vi.resetModules();
    const { startSystemHealthPolling, __resetSystemHealthPollerForTests } =
      await import('../systemHealthPoller');
    __resetSystemHealthPollerForTests();

    expect(() => startSystemHealthPolling(1000).stop()).not.toThrow();
  });
});
