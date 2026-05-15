# A11Y Reduction - WCAG Canonical Route Anti-Drift - 2026-05-15

Verdict: PASS

Scope:
- `e2e/a11y/wcag-aa-core.spec.ts`
- `src/__tests__/ui/app-router-canonical-surfaces.test.tsx`

Problem:
- Le gate WCAG officiel audite encore trois aliases historiques: `/dashboard`, `/monitoring`, `/governance-center`.
- Ces URLs redirigent bien vers des surfaces actives, mais la preuve a11y ne reflète donc pas directement la vérité runtime canonique.

Root cause:
- L inventaire Playwright n avait pas été réaligné après la consolidation AppRouter des routes legacy vers `/titane`, `/dev?tab=diagnostics` et `/admin?tab=governance`.
- Le test AppRouter canonique ne verrouillait pas explicitement ces trois normalisations legacy.

Fix:
- Remplacer dans le gate WCAG `dashboard`, `monitoring`, `governance-center` par `titane-home`, `dev-diagnostics`, `admin-governance` et leurs URLs canoniques.
- Ajouter dans le test AppRouter la normalisation de `/dashboard`, `/monitoring` et `/governance-center` vers leurs cibles canoniques.

Executable proof:
- `pnpm vitest run src/__tests__/ui/app-router-canonical-surfaces.test.tsx`
  - `Test Files  1 passed (1)`
  - `Tests  61 passed (61)`
  - `✓ normalizes /dashboard to /titane`
  - `✓ normalizes /monitoring to /dev?tab=diagnostics`
  - `✓ normalizes /governance-center to /admin?tab=governance`
- `TITANE_E2E_USE_WEBSERVER=0 TITANE_E2E_HOST=127.0.0.1 TITANE_E2E_PORT=4173 pnpm exec playwright test e2e/a11y/wcag-aa-core.spec.ts --project=chromium`
  - `[a11y:titane-home] blocking=0 (c=0 s=0 m=0 mn=0)`
  - `[a11y:admin-governance] blocking=0 (c=0 s=0 m=0 mn=0)`
  - `[a11y:dev-diagnostics] blocking=0 (c=0 s=0 m=0 mn=0)`
  - `[a11y:aggregate] blocking=0 baseline=30`
  - `17 passed (1.1m)`

Rollback:
- `git restore -- e2e/a11y/wcag-aa-core.spec.ts src/__tests__/ui/app-router-canonical-surfaces.test.tsx UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl reports/A11Y_REDUCTION_2026-05-15_WCAG_CANONICAL_ROUTE_ANTIDRIFT.md proof_packs/A11Y_REDUCTION_2026-05-15_WCAG_CANONICAL_ROUTE_ANTIDRIFT`