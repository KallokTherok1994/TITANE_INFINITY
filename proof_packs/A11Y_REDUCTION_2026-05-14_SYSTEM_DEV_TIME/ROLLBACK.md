# ROLLBACK

If the shell/footer + DEV/TIME a11y batch regresses, restore the entire slice with:

`git restore -- src/App.tsx src/pages/DevPage.tsx src/pages/TimePage.tsx src/__tests__/pages/DevPage.test.tsx src/__tests__/pages/TimePage.test.tsx UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl reports/A11Y_REDUCTION_2026-05-14_SYSTEM_DEV_TIME.md proof_packs/A11Y_REDUCTION_2026-05-14_SYSTEM_DEV_TIME`