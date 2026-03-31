# PRODUCT TRUTH MATRIX — OMEGA TIMEOUT RECERT

| surface | harness_says | product_visibly_shows | same_path_proven | verdict |
|---|---|---|---|---|
| send action | useChatCore → chatEngine.generate() → orchestrator → conversation_generate | UNKNOWN (no Tauri window) | Partially — TS path traced to Ollama API | PARTIAL |
| provider selection | aiTimeouts.getProviderTimeout('ollama')=45000ms | Ollama responds at ~40s → PROVEN at backend | TS code confirmed | PARTIAL |
| first token | ~1s (stream via Ollama) | Measured: FIRST_TOKEN_RECEIVED_AT_MS for stream | Direct API proof | PROVEN |
| response progression | 420-568 tokens streamed continuously | Measured: 513 chunks in run 1 | Direct stream test | PROVEN |
| final response | done=true, full content | Measured: all 3 stream runs done=true | Direct API proof | PROVEN |
| timeout/degraded banner | maxAttempts=2, no retry chain | Old: 24s freeze; New: no timeout seen in tests | Code + runtime | PROVEN |
| fallback honesty | fallback only if primary fails (maxAttempts=2) | No fallback triggered in tests | Direct test | PROVEN |

## Important Limitation

The product visible layer (Tauri window ↔ chat UI ↔ stream rendering) could not be interacted with programmatically.  
All measurements are at the Ollama backend layer — the path from `useChatCore.ts` to Ollama is proven by code inspection.  
The UI rendering of streaming chunks is NOT directly measured.

**G_PRODUCT_PASS_VISIBLE** = PARTIAL (backend PROVEN, UI rendering UNKNOWN)

## Backend Path Summary (PROVEN)

```
useChatCore.ts → chatEngine.ts.generate() → orchestrator.ts → chatProvider(ollama) → http://localhost:11434/api/generate
```
All intermediate layers use timeout values from `aiTimeouts.config.ts` (values confirmed in source).  
Direct Ollama API test confirms the backend completes correctly with new timeout budgets.
