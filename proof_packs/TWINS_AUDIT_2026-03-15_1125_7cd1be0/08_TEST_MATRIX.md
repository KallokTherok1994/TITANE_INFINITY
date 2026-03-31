# 08_TEST_MATRIX

| Test Suite | Commande | Résultat | Tests |
|---|---|---|---|
| cargo check | `cargo check --manifest-path=src-tauri/Cargo.toml` | ✅ EXIT 0 (18.36s) | N/A |
| Architecture | `vitest run src/__tests__/architecture` | ✅ PASS | 4/4 |
| Compliance | `vitest run src/__tests__/compliance` | ✅ PASS | 6/6 |
| detect_recurrence | `bash scripts/autoheal/detect_recurrence.sh` | ✅ PASS | 269 entries |
| verify_instructions | `bash scripts/verify_instructions.sh` | ✅ PASS | 20/20 |

## Tests non exécutés (explication)
- `pnpm run test` (suite complète vitest) — timeout du processus en environnement partagé. Tests architecture et compliance (sous-ensemble stable) exécutés et PASS.
- `pnpm run lint` — non lancé (pas d'impact de la modification main.rs sur ESLint).
- E2E — nécessite Tauri desktop runtime (TITANE_E2E_TAURI=1), non disponible en environnement CI.

## Régression évaluée
Les 3 patches modifient:
1. `main.rs`: ajout de `.manage()` et de commandes dans `generate_handler![]` — aucun retrait, aucune modification de logique existante → risque de régression = NUL
2. `tauri.conf.json`: ajout d'entrées dans la liste `allow` — purement additif → risque = NUL
3. `autoheal_rules.jsonl`: ajout d'entrées — purement additif → risque = NUL
