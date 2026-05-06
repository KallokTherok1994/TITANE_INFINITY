# D2 — Singularity Measured Layer — Architecture

**Lock:** D2  
**Super Prompt:** v13  
**Tier:** T2/T3  

## Scope

D2 defines the measurement framework for "singularity events" — moments where TITANE exhibits emergent intelligence beyond simple tool use.

## Event Types (5)

| Type | Description |
|------|-------------|
| `spontaneous_insight` | Insight not derivable from prompt alone |
| `cross_domain_synthesis` | Connecting unrelated knowledge domains |
| `unprompted_self_correction` | Self-correction without user prompting |
| `anticipatory_reasoning` | Predicting user need before stated |
| `meta_cognitive_commentary` | TITANE commenting on its own reasoning (D3 gate) |

## Intensity Levels (4)

| Level | Confidence Threshold |
|-------|---------------------|
| trace | ≥ 0.30 |
| notable | ≥ 0.50 |
| significant | ≥ 0.70 |
| landmark | ≥ 0.90 |

## Measurement Mode

- **Default:** `passive` — schema and measurement functions available, no active B2 emission
- **T3 flag:** `VITE_TITANE_D2_SINGULARITY_MEASURED` — enables base measurement
- **Emission flag:** `VITE_TITANE_D2_SINGULARITY_EMISSION_ACTIVE` — enables B2 push (default false)

## D2 v13 Sidecar Exports

| Export | Purpose |
|--------|---------|
| `D2_SELECTED_MEASUREMENT_TARGET` | `'OmegaTaskResult'` |
| `D2_MEASUREMENT_DEFAULT_MODE` | `'passive'` |
| `D2_MEASUREMENT_KNOWN_LIMITS` | 5 declared limits |
| `D2MeasurementModeSchema` | z.enum passive/shadow/active/disabled |
| `D2MeasurementAdapterSchema` | Full adapter contract |
| `getD2MeasurementAdapter()` | Factory |
| `validateSingularityMeasurement()` | 4-invariant validation |
| `isD2EmissionActive()` | Gate check |
| `buildPassiveMeasurementResult()` | Test/scaffold factory |
| `D2_OMEGA_TRACE_SCHEMA_CONTRACT` | B2 link declaration |
| `SINGULARITY_D2_EMISSION_ACTIVE` | Flag (default false) |

## Known Limits

1. passive-mode-only: T3 emission flag default=false — no active B2 push until enabled
2. no-rust-integration: singularity detection runs in TypeScript layer only
3. b2-observability-declared-not-active: B2 integration declared but emission path not live
4. no-landmark-auto-escalation: landmark events do not trigger automated actions
5. identity-event-blocked: meta_cognitive_commentary requires identity gate (D3)

## Test Coverage

69/69 Vitest PASS (51 base + 18 D2-UNIT-01..10 v13 sidecar)

## Invariants

| Invariant | Description |
|-----------|-------------|
| D2-I1 | active mode requires emission flag=true |
| D2-I2 | measured=true requires non-null event |
| D2-I3 | measured=false requires skipped_reason |
| D2-I4 | meta_cognitive_commentary blocked until D3 identity gate |

## Rollback

Feature flags both default=false. All exports are pure TypeScript schema/validation — zero runtime behavior change. Rollback = remove v13 sidecar lines from SingularityMeasuredLayerContract.ts.

## Next Lock

D3 — Twin Consent Ledger
