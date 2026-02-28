#!/usr/bin/env bash
# checks/check_G12_SUPPLY_CHAIN_SIGNED.sh — Gate G12: Supply chain integrity (BLOCKED_INSTRUMENTATION)
# Ring: 4 — Status: EXPERIMENTAL
# Rollback: git restore -- checks/check_G12_SUPPLY_CHAIN_SIGNED.sh

set -euo pipefail
GATE="G12_SUPPLY_CHAIN_SIGNED"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_lib.sh
source "${SCRIPT_DIR}/_lib.sh"

ROOT="$(lib_repo_root)"
PACK_DIR="${PROOF_PACKS_DIR}/${GATE}"
mkdir -p "$PACK_DIR"

lib_log "INFO" "[$GATE] Checking supply chain integrity markers..."

# Check lockfiles exist (pnpm-lock.yaml or package-lock.json)
LOCKFILE_FOUND=0
for lf in "pnpm-lock.yaml" "package-lock.json" "yarn.lock"; do
  if [[ -f "${ROOT}/${lf}" ]]; then
    lib_pass "$GATE" "Lockfile found: $lf"
    LOCKFILE_FOUND=1
    break
  fi
done
if [[ $LOCKFILE_FOUND -eq 0 ]]; then
  lib_fail "$GATE" "No lockfile found — supply chain not pinned" || true
fi

# Check Cargo.lock
if [[ -f "${ROOT}/src-tauri/Cargo.lock" || -f "${ROOT}/Cargo.lock" ]]; then
  lib_pass "$GATE" "Cargo.lock found"
else
  lib_log "WARN" "[$GATE] No Cargo.lock found"
fi

# Full provenance/signing check requires sigstore/cosign — emit BLOCKED_INSTRUMENTATION
lib_blocked_instrumentation "$GATE" \
  "Full supply chain signing (sigstore/cosign/SBOM) requires CI signing environment" \
  "Configure SLSA provenance in CI; run 'pnpm audit' and 'cargo audit' after merge; store results in ${PACK_DIR}/supply_chain.jsonl"

exit 0
