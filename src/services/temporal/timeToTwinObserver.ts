/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ — TimeToTwinObserver (TIME-IPC v3 Phase 3)
 * Periodically reads temporal_metrics_health + temporal_alignment_score
 * and publishes them as `cognitive` observations on the NumericTwin via
 * Single Door IPC `twin_submit_observation`.
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
}

export interface TwinObservationPayload {
  observation_type: 'cognitive' | 'value' | 'style' | 'emotional';
  content: string;
  context: string;
  confidence: number;
}

export interface TimeToTwinObserverHandle {
  start(): void;
  stop(): void;
  isRunning(): boolean;
  pulseOnce(): Promise<{ pushed: boolean; reason?: string }>;
}

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
  const intervalMs = options.intervalMs ?? 60_000;
  const log = options.log ?? noop;
  const fetchHealth = options.fetchHealth ?? temporalIntelligenceService.getHealth;
  const fetchAlignment = options.fetchAlignment ?? temporalIntelligenceService.alignmentScore;
  const submit = options.submit ?? defaultSubmit;

  let timer: ReturnType<typeof setInterval> | null = null;

  async function pulseOnce(): Promise<{ pushed: boolean; reason?: string }> {
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
        log('[TimeToTwinObserver] submit failed', result.error);
        return { pushed: false, reason: result.error ?? 'submit_failed' };
      }
      log('[TimeToTwinObserver] observation submitted', {
        confidence: payload.confidence,
      });
      return { pushed: true };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      log('[TimeToTwinObserver] pulse error', msg);
      return { pushed: false, reason: msg };
    }
  }

  function start(): void {
    if (timer) return;
    void pulseOnce();
    timer = setInterval(() => {
      void pulseOnce();
    }, intervalMs);
    log('[TimeToTwinObserver] started', { intervalMs });
  }

  function stop(): void {
    if (timer) {
      clearInterval(timer);
      timer = null;
      log('[TimeToTwinObserver] stopped');
    }
  }

  function isRunning(): boolean {
    return timer !== null;
  }

  return { start, stop, isRunning, pulseOnce };
}

/** Singleton helper for runtime composition. */
let runtimeHandle: TimeToTwinObserverHandle | null = null;

export function getRuntimeTimeToTwinObserver(
  options?: TimeToTwinObserverOptions
): TimeToTwinObserverHandle {
  if (!runtimeHandle) runtimeHandle = createTimeToTwinObserver(options);
  return runtimeHandle;
}

export function resetRuntimeTimeToTwinObserverForTests(): void {
  if (runtimeHandle) runtimeHandle.stop();
  runtimeHandle = null;
}
