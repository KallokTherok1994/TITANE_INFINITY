#!/usr/bin/env bash
# TITANE∞ — Guard: Enforce Ollama proxy usage in frontend
# Fails if any direct 127.0.0.1:11434 reference exists in src/

set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
TARGET_DIR="$ROOT/src"
PATTERN="127\.0\.0\.1:11434"

if command -v rg >/dev/null 2>&1; then
  MATCHES="$(rg -n "$PATTERN" "$TARGET_DIR" || true)"
else
  MATCHES="$(grep -RnsE "$PATTERN" "$TARGET_DIR" || true)"
fi

if [[ -n "$MATCHES" ]]; then
  echo "❌ Guard failed: direct Ollama localhost usage detected in src/"
  echo "$MATCHES"
  exit 1
fi

echo "✅ Guard passed: no direct Ollama localhost usage in src/"
exit 0
