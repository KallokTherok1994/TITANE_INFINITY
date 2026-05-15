# A11Y Reduction - Singularity + Reality Center Gate Expansion - 2026-05-15

Verdict: PASS

Scope:
- `src/pages/SingularityMonitor.tsx`
- `src/pages/RealityCenter.tsx`
- `src/__tests__/pages/SingularityMonitor.test.tsx`
- `src/__tests__/pages/RealityCenter.test.tsx`
- `e2e/a11y/wcag-aa-core.spec.ts`

Problem:
- `/singularity` et `/reality-center` etaient deux surfaces canoniques visibles encore hors gate WCAG officiel.
- Les probes Axe cibles confirmaient un cluster contraste local sur leurs meta-libelles secondaires.

Root cause:
- `SingularityMonitor` gardait des `text-gray-500` sous le seuil dans ses blocs energie, fatigue, homeostasie, historique et signature.
- `RealityCenter` gardait des `text-gray-500` sous le seuil dans la meta `Derniere mise a jour`, les KPI `modules`, les labels de sections, les en-tetes de table et plusieurs libelles infra.

Fix:
- Relever uniquement les textes secondaires signales par Axe dans les deux pages.
- Ajouter des gardes Vitest locales sur les tokens corriges.
- Etendre le gate Axe canonique de `17` a `19` routes avec ajout de `/singularity` et `/reality-center`.

Executable proof:
- `pnpm vitest run src/__tests__/pages/SingularityMonitor.test.tsx src/__tests__/pages/RealityCenter.test.tsx`
  - `Test Files  2 passed (2)`
  - `Tests  9 passed (9)`
- Probe Axe cible apres fix:
  - `/singularity -> blocking=0`
  - `/reality-center -> blocking=0`
- `TITANE_E2E_USE_WEBSERVER=0 TITANE_E2E_HOST=127.0.0.1 TITANE_E2E_PORT=4173 pnpm exec playwright test e2e/a11y/wcag-aa-core.spec.ts --project=chromium`
  - `[a11y:singularity] blocking=0 (c=0 s=0 m=0 mn=0)`
  - `[a11y:reality-center] blocking=0 (c=0 s=0 m=0 mn=0)`
  - `[a11y:aggregate] blocking=0 baseline=30`
  - `21 passed`

Rollback:
- `git restore -- src/pages/SingularityMonitor.tsx src/pages/RealityCenter.tsx src/__tests__/pages/SingularityMonitor.test.tsx src/__tests__/pages/RealityCenter.test.tsx e2e/a11y/wcag-aa-core.spec.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl reports/A11Y_REDUCTION_2026-05-15_SINGULARITY_REALITY_CENTER_GATE_EXPANSION.md proof_packs/A11Y_REDUCTION_2026-05-15_SINGULARITY_REALITY_CENTER_GATE_EXPANSION`