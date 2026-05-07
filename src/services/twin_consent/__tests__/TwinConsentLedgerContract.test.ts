/**
 * Lock D3 — Twin Consent Ledger Contract
 * Unit tests
 */

import { describe, it, expect } from 'vitest';
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
  // v13 sidecar
  TwinObservationTypeSchema,
  TwinValidationStatusSchema,
  TwinConsentRiskLevelSchema,
  TwinIdentityObservationEntrySchema,
  D3_IDENTITY_OBSERVATION_EMISSION_ACTIVE,
  D3_IDENTITY_OBSERVATION_KNOWN_LIMITS,
  D3_TWIN_IDENTITY_OBSERVATION_CONTRACT,
  isIdentitySensitive,
  requiresKevinValidation,
  isExpiredObservation,
  isRejectedOrBlocked,
  canAffectBehavior,
  canAffectMemory,
  canAffectIdentity,
  normalizeAutoDetectedObservation,
  buildTwinConsentSummary,
  type TwinIdentityObservationEntry,
} from '../TwinConsentLedgerContract';

describe('D3 — Twin Consent Ledger Contract', () => {
  // ── Enum Schemas ──────────────────────────────────────────────────────────
  describe('ConsentStateSchema', () => {
    it('accepts all 5 states', () => {
      for (const s of [
        'uninitiated',
        'pending',
        'granted',
        'revoked',
        'expired',
      ] as const) {
        expect(() => ConsentStateSchema.parse(s)).not.toThrow();
      }
    });
    it('rejects unknown state', () => {
      expect(() => ConsentStateSchema.parse('maybe')).toThrow();
    });
  });

  describe('ConsentActionSchema', () => {
    it('accepts all 7 actions', () => {
      const actions = [
        'prompt_shown',
        'user_granted',
        'user_revoked',
        'expiry_triggered',
        'reconfirm_prompted',
        'reconfirm_granted',
        'purge_executed',
      ] as const;
      for (const a of actions) {
        expect(() => ConsentActionSchema.parse(a)).not.toThrow();
      }
    });
    it('rejects unknown action', () => {
      expect(() => ConsentActionSchema.parse('ignore_all')).toThrow();
    });
  });

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
    };
    it('accepts valid event', () => {
      expect(() => ConsentEventSchema.parse(valid)).not.toThrow();
    });
    it('rejects negative timestamp', () => {
      expect(() => ConsentEventSchema.parse({ ...valid, timestamp_ms: -1 })).toThrow();
    });
  });

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
    };
    it('accepts valid ledger entry', () => {
      expect(() => ConsentLedgerEntrySchema.parse(valid)).not.toThrow();
    });
    it('rejects retention_days > 90', () => {
      expect(() =>
        ConsentLedgerEntrySchema.parse({ ...valid, retention_days: 91 })
      ).toThrow();
    });
    it('rejects retention_days < 1', () => {
      expect(() =>
        ConsentLedgerEntrySchema.parse({ ...valid, retention_days: 0 })
      ).toThrow();
    });
    it('allows null fields', () => {
      expect(() =>
        ConsentLedgerEntrySchema.parse({
          ...valid,
          granted_at_ms: null,
          expires_at_ms: null,
        })
      ).not.toThrow();
    });
  });

  // ── D3_DATA_MINIMIZATION_MANIFEST ─────────────────────────────────────────
  describe('D3_DATA_MINIMIZATION_MANIFEST', () => {
    it('stores_raw_messages=false (data minimization)', () => {
      expect(D3_DATA_MINIMIZATION_MANIFEST.stores_raw_messages).toBe(false);
    });
    it('retention_limit_days <= 90', () => {
      expect(D3_DATA_MINIMIZATION_MANIFEST.retention_limit_days).toBeLessThanOrEqual(90);
    });
    it('purge_path_defined=true', () => {
      expect(D3_DATA_MINIMIZATION_MANIFEST.purge_path_defined).toBe(true);
    });
    it('export_path_defined=true', () => {
      expect(D3_DATA_MINIMIZATION_MANIFEST.export_path_defined).toBe(true);
    });
    it('gdpr_compliant_scaffold=true', () => {
      expect(D3_DATA_MINIMIZATION_MANIFEST.gdpr_compliant_scaffold).toBe(true);
    });
    it('validates against DataMinimizationManifestSchema', () => {
      expect(() =>
        DataMinimizationManifestSchema.parse(D3_DATA_MINIMIZATION_MANIFEST)
      ).not.toThrow();
    });
  });

  // ── VALID_TRANSITIONS ─────────────────────────────────────────────────────
  describe('VALID_TRANSITIONS', () => {
    it('uninitiated → pending only', () => {
      expect(VALID_TRANSITIONS.uninitiated).toEqual(['pending']);
    });
    it('pending → granted or revoked', () => {
      expect(VALID_TRANSITIONS.pending).toContain('granted');
      expect(VALID_TRANSITIONS.pending).toContain('revoked');
    });
    it('granted → revoked or expired', () => {
      expect(VALID_TRANSITIONS.granted).toContain('revoked');
      expect(VALID_TRANSITIONS.granted).toContain('expired');
    });
    it('revoked → uninitiated (reset path)', () => {
      expect(VALID_TRANSITIONS.revoked).toEqual(['uninitiated']);
    });
    it('expired → pending or revoked (re-consent path)', () => {
      expect(VALID_TRANSITIONS.expired).toContain('pending');
      expect(VALID_TRANSITIONS.expired).toContain('revoked');
    });
  });

  // ── isValidConsentTransition ──────────────────────────────────────────────
  describe('isValidConsentTransition', () => {
    it('uninitiated→pending=true', () =>
      expect(isValidConsentTransition('uninitiated', 'pending')).toBe(true));
    it('uninitiated→granted=false', () =>
      expect(isValidConsentTransition('uninitiated', 'granted')).toBe(false));
    it('pending→granted=true', () =>
      expect(isValidConsentTransition('pending', 'granted')).toBe(true));
    it('pending→revoked=true', () =>
      expect(isValidConsentTransition('pending', 'revoked')).toBe(true));
    it('pending→expired=false', () =>
      expect(isValidConsentTransition('pending', 'expired')).toBe(false));
    it('granted→revoked=true', () =>
      expect(isValidConsentTransition('granted', 'revoked')).toBe(true));
    it('granted→pending=false', () =>
      expect(isValidConsentTransition('granted', 'pending')).toBe(false));
    it('revoked→uninitiated=true', () =>
      expect(isValidConsentTransition('revoked', 'uninitiated')).toBe(true));
    it('revoked→granted=false', () =>
      expect(isValidConsentTransition('revoked', 'granted')).toBe(false));
    it('expired→pending=true', () =>
      expect(isValidConsentTransition('expired', 'pending')).toBe(true));
  });

  // ── isConsentExpired ──────────────────────────────────────────────────────
  describe('isConsentExpired', () => {
    const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
    it('not expired within 90 days', () => {
      expect(isConsentExpired(1000, 1000 + ninetyDaysMs - 1)).toBe(false);
    });
    it('expired after exactly 90 days', () => {
      expect(isConsentExpired(1000, 1000 + ninetyDaysMs + 1)).toBe(true);
    });
    it('not expired on same timestamp', () => {
      expect(isConsentExpired(1000, 1000)).toBe(false);
    });
  });

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
      history: [
        {
          event_id: 'e1',
          user_session_hash: 'h',
          action: 'user_revoked',
          state_before: 'granted',
          state_after: 'revoked',
          timestamp_ms: 1000,
          flag_active: false,
        },
      ],
    };
    it('purged=false when flag=false', () => {
      expect(executeLedgerPurge(revokedEntry, false).purged).toBe(false);
    });
    it('reason mentions flag=false', () => {
      expect(executeLedgerPurge(revokedEntry, false).reason).toContain('flag=false');
    });
    it('entries_removed=0 when flag=false', () => {
      expect(executeLedgerPurge(revokedEntry, false).entries_removed).toBe(0);
    });
  });

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
        {
          event_id: 'e1',
          user_session_hash: 'h',
          action: 'user_granted',
          state_before: 'pending',
          state_after: 'granted',
          timestamp_ms: 500,
          flag_active: true,
        },
        {
          event_id: 'e2',
          user_session_hash: 'h',
          action: 'user_revoked',
          state_before: 'granted',
          state_after: 'revoked',
          timestamp_ms: 1000,
          flag_active: true,
        },
      ],
    };
    it('purged=true for revoked entry', () => {
      expect(executeLedgerPurge(revokedEntry, true).purged).toBe(true);
    });
    it('entries_removed=2 (history length)', () => {
      expect(executeLedgerPurge(revokedEntry, true).entries_removed).toBe(2);
    });
    it('purged=false for non-revoked state', () => {
      const grantedEntry = { ...revokedEntry, current_state: 'granted' as const };
      expect(executeLedgerPurge(grantedEntry, true).purged).toBe(false);
    });
    it('reason for non-revoked includes state', () => {
      const grantedEntry = { ...revokedEntry, current_state: 'granted' as const };
      expect(executeLedgerPurge(grantedEntry, true).reason).toContain('granted');
    });
  });

  // ── exportConsentLedger ───────────────────────────────────────────────────
  describe('exportConsentLedger', () => {
    it('exported=false when flag=false', () => {
      expect(exportConsentLedger(false).exported).toBe(false);
    });
    it('reason mentions flag=false', () => {
      expect(exportConsentLedger(false).reason).toContain('flag=false');
    });
    it('exported=true when flag=true', () => {
      expect(exportConsentLedger(true).exported).toBe(true);
    });
    it('data=null always in scaffold', () => {
      expect(exportConsentLedger(true).data).toBeNull();
      expect(exportConsentLedger(false).data).toBeNull();
    });
  });

  // ── getD3TwinConsentLedgerContract ────────────────────────────────────────
  describe('getD3TwinConsentLedgerContract', () => {
    it('lock=D3', () => expect(getD3TwinConsentLedgerContract().lock).toBe('D3'));
    it('tier=T4', () => expect(getD3TwinConsentLedgerContract().tier).toBe('T4'));
    it('flag_name correct', () => {
      expect(getD3TwinConsentLedgerContract().flag_name).toBe(
        'TITANE_D3_TWIN_CONSENT_LEDGER'
      );
    });
    it('consent_states=5', () =>
      expect(getD3TwinConsentLedgerContract().consent_states).toBe(5));
    it('consent_actions=7', () =>
      expect(getD3TwinConsentLedgerContract().consent_actions).toBe(7));
    it('retention_days=90', () =>
      expect(getD3TwinConsentLedgerContract().retention_days).toBe(90));
    it('stores_raw_messages=false (data minimization)', () => {
      expect(getD3TwinConsentLedgerContract().stores_raw_messages).toBe(false);
    });
    it('purge_path_defined=true', () => {
      expect(getD3TwinConsentLedgerContract().purge_path_defined).toBe(true);
    });
    it('export_path_defined=true', () => {
      expect(getD3TwinConsentLedgerContract().export_path_defined).toBe(true);
    });
    it('gdpr_compliant_scaffold=true', () => {
      expect(getD3TwinConsentLedgerContract().gdpr_compliant_scaffold).toBe(true);
    });
    it('t4_approval_required=true', () => {
      expect(getD3TwinConsentLedgerContract().t4_approval_required).toBe(true);
    });
    it('flag_active reflects env', () => {
      expect(getD3TwinConsentLedgerContract().flag_active).toBe(TWIN_CONSENT_D3_FLAG);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// D3 v13 SIDECAR TESTS — Identity Observation Ledger
// ─────────────────────────────────────────────────────────────────────────────

/** Minimal valid identity observation entry for use in tests */
const makeEntry = (
  overrides: Partial<TwinIdentityObservationEntry> = {}
): TwinIdentityObservationEntry => ({
  observation_id: 'obs-001',
  subject_id: 'kevin',
  observation_type: 'preference',
  content: 'prefers structured tasks',
  source: 'chat_pattern',
  confidence: 0.85,
  auto_detected: false,
  requires_validation: false,
  validation_status: 'confirmed',
  validated_by: 'kevin',
  validated_at: '2026-05-06T00:00:00Z',
  can_affect_behavior: true,
  can_affect_memory: true,
  can_affect_identity: false,
  expires_at: null,
  rejected_reason: null,
  risk_level: 'low',
  linked_memory_node_ids: [],
  created_at: '2026-05-06T00:00:00Z',
  updated_at: '2026-05-06T00:00:00Z',
  ...overrides,
});

describe('D3 v13 Sidecar — Schemas', () => {
  it('TwinObservationTypeSchema accepts all 11 types', () => {
    const types = [
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
    ] as const;
    for (const t of types) expect(() => TwinObservationTypeSchema.parse(t)).not.toThrow();
    expect(types).toHaveLength(11);
  });
  it('TwinValidationStatusSchema accepts all 8 statuses', () => {
    const statuses = [
      'hypothesis',
      'requires_kevin_validation',
      'confirmed',
      'rejected',
      'expired',
      'system_observed',
      'blocked',
      'unknown',
    ] as const;
    for (const s of statuses)
      expect(() => TwinValidationStatusSchema.parse(s)).not.toThrow();
    expect(statuses).toHaveLength(8);
  });
  it('TwinConsentRiskLevelSchema accepts all 5 levels', () => {
    const levels = ['low', 'medium', 'high', 'identity_sensitive', 'restricted'] as const;
    for (const l of levels)
      expect(() => TwinConsentRiskLevelSchema.parse(l)).not.toThrow();
    expect(levels).toHaveLength(5);
  });
  it('TwinIdentityObservationEntrySchema parses a valid entry', () => {
    expect(() => TwinIdentityObservationEntrySchema.parse(makeEntry())).not.toThrow();
  });
  it('D3_IDENTITY_OBSERVATION_KNOWN_LIMITS has 5 limits', () => {
    expect(D3_IDENTITY_OBSERVATION_KNOWN_LIMITS.length).toBeGreaterThanOrEqual(5);
  });
  it('D3_TWIN_IDENTITY_OBSERVATION_CONTRACT has correct metadata', () => {
    expect(D3_TWIN_IDENTITY_OBSERVATION_CONTRACT.observation_types).toBe(11);
    expect(D3_TWIN_IDENTITY_OBSERVATION_CONTRACT.validation_statuses).toBe(8);
    expect(D3_TWIN_IDENTITY_OBSERVATION_CONTRACT.risk_levels).toBe(5);
    expect(D3_TWIN_IDENTITY_OBSERVATION_CONTRACT.twin_rule).toContain('mirror');
  });
});

describe('D3 v13 Sidecar — Policy Helpers', () => {
  it('isIdentitySensitive=true for identity_fact type', () => {
    expect(isIdentitySensitive(makeEntry({ observation_type: 'identity_fact' }))).toBe(
      true
    );
  });
  it('isIdentitySensitive=true for identity_sensitive risk level', () => {
    expect(isIdentitySensitive(makeEntry({ risk_level: 'identity_sensitive' }))).toBe(
      true
    );
  });
  it('isIdentitySensitive=false for preference with low risk', () => {
    expect(
      isIdentitySensitive(
        makeEntry({ observation_type: 'preference', risk_level: 'low' })
      )
    ).toBe(false);
  });
  it('requiresKevinValidation=true for identity_fact', () => {
    expect(
      requiresKevinValidation(makeEntry({ observation_type: 'identity_fact' }))
    ).toBe(true);
  });
  it('requiresKevinValidation=true when requires_validation=true', () => {
    expect(requiresKevinValidation(makeEntry({ requires_validation: true }))).toBe(true);
  });
  it('isExpiredObservation=false when expires_at=null', () => {
    expect(isExpiredObservation(makeEntry({ expires_at: null }))).toBe(false);
  });
  it('isExpiredObservation=true for past date', () => {
    expect(isExpiredObservation(makeEntry({ expires_at: '2020-01-01T00:00:00Z' }))).toBe(
      true
    );
  });
  it('isRejectedOrBlocked=true for rejected', () => {
    expect(isRejectedOrBlocked(makeEntry({ validation_status: 'rejected' }))).toBe(true);
  });
  it('isRejectedOrBlocked=true for blocked', () => {
    expect(isRejectedOrBlocked(makeEntry({ validation_status: 'blocked' }))).toBe(true);
  });
  it('isRejectedOrBlocked=false for confirmed', () => {
    expect(isRejectedOrBlocked(makeEntry({ validation_status: 'confirmed' }))).toBe(
      false
    );
  });
});

describe('D3-UNIT Tests — Identity Safety Gates', () => {
  // D3-UNIT-01: TwinIdentityObservationEntry validates a complete entry
  it('D3-UNIT-01: TwinIdentityObservationEntry validates a complete entry', () => {
    const entry = makeEntry();
    expect(() => TwinIdentityObservationEntrySchema.parse(entry)).not.toThrow();
    expect(entry.observation_id).toBe('obs-001');
    expect(entry.validation_status).toBe('confirmed');
  });

  // D3-UNIT-02: confidence alone cannot grant consent
  it('D3-UNIT-02: confidence alone cannot grant consent — hypothesis with high confidence cannot affect identity', () => {
    const entry = makeEntry({
      confidence: 0.99,
      validation_status: 'hypothesis',
      can_affect_identity: true,
    });
    expect(canAffectIdentity(entry)).toBe(false);
  });

  // D3-UNIT-03: auto-detected identity-sensitive observation requires Kevin validation
  it('D3-UNIT-03: auto-detected identity-sensitive entry normalized to requires_kevin_validation', () => {
    const raw = makeEntry({
      auto_detected: true,
      observation_type: 'identity_fact',
      validation_status: 'system_observed',
      can_affect_identity: true,
      can_affect_behavior: true,
    });
    const normalized = normalizeAutoDetectedObservation(raw);
    expect(normalized.requires_validation).toBe(true);
    expect(normalized.validation_status).toBe('requires_kevin_validation');
    expect(normalized.can_affect_identity).toBe(false);
    expect(normalized.can_affect_behavior).toBe(false);
  });

  // D3-UNIT-04: canAffectIdentity false unless validation_status=confirmed
  it('D3-UNIT-04: canAffectIdentity=false for hypothesis even with can_affect_identity=true', () => {
    expect(
      canAffectIdentity(
        makeEntry({ validation_status: 'hypothesis', can_affect_identity: true })
      )
    ).toBe(false);
  });

  // D3-UNIT-05: rejected observation cannot affect behavior/memory/identity
  it('D3-UNIT-05: rejected observation cannot affect behavior, memory, or identity', () => {
    const entry = makeEntry({
      validation_status: 'rejected',
      can_affect_behavior: true,
      can_affect_memory: true,
      can_affect_identity: true,
    });
    expect(canAffectBehavior(entry)).toBe(false);
    expect(canAffectMemory(entry)).toBe(false);
    expect(canAffectIdentity(entry)).toBe(false);
  });

  // D3-UNIT-06: expired observation cannot affect behavior/memory/identity
  it('D3-UNIT-06: expired observation cannot affect behavior, memory, or identity', () => {
    const entry = makeEntry({
      expires_at: '2020-01-01T00:00:00Z',
      can_affect_behavior: true,
      can_affect_memory: true,
      can_affect_identity: true,
    });
    expect(canAffectBehavior(entry)).toBe(false);
    expect(canAffectMemory(entry)).toBe(false);
    expect(canAffectIdentity(entry)).toBe(false);
  });

  // D3-UNIT-07: symbolic_axis remains hypothesis unless confirmed
  it('D3-UNIT-07: symbolic_axis with hypothesis cannot affect identity', () => {
    const entry = makeEntry({
      observation_type: 'symbolic_axis',
      validation_status: 'hypothesis',
      can_affect_identity: true,
    });
    expect(canAffectIdentity(entry)).toBe(false);
    expect(isIdentitySensitive(entry)).toBe(true);
  });

  // D3-UNIT-08: behavioral_instruction cannot affect style unless confirmed
  it('D3-UNIT-08: behavioral_instruction with requires_kevin_validation cannot affect behavior', () => {
    const entry = makeEntry({
      observation_type: 'behavioral_instruction',
      validation_status: 'requires_kevin_validation',
      can_affect_behavior: true,
    });
    expect(canAffectBehavior(entry)).toBe(false);
  });

  // D3-UNIT-09: system_observed supports logging but not identity activation
  it('D3-UNIT-09: system_observed status cannot activate identity behavior', () => {
    const entry = makeEntry({
      validation_status: 'system_observed',
      can_affect_identity: true,
      can_affect_behavior: true,
    });
    expect(canAffectIdentity(entry)).toBe(false);
    expect(canAffectBehavior(entry)).toBe(false);
  });

  // D3-UNIT-10: buildTwinConsentSummary counts correctly
  it('D3-UNIT-10: buildTwinConsentSummary counts confirmed/rejected/pending/blocked', () => {
    const entries = [
      makeEntry({ validation_status: 'confirmed', can_affect_identity: true }),
      makeEntry({ observation_id: 'obs-002', validation_status: 'rejected' }),
      makeEntry({ observation_id: 'obs-003', validation_status: 'blocked' }),
      makeEntry({ observation_id: 'obs-004', validation_status: 'hypothesis' }),
    ];
    const summary = buildTwinConsentSummary(entries);
    expect(summary.total).toBe(4);
    expect(summary.confirmed).toBe(1);
    expect(summary.rejected).toBe(1);
    expect(summary.blocked).toBe(1);
    expect(summary.pending).toBe(1);
    expect(summary.confidence_not_consent_enforced).toBe(true);
  });
});

describe('D3 v13 Sidecar — Emission Flag', () => {
  it('D3_IDENTITY_OBSERVATION_EMISSION_ACTIVE=false in test env (PROD SAFE)', () => {
    expect(D3_IDENTITY_OBSERVATION_EMISSION_ACTIVE).toBe(false);
  });
});
