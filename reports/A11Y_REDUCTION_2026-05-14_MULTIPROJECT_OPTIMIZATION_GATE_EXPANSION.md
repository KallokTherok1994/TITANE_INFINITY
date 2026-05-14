# A11Y Reduction - MultiProject + Optimization Gate Expansion - 2026-05-14

Verdict: PASS

Scope:
- `src/pages/MultiProjectDashboard.tsx`
- `src/pages/UltimateOptimizationDashboard.tsx`
- `src/__tests__/pages/MultiProjectDashboard.test.tsx`
- `src/__tests__/pages/UltimateOptimizationDashboard.test.tsx`
- `e2e/a11y/wcag-aa-core.spec.ts`

Problem:
- `/multiproject` et `/optimization` etaient deux surfaces canoniques visibles hors gate WCAG officiel.
- Les probes Axe cibles confirmaient un cluster contraste partage sur les textes secondaires et meta-informations, sans dette structurelle supplementaire.

Root cause:
- `MultiProjectDashboard` gardait des tokens `text-slate-500` trop faibles sur l etat vide, la liste d evidence et le sommaire d archivage.
- `UltimateOptimizationDashboard` gardait plusieurs labels et meta-textes `text-gray-400/500` sous le seuil sur fond sombre.

Fix:
- Relever uniquement les textes secondaires signalés par Axe dans les deux pages.
- Ajouter des gardes Vitest locales sur les tokens corriges.
- Étendre le gate Axe canonique de 13 a 15 routes avec ajout de `/multiproject` et `/optimization`.

Executable proof:
- `pnpm vitest run src/__tests__/pages/MultiProjectDashboard.test.tsx src/__tests__/pages/UltimateOptimizationDashboard.test.tsx`
  - `Test Files  2 passed (2)`
  - `Tests  7 passed (7)`
- Probe Axe cible apres fix:
  - `/multiproject -> blocking=0`
  - `/optimization -> blocking=0`
- `TITANE_E2E_USE_WEBSERVER=0 TITANE_E2E_HOST=127.0.0.1 TITANE_E2E_PORT=4173 pnpm exec playwright test e2e/a11y/wcag-aa-core.spec.ts --project=chromium`
  - `[a11y:multiproject] blocking=0 (c=0 s=0 m=0 mn=0)`
  - `[a11y:optimization] blocking=0 (c=0 s=0 m=0 mn=0)`
  - `[a11y:aggregate] blocking=0 baseline=30`
  - `17 passed (1.2m)`

Rollback:
- `git restore -- src/pages/MultiProjectDashboard.tsx src/pages/UltimateOptimizationDashboard.tsx src/__tests__/pages/MultiProjectDashboard.test.tsx src/__tests__/pages/UltimateOptimizationDashboard.test.tsx e2e/a11y/wcag-aa-core.spec.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl reports/A11Y_REDUCTION_2026-05-14_MULTIPROJECT_OPTIMIZATION_GATE_EXPANSION.md proof_packs/A11Y_REDUCTION_2026-05-14_MULTIPROJECT_OPTIMIZATION_GATE_EXPANSION`