# ROLLBACK

Command:

`git restore -- src/pages/Experience.tsx src/pages/__tests__/Experience.test.tsx e2e/a11y/wcag-aa-core.spec.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl reports/A11Y_REDUCTION_2026-05-14_EXPERIENCE_GATE_EXPANSION.md proof_packs/A11Y_REDUCTION_2026-05-14_EXPERIENCE_GATE_EXPANSION`

Expected rollback effect:
- Restaure le libelle runtime Experience avec son comportement precedent.
- Retire l extension du gate WCAG a `/experience`.
- Supprime le rapport et le proof pack de cette tranche.