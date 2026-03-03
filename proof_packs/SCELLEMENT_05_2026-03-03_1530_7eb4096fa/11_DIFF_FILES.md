# 11_DIFF_FILES

| Fichier | Ring | Raison | Risque | Rollback |
|---|---|---|---|---|
| `src-tauri/src/chat_engine/mod.rs` | Ring 3 | Fix ordre init streaming config | faible | `git restore -- src-tauri/src/chat_engine/mod.rs` |
| `src-tauri/src/chat_engine/memory.rs` | Ring 3 | Fix borrow cache + robustesse coalescing | faible-moyen | `git restore -- src-tauri/src/chat_engine/memory.rs` |
| `src-tauri/src/engines/conversation_os/search.rs` | Ring 2 | Fix doctest import/options | faible | `git restore -- src-tauri/src/engines/conversation_os/search.rs` |
| `src-tauri/src/engines/conversation_os/router.rs` | Ring 2 | Fix doctest assertion fragile | faible | `git restore -- src-tauri/src/engines/conversation_os/router.rs` |
| `src-tauri/src/engines/conversation_os/policy.rs` | Ring 2 | Fix doctest import | faible | `git restore -- src-tauri/src/engines/conversation_os/policy.rs` |
| `proof_packs/SCELLEMENT_05_2026-03-03_1530_7eb4096fa/*` | Gouvernance | preuves/gates/verdict append-only | nul runtime | `git restore -- proof_packs/SCELLEMENT_05_2026-03-03_1530_7eb4096fa` |

