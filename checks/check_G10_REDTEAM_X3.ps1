# checks/check_G10_REDTEAM_X3.ps1 — Gate G10: Red team x3 (BLOCKED_INSTRUMENTATION)
# Ring: 4 — Status: EXPERIMENTAL
# Rollback: git restore -- checks/check_G10_REDTEAM_X3.ps1

$ErrorActionPreference = "Stop"
$GATE = "G10_REDTEAM_X3"
. "$PSScriptRoot/_lib.ps1"

$PackDir = Join-Path $PROOF_PACKS_DIR $GATE
New-Item -ItemType Directory -Force -Path $PackDir | Out-Null

$Found = (1..3 | Where-Object { Test-Path (Join-Path $PackDir "redteam_run$_.jsonl") }).Count
if ($Found -ge 3) {
  lib_pass $GATE "x3 red team proof files present"
  exit 0
}

lib_blocked_instrumentation $GATE `
  "Red team execution requires manual adversarial testing" `
  "Perform x3 red team sessions in VS Code after merge; record results in $PackDir\redteam_runN.jsonl"
exit 0
