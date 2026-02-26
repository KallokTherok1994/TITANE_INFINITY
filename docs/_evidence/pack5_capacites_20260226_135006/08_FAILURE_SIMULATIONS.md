# 08_FAILURE_SIMULATIONS.md

Date (UTC): 2026-02-26

## Scénarios requis et statut

### 1) API key manquante
- Attendu: `CREDENTIALS_MISSING` explicite, pas de faux succès.
- Preuve: `test_search_requires_brave_api_key` x3 (`EXIT=0`).
- Statut: **PASS x3**.

### 2) Offline net_state
- Attendu: search refusée explicitement, local continue.
- Preuve: matrice d’échecs engine-level x3.
- Log: `reports/pack5_failure_matrix_x3_20260226T140428Z.log`.
- Statut: **PASS x3**.

### 3) Budget exhausted
- Attendu: refus explicite (resilience/rate-limit), local continue.
- Preuve: matrice d’échecs engine-level x3.
- Statut: **PASS x3**.

### 4) 429 rate limit
- Attendu: classification `RATE_LIMIT` + raisons de trace.
- Preuve: simulation test-only `TITANE_TEST_MODE=1` + `TITANE_SEARCH_SIMULATE_429=1`.
- Test: `test_search_simulate_429_test_only` x3.
- Statut: **PASS x3**.

## Gate
- `G_PACK5_FAILURES_COMPLETE`: **PASS x3**.
