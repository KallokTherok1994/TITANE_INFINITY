# 06_TEST_RUNS_X3.md

Date (UTC): 2026-02-26

## Campagne x3 — Gates core Pack5
- Log: `reports/pack5_gate_core_x3_20260226T140209Z.log`

Résultats:
- `RUN1/2/3_G5A_SEARCH_CREDS_EXPLICIT_EXIT=0`
- `RUN1/2/3_G5A_NO_SILENT_FALLBACK_RECHECK_EXIT=0`
- `RUN1/2/3_G5A_FAILURES_STORED_EXIT=0`
- `RUN1/2/3_G5B_SOURCES_STORED_MOCK_EXIT=0`
- `RUN1/2/3_G5B_RATE_LIMIT_AWARE_EXIT=0`
- `RUN1/2/3_G5C_MEMORY_RECALL_INTERNAL_IDS_EXIT=0`

## Campagne x3 — TraceFrame wiring réel (5D)
- Log: `reports/pack5_debug_trace_wiring_x3_20260226T140245Z.log`

Résultats:
- `RUN1/2/3_UI_TRACE_WIRING_EXIT=0`
- `RUN1/2/3_BACKEND_TRACEFRAME_FIELDS_EXIT=0`

## Campagne x3 — Matrice d’échecs
- Log: `reports/pack5_failure_matrix_x3_20260226T140428Z.log`

Résultats:
- `RUN1/2/3_G_PACK5_FAILURE_MATRIX_EXIT=0`

## Tests unitaires ciblés exécutés (détail)
- `test_search_requires_brave_api_key`
- `test_search_simulate_429_test_only`
- `no_silent_fallback_keeps_root_cause_offline`
- `conversation_os_persistence_stores_snapshot_and_failures_from_trace`
- `conversation_os_persistence_stores_events_and_sources`
- `memory_used_internal_ids_recall_10_prompts`
