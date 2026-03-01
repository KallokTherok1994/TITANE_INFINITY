# 13_GATES_REPORT

## Résumé gates

| Gate | Statut | Evidence |
|---|---|---|
| G_PROOF_PACK_COMPLETE | PASS | Fichiers 00..16 présents dans le pack |
| G_UI_NO_NETWORK_DIRECT | FAIL | `proof_logs/phase3_network_evidence.log` |
| G_ONE_DOOR_NETWORK_BACKEND | FAIL | `proof_logs/phase3_metrics.log`, `proof_logs/phase1_gates_scans.log` |
| G_RING_INTEGRITY | BLOCKED | Preuve partielle par scans, pas de graphe exhaustif ring-to-ring |
| G_NO_SKIPS | PASS | `11_TEST_RUNS_X3.log` (3/3 pass, pas de skip sur la suite exécutée) |
| G_TESTS_X3 | PASS | `11_TEST_RUNS_X3.log` |
| G_BUILD_TAURI_X3 | PASS | `12_BUILD_RUNS_X3.log` (run_x3: PASS=3/3) |
| G_SELF_AUDIT_CLEAN | FAIL | re-scan final signale non-conformités réseau UI |

## Détail
- Tests exécutés x3: `pnpm run test:architecture` => PASS x3.
- Build Tauri: `pnpm run build:tauri:e2e` exécuté via `scripts/lib/run_x3.sh` avec verdict `PASS (3/3)`.
- Invariants réseau UI non respectés dans les fichiers identifiés.
