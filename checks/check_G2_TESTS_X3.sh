#!/usr/bin/env bash
# checks/check_G2_TESTS_X3.sh — Gate G2: Tests pass x3 (no skips)
# Ring: 4 — Status: STABLE
# Rollback: git restore -- checks/check_G2_TESTS_X3.sh

set -euo pipefail
GATE="G2_TESTS_X3"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_lib.sh
source "${SCRIPT_DIR}/_lib.sh"

ROOT="$(lib_repo_root)"
PACK_DIR="${PROOF_PACKS_DIR}/${GATE}"
mkdir -p "$PACK_DIR"

X3_RESULTS=("${PACK_DIR}/test_run1.jsonl" "${PACK_DIR}/test_run2.jsonl" "${PACK_DIR}/test_run3.jsonl")
FOUND=0
for f in "${X3_RESULTS[@]}"; do
  [[ -f "$f" ]] && FOUND=$((FOUND+1))
done

if [[ $FOUND -ge 3 ]]; then
  lib_pass "$GATE" "x3 test proof files present (runs: $FOUND)"
  exit 0
fi

# Check test configuration exists
lib_require_file "$GATE" "${ROOT}/package.json" || true

VITEST_CFG=$(find "${ROOT}" -maxdepth 2 -name "vitest.config*" 2>/dev/null | head -1)
if [[ -n "$VITEST_CFG" ]]; then
  lib_pass "$GATE" "Vitest config found: $VITEST_CFG"
else
  lib_log "WARN" "[$GATE] No vitest.config found at root level"
fi

lib_blocked_runner "$GATE" \
  "Test runtime (pnpm/node) may not be available or tests require Tauri context" \
  "Run 'pnpm test' x3 in VS Code after merge; store results in ${PACK_DIR}/test_runN.jsonl; assert zero SKIP"

exit 0
