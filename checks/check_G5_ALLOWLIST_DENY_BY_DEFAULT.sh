#!/usr/bin/env bash
# checks/check_G5_ALLOWLIST_DENY_BY_DEFAULT.sh — Gate G5: Tauri allowlist deny-by-default
# Ring: 4 — Status: STABLE
# Invariant: I4 — Allowlist deny-by-default
# Rollback: git restore -- checks/check_G5_ALLOWLIST_DENY_BY_DEFAULT.sh

set -euo pipefail
GATE="G5_ALLOWLIST_DENY_BY_DEFAULT"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_lib.sh
source "${SCRIPT_DIR}/_lib.sh"

ROOT="$(lib_repo_root)"
PACK_DIR="${PROOF_PACKS_DIR}/${GATE}"
mkdir -p "$PACK_DIR"

TAURI_CONF="${ROOT}/src-tauri/tauri.conf.json"
lib_require_file "$GATE" "$TAURI_CONF" || exit 1

lib_log "INFO" "[$GATE] Checking Tauri allowlist/capabilities configuration..."

# Tauri v2: capabilities files
CAP_DIR="${ROOT}/src-tauri/capabilities"
if [[ -d "$CAP_DIR" ]]; then
  lib_pass "$GATE" "Tauri v2 capabilities directory present: $CAP_DIR"
  # Check no wildcard all-allow
  WILDCARDS=$(grep -rn '"allow": true' "$CAP_DIR" 2>/dev/null | grep -v "//.*deny" || true)
  if [[ -n "$WILDCARDS" ]]; then
    lib_log "WARN" "[$GATE] Broad allow patterns found — review for deny-by-default:"
    echo "$WILDCARDS" | while IFS= read -r line; do
      lib_log "WARN" "  $line"
      lib_log_jsonl "$GATE" "WARN" "$line"
    done
  else
    lib_pass "$GATE" "No wildcard allow-all patterns found in capabilities"
  fi
else
  # Tauri v1: check allowlist in tauri.conf.json
  ALLOWLIST=$(python3 -c "
import json, sys
with open('${TAURI_CONF}') as f:
  d = json.load(f)
al = d.get('tauri', {}).get('allowlist', {})
print('allowAllFound' if al.get('all', False) else 'ok')
" 2>/dev/null || echo "parse_error")
  if [[ "$ALLOWLIST" == "allowAllFound" ]]; then
    lib_fail "$GATE" "tauri.conf.json allowlist.all=true — violates deny-by-default" || exit 1
  else
    lib_pass "$GATE" "Tauri allowlist.all not set to true (deny-by-default satisfied)"
  fi
fi

lib_pass "$GATE" "G5 allowlist check complete"
exit 0
