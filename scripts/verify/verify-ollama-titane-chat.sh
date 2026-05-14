#!/usr/bin/env bash
# TITANE∞ v35.1.4 — verify-ollama-titane-chat
# Ensures PROD chat (gemma2:2b) and DEV chat (qwen3.5:9b / qwen2.5-coder) defaults
# remain strictly aligned across backend + frontend + config surfaces.
# No mutation. Read-only governance check.

set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

PROD_MODEL="gemma2:2b"
DEV_MODELS_REGEX="qwen3\.5:9b|qwen2\.5-coder"

PASS=0; FAIL=0
check() {
  local name="$1"; shift
  if eval "$@" >/dev/null 2>&1; then
    echo "PASS: $name"; PASS=$((PASS+1))
  else
    echo "FAIL: $name"; FAIL=$((FAIL+1))
  fi
}

# 1. Backend Rust defaults
check 'G_BACKEND_OLLAMA_DEFAULT_GEMMA2_2B' \
  "grep -E 'DEFAULT_OLLAMA_MODEL[^=]*=\\s*\"gemma2:2b\"' src-tauri/src/ollama.rs"
check 'G_BACKEND_AI_OLLAMA_DEFAULT_GEMMA2_2B' \
  "grep -E 'gemma2:2b' src-tauri/src/ai/ollama.rs"
check 'G_BACKEND_CONFIG_UPDATE_DEFAULT_GEMMA2_2B' \
  "grep -E 'gemma2:2b' src-tauri/src/config/update.rs"
check 'G_BACKEND_RUNTIME_CONFIG_FALLBACK_GEMMA2_2B' \
  "grep -E '\"gemma2:2b\"' src-tauri/src/runtime_config.rs"

# 2. Frontend defaults
check 'G_FRONTEND_OLLAMA_DEFAULT_GEMMA2_2B' \
  "grep -E 'gemma2:2b' src/config/ollamaDefaults.ts"

# 3. No DEV model leaked in PROD pipeline (conversation_engine commands)
if grep -nE "$DEV_MODELS_REGEX" src-tauri/src/conversation_engine/commands.rs 2>/dev/null; then
  echo "FAIL: G_PROD_PIPELINE_NO_DEV_MODEL_LEAK"; FAIL=$((FAIL+1))
else
  echo "PASS: G_PROD_PIPELINE_NO_DEV_MODEL_LEAK"; PASS=$((PASS+1))
fi

# 4. DEV surfaces allowed: MCP config + TotalDevPage
check 'G_DEV_SURFACE_MCP_QWEN35_9B' \
  "grep -E 'qwen3\\.5:9b|qwen3\\.5-9b' .vscode/mcp.json"

# 5. Allowlist boundary (no override of OLLAMA_MODEL inside backend defaults file)
if grep -nE 'std::env::var\("OLLAMA_MODEL"\)' src-tauri/src/conversation_engine/commands.rs 2>/dev/null; then
  echo "FAIL: G_PROD_CONVERSATION_NO_OLLAMA_MODEL_ENV"; FAIL=$((FAIL+1))
else
  echo "PASS: G_PROD_CONVERSATION_NO_OLLAMA_MODEL_ENV"; PASS=$((PASS+1))
fi

echo "SUMMARY: PASS=$PASS FAIL=$FAIL"
[ "$FAIL" -eq 0 ] || exit 1
exit 0
