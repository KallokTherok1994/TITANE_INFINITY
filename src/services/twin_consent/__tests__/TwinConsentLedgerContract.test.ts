/**
 * Lock D3 — Twin Consent Ledger Contract
 * Unit tests
 */

import { describe, it, expect } from 'vitest'
import {
  ConsentStateSchema,
  ConsentActionSchema,
  ConsentEventSchema,
  ConsentLedgerEntrySchema,
  DataMinimizationManifestSchema,
  D3_DATA_MINIMIZATION_MANIFEST,
  VALID_TRANSITIONS,
  isValidConsentTransition,
  isConsentExpired,
  executeLedgerPurge,
  exportConsentLedger,
  getD3TwinConsentLedgerContract,
  TWIN_CONSENT_D3_FLAG,
  type ConsentLedgerEntry,
} from '../TwinConsentLedgerContract'

describe('D3 — Twin Consent Ledger Contract', () => {
  // ── Enum Schemas ──────────────────────────────────────────────────────────
  describe('ConsentStateSchema', () => {
    it('accepts all 5 states', () => {
      for (const s of ['uninitiated', 'pending', 'granted', 'revoked', 'expired'] as const) {
        expect(() => ConsentStateSchema.parse(s)).not.toThrow()
      }
    })
    it('rejects unknown state', () => {
      expect(() => ConsentStateSchema.parse('maybe')).toThrow()
    })
  })

  describe('ConsentActionSchema', () => {
    it('accepts all 7 actions', () => {
      const actions = [
        'prompt_shown', 'user_granted', 'user_revoked',
        'expiry_triggered', 'reconfirm_prompted', 'reconfirm_granted', 'purge_executed',
      ] as const
      for (const a of actions) {
        expect(() => ConsentActionSchema.parse(a)).not.toThrow()
      }
    })
    it('rejects unknown action', () => {
      expect(() => ConsentActionSchema.parse('ignore_all')).toThrow()
    })
  })

  // ── ConsentEventSchema ────────────────────────────────────────────────────
  describe('ConsentEventSchema', () => {
    const valid = {
      event_id: 'ev-001',
      user_session_hash: 'abc123',
      action: 'user_granted',
      state_before: 'pending',
      state_after: 'granted',
      timestamp_ms: 1000,
      flag_active: false,
    }
    it('accepts valid event', () => {
      expect(() => ConsentEventSchema.parse(valid)).not.toThrow()
    })
    it('rejects negative timestamp', () => {
      expect(() => ConsentEventSchema.parse({ ...valid, timestamp_ms: -1 })).toThrow()
    })
  })

  // ── ConsentLedgerEntrySchema ──────────────────────────────────────────────
  describe('ConsentLedgerEntrySchema', () => {
    const valid: ConsentLedgerEntry = {
      user_session_hash: 'hash-001',
      current_state: 'granted',
      last_action: 'user_granted',
      granted_at_ms: 1000,
      expires_at_ms: 1000 + 90 * 24 * 60 * 60 * 1000,
      revoked_at_ms: null,
      retention_days: 90,
      history: [],
    }
    it('accepts valid ledger entry', () => {
      expect(() => ConsentLedgerEntrySchema.parse(valid)).not.toThrow()
    })
    it('rejects retention_days > 90', () => {
      expect(() => ConsentLedgerEntrySchema.parse({ ...valid, retention_days: 91 })).toThrow()
    })
    it('rejects retention_days < 1', () => {
      expect(() => ConsentLedgerEntrySchema.parse({ ...valid, retention_days: 0 })).toThrow()
    })
    it('allows null fields', () => {
      expect(() =>
        ConsentLedgerEntrySchema.parse({ ...valid, granted_at_ms: null, expires_at_ms: null })
      ).not.toThrow()
    })
  })

  // ── D3_DATA_MINIMIZATION_MANIFEST ─────────────────────────────────────────
  describe('D3_DATA_MINIMIZATION_MANIFEST', () => {
    it('stores_raw_messages=false (data minimization)', () => {
      expect(D3_DATA_MINIMIZATION_MANIFEST.stores_raw_messages).toBe(false)
    })
    it('retention_limit_days <= 90', () => {
      expect(D3_DATA_MINIMIZATION_MANIFEST.retention_limit_days).toBeLessThanOrEqual(90)
    })
    it('purge_path_defined=true', () => {
      expect(D3_DATA_MINIMIZATION_MANIFEST.purge_path_defined).toBe(true)
    })
    it('export_path_defined=true', () => {
      expect(D3_DATA_MINIMIZATION_MANIFEST.export_path_defined).toBe(true)
    })
    it('gdpr_compliant_scaffold=true', () => {
      expect(D3_DATA_MINIMIZATION_MANIFEST.gdpr_compliant_scaffold).toBe(true)
    })
    it('validates against DataMinimizationManifestSchema', () => {
      expect(() => DataMinimizationManifestSchema.parse(D3_DATA_MINIMIZATION_MANIFEST)).not.toThrow()
    })
  })

  // ── VALID_TRANSITIONS ─────────────────────────────────────────────────────
  describe('VALID_TRANSITIONS', () => {
    it('uninitiated → pending only', () => {
      expect(VALID_TRANSITIONS.uninitiated).toEqual(['pending'])
    })
    it('pending → granted or revoked', () => {
      expect(VALID_TRANSITIONS.pending).toContain('granted')
      expect(VALID_TRANSITIONS.pending).toContain('revoked')
    })
    it('granted → revoked or expired', () => {
      expect(VALID_TRANSITIONS.granted).toContain('revoked')
      expect(VALID_TRANSITIONS.granted).toContain('expired')
    })
    it('revoked → uninitiated (reset path)', () => {
      expect(VALID_TRANSITIONS.revoked).toEqual(['uninitiated'])
    })
    it('expired → pending or revoked (re-consent path)', () => {
      expect(VALID_TRANSITIONS.expired).toContain('pending')
      expect(VALID_TRANSITIONS.expired).toContain('revoked')
    })
  })

  // ── isValidConsentTransition ──────────────────────────────────────────────
  describe('isValidConsentTransition', () => {
    it('uninitiated→pending=true', () => expect(isValidConsentTransition('uninitiated', 'pending')).toBe(true))
    it('uninitiated→granted=false', () => expect(isValidConsentTransition('uninitiated', 'granted')).toBe(false))
    it('pending→granted=true', () => expect(isValidConsentTransition('pending', 'granted')).toBe(true))
    it('pending→revoked=true', () => expect(isValidConsentTransition('pending', 'revoked')).toBe(true))
    it('pending→expired=false', () => expect(isValidConsentTransition('pending', 'expired')).toBe(false))
    it('granted→revoked=true', () => expect(isValidConsentTransition('granted', 'revoked')).toBe(true))
    it('granted→pending=false', () => expect(isValidConsentTransition('granted', 'pending')).toBe(false))
    it('revoked→uninitiated=true', () => expect(isValidConsentTransition('revoked', 'uninitiated')).toBe(true))
    it('revoked→granted=false', () => expect(isValidConsentTransition('revoked', 'granted')).toBe(false))
    it('expired→pending=true', () => expect(isValidConsentTransition('expired', 'pending')).toBe(true))
  })

  // ── isConsentExpired ──────────────────────────────────────────────────────
  describe('isConsentExpired', () => {
    const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000
    it('not expired within 90 days', () => {
      expect(isConsentExpired(1000, 1000 + ninetyDaysMs - 1)).toBe(false)
    })
    it('expired after exactly 90 days', () => {
      expect(isConsentExpired(1000, 1000 + ninetyDaysMs + 1)).toBe(true)
    })
    it('not expired on same timestamp', () => {
      expect(isConsentExpired(1000, 1000)).toBe(false)
    })
  })

  // ── executeLedgerPurge ────────────────────────────────────────────────────
  describe('executeLedgerPurge — flag=false (T4 scaffold)', () => {
    const revokedEntry: ConsentLedgerEntry = {
      user_session_hash: 'h',
      current_state: 'revoked',
      last_action: 'user_revoked',
      granted_at_ms: null,
      expires_at_ms: null,
      revoked_at_ms: 1000,
      retention_days: 90,
      history: [{ event_id: 'e1', user_session_hash: 'h', action: 'user_revoked', state_before: 'granted', state_after: 'revoked', timestamp_ms: 1000, flag_active: false }],
    }
    it('purged=false when flag=false', () => {
      expect(executeLedgerPurge(revokedEntry, false).purged).toBe(false)
    })
    it('reason mentions flag=false', () => {
      expect(executeLedgerPurge(revokedEntry, false).reason).toContain('flag=false')
    })
    it('entries_removed=0 when flag=false', () => {
      expect(executeLedgerPurge(revokedEntry, false).entries_removed).toBe(0)
    })
  })

  describe('executeLedgerPurge — flag=true (T4 active)', () => {
    const revokedEntry: ConsentLedgerEntry = {
      user_session_hash: 'h',
      current_state: 'revoked',
      last_action: 'user_revoked',
      granted_at_ms: null,
      expires_at_ms: null,
      revoked_at_ms: 1000,
      retention_days: 90,
      history: [
        { event_id: 'e1', user_session_hash: 'h', action: 'user_granted', state_before: 'pending', state_after: 'granted', timestamp_ms: 500, flag_active: true },
        { event_id: 'e2', user_session_hash: 'h', action: 'user_revoked', state_before: 'granted', state_after: 'revoked', timestamp_ms: 1000, flag_active: true },
      ],
    }
    it('purged=true for revoked entry', () => {
      expect(executeLedgerPurge(revokedEntry, true).purged).toBe(true)
    })
    it('entries_removed=2 (history length)', () => {
      expect(executeLedgerPurge(revokedEntry, true).entries_removed).toBe(2)
    })
    it('purged=false for non-revoked state', () => {
      const grantedEntry = { ...revokedEntry, current_state: 'granted' as const }
      expect(executeLedgerPurge(grantedEntry, true).purged).toBe(false)
    })
    it('reason for non-revoked includes state', () => {
      const grantedEntry = { ...revokedEntry, current_state: 'granted' as const }
      expect(executeLedgerPurge(grantedEntry, true).reason).toContain('granted')
    })
  })

  // ── exportConsentLedger ───────────────────────────────────────────────────
  describe('exportConsentLedger', () => {
    it('exported=false when flag=false', () => {
      expect(exportConsentLedger(false).exported).toBe(false)
    })
    it('reason mentions flag=false', () => {
      expect(exportConsentLedger(false).reason).toContain('flag=false')
    })
    it('exported=true when flag=true', () => {
      expect(exportConsentLedger(true).exported).toBe(true)
    })
    it('data=null always in scaffold', () => {
      expect(exportConsentLedger(true).data).toBeNull()
      expect(exportConsentLedger(false).data).toBeNull()
    })
  })

  // ── getD3TwinConsentLedgerContract ────────────────────────────────────────
  describe('getD3TwinConsentLedgerContract', () => {
    it('lock=D3', () => expect(getD3TwinConsentLedgerContract().lock).toBe('D3'))
    it('tier=T4', () => expect(getD3TwinConsentLedgerContract().tier).toBe('T4'))
    it('flag_name correct', () => {
      expect(getD3TwinConsentLedgerContract().flag_name).toBe('TITANE_D3_TWIN_CONSENT_LEDGER')
    })
    it('consent_states=5', () => expect(getD3TwinConsentLedgerContract().consent_states).toBe(5))
    it('consent_actions=7', () => expect(getD3TwinConsentLedgerContract().consent_actions).toBe(7))
    it('retention_days=90', () => expect(getD3TwinConsentLedgerContract().retention_days).toBe(90))
    it('stores_raw_messages=false (data minimization)', () => {
      expect(getD3TwinConsentLedgerContract().stores_raw_messages).toBe(false)
    })
    it('purge_path_defined=true', () => {
      expect(getD3TwinConsentLedgerContract().purge_path_defined).toBe(true)
    })
    it('export_path_defined=true', () => {
      expect(getD3TwinConsentLedgerContract().export_path_defined).toBe(true)
    })
    it('gdpr_compliant_scaffold=true', () => {
      expect(getD3TwinConsentLedgerContract().gdpr_compliant_scaffold).toBe(true)
    })
    it('t4_approval_required=true', () => {
      expect(getD3TwinConsentLedgerContract().t4_approval_required).toBe(true)
    })
    it('flag_active reflects env', () => {
      expect(getD3TwinConsentLedgerContract().flag_active).toBe(TWIN_CONSENT_D3_FLAG)
    })
  })
})
