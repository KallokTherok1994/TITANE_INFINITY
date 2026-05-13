/**
 * TITANE∞ — Temporal Intelligence Engine v3 DTO types (frontend mirror).
 * These types mirror the Rust serde-serialized payloads. Optional fields are
 * marked optional; unknown extensions are tolerated (additive evolution).
 */

export type PlanningHorizonKey =
  | 'today'
  | 'this_week'
  | 'this_month'
  | 'this_quarter'
  | 'this_year'
  | 'long_term'
  // legacy short aliases (Rust parser accepts both)
  | 'week'
  | 'month'
  | 'quarter'
  | 'year';

export type TimeOfDayKey =
  | 'early_morning'
  | 'morning'
  | 'midday'
  | 'afternoon'
  | 'evening'
  | 'night'
  | 'late_night';

export type TaskPriorityKey = 'low' | 'normal' | 'high' | 'urgent' | 'critical';

export type GoalCategoryKey =
  | 'personal'
  | 'professional'
  | 'health'
  | 'learning'
  | 'financial'
  | 'relationships'
  | 'creative'
  | 'contribution';

export interface MomentDTO {
  timestamp_ms: number;
  iso: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  weekday: number;
  time_of_day: string;
  season?: string;
  is_weekend: boolean;
}

export interface TemporalContextDTO {
  now: MomentDTO;
  session_start: MomentDTO;
  session_duration_ms: number;
  day_progress: number;
  week_progress: number;
  month_progress: number;
  year_progress: number;
  cognitive_energy_estimate: number;
  optimal_for: string[];
}

export interface TemporalStateV3DTO {
  context: TemporalContextDTO;
  memory_stats: MemoryStatsDTO;
  routine_stats: Record<string, unknown>;
  planner_stats: PlannerStatsDTO;
  anticipator_stats: Record<string, unknown>;
  health: TemporalHealthDTO;
}

export interface TickResultDTO {
  tick_duration_ms: number;
  tick_count: number;
  context_updated: boolean;
  triggered_routines: number;
  predictions_made: number;
  memory_traces_consolidated: number;
  alignment_score: number;
}

export interface TemporalTraceDTO {
  id: string;
  event_type: string;
  context: string;
  data: unknown;
  timestamp_ms: number;
  significance: number;
  decay_rate?: number;
  reinforcements?: number;
  links?: string[];
}

export interface MemoryStatsDTO {
  total_traces: number;
  active_traces: number;
  consolidated_traces: number;
  average_strength: number;
  pruned_count?: number;
}

export interface RoutineTriggerDTO {
  pattern: string;
  time_of_day?: string | null;
  hour?: number | null;
  minute?: number | null;
  conditions?: unknown[];
}

export interface RoutineDTO {
  id: string;
  name: string;
  description: string;
  trigger: RoutineTriggerDTO;
  enabled: boolean;
  priority: number;
  cooldown_ms: number;
  last_triggered_ms?: number | null;
  trigger_count?: number;
  actions?: unknown[];
}

export interface TaskDTO {
  id: string;
  title: string;
  description: string;
  priority: TaskPriorityKey | string;
  horizon: string;
  due_at?: number | null;
  estimated_duration_ms?: number | null;
  energy_required: number;
  tags: string[];
  status?: string;
  created_at?: number;
  completed_at?: number | null;
}

export interface UpdateResultDTO {
  tasks_evaluated: number;
  tasks_promoted: number;
  tasks_demoted: number;
  tasks_completed: number;
  overdue_count: number;
  optimal_now: string[];
}

export interface PlannerStatsDTO {
  total_tasks: number;
  pending_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  energy_balance?: number;
}

export interface PredictionDTO {
  kind?: string;
  message: string;
  confidence: number;
  horizon?: string;
  weight?: number;
  source?: string;
}

export interface AlignmentScoreDTO {
  score: number;
  active_goals: number;
  completed_goals: number;
  drift_alerts?: string[];
  suggestions?: string[];
}

export interface TemporalHealthDTO {
  overall: number;
  energy: number;
  alignment: number;
  consistency: number;
  recovery: number;
  blockers?: string[];
}

// ── Inbound payloads (mirror Rust serde structs) ───────────────────

export interface MemoryRecordPayload {
  event_type: string;
  context: string;
  data: unknown;
  significance?: number;
}

export interface MemoryRecallPayload {
  event_type?: string;
  context_tag?: string;
  since_ms?: number;
  limit?: number;
  min_strength?: number;
}

export interface RoutineTriggerPayload {
  pattern: string;
  time_of_day?: TimeOfDayKey | string;
  hour?: number;
  minute?: number;
}

export interface RoutineUpsertPayload {
  id?: string;
  name: string;
  description?: string;
  trigger: RoutineTriggerPayload;
  enabled?: boolean;
  priority?: number;
  cooldown_ms?: number;
}

export interface TaskAddPayload {
  title: string;
  description?: string;
  priority?: TaskPriorityKey;
  horizon?: PlanningHorizonKey;
  due_at?: number;
  estimated_duration_ms?: number;
  energy_required?: number;
  tags?: string[];
}

export interface MilestonePayload {
  id?: string;
  title: string;
  due_date?: number;
  order?: number;
}

export interface GoalUpsertPayload {
  id?: string;
  title: string;
  description?: string;
  category: GoalCategoryKey | string;
  priority?: number;
  target_date?: number;
  milestones?: MilestonePayload[];
}
