# ROLLBACK

Command:

`git restore -- src/pages/TotalDevPage.tsx src/pages/TotalDevPage.css src/__tests__/pages/TotalDevPage.test.tsx e2e/a11y/wcag-aa-core.spec.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl reports/A11Y_REDUCTION_2026-05-14_TOTAL_DEV_GATE_EXPANSION.md proof_packs/A11Y_REDUCTION_2026-05-14_TOTAL_DEV_GATE_EXPANSION`

Expected rollback effect:
- Restaure l etat precedent de la surface `/total-dev`.
- Retire l extension du gate WCAG a `/total-dev`.
- Supprime le rapport et le proof pack de cette tranche.