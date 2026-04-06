# Phase 2/3 — Current Governance Lock

## Dominant Lock: RUNTIME_CONFIG_AUTHORITY_DRIFT

Sub-hypotheses evaluated:

| Hypothesis | Status | Finding |
|---|---|---|
| OLLAMA_TIMEOUT_UNSET | **CONFIRMED** | ai/ollama.rs build_ollama_client() had .build() with no .timeout() — platform default |
| DEAD_ENV_TIMEOUT_PATH | **CONFIRMED** | TITANE_CONVERSATION_TIMEOUT_SECS set in script + wdio config, never read by Rust |
| OLLAMA_TIMEOUT_HARDCODED | DISMISSED | root src/ollama.rs has 60s but is NOT compiled (orphaned file, not in any mod tree) |
| HARNESS_PRODUCT_AUTHORITY_SPLIT_INCOMPLETE | PARTIAL | Prewarm is clearly harness-only. Documented below. |
| ARTIFACT_VERSION_TRUTH_GAP | DEFERRED | AppImage v28.0.0 vs binary v28.5.0 — noted, non-blocking |
| CONFIG_SURFACE_NOT_EXPLICIT | RESOLVED by patch | |
| STABLE_BUT_NOT_SEALABLE | REMAINS TRUE | Release binary rebuild needed for SEALED |

## Key Discovery
- The root `src-tauri/src/ollama.rs` is an ORPHANED dead file (`#![allow(dead_code)]`).
- It is NOT referenced from `src-tauri/src/lib.rs` or any live module.
- The actual chat path uses `src-tauri/src/ai/ollama.rs::OllamaClient` via `AIRouter`.
- That file had NO explicit timeout on the HTTP client.
