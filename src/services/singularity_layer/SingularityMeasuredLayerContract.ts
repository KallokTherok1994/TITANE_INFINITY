/**
 * TITANE∞ — Singularity Measured Layer Contract
 * Lock D2 — T2/T3 bounded
 *
 * Defines the measurement framework for "singularity events" — moments where
 * TITANE exhibits emergent intelligence beyond simple tool use:
 * - Spontaneous insight generation (insight not derivable from prompt alone)
 * - Cross-domain synthesis (connecting unrelated knowledge domains)
 * - Self-correction without prompting
 * - Anticipatory reasoning (predicting user need before stated)
 * - Meta-cognitive commentary (TITANE commenting on its own reasoning)
 *
 * T2: Contract definitions, schemas, measurement functions (no flag needed)
 * T3: Runtime instrumentation flag-gated: TITANE_D2_SINGULARITY_MEASURED
 *
 * When T3 flag=false: contract available but no runtime emission
 * When T3 flag=true: singularity events are measured and emitted to observability layer (B2)
 */

import { z } from 'zod'

// ── Feature Flag ────────────────────────────────────────────────────────────────
export const SINGULARITY_D2_MEASUREMENT_FLAG =
  typeof import.meta !== 'undefined' &&
  (import.meta as Record<string, unknown>).env !== undefined
    ? String((import.meta as Record<string, Record<string, unknown>>).env['VITE_TITANE_D2_SINGULARITY_MEASURED'] ?? 'false') === 'true'
    : false

// ── Singularity Event Types ─────────────────────────────────────────────────────
export const SingularityEventTypeSchema = z.enum([
  'spontaneous_insight',
  'cross_domain_synthesis',
  'unprompted_self_correction',
  'anticipatory_reasoning',
  'meta_cognitive_commentary',
])
export type SingularityEventType = z.infer<typeof SingularityEventTypeSchema>

// ── Singularity Intensity ───────────────────────────────────────────────────────
export const SingularityIntensitySchema = z.enum(['trace', 'notable', 'significant', 'landmark'])
export type SingularityIntensity = z.infer<typeof SingularityIntensitySchema>

/** Minimum confidence required to classify each intensity level */
export const INTENSITY_CONFIDENCE_THRESHOLDS: Record<SingularityIntensity, number> = {
  trace: 0.3,
  notable: 0.5,
  significant: 0.7,
  landmark: 0.9,
}

// ── Singularity Event Schema ────────────────────────────────────────────────────
export const SingularityEventSchema = z.object({
  event_id: z.string(),
  session_id: z.string(),
  event_type: SingularityEventTypeSchema,
  intensity: SingularityIntensitySchema,
  confidence: z.number().min(0).max(1),
  detected_at_ms: z.number().min(0),
  evidence_snippet: z.string().max(500).describe('Brief excerpt triggering detection'),
  measurement_source: z.string().describe('Component or path that measured this event'),
  flag_active: z.boolean(),
})
export type SingularityEvent = z.infer<typeof SingularityEventSchema>

// ── Singularity Measurement Result ─────────────────────────────────────────────
export const SingularityMeasurementResultSchema = z.object({
  measured: z.boolean(),
  event: SingularityEventSchema.nullable(),
  skipped_reason: z.string().nullable(),
})
export type SingularityMeasurementResult = z.infer<typeof SingularityMeasurementResultSchema>

// ── Session Singularity Ledger ──────────────────────────────────────────────────
export const SessionSingularityLedgerSchema = z.object({
  session_id: z.string(),
  events: z.array(SingularityEventSchema),
  total_events: z.number().min(0),
  landmark_count: z.number().min(0),
  significant_count: z.number().min(0),
  highest_intensity: SingularityIntensitySchema.nullable(),
  measurement_active: z.boolean(),
})
export type SessionSingularityLedger = z.infer<typeof SessionSingularityLedgerSchema>

