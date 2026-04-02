# 02_TIMEOUT_CARTOGRAPHY

## Active Timeout Matrix

| Layer | File | Value | Status | Note |
|---|---|---:|---|---|
| Conversation outer guard | `src-tauri/src/conversation_engine/mod.rs:64` | `60s` default (`5..180`) | ACTIVE | Main timeout guard for `process_message(...)`. |
| Frontend command timeout | `src/lib/tauriClient.ts:23` and `src/lib/tauriClient.ts:647` | `75_000ms` | ACTIVE | Applied only to `conversation_generate` wrapper. |
| Frontend secure invoke default | `src/lib/security.ts:1286` | `30_000ms` | ACTIVE | Global default for commands without explicit timeout override. |
| Local provider HTTP timeout | `src-tauri/src/ai/providers/local.rs:62` | `60s` | ACTIVE | Local provider request timeout. |
| Local provider health timeout | `src-tauri/src/ai/providers/local.rs:129` | `2s` | ACTIVE | Fast health check timeout. |
| OpenAI provider HTTP timeout | `src-tauri/src/ai/providers/openai.rs:63` | `30s` | ACTIVE | Provider-level timeout. |
| Claude provider HTTP timeout | `src-tauri/src/ai/providers/claude.rs:64` | `30s` | ACTIVE | Provider-level timeout. |
| WDIO wait timeout | `wdio.desktop.conf.cjs:102` | `10_000ms` | ACTIVE | UI element wait timeout. |
| WDIO connection retry timeout | `wdio.desktop.conf.cjs:103` | `120_000ms` | ACTIVE | WebDriver connection retry timeout. |
| Wrapper env propagation | `scripts/e2e/tauri-wrapper.sh:41` | `TITANE_CONVERSATION_TIMEOUT_SECS` logged/sourced | ACTIVE | Runtime env witness for timeout override. |

## Propagation Markers

- `wdio.desktop.conf.cjs:22` forwards `TITANE_CONVERSATION_TIMEOUT_SECS`.
- `wdio.desktop.conf.cjs:23` forwards `TITANE_TIMEOUT_TRACE`.
- `scripts/e2e/tauri-wrapper.sh:41` logs effective `TITANE_CONVERSATION_TIMEOUT_SECS`.
- `scripts/e2e/tauri-wrapper.sh:126` to `scripts/e2e/tauri-wrapper.sh:133` keeps `OFFLINE_SIM` explicit/unset behavior.

## Key Finding

The main nominal cutoff was the backend outer guard default (`20s` before patch), not provider unavailability.
