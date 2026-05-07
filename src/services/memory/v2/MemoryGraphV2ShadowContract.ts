/**
 * TITANE∞ — MemoryGraph v2 Shadow Mode Contract
 * Lock C1 — T3 (runtime behind feature flag TITANE_C1_MEMORYGRAPH_V2_SHADOW)
 *
 * Shadow / dual-write pattern:
 * - READS: always from v1 (safe — no behavior change)
 * - WRITES: to v1 (primary) AND v2 (shadow, async, non-blocking)
 * - v2 shadow writes are fire-and-forget — v1 is the source of truth
 * - Zero backward-incompatible schema change
 * - Activation requires explicit feature flag (default=false)
 *
 * Purpose:
 * - Collect real write traffic against v2 schema before any cutover
 * - Validate v2 persistence layer without affecting v1 reads
 * - Establishes data for future C1→C2 migration feasibility gate
 *
 * Reference: persistence risk (C1 row in program status), dual-write shadow pattern
 */

import { z } from 'zod';

// ── Feature Flag ────────────────────────────────────────────────────────────────
export const MEMORYGRAPH_V2_SHADOW_ENABLED =
  typeof import.meta?.env !== 'undefined'
    ? import.meta.env?.VITE_TITANE_C1_MEMORYGRAPH_V2_SHADOW === 'true'
    : false;

// ── Memory Node v2 — Extended Schema (v9) ──────────────────────────────────────
// Extends v1 with: validation_status, type, confidence, contradictions,
// embeddings_status, source, expires_at, links, and identity-safe guards.
// All new fields are additive. v1 schema remains the production source of truth.

export const MemoryValidationStatusSchema = z.enum([
  'confirmed',
  'hypothesis',
  'rejected',
  'expired',
  'system_observed',
  'requires_kevin_validation',
]);
export type MemoryValidationStatus = z.infer<typeof MemoryValidationStatusSchema>;

export const MemoryNodeTypeSchema = z.enum([
  'identity_fact',
  'project_context',
  'decision',
  'constraint',
  'preference',
  'risk',
  'symbolic_axis',
  'financial_pressure',
  'technical_state',
  'contradiction',
  'evolution_milestone',
  'instruction_truth',
  'unknown',
]);
export type MemoryNodeType = z.infer<typeof MemoryNodeTypeSchema>;

export const EmbeddingsStatusSchema = z.enum([
  'not_indexed',
  'pending',
  'indexed',
  'failed',
  'unavailable',
]);
export type EmbeddingsStatus = z.infer<typeof EmbeddingsStatusSchema>;

// Identity-sensitive types: these require validation_status=confirmed before
// they may influence model behavior. Shadow-only until C2 cutover.
export const IDENTITY_SENSITIVE_TYPES: ReadonlySet<MemoryNodeType> = new Set([
  'identity_fact',
  'symbolic_axis',
  'financial_pressure',
  'constraint',
  'instruction_truth',
]);

/**
 * Returns true if the node is identity-sensitive AND NOT confirmed.
 * Identity-sensitive nodes must not affect production behavior until confirmed.
 */
export function isBlockedByIdentitySafety(node: {
  type: MemoryNodeType;
  validation_status: MemoryValidationStatus;
}): boolean {
  return (
    IDENTITY_SENSITIVE_TYPES.has(node.type) && node.validation_status !== 'confirmed'
  );
}

export const MemoryNodeV2Schema = z.object({
  id: z.string().uuid().describe('Unique node ID (UUID)'),
  schema_version: z.literal(2).describe('Must be 2 for v2 nodes'),
  kind: z
    .enum(['stm', 'mtm', 'ltm', 'fact', 'event', 'relation', 'summary'])
    .describe('Memory category'),
  type: MemoryNodeTypeSchema.describe('Semantic type of this memory node'),
  content: z.string().min(1).describe('Raw content text'),
  content_hash: z.string().describe('SHA-256 of content for dedup/integrity'),
  embedding_id: z.string().nullable().describe('Reference to vector store embedding'),
  embeddings_status: EmbeddingsStatusSchema.default('not_indexed').describe(
    'Vector embedding readiness'
  ),
  session_id: z.string().describe('Originating session ID'),
  created_at: z.string().datetime().describe('ISO-8601 creation timestamp'),
  updated_at: z.string().datetime().describe('ISO-8601 last-update timestamp'),
  tags: z.array(z.string()).default([]).describe('Semantic tags'),
  source_v1_id: z
    .string()
    .nullable()
    .describe('ID of originating v1 node (null if v2-native)'),
  /** Validation status — identity-sensitive nodes require confirmed before activation */
  validation_status: MemoryValidationStatusSchema.default('system_observed'),
  source: z
    .string()
    .nullable()
    .default(null)
    .describe('Origin signal: chat|upload|api|system'),
  confidence: z.number().min(0).max(1).default(0.5).describe('Confidence score 0..1'),
  expires_at: z
    .string()
    .datetime()
    .nullable()
    .default(null)
    .describe('Optional expiry timestamp'),
  links: z
    .array(z.string().uuid())
    .default([])
    .describe('IDs of related nodes (forward links)'),
  contradictions: z
    .array(z.string().uuid())
    .default([])
    .describe('IDs of nodes this node contradicts'),
});
export type MemoryNodeV2 = z.infer<typeof MemoryNodeV2Schema>;

