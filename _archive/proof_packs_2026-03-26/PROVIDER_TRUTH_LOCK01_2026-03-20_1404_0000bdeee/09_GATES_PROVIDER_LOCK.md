# 09_GATES_PROVIDER_LOCK

| Gate | Result | Evidence |
|------|--------|---------|
| G_BOOT_TRUTH | PASS | `chat.ts sendMessage` now reads `backendResponse.meta.provider_used` as canonical source on first response |
| G_SOURCE_OF_TRUTH_CLARIFIED | PASS | Single truth source: `backendResponse.meta.provider_used` → `ChatResponse.provider` → `metadata.provider_used` |
| G_UI_RUNTIME_CHAIN_TRUTH | PASS | Full chain proven: backend → sendMessage → chatServiceResponse → finalResponse → metadataPatch → MessageBubble badge |
| G_NO_LYING_UI | PASS | Badge shows actual backend provider; mismatch ⚠ indicator when actual ≠ preferred; `'tauri-backend'` fallback when meta absent (not invented) |
| G_PROVIDER_ROUTER_TRUTH | PASS | `ensure_provider_meta()` in Rust is canonical; `sendMessage()` now reads it correctly |
| G_TESTS_X3 | PASS | 5 tests × 3 runs = 15/15 PASS (including RP4: preferred=ollama, actual=gemini → badge shows gemini) |
| G_ROLLBACK_READY | PASS | `git restore -- src/services/api/chat.ts src/services/api/chat.test.ts src/hooks/useChat.ts src/components/ChatWindow.tsx src/components/chat/MessageBubble.tsx src/components/chat/MessageBubble.css` |
