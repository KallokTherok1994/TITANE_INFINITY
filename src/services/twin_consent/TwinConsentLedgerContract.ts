/**
 * TITANE∞ — Twin Consent Ledger Contract
 * Lock D3 — T4 Scaffold Only (user data — T4 approval required before activation)
 *
 * The Twin Consent Ledger governs the consent lifecycle for TITANE's "Twin"
 * feature: a persistent personalized intelligence layer that learns from the
 * user's interaction patterns.
 *
 * T4 status: This is a SCAFFOLD ONLY. No user data is processed, stored, or
 * transmitted until explicit T4 approval is granted and the activation flag
 * is set by a governed process.
 *
 * Consent model:
 * - UNINITIATED: user has never seen the twin consent prompt
 * - PENDING: consent prompt shown, awaiting user response
 * - GRANTED: user consented — twin learning may proceed (T4 activation needed)
 * - REVOKED: user revoked consent — all twin data must be purged
 * - EXPIRED: consent granted > 90 days ago, must be re-confirmed
 *
 * Data minimization principles enforced by this contract:
 * - Only interaction patterns (not raw messages) may be stored
 * - Retention limit: 90 days from last interaction
 * - Purge path: ledger must expose a deterministic purge function
 * - Portability: export path must be present in contract
 *
 * Feature Flag: TITANE_D3_TWIN_CONSENT_LEDGER (default=false — T4 scaffold only)
 */

import { z } from 'zod'

// ── T4 Guard ────────────────────────────────────────────────────────────────────
export const TWIN_CONSENT_D3_FLAG =
  typeof import.meta !== 'undefined' &&
  (import.meta as Record<string, unknown>).env !== undefined
    ? String((import.meta as Record<string, Record<string, unknown>>).env['VITE_TITANE_D3_TWIN_CONSENT_LEDGER'] ?? 'false') === 'true'
    : false

// ── Consent States ──────────────────────────────────────────────────────────────
export const ConsentStateSchema = z.enum([
  'uninitiated',
  'pending',
  'granted',
  'revoked',
  'expired',
])
export type ConsentState = z.infer<typeof ConsentStateSchema>

// ── Consent Action ──────────────────────────────────────────────────────────────
export const ConsentActionSchema = z.enum([
  'prompt_shown',
  'user_granted',
  'user_revoked',
  'expiry_triggered',
  'reconfirm_prompted',
  'reconfirm_granted',
  'purge_executed',
])
export type ConsentAction = z.infer<typeof ConsentActionSchema>

// ── Consent Event Schema ────────────────────────────────────────────────────────
export const ConsentEventSchema = z.object({
  event_id: z.string(),
  user_session_hash: z.string().describe('Hash of session id — no raw PII'),
  action: ConsentActionSchema,
  state_before: ConsentStateSchema,
  state_after: ConsentStateSchema,
  timestamp_ms: z.number().min(0),
  flag_active: z.boolean(),
})
export type ConsentEvent = z.infer<typeof ConsentEventSchema>

// ── Consent Ledger Entry ────────────────────────────────────────────────────────
export const ConsentLedgerEntrySchema = z.object({
  user_session_hash: z.string(),
  current_state: ConsentStateSchema,
  last_action: ConsentActionSchema,
  granted_at_ms: z.number().min(0).nullable(),
  expires_at_ms: z.number().min(0).nullable(),
  revoked_at_ms: z.number().min(0).nullable(),
  retention_days: z.number().min(1).max(90),
  history: z.array(ConsentEventSchema),
})
export type ConsentLedgerEntry = z.infer<typeof ConsentLedgerEntrySchema>

// ── Data Minimization Manifest ──────────────────────────────────────────────────
export const DataMinimizationManifestSchema = z.object({
  stores_raw_messages: z.literal(false).describe('MUST be false — raw messages NEVER stored'),
  stores_interaction_patterns: z.boolean(),
  retention_limit_days: z.number().max(90),
  purge_path_defined: z.literal(true),
  export_path_defined: z.literal(true),
  gdpr_compliant_scaffold: z.literal(true),
})
export type DataMinimizationManifest = z.infer<typeof DataMinimizationManifestSchema>

