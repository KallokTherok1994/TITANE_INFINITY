# checks/check_G13_SUPPORT_BUNDLE_EXPORTABLE.ps1 — Gate G13: Support bundle can be generated
# Ring: 4 — Status: STABLE
# Rollback: git restore -- checks/check_G13_SUPPORT_BUNDLE_EXPORTABLE.ps1

$ErrorActionPreference = "Stop"
$GATE = "G13_SUPPORT_BUNDLE_EXPORTABLE"
. "$PSScriptRoot/_lib.ps1"

$ROOT = lib_repo_root
$PackDir = Join-Path $PROOF_PACKS_DIR $GATE
New-Item -ItemType Directory -Force -Path $PackDir | Out-Null

lib_log "INFO" "[$GATE] Checking support bundle script availability..."

lib_require_file $GATE (Join-Path $ROOT "scripts/collect_support_bundle.ps1")
lib_require_file $GATE (Join-Path $ROOT "scripts/redact_secrets.ps1")

lib_pass $GATE "G13 support bundle check complete"
exit 0
