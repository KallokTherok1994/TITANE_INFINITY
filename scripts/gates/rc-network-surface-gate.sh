#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

RAW_LOG="${RC_NETWORK_RAW_LOG:-/tmp/rc_network_raw.log}"
EXEC_LOG="${RC_NETWORK_EXEC_LOG:-/tmp/rc_network_exec.log}"

# Grep-based implementation (does not require ripgrep)
# Patterns: raw = broad, exec = executable network calls
RAW_PATTERN='fetch(|axios(|XMLHttpRequest|WebSocket|https?://'
EXEC_PATTERN='fetch[[:space:]]*(\|axios[[:space:]]*(\|new[[:space:]]*WebSocket[[:space:]]*(\|XMLHttpRequest[[:space:]]*('

grep -rn \
  --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
  -E "$RAW_PATTERN" \
  src/ 2>/dev/null \
  | grep -v "__tests__\|stories\|\.snap\|\.test\.\|\.spec\." \
  >"$RAW_LOG" || true

grep -rn \
  --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
  -E "$EXEC_PATTERN" \
  src/ 2>/dev/null \
  | grep -v "__tests__\|stories\|\.snap\|\.test\.\|\.spec\." \
  >"$EXEC_LOG" || true

if [[ -s "$EXEC_LOG" ]]; then
  echo "❌ RC network gate FAIL: executable network patterns found in src/"
  echo "   raw: $RAW_LOG"
  echo "   exec: $EXEC_LOG"
  exit 1
fi

echo "✅ RC network gate PASS: no executable network patterns found in src/"
echo "   raw: $RAW_LOG"
echo "   exec: $EXEC_LOG"
