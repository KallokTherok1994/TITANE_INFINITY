#!/usr/bin/env bash
# TITANE∞ — Guard: Enforce Ollama proxy usage in frontend
# Fails if any direct 127.0.0.1:11434 reference exists in src/ code (excluding comments)

set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
TARGET_DIR="$ROOT/src"
PATTERN="(127\.0\.0\.1|localhost):11434"

echo "🔐 GUARD: Checking for direct Ollama calls (11434) in src/"

if command -v rg >/dev/null 2>&1; then
  # Use ripgrep to find matches (including comments initially)
  ALL_MATCHES="$(rg -n "$PATTERN" "$TARGET_DIR" --type-not markdown || true)"
  
  # Filter out comment lines (lines starting with *, //, or within /**  */)
  MATCHES="$(echo "$ALL_MATCHES" \
    | grep -v '^\s*//' \
    | grep -v '^\s*\*' \
    | grep -v ':\s*/\*' \
    | grep -v 'Dev mode.*HTTP' \
    | grep -v 'Vite proxy' \
    || true)"
else
  MATCHES="$(grep -RnsE "$PATTERN" "$TARGET_DIR" || true)"
fi

# Remove empty lines
MATCHES="$(echo "$MATCHES" | sed '/^$/d')"

if [[ -n "$MATCHES" ]]; then
  echo "❌ Guard failed: direct Ollama localhost usage detected in src/"
  echo "$MATCHES"
  echo ""
  echo "Frontend MUST use unified transport (src/services/ai/transports/ollamaTransport.ts)"
  exit 1
fi

echo "✅ PASS: No direct 11434 calls in frontend"
exit 0
