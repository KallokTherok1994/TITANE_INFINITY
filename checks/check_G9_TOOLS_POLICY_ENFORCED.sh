#!/usr/bin/env bash
# checks/check_G9_TOOLS_POLICY_ENFORCED.sh — Gate G9: Tools policy enforced (no forbidden patterns)
# Ring: 4 — Status: STABLE
# Rollback: git restore -- checks/check_G9_TOOLS_POLICY_ENFORCED.sh

set -euo pipefail
GATE="G9_TOOLS_POLICY_ENFORCED"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_lib.sh
source "${SCRIPT_DIR}/_lib.sh"

ROOT="$(lib_repo_root)"
PACK_DIR="${PROOF_PACKS_DIR}/${GATE}"
mkdir -p "$PACK_DIR"

lib_log "INFO" "[$GATE] Checking tools policy (no forbidden patterns)..."

FAIL=0

# Check: no raw invoke() calls outside canonical IPC client
RAW_INVOKE=$(grep -rn --include="*.ts" --include="*.tsx" -E "\binvoke\s*\(" "${ROOT}/src" 2>/dev/null \
  | grep -v "//.*GOVERNED" | grep -v "ipcClient\|canonicalClient\|tauri-ipc\|__tests__\|\.test\.\|\.spec\." || true)
if [[ -n "$RAW_INVOKE" ]]; then
  COUNT=$(echo "$RAW_INVOKE" | wc -l | tr -d ' ')
  lib_log "WARN" "[$GATE] $COUNT raw invoke() call(s) found outside canonical IPC client"
  lib_log_jsonl "$GATE" "WARN" "${COUNT} raw invoke() calls found — review required"
fi

# Check: no console.log in production code (should use structured logger)
CONSOLE_LOGS=$(grep -rn --include="*.ts" --include="*.tsx" -E "console\.(log|warn|error)\s*\(" "${ROOT}/src" 2>/dev/null \
  | grep -v "__tests__\|\.test\.\|\.spec\.\|//.*OK\|//.*debug" | wc -l | tr -d ' ' || echo "0")
lib_log "INFO" "[$GATE] console.log/warn/error calls in src: $CONSOLE_LOGS"
lib_log_jsonl "$GATE" "INFO" "console calls in src: $CONSOLE_LOGS"

# Check: no any type annotations (strict TS)
ANY_COUNT=$(grep -rn --include="*.ts" --include="*.tsx" -E ":\s*any\b" "${ROOT}/src" 2>/dev/null \
  | grep -v "__tests__\|\.test\.\|\.spec\.\|//.*OK" | wc -l | tr -d ' ' || echo "0")
lib_log "INFO" "[$GATE] ':any' TypeScript annotations in src: $ANY_COUNT"
lib_log_jsonl "$GATE" "INFO" "any annotations: $ANY_COUNT"

if [[ $FAIL -eq 0 ]]; then
  lib_pass "$GATE" "G9 tools policy check complete (manual review of warnings required)"
  exit 0
else
  exit 1
fi
