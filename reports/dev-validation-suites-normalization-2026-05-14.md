# Dev Validation Suites Normalization — 2026-05-14

Verdict: PASS

Scope:
- `src/pages/DevPage.tsx`
- `src/__tests__/pages/DevPage.test.tsx`

Symptom closed:
- `/dev?tab=validation` crashed in browser capture with `TypeError: suites.map is not a function`.

Applied fix:
- Normalize the `listTestSuites()` payload before storing it in the `suites` state, accepting raw arrays, `content`, `suites`, and falling back to `[]` for degraded browser payloads.

Executable proof:
- `pnpm vitest run src/__tests__/pages/DevPage.test.tsx` → `Test Files 1 passed`, `Tests 5 passed`.
- `pnpm exec playwright test e2e/critical/ui-prod-capture-v34_0_6.spec.ts --grep 'capture dev-validation' --reporter=line` → `1 passed (10.8s)`.

Rollback:
- `git restore -- src/pages/DevPage.tsx src/__tests__/pages/DevPage.test.tsx UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl reports/dev-validation-suites-normalization-2026-05-14.md proof_packs/DEVPAGE_VALIDATION_SUITES_NORMALIZATION_2026-05-14_v35_1_5`
