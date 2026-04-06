# scripts/proofpack_verify.ps1 — Verify proof pack completeness and integrity
# Ring: 4 — Status: STABLE
# Rollback: git restore -- scripts/proofpack_verify.ps1

$ErrorActionPreference = "Stop"
$ScriptDir = $PSScriptRoot
$ROOT = Split-Path $ScriptDir -Parent
if (-not $env:PROOF_PACKS_DIR) { $env:PROOF_PACKS_DIR = Join-Path $ROOT "proof_packs" }
$PROOF_PACKS_DIR = $env:PROOF_PACKS_DIR

Write-Host "======================================================================"
Write-Host " proofpack_verify.ps1 — $((Get-Date).ToUniversalTime().ToString('o'))"
Write-Host " PROOF_PACKS_DIR: $PROOF_PACKS_DIR"
Write-Host "======================================================================"

$Fail = 0

if (-not (Test-Path $PROOF_PACKS_DIR)) {
  Write-Host "FAIL: proof_packs directory does not exist: $PROOF_PACKS_DIR"
  exit 1
}

try {
  & (Join-Path $ROOT "checks/check_G0_PROOF_PACK_COMPLETE.ps1")
} catch {
  $Fail++
  Write-Host "FAIL: G0 check: $_"
}

$SummaryFile = Join-Path $PROOF_PACKS_DIR "run_all_summary.jsonl"
if (Test-Path $SummaryFile) {
  $Lines = (Get-Content $SummaryFile | Measure-Object -Line).Lines
  Write-Host "PASS: run_all_summary.jsonl present ($Lines entries)"
} else {
  Write-Host "WARN: run_all_summary.jsonl missing — run scripts/run_all.ps1 first"
}

$ts = (Get-Date).ToUniversalTime().ToString("o")
Add-Content -Path (Join-Path $PROOF_PACKS_DIR "proofpack_verify.jsonl") `
  -Value "{`"ts`":`"$ts`",`"event`":`"proofpack_verify`",`"fail`":$Fail}"

if ($Fail -eq 0) {
  Write-Host "`nproofpack_verify: PASS"
  exit 0
} else {
  Write-Host "`nproofpack_verify: FAIL — stop-the-line"
  exit 1
}
