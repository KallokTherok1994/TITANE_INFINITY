/**
 * TITANE∞ — Agent Effectiveness System Contract
 * Lock D0 — T1/T2 bounded (metrics + scaffold, no runtime activation gate)
 *
 * Measures and governs the effectiveness of TITANE∞ agents across:
 * 1. Task Completion Rate — did the agent complete what was asked?
 * 2. Response Quality Score — was the response accurate and useful?
 * 3. Latency Budget — did the agent respond within acceptable time?
 * 4. Tool Use Efficiency — was tool use minimal and purposeful?
 * 5. Self-Correction Rate — how often does the agent correct itself?
 *
 * Integrates with:
 * - IntelligenceObservabilityContract (B2) for trace correlation
 * - KnowledgeGovernanceContract (C2) for source confidence input
 *
 * No feature flag required (T1/T2). Schemas and metrics are safe to load.
 */

import { z } from 'zod'

// ── Agent Identity ──────────────────────────────────────────────────────────────
export const AgentRoleSchema = z.enum([
  'omega_chat',       // Main OMEGA conversation agent
  'memory_manager',   // Memory write/read/compact agent
  'knowledge_indexer',// Knowledge graph indexing agent
  'research_validator',// Research truth validation (C3)
  'security_guard',   // Security/injection detection agent
  'tool_executor',    // Tool call execution agent
  'orchestrator',     // Multi-agent orchestration
])
export type AgentRole = z.infer<typeof AgentRoleSchema>

// ── Latency Budget ──────────────────────────────────────────────────────────────
export const LatencyBudgetSchema = z.object({
  budget_ms: z.number().min(0),
  actual_ms: z.number().min(0),
  within_budget: z.boolean(),
  overage_ms: z.number().min(0),
})
export type LatencyBudget = z.infer<typeof LatencyBudgetSchema>

export function computeLatencyBudget(budgetMs: number, actualMs: number): LatencyBudget {
  const within = actualMs <= budgetMs
  return {
    budget_ms: budgetMs,
    actual_ms: actualMs,
    within_budget: within,
    overage_ms: within ? 0 : actualMs - budgetMs,
  }
}

// ── Tool Use Efficiency ─────────────────────────────────────────────────────────
export const ToolUseEfficiencySchema = z.object({
  total_tool_calls: z.number().min(0),
  redundant_calls: z.number().min(0).describe('Calls that returned same result as prior call'),
  failed_calls: z.number().min(0),
  efficiency_score: z.number().min(0).max(1).describe('(total - redundant - failed) / total, or 1 if total=0'),
})
export type ToolUseEfficiency = z.infer<typeof ToolUseEfficiencySchema>

export function computeToolUseEfficiency(
  total: number,
  redundant: number,
  failed: number,
): ToolUseEfficiency {
  if (total === 0) {
    return { total_tool_calls: 0, redundant_calls: 0, failed_calls: 0, efficiency_score: 1.0 }
  }
  const effective = Math.max(0, total - redundant - failed)
  const score = Math.round((effective / total) * 1000) / 1000
  return {
    total_tool_calls: total,
    redundant_calls: redundant,
    failed_calls: failed,
    efficiency_score: Math.max(0, Math.min(1, score)),
  }
}

// ── Self-Correction Event ───────────────────────────────────────────────────────
export const SelfCorrectionEventSchema = z.object({
  event_id: z.string(),
  agent_role: AgentRoleSchema,
  correction_type: z.enum([
    'factual_error',       // Corrected a wrong fact
    'tool_call_retry',     // Retried a failed tool call
    'reasoning_revision',  // Revised reasoning chain
    'format_fix',          // Fixed output format
    'safety_override',     // Overrode an unsafe response
  ]),
  original_token_count: z.number().min(0),
  corrected_token_count: z.number().min(0),
  correction_latency_ms: z.number().min(0),
  timestamp: z.string().datetime(),
})
export type SelfCorrectionEvent = z.infer<typeof SelfCorrectionEventSchema>

