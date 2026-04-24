# 10_DATA_LOSS_RISK_REGISTER

| #   | Risque                                             | Fichier                                        | RISK | Statut                                       |
| --- | -------------------------------------------------- | ---------------------------------------------- | ---- | -------------------------------------------- |
| 1   | localStorage effacé = historique perdu             | chatMemoryCompactor.ts:66                      | P0   | OPEN                                         |
| 2   | Pas de reload historique depuis SQLite             | ChatService (load_conversation_history ABSENT) | P0   | OPEN                                         |
| 3   | memory_core_state::chat_history toujours vide      | memory/memory_core_state.json:133              | P0   | OPEN (structural)                            |
| 4   | conversation_id non restauré si clear localStorage | useChat.ts + conversationStorage               | P0   | MITIGATED (conversationStorage.initialize()) |
| 5   | LTM désactivé par défaut                           | conversation_engine/commands.rs:225            | P1   | OPEN (by design)                             |
| 6   | send_message main.rs stub silencieux               | main.rs:673                                    | P0   | FIXED                                        |
| 7   | 14 ghost commands IPC silencieux                   | tauriCommands.ts                               | P1   | FIXED                                        |
| 8   | memory_get Ok(None) sans log                       | memory_commands.rs:47                          | P1   | FIXED                                        |
| 9   | PersistentMemory fallback /tmp                     | main.rs:892                                    | P1   | OPEN                                         |
| 10  | Timeout 30s ChatWindow sans draft save             | ChatWindow.tsx:101                             | P1   | OPEN                                         |
