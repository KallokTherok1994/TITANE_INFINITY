/**
 * TITANE∞ — Provider Decision Invariants Tests
 * ═════════════════════════════════════════════════════════════════════════════
 * Test Suite for Truth Contract invariants (ONLINE-FIRST vΩ — Gate G4)
 *
 * Validates:
 *   1. mode=REMOTE implies network_used=true (also covers network_used=false implies mode!=REMOTE)
 *   2. provider_used=local_only implies mode!=REMOTE
 *   3. fallback implies reason_code != NONE/'OK' (explicit reason)
 *   4. clampProviderDecisionMeta produces coherent state
 * ═════════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, vi } from 'vitest';
import {
  validateProviderDecisionMeta,
  clampProviderDecisionMeta,
} from '@/types/providerDecisionMeta';
import type { ProviderDecisionMeta } from '@/types/providerMeta';

const validRemoteMeta: ProviderDecisionMeta = {
  provider_used: 'gemini',
  provider_class: 'remote',
  mode: 'REMOTE',
  reason_code: 'OK',
  latency_ms_total: 300,
  timeout_ms: 20000,
  retries: 0,
  attempts: [],
  network_used: true,
  cache_hit: false,
  policy: 'REMOTE_ALLOWED',
};

const validLocalMeta: ProviderDecisionMeta = {
  provider_used: 'local_only',
  provider_class: 'local',
  mode: 'LOCAL',
  reason_code: 'POLICY_BLOCKED',
  latency_ms_total: 50,
  timeout_ms: 20000,
  retries: 0,
  attempts: [],
  network_used: false,
  cache_hit: false,
  policy: 'EXTERNAL_AI_DISABLED',
};

// ─────────────────────────────────────────────────────────────────
// Invariant 1: mode=REMOTE implies network_used=true
// ─────────────────────────────────────────────────────────────────
describe('Truth Contract — Invariant 1: REMOTE implies network_used=true', () => {
  it('[INV1.1] valid REMOTE meta with network_used=true passes validation', () => {
    const result = validateProviderDecisionMeta(validRemoteMeta);
    expect(result).toBeNull();
  });

  it('[INV1.2] REMOTE with network_used=false is a violation', () => {
    const violating: ProviderDecisionMeta = {
      ...validRemoteMeta,
      network_used: false,
    };
    const result = validateProviderDecisionMeta(violating);
    expect(result).not.toBeNull();
    expect(result).toContain('NO_LYING_VIOLATION');
    expect(result).toContain('REMOTE');
    expect(result).toContain('network_used');
  });

  it('[INV1.3] clamp corrects REMOTE+network_used=false to LOCAL', () => {
    const violating: ProviderDecisionMeta = {
      ...validRemoteMeta,
      network_used: false,
    };
    const clamped = clampProviderDecisionMeta(violating);
    expect(clamped.mode).toBe('LOCAL');
    expect(clamped.reason_code).toBe('CONTRACT_VIOLATION_CLAMPED');
    expect(clamped.network_used).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────
// Invariant 2: network_used=false implies mode!=REMOTE
// ─────────────────────────────────────────────────────────────────
describe('Truth Contract — Invariant 2: network_used=false implies mode!=REMOTE', () => {
  it('[INV2.1] valid LOCAL meta with network_used=false passes validation', () => {
    const result = validateProviderDecisionMeta(validLocalMeta);
    expect(result).toBeNull();
  });

  it('[INV2.2] network_used=false with mode=REMOTE is a violation', () => {
    const violating: ProviderDecisionMeta = {
      ...validLocalMeta,
      mode: 'REMOTE',
    };
    const result = validateProviderDecisionMeta(violating);
    expect(result).not.toBeNull();
    expect(result).toContain('NO_LYING_VIOLATION');
  });

  it('[INV2.3] network_used=false with mode=LOCAL is valid', () => {
    const valid: ProviderDecisionMeta = { ...validLocalMeta, mode: 'LOCAL' };
    expect(validateProviderDecisionMeta(valid)).toBeNull();
  });

  it('[INV2.4] network_used=false with mode=OFFLINE is valid', () => {
    const valid: ProviderDecisionMeta = {
      ...validLocalMeta,
      mode: 'OFFLINE',
      reason_code: 'FALLBACK_OFFLINE',
    };
    expect(validateProviderDecisionMeta(valid)).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────
// Invariant 3: provider_used=local_only implies mode!=REMOTE
// ─────────────────────────────────────────────────────────────────
describe('Truth Contract — Invariant 3: local_only provider cannot be REMOTE', () => {
  it('[INV3.1] local_only with mode=LOCAL passes', () => {
    const result = validateProviderDecisionMeta(validLocalMeta);
    expect(result).toBeNull();
  });

  it('[INV3.2] local_only with mode=REMOTE is a violation (even when network_used=true)', () => {
    const violating: ProviderDecisionMeta = {
      ...validLocalMeta,
      mode: 'REMOTE',
      network_used: true, // network is available but provider is still local_only — invariant 2 violation
    };
    const result = validateProviderDecisionMeta(violating);
    expect(result).not.toBeNull();
    expect(result).toContain('NO_LYING_VIOLATION');
    expect(result).toContain('local_only');
  });

  it('[INV3.3] clamp corrects local_only+REMOTE to LOCAL (network_used=true case)', () => {
    const violating: ProviderDecisionMeta = {
      ...validLocalMeta,
      mode: 'REMOTE',
      network_used: true, // invariant 2 violation: local_only cannot be REMOTE
    };
    const clamped = clampProviderDecisionMeta(violating);
    expect(clamped.mode).not.toBe('REMOTE');
    expect(clamped.mode).toBe('LOCAL');
    expect(clamped.reason_code).toBe('CONTRACT_VIOLATION_CLAMPED');
  });
});

// ─────────────────────────────────────────────────────────────────
// Invariant 4: fallback implies reason_code != 'OK'/'NONE'
// ─────────────────────────────────────────────────────────────────
describe('Truth Contract — Invariant 4: fallback has explicit reason_code', () => {
  it('[INV4.1] policy-blocked fallback has POLICY_BLOCKED reason_code', () => {
    expect(validLocalMeta.reason_code).toBe('POLICY_BLOCKED');
    expect(validLocalMeta.reason_code).not.toBe('OK');
    expect(validLocalMeta.reason_code).not.toBe('UNKNOWN');
  });

  it('[INV4.2] REMOTE+OK passes (legitimate remote call)', () => {
    expect(validateProviderDecisionMeta(validRemoteMeta)).toBeNull();
    expect(validRemoteMeta.reason_code).toBe('OK');
    expect(validRemoteMeta.network_used).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────
// clamp: no-op on valid meta
// ─────────────────────────────────────────────────────────────────
describe('clampProviderDecisionMeta — no-op on valid meta', () => {
  it('[CLAMP1] valid REMOTE meta is returned unchanged', () => {
    const clamped = clampProviderDecisionMeta(validRemoteMeta);
    expect(clamped).toEqual(validRemoteMeta);
  });

  it('[CLAMP2] valid LOCAL meta is returned unchanged', () => {
    const clamped = clampProviderDecisionMeta(validLocalMeta);
    expect(clamped).toEqual(validLocalMeta);
  });

  it('[CLAMP3] clamping logs NO_LYING_VIOLATION_BACKEND to console.error', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const violating: ProviderDecisionMeta = {
      ...validRemoteMeta,
      network_used: false,
    };
    clampProviderDecisionMeta(violating);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[NO_LYING_VIOLATION_BACKEND]')
    );
    consoleSpy.mockRestore();
  });
});
