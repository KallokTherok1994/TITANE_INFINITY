# scripts/proofpack_init.ps1 — Initialize a new proof pack for a session
# Ring: 4 — Status: STABLE
# Rollback: git restore -- scripts/proofpack_init.ps1

$ErrorActionPreference = "Stop"
$ScriptDir = $PSScriptRoot
$ROOT = Split-Path $ScriptDir -Parent
$TemplatesDir = Join-Path $ROOT "templates/proof_pack"
$Timestamp = (Get-Date).ToUniversalTime().ToString("yyyyMMddTHHmmssZ")
$SessionId = if ($env:SESSION_ID) { $env:SESSION_ID } else { "session_$Timestamp" }
$BasePacksDir = if ($env:PROOF_PACKS_DIR) { $env:PROOF_PACKS_DIR } else { Join-Path $ROOT "proof_packs" }
$PackDir = Join-Path $BasePacksDir $SessionId

Write-Host "======================================================================"
Write-Host " proofpack_init.ps1 — Initializing proof pack: $SessionId"
Write-Host "======================================================================"

New-Item -ItemType Directory -Force -Path (Join-Path $PackDir "PHASES") | Out-Null

Get-ChildItem -Path $TemplatesDir -Filter "*.md" | ForEach-Object {
  $dest = Join-Path $PackDir $_.Name
  if (-not (Test-Path $dest)) {
    Copy-Item $_.FullName $dest
    Write-Host "  + $($_.Name)"
  }
}

Get-ChildItem -Path (Join-Path $TemplatesDir "PHASES") -Filter "*.md" -ErrorAction SilentlyContinue | ForEach-Object {
  $dest = Join-Path $PackDir "PHASES/$($_.Name)"
  if (-not (Test-Path $dest)) {
    Copy-Item $_.FullName $dest
    Write-Host "  + PHASES/$($_.Name)"
  }
}

$ts = (Get-Date).ToUniversalTime().ToString("o")
Add-Content -Path (Join-Path $PackDir "run.jsonl") -Value "{`"ts`":`"$ts`",`"event`":`"proofpack_init`",`"session_id`":`"$SessionId`",`"pack_dir`":`"$PackDir`"}"

Write-Host "`nProof pack initialized at: $PackDir"
Write-Host "SESSION_ID=$SessionId"
exit 0
