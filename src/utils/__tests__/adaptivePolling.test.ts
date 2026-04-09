import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createAdaptivePolling } from '../adaptivePolling';

describe('createAdaptivePolling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('does not overlap a pending callback with the next scheduled tick', async () => {
    const releaseCallbackRef: { current: (() => void) | null } = {
      current: null,
    };

    const callback = vi.fn(
      () =>
        new Promise<void>(resolve => {
          releaseCallbackRef.current = () => {
            resolve();
          };
        })
    );

    const polling = createAdaptivePolling(callback, {
      baseIntervalMs: 100,
      minIntervalMs: 100,
      maxIntervalMs: 100,
    });

    polling.start();
    await Promise.resolve();

    expect(callback).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(100);
    expect(callback).toHaveBeenCalledTimes(1);

    releaseCallbackRef.current?.();
    await Promise.resolve();

    await vi.advanceTimersByTimeAsync(100);
    expect(callback).toHaveBeenCalledTimes(2);

    polling.stop();
  });
});
