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
});
