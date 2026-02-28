# scripts/run_all.ps1 — Run all gate checks sequentially
# Ring: 4 — Status: STABLE
# Rollback: git restore -- scripts/run_all.ps1

$ErrorActionPreference = "Stop"
$ScriptDir = $PSScriptRoot
$ROOT = Split-Path $ScriptDir -Parent
$ChecksDir = Join-Path $ROOT "checks"
if (-not $env:PROOF_PACKS_DIR) { $env:PROOF_PACKS_DIR = Join-Path $ROOT "proof_packs" }
$PROOF_PACKS_DIR = $env:PROOF_PACKS_DIR

Write-Host "======================================================================"
Write-Host " TITANE_INFINITY — run_all.ps1 — $((Get-Date).ToUniversalTime().ToString('o'))"
Write-Host " PROOF_PACKS_DIR: $PROOF_PACKS_DIR"
Write-Host "======================================================================"

New-Item -ItemType Directory -Force -Path $PROOF_PACKS_DIR | Out-Null

$Pass = 0; $Fail = 0; $Results = @()

Get-ChildItem -Path $ChecksDir -Filter "check_G*.ps1" | Sort-Object Name | ForEach-Object {
  $name = $_.BaseName
  Write-Host "`n--- $name ---"
  try {
    & $_.FullName
    $Pass++
    $Results += "PASS  $name"
  } catch {
    $Fail++
    $Results += "FAIL  $name ($_)"
  }
}

Write-Host "`n======================================================================"
Write-Host " SUMMARY"
Write-Host "======================================================================"
$Results | ForEach-Object { Write-Host "  $_" }
Write-Host "`n  PASS: $Pass  FAIL: $Fail"
Write-Host "======================================================================"

$ts = (Get-Date).ToUniversalTime().ToString("o")
$summaryLine = "{`"ts`":`"$ts`",`"pass`":$Pass,`"fail`":$Fail}"
Add-Content -Path (Join-Path $PROOF_PACKS_DIR "run_all_summary.jsonl") -Value $summaryLine

if ($Fail -gt 0) {
  Write-Host "STOP-THE-LINE: One or more gates FAILED"
  exit 1
}
Write-Host "ALL GATES PASSED"
exit 0
