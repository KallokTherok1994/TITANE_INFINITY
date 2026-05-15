# ROLLBACK

Command:

`git restore -- src/ui/pages/Skills/SkillManager.tsx src/ui/pages/Skills/__tests__/SkillManager.test.tsx e2e/a11y/wcag-aa-core.spec.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl reports/A11Y_REDUCTION_2026-05-15_SKILLS_GATE_EXPANSION.md proof_packs/A11Y_REDUCTION_2026-05-15_SKILLS_GATE_EXPANSION`

Expected rollback effect:
- Restaure l etat precedent de la surface `/skills`.
- Retire l extension du gate WCAG a `/skills`.
- Supprime le rapport et le proof pack de cette tranche.