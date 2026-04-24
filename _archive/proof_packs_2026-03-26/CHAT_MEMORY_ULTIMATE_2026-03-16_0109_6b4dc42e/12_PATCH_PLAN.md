# 12 — PATCH PLAN

## PATCH-A: list_restorable_conversations

- RING: R2 (Rust backend) + R3 (IPC) + R1 (frontend callsite)
- FICHIERS: commands.rs, main.rs, chat.ts
- IMPACT_RESEAU: aucun
- IMPACT_ALLOWLIST: aucun
- IMPACT_PERSISTENCE: lecture SQLite (jamais d'écriture)
- IMPACT_CONTINUITÉ: permet redécouverte si conversation_id perdu
- TESTS_REQUIS: validate_restore_no_duplication.sh + chat_restore_x3.sh
- ROLLBACK: git restore -- src-tauri/src/conversation_engine/commands.rs src-tauri/src/main.rs src/services/api/chat.ts

## PATCH-B: Deduplication guard useChat.ts

- RING: R4 (UI/Modules)
- FICHIERS: useChat.ts
- IMPACT_RESEAU: aucun
- IMPACT_ALLOWLIST: aucun
- IMPACT_PERSISTENCE: aucun
- IMPACT_CONTINUITÉ: prévient doublon transcript
- TESTS_REQUIS: validate_restore_no_duplication.sh
- ROLLBACK: git restore -- src/hooks/useChat.ts

## PATCH-C: V6 validator + test script

- RING: scripts (hors Ring)
- FICHIERS: validate_restore_no_duplication.sh, chat_restore_x3.sh
- IMPACT: observabilité uniquement
- ROLLBACK: git restore -- scripts/validators/validate_restore_no_duplication.sh scripts/tests/chat_restore_x3.sh
