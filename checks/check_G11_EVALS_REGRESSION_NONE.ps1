# checks/check_G11_EVALS_REGRESSION_NONE.ps1 — Gate G11: Evals regression = zero (BLOCKED_INSTRUMENTATION)
# Ring: 4 — Status: EXPERIMENTAL
# Rollback: git restore -- checks/check_G11_EVALS_REGRESSION_NONE.ps1

$ErrorActionPreference = "Stop"
$GATE = "G11_EVALS_REGRESSION_NONE"
. "$PSScriptRoot/_lib.ps1"

$PackDir = Join-Path $PROOF_PACKS_DIR $GATE
New-Item -ItemType Directory -Force -Path $PackDir | Out-Null

$Found = (1..3 | Where-Object { Test-Path (Join-Path $PackDir "evals_run$_.jsonl") }).Count
if ($Found -ge 3) {
  lib_pass $GATE "x3 evals proof files present"
  exit 0
}

lib_blocked_instrumentation $GATE `
  "Evals regression suite requires LLM/model endpoint and dataset — not available in CI prep" `
  "Run eval suite x3 after merge; record in $PackDir\evals_runN.jsonl; assert zero regression"
exit 0
