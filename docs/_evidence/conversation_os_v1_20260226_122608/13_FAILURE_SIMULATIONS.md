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
- allowlist violation: **PARTIAL** (policy/scan prouvés, simulation runtime non scellée)
- missing API key: **PARTIAL** (`CREDENTIALS_MISSING` observé dans `search_gateway.rs`, x3 runtime incomplet)
- revoked API key: **BLOCKED**
- circuit breaker open: **PARTIAL** (engine présent, x3 runtime incomplet)
- budget exhausted: **PARTIAL** (gateway budgets présents, x3 runtime incomplet)

## Verdict gate
- `G_FAILURE_SIMULATION_COMPLETE`: **BLOCKED**

