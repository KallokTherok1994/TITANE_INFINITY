# 13_FAILURE_SIMULATIONS.md

Date (UTC): 2026-02-26

## Matrice demandée
- offline startup: **PASS** (simulation engine-level)
- offline mid-request: **PASS** (simulation engine-level)
- DNS failure: **PASS** (simulation engine-level)
- TLS failure: **PASS** (simulation engine-level)
- timeout: **PASS** (simulation engine-level)
- 429: **PASS** (simulation engine-level)
- 500: **PASS** (simulation engine-level)
- allowlist violation: **PASS** (simulation engine-level)
- missing API key: **PASS** (simulation engine-level)
- revoked API key: **PASS** (simulation engine-level)
- circuit breaker open: **PASS** (simulation engine-level)
- budget exhausted: **PASS** (simulation engine-level)

## Verdict gate
- `G_FAILURE_SIMULATION_COMPLETE`: **PASS**

## Preuves runtime addendum
- `reports/conversation_os_v1_next_run_runtime_x3_bg_20260226T124119Z.log`
- `reports/conversation_os_v1_next_run_runtime_x3_addendum_bg_20260226T124237Z.log`
- `reports/conversation_os_v1_next_run_gate_final_closure_x3_20260226T133128Z.log`

