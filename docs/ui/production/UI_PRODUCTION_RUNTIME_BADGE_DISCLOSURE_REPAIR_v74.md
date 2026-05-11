# UI_PRODUCTION_RUNTIME_BADGE_DISCLOSURE_REPAIR_v74

Date: 2026-05-11
Mode: DURABLE

## Scope
- Runtime proof stabilization for production-route artifact generation.
- File touched:
  - e2e/production/ui-production-route-proof.spec.ts

## Root Cause
- The proof spec recorded route state immediately after `domcontentloaded` without waiting for lazy route roots or disclosure/badge markers.
- This produced false negatives (`rootFound=false`, `truthBadgeFound=false`) despite existing UI selectors.

## Fix Applied
- Added deterministic wait helpers in the Playwright spec:
  - wait for route root visibility with timeout;
  - wait for truth badge/disclosure selectors with bounded polling.
- Increased test timeout for full 29-route sweep and tuned per-route waits.

## Verification Evidence
1. `pnpm exec playwright test e2e/production/ui-production-route-proof.spec.ts --project chromium --workers=1`
   - Result: PASS (1 test passed)
2. `pnpm run verify:ui-production-route-proof`
   - Result: PASS
   - Summary: canonical 29/29, main menu 8/8, hidden 3/3, legacy 6/6, rows 35.

## Classification
- Verdict: PASS
- Risk after fix: low for false-negative route proof.
- Residual risk: runtime DOM/perf regressions can still impact future route capture if selectors or render lifecycle change.

## Rollback
- Revert only:
  - `e2e/production/ui-production-route-proof.spec.ts`
