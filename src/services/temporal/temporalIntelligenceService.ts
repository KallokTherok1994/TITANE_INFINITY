/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ — TemporalIntelligenceService (TIME-IPC v3 Phase 2)
 * Thin TypeScript bridge over the 17+1 Rust temporal commands.
 * Single Door discipline: every call uses `safeInvokeCanonical`.
 * ═══════════════════════════════════════════════════════════════════
 */

import { safeInvokeCanonical, type CanonicalIpcResult } from '@/utils/invoke';
import type {
  TemporalContextDTO,
  TemporalStateV3DTO,
  TickResultDTO,
  TemporalTraceDTO,
  MemoryStatsDTO,
  RoutineDTO,
  TaskDTO,
  UpdateResultDTO,
  PlannerStatsDTO,
  PredictionDTO,
  AlignmentScoreDTO,
  TemporalHealthDTO,
  MemoryRecordPayload,
  MemoryRecallPayload,
  RoutineUpsertPayload,
  TaskAddPayload,
  GoalUpsertPayload,
  PlanningHorizonKey,
} from './types';

/** Unwrap helper — throws on IPC failure so React hooks can route via `useQuery`-style flows. */
function unwrap<T>(result: CanonicalIpcResult<T>, command: string): T {
  if (!result.ok || result.content === null) {
    const code = result.error?.code ?? 'IPC_UNKNOWN';
    const msg = result.error?.message ?? 'IPC call failed';
    throw new Error(`[${command}] ${code}: ${msg}`);
  }
  return result.content;
}

// ── Contexte & état ─────────────────────────────────────────────────

export async function getFullContext(): Promise<TemporalContextDTO> {
  const r = await safeInvokeCanonical<TemporalContextDTO>('temporal_get_full_context');
  return unwrap(r, 'temporal_get_full_context');
}

export async function getStateV3(): Promise<TemporalStateV3DTO> {
  const r = await safeInvokeCanonical<TemporalStateV3DTO>('temporal_get_state_v3');
  return unwrap(r, 'temporal_get_state_v3');
}

export async function tick(): Promise<TickResultDTO> {
  const r = await safeInvokeCanonical<TickResultDTO>('temporal_tick');
  return unwrap(r, 'temporal_tick');
}

export async function getHealth(): Promise<TemporalHealthDTO> {
  const r = await safeInvokeCanonical<TemporalHealthDTO>('temporal_metrics_health');
  return unwrap(r, 'temporal_metrics_health');
}

// ── Mémoire temporelle ──────────────────────────────────────────────

export async function recordMemory(payload: MemoryRecordPayload): Promise<string> {
  const r = await safeInvokeCanonical<string>('temporal_memory_record', { payload });
  return unwrap(r, 'temporal_memory_record');
}

export async function recallMemory(
  payload: MemoryRecallPayload = {}
): Promise<TemporalTraceDTO[]> {
  const r = await safeInvokeCanonical<TemporalTraceDTO[]>('temporal_memory_recall', {
    payload,
  });
  return unwrap(r, 'temporal_memory_recall');
}

export async function memoryMetrics(): Promise<MemoryStatsDTO> {
  const r = await safeInvokeCanonical<MemoryStatsDTO>('temporal_memory_metrics');
  return unwrap(r, 'temporal_memory_metrics');
}

export async function consolidateMemory(): Promise<MemoryStatsDTO> {
  const r = await safeInvokeCanonical<MemoryStatsDTO>('temporal_memory_consolidate');
  return unwrap(r, 'temporal_memory_consolidate');
}

// ── Routines ────────────────────────────────────────────────────────

export async function listRoutines(): Promise<RoutineDTO[]> {
  const r = await safeInvokeCanonical<RoutineDTO[]>('temporal_routine_list');
  return unwrap(r, 'temporal_routine_list');
}

export async function upsertRoutine(payload: RoutineUpsertPayload): Promise<string> {
  const r = await safeInvokeCanonical<string>('temporal_routine_upsert', { payload });
  return unwrap(r, 'temporal_routine_upsert');
}

export async function checkRoutineTriggers(): Promise<RoutineDTO[]> {
  const r = await safeInvokeCanonical<RoutineDTO[]>('temporal_routine_check_triggers');
  return unwrap(r, 'temporal_routine_check_triggers');
}

// ── Planner ─────────────────────────────────────────────────────────

export async function getPlan(horizon?: PlanningHorizonKey): Promise<TaskDTO[]> {
  const r = await safeInvokeCanonical<TaskDTO[]>('temporal_planner_get_plan', {
    horizon,
  });
  return unwrap(r, 'temporal_planner_get_plan');
}

export async function addTask(payload: TaskAddPayload): Promise<string> {
  const r = await safeInvokeCanonical<string>('temporal_planner_add_task', { payload });
  return unwrap(r, 'temporal_planner_add_task');
}

export async function optimizePlan(): Promise<UpdateResultDTO> {
  const r = await safeInvokeCanonical<UpdateResultDTO>('temporal_planner_optimize');
  return unwrap(r, 'temporal_planner_optimize');
}

export async function plannerStats(): Promise<PlannerStatsDTO> {
  const r = await safeInvokeCanonical<PlannerStatsDTO>('temporal_planner_stats');
  return unwrap(r, 'temporal_planner_stats');
}

// ── Anticipation & alignement ──────────────────────────────────────

export async function predict(horizon?: PlanningHorizonKey): Promise<PredictionDTO[]> {
  const r = await safeInvokeCanonical<PredictionDTO[]>('temporal_anticipator_predict', {
    horizon,
  });
  return unwrap(r, 'temporal_anticipator_predict');
}

export async function alignmentScore(): Promise<AlignmentScoreDTO> {
  const r = await safeInvokeCanonical<AlignmentScoreDTO>('temporal_alignment_score');
  return unwrap(r, 'temporal_alignment_score');
}

export async function upsertGoal(payload: GoalUpsertPayload): Promise<string> {
  const r = await safeInvokeCanonical<string>('temporal_alignment_goal_upsert', {
    payload,
  });
  return unwrap(r, 'temporal_alignment_goal_upsert');
}

/** Canonical command list for contract tests and auditing. */
export const TEMPORAL_V3_COMMANDS = [
  'temporal_get_full_context',
  'temporal_get_state_v3',
  'temporal_tick',
  'temporal_memory_record',
  'temporal_memory_recall',
  'temporal_memory_metrics',
  'temporal_memory_consolidate',
  'temporal_routine_list',
  'temporal_routine_upsert',
  'temporal_routine_check_triggers',
  'temporal_planner_get_plan',
  'temporal_planner_add_task',
  'temporal_planner_optimize',
  'temporal_planner_stats',
  'temporal_anticipator_predict',
  'temporal_alignment_score',
  'temporal_alignment_goal_upsert',
  'temporal_metrics_health',
] as const;

export type TemporalV3Command = (typeof TEMPORAL_V3_COMMANDS)[number];

export const temporalIntelligenceService = {
  getFullContext,
  getStateV3,
  tick,
  getHealth,
  recordMemory,
  recallMemory,
  memoryMetrics,
  consolidateMemory,
  listRoutines,
  upsertRoutine,
  checkRoutineTriggers,
  getPlan,
  addTask,
  optimizePlan,
  plannerStats,
  predict,
  alignmentScore,
  upsertGoal,
};

export type TemporalIntelligenceService = typeof temporalIntelligenceService;
