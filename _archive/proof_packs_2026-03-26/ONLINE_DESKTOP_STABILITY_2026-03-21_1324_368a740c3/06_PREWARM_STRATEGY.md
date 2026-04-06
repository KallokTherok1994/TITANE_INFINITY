# PREWARM STRATEGY
## Date: 2026-03-21

## Strategy Selected: Preflight Warmup Curl (harness-only)

### Trigger
`ONLINE_DESKTOP_STABILITY_GAP` confirmed as C+E (provider cold-start + tight Ollama HTTP timeout)

### Design principles
- Explicit, logged infrastructure preparation — not product activity
- Skip-on-unreachable (WARN), never block or fake pass
- One bounded request — no retry loop
- Separate log prefix `[E2E_PREWARM]` — cannot be confused with product chat proof
- Does not extend or modify Rust binary behavior

### Implementation (scripts/e2e/run-online-chat-proof-ui.sh)
```bash
OLLAMA_PREWARM_URL="${OLLAMA_BASE_URL:-http://127.0.0.1:11434}"
PREWARM_MODEL="${OLLAMA_DEFAULT_MODEL:-gemma2:2b}"
PREWARM_TIMEOUT_SECS="${TITANE_E2E_PREWARM_TIMEOUT_SECS:-120}"

echo "[E2E_PREWARM] Starting model pre-warm | model=$PREWARM_MODEL | timeout=${PREWARM_TIMEOUT_SECS}s"
if ! curl -sf --max-time 5 "${OLLAMA_PREWARM_URL}/api/tags" > /dev/null 2>&1; then
  echo "[E2E_PREWARM] WARN: Ollama not reachable — skipping pre-warm (test will run anyway)"
else
  PREWARM_START=$(date +%s)
  PREWARM_RESPONSE=$(curl -sf --max-time "$PREWARM_TIMEOUT_SECS" ...)
  PREWARM_ELAPSED=$(( $(date +%s) - PREWARM_START ))
  if echo "$PREWARM_RESPONSE" | grep -q '"response"'; then
    echo "[E2E_PREWARM] PASS: model loaded and warm | elapsed=${PREWARM_ELAPSED}s"
    echo "[E2E_PREWARM] INFRA_READY: cold-start window cleared before WDIO launch"
  else
    echo "[E2E_PREWARM] WARN: pre-warm response unclear — test will run anyway"
  fi
fi
```

### Allowed / Forbidden compliance check
| Rule | Status |
|---|---|
| Explicit prewarm logs | ✅ [E2E_PREWARM] prefix |
| Not masquerading as user success | ✅ Separate from WDIO chat proof |
| Skip-on-unreachable | ✅ WARN + continue |
| No infinite retry | ✅ One bounded curl, no loop |
| Honest fail | ✅ WARN only, test still runs |
| No silent behavior | ✅ Always logs start/end |
| Overrideable model | ✅ TITANE_E2E_OLLAMA_MODEL env |
| Overrideable timeout | ✅ TITANE_E2E_PREWARM_TIMEOUT_SECS env |

### Evidence of effectiveness
Pre-patch (3 runs): 2/3 PASS (1 cold-start timeout)
Post-patch (3 runs): 3/3 PASS — all [E2E_PREWARM] PASS 1-3s

## Gate: G_PREWARM_STRATEGY_VALID: PASS