// ── Agent Effectiveness Snapshot ────────────────────────────────────────────────
export const AgentEffectivenessSnapshotSchema = z.object({
  snapshot_id: z.string().uuid(),
  agent_role: AgentRoleSchema,
  session_id: z.string(),
  task_description: z.string().min(1),
  task_completed: z.boolean(),
  response_quality_score: z.number().min(0).max(1),
  latency: LatencyBudgetSchema,
  tool_efficiency: ToolUseEfficiencySchema,
  self_corrections: z.array(SelfCorrectionEventSchema),
  self_correction_rate: z.number().min(0).describe('corrections / total tasks in window (0..∞)'),
  overall_effectiveness_score: z.number().min(0).max(1),
  measured_at: z.string().datetime(),
})
export type AgentEffectivenessSnapshot = z.infer<typeof AgentEffectivenessSnapshotSchema>

// ── Effectiveness Score Computation ────────────────────────────────────────────
const EFFECTIVENESS_WEIGHTS = {
  task_completion: 0.35,
  quality: 0.30,
  latency: 0.15,
  tool_efficiency: 0.10,
  correction_penalty: 0.10, // penalty for high self-correction rate
}

const LATENCY_BUDGETS_MS: Record<AgentRole, number> = {
  omega_chat: 30000,
  memory_manager: 5000,
  knowledge_indexer: 10000,
  research_validator: 15000,
  security_guard: 2000,
  tool_executor: 8000,
  orchestrator: 60000,
}

export function getDefaultLatencyBudget(role: AgentRole): number {
  return LATENCY_BUDGETS_MS[role]
}

/**
 * Compute overall effectiveness score from components.
 * self_correction_rate is clamped: 0 = perfect (no corrections), 1+ = penalty
 */
export function computeEffectivenessScore(
  taskCompleted: boolean,
  qualityScore: number,
  latencyBudget: LatencyBudget,
  toolEfficiency: ToolUseEfficiency,
  selfCorrectionRate: number,
): number {
  const taskScore = taskCompleted ? 1.0 : 0.0
  const latencyScore = latencyBudget.within_budget ? 1.0 : Math.max(0, 1 - latencyBudget.overage_ms / latencyBudget.budget_ms)
  const correctionPenalty = Math.min(1, selfCorrectionRate)

  const raw =
    taskScore * EFFECTIVENESS_WEIGHTS.task_completion +
    qualityScore * EFFECTIVENESS_WEIGHTS.quality +
    latencyScore * EFFECTIVENESS_WEIGHTS.latency +
    toolEfficiency.efficiency_score * EFFECTIVENESS_WEIGHTS.tool_efficiency +
    (1 - correctionPenalty) * EFFECTIVENESS_WEIGHTS.correction_penalty

  return Math.round(Math.max(0, Math.min(1, raw)) * 1000) / 1000
}

// ── Effectiveness Tier Classification ──────────────────────────────────────────
export function classifyEffectivenessTier(
  score: number,
): 'elite' | 'effective' | 'adequate' | 'degraded' | 'failing' {
  if (score >= 0.9) return 'elite'
  if (score >= 0.75) return 'effective'
  if (score >= 0.5) return 'adequate'
  if (score >= 0.25) return 'degraded'
  return 'failing'
}

// ── D0 Contract ─────────────────────────────────────────────────────────────────
export const D0AgentEffectivenessContractSchema = z.object({
  lock: z.literal('D0'),
  tier: z.literal('T2'),
  agent_roles_governed: z.array(AgentRoleSchema),
  effectiveness_weights: z.object({
    task_completion: z.number(),
    quality: z.number(),
    latency: z.number(),
    tool_efficiency: z.number(),
    correction_penalty: z.number(),
  }),
  integrations: z.array(z.string()),
})
export type D0AgentEffectivenessContract = z.infer<typeof D0AgentEffectivenessContractSchema>

export function getD0AgentEffectivenessContract(): D0AgentEffectivenessContract {
  return {
    lock: 'D0',
    tier: 'T2',
    agent_roles_governed: ['omega_chat', 'memory_manager', 'knowledge_indexer', 'research_validator', 'security_guard', 'tool_executor', 'orchestrator'],
    effectiveness_weights: EFFECTIVENESS_WEIGHTS,
    integrations: ['B2:IntelligenceObservabilityContract', 'C2:KnowledgeGovernanceContract'],
  }
}
