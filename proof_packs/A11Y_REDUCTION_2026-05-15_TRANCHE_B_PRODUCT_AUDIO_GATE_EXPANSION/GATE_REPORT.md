# GATE REPORT

## Executed checks

1. `pnpm vitest run src/__tests__/a11y/WcagAggregateBaselineGuard.test.ts`
- Result: PASS
- Evidence: `Test Files 1 passed`, `Tests 1 passed`

2. `TITANE_E2E_REUSE_SERVER=1 pnpm exec playwright test e2e/a11y/wcag-aa-core.spec.ts --reporter=line`
- Result: PASS
- Evidence: `58 passed (3.1m)` and `[a11y:aggregate] blocking=0 baseline=3`

3. `bash scripts/autoheal/detect_recurrence.sh`
- Result: PASS

4. `bash scripts/verify_instructions.sh`
- Result: PASS

5. `pnpm verify:registry`
- Result: PASS

## Current classification

- Final: PASS (functional + governance gates complete)