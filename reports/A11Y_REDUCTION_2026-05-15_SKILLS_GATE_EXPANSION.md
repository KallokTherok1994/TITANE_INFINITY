# A11Y Reduction - Skills Gate Expansion - 2026-05-15

Verdict: PASS

Scope:
- `src/ui/pages/Skills/SkillManager.tsx`
- `src/ui/pages/Skills/__tests__/SkillManager.test.tsx`
- `e2e/a11y/wcag-aa-core.spec.ts`

Problem:
- `/skills` etait une surface canonique visible encore hors gate WCAG officiel.
- Axe detectait une violation `color-contrast` serieuse sur le bouton principal `+ Importer une Skill`.

Root cause:
- Le bouton utilisait le fond `#6366f1` avec texte blanc, ratio insuffisant pour le seuil AA a la taille du texte.

Fix:
- Relever uniquement le fond de ce bouton vers `#4f46e5`.
- Ajouter un test Vitest dedie verrouillant ce token de contraste.
- Etendre le gate Axe canonique de `20` a `21` routes avec ajout de `/skills`.

Executable proof:
- `pnpm vitest run src/ui/pages/Skills/__tests__/SkillManager.test.tsx`
  - `Test Files  1 passed (1)`
  - `Tests  2 passed (2)`
- `TITANE_E2E_USE_WEBSERVER=0 TITANE_E2E_HOST=127.0.0.1 TITANE_E2E_PORT=4173 pnpm exec playwright test e2e/a11y/wcag-aa-core.spec.ts --project=chromium`
  - `[a11y:skills] blocking=0 (c=0 s=0 m=0 mn=0)`
  - `[a11y:aggregate] blocking=0 baseline=30`
  - `23 passed`

Rollback:
- `git restore -- src/ui/pages/Skills/SkillManager.tsx src/ui/pages/Skills/__tests__/SkillManager.test.tsx e2e/a11y/wcag-aa-core.spec.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl reports/A11Y_REDUCTION_2026-05-15_SKILLS_GATE_EXPANSION.md proof_packs/A11Y_REDUCTION_2026-05-15_SKILLS_GATE_EXPANSION`