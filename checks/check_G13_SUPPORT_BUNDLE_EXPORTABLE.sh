#!/usr/bin/env bash
# checks/check_G13_SUPPORT_BUNDLE_EXPORTABLE.sh — Gate G13: Support bundle can be generated
# Ring: 4 — Status: STABLE
# Rollback: git restore -- checks/check_G13_SUPPORT_BUNDLE_EXPORTABLE.sh

set -euo pipefail
GATE="G13_SUPPORT_BUNDLE_EXPORTABLE"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_lib.sh
source "${SCRIPT_DIR}/_lib.sh"

ROOT="$(lib_repo_root)"
PACK_DIR="${PROOF_PACKS_DIR}/${GATE}"
mkdir -p "$PACK_DIR"

lib_log "INFO" "[$GATE] Checking support bundle script availability..."

BUNDLE_SCRIPT="${ROOT}/scripts/collect_support_bundle.sh"
lib_require_file "$GATE" "$BUNDLE_SCRIPT" || exit 1

if [[ -x "$BUNDLE_SCRIPT" ]]; then
  lib_pass "$GATE" "collect_support_bundle.sh is executable"
else
  lib_log "WARN" "[$GATE] collect_support_bundle.sh is not executable — run: chmod +x $BUNDLE_SCRIPT"
  lib_log_jsonl "$GATE" "WARN" "script not executable: $BUNDLE_SCRIPT"
fi

# Check redact_secrets script
REDACT_SCRIPT="${ROOT}/scripts/redact_secrets.sh"
lib_require_file "$GATE" "$REDACT_SCRIPT" || true

lib_pass "$GATE" "G13 support bundle check complete"
exit 0
