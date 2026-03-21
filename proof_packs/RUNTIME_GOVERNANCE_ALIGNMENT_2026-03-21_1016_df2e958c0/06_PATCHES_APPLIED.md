# Phase 5 — Patches Applied

## Patch Family: RUNTIME_CONFIG_AUTHORITY_DRIFT

### Patch A — Expose OLLAMA_REQUEST_TIMEOUT_SECS in ai/ollama.rs

File: src-tauri/src/ai/ollama.rs
- Added `OLLAMA_REQUEST_TIMEOUT_SECS_ENV` constant
- Added `OLLAMA_REQUEST_TIMEOUT_SECS_DEFAULT = 120` constant
- Added `ollama_request_timeout()` function: reads env, bounds 10..300, falls back to 120s
- Wired `build_ollama_client()` to use `.timeout(ollama_request_timeout())`
- Added 7 unit tests with static `ENV_TEST_LOCK: Mutex<()>` to prevent parallel env race
- Duration import added

### Patch B — Remove dead TITANE_CONVERSATION_TIMEOUT_SECS from harness

File: scripts/e2e/run-online-chat-proof-ui.sh
- Removed active export of TITANE_CONVERSATION_TIMEOUT_SECS
- Added OLLAMA_REQUEST_TIMEOUT_SECS export (default 60s for harness, overridable)
- Added label comment "[DEAD — no Rust runtime honors this env var]"
- Updated echo to show OLLAMA_REQUEST_TIMEOUT_SECS

File: wdio.desktop.conf.cjs
- Removed TITANE_CONVERSATION_TIMEOUT_SECS from writeWrapperEnvFile() keys array
- Added OLLAMA_REQUEST_TIMEOUT_SECS with explanatory comment

## Rollback

git restore src-tauri/src/ai/ollama.rs scripts/e2e/run-online-chat-proof-ui.sh wdio.desktop.conf.cjs

## G_MINIMAL_ALIGNMENT_PATCH: PASS
