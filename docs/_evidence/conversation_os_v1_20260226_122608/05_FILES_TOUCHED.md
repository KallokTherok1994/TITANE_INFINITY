# 05_FILES_TOUCHED.md

Date (UTC): 2026-02-26

## Fichiers créés (pack)
- `00_PLAN.md`
- `01_TRUTH_SNAPSHOT.md`
- `02_SCOPE_FREEZE.md`
- `03_ARCHITECTURE_MAP.md`
- `04_MICRO_PHASES.md`
- `05_FILES_TOUCHED.md`
- `06_RING_SURFACE_MAP.md`
- `07_NETWORK_ALLOWLIST_MAP.md`
- `08_DB_SCHEMA.md`
- `09_GATES_STATUS.md`
- `10_TEST_RUNS_X3.md`
- `11_PROOF_LOGS.txt`
- `12_PERFORMANCE_METRICS.md`
- `13_FAILURE_SIMULATIONS.md`
- `14_ROLLBACK.md`
- `15_RISKS.md`
- `16_VERDICT.md`

## Fichiers runtime lus pour validation (sans modification)
- `src-tauri/src/conversation_engine/commands.rs`
- `src-tauri/src/services/db_service.rs`
- `src-tauri/src/services/network_gateway.rs`
- `src-tauri/src/services/search_gateway.rs`
- `src-tauri/src/engines/conversation_os/policy.rs`
- `src-tauri/src/engines/conversation_os/router.rs`
- `src-tauri/src/engines/conversation_os/resilience.rs`
- `src-tauri/src/commands/security.rs`

## Fichier code modifié (gate-close)
- `src-tauri/src/services/db_service.rs`
	- Ajout de tests unitaires ciblés: snapshots, sources, failures (append-only + hash)
- `src-tauri/src/services/network_gateway.rs`
	- Ajout struct `NetworkMeta` + méthodes `*_with_meta` + test unitaire de complétude
- `src-tauri/src/engines/unified_memory/mod.rs`
	- Ajout test `test_recall_returns_internal_ids` pour preuve des IDs internes en recall
- `src-tauri/src/conversation_engine/commands.rs`
	- Ajout test `conversation_os_single_pipeline_trace_and_artifacts_are_canonical`
- `src/core/commands/TAURI_COMMANDS.ts`
	- Nettoyage d'une référence legacy en commentaire pour éviter faux positif gate reachability

## Métadonnées
- Ring impacté: **Ring 2 + Ring 3 + Ring 4**
- Statut changement: **QUALIFIED**

## Logs de preuve générés
- `reports/conversation_os_v1_next_run_scans_x3_20260226T124140Z.log`
- `reports/conversation_os_v1_next_run_x3_20260226T123434Z.log` (partiel)
- `reports/conversation_os_v1_next_run_x3_20260226T123458Z.log` (partiel)
- `reports/conversation_os_v1_next_run_x3_bg_20260226T123511Z.log` (partiel)
- `reports/conversation_os_v1_next_run_runtime_x3_bg_20260226T124119Z.log`
- `reports/conversation_os_v1_next_run_runtime_x3_addendum_bg_20260226T124237Z.log`
- `reports/conversation_os_v1_next_run_runtime_x3_gateclose_bg_20260226T124749Z.log`
- `reports/conversation_os_v1_next_run_gate_rate_legacy_x3_20260226T125024Z.log`
- `reports/conversation_os_v1_next_run_gate_legacy_afterfix_x3_20260226T125300Z.log`
- `reports/conversation_os_v1_next_run_gate_network_meta_x3_20260226T125642Z.log`
- `reports/conversation_os_v1_next_run_gate_memory_recall_ids_x3_20260226T130141Z.log`
- `reports/conversation_os_v1_next_run_gate_orchestrator_single_x3_20260226T130756Z.log`
- `reports/conversation_os_v1_next_run_gate_perf_metrics_x3_20260226T131300Z.log`

