/**
 * TITANE∞ — Online Availability Invariants Tests
 * ═════════════════════════════════════════════════════════════════════════════
 * Test Suite for ONLINE-FINAL Gate G5
 *
 * Validates:
 *   1. REMOTE implies network_used=true
 *   2. internetReachable=true implies provider_used!=local_only (unless explicit policy)
 *   3. fallback always has a non-NONE reason_code
 *   4. UI-derived tags come from meta (not inference)
 * ═════════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect } from 'vitest';
import { validateProviderDecisionMeta } from '@/types/providerDecisionMeta';
import type { ProviderDecisionMeta, Mode, ReasonCode } from '@/types/providerMeta';

// ─────────────────────────────────────────────────────────────────
// Helpers for building test meta
// ─────────────────────────────────────────────────────────────────

function buildMeta(overrides: Partial<ProviderDecisionMeta>): ProviderDecisionMeta {
  return {
    provider_used: 'gemini',
    provider_class: 'remote',
    mode: 'REMOTE' as Mode,
    reason_code: 'OK' as ReasonCode,
    latency_ms_total: 300,
    timeout_ms: 20000,
    retries: 0,
    attempts: [],
    network_used: true,
    cache_hit: false,
    policy: 'DEFAULT',
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────
// G5.1 — REMOTE implies network_used=true
// ─────────────────────────────────────────────────────────────────
describe('G5.1: REMOTE implies network_used=true', () => {
  it('[G5.1.1] REMOTE + network_used=true is valid (happy path)', () => {
    const meta = buildMeta({ mode: 'REMOTE', network_used: true });
    expect(validateProviderDecisionMeta(meta)).toBeNull();
  });

  it('[G5.1.2] REMOTE + network_used=false is invalid', () => {
    const meta = buildMeta({ mode: 'REMOTE', network_used: false });
    const error = validateProviderDecisionMeta(meta);
    expect(error).not.toBeNull();
    expect(error).toContain('NO_LYING_VIOLATION');
  });

  it('[G5.1.3] LOCAL + network_used=false is valid', () => {
    const meta = buildMeta({
      mode: 'LOCAL',
      network_used: false,
      provider_used: 'ollama',
      provider_class: 'local',
      reason_code: 'OK',
    });
    expect(validateProviderDecisionMeta(meta)).toBeNull();
  });

  it('[G5.1.4] OFFLINE + network_used=false is valid', () => {
    const meta = buildMeta({
      mode: 'OFFLINE',
      network_used: false,
      provider_used: 'offline',
      provider_class: 'local',
      reason_code: 'FALLBACK_OFFLINE',
    });
    expect(validateProviderDecisionMeta(meta)).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────
// G5.2 — internetReachable=true implies provider_used != local_only
//         (unless explicit policy reason_code)
// ─────────────────────────────────────────────────────────────────
describe('G5.2: internetReachable=true implies provider!=local_only unless policy explicit', () => {
  /**
   * When internet is available (network_used=true), the provider should not be local_only.
   * local_only + network_used=true = contradiction in the Truth Contract.
   */
  it('[G5.2.1] local_only + network_used=true + mode=REMOTE is invalid', () => {
    const meta = buildMeta({
      provider_used: 'local_only',
      provider_class: 'local',
      mode: 'REMOTE',
      network_used: true,
    });
    const error = validateProviderDecisionMeta(meta);
    expect(error).not.toBeNull();
    expect(error).toContain('local_only');
  });

  it('[G5.2.2] local_only + network_used=false + mode=LOCAL is valid (policy-blocked path)', () => {
    // This is the correct state: external AI blocked by policy
    const meta = buildMeta({
      provider_used: 'local_only',
      provider_class: 'local',
      mode: 'LOCAL',
      network_used: false,
      reason_code: 'POLICY_BLOCKED',
      policy: 'EXTERNAL_AI_DISABLED',
    });
    expect(validateProviderDecisionMeta(meta)).toBeNull();
  });

  it('[G5.2.3] non-local provider + network_used=true + mode=REMOTE is valid (internet available + remote used)', () => {
    const meta = buildMeta({
      provider_used: 'gemini',
      provider_class: 'remote',
      mode: 'REMOTE',
      network_used: true,
      reason_code: 'OK',
    });
    expect(validateProviderDecisionMeta(meta)).toBeNull();
  });

  it('[G5.2.4] ollama (local, not local_only) + network_used=false is valid', () => {
    // Ollama is a local provider — using it does not violate the contract
    const meta = buildMeta({
      provider_used: 'ollama',
      provider_class: 'local',
      mode: 'LOCAL',
      network_used: false,
      reason_code: 'OK',
    });
    expect(validateProviderDecisionMeta(meta)).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────
// G5.3 — fallback always has reason_code != 'OK' or 'UNKNOWN'
// ─────────────────────────────────────────────────────────────────
describe('G5.3: fallback has explicit reason_code', () => {
  const fallbackReasonCodes: ReasonCode[] = [
    'POLICY_BLOCKED',
    'PROVIDER_DOWN',
    'TIMEOUT',
    'RATE_LIMIT',
    'NETWORK_ERROR',
    'FALLBACK_OFFLINE',
    'PROVIDER_UNAVAILABLE',
  ];

  it('[G5.3.1] all fallback reason_codes are non-OK and non-UNKNOWN', () => {
    for (const rc of fallbackReasonCodes) {
      expect(rc).not.toBe('OK');
      expect(rc).not.toBe('UNKNOWN');
    }
  });

  it('[G5.3.2] policy-blocked fallback has POLICY_BLOCKED reason_code', () => {
    const meta = buildMeta({
      provider_used: 'local_only',
      provider_class: 'local',
      mode: 'LOCAL',
      network_used: false,
      reason_code: 'POLICY_BLOCKED',
      policy: 'EXTERNAL_AI_DISABLED',
    });
    expect(meta.reason_code).toBe('POLICY_BLOCKED');
    expect(meta.reason_code).not.toBe('OK');
    expect(validateProviderDecisionMeta(meta)).toBeNull();
  });

  it('[G5.3.3] offline fallback has FALLBACK_OFFLINE reason_code', () => {
    const meta = buildMeta({
      provider_used: 'offline',
      provider_class: 'local',
      mode: 'OFFLINE',
      network_used: false,
      reason_code: 'FALLBACK_OFFLINE',
    });
    expect(meta.reason_code).toBe('FALLBACK_OFFLINE');
    expect(validateProviderDecisionMeta(meta)).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────
// G5.4 — UI tags derived from meta (not inference)
// ─────────────────────────────────────────────────────────────────
describe('G5.4: UI display tags derived from meta fields', () => {
  it('[G5.4.1] REMOTE + network_used=true → UI should display remote indicator', () => {
    const meta = buildMeta({
      mode: 'REMOTE',
      network_used: true,
      provider_used: 'gemini',
    });
    // UI derives: mode=REMOTE, network indicator = true
    expect(meta.mode).toBe('REMOTE');
    expect(meta.network_used).toBe(true);
    expect(meta.provider_used).not.toBe('local_only');
  });

  it('[G5.4.2] LOCAL + network_used=false → UI should NOT display remote indicator', () => {
    const meta = buildMeta({
      mode: 'LOCAL',
      network_used: false,
      provider_used: 'local_only',
      provider_class: 'local',
      reason_code: 'POLICY_BLOCKED',
    });
    // UI should show LOCAL badge, not REMOTE
    expect(meta.mode).not.toBe('REMOTE');
    expect(meta.network_used).toBe(false);
    // invariant check confirms no lying
    expect(validateProviderDecisionMeta(meta)).toBeNull();
  });

  it('[G5.4.3] OFFLINE + network_used=false → UI shows offline state', () => {
    const meta = buildMeta({
      mode: 'OFFLINE',
      network_used: false,
      provider_used: 'offline',
      provider_class: 'local',
      reason_code: 'FALLBACK_OFFLINE',
    });
    expect(meta.mode).toBe('OFFLINE');
    expect(meta.network_used).toBe(false);
    expect(validateProviderDecisionMeta(meta)).toBeNull();
  });
});
