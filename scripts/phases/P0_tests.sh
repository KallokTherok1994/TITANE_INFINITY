#!/usr/bin/env bash
# scripts/phases/P0_tests.sh — Tests x3 (vitest + architecture + rust)
# Usage: bash scripts/phases/P0_tests.sh [logfile]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/../lib/common.sh"

LOGFILE="${1:-${TITANE_REPO_ROOT}/proof_packs/P0_tests_x3_$(date -u +%Y%m%dT%H%M%S).log}"
mkdir -p "$(dirname "$LOGFILE")"
cd "${TITANE_REPO_ROOT}"

run_tests() {
  echo "--- Architecture tests ---"
  NODE_OPTIONS='--max-old-space-size=8192 --require ./tests/polyfills/resizable-arraybuffer.cjs' \
    node node_modules/.bin/cross-env node node_modules/.bin/vitest run src/__tests__/architecture 2>&1 | tail -10
  
  echo "--- Unit tests (vitest) ---"
  NODE_OPTIONS='--max-old-space-size=12288 --require ./tests/polyfills/resizable-arraybuffer.cjs' \
    node node_modules/.bin/vitest run 2>&1 | tail -15

  echo "--- Rust tests ---"
  mkdir -p dist
  cd src-tauri && cargo test --lib 2>&1 | tail -10
  cd ..
}

{
  echo "=== P0_TESTS_X3 START: $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
  for RUN in 1 2 3; do
    echo ""
    echo "=== RUN ${RUN}/3: $(date -u +%H:%M:%SZ) ==="
    if run_tests 2>&1 | redact_secrets; then
      echo "=== RUN ${RUN}/3: PASS ==="
    else
      echo "=== RUN ${RUN}/3: FAIL ==="
    fi
  done
  echo ""
  echo "=== P0_TESTS_X3 COMPLETE: $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
} 2>&1 | tee "$LOGFILE"

echo "Logged to: $LOGFILE"
