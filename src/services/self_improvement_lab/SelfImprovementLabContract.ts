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
