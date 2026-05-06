/**
 * TITANE∞ — Self-Improvement Lab Contract
 * Lock D4 — T4 Scaffold Only (prod isolation required)
 *
 * The Self-Improvement Lab defines the scaffold for TITANE's autonomous
 * self-improvement capability: the ability to detect its own failure patterns,
 * propose corrections, and (when activated) apply governed self-modifications.
 *
 * T4 status: SCAFFOLD ONLY. No self-modification is executed. All proposed
 * improvements are logged only. Live application requires explicit T4 activation
 * and prod isolation verified by governance team.
 *
 * Self-improvement domains:
 * - response_quality: improve response formatting and completeness
 * - reasoning_accuracy: correct reasoning chain errors detected post-response
 * - knowledge_gap: flag knowledge areas needing reinforcement
 * - latency_optimization: identify slow paths in agent pipeline
 * - prompt_calibration: refine system prompt fragments based on outcomes
 *
 * Improvement pipeline (scaffold stages):
 * 1. DETECT: pattern detected in session outcomes
 * 2. PROPOSE: improvement candidate generated (scaffolded, not applied)
 * 3. EVALUATE: candidate scored against safety + effectiveness metrics
 * 4. APPROVE: T4 approval gate (scaffold: always blocked until activated)
 * 5. APPLY: governed modification applied (scaffold: never reached)
 *
 * Feature Flag: TITANE_D4_SELF_IMPROVEMENT_LAB (default=false — T4 scaffold only)
 */

import { z } from 'zod'

// ── T4 Guard ────────────────────────────────────────────────────────────────────
export const SELF_IMPROVEMENT_D4_FLAG =
  typeof import.meta !== 'undefined' &&
  (import.meta as Record<string, unknown>).env !== undefined
    ? String((import.meta as Record<string, Record<string, unknown>>).env['VITE_TITANE_D4_SELF_IMPROVEMENT_LAB'] ?? 'false') === 'true'
    : false

// ── Improvement Domain ──────────────────────────────────────────────────────────
export const ImprovementDomainSchema = z.enum([
  'response_quality',
  'reasoning_accuracy',
  'knowledge_gap',
  'latency_optimization',
  'prompt_calibration',
])
export type ImprovementDomain = z.infer<typeof ImprovementDomainSchema>

// ── Pipeline Stage ──────────────────────────────────────────────────────────────
export const PipelineStageSchema = z.enum(['detect', 'propose', 'evaluate', 'approve', 'apply'])
export type PipelineStage = z.infer<typeof PipelineStageSchema>

// ── Improvement Proposal ────────────────────────────────────────────────────────
export const ImprovementProposalSchema = z.object({
  proposal_id: z.string(),
  domain: ImprovementDomainSchema,
  description: z.string().min(1).max(1000),
  detected_pattern: z.string().max(500),
  proposed_change: z.string().max(500),
  safety_score: z.number().min(0).max(1).describe('0=unsafe, 1=fully safe'),
  effectiveness_estimate: z.number().min(0).max(1),
  stage: PipelineStageSchema,
  t4_blocked: z.boolean().describe('Always true in scaffold — no apply stage reachable'),
  created_at_ms: z.number().min(0),
})
export type ImprovementProposal = z.infer<typeof ImprovementProposalSchema>

// ── Lab Session ─────────────────────────────────────────────────────────────────
export const LabSessionSchema = z.object({
  session_id: z.string(),
  proposals: z.array(ImprovementProposalSchema),
  total_detected: z.number().min(0),
  total_proposed: z.number().min(0),
  total_evaluated: z.number().min(0),
  total_blocked_at_t4: z.number().min(0),
  total_applied: z.literal(0).describe('Always 0 in T4 scaffold'),
  flag_active: z.boolean(),
})
export type LabSession = z.infer<typeof LabSessionSchema>

// ── Safety Evaluation ────────────────────────────────────────────────────────────
export interface SafetyEvaluation {
  safe: boolean
  score: number
  blocking_reason: string | null
}

