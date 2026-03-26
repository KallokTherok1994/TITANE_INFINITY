# 13 — TESTS AND RETESTS X3

## Test 1 — Compilation Rust (cargo check lib)

**Commande** : `cargo check --manifest-path src-tauri/Cargo.toml --lib`  
**Pourquoi** : Valide que le backend compile sans erreur (préalable à tout test runtime)

| Run | Résultat | Durée |
|-----|----------|-------|
| Run 1 (avant patch) | FAIL — unclosed delimiter src/conversation_engine/commands.rs:2031 (conflit merge committé) | — |
| Run 2 (après patch conflict commands.rs) | PASS — Finished dev profile [unoptimized + debuginfo] in 14.45s | 14.45s |
| Run 3 (post autoheal entry) | PASS — cargo check succeeds | ~14s |

**Variance** : Aucune après patch  
**Verdict** : PASS

---

## Test 2 — Compilation tests Rust (cargo test --no-run)

**Commande** : `cargo test --manifest-path src-tauri/Cargo.toml --no-run`  
**Pourquoi** : Valide que tous les fichiers de test compilent (détecte missing fields)

| Run | Résultat |
|-----|----------|
| Run 1 (avant patch) | FAIL — missing field 'history' in p3_provider_meta_gates.rs (4×) + omega_p2_performance_test.rs (3×) + unclosed delimiter commands.rs |
| Run 2 (après patch p3 + omega_p2 + commands.rs conflict) | PASS — Finished test profile in 0.25s |
| Run 3 | PASS |

**Variance** : Aucune après patch  
**Verdict** : PASS

---

## Test 3 — p3_provider_meta_gates (x3)

**Commande** : `cargo test --manifest-path src-tauri/Cargo.toml --test p3_provider_meta_gates -- --test-threads=1`  
**Pourquoi** : Valide les gates provider meta (AR20, OFFLINE5, STABILITY, DETERMINISM) — tests critiques pour la chaîne chat

| Run | Résultat |
|-----|----------|
| Run 1 | 4/4 ok — test_p3_ar20_meta_x3, test_p3_determinism_signature_x3, test_p3_offline5_offlinesim_x3, test_p3_stability_burst_x3 |
| Run 2 | 4/4 ok |
| Run 3 | 4/4 ok (0.00s — tests in-process, pas de runtime Ollama requis) |

**Variance** : 0  
**Verdict** : PASS

---

## Test 4 — detect_recurrence (autoheal gate)

**Commande** : `bash scripts/autoheal/detect_recurrence.sh`

| Run | Résultat |
|-----|----------|
| Run 1 (avant patch) | FAIL — invalid json at line 329 (conflit merge dans autoheal_rules.jsonl) |
| Run 2 (après patch) | PASS — G_AH_RULE_CAPTURED_FOR_EACH_FIX, G_AH_RECURRENCE_GUARD_PASS, entries=340 |
| Run 3 | PASS |

**Verdict** : PASS

---

## Test 5 — verify_instructions

**Commande** : `bash scripts/verify_instructions.sh`

| Run | Résultat |
|-----|----------|
| Run 1 | PASS=20 FAIL=0 |
| Run 2 | PASS=20 FAIL=0 |
| Run 3 | PASS=20 FAIL=0 |

**Verdict** : PASS

---

## Test 6 — typecheck frontend

**Status** : BLOCKED — Node.js v18.19.1 < v20 requis. pnpm engines check bloque l'exécution de `pnpm typecheck`.  
**Alternative** : Non disponible sans Node.js v20.  
**Verdict** : BLOCKED (environnement, non lié au code)
