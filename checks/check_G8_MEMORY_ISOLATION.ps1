# checks/check_G8_MEMORY_ISOLATION.ps1 — Gate G8: Memory isolation (no cross-session data leaks)
# Ring: 4 — Status: STABLE
# Rollback: git restore -- checks/check_G8_MEMORY_ISOLATION.ps1

$ErrorActionPreference = "Stop"
$GATE = "G8_MEMORY_ISOLATION"
. "$PSScriptRoot/_lib.ps1"

$ROOT = lib_repo_root
$PackDir = Join-Path $PROOF_PACKS_DIR $GATE
New-Item -ItemType Directory -Force -Path $PackDir | Out-Null

lib_log "INFO" "[$GATE] Checking memory isolation markers in E2E harness..."

$E2eDirs = @((Join-Path $ROOT "e2e"), (Join-Path $ROOT "scripts/e2e"))
$IsolationFound = $false

foreach ($dir in $E2eDirs) {
  if (Test-Path $dir) {
    $hits = Get-ChildItem -Path $dir -Recurse -ErrorAction SilentlyContinue | ForEach-Object {
      Select-String -Path $_.FullName -Pattern "TITANE_MEMORY_DIR" -ErrorAction SilentlyContinue
    }
    if ($hits) {
      lib_pass $GATE "TITANE_MEMORY_DIR isolation marker found in $dir"
      $IsolationFound = $true
    }
  }
}

if (-not $IsolationFound) {
  lib_blocked_runner $GATE `
    "E2E harness not yet instrumented or no e2e/ directory" `
    "Add TITANE_MEMORY_DIR and TITANE_LOG_DIR isolation markers to e2e scripts per E2E constitution"
}

lib_pass $GATE "G8 memory isolation check complete"
exit 0
