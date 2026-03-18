# ACTION_RUNTIME_MAP

## Route action
- UI: TopNav click (/admin)
- Store/service: Router navigate
- Backend: none
- Feedback: AdminPage rendered
- Class: PROVEN_VISIBLE_ONLY

## Settings action
- UI: Admin -> config/audio tabs
- Store/service: tab state + config service paths
- Backend: tauri invoke for persisted config where applicable
- Feedback: tab content + toasts
- Class: PARTIAL_CHAIN

## Chat submit action
- UI: input/send in chat surface
- Store/service: useChat -> useChatCore -> chatEngine
- Invoke/backend: conversation_generate
- Feedback: assistant message or explicit error
- Class: UI_ONLY in this run (legacy chat.spec fails selectors)

## Provider action
- UI: provider selector change
- Service: setProvider + orchestrator provider preference
- Backend: provider resolution in policy/router/resilience pipeline
- Feedback: provider label/status
- Class: PARTIAL_CHAIN

## Memory/history action
- UI: conversation/history surfaces
- Service: chatMemoryCompactor + conversation storage
- Backend: memory read/history commands
- Feedback: memory cards/history list
- Class: PARTIAL_CHAIN

## Degraded/error action
- UI: error fallback in chat
- Service: retry/backoff + boundary
- Backend: policy/resilience block metadata
- Feedback: explicit fallback/error state
- Class: PARTIAL_CHAIN
