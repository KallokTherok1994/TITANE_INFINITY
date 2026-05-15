# ROLLBACK PLAN

## Command

```bash
git restore -- e2e/a11y/wcag-aa-core.spec.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl reports/A11Y_REDUCTION_2026-05-14_CLEAN_BATCH_GATE_EXPANSION.md proof_packs/A11Y_REDUCTION_2026-05-14_CLEAN_BATCH_GATE_EXPANSION
```

## Expected state after rollback

- Canonical WCAG inventory returns to previous route set.
- Mapping and governance append-only traces for this tranche are removed.
- Worktree returns to pre-tranche state.
