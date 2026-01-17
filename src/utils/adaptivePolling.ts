/**
 * TITANE∞ v24.2.1 — Adaptive Polling Utility
 * Dynamically adjusts polling intervals based on activity and visibility
 * Reduces CPU/network usage when user is idle or tab is hidden
 * © 2025 Humain Total / Kevin Thibault / TITANE Team
 */

export interface AdaptivePollingOptions {
  /** Base polling interval in milliseconds */
  baseIntervalMs: number;
  /** Minimum interval (fastest polling) */
  minIntervalMs?: number;
  /** Maximum interval (slowest polling) */
  maxIntervalMs?: number;
  /** Factor to slow down when idle */
  idleSlowdownFactor?: number;
  /** Factor to slow down when tab is hidden */
  hiddenSlowdownFactor?: number;
  /** Time in ms before considering user idle */
  idleThresholdMs?: number;
  /** Callback when interval changes */
  onIntervalChange?: (newInterval: number) => void;
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
 * - User activity (mouse, keyboard, touch)
 * - Tab visibility
 * - Custom activity signals
 *
 * @example
 * ```ts
 * const polling = createAdaptivePolling(
 *   async () => {
 *     const data = await fetchData();
 *     updateUI(data);
 *   },
 *   { baseIntervalMs: 5000, maxIntervalMs: 30000 }
 * );
 *
 * polling.start();
 * // Later...
 * polling.stop();
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
    lastActivityAt: Date.now(),
    isVisible: typeof document !== 'undefined' ? !document.hidden : true,
    timerId: null,
  };

  /**
   * Calculate optimal interval based on current state
   */
  const calculateInterval = (): number => {
    let interval = baseIntervalMs;

    // Slow down when idle
    const idleTime = Date.now() - state.lastActivityAt;
    if (idleTime > idleThresholdMs) {
      const idleMultiplier = Math.min(
        idleSlowdownFactor,
        1 + (idleTime - idleThresholdMs) / idleThresholdMs
      );
      interval *= idleMultiplier;
    }

    // Slow down when tab is hidden
    if (!state.isVisible) {
      interval *= hiddenSlowdownFactor;
    }

    // Clamp to min/max
    return Math.min(maxIntervalMs, Math.max(minIntervalMs, Math.round(interval)));
  };

  /**
   * Schedule next poll
   */
  const scheduleNext = (): void => {
    if (!state.isRunning) return;

    const newInterval = calculateInterval();

    // Notify if interval changed significantly (>10%)
    if (Math.abs(newInterval - state.currentInterval) / state.currentInterval > 0.1) {
      state.currentInterval = newInterval;
      onIntervalChange?.(newInterval);
    }

    state.timerId = setTimeout(async () => {
      if (!state.isRunning) return;

      try {
        await callback();
      } catch (error) {
        console.error('[AdaptivePolling] Callback error:', error);
      }

      scheduleNext();
    }, state.currentInterval);
  };

  /**
   * Handle user activity
   */
  const handleActivity = (): void => {
    state.lastActivityAt = Date.now();

    // If running and interval was slowed, speed up
    if (state.isRunning && state.currentInterval > baseIntervalMs) {
      const newInterval = calculateInterval();
      if (newInterval < state.currentInterval * 0.7) {
        // Cancel current timer and reschedule with faster interval
        if (state.timerId) {
          clearTimeout(state.timerId);
        }
        state.currentInterval = newInterval;
        onIntervalChange?.(newInterval);
        scheduleNext();
      }
    }
  };

  /**
   * Handle visibility change
   */
  const handleVisibilityChange = (): void => {
    const wasVisible = state.isVisible;
    state.isVisible = !document.hidden;

    // Speed up when becoming visible
    if (!wasVisible && state.isVisible && state.isRunning) {
      state.lastActivityAt = Date.now(); // Reset idle timer
      if (state.timerId) {
        clearTimeout(state.timerId);
      }
      state.currentInterval = baseIntervalMs;
      onIntervalChange?.(baseIntervalMs);

      // Execute immediately when becoming visible
      Promise.resolve(callback()).catch(console.error);
      scheduleNext();
    }
  };

  /**
   * Start polling
   */
  const start = (): void => {
    if (state.isRunning) return;

    state.isRunning = true;
    state.lastActivityAt = Date.now();
    state.currentInterval = baseIntervalMs;

    // Add event listeners for activity tracking
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', handleActivity, { passive: true });
      window.addEventListener('keydown', handleActivity, { passive: true });
      window.addEventListener('touchstart', handleActivity, { passive: true });
      window.addEventListener('scroll', handleActivity, { passive: true });
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    // Execute immediately, then schedule next
    Promise.resolve(callback()).catch(console.error);
    scheduleNext();
  };

  /**
   * Stop polling
   */
  const stop = (): void => {
    state.isRunning = false;

    if (state.timerId) {
      clearTimeout(state.timerId);
      state.timerId = null;
    }

    // Remove event listeners
    if (typeof window !== 'undefined') {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  };

  /**
   * Signal activity (useful for programmatic activity signals)
   */
  const signalActivity = (): void => {
    handleActivity();
  };

  /**
   * Force immediate execution
   */
  const executeNow = async (): Promise<void> => {
    state.lastActivityAt = Date.now();

    try {
      await callback();
    } catch (error) {
      console.error('[AdaptivePolling] Callback error:', error);
    }

    // Reschedule if running
    if (state.isRunning && state.timerId) {
      clearTimeout(state.timerId);
      scheduleNext();
    }
  };

  /**
   * Get current state
   */
  const getState = () => ({
    isRunning: state.isRunning,
    currentInterval: state.currentInterval,
    isIdle: Date.now() - state.lastActivityAt > idleThresholdMs,
    isVisible: state.isVisible,
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
 * adaptiveVitals.start();
 * return () => adaptiveVitals.stop();
 * ```
 */
export function wrapWithAdaptivePolling<T>(
  fetcher: () => Promise<T>,
  options: AdaptivePollingOptions & {
    onData?: (data: T) => void;
    onError?: (error: Error) => void;
  }
): ReturnType<typeof createAdaptivePolling> & { lastData: T | null } {
  let lastData: T | null = null;

  const polling = createAdaptivePolling(async () => {
    try {
      lastData = await fetcher();
      options.onData?.(lastData);
    } catch (error) {
      options.onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  }, options);

  return {
    ...polling,
    get lastData() {
      return lastData;
    },
  };
}