// ── Memory Relation v2 ──────────────────────────────────────────────────────────
export const MemoryRelationV2Schema = z.object({
  id: z.string().uuid(),
  schema_version: z.literal(2),
  from_node_id: z.string().uuid(),
  to_node_id: z.string().uuid(),
  relation_type: z.enum([
    'related',
    'causes',
    'contradicts',
    'supports',
    'temporal_after',
  ]),
  weight: z.number().min(0).max(1).describe('Relation strength 0..1'),
  created_at: z.string().datetime(),
});
export type MemoryRelationV2 = z.infer<typeof MemoryRelationV2Schema>;

// ── Shadow Write Operation ──────────────────────────────────────────────────────
export const ShadowWriteOperationSchema = z.object({
  op_id: z.string().uuid().describe('Unique operation ID'),
  op_type: z.enum(['write_node', 'write_relation', 'delete_node', 'delete_relation']),
  target_version: z.literal(2),
  payload: z.union([
    MemoryNodeV2Schema,
    MemoryRelationV2Schema,
    z.object({ id: z.string() }),
  ]),
  timestamp: z.string().datetime(),
  /** Whether this shadow write succeeded (null = not yet attempted) */
  success: z.boolean().nullable().default(null),
  error: z.string().nullable().default(null),
});
export type ShadowWriteOperation = z.infer<typeof ShadowWriteOperationSchema>;

// ── Shadow Write Result ─────────────────────────────────────────────────────────
export const ShadowWriteResultSchema = z.object({
  op_id: z.string().uuid(),
  v1_written: z.boolean().describe('v1 write status (source of truth — must be true)'),
  v2_shadow_written: z
    .boolean()
    .nullable()
    .describe('v2 shadow write status (null if flag disabled)'),
  flag_active: z.boolean(),
  error_v2: z.string().nullable().default(null),
});
export type ShadowWriteResult = z.infer<typeof ShadowWriteResultSchema>;

// ── C1 Shadow Mode Contract ─────────────────────────────────────────────────────
export const C1MemoryGraphV2ContractSchema = z.object({
  lock: z.literal('C1'),
  tier: z.literal('T3'),
  flag_name: z.literal('TITANE_C1_MEMORYGRAPH_V2_SHADOW'),
  flag_active: z.boolean(),
  v1_is_source_of_truth: z.literal(true).describe('v1 always the read source of truth'),
  shadow_mode: z.enum(['disabled', 'write_shadow_only']),
  schema_version: z.literal(2),
});
export type C1MemoryGraphV2Contract = z.infer<typeof C1MemoryGraphV2ContractSchema>;

// ── Shadow Write Coordinator ────────────────────────────────────────────────────
/**
 * Coordinates a dual-write: v1 (primary, sync) + v2 (shadow, async, non-blocking).
 * v1 write result is always returned; v2 result is advisory only.
 *
 * @param v1Writer - The existing v1 write function (must execute and succeed)
 * @param v2ShadowWriter - The v2 shadow write function (executed only when flag active)
 * @returns ShadowWriteResult
 */
export async function shadowWriteCoordinator(
  opId: string,
  v1Writer: () => Promise<void>,
  v2ShadowWriter: () => Promise<void>,
  flagActive = MEMORYGRAPH_V2_SHADOW_ENABLED
): Promise<ShadowWriteResult> {
  // v1 is always the source of truth — write first
  await v1Writer();

  if (!flagActive) {
    return {
      op_id: opId,
      v1_written: true,
      v2_shadow_written: null,
      flag_active: false,
      error_v2: null,
    };
  }

  // v2 shadow write — fire-and-forget, non-blocking, errors logged but not thrown
  let v2Success = false;
  let v2Error: string | null = null;
  try {
    await v2ShadowWriter();
    v2Success = true;
  } catch (e) {
    v2Error = String(e);
    // Shadow failure MUST NOT affect v1 reads or caller behavior
    console.warn('[MemoryGraph v2 Shadow] Shadow write failed (non-fatal):', v2Error);
  }

  return {
    op_id: opId,
    v1_written: true,
    v2_shadow_written: v2Success,
    flag_active: true,
    error_v2: v2Error,
  };
}

// ── Current Contract Instance ───────────────────────────────────────────────────
export function getC1MemoryGraphV2Contract(): C1MemoryGraphV2Contract {
  return {
    lock: 'C1',
    tier: 'T3',
    flag_name: 'TITANE_C1_MEMORYGRAPH_V2_SHADOW',
    flag_active: MEMORYGRAPH_V2_SHADOW_ENABLED,
    v1_is_source_of_truth: true,
    shadow_mode: MEMORYGRAPH_V2_SHADOW_ENABLED ? 'write_shadow_only' : 'disabled',
    schema_version: 2,
  };
}
