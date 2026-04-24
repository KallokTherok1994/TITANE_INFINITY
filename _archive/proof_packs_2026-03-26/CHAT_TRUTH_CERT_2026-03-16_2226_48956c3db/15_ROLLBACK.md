# 15 — ROLLBACK

## Fichiers modifiés par ce cycle de certification

| Fichier                                         | Modification                                                                      | Commande rollback                                              |
| ----------------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `src-tauri/src/conversation_engine/commands.rs` | Résolution conflit merge committé (<<<<<<< / >>>>>>>) — kept IMPROVE-003 upstream | `git restore -- src-tauri/src/conversation_engine/commands.rs` |
| `src-tauri/tests/p3_provider_meta_gates.rs`     | Ajout `history: None` (4 occurrences)                                             | `git restore -- src-tauri/tests/p3_provider_meta_gates.rs`     |
| `src-tauri/tests/omega_p2_performance_test.rs`  | Ajout `history: None` (3 occurrences)                                             | `git restore -- src-tauri/tests/omega_p2_performance_test.rs`  |
| `scripts/autoheal/autoheal_rules.jsonl`         | Résolution conflit merge committé + entrée AH-COMMITTED-MERGE-CONFLICTS           | `git restore -- scripts/autoheal/autoheal_rules.jsonl`         |

## Rollback complet en une commande

```bash
git restore -- \
  src-tauri/src/conversation_engine/commands.rs \
  src-tauri/tests/p3_provider_meta_gates.rs \
  src-tauri/tests/omega_p2_performance_test.rs \
  scripts/autoheal/autoheal_rules.jsonl
```

**Note** : Le rollback restaurerait les conflits merge et les erreurs de compilation. Non recommandé.

## Rollback preuve-pack uniquement

```bash
rm -rf proof_packs/CHAT_TRUTH_CERT_2026-03-16_2226_48956c3db/
```

## Vérification post-rollback

```bash
cargo check --manifest-path src-tauri/Cargo.toml --lib
bash scripts/autoheal/detect_recurrence.sh
```