export const D3_DATA_MINIMIZATION_MANIFEST: DataMinimizationManifest = {
  stores_raw_messages: false,
  stores_interaction_patterns: true,
  retention_limit_days: 90,
  purge_path_defined: true,
  export_path_defined: true,
  gdpr_compliant_scaffold: true,
}

// ── Consent State Transitions (valid paths) ─────────────────────────────────────
export const VALID_TRANSITIONS: Record<ConsentState, ConsentState[]> = {
  uninitiated: ['pending'],
  pending: ['granted', 'revoked'],
  granted: ['revoked', 'expired'],
  revoked: ['uninitiated'],
  expired: ['pending', 'revoked'],
}

export function isValidConsentTransition(from: ConsentState, to: ConsentState): boolean {
  return VALID_TRANSITIONS[from].includes(to)
}

// ── Consent Expiry Check ────────────────────────────────────────────────────────
const RETENTION_MS = 90 * 24 * 60 * 60 * 1000 // 90 days

export function isConsentExpired(grantedAtMs: number, nowMs: number): boolean {
  return nowMs - grantedAtMs > RETENTION_MS
}

// ── Ledger Purge (T4 scaffold — no-op until activated) ──────────────────────────
export interface PurgeResult {
  purged: boolean
  reason: string
  entries_removed: number
}

export function executeLedgerPurge(
  entry: ConsentLedgerEntry,
  flagActive = TWIN_CONSENT_D3_FLAG,
): PurgeResult {
  if (!flagActive) {
    return { purged: false, reason: 'TITANE_D3_TWIN_CONSENT_LEDGER flag=false — T4 scaffold only', entries_removed: 0 }
  }
  if (entry.current_state !== 'revoked') {
    return { purged: false, reason: `purge requires state=revoked, got=${entry.current_state}`, entries_removed: 0 }
  }
  // In scaffold: simulate purge (no actual storage)
  return { purged: true, reason: 'scaffold purge executed', entries_removed: entry.history.length }
}

// ── Ledger Export (T4 scaffold — no-op until activated) ─────────────────────────
export interface ExportResult {
  exported: boolean
  reason: string
  data: null
}

export function exportConsentLedger(
  flagActive = TWIN_CONSENT_D3_FLAG,
): ExportResult {
  if (!flagActive) {
    return { exported: false, reason: 'TITANE_D3_TWIN_CONSENT_LEDGER flag=false — T4 scaffold only', data: null }
  }
  // In scaffold: stub export
  return { exported: true, reason: 'scaffold export executed — no live data', data: null }
}

// ── D3 Contract ─────────────────────────────────────────────────────────────────
export const D3TwinConsentLedgerContractSchema = z.object({
  lock: z.literal('D3'),
  tier: z.literal('T4'),
  flag_name: z.literal('TITANE_D3_TWIN_CONSENT_LEDGER'),
  flag_active: z.boolean(),
  consent_states: z.number(),
  consent_actions: z.number(),
  retention_days: z.number(),
  stores_raw_messages: z.literal(false),
  purge_path_defined: z.literal(true),
  export_path_defined: z.literal(true),
  gdpr_compliant_scaffold: z.literal(true),
  t4_approval_required: z.literal(true),
})
export type D3TwinConsentLedgerContract = z.infer<typeof D3TwinConsentLedgerContractSchema>

