/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ — Temporal Chat Tools (TIME-IPC v3 Phase 3 / TOOL_CALL bridge)
 * Exposes the temporal IPC actions as chat tools usable via
 * ToolCaller.registerTool(). Every tool routes through the Single Door
 * temporalIntelligenceService — no direct invoke.
 * ═══════════════════════════════════════════════════════════════════
 */

import type { ToolDefinition } from '@/services/chat/toolCaller';
import {
  temporalIntelligenceService,
  type GoalCategoryKey,
  type PlanningHorizonKey,
  type TaskPriorityKey,
  type TimeOfDayKey,
} from '@/services/temporal';

function asString(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback;
}
function asNumber(v: unknown): number | undefined {
  return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
}
function asStringArr(v: unknown): string[] | undefined {
  return Array.isArray(v)
    ? v.filter((x): x is string => typeof x === 'string')
    : undefined;
}

/** TIME tool: add task to planner. */
export const TEMPORAL_TOOL_ADD_TASK: ToolDefinition = {
  name: 'temporal_add_task',
  description:
    'Ajoute une tâche au planner temporel (TITANE∞ TIME). Champs: title (obligatoire), priority (low|normal|high|urgent|critical), horizon (today|this_week|this_month|this_quarter|this_year|long_term), due_at (timestamp ms), estimated_duration_ms, energy_required (0-1), tags[].',
  parameters: {
    title: { type: 'string', required: true },
    description: { type: 'string' },
    priority: { type: 'string' },
    horizon: { type: 'string' },
    due_at: { type: 'number' },
    estimated_duration_ms: { type: 'number' },
    energy_required: { type: 'number' },
    tags: { type: 'array' },
  },
  execute: async args => {
    const title = asString(args.title).trim();
    if (!title) throw new Error('temporal_add_task: title required');
    const id = await temporalIntelligenceService.addTask({
      title,
      description: asString(args.description) || undefined,
      priority: (args.priority as TaskPriorityKey | undefined) ?? undefined,
      horizon: (args.horizon as PlanningHorizonKey | undefined) ?? undefined,
      due_at: asNumber(args.due_at),
      estimated_duration_ms: asNumber(args.estimated_duration_ms),
      energy_required: asNumber(args.energy_required),
      tags: asStringArr(args.tags),
    });
    return { id, title };
  },
};

/** TIME tool: upsert routine. */
export const TEMPORAL_TOOL_UPSERT_ROUTINE: ToolDefinition = {
  name: 'temporal_upsert_routine',
  description:
    'Crée ou met à jour une routine récurrente (TITANE∞ TIME). trigger.pattern accepte daily | weekly:1,2,3 | monthly:1,15 | interval:2h | event:focus_start. time_of_day: morning|afternoon|...',
  parameters: {
    id: { type: 'string' },
    name: { type: 'string', required: true },
    description: { type: 'string' },
    pattern: { type: 'string', required: true },
    time_of_day: { type: 'string' },
    hour: { type: 'number' },
    minute: { type: 'number' },
    enabled: { type: 'boolean' },
    priority: { type: 'number' },
    cooldown_ms: { type: 'number' },
  },
  execute: async args => {
    const name = asString(args.name).trim();
    const pattern = asString(args.pattern).trim();
    if (!name) throw new Error('temporal_upsert_routine: name required');
    if (!pattern) throw new Error('temporal_upsert_routine: pattern required');
    const id = await temporalIntelligenceService.upsertRoutine({
      id: typeof args.id === 'string' ? args.id : undefined,
      name,
      description: asString(args.description) || undefined,
      trigger: {
        pattern,
        time_of_day:
          typeof args.time_of_day === 'string'
            ? (args.time_of_day as TimeOfDayKey)
            : undefined,
        hour: asNumber(args.hour),
        minute: asNumber(args.minute),
      },
      enabled: typeof args.enabled === 'boolean' ? args.enabled : undefined,
      priority: asNumber(args.priority),
      cooldown_ms: asNumber(args.cooldown_ms),
    });
    return { id, name };
  },
};

