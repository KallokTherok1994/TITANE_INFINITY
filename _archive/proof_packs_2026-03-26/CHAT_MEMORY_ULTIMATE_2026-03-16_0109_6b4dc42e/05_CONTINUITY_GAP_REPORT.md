# 05 — CONTINUITY GAP REPORT

## Gaps identifiés avant session

| Gap                                           | Cause                                | Résolu?                |
| --------------------------------------------- | ------------------------------------ | ---------------------- |
| Perte historique si localStorage effacé       | load_conversation_history absent     | RÉSOLU (prior session) |
| Pas de redécouverte si conversation_id perdu  | list_restorable_conversations absent | RÉSOLU (PATCH-A)       |
| Duplication possible restore                  | Pas de dedup guard                   | RÉSOLU (PATCH-B)       |
| Overwrite silent état plus récent par restore | messages.length > 0 guard absent     | RÉSOLU (prior session) |

## Gaps restants

| Gap                                              | Cause                                         | Statut                                                |
| ------------------------------------------------ | --------------------------------------------- | ----------------------------------------------------- |
| LTM désactivé par défaut                         | CONVOS_MEMORY_LTM=false                       | KNOWN — non bloquant si SQLite écrit quand même       |
| Total localStorage wipe ET conversation_id perdu | list_restorable_conversations résout la liste | PARTIAL — UI doit appeler listRestorableConversations |
| Restart survival                                 | Tauri runtime requis                          | NOT_RUN                                               |
