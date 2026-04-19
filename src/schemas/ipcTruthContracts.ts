/**
 * TITANE∞ — P2.1 STRUCTURED OUTPUTS + TRUTH CONTRACTS
 * Canonical Zod schemas for IPC truth-bearing envelopes.
 *
 * These schemas enforce anti-lie monotonicity at the IPC boundary:
 * - ProviderDecisionMeta: provider decision truth
 * - OmegaTraceMeta: classifier trace truth
 * - ConversationResponse envelope: full IPC response truth
 *
 * Authority: Rust serde types in src-tauri/src/conversation_engine/types.rs
 * Mirror: src/types/providerMeta.ts (TypeScript interface mirror)
 */

import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════════
// CANONICAL ENUMS — exact match with Rust ReasonCode + Mode enums
// ═══════════════════════════════════════════════════════════════════

export const ReasonCodeSchema = z.enum([
  'OK',
  'POLICY_LOCAL_ONLY',
  'POLICY_REMOTE_ALLOWED',
  'POLICY_BLOCKED',
  'ALLOWLIST_DENIED',
  'PROVIDER_DOWN',
  'TIMEOUT',
  'RATE_LIMIT',
  'INVALID_CONFIG',
  'NETWORK_ERROR',
  'FALLBACK_OFFLINE',
  'CACHE_HIT',
  'CACHE_MISS',
  'SERIALIZATION_DROPPED',
  'PROVIDER_UNAVAILABLE',
  'TOOL_REQUIRED',
  'TOOL_DENIED',
  'CONTRACT_VIOLATION_CLAMPED',
  'UNKNOWN',
]);

export const ModeSchema = z.enum(['LOCAL', 'REMOTE', 'OFFLINE', 'CACHED', 'ERROR']);

export const ProviderClassSchema = z.enum(['local', 'remote', 'hybrid']);

export const MemoryEffectSchema = z.enum(['New', 'Recall', 'Connect', 'Evolve']);

export const IntentionSchema = z.enum([
  'Question',
  'Action',
  'Emotion',
  'Clarification',
  'Meta',
]);

// ═══════════════════════════════════════════════════════════════════
// PROVIDER DECISION META — canonical truth envelope
// ═══════════════════════════════════════════════════════════════════

export const ProviderAttemptMetaSchema = z.object({
  provider_id: z.string().min(1),
  provider_class: ProviderClassSchema,
  latency_ms: z.number().nonnegative(),
  outcome: z.enum(['success', 'error']),
  reason_code: ReasonCodeSchema,
  network_used_attempt: z.boolean(),
});

export const ProviderDecisionMetaSchema = z.object({
  provider_used: z.string().min(1),
  provider_class: ProviderClassSchema,
  mode: ModeSchema,
  reason_code: ReasonCodeSchema,
  latency_ms_total: z.number().nonnegative(),
  timeout_ms: z.number().nonnegative(),
  retries: z.number().int().nonnegative(),
  attempts: z.array(ProviderAttemptMetaSchema),
  network_used: z.boolean(),
  cache_hit: z.boolean(),
  policy: z.string().min(1),
});

// ═══════════════════════════════════════════════════════════════════
// OMEGA TRACE META — classifier trace truth envelope
// ═══════════════════════════════════════════════════════════════════

export const OmegaTraceMetaSchema = z.object({
  canonical_mode: z.string().min(1),
  profile_id: z.string().min(1),
  effort_level: z.string().min(1),
  model_class: z.string().min(1),
  classifier_confidence: z.number().min(0).max(1),
  classifier_reason_code: z.string().min(1),
  classifier_signals: z.array(z.string()),
  resolved_backend_mode: z.string().min(1),
  provider_used: z.string().min(1),
  fallback_used: z.boolean(),
});

// ═══════════════════════════════════════════════════════════════════
// CONVERSATION METADATA — response metadata truth envelope
// ═══════════════════════════════════════════════════════════════════

