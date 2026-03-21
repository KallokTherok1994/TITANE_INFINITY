# CURRENT STABILITY LOCK CLASSIFICATION
## Date: 2026-03-21T13:13Z

## Primary Lock (hypothesis input)
ONLINE_DESKTOP_STABILITY_GAP

## Sub-hypothesis analysis

| Sub-hypothesis | Evidence | Status |
|---|---|---|
| OLLAMA_COLD_START_TIMEOUT | Ollama HTTP client = 60s hardcoded; gemma2:2b cold > 60s → HTTP timeout fires | CONFIRMED |
| PROVIDER_READINESS_GAP | No preflight check before E2E; model assumed warm | CONFIRMED — root cause |
| HARNESS_TIMEOUT_TOO_TIGHT | WDIO test timeout = 120s (correct). Rust HTTP timeout = 60s (too tight for cold). | PARTLY — Rust binary fixed, harness strategy gap |
| PREWARM_MISSING | No model pre-warm in run script before session 3 | CONFIRMED — gap that triggered the fix |
| PRODUCT_LATENCY_REGRESSION | No evidence of product regression. ipcReadyState=READY in failed run | REFUTED |
| IPC_OK_PROVIDER_SLOW | ipcReadyState=READY confirmed in failed run. Provider (Ollama) simply cold. | CONFIRMED (IPC healthy, provider slow) |
| SOURCE_MODE_TRUTH_OK_BUT_RESPONSE_WINDOW_TOO_SHORT | sourceMode=embedded confirmed. Window only short on cold start | CONFIRMED — resolved by prewarm |

## Dominant Lock
**F: Mixed — C (provider cold-start) + E (Ollama HTTP 60s timeout too tight for cold load)**

## Resolution
Harness pre-warm added to `scripts/e2e/run-online-chat-proof-ui.sh`.
- Loads model into memory before WDIO starts
- Explicit [E2E_PREWARM] logging — not masqueraded as product success
- Skip-on-unreachable (WARN) — honest fail-fast for unavailable Ollama

## Lock status after patch
ONLINE_DESKTOP_STABILITY_GAP: **CLOSED** (X3 PASS post-patch)