export function evaluateProposalSafety(proposal: ImprovementProposal): SafetyEvaluation {
  // In scaffold: any proposal with safety_score < 0.8 is blocked
  const SAFETY_THRESHOLD = 0.8
  if (proposal.safety_score < SAFETY_THRESHOLD) {
    return {
      safe: false,
      score: proposal.safety_score,
      blocking_reason: `safety_score=${proposal.safety_score.toFixed(2)} below threshold (${SAFETY_THRESHOLD})`,
    }
  }
  return { safe: true, score: proposal.safety_score, blocking_reason: null }
}

// ── Detect Improvement (T4 flag-gated) ─────────────────────────────────────────
export interface DetectionResult {
  detected: boolean
  proposal: ImprovementProposal | null
  blocked_reason: string | null
}

export function detectImprovement(
  params: {
    proposal_id: string
    domain: ImprovementDomain
    description: string
    detected_pattern: string
    proposed_change: string
    safety_score: number
    effectiveness_estimate: number
  },
  flagActive = SELF_IMPROVEMENT_D4_FLAG,
): DetectionResult {
  if (!flagActive) {
    return {
      detected: false,
      proposal: null,
      blocked_reason: 'TITANE_D4_SELF_IMPROVEMENT_LAB flag=false — T4 scaffold only',
    }
  }
  const proposal: ImprovementProposal = {
    ...params,
    stage: 'detect',
    t4_blocked: true,
    created_at_ms: Date.now(),
  }
  return { detected: true, proposal, blocked_reason: null }
}

// ── Advance Stage (scaffold: never reaches apply) ──────────────────────────────
export interface StageAdvanceResult {
  advanced: boolean
  new_stage: PipelineStage
  blocked: boolean
  blocking_reason: string | null
}

const STAGE_ORDER: PipelineStage[] = ['detect', 'propose', 'evaluate', 'approve', 'apply']

export function advancePipelineStage(
  proposal: ImprovementProposal,
  flagActive = SELF_IMPROVEMENT_D4_FLAG,
): StageAdvanceResult {
  if (!flagActive) {
    return { advanced: false, new_stage: proposal.stage, blocked: true, blocking_reason: 'flag=false — T4 scaffold only' }
  }
  // T4 scaffold: block at approve stage — never reach apply
  if (proposal.stage === 'approve') {
    return {
      advanced: false,
      new_stage: 'approve',
      blocked: true,
      blocking_reason: 'T4 approval required — apply stage is blocked in scaffold',
    }
  }
  const currentIdx = STAGE_ORDER.indexOf(proposal.stage)
  const nextStage = STAGE_ORDER[currentIdx + 1]
  if (nextStage === 'apply') {
    return {
      advanced: false,
      new_stage: proposal.stage,
      blocked: true,
      blocking_reason: 'T4 approval required — apply stage is blocked in scaffold',
    }
  }
  return { advanced: true, new_stage: nextStage, blocked: false, blocking_reason: null }
}

// ── Build Lab Session ────────────────────────────────────────────────────────────
export function buildLabSession(
  session_id: string,
  proposals: ImprovementProposal[],
  flagActive = SELF_IMPROVEMENT_D4_FLAG,
): LabSession {
  return {
    session_id,
    proposals,
    total_detected: proposals.filter((p) => p.stage === 'detect').length,
    total_proposed: proposals.filter((p) => p.stage === 'propose').length,
    total_evaluated: proposals.filter((p) => p.stage === 'evaluate').length,
    total_blocked_at_t4: proposals.filter((p) => p.t4_blocked).length,
    total_applied: 0,
    flag_active: flagActive,
  }
}

