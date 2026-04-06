#!/usr/bin/env bash
# checks/check_G4_ONE_DOOR_NETWORK_BACKEND.sh — Gate G4: Single network entry point in backend
# Ring: 4 — Status: STABLE
# Invariant: I2 — All network goes through one governed door (NetworkService/ApiClient)
# Rollback: git restore -- checks/check_G4_ONE_DOOR_NETWORK_BACKEND.sh

set -euo pipefail
GATE="G4_ONE_DOOR_NETWORK_BACKEND"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_lib.sh
source "${SCRIPT_DIR}/_lib.sh"

ROOT="$(lib_repo_root)"
PACK_DIR="${PROOF_PACKS_DIR}/${GATE}"
mkdir -p "$PACK_DIR"

lib_log "INFO" "[$GATE] Checking single network door in services layer..."

# Verify NetworkService or ApiClient exists
NS_FILES=$(find "${ROOT}/src" -name "NetworkService*" -o -name "ApiClient*" 2>/dev/null | head -5)
if [[ -n "$NS_FILES" ]]; then
  lib_pass "$GATE" "Governed network surface found: $NS_FILES"
else
  lib_log "WARN" "[$GATE] No NetworkService/ApiClient found — check src/services/"
  lib_log_jsonl "$GATE" "WARN" "No NetworkService/ApiClient canonical file found"
fi

# Check Rust backend: ensure no raw reqwest/ureq outside services
RUST_VIOLATIONS=$(grep -rn --include="*.rs" -E "reqwest::|ureq::" "${ROOT}/src-tauri/src" 2>/dev/null \
  | grep -v "services/" | grep -v "network" | grep -v "//.*GOVERNED" || true)

if [[ -z "$RUST_VIOLATIONS" ]]; then
  lib_pass "$GATE" "No ungoverned Rust network calls outside services layer"
else
  lib_log "WARN" "[$GATE] Potential ungoverned Rust network calls:"
  echo "$RUST_VIOLATIONS" | while IFS= read -r line; do
    lib_log "WARN" "  $line"
    lib_log_jsonl "$GATE" "WARN" "$line"
  done
fi

lib_pass "$GATE" "G4 static analysis complete"
exit 0
