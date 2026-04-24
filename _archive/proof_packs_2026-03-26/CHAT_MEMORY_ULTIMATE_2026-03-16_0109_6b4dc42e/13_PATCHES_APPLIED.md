# 13 — PATCHES APPLIED

| Patch                                           | Fichiers                           | Résultat                    |
| ----------------------------------------------- | ---------------------------------- | --------------------------- |
| PATCH-A list_restorable_conversations Rust      | commands.rs                        | PASS — 65 lignes ajoutées   |
| PATCH-A enregistrement generate_handler!        | main.rs                            | PASS — line 1328            |
| PATCH-A ChatService.listRestorableConversations | chat.ts                            | PASS — méthode ajoutée      |
| PATCH-B Dedup guard useChat.ts                  | useChat.ts                         | PASS — existingKeys+deduped |
| PATCH-C V6 validator                            | validate_restore_no_duplication.sh | PASS                        |
| PATCH-C Test script                             | scripts/tests/chat_restore_x3.sh   | PASS=3 NOT_RUN=0            |
| PATCH-C run_all updated                         | run_all_chat_memory_validators.sh  | PASS — V6 ajouté            |
| TypeScript check                                | --                                 | PASS (0 errors)             |
