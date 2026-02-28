# scripts/run_x3.ps1 — Run all gates x3 for reproducibility proof
# Ring: 4 — Status: STABLE
# Rollback: git restore -- scripts/run_x3.ps1

$ErrorActionPreference = "Stop"
$ScriptDir = $PSScriptRoot
$ROOT = Split-Path $ScriptDir -Parent
if (-not $env:PROOF_PACKS_DIR) { $env:PROOF_PACKS_DIR = Join-Path $ROOT "proof_packs" }
$BASE_PROOF_PACKS_DIR = $env:PROOF_PACKS_DIR

Write-Host "======================================================================"
Write-Host " TITANE_INFINITY — run_x3.ps1 — Reproducibility x3"
Write-Host " $((Get-Date).ToUniversalTime().ToString('o'))"
Write-Host "======================================================================"

$Fail = 0
for ($Run = 1; $Run -le 3; $Run++) {
  Write-Host "`n>>> RUN $Run/3 <<<"
  $env:PROOF_PACKS_DIR = Join-Path $BASE_PROOF_PACKS_DIR "run_x3_$Run"
  try {
    & (Join-Path $ScriptDir "run_all.ps1")
  } catch {
    $Fail++
    Write-Host "RUN $Run FAILED: $_"
  }
}
$env:PROOF_PACKS_DIR = $BASE_PROOF_PACKS_DIR

Write-Host "`n======================================================================"
$ts = (Get-Date).ToUniversalTime().ToString("o")
if ($Fail -eq 0) {
  Write-Host " x3 REPRODUCIBILITY: PASS"
  Add-Content -Path (Join-Path $BASE_PROOF_PACKS_DIR "run_x3_summary.jsonl") -Value "{`"ts`":`"$ts`",`"x3`":`"PASS`",`"fail_runs`":0}"
  exit 0
} else {
  Write-Host " x3 REPRODUCIBILITY: FAIL ($Fail run(s) failed) — STOP-THE-LINE"
  Add-Content -Path (Join-Path $BASE_PROOF_PACKS_DIR "run_x3_summary.jsonl") -Value "{`"ts`":`"$ts`",`"x3`":`"FAIL`",`"fail_runs`":$Fail}"
  exit 1
}
