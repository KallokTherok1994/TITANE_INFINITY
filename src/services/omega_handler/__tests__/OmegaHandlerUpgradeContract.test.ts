/**
 * Lock D1 — OMEGA Real Handler Upgrade Contract
 * Unit tests: gaps, invariants, validation logic
 */

import { describe, it, expect } from 'vitest'
import {
  D1_GAPS,
  D1_INVARIANTS,
  validateOmegaHandlerResponse,
  getD1OmegaHandlerContract,
  D1GapIdSchema,
  D1GapSchema,
  OmegaHandlerRequestSchema,
  OmegaHandlerResponseSchema,
  OMEGA_D1_HANDLER_FLAG,
} from '../OmegaHandlerUpgradeContract'

describe('D1 — OMEGA Handler Upgrade Contract', () => {
  // ── Meta / Schema ─────────────────────────────────────────────────────────
  describe('D1GapIdSchema', () => {
    it('accepts valid gap ids', () => {
      expect(D1GapIdSchema.parse('D1-G1')).toBe('D1-G1')
      expect(D1GapIdSchema.parse('D1-G2')).toBe('D1-G2')
      expect(D1GapIdSchema.parse('D1-G3')).toBe('D1-G3')
    })
    it('rejects invalid gap id', () => {
      expect(() => D1GapIdSchema.parse('D1-G4')).toThrow()
      expect(() => D1GapIdSchema.parse('')).toThrow()
    })
  })

  describe('D1GapSchema', () => {
    it('parses valid gap entry', () => {
      const gap = D1GapSchema.parse({
        gap_id: 'D1-G1',
        description: 'test',
        severity: 'high',
        status: 'identified',
      })
      expect(gap.gap_id).toBe('D1-G1')
    })
    it('rejects invalid severity', () => {
      expect(() =>
        D1GapSchema.parse({ gap_id: 'D1-G1', description: 'x', severity: 'low', status: 'identified' })
      ).toThrow()
    })
  })

  // ── D1_GAPS ──────────────────────────────────────────────────────────────
  describe('D1_GAPS constant', () => {
    it('has exactly 3 gaps', () => {
      expect(D1_GAPS).toHaveLength(3)
    })
    it('gap ids are unique', () => {
      const ids = D1_GAPS.map((g) => g.gap_id)
      expect(new Set(ids).size).toBe(3)
    })
    it('all 3 gaps have status identified', () => {
      expect(D1_GAPS.every((g) => g.status === 'identified')).toBe(true)
    })
    it('D1-G1 is high severity', () => {
      const g1 = D1_GAPS.find((g) => g.gap_id === 'D1-G1')
      expect(g1?.severity).toBe('high')
    })
    it('D1-G2 is critical severity (latency budget)', () => {
      const g2 = D1_GAPS.find((g) => g.gap_id === 'D1-G2')
      expect(g2?.severity).toBe('critical')
    })
    it('D1-G3 is high severity (provider transparency)', () => {
      const g3 = D1_GAPS.find((g) => g.gap_id === 'D1-G3')
      expect(g3?.severity).toBe('high')
    })
    it('exactly 1 critical severity gap', () => {
      const critical = D1_GAPS.filter((g) => g.severity === 'critical')
      expect(critical).toHaveLength(1)
    })
  })

  // ── D1_INVARIANTS ─────────────────────────────────────────────────────────
  describe('D1_INVARIANTS constant', () => {
    it('has exactly 3 invariants', () => {
      expect(D1_INVARIANTS).toHaveLength(3)
    })
    it('invariant ids are unique', () => {
      const ids = D1_INVARIANTS.map((i) => i.invariant_id)
      expect(new Set(ids).size).toBe(3)
    })
    it('all invariants are test-enforceable', () => {
      expect(D1_INVARIANTS.every((i) => i.enforceable_in_tests)).toBe(true)
    })
    it('each invariant addresses a distinct gap', () => {
      const gaps = D1_INVARIANTS.map((i) => i.addresses_gap)
      expect(new Set(gaps).size).toBe(3)
    })
  })

  // ── OmegaHandlerRequestSchema ─────────────────────────────────────────────
  describe('OmegaHandlerRequestSchema', () => {
    const valid = {
      request_id: 'req-001',
      session_id: 'sess-001',
      prompt: 'hello world',
      model: null,
      latency_budget_ms: 30000,
      flag_active: false,
    }
    it('accepts valid request', () => {
      expect(() => OmegaHandlerRequestSchema.parse(valid)).not.toThrow()
    })
    it('rejects empty prompt', () => {
      expect(() => OmegaHandlerRequestSchema.parse({ ...valid, prompt: '' })).toThrow()
    })
    it('rejects latency_budget_ms < 1000', () => {
      expect(() => OmegaHandlerRequestSchema.parse({ ...valid, latency_budget_ms: 999 })).toThrow()
    })
    it('rejects latency_budget_ms > 180000', () => {
      expect(() => OmegaHandlerRequestSchema.parse({ ...valid, latency_budget_ms: 180001 })).toThrow()
    })
    it('accepts latency_budget_ms = 1000', () => {
      expect(() => OmegaHandlerRequestSchema.parse({ ...valid, latency_budget_ms: 1000 })).not.toThrow()
    })
    it('accepts latency_budget_ms = 180000', () => {
      expect(() => OmegaHandlerRequestSchema.parse({ ...valid, latency_budget_ms: 180000 })).not.toThrow()
    })
  })

  // ── OmegaHandlerResponseSchema ────────────────────────────────────────────
  describe('OmegaHandlerResponseSchema', () => {
    const valid = {
      request_id: 'req-001',
      content: 'hello back',
      is_empty: false,
      provider_used: 'ollama:gemma2:2b',
      latency_ms: 1500,
      within_budget: true,
      flag_active: false,
      invariants_checked: ['D1-I1', 'D1-I2', 'D1-I3'],
    }
    it('accepts valid response', () => {
      expect(() => OmegaHandlerResponseSchema.parse(valid)).not.toThrow()
    })
    it('rejects empty provider_used', () => {
      expect(() => OmegaHandlerResponseSchema.parse({ ...valid, provider_used: '' })).toThrow()
    })
    it('rejects negative latency_ms', () => {
      expect(() => OmegaHandlerResponseSchema.parse({ ...valid, latency_ms: -1 })).toThrow()
    })
  })

  // ── validateOmegaHandlerResponse ─────────────────────────────────────────
  describe('validateOmegaHandlerResponse — flag=false (passthrough)', () => {
    it('always passes when flag=false regardless of content', () => {
      const result = validateOmegaHandlerResponse(
        {
          request_id: 'req',
          content: '',
          is_empty: true,
          provider_used: '',
          latency_ms: 999999,
          within_budget: false,
          flag_active: false,
        },
        false
      )
      expect(result.passed).toBe(true)
      expect(result.violations).toHaveLength(0)
    })
    it('returns empty violations list when flag=false', () => {
      const r = validateOmegaHandlerResponse(
        { request_id: 'r', content: 'hi', is_empty: false, provider_used: 'ollama', latency_ms: 100, within_budget: true, flag_active: false },
        false
      )
      expect(r.violations).toEqual([])
    })
  })

  describe('validateOmegaHandlerResponse — flag=true (enforced)', () => {
    const good = {
      request_id: 'req',
      content: 'good response text',
      is_empty: false,
      provider_used: 'ollama:gemma2:2b',
      latency_ms: 5000,
      within_budget: true,
      flag_active: true,
    }

    it('passes valid response', () => {
      const r = validateOmegaHandlerResponse(good, true)
      expect(r.passed).toBe(true)
      expect(r.violations).toHaveLength(0)
    })

    it('D1-I1: fails on is_empty=true', () => {
      const r = validateOmegaHandlerResponse({ ...good, is_empty: true }, true)
      expect(r.passed).toBe(false)
      expect(r.violations.some((v) => v.includes('D1-I1'))).toBe(true)
    })

    it('D1-I1: fails on empty content string', () => {
      const r = validateOmegaHandlerResponse({ ...good, content: '   ' }, true)
      expect(r.passed).toBe(false)
      expect(r.violations.some((v) => v.includes('D1-I1'))).toBe(true)
    })

    it('D1-I2: fails when within_budget=false', () => {
      const r = validateOmegaHandlerResponse({ ...good, within_budget: false, latency_ms: 120000 }, true)
      expect(r.passed).toBe(false)
      expect(r.violations.some((v) => v.includes('D1-I2'))).toBe(true)
    })

    it('D1-I2: violation message includes latency value', () => {
      const r = validateOmegaHandlerResponse({ ...good, within_budget: false, latency_ms: 95000 }, true)
      expect(r.violations.find((v) => v.includes('D1-I2'))!).toContain('95000')
    })

    it('D1-I3: fails on empty provider_used', () => {
      const r = validateOmegaHandlerResponse({ ...good, provider_used: '' }, true)
      expect(r.passed).toBe(false)
      expect(r.violations.some((v) => v.includes('D1-I3'))).toBe(true)
    })

    it('D1-I3: fails on whitespace-only provider_used', () => {
      const r = validateOmegaHandlerResponse({ ...good, provider_used: '  ' }, true)
      expect(r.passed).toBe(false)
      expect(r.violations.some((v) => v.includes('D1-I3'))).toBe(true)
    })

    it('accumulates all 3 violations simultaneously', () => {
      const r = validateOmegaHandlerResponse(
        { ...good, is_empty: true, content: '', within_budget: false, latency_ms: 200000, provider_used: '' },
        true
      )
      expect(r.violations).toHaveLength(3)
    })

    it('exactly 2 violations when only D1-I1 and D1-I2 fail', () => {
      const r = validateOmegaHandlerResponse(
        { ...good, is_empty: true, content: '', within_budget: false, latency_ms: 200000 },
        true
      )
      expect(r.violations).toHaveLength(2)
    })
  })

  // ── getD1OmegaHandlerContract ─────────────────────────────────────────────
  describe('getD1OmegaHandlerContract', () => {
    it('returns lock=D1', () => {
      expect(getD1OmegaHandlerContract().lock).toBe('D1')
    })
    it('returns tier=T3', () => {
      expect(getD1OmegaHandlerContract().tier).toBe('T3')
    })
    it('flag_name is correct', () => {
      expect(getD1OmegaHandlerContract().flag_name).toBe('TITANE_D1_OMEGA_REAL_HANDLER')
    })
    it('handler_command=conversation_generate', () => {
      expect(getD1OmegaHandlerContract().handler_command).toBe('conversation_generate')
    })
    it('latency_budget_hard_cap_ms is 90000', () => {
      expect(getD1OmegaHandlerContract().latency_budget_hard_cap_ms).toBe(90000)
    })
    it('gaps_identified is 3', () => {
      expect(getD1OmegaHandlerContract().gaps_identified).toBe(3)
    })
    it('invariants_defined is 3', () => {
      expect(getD1OmegaHandlerContract().invariants_defined).toBe(3)
    })
    it('severity_critical is 1 (D1-G2 latency gap)', () => {
      expect(getD1OmegaHandlerContract().severity_critical).toBe(1)
    })
    it('flag_active reflects env', () => {
      // In test env VITE_TITANE_D1_OMEGA_REAL_HANDLER is not set → false
      expect(getD1OmegaHandlerContract().flag_active).toBe(OMEGA_D1_HANDLER_FLAG)
    })
  })
})
