# ROLLBACK

Command:

`git restore -- e2e/a11y/wcag-aa-core.spec.ts src/__tests__/ui/app-router-canonical-surfaces.test.tsx UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl reports/A11Y_REDUCTION_2026-05-15_WCAG_CANONICAL_ROUTE_ANTIDRIFT.md proof_packs/A11Y_REDUCTION_2026-05-15_WCAG_CANONICAL_ROUTE_ANTIDRIFT`

Expected rollback effect:
- Restaure l inventaire WCAG precedent utilisant les aliases legacy.
- Retire le verrou explicite de normalisation sur `/dashboard`, `/monitoring` et `/governance-center`.
- Supprime le rapport et le proof pack de cette tranche.