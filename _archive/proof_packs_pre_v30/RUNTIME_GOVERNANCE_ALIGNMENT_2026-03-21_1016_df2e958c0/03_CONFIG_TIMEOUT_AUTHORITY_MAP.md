# Phase 2 — Config/Timeout Authority Map

| Timeout | Value | Source | Control | Live? | Doctrinally Correct? |
|---|---|---|---|---|---|
| Ollama HTTP client (ai/ollama.rs) | **120s default** (was: platform default) | src-tauri/src/ai/ollama.rs:73 | `OLLAMA_REQUEST_TIMEOUT_SECS` env | LIVE (PATCHED) | YES — now governed |
| Ollama HTTP client (root ollama.rs) | 60s hardcoded | src-tauri/src/ollama.rs:53 | None | DEAD (orphaned file) | N/A |
| Chat engine Fast profile | 30s | src-tauri/src/chat_engine/config.rs:70 | Code only | LIVE | YES (different IPC path) |
| Chat engine Balanced profile | 52s | src-tauri/src/chat_engine/config.rs:84 | Code only | LIVE | YES |
| Chat engine Deep profile | 82s | src-tauri/src/chat_engine/config.rs:98 | Code only | LIVE | YES |
| Frontend secureInvoke timeout | 0 (disabled) | src/lib/security.ts:1319 | `SecureInvokeOptions.timeout` | LIVE but disabled | Documented as legacy metric |
| tauriClient conversationGenerate | No timeout set | src/lib/tauriClient.ts:649 | None | DEAD OPTION | Minor gap — secureInvoke timeout=0 means no frontend cap |
| WDIO assistantTimeoutMs | 120s | e2e/desktop/online-chat-proof-ui.wdio.test.js:9 | Harness hardcode | LIVE | HARNESS ONLY |
| TITANE_CONVERSATION_TIMEOUT_SECS | 30s (was set) | scripts/e2e/run-online-chat-proof-ui.sh:29 | env var | DEAD (no Rust reads it) | REMOVED — replaced with OLLAMA_REQUEST_TIMEOUT_SECS |
| Prewarm curl timeout | 120s | scripts/e2e/run-online-chat-proof-ui.sh | Harness only | LIVE | HARNESS ONLY, correct |
| OLLAMA_REQUEST_TIMEOUT_SECS | 60s default (env) | scripts/e2e/run-online-chat-proof-ui.sh:31 | env → ai/ollama.rs | LIVE (NEW) | YES — governs actual HTTP client |

## G_CONFIG_TIMEOUT_AUTHORITY_MAPPED: PASS
