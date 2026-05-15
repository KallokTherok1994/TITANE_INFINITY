# A11Y Reduction — Cloud Center CTA contrast hardening + gate expansion

**Date** : 2026-05-14
**Verdict** : PASS

## Scope

Réduction de dette accessibilité ciblée sur la surface canonique `/cloud` (CloudCenter) :

- Bouton CTA principal `.btn-primary` (`Initialiser le Cloud Sync` et autres CTA Cloud Sync) rendu à un contraste conforme AA, sans toucher au reste du Cloud Center.
- Gate WCAG canonique étendu de `22` à `23` routes critiques en intégrant `/cloud` au socle officiel.

## Problem

Axe `color-contrast` (serious) signalait sur `/cloud` :

- `<button class="btn-primary">Initialiser le Cloud Sync</button>` rendu avec `background-color: var(--cloud-accent)`, dont la chaîne de fallback se termine sur `#8899aa`. Avec `color: white`, le ratio mesuré ~3.2:1 < 4.5:1 (seuil AA texte normal sur fond).
- La variable `--accent-primary` n'est définie nulle part en CSS du repo, et `--info` est elle-même fixée à `#8899aa` dans `titane-fusion.css`. Le fallback final était donc systématiquement utilisé.

## Fix (minimal)

Patch unique dans [src/pages/CloudCenter/CloudCenter.css](src/pages/CloudCenter/CloudCenter.css), ajout après la règle existante `.btn-primary` :

```css
.cloud-center .btn-primary,
.cc-container .btn-primary {
  background: var(--accent-primary, #1d4ed8);
}
```

- Surcharge scoped au Cloud Center uniquement (sélecteur plus spécifique).
- Aucune mutation du token global `--cloud-accent` (le badge `status-syncing`, les hovers de bordures et autres usages restent identiques).
- `#1d4ed8` (Tailwind `blue-700`) donne ~8:1 contre blanc, largement au-dessus du seuil AA.

Test Vitest dédié : [src/__tests__/pages/CloudCenterA11yContrast.test.tsx](src/__tests__/pages/CloudCenterA11yContrast.test.tsx) — verrouille la présence de la règle scoped hardenée dans le fichier CSS, anti-régression strict.

Gate canonique : [e2e/a11y/wcag-aa-core.spec.ts](e2e/a11y/wcag-aa-core.spec.ts) — inventaire passe de 22 à 23 routes, ajout de `{ name: 'cloud', url: '/cloud' }`, invariant `expect(SURFACES.length).toBe(23)`.

## Executable proofs

- `pnpm vitest run src/__tests__/pages/CloudCenterA11yContrast.test.tsx` → `Test Files 1 passed (1) / Tests 1 passed (1)` (464ms).
- `pnpm vite build` → bundle reconstruit, `dist/assets/style-*.css` contient bien `.cloud-center .btn-primary,.cc-container .btn-primary{background:var(--accent-primary,#1d4ed8)}`.
- `TITANE_E2E_USE_WEBSERVER=0 TITANE_E2E_HOST=127.0.0.1 TITANE_E2E_PORT=4173 pnpm exec playwright test e2e/a11y/wcag-aa-core.spec.ts --project=chromium` → `25 passed (1.3m)`, log `[a11y:cloud] blocking=0 (c=0 s=0 m=0 mn=0)`, agrégat `[a11y:aggregate] blocking=0 baseline=30`.
- `pnpm verify:registry` → PASS.
- `bash scripts/autoheal/detect_recurrence.sh` → PASS.
- `bash scripts/verify_instructions.sh` → PASS.

## Rollback

```bash
git restore -- \
  src/pages/CloudCenter/CloudCenter.css \
  src/__tests__/pages/CloudCenterA11yContrast.test.tsx \
  e2e/a11y/wcag-aa-core.spec.ts \
  UI_SURFACE_MAP.md \
  docs/CARTOGRAPHY_COMPLETE.md \
  registry/ui-events.jsonl \
  scripts/autoheal/autoheal_rules.jsonl \
  reports/A11Y_REDUCTION_2026-05-14_CLOUD_GATE_EXPANSION.md \
  proof_packs/A11Y_REDUCTION_2026-05-14_CLOUD_GATE_EXPANSION
```
