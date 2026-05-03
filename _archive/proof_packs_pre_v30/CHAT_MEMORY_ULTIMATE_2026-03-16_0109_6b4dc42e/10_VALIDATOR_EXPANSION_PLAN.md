# 10 — VALIDATOR EXPANSION PLAN

## Validators existants (V1-V6)
| ID | Script | Statut |
|----|--------|--------|
| V1 | validate_chat_commands.sh | PASS |
| V2 | validate_memory_persistence.sh | PASS |
| V3 | validate_no_send_message_stub.sh | PASS |
| V4 | validate_ipc_no_silent_mock.sh | PASS |
| V5 | validate_conversation_id_stable.sh | PASS |
| V6 | validate_restore_no_duplication.sh | PASS (NEW) |

## Validators planifiés (NOT_IMPLEMENTED — hors scope minimal)
| ID | But |
|----|-----|
| V7 | LTM activation check (CONVOS_MEMORY_LTM=true vérification env) |
| V8 | Transcript parity check (localStorage vs SQLite counts) |
| V9 | Provider lie detector (réponse sans source réelle) |
