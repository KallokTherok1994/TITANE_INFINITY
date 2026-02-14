#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

cd "$ROOT_DIR"

if [ ! -d "dist" ]; then
  echo "FAIL: dist/ not found. Build before running this guard."
  exit 1
fi

ERRORS=0

# Exclude CSS files (contain hex colors and false positive like #11434)
if rg -n "127\\.0\\.0\\.1:11434|localhost:11434" dist --type-not css; then
  echo "FAIL: direct Ollama endpoint reference found in dist/"
  ERRORS=$((ERRORS + 1))
else
  echo "PASS: no direct Ollama endpoint reference in dist/"
fi

if rg -n "V.rifie qu'Ollama|V.rifie que Ollama|D.marre Ollama" dist; then
  echo "FAIL: legacy Ollama guidance text found in dist/"
  ERRORS=$((ERRORS + 1))
else
  echo "PASS: no legacy Ollama guidance text in dist/"
fi

if [ "$ERRORS" -ne 0 ]; then
  exit 1
fi
