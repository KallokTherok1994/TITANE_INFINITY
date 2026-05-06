/**
 * TITANE∞ — INTELLIGENCE OBSERVABILITY CONTRACT
 *
 * Lock B2 — Intelligence Observability Contract (Advanced Intelligence Program v6)
 * Tier: T2 bounded — contract/scaffold only, zero behavior activation
 *
 * Purpose:
 *   Defines the canonical eval-harness trace schema for TITANE's intelligence pipeline.
 *   Extends the existing OmegaTraceMetaSchema with session-level, token-level,
 *   latency, and feedback fields required by the eval champion system (Locks B0+).
 *
 * Feature Flag:
 *   TITANE_INTELLIGENCE_OBSERVABILITY_ENABLED must be true before any data flows
 *   through this contract at runtime. Default: false (scaffold only).
 *
 * Authority: S004 LangSmith (llm_observability) trace field conventions
 *            docs/reports/COGNITIVE_CORE_TRUTH_MATRIX.md — Drift CD-05
 *
 * @module IntelligenceObservabilityContract
 * @version 1.0.0-scaffold
 * @created 2026-05-06
 */

import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════════════════
// FEATURE FLAG — T2 guard: nothing activates without explicit opt-in
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Feature flag for Intelligence Observability Contract activation.
 * Reads from import.meta.env or falls back to false (scaffold-only mode).
 *
 * Set VITE_TITANE_INTELLIGENCE_OBSERVABILITY_ENABLED=true in .env.local
 * to activate trace collection at runtime.
 *
 * Rule: No data flows through this contract if this flag is false.
 */
export const INTELLIGENCE_OBSERVABILITY_ENABLED =
  typeof import.meta !== 'undefined' &&
  import.meta.env?.VITE_TITANE_INTELLIGENCE_OBSERVABILITY_ENABLED === 'true';

// ═══════════════════════════════════════════════════════════════════════════
// EVAL HARNESS TRACE SCHEMA — extends OmegaTraceMeta for champion eval system
// Reference: S004 LangSmith trace fields
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Session-level identity for a trace entry.
 * Groups all turns in a single conversation session.
 */
export const TraceSessionSchema = z.object({
  session_id: z.string().min(1).describe('Unique conversation session identifier'),
  turn_index: z
    .number()
    .int()
    .min(0)
    .describe('0-based turn number within the session'),
  recorded_at: z.string().datetime().describe('ISO-8601 timestamp of trace capture'),
});

/**
 * Model dispatch truth for a single inference call.
 * Records which model was actually used (not claimed).
 */
export const ModelDispatchTruthSchema = z.object({
  model: z
    .string()
    .min(1)
    .describe('Actual model ID used for this inference (e.g. gemma2:2b)'),
  provider: z
    .string()
    .min(1)
    .describe('Actual provider used (e.g. ollama, openai, anthropic)'),
  was_fallback: z
    .boolean()
    .describe('True if a fallback provider/model was used instead of the primary'),
  fallback_reason: z
    .string()
    .optional()
    .describe('Reason code if was_fallback=true (maps to ReasonCodeSchema)'),
});

/**
 * Prompt truth: hashed representation for reproducibility without exposing PII.
 */
export const PromptTruthSchema = z.object({
  prompt_hash: z
    .string()
    .min(8)
    .describe('SHA-256 hex prefix of the assembled prompt (first 16 chars minimum)'),
  system_prompt_hash: z
    .string()
    .min(8)
    .optional()
    .describe('Hash of the system prompt component (if separable)'),
  instruction_layers_applied: z
    .array(z.string())
    .describe('List of instruction layer IDs applied (e.g. ["L1","L3","L4"])'),
});

/**
 * Token and latency budget for cost and performance tracking.
 */
