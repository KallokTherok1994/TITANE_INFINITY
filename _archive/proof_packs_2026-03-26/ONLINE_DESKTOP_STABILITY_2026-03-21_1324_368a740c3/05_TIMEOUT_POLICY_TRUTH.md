# TIMEOUT POLICY TRUTH
## Date: 2026-03-21

## Timeout Chain Classification

| Timeout | Value | Source | Protects | Assessment | Evidence |
|---|---|---|---|---|---|
| Ollama HTTP client | **60s** | `src-tauri/src/ollama.rs:53` `Client::builder().timeout(Duration::from_secs(60))` | Rust → Ollama HTTP response | **TOO TIGHT for cold model load.** gemma2:2b cold > 60s. | Run 2 failure: 131s elapsed with no response |
| Rust chat_engine Balanced response_timeout | **52s** | `src-tauri/src/chat_engine/config.rs:84` | Rust generate stage | SECONDARY — Ollama HTTP fires at 60s, within the 52s window → actually Balanced fires at 52s first | Config confirmed |
| Rust chat_engine Fast response_timeout | **30s** | `src-tauri/src/chat_engine/config.rs:70` | Fast profile | TOO TIGHT — would always fail cold | Config confirmed |
| Rust chat_engine Deep response_timeout | **82s** | `src-tauri/src/chat_engine/config.rs:98` | Deep profile | Better for cold but still risky | Config confirmed |
| Frontend tauriClient conversation_generate | **75s** | `src/lib/tauriClient.ts` (per AH-2026-03-14-0003) | Frontend IPC invoke | Correct — wider than 60s Rust cap | AutoHeal entry |
| WDIO assistantTimeoutMs | **120s** | `e2e/desktop/online-chat-proof-ui.wdio.test.js:9` default | WDIO DOM poll window | CORRECT — wide enough post-prewarm | Confirmed |
| TITANE_CONVERSATION_TIMEOUT_SECS | **30 (env)** | `scripts/e2e/run-online-chat-proof-ui.sh:29` | Previously conversation_engine guard | **DEAD CODE** — no Rust code reads this env var currently. Comment in mod.rs: "Timeout guard removed" | Source search: 0 matches in Rust |
| Overall WDIO test timeout | **180s** | `e2e/desktop/online-chat-proof-ui.wdio.test.js:865` `this.timeout(180000)` | Full test run | Adequate | Confirmed |
| Pre-warm curl timeout | **120s** | `run-online-chat-proof-ui.sh:PREWARM_TIMEOUT_SECS=120` | Prewarm cold load | Correct — handles worst-case cold load | Post-patch confirmed |

## Key Finding
- **The Ollama HTTP 60s cap is the real gating timeout** for cold Ollama behavior.
- It is hardcoded in the compiled binary — cannot be changed via env var without Rust rebuild.
- Post-patch: pre-warm resolves this by loading model before the 60s window opens.
- `TITANE_CONVERSATION_TIMEOUT_SECS` is effectively dead code in current binary.

## Recommendation (non-blocking)
In a future minor update: expose `OLLAMA_REQUEST_TIMEOUT_SECS` env var in `ollama.rs` to allow harness-controlled timeout override without full rebuild.

## Gate: G_TIMEOUT_POLICY_TRUTH: PASS
