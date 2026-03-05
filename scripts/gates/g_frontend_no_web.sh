#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PATTERN='fetch\(|axios\(|XMLHttpRequest|new[[:space:]]+WebSocket\('

MATCHES=$(grep -RInE "$PATTERN" "$ROOT_DIR/src" \
  --exclude-dir=node_modules \
  --exclude-dir=__tests__ \
  --exclude-dir=tests \
  --exclude-dir=stories \
  --exclude-dir=assets \
  --exclude='*.md' \
  --exclude='*.mdx' \
  --exclude='*.snap' || true)
if [[ -n "$MATCHES" ]]; then
  echo "G_FRONTEND_NO_WEB: FAIL"
  echo "$MATCHES"
  exit 1
fi

echo "G_FRONTEND_NO_WEB: PASS"