export const TokenBudgetSchema = z.object({
  prompt_tokens: z.number().int().min(0).optional(),
  completion_tokens: z.number().int().min(0).optional(),
  total_tokens: z.number().int().min(0).optional(),
  latency_ms: z.number().min(0).describe('End-to-end response latency in milliseconds'),
  ttfb_ms: z
    .number()
    .min(0)
    .optional()
    .describe('Time-to-first-byte if streaming is active'),
});

/**
 * Human or automated eval feedback for a traced response.
 * Used to update champion scores in eval harness.
 */
export const EvalFeedbackSchema = z.object({
  feedback_source: z.enum(['human', 'automated', 'llm_judge']),
  score: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .describe('Normalized quality score 0.0–1.0'),
  labels: z
    .array(z.string())
    .optional()
    .describe('Categorical labels: factual, hallucinated, refused, truncated, etc.'),
  scorecard_ids: z
    .array(z.string())
    .optional()
    .describe('Scorecard IDs this feedback applies to'),
  annotator_id: z
    .string()
    .optional()
    .describe('Evaluator identifier (anonymized if human)'),
});

// ═══════════════════════════════════════════════════════════════════════════
// FULL INTELLIGENCE TRACE ENVELOPE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Canonical Intelligence Observability Trace.
 *
 * This is the full trace record that the eval harness consumes to update
 * eval champion scores. All fields except session and model are optional
 * to allow partial trace collection when not all signals are available.
 *
 * Feature flag: INTELLIGENCE_OBSERVABILITY_ENABLED must be true before
 * this schema is used at runtime.
 */
export const IntelligenceTraceSchema = z.object({
  /** Session identity */
  session: TraceSessionSchema,

  /** Actual model and provider used */
  model_dispatch: ModelDispatchTruthSchema,

  /** Prompt content representation (hashed, PII-safe) */
  prompt_truth: PromptTruthSchema.optional(),

  /** Token and latency budget */
  token_budget: TokenBudgetSchema.optional(),

  /** Eval feedback (human or automated) */
  feedback: EvalFeedbackSchema.optional(),

  /** Raw omega_trace_meta from IPC response (when available) */
  omega_trace_meta: z
    .record(z.string(), z.unknown())
    .optional()
    .describe('Raw OmegaTraceMeta from IPC — pass-through for eval harness indexing'),
});

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION FUNCTIONS — feature-flag gated
// ═══════════════════════════════════════════════════════════════════════════

/** Result type for contract validation */
export type TraceValidationResult =
  | { ok: true; data: IntelligenceTrace }
  | { ok: false; errors: string[]; feature_flag_blocked?: boolean };

/**
 * Validate an IntelligenceTrace at the observability boundary.
 *
 * Returns BLOCKED if INTELLIGENCE_OBSERVABILITY_ENABLED is false —
 * this prevents accidental data collection before the feature is activated.
 */
export function validateIntelligenceTrace(raw: unknown): TraceValidationResult {
  if (!INTELLIGENCE_OBSERVABILITY_ENABLED) {
    return {
      ok: false,
      errors: ['INTELLIGENCE_OBSERVABILITY_ENABLED=false — scaffold mode, no data flows'],
      feature_flag_blocked: true,
    };
  }

  try {
    const result = IntelligenceTraceSchema.safeParse(raw);
    if (result.success) {
      return { ok: true, data: result.data };
    }
    const errors = result.error.issues.map(
      issue => `${issue.path.join('.')}: ${issue.message}`
    );
    return { ok: false, errors };
  } catch (e) {
    return { ok: false, errors: [`schema_eval_error: ${String(e)}`] };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTED TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type IntelligenceTrace = z.infer<typeof IntelligenceTraceSchema>;
export type TraceSession = z.infer<typeof TraceSessionSchema>;
export type ModelDispatchTruth = z.infer<typeof ModelDispatchTruthSchema>;
export type PromptTruth = z.infer<typeof PromptTruthSchema>;
export type TokenBudget = z.infer<typeof TokenBudgetSchema>;
export type EvalFeedback = z.infer<typeof EvalFeedbackSchema>;
