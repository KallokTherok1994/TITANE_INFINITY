/**
 * TITANE∞ — OMEGA Real Handler Upgrade Contract
 * Lock D1 — T3 (CRITICAL — prod pipeline — flag-gated)
 *
 * Governs the invariants and upgrade path for the OMEGA v2 production handler
 * (conversation_engine::commands::conversation_generate).
 *
 * D1 identifies 3 structural gaps in the current OMEGA handler and defines
 * the contract that the upgraded handler must satisfy:
 *
 * Gap D1-G1: No structured response quality validation before emit
 * Gap D1-G2: No latency budget enforcement at handler boundary
 * Gap D1-G3: Provider fallback transparency — caller cannot inspect why fallback occurred
 *
 * Feature Flag: TITANE_D1_OMEGA_REAL_HANDLER (default=false)
 * When flag=false: original handler behavior is unchanged (SAFE)
 * When flag=true: D1 upgrade invariants are enforced at handler boundary
 */

import { z } from 'zod'

// ── Feature Flag ────────────────────────────────────────────────────────────────
export const OMEGA_D1_HANDLER_FLAG =
  typeof import.meta !== 'undefined' &&
  (import.meta as Record<string, unknown>).env !== undefined
    ? String((import.meta as Record<string, Record<string, unknown>>).env['VITE_TITANE_D1_OMEGA_REAL_HANDLER'] ?? 'false') === 'true'
    : false

// ── D1 Gap Registry ─────────────────────────────────────────────────────────────
export const D1GapIdSchema = z.enum(['D1-G1', 'D1-G2', 'D1-G3'])
export type D1GapId = z.infer<typeof D1GapIdSchema>

export const D1GapSchema = z.object({
  gap_id: D1GapIdSchema,
  description: z.string(),
  severity: z.enum(['critical', 'high', 'medium']),
  status: z.enum(['identified', 'in_progress', 'fixed']),
})
export type D1Gap = z.infer<typeof D1GapSchema>

export const D1_GAPS: D1Gap[] = [
  {
    gap_id: 'D1-G1',
    description: 'No structured response quality validation before OMEGA handler emits response',
    severity: 'high',
    status: 'identified',
  },
  {
    gap_id: 'D1-G2',
    description: 'No latency budget enforcement at OMEGA handler boundary — handler can block indefinitely',
    severity: 'critical',
    status: 'identified',
  },
  {
    gap_id: 'D1-G3',
    description: 'Provider fallback transparency missing — caller cannot inspect why fallback occurred (Ollama → Gemini etc.)',
    severity: 'high',
    status: 'identified',
  },
]

// ── OMEGA Handler Upgrade Invariants ────────────────────────────────────────────
export const OmegaHandlerInvariantSchema = z.object({
  invariant_id: z.string(),
  description: z.string(),
  addresses_gap: D1GapIdSchema,
  enforceable_in_tests: z.boolean(),
  enforcement_note: z.string(),
})
export type OmegaHandlerInvariant = z.infer<typeof OmegaHandlerInvariantSchema>

export const D1_INVARIANTS: OmegaHandlerInvariant[] = [
  {
    invariant_id: 'D1-I1',
    description: 'OMEGA handler response must have non-empty content or explicit error — never silent empty',
    addresses_gap: 'D1-G1',
    enforceable_in_tests: true,
    enforcement_note: 'Test: empty response fails validation',
  },
  {
    invariant_id: 'D1-I2',
    description: 'OMEGA handler must complete within D1 latency budget (default: 90s hard cap)',
    addresses_gap: 'D1-G2',
    enforceable_in_tests: true,
    enforcement_note: 'Test: timeout budget is defined and > 0',
  },
  {
    invariant_id: 'D1-I3',
    description: 'OMEGA handler response metadata must include provider_used field (non-empty string)',
    addresses_gap: 'D1-G3',
    enforceable_in_tests: true,
    enforcement_note: 'Test: provider_used must be present in CommandResult metadata',
  },
]

// ── Handler Upgrade Boundary ────────────────────────────────────────────────────
export const OmegaHandlerRequestSchema = z.object({
  request_id: z.string(),
  session_id: z.string(),
  prompt: z.string().min(1),
  model: z.string().nullable(),
  latency_budget_ms: z.number().min(1000).max(180000).describe('Hard latency cap in ms'),
  flag_active: z.boolean(),
})
export type OmegaHandlerRequest = z.infer<typeof OmegaHandlerRequestSchema>

export const OmegaHandlerResponseSchema = z.object({
  request_id: z.string(),
  content: z.string(),
  is_empty: z.boolean(),
  provider_used: z.string().min(1),
  latency_ms: z.number().min(0),
  within_budget: z.boolean(),
  flag_active: z.boolean(),
  invariants_checked: z.array(z.string()),
})
export type OmegaHandlerResponse = z.infer<typeof OmegaHandlerResponseSchema>

// ── Upgrade Boundary Validator (T3 flag-gated) ─────────────────────────────────
export interface HandlerValidationResult {
  passed: boolean
  violations: string[]
}

/**
 * Validate an OMEGA handler response against D1 invariants.
 * When flag=false: validation is SKIP (safe passthrough — original behavior).
 * When flag=true: all 3 D1 invariants are enforced.
 */
export function validateOmegaHandlerResponse(
  response: Omit<OmegaHandlerResponse, 'invariants_checked'>,
  flagActive = OMEGA_D1_HANDLER_FLAG,
): HandlerValidationResult {
  if (!flagActive) {
    return { passed: true, violations: [] }
  }

  const violations: string[] = []

  // D1-I1: non-empty content
  if (response.is_empty || response.content.trim().length === 0) {
    violations.push('D1-I1: OMEGA response content is empty — invariant violation')
  }

  // D1-I2: within latency budget
  if (!response.within_budget) {
    violations.push(`D1-I2: OMEGA handler exceeded latency budget — latency=${response.latency_ms}ms`)
  }

  // D1-I3: provider_used must be present
  if (!response.provider_used || response.provider_used.trim().length === 0) {
    violations.push('D1-I3: OMEGA response missing provider_used — transparency invariant violation')
  }

  return { passed: violations.length === 0, violations }
}

// ── D1 Contract ─────────────────────────────────────────────────────────────────
export const D1OmegaHandlerContractSchema = z.object({
  lock: z.literal('D1'),
  tier: z.literal('T3'),
  flag_name: z.literal('TITANE_D1_OMEGA_REAL_HANDLER'),
  flag_active: z.boolean(),
  handler_command: z.literal('conversation_generate'),
  latency_budget_hard_cap_ms: z.number(),
  gaps_identified: z.number(),
  invariants_defined: z.number(),
  severity_critical: z.number(),
})
export type D1OmegaHandlerContract = z.infer<typeof D1OmegaHandlerContractSchema>

const LATENCY_HARD_CAP_MS = 90000

export function getD1OmegaHandlerContract(): D1OmegaHandlerContract {
  return {
    lock: 'D1',
    tier: 'T3',
    flag_name: 'TITANE_D1_OMEGA_REAL_HANDLER',
    flag_active: OMEGA_D1_HANDLER_FLAG,
    handler_command: 'conversation_generate',
    latency_budget_hard_cap_ms: LATENCY_HARD_CAP_MS,
    gaps_identified: D1_GAPS.length,
    invariants_defined: D1_INVARIANTS.length,
    severity_critical: D1_GAPS.filter((g) => g.severity === 'critical').length,
  }
}
