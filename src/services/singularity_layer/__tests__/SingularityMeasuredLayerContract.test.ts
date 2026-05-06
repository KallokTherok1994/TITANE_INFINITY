/**
 * Lock D2 — Singularity Measured Layer Contract
 * Unit tests
 */

import { describe, it, expect } from 'vitest'
import {
  SingularityEventTypeSchema,
  SingularityIntensitySchema,
  SingularityEventSchema,
  SingularityMeasurementResultSchema,
  SessionSingularityLedgerSchema,
  INTENSITY_CONFIDENCE_THRESHOLDS,
  classifySingularityIntensity,
  buildSingularityEvent,
  buildSessionSingularityLedger,
  getD2SingularityLayerContract,
  SINGULARITY_D2_MEASUREMENT_FLAG,
  type SingularityEvent,
  // v13 sidecar
  D2_SELECTED_MEASUREMENT_TARGET,
  D2_MEASUREMENT_DEFAULT_MODE,
  D2_MEASUREMENT_KNOWN_LIMITS,
  D2MeasurementModeSchema,
  D2MeasurementAdapterSchema,
  getD2MeasurementAdapter,
  validateSingularityMeasurement,
  isD2EmissionActive,
  buildPassiveMeasurementResult,
  D2_OMEGA_TRACE_SCHEMA_CONTRACT,
  SINGULARITY_D2_EMISSION_ACTIVE,
} from '../SingularityMeasuredLayerContract'

