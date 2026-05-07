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
 *
 * ── v13 Sidecar (D1 Real Memory Handler Declaration) ────────────────────────
 * Super Prompt v13: Connect ONE real OMEGA cognitive handler behind a safety
 * gate. Selected handler: Memory (via OmegaMemoryBridge / UnifiedMemory).
 *
 * Feature Flag v13: VITE_TITANE_D1_OMEGA_REAL_MEMORY_HANDLER (default=false)
 * Mode: shadow/passive — OmegaMemoryBridge is called but output is not
 * injected into the main OMEGA response pipeline. DefaultTaskHandler remains
 * the authoritative Memory TaskType handler in production.
 *
 * Rust surface: src-tauri/src/omega/memory_bridge.rs — OmegaMemoryBridge
 * is the registered real memory surface (enrich_context() available).
 *
 * Known limits (D1-UNIT-04, D1-UNIT-08):
 * - Shadow mode only — no injection into OMEGA conversation pipeline
 * - Identity-sensitive operations blocked (requires D2+ identity validation)
 * - MemoryGraph v2 read path NOT activated (UnifiedMemory remains baseline)
 * - Feature flag must be false in production until D2 promotion gate
 */

import { z } from 'zod';

// ── Feature Flag ────────────────────────────────────────────────────────────────
export const OMEGA_D1_HANDLER_FLAG =
  import.meta.env?.['VITE_TITANE_D1_OMEGA_REAL_HANDLER'] === 'true';

// ── D1 Gap Registry ─────────────────────────────────────────────────────────────
export const D1GapIdSchema = z.enum(['D1-G1', 'D1-G2', 'D1-G3']);
export type D1GapId = z.infer<typeof D1GapIdSchema>;

export const D1GapSchema = z.object({
  gap_id: D1GapIdSchema,
  description: z.string(),
  severity: z.enum(['critical', 'high', 'medium']),
  status: z.enum(['identified', 'in_progress', 'fixed']),
});
export type D1Gap = z.infer<typeof D1GapSchema>;

export const D1_GAPS: D1Gap[] = [
  {
    gap_id: 'D1-G1',
    description:
      'No structured response quality validation before OMEGA handler emits response',
    severity: 'high',
    status: 'identified',
  },
  {
    gap_id: 'D1-G2',
    description:
      'No latency budget enforcement at OMEGA handler boundary — handler can block indefinitely',
    severity: 'critical',
    status: 'identified',
  },
  {
    gap_id: 'D1-G3',
    description:
      'Provider fallback transparency missing — caller cannot inspect why fallback occurred (Ollama → Gemini etc.)',
    severity: 'high',
    status: 'identified',
  },
];

// ── OMEGA Handler Upgrade Invariants ────────────────────────────────────────────
export const OmegaHandlerInvariantSchema = z.object({
  invariant_id: z.string(),
  description: z.string(),
  addresses_gap: D1GapIdSchema,
  enforceable_in_tests: z.boolean(),
  enforcement_note: z.string(),
});
export type OmegaHandlerInvariant = z.infer<typeof OmegaHandlerInvariantSchema>;

export const D1_INVARIANTS: OmegaHandlerInvariant[] = [
  {
    invariant_id: 'D1-I1',
    description:
      'OMEGA handler response must have non-empty content or explicit error — never silent empty',
    addresses_gap: 'D1-G1',
    enforceable_in_tests: true,
    enforcement_note: 'Test: empty response fails validation',
  },
  {
    invariant_id: 'D1-I2',
    description:
      'OMEGA handler must complete within D1 latency budget (default: 90s hard cap)',
    addresses_gap: 'D1-G2',
    enforceable_in_tests: true,
    enforcement_note: 'Test: timeout budget is defined and > 0',
  },
  {
    invariant_id: 'D1-I3',
    description:
      'OMEGA handler response metadata must include provider_used field (non-empty string)',
    addresses_gap: 'D1-G3',
    enforceable_in_tests: true,
    enforcement_note: 'Test: provider_used must be present in CommandResult metadata',
  },
];

// ── Handler Upgrade Boundary ────────────────────────────────────────────────────
export const OmegaHandlerRequestSchema = z.object({
  request_id: z.string(),
  session_id: z.string(),
  prompt: z.string().min(1),
  model: z.string().nullable(),
  latency_budget_ms: z.number().min(1000).max(180000).describe('Hard latency cap in ms'),
  flag_active: z.boolean(),
});
export type OmegaHandlerRequest = z.infer<typeof OmegaHandlerRequestSchema>;

