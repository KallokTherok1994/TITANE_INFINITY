#!/usr/bin/env bash
# TITANE∞ — E2E Tauri Build Authorization Gate

set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
AUTH_FILE="$ROOT/runtime/ALLOW_E2E_TAURI_BUILD.ok"
EXPECTED_CONTENT="I_AUTHORIZE_E2E_TAURI_BUILD"

if [[ ! -f "$AUTH_FILE" ]]; then
  echo "❌ E2E TAURI BUILD BLOCKED — NO AUTHORIZATION"
  echo "Missing file: $AUTH_FILE"
  exit 1
fi

ACTUAL_CONTENT="$(cat "$AUTH_FILE" | tr -d '\n\r')"
if [[ "$ACTUAL_CONTENT" != "$EXPECTED_CONTENT" ]]; then
  echo "❌ E2E TAURI BUILD BLOCKED — INVALID AUTHORIZATION"
  echo "Expected: $EXPECTED_CONTENT"
  echo "Actual:   $ACTUAL_CONTENT"
  exit 1
fi

echo "✅ E2E build authorized"
exit 0
