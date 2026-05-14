# A11Y Reduction - Experience Contrast + Gate Expansion - 2026-05-14

Verdict: PASS

Scope:
- `src/pages/Experience.tsx`
- `src/pages/__tests__/Experience.test.tsx`
- `e2e/a11y/wcag-aa-core.spec.ts`

Problem:
- `/experience` etait une surface canonique visible hors gate WCAG officiel.
- Un probe Axe cible a confirme une violation bloquante unique `color-contrast` sur `experience-runtime-source`.

Root cause:
- Le libelle runtime secondaire utilisait `opacity: 0.6` sur fond sombre, pour un contraste mesure a 3.43:1.

Fix:
- Remplacement de l opacite par une couleur explicite `rgb(191, 199, 210)` dans le libelle runtime.
- Ajout d une garde Vitest sur la couleur du libelle runtime.
- Extension du gate Axe canonique de 10 a 11 routes avec ajout de `/experience`.

Executable proof:
- `pnpm vitest run src/pages/__tests__/Experience.test.tsx`
  - `Test Files  1 passed (1)`
  - `Tests  2 passed (2)`
- Probe Axe cible avant fix:
  - `blocking=1`
  - `id=color-contrast`
  - `target=.exp-source-label`
- Probe Axe cible apres fix:
  - `blocking=0`
- `TITANE_E2E_USE_WEBSERVER=0 TITANE_E2E_HOST=127.0.0.1 TITANE_E2E_PORT=4173 pnpm exec playwright test e2e/a11y/wcag-aa-core.spec.ts --project=chromium`
  - `[a11y:experience] blocking=0 (c=0 s=0 m=0 mn=0)`
  - `[a11y:aggregate] blocking=0 baseline=30`
  - `13 passed (53.1s)`

Rollback:
- `git restore -- src/pages/Experience.tsx src/pages/__tests__/Experience.test.tsx e2e/a11y/wcag-aa-core.spec.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl reports/A11Y_REDUCTION_2026-05-14_EXPERIENCE_GATE_EXPANSION.md proof_packs/A11Y_REDUCTION_2026-05-14_EXPERIENCE_GATE_EXPANSION`