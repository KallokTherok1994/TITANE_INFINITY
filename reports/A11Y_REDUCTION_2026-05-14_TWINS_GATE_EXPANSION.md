# A11Y Reduction - Twins Gate Expansion - 2026-05-14

Verdict: PASS

Scope:
- `src/pages/TwinsPage.tsx`
- `src/__tests__/pages/TwinsPageA11yContrast.test.tsx`
- `e2e/a11y/wcag-aa-core.spec.ts`

Problem:
- `/twins` etait une surface canonique visible encore hors gate WCAG officiel.
- Axe detectait une violation `color-contrast` serieuse sur le libelle `Thèmes propriétaire`.

Root cause:
- Le libelle utilisait `text-gray-500` sur fond sombre avec ratio insuffisant.

Fix:
- Relever uniquement ce libelle vers `text-gray-300`.
- Ajouter un test Vitest dedie verrouillant le token de contraste.
- Etendre le gate Axe canonique de `21` a `22` routes avec ajout de `/twins`.

Executable proof:
- `pnpm vitest run src/__tests__/pages/TwinsPageA11yContrast.test.tsx`
  - `Test Files  1 passed (1)`
  - `Tests  1 passed (1)`
- `TITANE_E2E_USE_WEBSERVER=0 TITANE_E2E_HOST=127.0.0.1 TITANE_E2E_PORT=4173 pnpm exec playwright test e2e/a11y/wcag-aa-core.spec.ts --project=chromium`
  - `[a11y:twins] blocking=0 (c=0 s=0 m=0 mn=0)`
  - `[a11y:aggregate] blocking=0 baseline=30`
  - `24 passed`

Rollback:
- `git restore -- src/pages/TwinsPage.tsx src/__tests__/pages/TwinsPageA11yContrast.test.tsx e2e/a11y/wcag-aa-core.spec.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl reports/A11Y_REDUCTION_2026-05-14_TWINS_GATE_EXPANSION.md proof_packs/A11Y_REDUCTION_2026-05-14_TWINS_GATE_EXPANSION`