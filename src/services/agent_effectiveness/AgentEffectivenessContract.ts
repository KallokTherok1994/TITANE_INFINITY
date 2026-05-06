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

// ── v12 Accountability / Scorecard Layer ────────────────────────────────────────
// Appended additively after base performance contract (197 lines above).
// D0 goal: every agent has a measurable mission, proof gate, scope, and limitations.
// No runtime authority granted. No self-improvement. No autonomous execution.

export const AgentTypeSchema = z.enum([
  'guardian',
  'validator',
  'orchestrator',
  'research',
  'e2e',
  'docs',
  'release',
  'dependency',
  'memory',
  'knowledge',
  'runtime',
  'unknown',
])
export type AgentType = z.infer<typeof AgentTypeSchema>

export const AgentScorecardStatusSchema = z.enum([
  'ACTIVE',
  'PASSIVE',
  'SCAFFOLDED',
  'DEPRECATED',
  'BLOCKED',
  'UNKNOWN',
])
export type AgentScorecardStatus = z.infer<typeof AgentScorecardStatusSchema>

export const AgentScorecardVerdictSchema = z.enum([
  'PASS',
  'FAIL',
  'BLOCKED',
  'PARTIAL',
  'NOT_RUN',
  'UNKNOWN',
])
export type AgentScorecardVerdict = z.infer<typeof AgentScorecardVerdictSchema>

export const AgentRiskLevelSchema = z.enum(['low', 'medium', 'high', 'critical'])
export type AgentRiskLevel = z.infer<typeof AgentRiskLevelSchema>

export const AgentEffectivenessScorecardSchema = z.object({
  agent_id: z.string().min(1).describe('Unique agent identifier matching .agent.md filename'),
  agent_name: z.string().min(1),
  agent_type: AgentTypeSchema,
  mission: z.string().min(10).describe('What this agent is responsible for'),
  trigger_conditions: z.array(z.string().min(1)).min(1).describe('Conditions that activate this agent'),
  allowed_scope: z.array(z.string().min(1)).min(1).describe('Paths or domains the agent may touch'),
  forbidden_scope: z.array(z.string().min(1)).min(1).describe('Paths explicitly off-limits'),
  required_inputs: z.array(z.string()),
  required_outputs: z.array(z.string()),
  required_validators: z.array(z.string()).describe('Validators that must PASS for agent to be trusted'),
  proof_files: z.array(z.string()).describe('Proof pack or evidence files'),
  last_verdict: AgentScorecardVerdictSchema,
  last_run_at: z.string().nullable().describe('ISO 8601 or null if not yet run'),
  blocked_drift_count: z.number().int().min(0).describe('How many times scope drift was detected'),
  false_positive_count: z.number().int().min(0).describe('Agent flagged valid work as problem'),
  false_negative_count: z.number().int().min(0).describe('Agent missed a real problem'),
  known_limitations: z.array(z.string().min(1)).min(1).describe('Must have at least one known limitation or explicit justification field'),
  risk_level: AgentRiskLevelSchema,
  rollback_expectation: z.string().min(1).describe('How to undo this agent effect if wrong'),
  next_gap: z.string().describe('Most important gap or next action for this agent'),
  status: AgentScorecardStatusSchema,
})
export type AgentEffectivenessScorecard = z.infer<typeof AgentEffectivenessScorecardSchema>

export const AgentEffectivenessRegistrySchema = z.object({
  version: z.string(),
  generated_at: z.string().datetime(),
  agents: z.array(AgentEffectivenessScorecardSchema),
})
export type AgentEffectivenessRegistry = z.infer<typeof AgentEffectivenessRegistrySchema>

export const AgentEffectivenessSummarySchema = z.object({
  total_agents: z.number().int().min(0),
  pass_count: z.number().int().min(0),
  fail_count: z.number().int().min(0),
  blocked_count: z.number().int().min(0),
  partial_count: z.number().int().min(0),
  not_run_count: z.number().int().min(0),
  unknown_count: z.number().int().min(0),
  missing_proof_count: z.number().int().min(0),
  missing_validator_count: z.number().int().min(0),
  missing_limitations_count: z.number().int().min(0),
  scope_drift_risk_count: z.number().int().min(0),
  registry_complete: z.boolean().describe('false if any required agent is UNKNOWN'),
})
export type AgentEffectivenessSummary = z.infer<typeof AgentEffectivenessSummarySchema>

