# A11Y Reduction - Fusion + Evolution Gate Expansion - 2026-05-15

Verdict: PASS

Scope:
- `src/pages/PerfectFusionDashboard.tsx`
- `src/pages/EvolutionMonitor.tsx`
- `src/__tests__/pages/PerfectFusionDashboard.test.tsx`
- `src/__tests__/pages/EvolutionMonitor.test.tsx`
- `e2e/a11y/wcag-aa-core.spec.ts`

Problem:
- `/fusion` et `/evolution` etaient deux surfaces canoniques visibles hors gate WCAG officiel.
- Les probes Axe cibles confirmaient un cluster contraste local sur leurs meta-textes et badges secondaires.

Root cause:
- `PerfectFusionDashboard` gardait des `text-gray-500` et des badges d activite trop faibles dans la grille moteurs.
- `EvolutionMonitor` gardait plusieurs meta-labels `text-gray-500` sous le seuil dans les KPI, la timeline et le resume d etat/version.

Fix:
- Relever uniquement les textes secondaires et badges signales par Axe dans les deux pages.
- Ajouter des gardes Vitest locales sur les tokens corriges.
- Etendre le gate Axe canonique de 15 a 17 routes avec ajout de `/fusion` et `/evolution`.

Executable proof:
- `pnpm vitest run src/__tests__/pages/PerfectFusionDashboard.test.tsx src/__tests__/pages/EvolutionMonitor.test.tsx`
  - `Test Files  2 passed (2)`
  - `Tests  9 passed (9)`
- Probe Axe cible apres fix:
  - `/fusion -> blocking=0`
  - `/evolution -> blocking=0`
- `TITANE_E2E_USE_WEBSERVER=0 TITANE_E2E_HOST=127.0.0.1 TITANE_E2E_PORT=4173 pnpm exec playwright test e2e/a11y/wcag-aa-core.spec.ts --project=chromium`
  - `[a11y:fusion] blocking=0 (c=0 s=0 m=0 mn=0)`
  - `[a11y:evolution] blocking=0 (c=0 s=0 m=0 mn=0)`
  - `[a11y:aggregate] blocking=0 baseline=30`
  - `19 passed (1.1m)`

Rollback:
- `git restore -- src/pages/PerfectFusionDashboard.tsx src/pages/EvolutionMonitor.tsx src/__tests__/pages/PerfectFusionDashboard.test.tsx src/__tests__/pages/EvolutionMonitor.test.tsx e2e/a11y/wcag-aa-core.spec.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl reports/A11Y_REDUCTION_2026-05-15_FUSION_EVOLUTION_GATE_EXPANSION.md proof_packs/A11Y_REDUCTION_2026-05-15_FUSION_EVOLUTION_GATE_EXPANSION`