# 09_GATES_STATUS.md

Date (UTC): 2026-02-26

## Gates de cadrage
- `G_LEGACY_PATHS_MAPPED`: PASS (présence canonique + legacy détectées)
- `G_SCOPE_FROZEN`: PASS (scope figé dans `02_SCOPE_FREEZE.md`)

## Gates runtime (état initial avant x3)
- `G_DB_WRITE_READ_HASH_X3`: BLOCKED
- `G_EVENTS_APPEND_ONLY`: BLOCKED
- `G_NO_SILENT_FALLBACK`: BLOCKED
- `G_POLICY_ENFORCED`: BLOCKED
- `G_ROUTER_DETERMINISTIC`: BLOCKED
- `G_GATEWAY_ALLOWLIST_ONLY`: PARTIAL (scan PASS, runtime x3 non scellée)
- `G_FRONTEND_NO_WEB`: PASS (`0/0/0` prod-scope)
- `G_NETWORK_META_COMPLETE`: BLOCKED
- `G_NETSTATE_TRANSITIONS_VALID`: BLOCKED
- `G_BUDGET_ENFORCED`: BLOCKED
- `G_ORCHESTRATOR_SINGLE`: BLOCKED
- `G_LEGACY_UNREACHABLE_FROM_UI`: BLOCKED (`8/8/8`)
- `G_SEARCH_CREDS_EXPLICIT`: PARTIAL
- `G_FAILURES_STORED`: BLOCKED
- `G_SOURCES_STORED_AND_CITABLE`: BLOCKED
- `G_RATE_LIMIT_AWARE`: BLOCKED
- `G_SNAPSHOT_CREATED_X3`: BLOCKED
- `G_SNAPSHOT_HASH_VALID`: BLOCKED
- `G_MEMORY_RECALL_INTERNAL_IDS`: BLOCKED
- `G_DEBUG_PANEL_REAL_TRACE`: BLOCKED
- `G_FAILURE_SIMULATION_COMPLETE`: BLOCKED
- `G_PERF_METRICS_RECORDED`: BLOCKED
- `G_SELF_AUDIT_CLEAN`: BLOCKED
- `G_RING_INTEGRITY`: PARTIAL

## Baseline discovery (preuve brute)
- `BACKEND_HTTP_COUNT_GOV=0`
- `FRONT_WEB_PRIMITIVES_COUNT=155` (scan brut, triage requis)
- `pnpm lint`: `exit=0`
- `pnpm test`: `exit=0`

## Exécution x3 disponible (ce run)
- `reports/conversation_os_v1_next_run_scans_x3_20260226T124140Z.log`
	- `FRONTEND_NO_WEB_PRODSCOPE`: `0/0/0`
	- `BACKEND_HTTP_GOV`: `0/0/0`
	- `TYPES_TO_SERVICES`: `2/2/2`
	- `SERVICES_TO_UI`: `5/5/5`
	- `LEGACY_CHAT_SEND_MESSAGE_UI`: `8/8/8`

## Blocage d'exécution runtime
- Contention `cargo` / verrou build durant tentative de run x3 Rust.
- Logs partiels conservés pour audit:
	- `reports/conversation_os_v1_next_run_x3_20260226T123434Z.log`
	- `reports/conversation_os_v1_next_run_x3_20260226T123458Z.log`
	- `reports/conversation_os_v1_next_run_x3_bg_20260226T123511Z.log`

