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
let refCount = 0;

function runFetchAll(failureMessage: string): Promise<void> {
  if (activeFetchPromise) {
    return activeFetchPromise;
  }

  let request: Promise<void> | null = null;
  request = Promise.resolve(useSystemStore.getState().fetchAll())
    .catch(err => logger.warn(failureMessage, err))
    .finally(() => {
      if (activeFetchPromise === request) {
        activeFetchPromise = null;
      }
    });

  activeFetchPromise = request;
  return request;
}

/**
 * Start polling system health from the backend.
 * Returns a handle with a `stop()` method.
 *
 * Multiple callers share one underlying interval (ref-counted).
 * The interval stops only when all callers have called `stop()`.
 */
export function startSystemHealthPolling(
  intervalMs: number = DEFAULT_INTERVAL_MS
): PollerHandle {
  refCount += 1;

  if (!activePoller) {
    // Immediate first fetch
    void runFetchAll('Initial health fetch failed (non-fatal)');

    activePoller = setInterval(() => {
      void runFetchAll('Polling health fetch failed (non-fatal)');
    }, intervalMs);

    logger.info(`[LOCK3] System health polling started (interval=${intervalMs}ms)`);
  }

  return {
    stop: () => {
      refCount = Math.max(0, refCount - 1);
      if (refCount === 0 && activePoller !== null) {
        clearInterval(activePoller);
        activePoller = null;
        activeFetchPromise = null;
        logger.info('[LOCK3] System health polling stopped');
      }
    },
  };
}
