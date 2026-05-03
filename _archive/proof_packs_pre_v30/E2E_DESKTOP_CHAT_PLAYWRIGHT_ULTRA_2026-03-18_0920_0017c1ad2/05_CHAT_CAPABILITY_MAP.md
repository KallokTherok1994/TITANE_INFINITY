# CHAT_CAPABILITY_MAP

| Capability | Surface | Dependency chain | Current class |
|---|---|---|---|
| Page boot | /titane conversation | router -> TitanePage -> ConversationSection | PROVEN_VISIBLE_ONLY |
| Prompt submit | tests/e2e/chat.spec.ts | UI -> useChat -> useChatCore -> chatEngine -> backend | UI_ONLY (test fails) |
| Assistant response render | MessageBubble | response metadata + content render | PARTIAL_CHAIN |
| Provider selector | ChatProviderSelector | localStorage + setProvider + orchestrator | PARTIAL_CHAIN |
| Retry/regenerate path | ChatWindow retry logic | sendMessage with backoff | PARTIAL_CHAIN |
| Memory/history path | useChatMemory + conversation storage + persistent memory | local + backend memory commands | PARTIAL_CHAIN |
| Provider failure/degraded path | policy/resilience in Rust commands | policy verdict + fallback provider | PARTIAL_CHAIN |
| Persistence/switch | conversation storage lifecycle | localStorage + lifecycle engine | PARTIAL_CHAIN |

## Anti-lie note
- No claim promoted to runtime-certified without passing runtime chain proof.
