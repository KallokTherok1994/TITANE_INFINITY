# A11Y Reduction — Baseline Tightening 5 -> 3 (2026-05-15)

## Scope

- Gate-only hardening on `e2e/a11y/wcag-aa-core.spec.ts`
- Updated guard test `src/__tests__/a11y/WcagAggregateBaselineGuard.test.ts`
- Governance sync: `UI_SURFACE_MAP.md`, `docs/CARTOGRAPHY_COMPLETE.md`, `registry/ui-events.jsonl`, `scripts/autoheal/autoheal_rules.jsonl`

## Trigger

A second governed tranche confirmed the wide probe candidate set remained clean:

- `=== DIRTY ROUTES ===`
- `[]`

That allowed the canonical WCAG aggregate baseline to be tightened again without changing the route inventory.

## Change

- `AGGREGATE_BLOCKING_BASELINE` tightened from `5` to `3`
- Vitest guard updated to lock the new constant and reject both `5` and `30`

## Validation

- `pnpm vitest run src/__tests__/a11y/WcagAggregateBaselineGuard.test.ts`
  - PASS: `1 passed`
- `TITANE_E2E_REUSE_SERVER=1 npx playwright test e2e/a11y/wcag-aa-core.spec.ts --reporter=line`
  - PASS: `36 passed (1.8m)`
  - Aggregate line: `[a11y:aggregate] blocking=0 baseline=3`
- `bash scripts/autoheal/detect_recurrence.sh`
  - PASS: `PASS: G_AH_RECURRENCE_GUARD_PASS`, `entries=1986`
- `bash scripts/verify_instructions.sh`
  - PASS: `SUMMARY: PASS=52 FAIL=0`
- `pnpm verify:registry`
  - PASS: `registry-integrity: PASS`, `registry-quality: PASS`

## Rollback

`git restore -- e2e/a11y/wcag-aa-core.spec.ts src/__tests__/a11y/WcagAggregateBaselineGuard.test.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl reports/A11Y_REDUCTION_2026-05-15_BASELINE_TIGHTEN_5_TO_3.md proof_packs/A11Y_REDUCTION_2026-05-15_BASELINE_TIGHTEN_5_TO_3`
