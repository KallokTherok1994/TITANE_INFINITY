#!/usr/bin/env bash
# TITANE∞ — Guard: Enforce Ollama proxy usage in frontend
# Fails if any direct 127.0.0.1:11434 reference exists in src/ code (excluding comments/help snippets)

set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
TARGET_DIR="$ROOT/src"
PATTERN="(127\.0\.0\.1|localhost):11434"

echo "🔐 GUARD: Checking for direct Ollama calls (11434) in src/"

if command -v rg >/dev/null 2>&1; then
  ALL_MATCHES="$(rg -n "$PATTERN" "$TARGET_DIR" --type-not markdown --glob '!modules/devSudo/**' || true)"

  MATCHES="$(echo "$ALL_MATCHES" \
    | grep -v '^[[:space:]]*//' \
    | grep -v '^[[:space:]]*\*' \
    | grep -v ':[[:space:]]*/\*' \
    | grep -Ev 'curl[[:space:]]+http://(localhost|127\.0\.0\.1):11434/api/tags' \
    | grep -v 'Dev mode.*HTTP' \
    | grep -v 'Vite proxy' \
    | grep -v '/src/modules/devSudo/' \
    || true)"
else
  MATCHES="$(grep -RnsE --exclude-dir='devSudo' "$PATTERN" "$TARGET_DIR" || true)"
fi

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