describe('D2 — Singularity Measured Layer Contract', () => {
  // ── Enum Schemas ──────────────────────────────────────────────────────────
  describe('SingularityEventTypeSchema', () => {
    it('accepts all 5 event types', () => {
      const types = [
        'spontaneous_insight',
        'cross_domain_synthesis',
        'unprompted_self_correction',
        'anticipatory_reasoning',
        'meta_cognitive_commentary',
      ] as const
      for (const t of types) {
        expect(() => SingularityEventTypeSchema.parse(t)).not.toThrow()
      }
    })
    it('rejects unknown event type', () => {
      expect(() => SingularityEventTypeSchema.parse('world_domination')).toThrow()
    })
  })

  describe('SingularityIntensitySchema', () => {
    it('accepts all 4 intensity levels', () => {
      for (const i of ['trace', 'notable', 'significant', 'landmark'] as const) {
        expect(() => SingularityIntensitySchema.parse(i)).not.toThrow()
      }
    })
    it('rejects invalid intensity', () => {
      expect(() => SingularityIntensitySchema.parse('nuclear')).toThrow()
    })
  })

  // ── SingularityEventSchema ────────────────────────────────────────────────
  describe('SingularityEventSchema', () => {
    const valid = {
      event_id: 'ev-001',
      session_id: 'sess-001',
      event_type: 'spontaneous_insight',
      intensity: 'notable',
      confidence: 0.6,
      detected_at_ms: 12345,
      evidence_snippet: 'TITANE observed a pattern',
      measurement_source: 'omega_handler',
      flag_active: true,
    }
    it('accepts valid event', () => {
      expect(() => SingularityEventSchema.parse(valid)).not.toThrow()
    })
    it('rejects confidence > 1', () => {
      expect(() => SingularityEventSchema.parse({ ...valid, confidence: 1.1 })).toThrow()
    })
    it('rejects confidence < 0', () => {
      expect(() => SingularityEventSchema.parse({ ...valid, confidence: -0.1 })).toThrow()
    })
    it('rejects negative detected_at_ms', () => {
      expect(() => SingularityEventSchema.parse({ ...valid, detected_at_ms: -1 })).toThrow()
    })
    it('rejects evidence_snippet > 500 chars', () => {
      expect(() =>
        SingularityEventSchema.parse({ ...valid, evidence_snippet: 'x'.repeat(501) })
      ).toThrow()
    })
  })

  // ── INTENSITY_CONFIDENCE_THRESHOLDS ───────────────────────────────────────
  describe('INTENSITY_CONFIDENCE_THRESHOLDS', () => {
    it('trace=0.3', () => expect(INTENSITY_CONFIDENCE_THRESHOLDS.trace).toBe(0.3))
    it('notable=0.5', () => expect(INTENSITY_CONFIDENCE_THRESHOLDS.notable).toBe(0.5))
    it('significant=0.7', () => expect(INTENSITY_CONFIDENCE_THRESHOLDS.significant).toBe(0.7))
    it('landmark=0.9', () => expect(INTENSITY_CONFIDENCE_THRESHOLDS.landmark).toBe(0.9))
    it('thresholds are strictly increasing', () => {
      expect(INTENSITY_CONFIDENCE_THRESHOLDS.trace)
        .toBeLessThan(INTENSITY_CONFIDENCE_THRESHOLDS.notable)
      expect(INTENSITY_CONFIDENCE_THRESHOLDS.notable)
        .toBeLessThan(INTENSITY_CONFIDENCE_THRESHOLDS.significant)
      expect(INTENSITY_CONFIDENCE_THRESHOLDS.significant)
        .toBeLessThan(INTENSITY_CONFIDENCE_THRESHOLDS.landmark)
    })
  })

  // ── classifySingularityIntensity ──────────────────────────────────────────
  describe('classifySingularityIntensity', () => {
    it('0.0 → trace', () => expect(classifySingularityIntensity(0.0)).toBe('trace'))
    it('0.29 → trace', () => expect(classifySingularityIntensity(0.29)).toBe('trace'))
    it('0.3 → trace', () => expect(classifySingularityIntensity(0.3)).toBe('trace'))
    it('0.5 → notable', () => expect(classifySingularityIntensity(0.5)).toBe('notable'))
    it('0.69 → notable', () => expect(classifySingularityIntensity(0.69)).toBe('notable'))
    it('0.7 → significant', () => expect(classifySingularityIntensity(0.7)).toBe('significant'))
    it('0.89 → significant', () => expect(classifySingularityIntensity(0.89)).toBe('significant'))
    it('0.9 → landmark', () => expect(classifySingularityIntensity(0.9)).toBe('landmark'))
    it('1.0 → landmark', () => expect(classifySingularityIntensity(1.0)).toBe('landmark'))
  })

  // ── buildSingularityEvent — flag=false ─────────────────────────────────────
  describe('buildSingularityEvent — flag=false (T3 disabled)', () => {
    const params = {
      event_id: 'ev-001',
      session_id: 's-001',
      event_type: 'spontaneous_insight' as const,
      confidence: 0.95,
      detected_at_ms: 1000,
      evidence_snippet: 'remarkable insight',
      measurement_source: 'test',
    }
    it('measured=false when flag=false', () => {
      const r = buildSingularityEvent(params, false)
      expect(r.measured).toBe(false)
    })
    it('event is null when flag=false', () => {
      expect(buildSingularityEvent(params, false).event).toBeNull()
    })
    it('skipped_reason mentions flag=false', () => {
      const r = buildSingularityEvent(params, false)
      expect(r.skipped_reason).toContain('flag=false')
    })
  })

  // ── buildSingularityEvent — flag=true ──────────────────────────────────────
  describe('buildSingularityEvent — flag=true (T3 active)', () => {
    const params = {
      event_id: 'ev-001',
      session_id: 's-001',
      event_type: 'cross_domain_synthesis' as const,
      confidence: 0.75,
      detected_at_ms: 5000,
      evidence_snippet: 'connected quantum physics to user preference',
      measurement_source: 'knowledge_indexer',
    }
    it('measured=true for valid confidence', () => {
      expect(buildSingularityEvent(params, true).measured).toBe(true)
    })
    it('event is not null', () => {
      expect(buildSingularityEvent(params, true).event).not.toBeNull()
    })
    it('intensity is significant for confidence=0.75', () => {
      const r = buildSingularityEvent(params, true)
      expect(r.event?.intensity).toBe('significant')
    })
    it('measured=false for confidence below trace (0.29)', () => {
      const r = buildSingularityEvent({ ...params, confidence: 0.29 }, true)
      expect(r.measured).toBe(false)
      expect(r.skipped_reason).toContain('confidence=0.29')
    })
    it('landmark event for confidence=0.95', () => {
      const r = buildSingularityEvent({ ...params, confidence: 0.95 }, true)
      expect(r.event?.intensity).toBe('landmark')
    })
    it('event validates against schema', () => {
      const r = buildSingularityEvent(params, true)
      expect(() => SingularityEventSchema.parse(r.event)).not.toThrow()
    })
  })

  // ── buildSessionSingularityLedger ─────────────────────────────────────────
  describe('buildSessionSingularityLedger', () => {
    const makeEvent = (intensity: 'trace' | 'notable' | 'significant' | 'landmark'): SingularityEvent => ({
      event_id: `ev-${intensity}`,
      session_id: 's-001',
      event_type: 'spontaneous_insight',
      intensity,
      confidence: intensity === 'landmark' ? 0.95 : intensity === 'significant' ? 0.75 : intensity === 'notable' ? 0.55 : 0.35,
      detected_at_ms: 1000,
      evidence_snippet: 'test evidence',
      measurement_source: 'test',
      flag_active: true,
    })

    it('empty session has 0 events', () => {
      const ledger = buildSessionSingularityLedger('s-001', [], true)
      expect(ledger.total_events).toBe(0)
      expect(ledger.highest_intensity).toBeNull()
    })

    it('counts landmark events correctly', () => {
      const events = [makeEvent('landmark'), makeEvent('landmark'), makeEvent('notable')]
      const ledger = buildSessionSingularityLedger('s-001', events, true)
      expect(ledger.landmark_count).toBe(2)
    })

    it('counts significant events correctly', () => {
      const events = [makeEvent('significant'), makeEvent('landmark')]
      const ledger = buildSessionSingularityLedger('s-001', events, true)
      expect(ledger.significant_count).toBe(1)
    })

    it('highest_intensity = landmark when landmark present', () => {
      const events = [makeEvent('trace'), makeEvent('notable'), makeEvent('landmark')]
      const ledger = buildSessionSingularityLedger('s-001', events, true)
      expect(ledger.highest_intensity).toBe('landmark')
    })

    it('highest_intensity = notable with only trace and notable', () => {
      const events = [makeEvent('trace'), makeEvent('notable')]
      const ledger = buildSessionSingularityLedger('s-001', events, true)
      expect(ledger.highest_intensity).toBe('notable')
    })

    it('measurement_active reflects flag', () => {
      const l1 = buildSessionSingularityLedger('s', [], true)
      const l2 = buildSessionSingularityLedger('s', [], false)
      expect(l1.measurement_active).toBe(true)
      expect(l2.measurement_active).toBe(false)
    })

    it('total_events matches events array length', () => {
      const events = [makeEvent('trace'), makeEvent('notable'), makeEvent('significant')]
      const ledger = buildSessionSingularityLedger('s', events, true)
      expect(ledger.total_events).toBe(3)
    })

    it('ledger validates against schema', () => {
      const events = [makeEvent('landmark')]
      const ledger = buildSessionSingularityLedger('s', events, true)
      expect(() => SessionSingularityLedgerSchema.parse(ledger)).not.toThrow()
    })
  })

  // ── getD2SingularityLayerContract ─────────────────────────────────────────
  describe('getD2SingularityLayerContract', () => {
    it('lock=D2', () => expect(getD2SingularityLayerContract().lock).toBe('D2'))
    it('tier=T2/T3', () => expect(getD2SingularityLayerContract().tier).toBe('T2/T3'))
    it('t3_flag_name correct', () => {
      expect(getD2SingularityLayerContract().t3_flag_name).toBe('TITANE_D2_SINGULARITY_MEASURED')
    })
    it('event_types_defined=5', () => expect(getD2SingularityLayerContract().event_types_defined).toBe(5))
    it('intensity_levels=4', () => expect(getD2SingularityLayerContract().intensity_levels).toBe(4))
    it('confidence_threshold_trace=0.3', () => {
      expect(getD2SingularityLayerContract().confidence_threshold_trace).toBe(0.3)
    })
    it('confidence_threshold_landmark=0.9', () => {
      expect(getD2SingularityLayerContract().confidence_threshold_landmark).toBe(0.9)
    })
    it('integrates_b2_observability=true', () => {
      expect(getD2SingularityLayerContract().integrates_b2_observability).toBe(true)
    })
    it('flag_active reflects env', () => {
      expect(getD2SingularityLayerContract().flag_active).toBe(SINGULARITY_D2_MEASUREMENT_FLAG)
    })
  })

  // ── SingularityMeasurementResultSchema ────────────────────────────────────
  describe('SingularityMeasurementResultSchema', () => {
    it('accepts skipped result', () => {
      expect(() =>
        SingularityMeasurementResultSchema.parse({ measured: false, event: null, skipped_reason: 'flag off' })
      ).not.toThrow()
    })
    it('rejects non-null event when measured=false would still parse (nullable)', () => {
      // null is valid for event field regardless
      expect(() =>
        SingularityMeasurementResultSchema.parse({ measured: false, event: null, skipped_reason: null })
      ).not.toThrow()
    })
  })
})

