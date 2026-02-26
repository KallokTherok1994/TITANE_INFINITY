# 08_TEST_RUNS_X3.md

## Campagne homogène de référence
- Fichier: `reports/conversation_os_unified_g1_g10_x3_campaign_v2.log`
- `START_UTC:2026-02-26T00:37:40Z`
- `END_UTC:2026-02-26T00:42:58Z`

## Commandes par itération
1. `test -f docs/_evidence/conversation_os_v1_20260225_224546/GATE_G1_AUDIT_REPORT.md`
2. `cargo test ... test_endpoint_allowlist`
3. `cargo test ... no_silent_fallback_keeps_root_cause_offline`
4. `cargo test ... test_circuit_breaker_recovery`
5. `cargo test ... test_rate_limiter_consume`
6. `cargo test ... conversation_os_persistence_stores_events_and_sources`
7. `cargo test ... test_append_only_no_update`
8. `cargo test ... test_sha256_computation`
9. `cargo test ... test_offline_state_local_only`
10. `pnpm exec playwright test e2e/critical --project=chromium`
11. `cargo test ... reproducible_meta_same_input_same_output`

## Résultats x3 consolidés
- Itération 1: G1..G10 `EXIT:0`
- Itération 2: G1..G10 `EXIT:0`
- Itération 3: G1..G10 `EXIT:0`

## Lecture stricte
- Les exécutions x3 sont reproductibles pour le runbook unifié.
- Le blocage final ne vient pas d’un échec de commande, mais d’un invariant global (G1) observé en scan global frontend.
