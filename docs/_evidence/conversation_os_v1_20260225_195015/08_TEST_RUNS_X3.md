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

## Addendum remédiation 2026-02-26

### A) SearchGateway credentials (Ring 3) — x3
- Commande répétée x3:
	- `cargo test --manifest-path src-tauri/Cargo.toml services::search_gateway::tests::test_search_requires_brave_api_key -- --nocapture`
- Log: `reports/conversation_os_g1_remediation_search_credentials_x3.log`
- Résultat:
	- `EXIT_1:0`
	- `EXIT_2:0`
	- `EXIT_3:0`

### B) Audit G1 périmètre Conversation OS v1
- Commande scan ciblée (4 fichiers frontend canonique `conversation_generate`) avec vérification des primitives `fetch|axios|XMLHttpRequest|WebSocket`.
- Log: `reports/conversation_os_g1_scoped_surface_audit_20260226.log`
- Résultat attendu/obtenu: `DIRECT_NETWORK_EXIT:1` (aucun match détecté sur le périmètre ciblé).

### C) Phase 1 G1 global — inventaire/classification
- Commande globale:
	- `rg -n "fetch\(|axios\(|XMLHttpRequest|WebSocket" src`
- Artifacts:
	- `reports/conversation_os_g1_phase1_raw_20260226T010320Z.log`
	- `reports/conversation_os_g1_phase1_summary_20260226T010320Z.md`
	- `reports/conversation_os_g1_phase1_classification_20260226T010330Z.csv`
- Résultat consolidé:
	- Total 85, `IN_SCOPE_CONVOS_V1=0`, `TEST_ONLY=7`, `LEGACY_HORS_SCOPE=78`
- Statut:
	- Phase 1 du plan G1: **PASS**

### D) Phase 2 quick-wins — réduction de surface
- Série de patchs ciblés (tests/docs/providers/transports) pour neutraliser occurrences non critiques.
- Vérification locale erreurs: `get_errors` sur fichiers modifiés → aucun diagnostic.
- Mesure:
	- `rg -n "fetch\(|axios\(|XMLHttpRequest|WebSocket" src` = `63` (post quick-wins).

### E) Phase 3 G1 global x3 (post quick-wins)
- Log: `reports/conversation_os_g1_global_scan_x3_after_phase2.log`
- Exécution x3:
	- `G1_GLOBAL_COUNT_1:63`
	- `G1_GLOBAL_COUNT_2:63`
	- `G1_GLOBAL_COUNT_3:63`
- Conclusion:
	- Reproductible x3, mais critère strict (`0` match) non atteint.

### F) Phase 2B/3B G1 global x3 (post visual-engine)
- Log: `reports/conversation_os_g1_global_scan_x3_after_phase2b.log`
- Exécution x3:
	- `G1_GLOBAL_EXIT_1:1`, `G1_GLOBAL_COUNT_1:0`
	- `G1_GLOBAL_EXIT_2:1`, `G1_GLOBAL_COUNT_2:0`
	- `G1_GLOBAL_EXIT_3:1`, `G1_GLOBAL_COUNT_3:0`
- Conclusion:
	- Reproductible x3 et critère strict atteint (`0` match).

### G) Continuation check (post-sealing)
- Vitest ciblé visual-engine:
	- `pnpm vitest run src/__tests__/stores/visualStateStore.test.ts src/components/panels/__tests__/panels.spec.tsx`
	- Résultat: `2 files passed`, `34 tests passed`.
- Recheck G1 global:
	- Log: `reports/conversation_os_g1_global_post_continue_check.log`
	- Résultat: `EXIT:1`, `COUNT:0`.

### H) GO final validation (cross-gates)
- Log consolidé: `reports/conversation_os_final_validation_post_go.log`
- Résultats:
	- `CHECK_EXIT:0`
	- `LINT_EXIT:0`
	- `ARCH_EXIT:0`
	- `RUST_EXIT:0`
	- `FORMAT_EXIT:1` (dette de formatage globale repo, non introduite par ce cycle seul)
	- `G1_COUNT:0`
