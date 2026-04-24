# 04 — MEMORY PROVENANCE MATRIX

| Type mémoire         | Créateur                     | Lecteur                                | Conditions écriture              | Conditions échec         | Stratégie restore   |
| -------------------- | ---------------------------- | -------------------------------------- | -------------------------------- | ------------------------ | ------------------- |
| Session (compactor)  | chatMemoryCompactor          | chatMemoryCompactor.getRecentHistory() | À chaque message                 | localStorage full/absent | none                |
| Important (promoted) | memoryService.setMemory()    | memory_get IPC → memoryService         | Explicite user/system            | backend offline          | IPC retry           |
| LTM (SQLite)         | persist_conversation_os_turn | load_conversation_history              | Activé si CONVOS_MEMORY_LTM=true | env var absent           | direct SQLite query |
| Config politique IA  | systemPromptService          | conversation_generate                  | Explicite                        | fichier absent           | défaut Tauri        |
| Contexte provider    | providerService              | chat.ts sendMessage                    | À chaque send                    | provider offline         | offline fallback    |

## UNKNOWN déclarés

- LTM status en prod: dépend de CONVOS_MEMORY_LTM env var — non vérifié runtime
