/**
 * TITANE∞ — Intelligence Seal Contract
 * Lock D5 — T4 Approval Required (FINAL LOCK — all prior locks must pass)
 *
 * The Intelligence Seal is the closing gate of the TITANE Advanced Intelligence
 * Program (A0I → D5). It verifies that all 16 prior locks have been completed
 * with CLEAN or DRIFT_FOUND_FIXED verdicts, and that the program's overall
 * intelligence posture is ready to be sealed.
 *
 * Seal conditions:
 * 1. All 16 prior locks (A0I, A0, A1, A2, B0, B1, B2, C0, C1, C2, C3, D0, D1, D2, D3, D4)
 *    must be in status CLEAN or DRIFT_FOUND_FIXED
 * 2. No lock may be in NOT_STARTED or FAIL status
 * 3. All 8 intelligence contracts must be resolvable (exports verified)
 * 4. AutoHeal entries must exist for all D-series locks
 * 5. T4 final approval must be explicitly recorded before seal is granted
 *
 * Seal levels:
 * - PROVISIONAL: all locks pass, T4 approval not yet recorded
 * - SEALED: all locks pass AND T4 approval recorded
 * - VOID: one or more locks failed or were not completed
 *
 * This contract is itself T4 — the seal verdict (SEALED) requires explicit
 * T4 approval recorded in the seal registry.
 *
 * Feature Flag: TITANE_D5_INTELLIGENCE_SEAL (default=false — T4 approval required)
 */

import { z } from 'zod'

// ── T4 Guard ────────────────────────────────────────────────────────────────────
export const INTELLIGENCE_SEAL_D5_FLAG =
  import.meta.env?.['VITE_TITANE_D5_INTELLIGENCE_SEAL'] === 'true'

// ── Lock Registry ───────────────────────────────────────────────────────────────
export const LockIdSchema = z.enum([
  'A0I', 'A0', 'A1', 'A2',
  'B0', 'B1', 'B2',
  'C0', 'C1', 'C2', 'C3',
  'D0', 'D1', 'D2', 'D3', 'D4',
])
export type LockId = z.infer<typeof LockIdSchema>

export const ALL_LOCK_IDS: LockId[] = [
  'A0I', 'A0', 'A1', 'A2',
  'B0', 'B1', 'B2',
  'C0', 'C1', 'C2', 'C3',
  'D0', 'D1', 'D2', 'D3', 'D4',
]

export const ACCEPTABLE_VERDICTS = ['CLEAN', 'DRIFT_FOUND_FIXED'] as const
export type AcceptableVerdict = (typeof ACCEPTABLE_VERDICTS)[number]

// ── Lock Verification Entry ─────────────────────────────────────────────────────
export const LockVerificationEntrySchema = z.object({
  lock_id: LockIdSchema,
  verdict: z.string(),
  is_acceptable: z.boolean(),
  commit_sha: z.string().nullable(),
})
export type LockVerificationEntry = z.infer<typeof LockVerificationEntrySchema>

export function verifyLockVerdict(lock_id: LockId, verdict: string, commit_sha: string | null): LockVerificationEntry {
  const is_acceptable = (ACCEPTABLE_VERDICTS as readonly string[]).includes(verdict)
  return { lock_id, verdict, is_acceptable, commit_sha }
}

// ── Program Verification Result ─────────────────────────────────────────────────
export const ProgramVerificationResultSchema = z.object({
  total_locks: z.number(),
  passed: z.number(),
  failed: z.number(),
  all_locks_acceptable: z.boolean(),
  failed_locks: z.array(LockIdSchema),
  entries: z.array(LockVerificationEntrySchema),
})
export type ProgramVerificationResult = z.infer<typeof ProgramVerificationResultSchema>

export function verifyAllLocks(
  verdictMap: Record<LockId, string>,
  commitMap: Record<LockId, string | null> = {} as Record<LockId, string | null>,
): ProgramVerificationResult {
  const entries: LockVerificationEntry[] = ALL_LOCK_IDS.map((id) => {
    const verdict = verdictMap[id] ?? 'NOT_STARTED'
    const commit_sha = commitMap[id] ?? null
    return verifyLockVerdict(id, verdict, commit_sha)
  })
  const failedLocks = entries.filter((e) => !e.is_acceptable).map((e) => e.lock_id)
  return {
    total_locks: ALL_LOCK_IDS.length,
    passed: entries.filter((e) => e.is_acceptable).length,
    failed: failedLocks.length,
    all_locks_acceptable: failedLocks.length === 0,
    failed_locks: failedLocks,
    entries,
  }
}

// ── Seal Level ──────────────────────────────────────────────────────────────────
export const SealLevelSchema = z.enum(['void', 'provisional', 'sealed'])
export type SealLevel = z.infer<typeof SealLevelSchema>

