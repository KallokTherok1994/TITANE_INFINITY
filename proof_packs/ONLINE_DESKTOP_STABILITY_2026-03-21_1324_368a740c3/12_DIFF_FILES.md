# DIFF FILES
## Date: 2026-03-21

## Modified Files: scripts/e2e/run-online-chat-proof-ui.sh (+30 lines)

Diff excerpt (key change):
```
+# Ollama Pre-warm Preflight
+OLLAMA_PREWARM_URL="${OLLAMA_BASE_URL:-http://127.0.0.1:11434}"
+PREWARM_MODEL="${OLLAMA_DEFAULT_MODEL:-gemma2:2b}"
+PREWARM_TIMEOUT_SECS="${TITANE_E2E_PREWARM_TIMEOUT_SECS:-120}"
+
+echo "[E2E_PREWARM] Starting model pre-warm | model=..."
+if ! curl -sf --max-time 5 "${OLLAMA_PREWARM_URL}/api/tags" ...; then
+  echo "[E2E_PREWARM] WARN: Ollama not reachable — skipping"
+else
+  PREWARM_RESPONSE=$(curl -sf --max-time 120 /api/generate ping stream=false)
+  if echo "$PREWARM_RESPONSE" | grep -q '"response"'; then
+    echo "[E2E_PREWARM] PASS: model loaded and warm | elapsed=Xs"
+  fi
+fi
+echo "[E2E_PREWARM] END"
```

## Modified Files: scripts/autoheal/autoheal_rules.jsonl (+1 line)
Entry AH-2026-03-21-OLLAMA-COLD-START-PREWARM appended.
507 -> 508 entries.
