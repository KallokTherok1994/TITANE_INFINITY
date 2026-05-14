/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ — useTemporalIntelligence (TIME-IPC v3 Phase 2)
 * React hook exposing the 17+1 temporal IPC commands with safe polling
 * for context/health/state and one-shot actions for mutations.
 * ═══════════════════════════════════════════════════════════════════
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  temporalIntelligenceService,
  type TemporalContextDTO,
  type TemporalStateV3DTO,
  type TemporalHealthDTO,
  type TickResultDTO,
  type MemoryStatsDTO,
  type RoutineDTO,
  type TaskDTO,
  type PlannerStatsDTO,
  type PredictionDTO,
  type AlignmentScoreDTO,
  type TemporalTraceDTO,
  type UpdateResultDTO,
  type TaskAddPayload,
  type RoutineUpsertPayload,
  type GoalUpsertPayload,
  type MemoryRecordPayload,
  type MemoryRecallPayload,
  type PlanningHorizonKey,
} from '@/services/temporal';

export interface UseTemporalIntelligenceState {
  context: TemporalContextDTO | null;
  state: TemporalStateV3DTO | null;
  health: TemporalHealthDTO | null;
  alignment: AlignmentScoreDTO | null;
  loading: boolean;
  error: string | null;
  lastTick: TickResultDTO | null;
}

export interface UseTemporalIntelligenceActions {
  refresh(): Promise<void>;
  tick(): Promise<TickResultDTO | null>;
  recordMemory(p: MemoryRecordPayload): Promise<string | null>;
  recallMemory(p?: MemoryRecallPayload): Promise<TemporalTraceDTO[]>;
  memoryMetrics(): Promise<MemoryStatsDTO | null>;
  consolidateMemory(): Promise<MemoryStatsDTO | null>;
  listRoutines(): Promise<RoutineDTO[]>;
  upsertRoutine(p: RoutineUpsertPayload): Promise<string | null>;
  checkRoutineTriggers(): Promise<RoutineDTO[]>;
  getPlan(horizon?: PlanningHorizonKey): Promise<TaskDTO[]>;
  addTask(p: TaskAddPayload): Promise<string | null>;
  optimizePlan(): Promise<UpdateResultDTO | null>;
  plannerStats(): Promise<PlannerStatsDTO | null>;
  predict(horizon?: PlanningHorizonKey): Promise<PredictionDTO[]>;
  alignmentScore(): Promise<AlignmentScoreDTO | null>;
  upsertGoal(p: GoalUpsertPayload): Promise<string | null>;
}

export interface UseTemporalIntelligenceOptions {
  /** Auto-poll context+health every N ms (0 disables). Default 30000. */
  pollIntervalMs?: number;
  /** Auto-fetch on mount (default true). */
  autoStart?: boolean;
}

export function useTemporalIntelligence(
  options: UseTemporalIntelligenceOptions = {}
): UseTemporalIntelligenceState & UseTemporalIntelligenceActions {
  const { pollIntervalMs = 30_000, autoStart = true } = options;

  const [context, setContext] = useState<TemporalContextDTO | null>(null);
  const [state, setState] = useState<TemporalStateV3DTO | null>(null);
  const [health, setHealth] = useState<TemporalHealthDTO | null>(null);
  const [alignment, setAlignment] = useState<AlignmentScoreDTO | null>(null);
  const [lastTick, setLastTick] = useState<TickResultDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const safeSet = useCallback(<T>(setter: (v: T) => void, value: T) => {
    if (mountedRef.current) setter(value);
  }, []);

  const refresh = useCallback(async () => {
    safeSet(setLoading, true);
    safeSet(setError, null);
    try {
      const [ctx, st, hl, al] = await Promise.allSettled([
        temporalIntelligenceService.getFullContext(),
        temporalIntelligenceService.getStateV3(),
        temporalIntelligenceService.getHealth(),
        temporalIntelligenceService.alignmentScore(),
      ]);
      if (ctx.status === 'fulfilled') safeSet(setContext, ctx.value);
      if (st.status === 'fulfilled') safeSet(setState, st.value);
      if (hl.status === 'fulfilled') safeSet(setHealth, hl.value);
      if (al.status === 'fulfilled') safeSet(setAlignment, al.value);
      const firstReject = [ctx, st, hl, al].find(r => r.status === 'rejected');
      if (firstReject && firstReject.status === 'rejected') {
        safeSet(setError, String(firstReject.reason?.message ?? firstReject.reason));
      }
    } catch (e) {
      safeSet(setError, e instanceof Error ? e.message : String(e));
    } finally {
      safeSet(setLoading, false);
    }
  }, [safeSet]);

  useEffect(() => {
    if (!autoStart) return;
    void refresh();
    if (pollIntervalMs <= 0) return;
    const id = setInterval(() => {
      void refresh();
    }, pollIntervalMs);
    return () => clearInterval(id);
  }, [autoStart, pollIntervalMs, refresh]);

  const tick = useCallback(async () => {
    try {
      const r = await temporalIntelligenceService.tick();
      safeSet(setLastTick, r);
      return r;
    } catch (e) {
      safeSet(setError, e instanceof Error ? e.message : String(e));
      return null;
    }
  }, [safeSet]);

  const wrap = useCallback(
    <T>(fn: () => Promise<T>): Promise<T | null> =>
      fn().catch(e => {
        safeSet(setError, e instanceof Error ? e.message : String(e));
        return null as T | null;
      }),
    [safeSet]
  );

  const wrapList = useCallback(
    <T>(fn: () => Promise<T[]>): Promise<T[]> =>
      fn().catch(e => {
        safeSet(setError, e instanceof Error ? e.message : String(e));
        return [] as T[];
      }),
    [safeSet]
  );

  return {
    context,
    state,
    health,
    alignment,
    lastTick,
    loading,
    error,
    refresh,
    tick,
    recordMemory: p => wrap(() => temporalIntelligenceService.recordMemory(p)),
    recallMemory: p => wrapList(() => temporalIntelligenceService.recallMemory(p)),
    memoryMetrics: () => wrap(() => temporalIntelligenceService.memoryMetrics()),
    consolidateMemory: () => wrap(() => temporalIntelligenceService.consolidateMemory()),
    listRoutines: () => wrapList(() => temporalIntelligenceService.listRoutines()),
    upsertRoutine: p => wrap(() => temporalIntelligenceService.upsertRoutine(p)),
    checkRoutineTriggers: () =>
      wrapList(() => temporalIntelligenceService.checkRoutineTriggers()),
    getPlan: h => wrapList(() => temporalIntelligenceService.getPlan(h)),
    addTask: p => wrap(() => temporalIntelligenceService.addTask(p)),
    optimizePlan: () => wrap(() => temporalIntelligenceService.optimizePlan()),
    plannerStats: () => wrap(() => temporalIntelligenceService.plannerStats()),
    predict: h => wrapList(() => temporalIntelligenceService.predict(h)),
    alignmentScore: () => wrap(() => temporalIntelligenceService.alignmentScore()),
    upsertGoal: p => wrap(() => temporalIntelligenceService.upsertGoal(p)),
  };
}

export default useTemporalIntelligence;