export const OmegaHandlerResponseSchema = z.object({
  request_id: z.string(),
  content: z.string(),
  is_empty: z.boolean(),
  provider_used: z.string().min(1),
  latency_ms: z.number().min(0),
  within_budget: z.boolean(),
  flag_active: z.boolean(),
  invariants_checked: z.array(z.string()),
});
export type OmegaHandlerResponse = z.infer<typeof OmegaHandlerResponseSchema>;

// ── Upgrade Boundary Validator (T3 flag-gated) ─────────────────────────────────
export interface HandlerValidationResult {
  passed: boolean;
  violations: string[];
}

/**
 * Validate an OMEGA handler response against D1 invariants.
 * When flag=false: validation is SKIP (safe passthrough — original behavior).
 * When flag=true: all 3 D1 invariants are enforced.
 */
export function validateOmegaHandlerResponse(
  response: Omit<OmegaHandlerResponse, 'invariants_checked'>,
  flagActive = OMEGA_D1_HANDLER_FLAG
): HandlerValidationResult {
  if (!flagActive) {
    return { passed: true, violations: [] };
  }

  const violations: string[] = [];

  // D1-I1: non-empty content
  if (response.is_empty || response.content.trim().length === 0) {
    violations.push('D1-I1: OMEGA response content is empty — invariant violation');
  }

  // D1-I2: within latency budget
  if (!response.within_budget) {
    violations.push(
      `D1-I2: OMEGA handler exceeded latency budget — latency=${response.latency_ms}ms`
    );
  }

  // D1-I3: provider_used must be present
  if (!response.provider_used || response.provider_used.trim().length === 0) {
    violations.push(
      'D1-I3: OMEGA response missing provider_used — transparency invariant violation'
    );
  }

  return { passed: violations.length === 0, violations };
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
});
export type D1OmegaHandlerContract = z.infer<typeof D1OmegaHandlerContractSchema>;

const LATENCY_HARD_CAP_MS = 90000;

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
    severity_critical: D1_GAPS.filter(g => g.severity === 'critical').length,
  };
}

// ── v13 Sidecar — Real Memory Handler Declaration ────────────────────────────

/**
 * Feature flag for the D1 Memory handler shadow mode.
 * Default=false — PROD SAFE. Shadow path only, no pipeline injection.
 */
export const OMEGA_D1_MEMORY_HANDLER_FLAG =
  (import.meta.env?.VITE_TITANE_D1_OMEGA_REAL_MEMORY_HANDLER ?? 'false') === 'true';

/** D1-selected handler identifier */
export const D1_SELECTED_HANDLER = 'Memory' as const;

/** D1 handler modes — in v13, only shadow/passive modes are allowed */
export const OmegaHandlerModeSchema = z.enum(['shadow', 'passive', 'active', 'disabled']);
export type OmegaHandlerMode = z.infer<typeof OmegaHandlerModeSchema>;

/** Default mode for the D1 Memory handler — MUST be shadow */
export const D1_MEMORY_HANDLER_DEFAULT_MODE: OmegaHandlerMode = 'shadow';

/**
 * Known limits for the D1 Memory handler (shadow mode).
 * These must be documented in handler output (D1-UNIT-04).
 */
export const D1_MEMORY_HANDLER_KNOWN_LIMITS: string[] = [
  'shadow-mode-only: output not injected into OMEGA conversation pipeline',
  'identity-sensitive-ops-blocked: D2+ identity validation required',
  'memory-graph-v2-inactive: UnifiedMemory is baseline, MemoryGraph v2 read path not activated',
  'no-persistent-write: shadow reads only, no memory writes from this handler',
  'flag-must-be-false-in-prod: requires D2 promotion gate before activation',
];

/** Memory handler input schema */
export const OmegaMemoryHandlerInputSchema = z.object({
  request_id: z.string(),
  session_id: z.string(),
  context_prompt: z.string().min(1),
  mode: OmegaHandlerModeSchema,
  flag_active: z.boolean(),
  identity_validated: z
    .boolean()
    .describe('True only when D2+ identity validation gate has passed'),
});
export type OmegaMemoryHandlerInput = z.infer<typeof OmegaMemoryHandlerInputSchema>;

/** Memory handler output schema — includes trace + known_limits */
export const OmegaMemoryHandlerOutputSchema = z.object({
  request_id: z.string(),
  handler_type: z.literal('Memory'),
  mode: OmegaHandlerModeSchema,
  memory_available: z.boolean(),
  memory_source: z.enum(['UnifiedMemory', 'MemoryGraphV2', 'None']),
  shadow_used: z
    .boolean()
    .describe('True when shadow mode was invoked (output not injected into pipeline)'),
  validation_status: z.enum(['PASS', 'FAIL', 'SKIP']),
  known_limits: z.array(z.string()).min(1),
  relevant_items_count: z.number().min(0),
  relevance_score: z.number().min(0).max(1),
  identity_safe: z
    .boolean()
    .describe(
      'True only when identity_validated=true or identity-sensitive behavior was blocked'
    ),
  fallback_triggered: z.boolean(),
  fallback_reason: z.string().nullable(),
  latency_ms: z.number().min(0),
});
export type OmegaMemoryHandlerOutput = z.infer<typeof OmegaMemoryHandlerOutputSchema>;

