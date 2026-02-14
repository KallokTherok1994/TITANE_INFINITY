#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

cd "$ROOT_DIR"

ERRORS=0

echo "[guard] no frontend ollama direct" 

if rg -n "127\\.0\\.0\\.1:11434|localhost:11434|:11434" src; then
  echo "FAIL: direct Ollama endpoint reference found in src/"
  ERRORS=$((ERRORS + 1))
else
  echo "PASS: no direct Ollama endpoint reference in src/"
fi

if rg -n "V.rifie qu'Ollama|V.rifie que Ollama|D.marre Ollama" src; then
  echo "FAIL: legacy Ollama guidance text found in src/"
  ERRORS=$((ERRORS + 1))
else
  echo "PASS: no legacy Ollama guidance text in src/"
fi

if rg -n "AbortError" src/services/ai/providers/ollama.ts src/services/ai/orchestrator.ts; then
  echo "FAIL: AbortError reference found in Ollama provider/orchestrator"
  ERRORS=$((ERRORS + 1))
else
  echo "PASS: no AbortError references in Ollama provider/orchestrator"
fi

if [ "$ERRORS" -ne 0 ]; then
  exit 1
fi
