# 03 ROOT CAUSE ANALYSIS

## ROOT CAUSE MATRIX

| CAUSE | PROOFS_FOR | PROOFS_AGAINST | STATUS |
|---|---|---|---|
| H1: Provider not ready (warmup) | N/A | gemma2:2b warms in 2.5s | FAIL |
| H2: Sublayer secondary timeout | Overhead ~50ms total | Negligible on this machine | FAIL (not main cause) |
| H3: AUTO/cascade fragile branch | N/A | gemini=None, unifiedIA=None, no cascade | FAIL |
| H4: Fallback triggered too early | Campaign-B 22s match 20s guard | Only if old binary is used | FAIL (symptom not cause) |
| H5: Metadata misclassification | N/A | Meta mapping is correct | FAIL |
| H6: Wrapper/runtime divergence | Campaign-B 22.1/22.2/22.5s = exactly 20s guard; AppImage built Mar 7 (pre-patch) | S2 runs used TAURI_BINARY_PATH to release binary | **CONFIRMED ROOT CAUSE** |
| H7: Other | N/A | N/A | N/A |

## Conclusion

Single root cause: **H6 — WDIO default binary was the pre-patch AppImage**.

When `TAURI_BINARY_PATH` was not set:
- `wdio.desktop.conf.cjs` used AppImage `v27.0.2_prod_final`
- AppImage compiled March 7 (before timeout patch of March 14)
- AppImage has `DEFAULT_TIMEOUT_SECS=20` (old value)
- All requests > 20s → outer guard fires → `provider=timeout-degraded`

When `TAURI_BINARY_PATH` was explicitly set to release binary:
- Release binary compiled March 14 (after patch)
- Has `DEFAULT_TIMEOUT_SECS=60`
- Requests complete in 6-12s → no timeout

## Chain of evidence

1. S1 BEFORE (pre-patch): 22.7s → timeout-degraded (old binary, 20s guard)
2. S2 AFTER (post-patch, release binary forced): 45.2s/38.3s/24.6s → Ollama OK
3. Campaign-B (no TAURI_BINARY_PATH): 22.1/22.2/22.5s → timeout-degraded (old binary again!)
4. S4 AFTER H6-FIX (release binary now default): 30.3/42.8/30.7s → Ollama OK
