# A11Y Reduction — Tranche B Product/Audio Gate Expansion (2026-05-15)

## Scope

- Inventory-only expansion in `e2e/a11y/wcag-aa-core.spec.ts`
- Canonical gate expanded from 44 to 56 routes (+12 product/audio routes)
- No UI source patch in `src/**` for this tranche

## Added routes

- `/agenda`
- `/cognitive`
- `/evo`
- `/harmonia`
- `/helios`
- `/nexus`
- `/psyche`
- `/cosmic`
- `/audio-center`
- `/persistent-memory`
- `/voice`
- `/audio`

## Validation evidence

1. `pnpm vitest run src/__tests__/a11y/WcagAggregateBaselineGuard.test.ts`
- PASS: `1 passed`

2. `TITANE_E2E_REUSE_SERVER=1 pnpm exec playwright test e2e/a11y/wcag-aa-core.spec.ts --reporter=line`
- PASS: `58 passed (3.1m)`
- All newly added routes report `blocking=0`
- Aggregate line: `[a11y:aggregate] blocking=0 baseline=3`

3. Governance gates
- `bash scripts/autoheal/detect_recurrence.sh` -> PASS
- `bash scripts/verify_instructions.sh` -> PASS
- `pnpm verify:registry` -> PASS

## Rollback

`git restore -- e2e/a11y/wcag-aa-core.spec.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl reports/A11Y_REDUCTION_2026-05-15_TRANCHE_B_PRODUCT_AUDIO_GATE_EXPANSION.md proof_packs/A11Y_REDUCTION_2026-05-15_TRANCHE_B_PRODUCT_AUDIO_GATE_EXPANSION`