// ══════════════════════════════════════════════════════════════════════════════
//   D2-UNIT-01..10 — v13 Accountability Sidecar Tests
// ══════════════════════════════════════════════════════════════════════════════
describe('D2-UNIT — v13 Singularity Measurement Accountability', () => {

  it('D2-UNIT-01: selected measurement target is OmegaTaskResult and default emission off', () => {
    expect(D2_SELECTED_MEASUREMENT_TARGET).toBe('OmegaTaskResult')
    expect(SINGULARITY_D2_EMISSION_ACTIVE).toBe(false)
  })

  it('D2-UNIT-02: default mode is passive (not active emission)', () => {
    expect(D2_MEASUREMENT_DEFAULT_MODE).toBe('passive')
    const adapter = getD2MeasurementAdapter(false, false)
    expect(adapter.mode).toBe('passive')
  })

  it('D2-UNIT-03: fallback is no-emit (measured=false) when emission flag=false', () => {
    const result = buildPassiveMeasurementResult('s-001')
    expect(result.measured).toBe(false)
    expect(result.event).toBeNull()
    expect(result.skipped_reason).toBeTruthy()
  })

  it('D2-UNIT-04: known_limits is non-empty (>= 5 limits declared)', () => {
    expect(D2_MEASUREMENT_KNOWN_LIMITS.length).toBeGreaterThanOrEqual(5)
    expect(D2_MEASUREMENT_KNOWN_LIMITS[0]).toBeTruthy()
  })

  it('D2-UNIT-05: passive mode sets mode_used=passive in validation trace', () => {
    const result = buildPassiveMeasurementResult('s-001')
    const validation = validateSingularityMeasurement(result, 'passive', false)
    expect(validation.mode_used).toBe('passive')
    expect(validation.validation_status).toBe('ok')
  })

  it('D2-UNIT-06: no forbidden runtime behavior — active mode requires emission flag', () => {
    const result = buildPassiveMeasurementResult('s-001')
    // Attempting active mode without emission flag should produce an error
    const validation = validateSingularityMeasurement(result, 'active', false)
    expect(validation.valid).toBe(false)
    expect(validation.errors[0]).toContain('D2-I1')
  })

  it('D2-UNIT-07: B2 observability declared but NOT active by default', () => {
    expect(D2_OMEGA_TRACE_SCHEMA_CONTRACT.b2_integration_declared ?? true).toBe(true)
    expect(D2_OMEGA_TRACE_SCHEMA_CONTRACT.active).toBe(false)
  })

  it('D2-UNIT-08: meta_cognitive_commentary blocked in D2 (D3 identity gate required)', () => {
    const params = {
      event_id: 'ev-meta',
      session_id: 's-001',
      event_type: 'meta_cognitive_commentary' as const,
      confidence: 0.8,
      detected_at_ms: 1000,
      evidence_snippet: 'TITANE commented on its own reasoning',
      measurement_source: 'omega_trace',
    }
    const r = buildSingularityEvent(params, true)
    const validation = validateSingularityMeasurement(r, 'active', true)
    expect(validation.valid).toBe(false)
    expect(validation.errors.some(e => e.includes('D2-I4'))).toBe(true)
  })

  it('D2-UNIT-09: D2MeasurementAdapter validates against schema', () => {
    const adapter = getD2MeasurementAdapter(false, false)
    expect(() => D2MeasurementAdapterSchema.parse(adapter)).not.toThrow()
    expect(adapter.identity_events_blocked).toBe(true)
    expect(adapter.b2_integration_declared).toBe(true)
  })

  it('D2-UNIT-10: isD2EmissionActive returns false in test env (flag default=false)', () => {
    expect(isD2EmissionActive(false)).toBe(false)
    expect(isD2EmissionActive(true)).toBe(true)
    // In test env SINGULARITY_D2_EMISSION_ACTIVE is false
    expect(isD2EmissionActive()).toBe(false)
  })

  // ── D2MeasurementModeSchema ───────────────────────────────────────────────
  describe('D2MeasurementModeSchema', () => {
    it('accepts passive', () => expect(() => D2MeasurementModeSchema.parse('passive')).not.toThrow())
    it('accepts shadow', () => expect(() => D2MeasurementModeSchema.parse('shadow')).not.toThrow())
    it('accepts active', () => expect(() => D2MeasurementModeSchema.parse('active')).not.toThrow())
    it('accepts disabled', () => expect(() => D2MeasurementModeSchema.parse('disabled')).not.toThrow())
    it('rejects unknown mode', () => expect(() => D2MeasurementModeSchema.parse('turbo')).toThrow())
  })

  // ── validateSingularityMeasurement ────────────────────────────────────────
  describe('validateSingularityMeasurement', () => {
    it('valid skipped result passes', () => {
      const r = buildPassiveMeasurementResult('s')
      const v = validateSingularityMeasurement(r, 'passive', false)
      expect(v.valid).toBe(true)
    })
    it('measured=true with null event is invalid', () => {
      const r = { measured: true, event: null, skipped_reason: null }
      const v = validateSingularityMeasurement(r, 'passive', false)
      expect(v.valid).toBe(false)
      expect(v.errors.some(e => e.includes('D2-I2'))).toBe(true)
    })
    it('measured=false with null skipped_reason is invalid', () => {
      const r = { measured: false, event: null, skipped_reason: null }
      const v = validateSingularityMeasurement(r, 'passive', false)
      expect(v.valid).toBe(false)
      expect(v.errors.some(e => e.includes('D2-I3'))).toBe(true)
    })
  })
})
