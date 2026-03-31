# 05_PROVIDER_TRUTH_CHAIN

| Stage | File | Symbol/Function | Input | Output | Truth Source | Status |
|-------|------|-----------------|-------|--------|-------------|--------|
| 1. Backend provider selection | `src-tauri/src/conversation_engine/commands.rs` | `conversation_generate` | message + conversationId | `meta: ProviderDecisionMeta` with `provider_used` | Backend runtime | PROVEN_RUNTIME |
| 2. Provider meta construction | `src-tauri/src/conversation_engine/commands.rs` | `ensure_provider_meta()` | `response.metadata` + `latency_ms` | `ProviderDecisionMeta { provider_used, mode, network_used, ... }` | Backend runtime | PROVEN_STATIC |
| 3. IPC serialization | `src-tauri/src/conversation_engine/commands.rs` | `serde_json::json!({...})` | `meta` | `{ "ok": true, "content": ..., "meta": {...}, "metadata": {...} }` | Backend runtime | PROVEN_STATIC |
| 4. Bridge reception | `src/services/api/chat.ts` | `sendMessage()` | `backendResponse` from `invokeWithRetry` | **LOCK1-REPAIR**: `actualProvider = backendResponse.meta.provider_used` | Canonical (meta) | PROVEN_RUNTIME |
| 5. ChatResponse construction | `src/services/api/chat.ts` | `sendMessage()` return | `actualProvider` | `ChatResponse.provider = actualProvider`, `metadata.provider_used = actualProvider`, `metadata.provider_meta = backendResponse.meta` | Canonical | PROVEN_RUNTIME |
| 6. TS type mapping | `src/types/tauri.ts` | `ChatResponse` interface | (implicit) | `provider: string`, `metadata?: Record<string, unknown>` | Static | PROVEN_STATIC |
| 7. Hook consumption | `src/hooks/useChat.ts` | `finalResponse` assignment | `chatServiceResponse.metadata` | `finalResponse.metadata.provider_used = actualProvider` | Truth chain | PROVEN_RUNTIME |
| 8. LOCK1 extraction | `src/hooks/useChat.ts` | LOCK1 patch | `finalResponse.metadata.provider_used` | `actualProviderUsed = actualProvider` | LOCK1-REPAIR | PROVEN_RUNTIME |
| 9. metadataPatch | `src/hooks/useChat.ts` | `metadataPatch` | `actualProviderUsed` + `preferredProviderState` | `{ providerUsed: actualProvider, requestedProvider: preference }` | Truth | PROVEN_RUNTIME |
| 10. Message store | `src/hooks/useChat.ts` | `updateAssistant()` | `metadataPatch` | `message.metadata.providerUsed = actualProvider` | Truth | PROVEN_STATIC |
| 11. ChatWindow prop | `src/components/ChatWindow.tsx` | `MessageBubble` render | `message.metadata` | `metadata={message.metadata}` prop passed | Wired | PROVEN_STATIC |
| 12. UI badge display | `src/components/chat/MessageBubble.tsx` | provider badge | `metadata.providerUsed` | Badge text = actual provider, mismatch ⚠ if ≠ requestedProvider | Truth | PROVEN_RUNTIME |
| 13. Fallback behavior | `src/services/api/chat.ts` | `sendMessage()` | no `meta` in response | `provider = 'tauri-backend'` (explicit, not invented) | Explicit fallback | PROVEN_RUNTIME |
| 14. Degraded behavior | `src/hooks/useChat.ts` | LOCK1 patch | `metadata.provider_used = undefined` | falls back to `provider` (same `'tauri-backend'`) | Explicit | PROVEN_STATIC |

## Chain status: COMPLETE — PROVEN_RUNTIME
