/**
 * TITANE∞ — System Health Poller (LOCK3: SYSTEM_HEALTH_POLLING)
 *
 * Polls backend health state on a configurable interval and syncs
 * the result into useSystemStore. Ensures DevPage and other consumers
 * always show truth (backend-sourced), not stale guesses.
 *
 * Architecture: Ring 3 service — calls canonical IPC via systemStore.fetchAll().
 * No direct network; all traffic goes through Tauri IPC One Door.
 */

import { useSystemStore } from '@/stores/systemStore';
import { createLogger } from '@/utils/logger';

const logger = createLogger('SystemHealthPoller');

const DEFAULT_INTERVAL_MS = 10_000;

interface PollerHandle {
  stop: () => void;
}

let activePoller: ReturnType<typeof setInterval> | null = null;
let activeFetchPromise: Promise<void> | null = null;
// v35.1.2 — Set of live handles (replaces fragile refCount).
// Iterates handle.stop() to release; cleared automatically when last stop runs.
const liveHandles = new Set<PollerHandle>();

function runFetchAll(failureMessage: string): Promise<void> {
  if (activeFetchPromise) {
    return activeFetchPromise;
  }

  let request: Promise<void> | null = null;
  try {
    request = Promise.resolve(useSystemStore.getState().fetchAll())
      .catch(err => logger.warn(failureMessage, err))
      .finally(() => {
        if (activeFetchPromise === request) {
          activeFetchPromise = null;
        }
      });
  } catch (err) {
    // Synchronous throw in fetchAll() — never let it corrupt the polling loop
    logger.warn(failureMessage, err);
    activeFetchPromise = null;
    return Promise.resolve();
  }

  activeFetchPromise = request;
  return request;
}

function teardownIfIdle(): void {
  if (liveHandles.size === 0 && activePoller !== null) {
    clearInterval(activePoller);
    activePoller = null;
    activeFetchPromise = null;
    logger.info('[LOCK3] System health polling stopped');
  }
}

/**
 * Start polling system health from the backend.
 * Returns a handle with a `stop()` method.
 *
 * Multiple callers share one underlying interval (live-handle Set).
 * The interval stops only when the last live handle calls `stop()`.
 * Calling `stop()` multiple times on the same handle is idempotent.
 */
export function startSystemHealthPolling(
  intervalMs: number = DEFAULT_INTERVAL_MS
): PollerHandle {
  let stopped = false;

  const handle: PollerHandle = {
    stop: () => {
      if (stopped) return;
      stopped = true;
      liveHandles.delete(handle);
      teardownIfIdle();
    },
  };

  liveHandles.add(handle);

  if (!activePoller) {
    // Immediate first fetch
    void runFetchAll('Initial health fetch failed (non-fatal)');

    activePoller = setInterval(() => {
      void runFetchAll('Polling health fetch failed (non-fatal)');
    }, intervalMs);

    logger.info(`[LOCK3] System health polling started (interval=${intervalMs}ms)`);
  }

  return handle;
}

/**
 * Test-only helper: reset all internal state.
 */
export function __resetSystemHealthPollerForTests(): void {
  if (activePoller !== null) {
    clearInterval(activePoller);
    activePoller = null;
  }
  activeFetchPromise = null;
  liveHandles.clear();
}

/**
 * Test-only helper: inspect internal state.
 */
export function __getSystemHealthPollerStateForTests(): {
  active: boolean;
  liveHandleCount: number;
} {
  return {
    active: activePoller !== null,
    liveHandleCount: liveHandles.size,
  };
}
