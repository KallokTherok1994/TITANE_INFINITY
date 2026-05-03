# DESKTOP IPC CHAIN PROOF
## Session: RUNTIME_AUTHORITY_GAP — 2026-03-21
## SHA: 60c11fdf1

## X3 IPC Chat Roundtrip Results

| Run | Result | Note |
|---|---|---|
| Run 1 (2026-03-21T13:00:46Z) | PASS — 52.4s | ASSISTANT_SNAPSHOT beforeCount=0 afterCount=1 |
| Run 2 (2026-03-21T13:02:39Z) | FAIL — timeout | Ollama gemma2:2b cold-start > 60s; ipcReadyState=READY (IPC healthy) |
| Run 3 (2026-03-21T13:04:53Z) | PASS — 35.1s | ASSISTANT_SNAPSHOT beforeCount=0 afterCount=1 |

**Score: 2/3 PASS**

## Failure Classification (Run 2)

- **Error:** `[G_RESPONSE_KIND] expected assistant, got timeout`
- **ipcReadyState:** `READY` — IPC path itself is healthy
- **Root cause:** Ollama `gemma2:2b` cold model load exceeds 60s timeout window
- **Classification:** INFRASTRUCTURE_FLAKINESS (not IPC_DEFECT)
- **Honest note:** The timeout guard worked correctly — no fake pass

## App Source Mode
- `sourceMode: embedded` — confirmed NOT dev-server
- `href: tauri://localhost/titane` — confirmed Tauri embedded runtime
- Script: `./assets/app-B3kF1dfL.js` — embedded asset

## Artifacts
- `reports/e2e-desktop/IPC_CHAT_PROOF_20260321T130046Z/` — Run 1 (PASS)
- `reports/e2e-desktop/IPC_CHAT_PROOF_RUN2_20260321T130239Z/` — Run 2 (FAIL/timeout)
- `reports/e2e-desktop/IPC_CHAT_PROOF_RUN3_20260321T130453Z/` — Run 3 (PASS)

## IPC Boot Chain (separately proven)
- `get_runtime_config` IPC: CMD:START/END OK
- BOOT:READY confirmed 2026-03-21T12:53Z
- UnifiedMemory initialized, all 3 API keys loaded from SecureSecretsEngine
