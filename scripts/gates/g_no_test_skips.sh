#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PATTERN='\b(test|it|describe)\.(only|skip)\s*\('

MATCHES=$(grep -RInE "$PATTERN" "$ROOT_DIR/tests" "$ROOT_DIR/src" "$ROOT_DIR/e2e" --exclude-dir=node_modules --exclude='*.md' 2>/dev/null || true)
if [[ -n "$MATCHES" ]]; then
  echo "G_NO_TEST_SKIPS: FAIL"
  echo "$MATCHES"
  exit 1
fi

echo "G_NO_TEST_SKIPS: PASS"
