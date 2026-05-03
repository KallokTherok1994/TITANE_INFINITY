# 09 Frontend Connection Integrity Map

Proven connection path (One Door compliant):

- UI: `ConversationSection.handleSend`
- Hook: `useChat.sendMessage`
- Service: `chatService.sendMessageLegacy`
- IPC gateway: `invokeWithRetry(...)`
- Runtime: Tauri command execution

Web research path:

- `webResearchService` uses `tauri<ResearchReport>('web_research', ...)` (no direct `fetch` in UI service).

Proof:

- `raw/10_conversation_action_links.txt`
- `raw/11_usechat_pipeline_links.txt`
- `raw/12_chat_service_ipc_links.txt`
- `raw/13_web_research_ipc_link.txt`
