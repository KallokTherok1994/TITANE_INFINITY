# PROVIDER READINESS TRUTH
## Date: 2026-03-21

## Provider: Ollama (local, 127.0.0.1:11434)

### Pre-patch state (BEFORE this session)
- **Readiness check**: `/api/tags` curl (shallow — only proves process is running, NOT model warm)
- **Model used**: gemma2:2b
- **Cold-start behavior**: gemma2:2b first-token latency on cold load = confirmed > 60s (observed from Run 2 failure, 131s total)
- **Pre-warm**: ABSENT — no warmup before WDIO launch

### Readiness classification
- **Shallow probe** (`/api/tags` → 200 OK): confirms Ollama process alive, HTTP stack responding
- **Deep readiness** (first generate request responds within time budget): NOT proven by shallow probe
- **"curl /api/tags OK" ≠ real first-response readiness** — confirmed

### Root cause evidence
- Run 2 failure: `ipcReadyState=READY` (product/IPC healthy) + `kind=timeout` (no response in 120s)
- The Rust `ollama.rs` HTTP client has `timeout = 60s`
- When model is cold: Ollama accepts the HTTP connection but takes >60s to produce first token
- Rust client fires HTTP timeout → no response returned to Rust → conversation_engine returns error
- Frontend receives no assistant message → WDIO poll expires

### Measurement (pre-warm timing, post-patch)
| Run | Pre-warm elapsed | Model state | WDIO duration |
|---|---|---|---|
| Run 1 | 3s | Warm (from prev session Ollama usage) | 23.4s |
| Run 2 | 1s | Warm | 1m 22.8s |
| Run 3 | 2s | Warm | 42.3s |

Note: Runs 1-3 pre-warm responded in 1-3s = model already in memory → confirms pre-warm guarantees fast subsequent test response.

### Post-patch readiness check strategy
1. Check Ollama reachable (`/api/tags` → 200 OK within 5s)
2. Send real generate request with model (`/api/generate`, stream=false) → wait up to 120s
3. Log `[E2E_PREWARM] PASS` only if response contains `"response"` key
4. If unreachable: `[E2E_PREWARM] WARN` + continue (honest skip, not fake pass)

## Gate: G_PROVIDER_READINESS_TRUTH: PASS
