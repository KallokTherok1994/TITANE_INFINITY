/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ — TimeToTwinObserver (TIME-IPC v3 Phase 3 + Phase 7)
 *
 * Periodically reads temporal_metrics_health + temporal_alignment_score
 * and publishes them as `cognitive` observations on the NumericTwin via
 * Single Door IPC `twin_submit_observation`.
 *
 * Phase 7 hardening:
 *   - Exponential backoff after consecutive failures (60→120→240→300s cap)
 *   - `getStatus()` snapshot for observability surfaces
 *   - Visibility-aware pause (default ON, SSR-safe)
 *   - Singleton intervalMs drift: warn + ignore (predictable behaviour)
 * ═══════════════════════════════════════════════════════════════════
 */

import { safeInvokeCanonical } from '@/utils/invoke';
import { temporalIntelligenceService } from '@/services/temporal';
import type { AlignmentScoreDTO, TemporalHealthDTO } from '@/services/temporal/types';

export interface TimeToTwinObserverOptions {
  /** Period between observation pushes (ms). Default 60 000. */
  intervalMs?: number;
  /** Optional logger sink. */
  log?: (msg: string, ctx?: unknown) => void;
  /** Override fetcher (for testing). */
  fetchHealth?: () => Promise<TemporalHealthDTO>;
  /** Override fetcher (for testing). */
  fetchAlignment?: () => Promise<AlignmentScoreDTO>;
  /** Override publisher (for testing). */
  submit?: (payload: TwinObservationPayload) => Promise<{ ok: boolean; error?: string }>;
  /** Pause polling while document is hidden (default true, SSR-safe). */
  pauseOnHidden?: boolean;
}

export interface TwinObservationPayload {
  observation_type: 'cognitive' | 'value' | 'style' | 'emotional';
  content: string;
  context: string;
  confidence: number;
}

export interface TimeToTwinObserverStatus {
  running: boolean;
  paused: boolean;
  lastPulseAt: number | null;
  lastError: string | null;
  totalPushed: number;
  totalFailed: number;
  consecutiveFailures: number;
  currentBackoffMs: number;
  intervalMs: number;
}

export interface TimeToTwinObserverHandle {
  start(): void;
  stop(): void;
  isRunning(): boolean;
  pulseOnce(): Promise<{ pushed: boolean; reason?: string }>;
  getStatus(): TimeToTwinObserverStatus;
}

/** Backoff ladder (ms) applied AFTER 3 consecutive failures. Cap 5 min. */
const BACKOFF_LADDER_MS = [60_000, 120_000, 240_000, 300_000] as const;
const FAILURE_THRESHOLD = 3;

const noop = (): void => undefined;

async function defaultSubmit(
  payload: TwinObservationPayload
): Promise<{ ok: boolean; error?: string }> {
  const result = await safeInvokeCanonical<string>('twin_submit_observation', {
    observation: payload,
  });
  return { ok: result.ok, error: result.error?.message };
}

function buildContent(health: TemporalHealthDTO, alignment: AlignmentScoreDTO): string {
  const h = (v: number) => Number.isFinite(v) ? v.toFixed(2) : '—';
  return [
    `temporal.health.overall=${h(health.overall)}`,
    `temporal.health.energy=${h(health.energy)}`,
    `temporal.health.alignment=${h(health.alignment)}`,
    `temporal.alignment.score=${h(alignment.score)}`,
    `temporal.alignment.active_goals=${alignment.active_goals ?? 0}`,
  ].join(' | ');
}

function clampConfidence(health: TemporalHealthDTO, alignment: AlignmentScoreDTO): number {
  const candidate = (health.overall + alignment.score) / 2;
  if (!Number.isFinite(candidate)) return 0.5;
  return Math.max(0, Math.min(1, candidate));
}

/**
 * Create a TimeToTwinObserver. `start()` schedules periodic pushes; `pulseOnce()`
 * performs a single observation cycle and returns whether the push succeeded.
 */
