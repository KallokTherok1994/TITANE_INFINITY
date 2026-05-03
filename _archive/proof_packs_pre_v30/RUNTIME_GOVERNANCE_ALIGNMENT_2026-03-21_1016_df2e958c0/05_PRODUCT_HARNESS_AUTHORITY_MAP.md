# Phase 4 — Product vs Harness Authority Map

| Behavior | Owner | Evidence |
|---|---|---|
| Ollama HTTP request timeout | **Product runtime** (OLLAMA_REQUEST_TIMEOUT_SECS, default 120s) | ai/ollama.rs:ollama_request_timeout() |
| Provider readiness probe | Product runtime | ai/ollama.rs:is_available() + ai/router.rs cache |
| Ollama pre-warm | **Harness** | scripts/e2e/run-online-chat-proof-ui.sh [E2E_PREWARM] block |
| WDIO response wait (120s) | **Harness** | e2e/desktop/online-chat-proof-ui.wdio.test.js:9 |
| Desktop Tauri binary path | Harness + product | TAURI_BINARY_PATH env → wdio wrapper |
| First-response timeout | Product runtime (no explicit frontend cap) | secureInvoke timeout=0 = no JS cap; Rust governs |
| Online API availability | Provider infra + env/keystore | Not in product code path for local Ollama |
| Model selection (default gemma2:2b) | Product runtime (env override OLLAMA_DEFAULT_MODEL) | ai/ollama.rs:ollama_default_model() |
| Artifact freshness/version | Build artifact | release binary = v28.5.0; AppImage = v28.0.0 (STALE) |

## Key Separation Achieved
Harness owns: prewarm, WDIO assertion timeout, binary path override.
Product owns: HTTP client timeout (now governed), provider probe, model selection.
No confusion between the two.

## G_PRODUCT_HARNESS_AUTHORITY_CLEAR: PASS