export function getD3TwinConsentLedgerContract(): D3TwinConsentLedgerContract {
  return {
    lock: 'D3',
    tier: 'T4',
    flag_name: 'TITANE_D3_TWIN_CONSENT_LEDGER',
    flag_active: TWIN_CONSENT_D3_FLAG,
    consent_states: 5,
    consent_actions: 7,
    retention_days: 90,
    stores_raw_messages: false,
    purge_path_defined: true,
    export_path_defined: true,
    gdpr_compliant_scaffold: true,
    t4_approval_required: true,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// D3 v13 SIDECAR — Identity Observation Ledger
// "Twin remains a mirror, not an authority. Confidence is not consent."
// ─────────────────────────────────────────────────────────────────────────────

// ── D3 Emission Flag ──────────────────────────────────────────────────────────
export const D3_IDENTITY_OBSERVATION_EMISSION_ACTIVE: boolean =
  typeof import.meta !== 'undefined' &&
  (import.meta as Record<string, unknown>).env !== undefined
    ? String((import.meta as Record<string, Record<string, unknown>>).env['VITE_TITANE_D3_IDENTITY_OBSERVATION_ACTIVE'] ?? 'false') === 'true'
    : false

// ── Observation Type ──────────────────────────────────────────────────────────
export const TwinObservationTypeSchema = z.enum([
  'identity_fact',
  'preference',
  'value',
  'constraint',
  'symbolic_axis',
  'emotional_pattern',
  'project_context',
  'memory_policy',
  'behavioral_instruction',
  'risk_signal',
  'unknown',
])
export type TwinObservationType = z.infer<typeof TwinObservationTypeSchema>

// ── Validation Status ─────────────────────────────────────────────────────────
export const TwinValidationStatusSchema = z.enum([
  'hypothesis',
  'requires_kevin_validation',
  'confirmed',
  'rejected',
  'expired',
  'system_observed',
  'blocked',
  'unknown',
])
export type TwinValidationStatus = z.infer<typeof TwinValidationStatusSchema>

// ── Risk Level ────────────────────────────────────────────────────────────────
export const TwinConsentRiskLevelSchema = z.enum([
  'low',
  'medium',
  'high',
  'identity_sensitive',
  'restricted',
])
export type TwinConsentRiskLevel = z.infer<typeof TwinConsentRiskLevelSchema>

// ── Identity Observation Entry ────────────────────────────────────────────────
export const TwinIdentityObservationEntrySchema = z.object({
  observation_id: z.string(),
  subject_id: z.string(),
  observation_type: TwinObservationTypeSchema,
  content: z.string(),
  source: z.string(),
  source_ref: z.string().optional(),
  confidence: z.number().min(0).max(1),
  auto_detected: z.boolean(),
  requires_validation: z.boolean(),
  validation_status: TwinValidationStatusSchema,
  validated_by: z.string().nullable(),
  validated_at: z.string().nullable(),
  can_affect_behavior: z.boolean(),
  can_affect_memory: z.boolean(),
  can_affect_identity: z.boolean(),
  expires_at: z.string().nullable(),
  rejected_reason: z.string().nullable(),
  risk_level: TwinConsentRiskLevelSchema,
  linked_memory_node_ids: z.array(z.string()),
  notes: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
})
export type TwinIdentityObservationEntry = z.infer<typeof TwinIdentityObservationEntrySchema>

// ── Consent Summary ───────────────────────────────────────────────────────────
export interface TwinConsentSummary {
  total: number
  confirmed: number
  rejected: number
  pending: number
  blocked: number
  identity_active: number
  confidence_not_consent_enforced: true
}

// ── Policy Helpers ────────────────────────────────────────────────────────────
// RULE: confidence alone NEVER grants consent or activation

/** Identity-sensitive types that always require Kevin validation */
const IDENTITY_SENSITIVE_TYPES: TwinObservationType[] = [
  'identity_fact', 'symbolic_axis', 'behavioral_instruction', 'emotional_pattern', 'value',
]

/** Statuses that block all behavioral / memory / identity effect */
const BLOCKING_STATUSES: TwinValidationStatus[] = [
  'rejected', 'expired', 'blocked', 'unknown',
]

export function isIdentitySensitive(entry: TwinIdentityObservationEntry): boolean {
  return IDENTITY_SENSITIVE_TYPES.includes(entry.observation_type) ||
    entry.risk_level === 'identity_sensitive' ||
    entry.risk_level === 'restricted'
}

export function requiresKevinValidation(entry: TwinIdentityObservationEntry): boolean {
  return isIdentitySensitive(entry) ||
    entry.requires_validation === true ||
    entry.validation_status === 'requires_kevin_validation'
}

export function isExpiredObservation(entry: TwinIdentityObservationEntry): boolean {
  if (!entry.expires_at) return false
  return new Date(entry.expires_at).getTime() < Date.now()
}

export function isRejectedOrBlocked(entry: TwinIdentityObservationEntry): boolean {
  return BLOCKING_STATUSES.includes(entry.validation_status)
}

/** canAffectBehavior: false for rejected/expired/blocked/unknown/requires_kevin_validation */
export function canAffectBehavior(entry: TwinIdentityObservationEntry): boolean {
  if (isRejectedOrBlocked(entry)) return false
  if (isExpiredObservation(entry)) return false
  if (entry.validation_status === 'requires_kevin_validation') return false
  // confidence alone is never sufficient — requires confirmed status
  if (entry.validation_status !== 'confirmed') return false
  return entry.can_affect_behavior
}

/** canAffectMemory: requires confirmed validation status */
export function canAffectMemory(entry: TwinIdentityObservationEntry): boolean {
  if (isRejectedOrBlocked(entry)) return false
  if (isExpiredObservation(entry)) return false
  if (entry.validation_status !== 'confirmed') return false
  return entry.can_affect_memory
}

/** canAffectIdentity: strictest gate — requires confirmed + non-restricted risk */
export function canAffectIdentity(entry: TwinIdentityObservationEntry): boolean {
  if (isRejectedOrBlocked(entry)) return false
  if (isExpiredObservation(entry)) return false
  if (entry.validation_status !== 'confirmed') return false
  if (entry.risk_level === 'restricted') return false
  return entry.can_affect_identity
}

/** Normalize auto-detected identity-sensitive entry: force requires_validation=true */
export function normalizeAutoDetectedObservation(
  entry: TwinIdentityObservationEntry,
): TwinIdentityObservationEntry {
  if (entry.auto_detected && isIdentitySensitive(entry)) {
    return {
      ...entry,
      requires_validation: true,
      validation_status: entry.validation_status === 'confirmed' ? 'confirmed' : 'requires_kevin_validation',
      can_affect_identity: false,
      can_affect_behavior: false,
    }
  }
  return entry
}

export function buildTwinConsentSummary(entries: TwinIdentityObservationEntry[]): TwinConsentSummary {
  let confirmed = 0, rejected = 0, pending = 0, blocked = 0, identity_active = 0
  for (const e of entries) {
    if (e.validation_status === 'confirmed') confirmed++
    else if (e.validation_status === 'rejected') rejected++
    else if (e.validation_status === 'blocked') blocked++
    else pending++
    if (canAffectIdentity(e)) identity_active++
  }
  return { total: entries.length, confirmed, rejected, pending, blocked, identity_active, confidence_not_consent_enforced: true }
}

// ── D3 Known Limits ───────────────────────────────────────────────────────────
export const D3_IDENTITY_OBSERVATION_KNOWN_LIMITS: string[] = [
  'no-active-observation-by-default',
  'no-rust-identity-wiring',
  'symbolic-axis-always-hypothesis-unless-confirmed',
  'confidence-not-consent-enforced',
  'emotional-pattern-blocked-until-kevin-validation',
]

// ── D3 Twin Observation Contract ──────────────────────────────────────────────
export const D3_TWIN_IDENTITY_OBSERVATION_CONTRACT = {
  schema: 'D3_TWIN_IDENTITY_OBSERVATION_CONTRACT_V1',
  active: D3_IDENTITY_OBSERVATION_EMISSION_ACTIVE,
  policy: 'confidence-not-consent; validation-required-before-identity-activation',
  known_limits: D3_IDENTITY_OBSERVATION_KNOWN_LIMITS,
  observation_types: 11,
  validation_statuses: 8,
  risk_levels: 5,
  twin_rule: 'Twin remains a mirror, not an authority',
} as const
