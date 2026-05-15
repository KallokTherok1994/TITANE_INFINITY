# A11Y Reduction — 2026-05-15 — SurfaceTruthBadge PARTIAL contrast + Gate 32 → 33

## Contexte

Tranche autonome de réduction de la dette WCAG AA en mode DURABLE (Rule 19), commit phase Rule 18 direct-to-main. Surface ciblée : composant global `SurfaceTruthBadge` variante `PARTIAL` rendue sur `/htf` (et nombreuses pages PARTIAL : AdminPage, Nexus, Helios, TwinsPage, PerfectFusionDashboard, CognitivePage, EvoPage, AgendaPage, Harmonia).

## Symptôme runtime (Axe)

- Route : `/htf`
- Règle : `color-contrast` (impact `serious`)
- Combo fautif : `text-amber-300` (#fcd34d) sur fond blendé `#b0856a` (bg-amber-900/60 sur surface claire de la page)
- Ratio mesuré : ~2.26:1 (seuil AA texte normal : 4.5:1)

## Patch minimal

`src/components/system/SurfaceTruthBadge.tsx` — entrée `PARTIAL` du `BADGE_META` :

- avant : `colorClass: 'bg-amber-900/60 text-amber-300 border border-amber-700/50'`
- après : `colorClass: 'bg-amber-900 text-amber-100 border border-amber-700/50'`

Justification du choix :

- `bg-amber-900` opaque (#78350f) : élimine le bleed-through alpha responsable du contraste variable selon la page hôte.
- `text-amber-100` (#fef3c7) sur `bg-amber-900` ≈ 10:1 → AA large+normal sur 100% des pages où la badge global rend en `PARTIAL`.
- `border-amber-700/50` conservé : décoratif, n'impacte pas le contraste texte.
- Aucune autre variante (LIVE/FALLBACK/DEGRADED/SIMULATED/DISPLAY_ONLY/LEGACY/NOT_WIRED/ERROR/UNKNOWN) modifiée.
- `data-testid="surface-truth-badge-partial"` conservé : les suites existantes asservissent le testid, pas les classes Tailwind.

## Guard Vitest

`src/__tests__/components/system/SurfaceTruthBadgeA11yContrast.test.tsx` :

- Lit la source `SurfaceTruthBadge.tsx`, isole le bloc `PARTIAL`, puis isole la déclaration `colorClass:` afin d'autoriser la trace historique dans les commentaires.
- Affirme la présence de `bg-amber-900 text-amber-100 border border-amber-700/50`.
- Affirme l'absence des tokens fautifs `bg-amber-900/60` et `text-amber-300` dans la déclaration `colorClass`.
- Verdict : 1 passed (3 ms).

## Gate canonique Playwright

`e2e/a11y/wcag-aa-core.spec.ts` étendu de 32 à 33 routes (`/htf` ajouté en fin de liste), `expect(SURFACES.length).toBe(33)`, commentaire d'inventaire mis à jour.

- Run : `TITANE_E2E_REUSE_SERVER=1 npx playwright test e2e/a11y/wcag-aa-core.spec.ts --reporter=line`
- Résultat : `35 passed (1.8m)`
- `[a11y:htf] blocking=0 (c=0 s=0 m=0 mn=0)`
- `[a11y:aggregate] blocking=0 baseline=30`
- Inventory invariant : PASS.

## Validators

- `pnpm verify:registry` → PASS (voir GATE_REPORT)
- `bash scripts/autoheal/detect_recurrence.sh` → PASS
- `bash scripts/verify_instructions.sh` → PASS=52 FAIL=0

## Verdict

**PASS** — Tranche autonome A11y `SurfaceTruthBadge:PARTIAL` durcie, gate canonique étendu à 33 routes avec `blocking=0` et `aggregate baseline=30` intacte. AutoHeal `AH-2026-05-15-A11Y-SURFACE-TRUTH-BADGE-PARTIAL-CONTRAST-v35_1_7` ajouté (entrées=1984). Phase Rule 18 directe sur MAIN prête à committer.

## Rollback

`git restore -- src/components/system/SurfaceTruthBadge.tsx src/__tests__/components/system/SurfaceTruthBadgeA11yContrast.test.tsx e2e/a11y/wcag-aa-core.spec.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl reports/A11Y_REDUCTION_2026-05-15_SURFACE_TRUTH_BADGE_PARTIAL_GATE_EXPANSION.md proof_packs/A11Y_REDUCTION_2026-05-15_SURFACE_TRUTH_BADGE_PARTIAL_GATE_EXPANSION`