/** D1 Selected Handler adapter contract */
export const D1SelectedHandlerAdapterSchema = z.object({
  adapter_id: z.literal('D1-MEMORY-ADAPTER-v13'),
  selected_handler: z.literal('Memory'),
  feature_flag: z.literal('VITE_TITANE_D1_OMEGA_REAL_MEMORY_HANDLER'),
  mode: OmegaHandlerModeSchema,
  fallback_handler: z.literal('DefaultTaskHandler'),
  known_limits: z.array(z.string()).min(1),
  risk_level: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  memory_graph_v2_active: z.boolean(),
  rust_surface: z.string(),
});
export type D1SelectedHandlerAdapter = z.infer<typeof D1SelectedHandlerAdapterSchema>;

/** Get the canonical D1 Memory adapter declaration */
export function getD1SelectedHandlerAdapter(): D1SelectedHandlerAdapter {
  return {
    adapter_id: 'D1-MEMORY-ADAPTER-v13',
    selected_handler: 'Memory',
    feature_flag: 'VITE_TITANE_D1_OMEGA_REAL_MEMORY_HANDLER',
    mode: D1_MEMORY_HANDLER_DEFAULT_MODE,
    fallback_handler: 'DefaultTaskHandler',
    known_limits: D1_MEMORY_HANDLER_KNOWN_LIMITS,
    risk_level: 'LOW',
    memory_graph_v2_active: false,
    rust_surface:
      'src-tauri/src/omega/memory_bridge.rs::OmegaMemoryBridge::enrich_context',
  };
}

/** Policy: Is the Memory handler flag active in the current environment? */
export function isMemoryHandlerActive(): boolean {
  return OMEGA_D1_MEMORY_HANDLER_FLAG;
}

/** Policy: Can identity-sensitive operations proceed? */
export function isIdentitySafe(input: OmegaMemoryHandlerInput): boolean {
  return input.identity_validated === true;
}

/** Policy: Is MemoryGraph v2 read path blocked (must be true in D1 shadow mode)? */
export function isMemoryGraphV2Blocked(adapter: D1SelectedHandlerAdapter): boolean {
  return adapter.memory_graph_v2_active === false;
}

/** Policy: Validate Memory handler output structure */
export function validateMemoryHandlerOutput(output: OmegaMemoryHandlerOutput): {
  passed: boolean;
  violations: string[];
} {
  const violations: string[] = [];

  if (output.mode === 'active' && !OMEGA_D1_MEMORY_HANDLER_FLAG) {
    violations.push('D1-MH-V1: active mode requires OMEGA_D1_MEMORY_HANDLER_FLAG=true');
  }
  if (!output.shadow_used && output.mode === 'shadow') {
    violations.push('D1-MH-V2: shadow mode must set shadow_used=true');
  }
  if (!output.identity_safe && output.mode !== 'disabled') {
    violations.push('D1-MH-V3: identity_safe must be true unless handler is disabled');
  }
  if (output.known_limits.length === 0) {
    violations.push(
      'D1-MH-V4: known_limits must not be empty — required for transparency'
    );
  }
  if (output.memory_source === 'MemoryGraphV2') {
    violations.push('D1-MH-V5: MemoryGraph v2 read path is forbidden in D1 shadow mode');
  }

  return { passed: violations.length === 0, violations };
}

/**
 * Build a shadow-mode Memory handler output (default factory for tests and
 * scaffolded shadow path).
 */
export function buildShadowMemoryHandlerOutput(
  requestId: string,
  latencyMs: number = 0,
  memoryAvailable: boolean = true
): OmegaMemoryHandlerOutput {
  return {
    request_id: requestId,
    handler_type: 'Memory',
    mode: 'shadow',
    memory_available: memoryAvailable,
    memory_source: 'UnifiedMemory',
    shadow_used: true,
    validation_status: 'PASS',
    known_limits: D1_MEMORY_HANDLER_KNOWN_LIMITS,
    relevant_items_count: 0,
    relevance_score: 0.0,
    identity_safe: true,
    fallback_triggered: false,
    fallback_reason: null,
    latency_ms: latencyMs,
  };
}
