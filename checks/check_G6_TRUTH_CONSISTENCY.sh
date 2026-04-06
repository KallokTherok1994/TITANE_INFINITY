#!/usr/bin/env bash
# checks/check_G6_TRUTH_CONSISTENCY.sh — Gate G6: Version truth consistency across files
# Ring: 4 — Status: STABLE
# Invariant: Version in package.json = Cargo.toml = tauri.conf.json
# Rollback: git restore -- checks/check_G6_TRUTH_CONSISTENCY.sh

set -euo pipefail
GATE="G6_TRUTH_CONSISTENCY"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_lib.sh
source "${SCRIPT_DIR}/_lib.sh"

ROOT="$(lib_repo_root)"
PACK_DIR="${PROOF_PACKS_DIR}/${GATE}"
mkdir -p "$PACK_DIR"

lib_log "INFO" "[$GATE] Checking version consistency across canonical files..."

PKG_VERSION=$(python3 -c "import json; d=json.load(open('${ROOT}/package.json')); print(d['version'])" 2>/dev/null || echo "MISSING")
CARGO_VERSION=$(grep -m1 '^version' "${ROOT}/src-tauri/Cargo.toml" 2>/dev/null | sed 's/.*"\(.*\)".*/\1/' | tr -d ' ' || echo "MISSING")
TAURI_VERSION=$(python3 -c "import json; d=json.load(open('${ROOT}/src-tauri/tauri.conf.json')); print(d.get('version', d.get('package',{}).get('version','MISSING')))" 2>/dev/null || echo "MISSING")

lib_log "INFO" "[$GATE] package.json: $PKG_VERSION"
lib_log "INFO" "[$GATE] Cargo.toml:   $CARGO_VERSION"
lib_log "INFO" "[$GATE] tauri.conf:   $TAURI_VERSION"

lib_log_jsonl "$GATE" "INFO" "package.json=$PKG_VERSION Cargo.toml=$CARGO_VERSION tauri.conf=$TAURI_VERSION"

FAIL=0
if [[ "$PKG_VERSION" == "MISSING" ]]; then
  lib_fail "$GATE" "package.json version missing" || FAIL=1
fi
if [[ "$CARGO_VERSION" == "MISSING" ]]; then
  lib_log "WARN" "[$GATE] Cargo.toml version not found"
fi
if [[ "$PKG_VERSION" != "MISSING" && "$CARGO_VERSION" != "MISSING" && "$PKG_VERSION" != "$CARGO_VERSION" ]]; then
  lib_fail "$GATE" "Version mismatch: package.json=$PKG_VERSION vs Cargo.toml=$CARGO_VERSION" || FAIL=1
fi
if [[ "$PKG_VERSION" != "MISSING" && "$TAURI_VERSION" != "MISSING" && "$PKG_VERSION" != "$TAURI_VERSION" ]]; then
  lib_fail "$GATE" "Version mismatch: package.json=$PKG_VERSION vs tauri.conf=$TAURI_VERSION" || FAIL=1
fi

if [[ $FAIL -eq 0 ]]; then
  lib_pass "$GATE" "Version consistency: $PKG_VERSION across all canonical files"
  exit 0
else
  exit 1
fi
