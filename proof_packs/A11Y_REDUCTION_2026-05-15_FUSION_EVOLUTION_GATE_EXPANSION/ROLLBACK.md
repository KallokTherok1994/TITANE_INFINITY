# ROLLBACK

Command:

`git restore -- src/pages/PerfectFusionDashboard.tsx src/pages/EvolutionMonitor.tsx src/__tests__/pages/PerfectFusionDashboard.test.tsx src/__tests__/pages/EvolutionMonitor.test.tsx e2e/a11y/wcag-aa-core.spec.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl reports/A11Y_REDUCTION_2026-05-15_FUSION_EVOLUTION_GATE_EXPANSION.md proof_packs/A11Y_REDUCTION_2026-05-15_FUSION_EVOLUTION_GATE_EXPANSION`

Expected rollback effect:
- Restaure l etat precedent des surfaces `/fusion` et `/evolution`.
- Retire l extension du gate WCAG a ces deux routes.
- Supprime le rapport et le proof pack de cette tranche.