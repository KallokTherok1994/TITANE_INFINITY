# 10_TEST_RUNS_X3.md

Date (UTC): 2026-02-26

## Commandes exécutées
- Baseline:
	- `pnpm lint` => `exit=0`
	- `pnpm test` => `exit=0`
- Scans x3:
	- `reports/conversation_os_v1_next_run_scans_x3_20260226T124140Z.log`

## Résultats x3 (extraits)
- `FRONTEND_NO_WEB_PRODSCOPE`: `0 / 0 / 0`
- `BACKEND_HTTP_GOV_OUTSIDE_ALLOWLIST`: `0 / 0 / 0`
- `TYPES_TO_SERVICES`: `2 / 2 / 2`
- `SERVICES_TO_UI`: `5 / 5 / 5`
- `LEGACY_CHAT_SEND_MESSAGE_UI`: `8 / 8 / 8`
- `G_DB_WRITE_READ_HASH_X3`: `0 / 0 / 0` (exit)
- `G_EVENTS_APPEND_ONLY`: `0 / 0 / 0`
- `G_POLICY_ENFORCED`: `0 / 0 / 0`
- `G_ROUTER_DETERMINISTIC`: `0 / 0 / 0`
- `G_NETSTATE_TRANSITIONS_VALID`: `0 / 0 / 0`
- `G_BUDGET_ENFORCED`: `0 / 0 / 0`
- `G_SEARCH_CREDS_EXPLICIT`: `0 / 0 / 0`
- `G_NO_SILENT_FALLBACK`: `0 / 0 / 0`
- `G_SOURCES_STORED_AND_CITABLE_PARSE`: `0 / 0 / 0`
- `G_DB_INSERT_AND_GET`: `0 / 0 / 0`
- `G_FAILURES_STORED`: `0 / 0 / 0`
- `G_SNAPSHOT_CREATED_X3`: `0 / 0 / 0`
- `G_SNAPSHOT_HASH_VALID`: `0 / 0 / 0`
- `G_SOURCES_STORED_AND_CITABLE_PERSIST`: `0 / 0 / 0`
- `G_ORCHESTRATOR_SINGLE_EVIDENCE`: `0 / 0 / 0`
- `G_REPRODUCIBLE_META`: `0 / 0 / 0`
- `G_RATE_LIMIT_AWARE`: `0 / 0 / 0`
- `G_LEGACY_UNREACHABLE_FROM_UI`: `0 / 0 / 0` (after cleanup)
- `G_NETWORK_META_COMPLETE`: `0 / 0 / 0`
- `G_MEMORY_RECALL_INTERNAL_IDS`: `0 / 0 / 0`

## Tentatives x3 runtime Rust
- Tentatives initiales partiellement bloquées par contention `cargo` (conservées pour audit):
	- `reports/conversation_os_v1_next_run_x3_20260226T123434Z.log`
	- `reports/conversation_os_v1_next_run_x3_20260226T123458Z.log`
	- `reports/conversation_os_v1_next_run_x3_bg_20260226T123511Z.log`
- Run isolé réussi:
	- `reports/conversation_os_v1_next_run_runtime_x3_bg_20260226T124119Z.log`
	- `reports/conversation_os_v1_next_run_runtime_x3_addendum_bg_20260226T124237Z.log`
	- `reports/conversation_os_v1_next_run_runtime_x3_gateclose_bg_20260226T124749Z.log`
	- `reports/conversation_os_v1_next_run_gate_rate_legacy_x3_20260226T125024Z.log`
	- `reports/conversation_os_v1_next_run_gate_legacy_afterfix_x3_20260226T125300Z.log`
	- `reports/conversation_os_v1_next_run_gate_network_meta_x3_20260226T125642Z.log`
	- `reports/conversation_os_v1_next_run_gate_memory_recall_ids_x3_20260226T130141Z.log`

## Verdict x3
- Scans structurels: **PASS**.
- Gates runtime ciblées exécutées ici: **PASS**.
- Gates non couvertes par tests dédiés dans ce run: **BLOCKED/PARTIAL** (voir `09_GATES_STATUS.md`).

