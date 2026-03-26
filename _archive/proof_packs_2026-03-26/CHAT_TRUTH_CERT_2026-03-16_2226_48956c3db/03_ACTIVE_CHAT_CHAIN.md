# 03 — ACTIVE CHAT CHAIN

## Chaîne principale (sendMessage OMEGA)

```
[Utilisateur tape message]
        │
        ▼
src/hooks/useChat.ts → sendMessage()
        │  (via chatService.sendMessage())
        ▼
src/services/api/chat.ts → ChatService.sendMessage()
        │  validateIpcPayload('conversation_generate', {...})
        │  invokeWithRetry('conversation_generate', payload)
        ▼
[Tauri IPC bridge]
        │
        ▼
src-tauri/src/main.rs → invoke_handler! [...conversation_engine::commands::conversation_generate...]
        │
        ▼
src-tauri/src/conversation_engine/commands.rs → conversation_generate()
        │  RouterEngine, PolicyEngine, ResilienceEngine, MemoryEngine, SearchEngine
        │  policy_verdict.allow_external_ai → effective_provider
        │  load_conversation_history() → LTM context injection
        │  ConversationRequest { user_message, history, ... }
        ▼
engine.process_message(request).await → OMEGA pipeline
        │
        ▼
Response { content, provider_meta, latency_ms, ... }
        │
        ▼
persist_conversation_os_artifacts() → SQLite
        │
        ▼
Retour frontend → ChatService.sendMessage() → normalise response
        │
        ▼
useChat.ts → setMessages() → UI render
```

## Chaîne streaming (chat_stream_message)

```
chatService.sendMessageStream()
        │  invokeWithRetry('chat_stream_message', ...)
        ▼
overdrive::chat_orchestrator::chat_stream_message (src-tauri/src/overdrive/chat_orchestrator.rs)
        │  listen('chat:stream:chunk'), listen('chat:stream:complete')
        ▼
Streaming réponse → useChat.ts stream handlers
```

## Entrypoints identifiés

| Entrypoint | Fichier | Trigger |
|------------|---------|---------|
| sendMessage() | src/hooks/useChat.ts | ChatInput submit |
| sendMessageStream() | src/services/api/chat.ts | config.streaming=true |
| sendMessageLegacy() | src/services/api/chat.ts | compat (délègue à sendMessage) |
| sendMessage() | src/hooks/useConversationEngine.ts | hook alternatif |
| E2E mock | src/services/api/chat.ts | window.__TITANE_E2E_CHAT_MOCK__=true |

## Verdict

- **Chaîne OMEGA principale** : PROVEN (code + registration + IPC parity)
- **Chaîne streaming** : PROVEN (code + registration, runtime streaming non testé ici)
- **E2E mock** : BOUNDED (flag window uniquement, non actif en prod)
- **send_message STUB** : CONNU (main.rs ligne 699, log::warn émis, retourne Err — non exposé comme chemin de prod)
