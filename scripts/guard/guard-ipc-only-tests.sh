#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
TARGETS=("$ROOT/src/__tests__" "$ROOT/tests")

PATTERN="((?<!not\\.)toContain\\([^\\n]*(/api/ollama|OLLAMA_API_BASE)|TRANSPORT_MODE[[:space:]]*=[[:space:]]*'HTTP'|uses /api/ollama as base)"

echo "🔐 GUARD: Checking legacy test expectations against IPC-only invariant"

if command -v rg >/dev/null 2>&1; then
  MATCHES="$(rg -n --pcre2 "$PATTERN" "${TARGETS[@]}" \
    --glob '*.test.*' --glob '*.spec.*' \
    --glob '!**/fixtures/**' --glob '!**/snapshots/**' \
    || true)"
else
  MATCHES="$(grep -RnsE "$PATTERN" "${TARGETS[@]}" 2>/dev/null || true)"
fi

MATCHES="$(echo "$MATCHES" | sed '/^$/d')"

if [[ -n "$MATCHES" ]]; then
  echo "❌ Guard failed: legacy HTTP/proxy test expectations detected"
  echo "$MATCHES"
  echo ""
  echo "Tests must assert IPC-only transport and avoid /api/ollama expectations."
  exit 1
fi

echo "✅ PASS: No legacy HTTP/proxy expectations found in test suites"
exit 0
