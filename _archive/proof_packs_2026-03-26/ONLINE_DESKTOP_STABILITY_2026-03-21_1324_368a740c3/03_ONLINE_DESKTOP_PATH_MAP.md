# ONLINE DESKTOP PATH MAP
## Date: 2026-03-21

## Path Decomposition

| Step | File/Script | Proof Type | Evidence | Failure Mode | Responsibility |
|---|---|---|---|---|---|
| 1. Desktop launch | `scripts/e2e/run-online-chat-proof-ui.sh` + `wdio.desktop.conf.cjs` | Runtime log | tauri-driver.log: session started | Binary not found | HARNESS |
| 2. Embedded mode | `e2e/desktop/online-chat-proof-ui.wdio.test.js` line 1+ | DOM inspection | `[APP_SOURCE] sourceMode=embedded href=tauri://localhost/titane` | Dev-server detected instead | HARNESS |
| 3. IPC ready | WDIO test: `data-testid="ipc-ready"` | DOM attribute | `ipcReadyState: READY` (all runs) | Boot sequence failed | PRODUCT/IPC |
| 4. Provider readiness | ❌ Pre-patch: NO CHECK. Post-patch: `[E2E_PREWARM]` curl to Ollama | Infra preflight log | `[E2E_PREWARM] PASS: model loaded and warm` | Ollama unreachable / model not warm | INFRA |
| 5. First message send | WDIO test: `input.setValue()` + trigger click | DOM interaction | `[ASSISTANT_SNAPSHOT] beforeCount=0` | Input not found/enabled | HARNESS |
| 6. Rust backend call | `conversation_generate` → `conversation_engine` → `ollama.rs` | Rust runtime | Process responds within 60s HTTP cap | HTTP timeout (60s) fires | INFRA+PRODUCT |
| 7. First assistant response | WDIO test: poll `data-testid="chat-message-assistant"` | DOM polling | `afterCount=1` DOM mutation detected | DOM never updates (degraded/silent) | PRODUCT |
| 8. Response capture | WDIO test: `outcome.kind === 'assistant'` assertion | Assertion | All 3 post-patch runs: kind=assistant | kind=timeout | HARNESS/INFRA |
| 9. ASSISTANT_SNAPSHOT | WDIO test line ~889 | Log marker | `[ASSISTANT_SNAPSHOT] beforeCount=0 afterCount=1` | Not reached | PRODUCT/IPC |
| 10. Artifact write | `run-online-chat-proof-ui.sh` tee to `$WDIO_LOG` | File artifact | `reports/e2e-desktop/PREWARM_RUN*/` | File write failure | HARNESS |

## Gate: G_ONLINE_DESKTOP_PATH_MAPPED: PASS
