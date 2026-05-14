# A11Y Reduction - TotalDev Focus + Gate Expansion - 2026-05-14

Verdict: PASS

Scope:
- `src/pages/TotalDevPage.tsx`
- `src/pages/TotalDevPage.css`
- `src/__tests__/pages/TotalDevPage.test.tsx`
- `e2e/a11y/wcag-aa-core.spec.ts`

Problem:
- `/total-dev` etait une surface canonique visible hors gate WCAG officiel.
- Un scan large puis un probe Axe cible ont confirme 2 violations sérieuses: `color-contrast` et `scrollable-region-focusable`.

Root cause:
- Des tokens secondaires de contraste etaient trop faibles sur fond sombre (`unlock-hint`, meta chat, footer).
- L historique chat `total-dev-chat-messages` etait scrollable mais non focusable au clavier.

Fix:
- Relever uniquement les couleurs des tokens concernés dans `TotalDevPage.css`.
- Rendre `total-dev-chat-messages` focusable et nommee avec `tabIndex=0`, `aria-label` et un `data-testid` stable.
- Ajouter une garde Vitest ciblée sur ce conteneur.
- Étendre le gate Axe canonique de 11 a 12 routes avec ajout de `/total-dev`.

Executable proof:
- `pnpm vitest run src/__tests__/pages/TotalDevPage.test.tsx`
  - `Test Files  1 passed (1)`
  - `Tests  4 passed (4)`
- Probe Axe cible apres fix:
  - `route=/total-dev`
  - `blocking=0`
- `TITANE_E2E_USE_WEBSERVER=0 TITANE_E2E_HOST=127.0.0.1 TITANE_E2E_PORT=4173 pnpm exec playwright test e2e/a11y/wcag-aa-core.spec.ts --project=chromium`
  - `[a11y:total-dev] blocking=0 (c=0 s=0 m=0 mn=0)`
  - `[a11y:aggregate] blocking=0 baseline=30`
  - `14 passed (53.9s)`

Rollback:
- `git restore -- src/pages/TotalDevPage.tsx src/pages/TotalDevPage.css src/__tests__/pages/TotalDevPage.test.tsx e2e/a11y/wcag-aa-core.spec.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl reports/A11Y_REDUCTION_2026-05-14_TOTAL_DEV_GATE_EXPANSION.md proof_packs/A11Y_REDUCTION_2026-05-14_TOTAL_DEV_GATE_EXPANSION`