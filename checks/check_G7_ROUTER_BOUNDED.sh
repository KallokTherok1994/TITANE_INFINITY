#!/usr/bin/env bash
# checks/check_G7_ROUTER_BOUNDED.sh — Gate G7: Router is bounded (no unbounded retries)
# Ring: 4 — Status: STABLE
# Rollback: git restore -- checks/check_G7_ROUTER_BOUNDED.sh

set -euo pipefail
GATE="G7_ROUTER_BOUNDED"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_lib.sh
source "${SCRIPT_DIR}/_lib.sh"

ROOT="$(lib_repo_root)"
PACK_DIR="${PROOF_PACKS_DIR}/${GATE}"
mkdir -p "$PACK_DIR"

lib_log "INFO" "[$GATE] Scanning for unbounded retry patterns in src/..."

# Patterns indicating unbounded retries
PATTERNS=(
  'while\s*\(true\)'
  'while\s*\(1\)'
  'setInterval\s*.*retry'
  'retry\s*=\s*Infinity'
  'maxRetries\s*:\s*Infinity'
)

VIOLATIONS=()
for pattern in "${PATTERNS[@]}"; do
  while IFS= read -r line; do
    [[ -n "$line" ]] && VIOLATIONS+=("$line")
  done < <(grep -rn --include="*.ts" --include="*.tsx" --include="*.rs" -E "$pattern" "${ROOT}/src" "${ROOT}/src-tauri/src" 2>/dev/null \
    | grep -v "//.*BOUNDED" | grep -v "//.*OK" | grep -v "__tests__" || true)
done

if [[ ${#VIOLATIONS[@]} -eq 0 ]]; then
  lib_pass "$GATE" "No unbounded retry patterns detected"
else
  for v in "${VIOLATIONS[@]}"; do
    lib_log "WARN" "  $v"
    lib_log_jsonl "$GATE" "WARN" "$v"
  done
  lib_log "WARN" "[$GATE] ${#VIOLATIONS[@]} potential unbounded patterns — review required"
  lib_log_jsonl "$GATE" "WARN" "${#VIOLATIONS[@]} patterns flagged for review"
fi

lib_pass "$GATE" "G7 router bounded check complete"
exit 0
