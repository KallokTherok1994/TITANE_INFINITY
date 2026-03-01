# 04_OBSOLETE_FILES_REPORT

## Méthode
Classification B (Obsolète) basée sur:
- duplications de scripts
- scripts legacy non référencés dans `package.json`
- artefacts docs/ops historiques redondants

## Candidats B (obsolètes)
1. Scripts de build multiples redondants (`scripts/build/*.sh`, `scripts/build-fast.sh`, `scripts/build_optimized.sh`, `scripts/build_titane.sh`) sans chaîne canonique unique.
2. Variantes doublonnées (`final-validation.sh` vs `scripts/final-validation.sh`, `scripts/final_validation.sh`).
3. Variantes fix/auto-fix nombreuses et partiellement superposées (`scripts/fix_*`, `scripts/auto_fix.sh`, `scripts/auto-fix`).
4. Legacy documenté: dossier `legacy/` + `_archive/` + nombreux rapports historiques en racine.
5. Coexistence E2E multi-runner (Playwright + WebdriverIO outillage) à rationaliser selon autorité unique.

## Impact
- Charge cognitive élevée.
- Risque d’exécuter une mauvaise commande en production/dev.
- Dérive gouvernance (autorité outil ambiguë).

## Recommandation
- Définir un “script canonique” par fonction critique.
- Archiver scripts non canoniques sous `archive/<date>/scripts/` avec README de provenance.

## Preuves
- `proof_logs/phase2_inventory_hooks_scripts_entrypoints.log`
- `package.json`
