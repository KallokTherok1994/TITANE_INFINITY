#!/usr/bin/env bash
set -euo pipefail

MODEL="${TITANE_OLLAMA_DEV_MODEL:-qwen3.5:9b}"
HOST="${OLLAMA_HOST:-http://127.0.0.1:11434}"
PROMPT="Output only this exact identifier: TITANE_OLLAMA_DEV_READY"
STRICT_TIMEOUT_SEC="${TITANE_OLLAMA_DEV_SMOKE_TIMEOUT_SEC:-30}"
COMPAT_TIMEOUT_SEC="${TITANE_OLLAMA_DEV_COMPAT_TIMEOUT_SEC:-15}"
KEEP_ALIVE="${TITANE_OLLAMA_DEV_KEEP_ALIVE:-10m}"
TEMPERATURE="${TITANE_OLLAMA_DEV_TEMPERATURE:-0}"
SMOKE_NUM_CTX="${TITANE_OLLAMA_DEV_SMOKE_NUM_CTX:-2048}"
SMOKE_NUM_PREDICT="${TITANE_OLLAMA_DEV_SMOKE_NUM_PREDICT:-8}"

echo "[OLLAMA_DEV_LIVE] host=$HOST model=$MODEL keep_alive=$KEEP_ALIVE num_ctx=$SMOKE_NUM_CTX strict_timeout=${STRICT_TIMEOUT_SEC}s"

curl -fsS --max-time 5 "$HOST/api/version" >/dev/null || {
  echo "BLOCKED_OLLAMA_SERVER: Ollama server not reachable at $HOST"
  echo "Recovery: run 'ollama serve'"
  exit 1
}

OLLAMA_LIST_OUTPUT="$(ollama list)"
grep -Fq "$MODEL" <<<"$OLLAMA_LIST_OUTPUT" || {
  echo "BLOCKED_MODEL_MISSING: DEV model not installed: $MODEL"
  echo "Recovery: ollama pull $MODEL"
  exit 1
}

test -f .vscode/mcp.json || {
  echo "FAIL_RUNTIME_SMOKE: .vscode/mcp.json missing"
  exit 1
}

grep -q 'ollama-dev' .vscode/mcp.json || {
  echo "FAIL_RUNTIME_SMOKE: ollama-dev server missing in .vscode/mcp.json"
  exit 1
}

grep -q 'OLLAMA_HOST' .vscode/mcp.json || {
  echo "FAIL_RUNTIME_SMOKE: OLLAMA_HOST missing in .vscode/mcp.json"
  exit 1
}

pnpm run verify:ollama:boundary
pnpm vitest run tests/unit/scripts/ollamaDevConfig.test.ts

if ! RESPONSE="$(
  curl -fsS --max-time "$STRICT_TIMEOUT_SEC" "$HOST/api/generate" -d "{
    \"model\": \"$MODEL\",
    \"prompt\": \"$PROMPT\",
    \"stream\": false,
    \"think\": false,
    \"keep_alive\": \"$KEEP_ALIVE\",
    \"options\": {
      \"num_ctx\": $SMOKE_NUM_CTX,
      \"temperature\": $TEMPERATURE,
      \"num_predict\": $SMOKE_NUM_PREDICT
    }
  }"
)"; then
  echo "WARN: strict DEV smoke probe timed out; retrying compatibility probe without num_ctx"
  if ! RESPONSE="$(
    curl -fsS --max-time "$COMPAT_TIMEOUT_SEC" "$HOST/api/generate" -d "{
      \"model\": \"$MODEL\",
      \"prompt\": \"$PROMPT\",
      \"stream\": false,
      \"think\": false,
      \"keep_alive\": \"$KEEP_ALIVE\",
      \"options\": {
        \"temperature\": $TEMPERATURE,
        \"num_predict\": $SMOKE_NUM_PREDICT
      }
    }"
  )"; then
    echo "FAIL_RUNTIME_SMOKE: DEV model smoke generation timed out or errored"
    exit 1
  fi
fi

echo "$RESPONSE" | grep -q 'TITANE_OLLAMA_DEV_READY' || {
  echo "FAIL_RUNTIME_SMOKE: DEV model smoke generation failed"
  echo "$RESPONSE"
  exit 1
}

echo "PASS: OLLAMA_DEV_LIVE_READY"
