# 13_FAILURE_SIMULATIONS.md

Date (UTC): 2026-02-26

## Matrice demandée
- offline startup: **BLOCKED** (non exécuté sur ce run)
- offline mid-request: **BLOCKED**
- DNS failure: **BLOCKED**
- TLS failure: **BLOCKED**
- timeout: **BLOCKED**
- 429: **BLOCKED**
- 500: **BLOCKED**
- allowlist violation: **PARTIAL** (policy/allowlist validée; scénario E2E dédié non scellé)
- missing API key: **PASS** (`G_SEARCH_CREDS_EXPLICIT` x3)
- revoked API key: **BLOCKED**
- circuit breaker open: **PARTIAL** (transitions validées x3, scénario complet dédié manquant)
- budget exhausted: **PARTIAL** (budget engine validé x3, scénario exhaustion complet manquant)

## Verdict gate
- `G_FAILURE_SIMULATION_COMPLETE`: **BLOCKED**

## Preuves runtime addendum
- `reports/conversation_os_v1_next_run_runtime_x3_bg_20260226T124119Z.log`
- `reports/conversation_os_v1_next_run_runtime_x3_addendum_bg_20260226T124237Z.log`

