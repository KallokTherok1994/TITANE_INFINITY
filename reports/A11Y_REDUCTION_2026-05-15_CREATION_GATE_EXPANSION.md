# A11Y Reduction - Creation Studio Gate Expansion - 2026-05-15

Verdict: PASS

Scope:
- `src/pages/CreationStudio.tsx`
- `src/__tests__/pages/CreationStudio.test.tsx`
- `e2e/a11y/wcag-aa-core.spec.ts`

Problem:
- `/creation` etait une surface canonique visible encore hors gate WCAG officiel.
- Un diagnostic Axe cible montrait un cluster contraste local sur des meta-libelles secondaires.

Root cause:
- `CreationStudio` gardait des `text-gray-500` sous le seuil sur `Outils de création`, `Studio actif` et `Statistiques`.

Fix:
- Relever uniquement ces trois libelles de `text-gray-500` vers `text-gray-300`.
- Ajouter un garde Vitest ciblé sur ces classes.
- Etendre le gate Axe canonique de `19` a `20` routes avec ajout de `/creation`.

Executable proof:
- `pnpm vitest run src/__tests__/pages/CreationStudio.test.tsx`
  - `Test Files  1 passed (1)`
  - `Tests  4 passed (4)`
- `TITANE_E2E_USE_WEBSERVER=0 TITANE_E2E_HOST=127.0.0.1 TITANE_E2E_PORT=4173 pnpm exec playwright test e2e/a11y/wcag-aa-core.spec.ts --project=chromium`
  - `[a11y:creation] blocking=0 (c=0 s=0 m=0 mn=0)`
  - `[a11y:aggregate] blocking=0 baseline=30`
  - `22 passed`

Rollback:
- `git restore -- src/pages/CreationStudio.tsx src/__tests__/pages/CreationStudio.test.tsx e2e/a11y/wcag-aa-core.spec.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl reports/A11Y_REDUCTION_2026-05-15_CREATION_GATE_EXPANSION.md proof_packs/A11Y_REDUCTION_2026-05-15_CREATION_GATE_EXPANSION`