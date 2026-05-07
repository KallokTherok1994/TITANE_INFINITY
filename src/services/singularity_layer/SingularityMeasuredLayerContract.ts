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

import { z } from 'zod';

// ── Feature Flag ────────────────────────────────────────────────────────────────
export const SINGULARITY_D2_MEASUREMENT_FLAG =
  import.meta.env?.['VITE_TITANE_D2_SINGULARITY_MEASURED'] === 'true';

// ── Singularity Event Types ─────────────────────────────────────────────────────
export const SingularityEventTypeSchema = z.enum([
  'spontaneous_insight',
  'cross_domain_synthesis',
  'unprompted_self_correction',
  'anticipatory_reasoning',
  'meta_cognitive_commentary',
]);
export type SingularityEventType = z.infer<typeof SingularityEventTypeSchema>;

// ── Singularity Intensity ───────────────────────────────────────────────────────
export const SingularityIntensitySchema = z.enum([
  'trace',
  'notable',
  'significant',
  'landmark',
]);
export type SingularityIntensity = z.infer<typeof SingularityIntensitySchema>;

/** Minimum confidence required to classify each intensity level */
export const INTENSITY_CONFIDENCE_THRESHOLDS: Record<SingularityIntensity, number> = {
  trace: 0.3,
  notable: 0.5,
  significant: 0.7,
  landmark: 0.9,
};

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
});
export type SingularityEvent = z.infer<typeof SingularityEventSchema>;

// ── Singularity Measurement Result ─────────────────────────────────────────────
export const SingularityMeasurementResultSchema = z.object({
  measured: z.boolean(),
  event: SingularityEventSchema.nullable(),
  skipped_reason: z.string().nullable(),
});
export type SingularityMeasurementResult = z.infer<
  typeof SingularityMeasurementResultSchema
>;

// ── Session Singularity Ledger ──────────────────────────────────────────────────
export const SessionSingularityLedgerSchema = z.object({
  session_id: z.string(),
  events: z.array(SingularityEventSchema),
  total_events: z.number().min(0),
  landmark_count: z.number().min(0),
  significant_count: z.number().min(0),
  highest_intensity: SingularityIntensitySchema.nullable(),
  measurement_active: z.boolean(),
});
export type SessionSingularityLedger = z.infer<typeof SessionSingularityLedgerSchema>;

// ── Classify Intensity from Confidence ─────────────────────────────────────────
export function classifySingularityIntensity(confidence: number): SingularityIntensity {
  if (confidence >= INTENSITY_CONFIDENCE_THRESHOLDS.landmark) return 'landmark';
  if (confidence >= INTENSITY_CONFIDENCE_THRESHOLDS.significant) return 'significant';
  if (confidence >= INTENSITY_CONFIDENCE_THRESHOLDS.notable) return 'notable';
  return 'trace';
}

// ── Build Singularity Event (T3 flag-gated emission) ───────────────────────────
export function buildSingularityEvent(
  params: {
    event_id: string;
    session_id: string;
    event_type: SingularityEventType;
    confidence: number;
    detected_at_ms: number;
    evidence_snippet: string;
    measurement_source: string;
  },
  flagActive = SINGULARITY_D2_MEASUREMENT_FLAG
): SingularityMeasurementResult {
  if (!flagActive) {
    return {
      measured: false,
      event: null,
      skipped_reason: 'TITANE_D2_SINGULARITY_MEASURED flag=false',
    };
  }
  if (params.confidence < INTENSITY_CONFIDENCE_THRESHOLDS.trace) {
    return {
      measured: false,
      event: null,
      skipped_reason: `confidence=${params.confidence.toFixed(2)} below trace threshold (${INTENSITY_CONFIDENCE_THRESHOLDS.trace})`,
    };
  }
  const intensity = classifySingularityIntensity(params.confidence);
  const event: SingularityEvent = {
    ...params,
    intensity,
    flag_active: true,
  };
  return { measured: true, event, skipped_reason: null };
}

// ── Build Session Ledger ────────────────────────────────────────────────────────
export function buildSessionSingularityLedger(
  session_id: string,
  events: SingularityEvent[],
  flagActive = SINGULARITY_D2_MEASUREMENT_FLAG
): SessionSingularityLedger {
  const landmarkCount = events.filter(e => e.intensity === 'landmark').length;
  const significantCount = events.filter(e => e.intensity === 'significant').length;

  const intensityOrder: Record<SingularityIntensity, number> = {
    trace: 0,
    notable: 1,
    significant: 2,
    landmark: 3,
  };
  const highest: SingularityIntensity | null =
    events.length === 0
      ? null
      : events.reduce((best, e) =>
          intensityOrder[e.intensity] > intensityOrder[best.intensity] ? e : best
        ).intensity;

  return {
    session_id,
    events,
    total_events: events.length,
    landmark_count: landmarkCount,
    significant_count: significantCount,
    highest_intensity: highest,
    measurement_active: flagActive,
  };
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
});
export type D2SingularityLayerContract = z.infer<typeof D2SingularityLayerContractSchema>;

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
  };
}

// ══════════════════════════════════════════════════════════════════════════════
//   D2 v13 ACCOUNTABILITY SIDECAR
//   Super Prompt v13 — D2 normalization
//   Selected measurement target: OmegaTaskResult (Memory/Knowledge/Identity)
//   Default mode: passive (schema + measurement functions, no active emission)
//   T3 flag gates active emission to B2 observability layer
// ══════════════════════════════════════════════════════════════════════════════

