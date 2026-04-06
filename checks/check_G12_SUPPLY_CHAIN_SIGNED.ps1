# checks/check_G12_SUPPLY_CHAIN_SIGNED.ps1 — Gate G12: Supply chain integrity (BLOCKED_INSTRUMENTATION)
# Ring: 4 — Status: EXPERIMENTAL
# Rollback: git restore -- checks/check_G12_SUPPLY_CHAIN_SIGNED.ps1

$ErrorActionPreference = "Stop"
$GATE = "G12_SUPPLY_CHAIN_SIGNED"
. "$PSScriptRoot/_lib.ps1"

$ROOT = lib_repo_root
$PackDir = Join-Path $PROOF_PACKS_DIR $GATE
New-Item -ItemType Directory -Force -Path $PackDir | Out-Null

lib_log "INFO" "[$GATE] Checking supply chain integrity markers..."

$Lockfiles = @("pnpm-lock.yaml","package-lock.json","yarn.lock")
$LockFound = $false
foreach ($lf in $Lockfiles) {
  if (Test-Path (Join-Path $ROOT $lf)) {
    lib_pass $GATE "Lockfile found: $lf"
    $LockFound = $true
    break
  }
}
if (-not $LockFound) {
  lib_log "WARN" "[$GATE] No lockfile found — supply chain not pinned"
  lib_log_jsonl $GATE "WARN" "No lockfile found"
}

$CargoLock = @((Join-Path $ROOT "src-tauri/Cargo.lock"), (Join-Path $ROOT "Cargo.lock"))
if ($CargoLock | Where-Object { Test-Path $_ }) {
  lib_pass $GATE "Cargo.lock found"
} else {
  lib_log "WARN" "[$GATE] No Cargo.lock found"
}

lib_blocked_instrumentation $GATE `
  "Full supply chain signing requires CI signing environment (sigstore/cosign/SBOM)" `
  "Configure SLSA provenance in CI; run 'pnpm audit' and 'cargo audit' after merge"
exit 0
