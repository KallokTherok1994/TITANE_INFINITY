# 04 Friction Map and Prioritization

Source: `raw/11_run1_metrics.json`

## Frictions

1. `FX-FOCUS-TABS-001`
   - Category: `FRICTION_ACCESSIBILITY_PERCEPTIBLE`
   - Criticality: `P1`
   - Surface: `titane-inline-tabs`
   - Symptom: no dedicated `:focus-visible` rule on tab buttons.
   - Impact: reduced keyboard focus discoverability/coherence.
   - Fixability: `SAFE_AUTO_FIX`.

## Priority Decision

- Dominant first fix = `FX-FOCUS-TABS-001`.
- No additional friction escalated above P2 after baseline.