export const ConversationMetadataSchema = z.object({
  timestamp: z.number().int().positive(),
  provider_used: z.string().min(1),
  latency_ms: z.number().nonnegative(),
  tokens_used: z.number().int().nonnegative(),
  memory_effect: MemoryEffectSchema,
  links_to_contexts: z.array(z.string()),
});

// ═══════════════════════════════════════════════════════════════════
// CONVERSATION RESPONSE ENVELOPE — full IPC response truth
// ═══════════════════════════════════════════════════════════════════

export const ConversationResponseEnvelopeSchema = z.object({
  assistant_message: z.string().min(1, 'assistant_message must be non-empty'),
  conversation_id: z.string().min(1),
  message_id: z.string().min(1),
  detected_intention: IntentionSchema,
  detected_emotion: z.object({
    valence: z.number().min(-1).max(1),
    intensity: z.number().min(0).max(1),
    energy: z.number().min(0).max(1),
  }),
  cognitive_tags: z.array(z.string()),
  cognitive_summary: z.string(),
  metadata: ConversationMetadataSchema,
  meta: ProviderDecisionMetaSchema.optional(),
  decision: z
    .object({
      online: z.boolean(),
      reasonCode: z.string().min(1),
      providerSelected: z.string().min(1),
      attempts: z.array(ProviderAttemptMetaSchema),
      networkUsed: z.boolean(),
      mode: ModeSchema,
    })
    .optional(),
  omega_trace_meta: OmegaTraceMetaSchema.optional(),
});

// ═══════════════════════════════════════════════════════════════════
// VALIDATOR FUNCTIONS — runtime boundary enforcement
// ═══════════════════════════════════════════════════════════════════

export type ValidationResult =
  | { ok: true; data: z.infer<typeof ConversationResponseEnvelopeSchema> }
  | { ok: false; errors: string[] };

/**
 * Validate a ConversationResponse at the IPC boundary.
 * Returns validated data on success, or error list on failure.
 * This is the anti-lie monotonicity gate: catches schema drift
 * before UI consumption.
 */
export function validateConversationResponse(raw: unknown): ValidationResult {
  const result = ConversationResponseEnvelopeSchema.safeParse(raw);
  if (result.success) {
    return { ok: true, data: result.data };
  }

  const errors = result.error.issues.map(
    issue => `${issue.path.join('.')}: ${issue.message}`
  );
  return { ok: false, errors };
}

/**
 * Validate ProviderDecisionMeta in isolation.
 * Used when meta is extracted from metadata fallback path.
 */
export function validateProviderDecisionMeta(
  raw: unknown
):
  | { ok: true; data: z.infer<typeof ProviderDecisionMetaSchema> }
  | { ok: false; errors: string[] } {
  const result = ProviderDecisionMetaSchema.safeParse(raw);
  if (result.success) {
    return { ok: true, data: result.data };
  }

  const errors = result.error.issues.map(
    issue => `${issue.path.join('.')}: ${issue.message}`
  );
  return { ok: false, errors };
}

/**
 * Validate OmegaTraceMeta in isolation.
 */
export function validateOmegaTraceMeta(
  raw: unknown
):
  | { ok: true; data: z.infer<typeof OmegaTraceMetaSchema> }
  | { ok: false; errors: string[] } {
  const result = OmegaTraceMetaSchema.safeParse(raw);
  if (result.success) {
    return { ok: true, data: result.data };
  }

  const errors = result.error.issues.map(
    issue => `${issue.path.join('.')}: ${issue.message}`
  );
  return { ok: false, errors };
}

// ═══════════════════════════════════════════════════════════════════
// PROMPT BUDGET — anti-explosion guard at IPC boundary
// ═══════════════════════════════════════════════════════════════════

/**
 * Prompt budget configuration — prevents PROMPT_ASSEMBLY_EXPLOSION
 * by enforcing explicit size limits at IPC boundary.
 *
 * Authority: implementation_plan.md — Crash Lock #1
 */