/** TIME tool: upsert goal (long-term alignment). */
export const TEMPORAL_TOOL_UPSERT_GOAL: ToolDefinition = {
  name: 'temporal_upsert_goal',
  description:
    'Ajoute ou met à jour un objectif long-terme (TITANE∞ TIME). category: personal|professional|health|learning|financial|relationships|creative|contribution. milestones: liste optionnelle {title, due_date?, order?}.',
  parameters: {
    id: { type: 'string' },
    title: { type: 'string', required: true },
    description: { type: 'string' },
    category: { type: 'string', required: true },
    priority: { type: 'number' },
    target_date: { type: 'number' },
    milestones: { type: 'array' },
  },
  execute: async args => {
    const title = asString(args.title).trim();
    if (!title) throw new Error('temporal_upsert_goal: title required');
    const category = asString(args.category).trim() || 'personal';
    const rawMilestones = Array.isArray(args.milestones) ? args.milestones : undefined;
    const milestones = rawMilestones
      ?.filter((m): m is Record<string, unknown> => !!m && typeof m === 'object')
      .map((m, i) => ({
        id: typeof m.id === 'string' ? m.id : undefined,
        title: asString(m.title, `Milestone ${i + 1}`),
        due_date: asNumber(m.due_date),
        order: asNumber(m.order),
      }));
    const id = await temporalIntelligenceService.upsertGoal({
      id: typeof args.id === 'string' ? args.id : undefined,
      title,
      description: asString(args.description) || undefined,
      category: category as GoalCategoryKey,
      priority: asNumber(args.priority),
      target_date: asNumber(args.target_date),
      milestones,
    });
    return { id, title, category };
  },
};

/** TIME tool: record temporal memory. */
export const TEMPORAL_TOOL_RECORD_MEMORY: ToolDefinition = {
  name: 'temporal_record_memory',
  description:
    'Enregistre une trace mémoire temporelle (TITANE∞ TIME). Utile pour journaliser événements, décisions, signaux du jour.',
  parameters: {
    event_type: { type: 'string', required: true },
    context: { type: 'string', required: true },
    data: { type: 'object' },
    significance: { type: 'number' },
  },
  execute: async args => {
    const event_type = asString(args.event_type).trim();
    const context = asString(args.context).trim();
    if (!event_type) throw new Error('temporal_record_memory: event_type required');
    if (!context) throw new Error('temporal_record_memory: context required');
    const id = await temporalIntelligenceService.recordMemory({
      event_type,
      context,
      data: args.data ?? {},
      significance: asNumber(args.significance),
    });
    return { id, event_type, context };
  },
};

/** TIME tool: read plan for an horizon. */
export const TEMPORAL_TOOL_GET_PLAN: ToolDefinition = {
  name: 'temporal_get_plan',
  description:
    'Lit le plan temporel (TITANE∞ TIME) pour un horizon donné (today par défaut).',
  parameters: {
    horizon: { type: 'string' },
  },
  execute: async args => {
    const horizon =
      typeof args.horizon === 'string' ? (args.horizon as PlanningHorizonKey) : undefined;
    const tasks = await temporalIntelligenceService.getPlan(horizon);
    return { horizon: horizon ?? 'today', count: tasks.length, tasks };
  },
};

/** Canonical registry of temporal chat tools. */
export const TEMPORAL_CHAT_TOOLS: Record<string, ToolDefinition> = {
  [TEMPORAL_TOOL_ADD_TASK.name]: TEMPORAL_TOOL_ADD_TASK,
  [TEMPORAL_TOOL_UPSERT_ROUTINE.name]: TEMPORAL_TOOL_UPSERT_ROUTINE,
  [TEMPORAL_TOOL_UPSERT_GOAL.name]: TEMPORAL_TOOL_UPSERT_GOAL,
  [TEMPORAL_TOOL_RECORD_MEMORY.name]: TEMPORAL_TOOL_RECORD_MEMORY,
  [TEMPORAL_TOOL_GET_PLAN.name]: TEMPORAL_TOOL_GET_PLAN,
};

/** Names exported for audit / contract tests. */
export const TEMPORAL_CHAT_TOOL_NAMES = Object.keys(TEMPORAL_CHAT_TOOLS) as Array<
  keyof typeof TEMPORAL_CHAT_TOOLS
>;

/**
 * Register all temporal chat tools into a ToolCallerService-like surface.
 * Accepts a minimal duck-typed registry to keep this module loosely coupled.
 */
export function registerTemporalChatTools(registry: {
  registerTool: (tool: ToolDefinition) => void;
}): void {
  for (const tool of Object.values(TEMPORAL_CHAT_TOOLS)) {
    registry.registerTool(tool);
  }
}
