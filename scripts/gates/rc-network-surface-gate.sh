#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

RAW_LOG="${RC_NETWORK_RAW_LOG:-/tmp/rc_network_raw.log}"
EXEC_LOG="${RC_NETWORK_EXEC_LOG:-/tmp/rc_network_exec.log}"

INCLUDE_GLOBS=(
  "*.ts"
  "*.tsx"
  "*.js"
  "*.jsx"
)

EXCLUDE_GLOBS=(
  "!**/stories/**"
  "!**/*.svg"
  "!**/*.mdx"
  "!**/__tests__/**"
  "!**/*.test.*"
  "!**/*.spec.*"
)

RAW_PATTERN='fetch\(|axios\(|XMLHttpRequest|WebSocket|https?://'
EXEC_PATTERN="globalThis\['fetch'\]|\\b(fetch|axios)\\s*\\(|new\\s+WebSocket\\s*\\(|XMLHttpRequest\\s*\\("

RG_ARGS=(-n src)
for glob in "${INCLUDE_GLOBS[@]}"; do
  RG_ARGS+=(--glob "$glob")
done
for glob in "${EXCLUDE_GLOBS[@]}"; do
  RG_ARGS+=(--glob "$glob")
done

rg "$RAW_PATTERN" "${RG_ARGS[@]}" >"$RAW_LOG" || true
rg --pcre2 "$EXEC_PATTERN" "${RG_ARGS[@]}" >"$EXEC_LOG" || true

if [[ -s "$EXEC_LOG" ]]; then
  echo "❌ RC network gate FAIL: executable network patterns found in src/"
  echo "   raw: $RAW_LOG"
  echo "   exec: $EXEC_LOG"
  exit 1
fi

echo "✅ RC network gate PASS: no executable network patterns found in src/"
echo "   raw: $RAW_LOG"
echo "   exec: $EXEC_LOG"
