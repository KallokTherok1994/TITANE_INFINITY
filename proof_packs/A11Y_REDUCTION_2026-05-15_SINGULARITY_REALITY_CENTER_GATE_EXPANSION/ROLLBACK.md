# ROLLBACK

Command:

`git restore -- src/pages/SingularityMonitor.tsx src/pages/RealityCenter.tsx src/__tests__/pages/SingularityMonitor.test.tsx src/__tests__/pages/RealityCenter.test.tsx e2e/a11y/wcag-aa-core.spec.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl reports/A11Y_REDUCTION_2026-05-15_SINGULARITY_REALITY_CENTER_GATE_EXPANSION.md proof_packs/A11Y_REDUCTION_2026-05-15_SINGULARITY_REALITY_CENTER_GATE_EXPANSION`

Expected rollback effect:
- Restaure l etat precedent des surfaces `/singularity` et `/reality-center`.
- Retire l extension du gate WCAG a ces deux routes.
- Supprime le rapport et le proof pack de cette tranche.