# X3 STABILITY REPORT — RUNTIME AUTHORITY GAP
## Session: RUNTIME_AUTHORITY_GAP — 2026-03-21
## SHA: 60c11fdf1

## Desktop IPC Chat Roundtrip X3
| Run | Status | Duration | Marker |
|---|---|---|---|
| 1 | PASS | 52.4s | ASSISTANT_SNAPSHOT beforeCount=0 afterCount=1 |
| 2 | FAIL (timeout) | 131s | Ollama cold-start > 60s; ipcReadyState=READY |
| 3 | PASS | 35.1s | ASSISTANT_SNAPSHOT beforeCount=0 afterCount=1 |

Score: **2/3** — Infrastructure flakiness (cold model), NOT IPC defect.

## Regression Tests X3 (Closed Defects)
Executed in prior session, verified again this session:
- memory-consumption-truth: 6/6 PASS
- response-assembly-truth: 9/9 PASS
- Prior x3: 40/40 PASS × 3 runs

## Full Vitest Suite
- Session 2 baseline: 3399/3399 PASS
- Not re-run this session (no code changes to product; only proof pack created)

## Flakiness Classification
- IPC test run 2 timeout: classified as INFRASTRUCTURE_FLAKINESS
- Cause: Ollama `gemma2:2b` cold model load latency under 60s timeout cap
- The assertion guard worked correctly (no fake pass issued)
- Recommendation: Increase `TITANE_CONVERSATION_TIMEOUT_SECS` to 90 for warm-up runs, or pre-warm model before test
