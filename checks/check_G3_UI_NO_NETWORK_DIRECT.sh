#!/usr/bin/env bash
# checks/check_G3_UI_NO_NETWORK_DIRECT.sh — Gate G3: UI has zero direct network calls
# Ring: 4 — Status: STABLE
# Invariant: I2 — Online-first governed: UI => ZERO network direct; via backend/IPC only
# Rollback: git restore -- checks/check_G3_UI_NO_NETWORK_DIRECT.sh

set -euo pipefail
GATE="G3_UI_NO_NETWORK_DIRECT"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_lib.sh
source "${SCRIPT_DIR}/_lib.sh"

ROOT="$(lib_repo_root)"
SRC_DIR="${ROOT}/src"

lib_log "INFO" "[$GATE] Scanning UI sources for direct network calls..."

PATTERNS=(
  'fetch\s*('
  'new\s+XMLHttpRequest'
  'axios\.'
  'http\.get\|http\.post\|https\.get\|https\.post'
  'new\s+WebSocket\s*('
)

VIOLATIONS=()
for pattern in "${PATTERNS[@]}"; do
  while IFS= read -r line; do
    [[ -n "$line" ]] && VIOLATIONS+=("$line")
  done < <(grep -rn --include="*.ts" --include="*.tsx" -E "$pattern" "${SRC_DIR}" 2>/dev/null \
    | grep -v "__tests__" | grep -v "\.test\." | grep -v "\.spec\." \
    | grep -v "// GOVERNED" | grep -v "NetworkService" | grep -v "ApiClient" || true)
done

PACK_DIR="${PROOF_PACKS_DIR}/${GATE}"
mkdir -p "$PACK_DIR"

if [[ ${#VIOLATIONS[@]} -eq 0 ]]; then
  lib_pass "$GATE" "No direct network calls found in UI sources"
  exit 0
else
  for v in "${VIOLATIONS[@]}"; do
    lib_log "VIOLATION" "$v"
    lib_log_jsonl "$GATE" "VIOLATION" "$v"
  done
  lib_fail "$GATE" "${#VIOLATIONS[@]} direct network call(s) found — stop-the-line" || exit 1
fi
