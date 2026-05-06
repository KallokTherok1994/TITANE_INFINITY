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