export interface PromptBudgetConfig {
  /** Maximum user message length in characters (~12K tokens) */
  maxUserMessageChars: number;
  /** Maximum total system prompt length in characters (~7.5K tokens) */
  maxSystemPromptChars: number;
  /** Maximum history messages to include */
  maxHistoryMessages: number;
  /** Maximum characters per history message */
  maxHistoryMessageChars: number;
  /** Maximum memory context block size in characters (~1.2K tokens) */
  maxMemoryContextChars: number;
}

/** Default prompt budgets — safe for local+remote providers */
export const DEFAULT_PROMPT_BUDGET: PromptBudgetConfig = {
  maxUserMessageChars: 100_000,
  maxSystemPromptChars: 30_000,
  maxHistoryMessages: 20,
  maxHistoryMessageChars: 300,
  maxMemoryContextChars: 5_000,
};

/** Validation result for prompt budget */
export interface PromptBudgetValidation {
  ok: boolean;
  violations: string[];
  truncatedFields: string[];
  originalSizes: {
    userMessageChars: number;
    systemPromptChars: number;
    totalPayloadChars: number;
  };
}

/**
 * Truncate text to maxChars with ellipsis marker.
 * Returns original text + wasTruncated flag.
 */
export function truncateWithBudget(
  text: string,
  maxChars: number,
  label: string
): { text: string; wasTruncated: boolean } {
  if (text.length <= maxChars) {
    return { text, wasTruncated: false };
  }
  const truncated =
    text.slice(0, maxChars) +
    `\n\n[...TRUNCATED:${label}:${text.length}→${maxChars} chars...]`;
  console.warn(
    `[PROMPT_BUDGET] ⚠️ Truncated ${label}: ${text.length} → ${maxChars} chars`
  );
  return { text: truncated, wasTruncated: true };
}

/**
 * Validate prompt payload against budget limits.
 * Detects oversized user messages and system prompts BEFORE IPC call.
 * This is the PROMPT_ASSEMBLY_EXPLOSION guard.
 */
export function validatePromptBudget(payload: {
  message: string;
  systemPrompt?: string;
  budget?: Partial<PromptBudgetConfig>;
}): PromptBudgetValidation {
  const budget = { ...DEFAULT_PROMPT_BUDGET, ...payload.budget };
  const violations: string[] = [];
  const truncatedFields: string[] = [];

  const userMessageChars = payload.message.length;
  const systemPromptChars = payload.systemPrompt?.length ?? 0;
  const totalPayloadChars = userMessageChars + systemPromptChars;

  if (userMessageChars > budget.maxUserMessageChars) {
    violations.push(
      `user_message exceeds budget: ${userMessageChars} > ${budget.maxUserMessageChars} chars`
    );
    truncatedFields.push('user_message');
  }

  if (systemPromptChars > budget.maxSystemPromptChars) {
    violations.push(
      `system_prompt exceeds budget: ${systemPromptChars} > ${budget.maxSystemPromptChars} chars`
    );
    truncatedFields.push('system_prompt');
  }

  if (violations.length > 0) {
    console.warn(`[PROMPT_BUDGET] ⚠️ Budget violations detected:`, violations);
  }

  return {
    ok: violations.length === 0,
    violations,
    truncatedFields,
    originalSizes: {
      userMessageChars,
      systemPromptChars,
      totalPayloadChars,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════
// TYPE EXPORTS — infer from schemas (canonical source of truth)
// ═══════════════════════════════════════════════════════════════════

export type ValidatedProviderDecisionMeta = z.infer<typeof ProviderDecisionMetaSchema>;
export type ValidatedOmegaTraceMeta = z.infer<typeof OmegaTraceMetaSchema>;
export type ValidatedConversationResponse = z.infer<
  typeof ConversationResponseEnvelopeSchema
>;
export type ValidatedReasonCode = z.infer<typeof ReasonCodeSchema>;
export type ValidatedMode = z.infer<typeof ModeSchema>;
export type ValidatedProviderClass = z.infer<typeof ProviderClassSchema>;
export type ValidatedMemoryEffect = z.infer<typeof MemoryEffectSchema>;
export type ValidatedIntention = z.infer<typeof IntentionSchema>;
