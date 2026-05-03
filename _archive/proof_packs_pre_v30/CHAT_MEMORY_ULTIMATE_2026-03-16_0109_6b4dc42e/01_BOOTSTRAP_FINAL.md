# 01 — BOOTSTRAP FINAL
## Confirmations phase 0

| Check | Résultat | Preuve |
|-------|----------|--------|
| load_conversation_history in main.rs | PASS | Line 1327 |
| list_restorable_conversations in main.rs | PASS | Line 1328 |
| loadConversationHistory in chat.ts | PASS | ~line 335 |
| listRestorableConversations in chat.ts | PASS | ~line 380 |
| backend-restore useEffect in useChat.ts | PASS | Line 594 |
| deduplication guard in useChat.ts | PASS | Line 622-632 |
| active:false ghost commands (≥14) | PASS | 28 entries |
| V1-V6 validators PASS=6 | PASS | run_all output |
| chat_restore_x3.sh PASS=3 | PASS | SQLite direct |

## ETAT_REEL_FINAL
- Route primaire: conversation_generate (PROVEN)
- Restore path: load_conversation_history (PROVEN, enregistré)
- Rediscovery: list_restorable_conversations (PROVEN, enregistré)
- Duplication: dedup guard (PROVEN, in useChat.ts)

## GAPS_RESTANTS
- LTM disabled par défaut (CONVOS_MEMORY_LTM=false) — si LTM gated, SQLite events vides en prod
- Restart survival: NOT_RUN (Tauri runtime requis)
- Crash recovery: NOT_RUN (Tauri runtime requis)
- conversation_id loss (total localStorage wipe): list_restorable_conversations résout la redécouverte