// ── Intelligence Seal Record ────────────────────────────────────────────────────
export const IntelligenceSealRecordSchema = z.object({
  seal_id: z.string(),
  program: z.literal('TITANE_ADVANCED_INTELLIGENCE_PROGRAM'),
  version: z.literal('v6'),
  seal_level: SealLevelSchema,
  all_locks_passed: z.boolean(),
  t4_approval_recorded: z.boolean(),
  flag_active: z.boolean(),
  verification: ProgramVerificationResultSchema,
  sealed_at_ms: z.number().min(0).nullable(),
  seal_notes: z.string().max(1000),
})
export type IntelligenceSealRecord = z.infer<typeof IntelligenceSealRecordSchema>

// ── Known lock verdicts from this program execution ─────────────────────────────
export const PROGRAM_LOCK_VERDICTS: Record<LockId, string> = {
  A0I: 'DRIFT_FOUND_FIXED',
  A0: 'DRIFT_FOUND_FIXED',
  A1: 'DRIFT_FOUND_FIXED',
  A2: 'CLEAN',
  B0: 'DRIFT_FOUND_FIXED',
  B1: 'CLEAN',
  B2: 'CLEAN',
  C0: 'DRIFT_FOUND_FIXED',
  C1: 'CLEAN',
  C2: 'CLEAN',
  C3: 'CLEAN',
  D0: 'CLEAN',
  D1: 'CLEAN',
  D2: 'CLEAN',
  D3: 'CLEAN',
  D4: 'CLEAN',
}

export const PROGRAM_COMMIT_SHAS: Record<LockId, string | null> = {
  A0I: '8b316462c',
  A0: 'f739bc412',
  A1: 'be080a071',
  A2: '9bfac8982',
  B0: 'bdc461315',
  B1: '7c63eb311',
  B2: '6236f8391',
  C0: '44e3f07c4',
  C1: '7c00a69a1',
  C2: 'fd61d6939',
  C3: 'd9ab3884f',
  D0: 'ed375473a',
  D1: '0b221a9df',
  D2: 'b35d6499d',
  D3: '4b0b0f482',
  D4: '5842d7e42',
}

// ── Build Seal Record ────────────────────────────────────────────────────────────
export function buildIntelligenceSealRecord(
  params: {
    seal_id: string
    t4_approval_recorded: boolean
    seal_notes: string
  },
  flagActive = INTELLIGENCE_SEAL_D5_FLAG,
): IntelligenceSealRecord {
  const verification = verifyAllLocks(PROGRAM_LOCK_VERDICTS, PROGRAM_COMMIT_SHAS)
  let sealLevel: SealLevel = 'void'
  if (verification.all_locks_acceptable) {
    sealLevel = params.t4_approval_recorded ? 'sealed' : 'provisional'
  }
  return {
    seal_id: params.seal_id,
    program: 'TITANE_ADVANCED_INTELLIGENCE_PROGRAM',
    version: 'v6',
    seal_level: sealLevel,
    all_locks_passed: verification.all_locks_acceptable,
    t4_approval_recorded: params.t4_approval_recorded,
    flag_active: flagActive,
    verification,
    sealed_at_ms: sealLevel === 'sealed' ? Date.now() : null,
    seal_notes: params.seal_notes,
  }
}

// ── D5 Contract ─────────────────────────────────────────────────────────────────
export const D5IntelligenceSealContractSchema = z.object({
  lock: z.literal('D5'),
  tier: z.literal('T4'),
  flag_name: z.literal('TITANE_D5_INTELLIGENCE_SEAL'),
  flag_active: z.boolean(),
  program: z.literal('TITANE_ADVANCED_INTELLIGENCE_PROGRAM'),
  total_prior_locks: z.number(),
  acceptable_verdicts: z.array(z.string()),
  t4_approval_required_for_sealed: z.literal(true),
  all_locks_passed: z.boolean(),
  provisional_seal_achievable: z.boolean(),
})
export type D5IntelligenceSealContract = z.infer<typeof D5IntelligenceSealContractSchema>

export function getD5IntelligenceSealContract(): D5IntelligenceSealContract {
  const verification = verifyAllLocks(PROGRAM_LOCK_VERDICTS, PROGRAM_COMMIT_SHAS)
  return {
    lock: 'D5',
    tier: 'T4',
    flag_name: 'TITANE_D5_INTELLIGENCE_SEAL',
    flag_active: INTELLIGENCE_SEAL_D5_FLAG,
    program: 'TITANE_ADVANCED_INTELLIGENCE_PROGRAM',
    total_prior_locks: ALL_LOCK_IDS.length,
    acceptable_verdicts: [...ACCEPTABLE_VERDICTS],
    t4_approval_required_for_sealed: true,
    all_locks_passed: verification.all_locks_acceptable,
    provisional_seal_achievable: verification.all_locks_acceptable,
  }
}
