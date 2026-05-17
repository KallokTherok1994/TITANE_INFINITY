#!/usr/bin/env bash
set -euo pipefail

MODEL="${TITANE_OLLAMA_DEV_MODEL:-qwen3.5:9b}"
HOST="${OLLAMA_HOST:-http://127.0.0.1:11434}"

curl -fsS --max-time 30 "$HOST/api/generate" -d "{
  \"model\": \"$MODEL\",
  \"prompt\": \"\",
  \"think\": false,
  \"keep_alive\": \"30m\",
  \"stream\": false
}" >/dev/null

echo "PASS: OLLAMA_DEV_MODEL_PRELOADED model=$MODEL"