export function createTimeToTwinObserver(
  options: TimeToTwinObserverOptions = {}
): TimeToTwinObserverHandle {
  const baseIntervalMs = options.intervalMs ?? 60_000;
  const log = options.log ?? noop;
  const fetchHealth = options.fetchHealth ?? temporalIntelligenceService.getHealth;
  const fetchAlignment = options.fetchAlignment ?? temporalIntelligenceService.alignmentScore;
  const submit = options.submit ?? defaultSubmit;
  const pauseOnHidden = options.pauseOnHidden ?? true;

  let timer: ReturnType<typeof setTimeout> | null = null;
  let paused = false;
  let visibilityListener: (() => void) | null = null;

  const status: TimeToTwinObserverStatus = {
    running: false,
    paused: false,
    lastPulseAt: null,
    lastError: null,
    totalPushed: 0,
    totalFailed: 0,
    consecutiveFailures: 0,
    currentBackoffMs: baseIntervalMs,
    intervalMs: baseIntervalMs,
  };

  function computeNextDelay(): number {
    if (status.consecutiveFailures < FAILURE_THRESHOLD) return baseIntervalMs;
    const idx = Math.min(
      status.consecutiveFailures - FAILURE_THRESHOLD,
      BACKOFF_LADDER_MS.length - 1
    );
    return BACKOFF_LADDER_MS[idx] ?? BACKOFF_LADDER_MS[BACKOFF_LADDER_MS.length - 1] ?? baseIntervalMs;
  }

  async function pulseOnce(): Promise<{ pushed: boolean; reason?: string }> {
    status.lastPulseAt = Date.now();
    try {
      const [health, alignment] = await Promise.all([fetchHealth(), fetchAlignment()]);
      const payload: TwinObservationPayload = {
        observation_type: 'cognitive',
        content: buildContent(health, alignment),
        context: 'temporal_engine',
        confidence: clampConfidence(health, alignment),
      };
      const result = await submit(payload);
      if (!result.ok) {
        const reason = result.error ?? 'submit_failed';
        status.totalFailed += 1;
        status.consecutiveFailures += 1;
        status.lastError = reason;
        status.currentBackoffMs = computeNextDelay();
        log('[TimeToTwinObserver] submit failed', reason);
        return { pushed: false, reason };
      }
      status.totalPushed += 1;
      status.consecutiveFailures = 0;
      status.lastError = null;
      status.currentBackoffMs = baseIntervalMs;
      log('[TimeToTwinObserver] observation submitted', {
        confidence: payload.confidence,
      });
      return { pushed: true };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      status.totalFailed += 1;
      status.consecutiveFailures += 1;
      status.lastError = msg;
      status.currentBackoffMs = computeNextDelay();
      log('[TimeToTwinObserver] pulse error', msg);
      return { pushed: false, reason: msg };
    }
  }

  function scheduleNext(): void {
    if (!status.running || paused) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      void pulseOnce().finally(() => scheduleNext());
    }, status.currentBackoffMs);
  }

  function attachVisibilityListener(): void {
    if (!pauseOnHidden) return;
    if (typeof document === 'undefined') return;
    visibilityListener = () => {
      const hidden = document.visibilityState === 'hidden';
      if (hidden && !paused) {
        paused = true;
        status.paused = true;
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        log('[TimeToTwinObserver] paused (hidden)');
      } else if (!hidden && paused) {
        paused = false;
        status.paused = false;
        log('[TimeToTwinObserver] resumed (visible)');
        scheduleNext();
      }
    };
    document.addEventListener('visibilitychange', visibilityListener);
  }

  function detachVisibilityListener(): void {
    if (visibilityListener && typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', visibilityListener);
    }
    visibilityListener = null;
  }

  function start(): void {
    if (status.running) return;
    status.running = true;
    paused = false;
    status.paused = false;
    attachVisibilityListener();
    void pulseOnce().finally(() => scheduleNext());
    log('[TimeToTwinObserver] started', { intervalMs: baseIntervalMs });
  }

  function stop(): void {
    if (!status.running) return;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    detachVisibilityListener();
    status.running = false;
    paused = false;
    status.paused = false;
    log('[TimeToTwinObserver] stopped');
  }

  function isRunning(): boolean {
    return status.running;
  }

  function getStatus(): TimeToTwinObserverStatus {
    return { ...status };
  }

  return { start, stop, isRunning, pulseOnce, getStatus };
}

/** Singleton helper for runtime composition. */
let runtimeHandle: TimeToTwinObserverHandle | null = null;
let runtimeIntervalMs: number | null = null;

export function getRuntimeTimeToTwinObserver(
  options?: TimeToTwinObserverOptions
): TimeToTwinObserverHandle {
  if (!runtimeHandle) {
    runtimeHandle = createTimeToTwinObserver(options);
    runtimeIntervalMs = options?.intervalMs ?? 60_000;
  } else if (
    options?.intervalMs !== undefined &&
    runtimeIntervalMs !== null &&
    options.intervalMs !== runtimeIntervalMs
  ) {
    // Phase 7: drift warn-and-ignore (singleton intervalMs locked at first call).
    // eslint-disable-next-line no-console
    console.warn(
      `[TimeToTwinObserver] intervalMs drift ignored (locked=${runtimeIntervalMs}ms, requested=${options.intervalMs}ms)`
    );
  }
  return runtimeHandle;
}

export function resetRuntimeTimeToTwinObserverForTests(): void {
  if (runtimeHandle) runtimeHandle.stop();
  runtimeHandle = null;
  runtimeIntervalMs = null;
}
