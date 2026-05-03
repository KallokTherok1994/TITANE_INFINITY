# X3 ONLINE DESKTOP STABILITY PROOF
## Date: 2026-03-21

## Test: e2e/desktop/online-chat-proof-ui.wdio.test.js
## Runtime: wry 0.54.4 (Tauri embedded) on Linux
## Binary: src-tauri/target/release/titane-infinity v28.5.0
## Model: gemma2:2b (via Ollama 127.0.0.1:11434)

## Run Results

| Run | Start UTC | Pre-warm | WDIO Duration | Result | Class | ASSISTANT_SNAPSHOT |
|---|---|---|---|---|---|---|
| 1 | 2026-03-21T13:20:18Z | 3s | 23.4s | PASS | PASS_X3 | beforeCount=0 afterCount=1 |
| 2 | 2026-03-21T13:20:50Z | 1s | 82.8s | PASS | PASS_X3 | beforeCount=0 afterCount=1 |
| 3 | 2026-03-21T13:22:19Z | 2s | 42.3s | PASS | PASS_X3 | beforeCount=0 afterCount=1 |

## Score: **3/3 PASS** ✅

## Classification per run
All 3 runs: `PASS_X3` — real message sent, real assistant response received via Tauri IPC embedded runtime.

## Stability classification
- **IPC**: STABLE — `ipcReadyState=READY` all runs
- **Provider**: STABLE — Ollama warm (pre-warm confirmed)
- **Source mode**: STABLE — `sourceMode=embedded` all runs
- **Response time range**: 23-83s (variation due to model generation, not IPC or harness)

## Artifacts
- `reports/e2e-desktop/PREWARM_RUN1_20260321T132018Z/`
- `reports/e2e-desktop/PREWARM_RUN2_20260321T132050Z/`
- `reports/e2e-desktop/PREWARM_RUN3_20260321T132219Z/`

## Gate: G_X3_ONLINE_DESKTOP: PASS (3/3)
## Gate: G_NO_FAKE_STABLE: PASS — all runs honest, pre-warm labeled as infra, no timeout masked
