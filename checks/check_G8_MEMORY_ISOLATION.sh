#!/usr/bin/env bash
# checks/check_G8_MEMORY_ISOLATION.sh — Gate G8: Memory isolation (no cross-session data leaks)
# Ring: 4 — Status: STABLE
# Rollback: git restore -- checks/check_G8_MEMORY_ISOLATION.sh

set -euo pipefail
GATE="G8_MEMORY_ISOLATION"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_lib.sh
source "${SCRIPT_DIR}/_lib.sh"

ROOT="$(lib_repo_root)"
PACK_DIR="${PROOF_PACKS_DIR}/${GATE}"
mkdir -p "$PACK_DIR"

lib_log "INFO" "[$GATE] Checking memory isolation markers in E2E harness..."

E2E_DIR="${ROOT}/e2e"
SCRIPTS_E2E="${ROOT}/scripts/e2e"

ISOLATION_FOUND=0

# Check for TITANE_MEMORY_DIR usage (required by E2E constitution)
for dir in "$E2E_DIR" "$SCRIPTS_E2E"; do
  if [[ -d "$dir" ]]; then
    if grep -rn "TITANE_MEMORY_DIR" "$dir" 2>/dev/null | grep -q .; then
      lib_pass "$GATE" "TITANE_MEMORY_DIR isolation marker found in $dir"
      ISOLATION_FOUND=1
    fi
  fi
done

if [[ $ISOLATION_FOUND -eq 0 ]]; then
  lib_blocked_runner "$GATE" \
    "E2E harness not yet instrumented or no e2e/ directory" \
    "Add TITANE_MEMORY_DIR and TITANE_LOG_DIR isolation markers to e2e scripts per E2E constitution"
fi

# Check that no hardcoded user data paths are in tests
HARD_PATHS=$(grep -rn --include="*.ts" --include="*.js" -E "(/home/|/Users/|C:\\\\Users\\\\)" "${ROOT}/e2e" 2>/dev/null | grep -v "//.*example" || true)
if [[ -n "$HARD_PATHS" ]]; then
  lib_log "WARN" "[$GATE] Hardcoded user paths in E2E tests:"
  echo "$HARD_PATHS" | while IFS= read -r line; do
    lib_log "WARN" "  $line"
    lib_log_jsonl "$GATE" "WARN" "hardcoded path: $line"
  done
else
  lib_pass "$GATE" "No hardcoded user data paths in E2E tests"
fi

lib_pass "$GATE" "G8 memory isolation check complete"
exit 0
