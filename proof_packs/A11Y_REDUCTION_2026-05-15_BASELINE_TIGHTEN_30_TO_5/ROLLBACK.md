# ROLLBACK

## Single-step rollback

git restore -- e2e/a11y/wcag-aa-core.spec.ts src/__tests__/a11y/WcagAggregateBaselineGuard.test.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl reports/A11Y_REDUCTION_2026-05-15_BASELINE_TIGHTEN_30_TO_5.md proof_packs/A11Y_REDUCTION_2026-05-15_BASELINE_TIGHTEN_30_TO_5

## Expected rollback effect

- Baseline returns to previous value in canonical gate.
- Guard test and governance trace for this tranche are removed.