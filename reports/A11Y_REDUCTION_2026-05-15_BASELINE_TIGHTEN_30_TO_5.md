# A11Y Reduction — Baseline Tightening 30 -> 5 (2026-05-15)

## Scope

- Gate-only hardening on `e2e/a11y/wcag-aa-core.spec.ts`
- Added guard test `src/__tests__/a11y/WcagAggregateBaselineGuard.test.ts`
- Mapping/governance sync: `UI_SURFACE_MAP.md`, `docs/CARTOGRAPHY_COMPLETE.md`, `registry/ui-events.jsonl`, `scripts/autoheal/autoheal_rules.jsonl`

## Why this tranche

Wide probe over gate + extra candidate routes returned no blocking debt.

Evidence snapshot:

- `=== DIRTY ROUTES ===`
- `[]`

The previous aggregate baseline (`30`) left excessive slack against observed `blocking=0` state.

## Change

- `AGGREGATE_BLOCKING_BASELINE` tightened from `30` to `5`
- Added source guard asserting `= 5` and forbidding `= 30`

## Validation

1. `pnpm vitest run src/__tests__/a11y/WcagAggregateBaselineGuard.test.ts`
   - PASS: `1 passed`
2. `TITANE_E2E_REUSE_SERVER=1 npx playwright test e2e/a11y/wcag-aa-core.spec.ts --reporter=line`
   - PASS: `36 passed (1.8m)`
   - Aggregate line: `[a11y:aggregate] blocking=0 baseline=5`

## Governance gates

- `bash scripts/autoheal/detect_recurrence.sh` -> PASS (`entries=1986`)
- `bash scripts/verify_instructions.sh` -> PASS (`SUMMARY: PASS=52 FAIL=0`)
- `pnpm verify:registry` -> PASS (`registry-integrity: PASS`, `registry-quality: PASS`)

## Rollback

`git restore -- e2e/a11y/wcag-aa-core.spec.ts src/__tests__/a11y/WcagAggregateBaselineGuard.test.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl reports/A11Y_REDUCTION_2026-05-15_BASELINE_TIGHTEN_30_TO_5.md proof_packs/A11Y_REDUCTION_2026-05-15_BASELINE_TIGHTEN_30_TO_5`