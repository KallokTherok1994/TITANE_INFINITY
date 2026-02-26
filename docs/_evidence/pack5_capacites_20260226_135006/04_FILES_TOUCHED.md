# 04_FILES_TOUCHED.md

Date (UTC): 2026-02-26

## Fichiers code modifiés
- `src-tauri/src/conversation_engine/commands.rs`
	- Flags `CONVOS_*` (defaults gouvernés)
	- Intégration recherche gouvernée (feature-gated)
	- `trace_id/session_id/net_state`
	- `failures` explicites + notice FR credentials
	- Persistance snapshots/failures/sources selon flags
	- Tests recall IDs internes (10 prompts)
- `src-tauri/src/services/search_gateway.rs`
	- Simulation 429 test-only (`TITANE_TEST_MODE` + `TITANE_SEARCH_SIMULATE_429`)
	- Test unitaire dédié

## Fichiers preuve créés
- `docs/_evidence/pack5_capacites_20260226_135006/00_PLAN.md`
- `docs/_evidence/pack5_capacites_20260226_135006/01_TRUTH_CHECK_PACKS0_4.md`
- `docs/_evidence/pack5_capacites_20260226_135006/02_SCOPE_FREEZE.md`
- `docs/_evidence/pack5_capacites_20260226_135006/03_ARCHITECTURE_DELTA.md`
- `docs/_evidence/pack5_capacites_20260226_135006/04_FILES_TOUCHED.md`
- `docs/_evidence/pack5_capacites_20260226_135006/05_GATES_STATUS.md`
- `docs/_evidence/pack5_capacites_20260226_135006/06_TEST_RUNS_X3.md`
- `docs/_evidence/pack5_capacites_20260226_135006/07_PROOF_LOGS.txt`
- `docs/_evidence/pack5_capacites_20260226_135006/08_FAILURE_SIMULATIONS.md`
- `docs/_evidence/pack5_capacites_20260226_135006/09_PERF_METRICS.md`
- `docs/_evidence/pack5_capacites_20260226_135006/10_ROLLBACK.md`
- `docs/_evidence/pack5_capacites_20260226_135006/11_VERDICT.md`

## Logs de preuve utilisés
- `reports/pack5_gate_core_x3_20260226T140209Z.log`
- `reports/pack5_debug_trace_wiring_x3_20260226T140245Z.log`
- `reports/pack5_failure_matrix_x3_20260226T140428Z.log`
- `reports/pack5_self_audit_20260226T140234Z.log`

## Métadonnées de changement
- Ring impacté: **Ring 3 + Ring 4 + Docs**
- Statut: **QUALIFIED**
