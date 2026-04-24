# 03_CHAT_FLOW_MAP

## Route primaire confirmée

```
USER INPUT (ChatWindow.tsx → ChatInput.tsx)
  ↓ handleSend() → useChat.ts::sendMessage()
  ↓ src/services/api/chat.ts::ChatService::sendMessage()
  ↓ [E2E_MOCK off] invoke('conversation_generate', { message, conversation_id, mode, provider })
  ↓ src-tauri/src/conversation_engine/commands.rs::conversation_generate()
  ↓ ConversationEngineState::process_message()
  ↓ RouterEngine → PolicyEngine → ResilienceEngine → MemoryEngine → AIRouter
  ↓ [Ollama|Gemini|Claude|OpenAI] → Réponse JSON
  ↓ Frontend: message affiché + localStorage sauvegarde via chatMemoryCompactor
```

## Surfaces par statut

| Surface                    | Statut                                             |
| -------------------------- | -------------------------------------------------- |
| ChatWindow.tsx input/send  | PRESENT_AND_PROVEN                                 |
| useChat.ts orchestrateur   | PRESENT_AND_PROVEN                                 |
| conversation_generate IPC  | PRESENT_AND_PROVEN                                 |
| ConversationEngineState    | PRESENT_BUT_UNPROVEN (pas de tests x3)             |
| localStorage persistence   | PRESENT_AND_PROVEN                                 |
| SQLite backend persistence | PRESENT_BUT_UNPROVEN (pas de reload UI)            |
| send_message (main.rs)     | RUNTIME_MISMATCH → FIXED (now Err)                 |
| load_conversation_history  | ABSENT                                             |
| Streaming                  | LEGACY_ONLY (chat_stream_message supprimé v27.0.5) |
| Voice/audio                | PRESENT_AND_PROVEN (start_recording registered)    |
