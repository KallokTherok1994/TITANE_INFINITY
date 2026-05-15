# GATE REPORT

## Executed checks

1. `pnpm vitest run src/__tests__/a11y/WcagAggregateBaselineGuard.test.ts`
- Result: PASS
- Evidence: `Test Files 1 passed`, `Tests 1 passed`

2. `TITANE_E2E_REUSE_SERVER=1 npx playwright test e2e/a11y/wcag-aa-core.spec.ts --reporter=line`
- Result: PASS
- Evidence: `36 passed (1.8m)` and `[a11y:aggregate] blocking=0 baseline=5`

3. `bash scripts/autoheal/detect_recurrence.sh`
- Result: PASS
- Evidence: `PASS: G_AH_RECURRENCE_GUARD_PASS`, `entries=1986`

4. `bash scripts/verify_instructions.sh`
- Result: PASS
- Evidence: `SUMMARY: PASS=52 FAIL=0`

5. `pnpm verify:registry`
- Result: PASS
- Evidence: `registry-integrity: PASS`, `registry-quality: PASS`

## Current classification

- Final: PASS (functional + governance gates complete)