#!/usr/bin/env bash
set -euo pipefail

export OLLAMA_HOST="${OLLAMA_HOST:-http://127.0.0.1:11434}"
export TITANE_OLLAMA_DEV_MODEL="${TITANE_OLLAMA_DEV_MODEL:-qwen3.5:9b}"
export OLLAMA_MODEL="$TITANE_OLLAMA_DEV_MODEL"
MCP_PACKAGE="ollama-mcp@2.1.0"

curl -fsS --max-time 5 "$OLLAMA_HOST/api/version" >/dev/null || {
  echo "FAIL: Ollama not reachable at $OLLAMA_HOST" >&2
  exit 1
}

OLLAMA_LIST_OUTPUT="$(ollama list)"
grep -Fq "$OLLAMA_MODEL" <<<"$OLLAMA_LIST_OUTPUT" || {
  echo "FAIL: model not installed: $OLLAMA_MODEL" >&2
  echo "Recovery: ollama pull $OLLAMA_MODEL" >&2
  exit 1
}

# StdIO hygiene: wrapper diagnostics must stay on stderr so stdout remains reserved for MCP JSON-RPC.
exec pnpm dlx "$MCP_PACKAGE"