// ── Policy Helpers ───────────────────────────────────────────────────────────────

/** An agent is measurable when it has trigger_conditions, allowed_scope, forbidden_scope, and known_limitations. */
export function isAgentMeasurable(agent: AgentEffectivenessScorecard): boolean {
  return (
    agent.trigger_conditions.length > 0 &&
    agent.allowed_scope.length > 0 &&
    agent.forbidden_scope.length > 0 &&
    agent.known_limitations.length > 0
  )
}

/** An agent has required proof when proof_files is non-empty. */
export function hasRequiredProof(agent: AgentEffectivenessScorecard): boolean {
  return agent.proof_files.length > 0
}

/** An agent has validator coverage when required_validators is non-empty. */
export function hasValidatorCoverage(agent: AgentEffectivenessScorecard): boolean {
  return agent.required_validators.length > 0
}

/** An agent can only claim PASS if it has both proof_files and required_validators. */
export function canClaimPass(agent: AgentEffectivenessScorecard): boolean {
  return hasRequiredProof(agent) && hasValidatorCoverage(agent)
}

/**
 * Detect scope drift: returns true when the agent has no allowed_scope
 * or no forbidden_scope (missing boundary = drift risk).
 */
export function detectAgentScopeDrift(agent: AgentEffectivenessScorecard): boolean {
  return agent.allowed_scope.length === 0 || agent.forbidden_scope.length === 0
}

/**
 * Calculate a simple agent effectiveness percentage from scorecard metadata.
 * Penalizes: no proof (-25), no validator (-20), scope drift (-20),
 * missing limitations (-15), last_verdict FAIL/BLOCKED (-20).
 */
export function calculateAgentEffectiveness(agent: AgentEffectivenessScorecard): number {
  let score = 100
  if (!hasRequiredProof(agent)) score -= 25
  if (!hasValidatorCoverage(agent)) score -= 20
  if (detectAgentScopeDrift(agent)) score -= 20
  if (agent.known_limitations.length === 0) score -= 15
  if (agent.last_verdict === 'FAIL' || agent.last_verdict === 'BLOCKED') score -= 20
  return Math.max(0, score)
}

/** Summarize agent limitations as a readable string. */
export function summarizeAgentLimitations(agent: AgentEffectivenessScorecard): string {
  if (agent.known_limitations.length === 0) return '[NO_LIMITATIONS_DECLARED]'
  return agent.known_limitations.map((l, i) => `${i + 1}. ${l}`).join('\n')
}

/** Build registry-level summary. Registry is only complete when no agent is UNKNOWN. */
export function buildAgentEffectivenessSummary(registry: AgentEffectivenessRegistry): AgentEffectivenessSummary {
  const agents = registry.agents
  const verdictCount = (v: AgentScorecardVerdict) => agents.filter(a => a.last_verdict === v).length
  return {
    total_agents: agents.length,
    pass_count: verdictCount('PASS'),
    fail_count: verdictCount('FAIL'),
    blocked_count: verdictCount('BLOCKED'),
    partial_count: verdictCount('PARTIAL'),
    not_run_count: verdictCount('NOT_RUN'),
    unknown_count: verdictCount('UNKNOWN'),
    missing_proof_count: agents.filter(a => !hasRequiredProof(a)).length,
    missing_validator_count: agents.filter(a => !hasValidatorCoverage(a)).length,
    missing_limitations_count: agents.filter(a => a.known_limitations.length === 0).length,
    scope_drift_risk_count: agents.filter(a => detectAgentScopeDrift(a)).length,
    registry_complete: !agents.some(a => a.status === 'UNKNOWN'),
  }
}

/** Sentinel: runtime authority agents must be high/critical risk unless proven otherwise. */
export const RUNTIME_AUTHORITY_MINIMUM_RISK: AgentRiskLevel = 'high'
