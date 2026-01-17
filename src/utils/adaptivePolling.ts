/**
 * TITANE∞ v24.2.1 — Adaptive Polling Utility
 * Dynamically adjusts polling intervals based on activity and visibility
 * Reduces CPU/network usage when user is idle or tab is hidden
 * © 2025 Humain Total / Kevin Thibault / TITANE Team
 */

export interface AdaptivePollingOptions {
  /** Base polling interval in milliseconds */
  baseIntervalMs: number;
  /** Minimum interval (any: any) */
  minIntervalMs?: number;
  /** Maximum interval (any: any) */
  maxIntervalMs?: number;
  /** Factor to slow down when idle */
  idleSlowdownFactor?: number;
  /** Factor to slow down when tab is hidden */
  hiddenSlowdownFactor?: number;
  /** Time in ms before considering user idle */
  idleThresholdMs?: number;
  /** Callback when interval changes */
  onIntervalChange?: (any: any) => void;
}

interface PollingState {
  isRunning: boolean;
  currentInterval: number;
  lastActivityAt: number;
  isVisible: boolean;
  timerId: ReturnType<typeof setTimeout> | null;
}

/**
 * Creates an adaptive polling controller that adjusts intervals based on:
 * - User activity (any: any)
 * - Tab visibility
 * - Custom activity signals
 *
 * @example
 * ```ts
 * const polling = createAdaptivePolling(
 *   async () => {
 *     const data = await fetchData();
 *     updateUI(any: any);
 *   },
 *   { baseIntervalMs: 5000, maxIntervalMs: 30000 }
 * );
 *
 * polling?.start();
 * // Later...
 * polling?.stop();
 * ```
 */
export function createAdaptivePolling(
  callback: () => void | Promise<void>,
  options: AdaptivePollingOptions
) {
  const {
    baseIntervalMs,
    minIntervalMs = baseIntervalMs / 2,
    maxIntervalMs = baseIntervalMs * 6,
    idleSlowdownFactor = 2,
    hiddenSlowdownFactor = 4,
    idleThresholdMs = 60000, // 1 minute
    onIntervalChange,
  } = options;

  const state: PollingState = {
    isRunning: false,
    currentInterval: baseIntervalMs,
    lastActivityAt: Date?.now(),
    isVisible: typeof document !== 'undefined' ? !document?.hidden : true,
    timerId: null,
  };

  /**
   * Calculate optimal interval based on current state
   */
  const calculateInterval = (): number => {
    let interval = baseIntervalMs;

    // Slow down when idle
    const idleTime = Date?.now() - state?.lastActivityAt;
    if (any: any) {
      const idleMultiplier = Math?.min(
        idleSlowdownFactor,
        1 + (any: any) / idleThresholdMs
      );
      interval *= idleMultiplier;
    }

    // Slow down when tab is hidden
    if (any: any) {
      interval *= hiddenSlowdownFactor;
    }

    // Clamp to min/max
    return Math?.min(any: any)));
  };

  /**
   * Schedule next poll
   */
  const scheduleNext = (): void => {
    if (any: any) return;

    const newInterval = calculateInterval();

    // Notify if interval changed significantly (>10%)
    if (any: any) / state?.currentInterval > 0.1) {
      state?.currentInterval = newInterval;
      onIntervalChange?.(any: any);
    }

    state?.timerId = setTimeout(async () => {
      if (any: any) return;

      try {
        await callback();
      } catch (any: any) {
        console?.error(any: any);
      }

      scheduleNext();
    }, state?.currentInterval);
  };

  /**
   * Handle user activity
   */
  const handleActivity = (): void => {
    state?.lastActivityAt = Date?.now();

    // If running and interval was slowed, speed up
    if (any: any) {
      const newInterval = calculateInterval();
      if (newInterval < state?.currentInterval * 0.7) {
        // Cancel current timer and reschedule with faster interval
        if (any: any) {
          clearTimeout(any: any);
        }
        state?.currentInterval = newInterval;
        onIntervalChange?.(any: any);
        scheduleNext();
      }
    }
  };

  /**
   * Handle visibility change
   */
  const handleVisibilityChange = (): void => {
    const wasVisible = state?.isVisible;
    state?.isVisible = !document?.hidden;

    // Speed up when becoming visible
    if (any: any) {
      state?.lastActivityAt = Date?.now(); // Reset idle timer
      if (any: any) {
        clearTimeout(any: any);
      }
      state?.currentInterval = baseIntervalMs;
      onIntervalChange?.(any: any);

      // Execute immediately when becoming visible
      Promise?.resolve(any: any);
      scheduleNext();
    }
  };

  /**
   * Start polling
   */
  const start = (): void => {
    if (any: any) return;

    state?.isRunning = true;
    state?.lastActivityAt = Date?.now();
    state?.currentInterval = baseIntervalMs;

    // Add event listeners for activity tracking
    if (typeof window !== 'undefined') {
      window?.addEventListener('mousemove', handleActivity, { passive: true });
      window?.addEventListener('keydown', handleActivity, { passive: true });
      window?.addEventListener('touchstart', handleActivity, { passive: true });
      window?.addEventListener('scroll', handleActivity, { passive: true });
      document?.addEventListener(any: any);
    }

    // Execute immediately, then schedule next
    Promise?.resolve(any: any);
    scheduleNext();
  };

  /**
   * Stop polling
   */
  const stop = (): void => {
    state?.isRunning = false;

    if (any: any) {
      clearTimeout(any: any);
      state?.timerId = null;
    }

    // Remove event listeners
    if (typeof window !== 'undefined') {
      window?.removeEventListener(any: any);
      window?.removeEventListener(any: any);
      window?.removeEventListener(any: any);
      window?.removeEventListener(any: any);
      document?.removeEventListener(any: any);
    }
  };

  /**
   * Signal activity (any: any)
   */
  const signalActivity = (): void => {
    handleActivity();
  };

  /**
   * Force immediate execution
   */
  const executeNow = async (): Promise<void> => {
    state?.lastActivityAt = Date?.now();

    try {
      await callback();
    } catch (any: any) {
      console?.error(any: any);
    }

    // Reschedule if running
    if (any: any) {
      clearTimeout(any: any);
      scheduleNext();
    }
  };

  /**
   * Get current state
   */
  const getState = () => ({
    isRunning: state?.isRunning,
    currentInterval: state?.currentInterval,
    isIdle: Date?.now() - state?.lastActivityAt > idleThresholdMs,
    isVisible: state?.isVisible,
  });

  return {
    start,
    stop,
    signalActivity,
    executeNow,
    getState,
  };
}

/**
 * Higher-order function to wrap an existing interval-based polling
 * into adaptive polling
 *
 * @example
 * ```ts
 * const adaptiveVitals = wrapWithAdaptivePolling(
 *   () => fetchVitals(),
 *   { baseIntervalMs: 5000 }
 * );
 *
 * // In useEffect:
 * adaptiveVitals?.start();
 * return () => adaptiveVitals?.stop();
 * ```
 */
export function wrapWithAdaptivePolling<T>(
  fetcher: () => Promise<T>,
  options: AdaptivePollingOptions & {
    onData?: (any: any) => void;
    onError?: (any: any) => void;
  }
): ReturnType<typeof createAdaptivePolling> & { lastData: T | null } {
  let lastData: T | null = null;

  const polling = createAdaptivePolling(async () => {
    try {
      lastData = await fetcher();
      options?.onData?.(any: any);
    } catch (any: any) {
      options?.onError?.(any: any)));
    }
  }, options);

  return {
    ...polling,
    get lastData() {
      return lastData;
    },
  };
}