// ── D2 Selected Measurement Target ─────────────────────────────────────────────
/** Primary target for D2 singularity measurement: OMEGA task result analysis */
export const D2_SELECTED_MEASUREMENT_TARGET = 'OmegaTaskResult' as const;

/** Default measurement mode (passive = schema available, no active emission) */
export type D2MeasurementMode = 'passive' | 'shadow' | 'active' | 'disabled';
export const D2MeasurementModeSchema = z.enum([
  'passive',
  'shadow',
  'active',
  'disabled',
]);

/** Default measurement mode — passive, no T3 flag required for schema access */
export const D2_MEASUREMENT_DEFAULT_MODE: D2MeasurementMode = 'passive';

/** T3 runtime emission flag — must be false in production until D3 is complete */
export const SINGULARITY_D2_EMISSION_ACTIVE =
  import.meta.env?.['VITE_TITANE_D2_SINGULARITY_EMISSION_ACTIVE'] === 'true';

/** Known limits for D2 singularity measurement (declared, not blocking) */
export const D2_MEASUREMENT_KNOWN_LIMITS: string[] = [
  'passive-mode-only: T3 emission flag default=false — no active B2 push until enabled',
  'no-rust-integration: singularity detection runs in TypeScript layer only',
  'b2-observability-declared-not-active: B2 integration contract exists but emission path not live',
  'no-landmark-auto-escalation: landmark events do not trigger automated actions',
  'identity-event-blocked: meta_cognitive_commentary requires identity gate (D3) before use',
];

// ── D2 Measurement Adapter Schema ───────────────────────────────────────────────
export const D2MeasurementAdapterSchema = z.object({
  measurement_target: z.literal('OmegaTaskResult'),
  mode: D2MeasurementModeSchema,
  flag_active: z.boolean(),
  emission_active: z.boolean(),
  known_limits: z.array(z.string()).min(1),
  b2_integration_declared: z.boolean(),
  identity_events_blocked: z.boolean(),
});
export type D2MeasurementAdapter = z.infer<typeof D2MeasurementAdapterSchema>;

export function getD2MeasurementAdapter(
  flagActive = SINGULARITY_D2_MEASUREMENT_FLAG,
  emissionActive = SINGULARITY_D2_EMISSION_ACTIVE
): D2MeasurementAdapter {
  return {
    measurement_target: 'OmegaTaskResult',
    mode: emissionActive ? 'active' : 'passive',
    flag_active: flagActive,
    emission_active: emissionActive,
    known_limits: D2_MEASUREMENT_KNOWN_LIMITS,
    b2_integration_declared: true,
    identity_events_blocked: true,
  };
}

// ── Validate Singularity Measurement (D2 invariants) ───────────────────────────
export interface D2MeasurementValidationResult {
  valid: boolean;
  errors: string[];
  mode_used: D2MeasurementMode;
  validation_status: 'ok' | 'error' | 'skipped';
}

export function validateSingularityMeasurement(
  result: SingularityMeasurementResult,
  mode: D2MeasurementMode = D2_MEASUREMENT_DEFAULT_MODE,
  emissionActive = SINGULARITY_D2_EMISSION_ACTIVE
): D2MeasurementValidationResult {
  const errors: string[] = [];

  // D2-I1: active emission requires emission flag
  if (mode === 'active' && !emissionActive) {
    errors.push(
      'D2-I1: active mode requires VITE_TITANE_D2_SINGULARITY_EMISSION_ACTIVE=true'
    );
  }

  // D2-I2: if measured=true, event must be non-null
  if (result.measured && result.event === null) {
    errors.push('D2-I2: measured=true requires non-null event');
  }

  // D2-I3: if measured=false, skipped_reason must be provided
  if (!result.measured && result.skipped_reason === null) {
    errors.push('D2-I3: measured=false requires skipped_reason');
  }

  // D2-I4: meta_cognitive_commentary requires identity gate (blocked in D2)
  if (result.event?.event_type === 'meta_cognitive_commentary') {
    errors.push('D2-I4: meta_cognitive_commentary blocked — requires D3 identity gate');
  }

  return {
    valid: errors.length === 0,
    errors,
    mode_used: mode,
    validation_status: errors.length === 0 ? 'ok' : 'error',
  };
}

/** Is D2 active emission live? Returns false in test env (emission flag default=false) */
export function isD2EmissionActive(
  emissionActive = SINGULARITY_D2_EMISSION_ACTIVE
): boolean {
  return emissionActive;
}

/** Build a passive measurement result (schema-only, no emission) — for tests / scaffold */
export function buildPassiveMeasurementResult(
  session_id: string,
  reason = 'D2 passive mode — emission flag=false'
): SingularityMeasurementResult {
  return {
    measured: false,
    event: null,
    skipped_reason: reason,
  };
}

/** D2 OMEGA trace schema contract — links measurement layer to B2 observability */
export const D2_OMEGA_TRACE_SCHEMA_VERSION = 'v2.0.0' as const;
export const D2_OMEGA_TRACE_SCHEMA_CONTRACT = {
  version: D2_OMEGA_TRACE_SCHEMA_VERSION,
  source_lock: 'D2',
  target_layer: 'B2_observability',
  emission_path: 'SingularityEvent → B2 IntelligenceObservabilityTrace',
  active: SINGULARITY_D2_EMISSION_ACTIVE,
} as const;
