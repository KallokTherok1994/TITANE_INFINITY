# FIX ACTIVATION MATRIX

| parameter | source_file_value | built_artifact_value | runtime_observed_value | status |
|---|---|---|---|---|
| PROVIDER_TIMEOUTS.ollama | 45_000ms | N/A (Vite-compiled JS, no separate artifact) | 45000ms (HMR via Vite dev PID 1339482) | PROVEN |
| PROVIDER_TIMEOUTS.tauri-backend | 50_000ms | N/A | 50000ms | PROVEN |
| REQUEST_BUDGETS.providerAttemptMs | 50_000ms | N/A | 50000ms | PROVEN |
| REQUEST_BUDGETS.maxAttempts | 2 | N/A | 2 | PROVEN |
| REQUEST_BUDGETS.globalRequestMs | 52_000ms | N/A | 52000ms | PROVEN |
| STREAM_CONFIG.totalTimeoutMs | 52_000ms | N/A | 52000ms | PROVEN |
| UI_TIMEOUTS.ollamaProvider.short | 20_000ms | N/A | 20000ms | PROVEN |
| UI_TIMEOUTS.ollamaProvider.long | 45_000ms | N/A | 45000ms | PROVEN |
| ChatProfile (Rust, BALANCED) | first_token=7s total=52s | binary compiled 11:56:49 — contains patch | NOT ON REAL PATH (mock feature default) | SUSPECT |
| Cargo features default | `["custom-protocol","mock","audio-capture"]` | confirmed nm output | mock_commands::generate_response active | PROVEN |

## Activation Evidence

```
$ grep "^default" src-tauri/Cargo.toml
default = ["custom-protocol", "mock", "audio-capture"]

$ nm src-tauri/target/debug/titane-infinity | grep "generate_response"
... titane_infinity::mock_commands::generate_response ...   ← mock path
# No: titane_infinity::chat_engine::commands::generate_response  ← NOT compiled

$ grep -n "ollama" src/config/aiTimeouts.config.ts
17:  ollama: 45_000,  // Local LLM — realistic generation window
55:  ollamaProvider: { short: 20_000, long: 45_000 }

$ grep -n "providerAttemptMs\|maxAttempts" src/config/aiTimeouts.config.ts
34:  providerAttemptMs: 50_000,
35:  maxAttempts: 2,
```

## Call Path Proof

Real UI chat path:
```
useChatCore.ts:113-115
  Math.min(
    getProviderTimeout('ollama'),      // 45000ms ← FIXED
    REQUEST_BUDGETS.providerAttemptMs, // 50000ms ← FIXED
    REQUEST_BUDGETS.globalRequestMs    // 52000ms ← FIXED
  ) = 45000ms
  (was: min(8000, 8000, 60000) = 8000ms)

orchestrator.ts:1065-1066
  same formula → 45000ms per attempt
  maxAttempts=2 → max chain = 90000ms
  (was: 3×8000ms = 24000ms hard freeze)
```

## Vite Runtime
- PID 1339482: `node vite.js` watching src/
- Vite HMR active: file changes are hot-reloaded
- commit 4ede39ac8 modified `src/config/aiTimeouts.config.ts` (on disk with fixed values)
- Any page served by Vite dev server uses fixed values
