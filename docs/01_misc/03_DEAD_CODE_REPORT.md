# 03_DEAD_CODE_REPORT

## Méthode
Classification A (Dead code) basée sur:
- marquages `deprecated`
- modules legacy explicitement remplacés
- points d’entrée/commentaires indiquant retrait partiel

## Items classifiés A (preuves)
1. `src-tauri/src/lib.rs` → `memory_compactor` (deprecated vers `unified_memory_v2::consolidate`).
2. `src-tauri/src/lib.rs` → `memory_persistence` (deprecated vers `unified_memory_v2::persistence`).
3. `src-tauri/src/lib.rs` → `memory_evolution` (deprecated, remplacé par `unified_memory_v2`).
4. `src-tauri/src/lib.rs` → `memory_os` (deprecated, API unifiée recommandée).
5. Segments migration invoke documentés mais non finalisés dans `src/services/api/index.ts` (guide de migration encore présent, dette de transition).

## Impact
- Surface maintenance inutile.
- Risque de divergence entre chemins legacy et chemins canoniques.

## Recommandation
- Déplacer modules legacy vers archive contrôlée puis retirer des exports actifs après vérification usages.
- Ajouter gate “no deprecated module export in prod path”.

## Références preuves
- `proof_logs/phase1_gates_scans.log`
- `proof_logs/phase3_metrics.log`
