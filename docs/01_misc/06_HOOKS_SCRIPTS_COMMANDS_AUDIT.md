# 06_HOOKS_SCRIPTS_COMMANDS_AUDIT

## Hooks git
Détectés sous `.husky/`:
- hooks standards (`pre-commit`, `pre-push`, etc.)
- hooks custom (`pre-commit-autoheal`, `pre-commit-tauri-guard`)

Observation: présence de hooks auto-générés + custom, nécessite table d’autorité.

## Scripts npm/pnpm
- Scripts très nombreux dans `package.json` (dev/build/test/verify/audit/deploy/registry).
- Commandes critiques identifiées: `verify:*`, `test:*`, `build:tauri:e2e`, `build:production`.

## Scripts shell/python/js
- Inventaire large sous `scripts/**`.
- Plusieurs doublons fonctionnels (build/fix/finalize/deploy).

## CI workflows
- 46 workflows détectés dans `.github/workflows`.
- Risque de recouvrement fonctionnel (release/deploy/certification/maintenance).

## Commandes non référencées potentielles
- Multiples scripts présents sans référence explicite dans `package.json` (candidats archive).

## Recommandations
1. Déclarer une commande canonique par domaine (build, test, deploy, e2e).
2. Marquer scripts legacy “@deprecated + remplacement”.
3. Ajouter gate CI “script authority map”.

## Preuves
- `proof_logs/phase2_inventory_hooks_scripts_entrypoints.log`
- `package.json`