// ── Classify Intensity from Confidence ─────────────────────────────────────────
export function classifySingularityIntensity(confidence: number): SingularityIntensity {
  if (confidence >= INTENSITY_CONFIDENCE_THRESHOLDS.landmark) return 'landmark'
  if (confidence >= INTENSITY_CONFIDENCE_THRESHOLDS.significant) return 'significant'
  if (confidence >= INTENSITY_CONFIDENCE_THRESHOLDS.notable) return 'notable'
  return 'trace'
}

// ── Build Singularity Event (T3 flag-gated emission) ───────────────────────────
export function buildSingularityEvent(
  params: {
    event_id: string
    session_id: string
    event_type: SingularityEventType
    confidence: number
    detected_at_ms: number
    evidence_snippet: string
    measurement_source: string
  },
  flagActive = SINGULARITY_D2_MEASUREMENT_FLAG,
): SingularityMeasurementResult {
  if (!flagActive) {
    return { measured: false, event: null, skipped_reason: 'TITANE_D2_SINGULARITY_MEASURED flag=false' }
  }
  if (params.confidence < INTENSITY_CONFIDENCE_THRESHOLDS.trace) {
    return {
      measured: false,
      event: null,
      skipped_reason: `confidence=${params.confidence.toFixed(2)} below trace threshold (${INTENSITY_CONFIDENCE_THRESHOLDS.trace})`,
    }
  }
  const intensity = classifySingularityIntensity(params.confidence)
  const event: SingularityEvent = {
    ...params,
    intensity,
    flag_active: true,
  }
  return { measured: true, event, skipped_reason: null }
}

// ── Build Session Ledger ────────────────────────────────────────────────────────
export function buildSessionSingularityLedger(
  session_id: string,
  events: SingularityEvent[],
  flagActive = SINGULARITY_D2_MEASUREMENT_FLAG,
): SessionSingularityLedger {
  const landmarkCount = events.filter((e) => e.intensity === 'landmark').length
  const significantCount = events.filter((e) => e.intensity === 'significant').length

  const intensityOrder: Record<SingularityIntensity, number> = {
    trace: 0,
    notable: 1,
    significant: 2,
    landmark: 3,
  }
  const highest: SingularityIntensity | null =
    events.length === 0
      ? null
      : events.reduce((best, e) =>
          intensityOrder[e.intensity] > intensityOrder[best.intensity] ? e : best
        ).intensity

  return {
    session_id,
    events,
    total_events: events.length,
    landmark_count: landmarkCount,
    significant_count: significantCount,
    highest_intensity: highest,
    measurement_active: flagActive,
  }
}

// ── D2 Contract ─────────────────────────────────────────────────────────────────
export const D2SingularityLayerContractSchema = z.object({
  lock: z.literal('D2'),
  tier: z.literal('T2/T3'),
  t3_flag_name: z.literal('TITANE_D2_SINGULARITY_MEASURED'),
  flag_active: z.boolean(),
  event_types_defined: z.number(),
  intensity_levels: z.number(),
  confidence_threshold_trace: z.number(),
  confidence_threshold_landmark: z.number(),
  integrates_b2_observability: z.boolean(),
})
export type D2SingularityLayerContract = z.infer<typeof D2SingularityLayerContractSchema>

export function getD2SingularityLayerContract(): D2SingularityLayerContract {
  return {
    lock: 'D2',
    tier: 'T2/T3',
    t3_flag_name: 'TITANE_D2_SINGULARITY_MEASURED',
    flag_active: SINGULARITY_D2_MEASUREMENT_FLAG,
    event_types_defined: 5,
    intensity_levels: 4,
    confidence_threshold_trace: INTENSITY_CONFIDENCE_THRESHOLDS.trace,
    confidence_threshold_landmark: INTENSITY_CONFIDENCE_THRESHOLDS.landmark,
    integrates_b2_observability: true,
  }
}