// ── D4 Contract ─────────────────────────────────────────────────────────────────
export const D4SelfImprovementLabContractSchema = z.object({
  lock: z.literal('D4'),
  tier: z.literal('T4'),
  flag_name: z.literal('TITANE_D4_SELF_IMPROVEMENT_LAB'),
  flag_active: z.boolean(),
  improvement_domains: z.number(),
  pipeline_stages: z.number(),
  apply_stage_blocked: z.literal(true),
  safety_threshold: z.number(),
  t4_approval_required: z.literal(true),
  total_applied_in_scaffold: z.literal(0),
})
export type D4SelfImprovementLabContract = z.infer<typeof D4SelfImprovementLabContractSchema>

export function getD4SelfImprovementLabContract(): D4SelfImprovementLabContract {
  return {
    lock: 'D4',
    tier: 'T4',
    flag_name: 'TITANE_D4_SELF_IMPROVEMENT_LAB',
    flag_active: SELF_IMPROVEMENT_D4_FLAG,
    improvement_domains: 5,
    pipeline_stages: 5,
    apply_stage_blocked: true,
    safety_threshold: 0.8,
    t4_approval_required: true,
    total_applied_in_scaffold: 0,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── v15 SIDECAR — Approval-Gated Self-Improvement Lab ───────────────────────
// Doctrine: "Self-improvement proposes; it does not self-authorize."
// ═══════════════════════════════════════════════════════════════════════════════

// ── Improvement State (v15) ─────────────────────────────────────────────────────
export const ImprovementStateSchema = z.enum([
  'observed', 'hypothesis', 'proposed', 'sandboxed', 'evaluated',
  'proof_ready', 'approval_required', 'approved', 'rejected', 'expired',
  'blocked', 'unknown',
])
export type ImprovementState = z.infer<typeof ImprovementStateSchema>

// ── Promotion Status ────────────────────────────────────────────────────────────
export const PromotionStatusSchema = z.enum([
  'not_promotable', 'approval_required', 'approved_for_promotion', 'rejected', 'blocked',
])
export type PromotionStatus = z.infer<typeof PromotionStatusSchema>

// ── Risk Level (v15) ────────────────────────────────────────────────────────────
export const ImprovementRiskLevelSchema = z.enum([
  'low', 'medium', 'high', 'identity_sensitive', 'runtime_sensitive',
  'security_sensitive', 'restricted',
])
export type ImprovementRiskLevel = z.infer<typeof ImprovementRiskLevelSchema>

// ── Weakness ────────────────────────────────────────────────────────────────────
export const SelfImprovementWeaknessSchema = z.object({
  weakness_id: z.string(),
  domain: ImprovementDomainSchema,
  description: z.string().min(1),
  observed_at: z.string(),
  severity: z.enum(['low', 'medium', 'high']),
  evidence: z.string().nullable(),
})
export type SelfImprovementWeakness = z.infer<typeof SelfImprovementWeaknessSchema>

// ── Hypothesis ──────────────────────────────────────────────────────────────────
export const SelfImprovementHypothesisSchema = z.object({
  hypothesis_id: z.string(),
  weakness_id: z.string(),
  hypothesis_text: z.string().min(1),
  confidence: z.number().min(0).max(1).describe('Signal strength — NOT a promotion proxy'),
  requires_sandbox: z.boolean(),
  created_at: z.string(),
})
export type SelfImprovementHypothesis = z.infer<typeof SelfImprovementHypothesisSchema>

// ── Patch Proposal ──────────────────────────────────────────────────────────────
export const SelfImprovementPatchProposalSchema = z.object({
  patch_id: z.string(),
  hypothesis_id: z.string(),
  patch_description: z.string().min(1),
  affected_paths: z.array(z.string()),
  is_applied: z.literal(false).describe('Always false — proposals are artifacts, not applied patches'),
  risk_level: ImprovementRiskLevelSchema,
  requires_approval: z.boolean(),
  approval_status: PromotionStatusSchema,
  created_at: z.string(),
})
export type SelfImprovementPatchProposal = z.infer<typeof SelfImprovementPatchProposalSchema>

// ── Sandbox Plan ────────────────────────────────────────────────────────────────
export const SelfImprovementSandboxPlanSchema = z.object({
  sandbox_id: z.string(),
  patch_id: z.string(),
  environment: z.enum(['unit', 'integration', 'isolated_e2e']),
  isolation_confirmed: z.boolean(),
  can_affect_production: z.literal(false).describe('Sandbox must never affect production'),
  planned_at: z.string(),
})
export type SelfImprovementSandboxPlan = z.infer<typeof SelfImprovementSandboxPlanSchema>

// ── Eval Snapshot ───────────────────────────────────────────────────────────────
export const SelfImprovementEvalSnapshotSchema = z.object({
  eval_id: z.string(),
  patch_id: z.string(),
  timing: z.enum(['before', 'after']),
  score: z.number().min(0).max(1),
  metrics: z.record(z.number()),
  taken_at: z.string(),
})
export type SelfImprovementEvalSnapshot = z.infer<typeof SelfImprovementEvalSnapshotSchema>

// ── Comparison ──────────────────────────────────────────────────────────────────
export interface SelfImprovementComparison {
  patch_id: string
  eval_before: SelfImprovementEvalSnapshot | null
  eval_after: SelfImprovementEvalSnapshot | null
  improvement_delta: number | null
  comparison_valid: boolean
  confidence_alone_approves: false
}

// ── Approval Gate ───────────────────────────────────────────────────────────────
export const SelfImprovementApprovalGateSchema = z.object({
  gate_id: z.string(),
  patch_id: z.string(),
  approval_status: PromotionStatusSchema,
  approved_by: z.string().nullable(),
  approved_at: z.string().nullable(),
  rejected_reason: z.string().nullable(),
  auto_approved: z.literal(false).describe('Auto-approval is always blocked'),
  proof_pack_required: z.boolean(),
  has_proof_pack: z.boolean(),
})
export type SelfImprovementApprovalGate = z.infer<typeof SelfImprovementApprovalGateSchema>

// ── Lab Record (v15) ────────────────────────────────────────────────────────────
export const SelfImprovementLabRecordSchema = z.object({
  record_id: z.string(),
  weakness: SelfImprovementWeaknessSchema,
  hypothesis: SelfImprovementHypothesisSchema.nullable(),
  patch_proposal: SelfImprovementPatchProposalSchema.nullable(),
  sandbox_plan: SelfImprovementSandboxPlanSchema.nullable(),
  approval_gate: SelfImprovementApprovalGateSchema.nullable(),
  state: ImprovementStateSchema,
  risk_level: ImprovementRiskLevelSchema,
  created_at: z.string(),
  updated_at: z.string(),
})
export type SelfImprovementLabRecord = z.infer<typeof SelfImprovementLabRecordSchema>

// ── Promotion Decision ──────────────────────────────────────────────────────────
export interface SelfImprovementPromotionDecision {
  record_id: string
  promotion_status: PromotionStatus
  reason: string
  confidence_alone: false
  eval_improvement_alone: false
  requires_explicit_approval: true
}

// ── Summary ─────────────────────────────────────────────────────────────────────
export interface SelfImprovementSummary {
  total: number
  observed: number
  proposed: number
  approved: number
  rejected: number
  blocked: number
  identity_sensitive: number
  runtime_sensitive: number
  auto_merge_blocked: true
  self_deploy_blocked: true
  confidence_alone_approves: false
}

// ── Policy Helpers (v15) ────────────────────────────────────────────────────────
const _IDENTITY_SENSITIVE_RISK: ImprovementRiskLevel[] = ['identity_sensitive', 'restricted']
const _RUNTIME_SENSITIVE_RISK: ImprovementRiskLevel[] = ['runtime_sensitive', 'security_sensitive', 'restricted']
const _BLOCKING_STATES: ImprovementState[] = ['rejected', 'expired', 'blocked', 'unknown']

export function requiresApproval(_record: SelfImprovementLabRecord): true {
  return true
}

export function canGenerateProposal(record: SelfImprovementLabRecord): boolean {
  if (_BLOCKING_STATES.includes(record.state)) return false
  return record.state === 'observed' || record.state === 'hypothesis'
}

export function canRunSandbox(record: SelfImprovementLabRecord): boolean {
  if (_BLOCKING_STATES.includes(record.state)) return false
  return record.state === 'proposed' || record.state === 'sandboxed'
}

export function canCompareEvals(record: SelfImprovementLabRecord): boolean {
  return record.state === 'evaluated' || record.state === 'proof_ready'
}

export function canPromote(record: SelfImprovementLabRecord): boolean {
  if (!record.approval_gate) return false
  if (record.approval_gate.approval_status !== 'approved_for_promotion') return false
  if (_BLOCKING_STATES.includes(record.state)) return false
  if (record.approval_gate.auto_approved) return false
  return true
}

export function isIdentitySensitiveProposal(record: SelfImprovementLabRecord): boolean {
  return _IDENTITY_SENSITIVE_RISK.includes(record.risk_level)
}

export function isRuntimeSensitiveProposal(record: SelfImprovementLabRecord): boolean {
  return _RUNTIME_SENSITIVE_RISK.includes(record.risk_level)
}

export function hasRequiredProof(record: SelfImprovementLabRecord): boolean {
  if (!record.approval_gate) return false
  return record.approval_gate.has_proof_pack
}

export function blocksAutoMerge(_record: SelfImprovementLabRecord): true {
  return true
}

export function blocksSelfDeploy(_record: SelfImprovementLabRecord): true {
  return true
}

export function buildSelfImprovementSummary(records: SelfImprovementLabRecord[]): SelfImprovementSummary {
  return {
    total: records.length,
    observed: records.filter((r) => r.state === 'observed').length,
    proposed: records.filter((r) => r.state === 'proposed').length,
    approved: records.filter((r) => r.approval_gate?.approval_status === 'approved_for_promotion').length,
    rejected: records.filter((r) => r.state === 'rejected' || r.approval_gate?.approval_status === 'rejected').length,
    blocked: records.filter((r) => r.state === 'blocked').length,
    identity_sensitive: records.filter((r) => isIdentitySensitiveProposal(r)).length,
    runtime_sensitive: records.filter((r) => isRuntimeSensitiveProposal(r)).length,
    auto_merge_blocked: true,
    self_deploy_blocked: true,
    confidence_alone_approves: false,
  }
}

// ── D4 Known Limits ─────────────────────────────────────────────────────────────
export const D4_SELF_IMPROVEMENT_KNOWN_LIMITS: string[] = [
  'no-active-lab-by-default: VITE_TITANE_D4_SELF_IMPROVEMENT_LAB flag=false until T4 activation',
  'no-auto-merge: apply stage is permanently blocked in scaffold',
  'no-self-deploy: deployment is never triggered by lab proposals',
  'confidence-not-approval: confidence or eval improvement alone cannot approve promotion',
  'identity-sensitive-requires-twin-consent: identity_sensitive proposals must reference Twin Consent Ledger D3',
  'runtime-sensitive-requires-flag-and-rollback: runtime_sensitive proposals require feature flag + rollback doc',
]

// ── D4 Lab Contract Metadata ────────────────────────────────────────────────────
export const D4_SELF_IMPROVEMENT_LAB_CONTRACT = {
  schema: 'D4_SELF_IMPROVEMENT_LAB_CONTRACT_V15',
  active: false,
  approval_required: true as const,
  auto_merge_blocked: true as const,
  self_deploy_blocked: true as const,
  policy: 'self-improvement-proposes; it-does-not-self-authorize',
  known_limits: D4_SELF_IMPROVEMENT_KNOWN_LIMITS,
  improvement_states: 12,
  promotion_statuses: 5,
  risk_levels: 7,
} as const
