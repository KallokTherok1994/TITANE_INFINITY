# 02 — SCOPE FREEZE

## Périmètre certifié

| Domaine                   | Fichiers clés                                                                          |
|---------------------------|----------------------------------------------------------------------------------------|
| Chat hook principal       | src/hooks/useChat.ts (2251 lignes)                                                     |
| Chat hook core            | src/hooks/useChatCore.ts                                                               |
| Chat hook mémoire         | src/hooks/useChatMemory.ts                                                             |
| Chat service IPC          | src/services/api/chat.ts                                                               |
| Conversation engine hook  | src/hooks/useConversationEngine.ts (609 lignes)                                        |
| LTM context hook          | src/hooks/useLTMContext.ts                                                             |
| Chat memory single door   | src/services/chat/chatMemorySingleDoor.ts                                              |
| Module route context      | src/services/chat/moduleRouteContext.ts                                                |
| Chat memory compactor     | src/services/chatMemoryCompactor.ts                                                    |
| Backend OMEGA             | src-tauri/src/conversation_engine/commands.rs                                          |
| Backend mémoire multi-couche | src-tauri/src/conversation_engine/multilayer_memory.rs (1019 lignes)               |
| Backend types             | src-tauri/src/conversation_engine/types.rs                                             |
| IPC canonical wrapper     | src/lib/serviceInvoker.ts, src/lib/ipcContract.ts                                      |
| Capabilities              | src-tauri/capabilities/chat_ai.json, audio_tts.json, persistence.json, self_heal.json  |
| Pages audit               | src/pages/TitanePage.tsx, TimePage.tsx, TwinsPage.tsx, Memory.tsx, ChatPage.tsx        |
| App route publisher       | src/App.tsx (publishActiveModuleContext)                                                |
| Handler registration      | src-tauri/src/main.rs (invoke_handler)                                                 |
| Tests existants           | src-tauri/tests/p3_provider_meta_gates.rs                                              |

## Hors périmètre

- Voice engine (couvert séparément)
- Avatar engine
- Onboarding
- Cloud sync / Vault
- EVO progression (sauf contact mémoire)
