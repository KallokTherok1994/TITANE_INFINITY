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
let refCount = 0;

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
    useSystemStore
      .getState()
      .fetchAll()
      .catch(err => logger.warn('Initial health fetch failed (non-fatal)', err));

    activePoller = setInterval(() => {
      useSystemStore
        .getState()
        .fetchAll()
        .catch(err => logger.warn('Polling health fetch failed (non-fatal)', err));
    }, intervalMs);

    logger.info(`[LOCK3] System health polling started (interval=${intervalMs}ms)`);
  }

  return {
    stop: () => {
      refCount = Math.max(0, refCount - 1);
      if (refCount === 0 && activePoller !== null) {
        clearInterval(activePoller);
        activePoller = null;
        logger.info('[LOCK3] System health polling stopped');
      }
    },
  };
}
