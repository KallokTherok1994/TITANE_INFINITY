# PERF RUNTIME MATRIX — OMEGA TIMEOUT RECERT

| scenario | TTFT_before_estimate | TTFT_after | total_before_estimate | total_after | retries | fallback_count | useful_response | verdict |
|---|---|---|---|---|---|---|---|---|
| A — simple (llama3.2:1b) | ~1s | ~1s | ~4s | 4177ms | 0 | 0 | YES | STABLE |
| C — complex (llama3:latest) | TIMEOUT at 8s → ERROR | ~9s (model load) | NEVER COMPLETES | 40412ms | 0 (1 attempt) | 0 | YES | PASS |
| D — stream run 1 (llama3.2:1b) | TIMEOUT at 8s → ERROR | ~1s | NEVER COMPLETES | 52326ms | 0 | 0 | YES | PASS |
| D — stream run 2 | TIMEOUT at 8s → ERROR | ~1s | NEVER COMPLETES | 43144ms | 0 | 0 | YES | PASS |
| D — stream run 3 | TIMEOUT at 8s → ERROR | ~1s | NEVER COMPLETES | 52434ms | 0 | 0 | YES | PASS |

## Notes

- **before_estimate**: Based on code inspection — `min(8000, 8000, 60000) = 8000ms` → hard cut at 8s, request returned as error
- **after**: Measured directly against Ollama API backend (2026-03-15 ~16:00-16:10 UTC-4)
- **TTFT_after**: ~1s for stream (Ollama begins token emission quickly); ~9-10s for non-stream with cold model load
- **retries**: 0 in all post-fix tests — primary attempt succeeds
- **fallback_count**: 0 — no fallback needed (primary provider completes)
- **useful_response**: YES — full grammatically correct responses delivered

## Key Metric: Retry Chain Elimination

| Metric | Before Fix | After Fix |
|---|---|---|
| providerAttemptMs | 8000ms | 50000ms |
| maxAttempts | 3 | 2 |
| Worst case retry chain | 3×8s = 24000ms → ERROR | 2×45s max (never reached) |
| Complex query outcome | ALWAYS FAILS | SUCCEEDS at 40-52s |

## Baseline Caveat
"before" values are code-derived estimates (no clean pre-patch runtime snapshot available).  
The before_estimate is conservative and matches the proven formula `min(8000, 8000, 60000)=8000ms`.
