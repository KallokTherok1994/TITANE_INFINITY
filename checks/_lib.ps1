# checks/_lib.ps1 — Fonctions communes: logging, JSONL, exit codes
# Ring: 4 — Status: STABLE
# Rollback: git restore -- checks/_lib.ps1

$ErrorActionPreference = "Stop"

$PROOF_PACKS_DIR = if ($env:PROOF_PACKS_DIR) { $env:PROOF_PACKS_DIR } else {
  $root = & git rev-parse --show-toplevel 2>$null
  if ($LASTEXITCODE -ne 0) { "." } else { "$root/proof_packs" }
}

function lib_log {
  param([string]$Level, [string]$Message)
  $ts = (Get-Date).ToUniversalTime().ToString("HH:mm:ssZ")
  Write-Host "[$Level] $ts $Message"
}

function lib_log_jsonl {
  param([string]$Gate, [string]$Status, [string]$Message)
  $packDir = Join-Path $PROOF_PACKS_DIR $Gate
  New-Item -ItemType Directory -Force -Path $packDir | Out-Null
  $ts = (Get-Date).ToUniversalTime().ToString("o")
  $escaped = $Message -replace '"','\"'
  $line = "{`"ts`":`"$ts`",`"gate`":`"$Gate`",`"status`":`"$Status`",`"message`":`"$escaped`"}"
  Add-Content -Path (Join-Path $packDir "run.jsonl") -Value $line
}

function lib_pass {
  param([string]$Gate, [string]$Message)
  lib_log "PASS" "[$Gate] $Message"
  lib_log_jsonl $Gate "PASS" $Message
}

function lib_fail {
  param([string]$Gate, [string]$Message)
  lib_log "FAIL" "[$Gate] $Message"
  lib_log_jsonl $Gate "FAIL" $Message
  throw "FAIL: [$Gate] $Message"
}

function lib_blocked_runner {
  param([string]$Gate, [string]$Cause, [string]$NextAction)
  $msg = "cause=$Cause next_action=$NextAction"
  lib_log "BLOCKED_RUNNER" "[$Gate] $msg"
  lib_log_jsonl $Gate "BLOCKED_RUNNER" $msg
}

function lib_blocked_instrumentation {
  param([string]$Gate, [string]$Cause, [string]$NextAction)
  $msg = "cause=$Cause next_action=$NextAction"
  lib_log "BLOCKED_INSTRUMENTATION" "[$Gate] $msg"
  lib_log_jsonl $Gate "BLOCKED_INSTRUMENTATION" $msg
}

function lib_require_file {
  param([string]$Gate, [string]$Path)
  if (Test-Path $Path) {
    lib_pass $Gate "required file present: $Path"
  } else {
    lib_fail $Gate "required file MISSING: $Path"
  }
}

function lib_repo_root {
  $r = & git rev-parse --show-toplevel 2>$null
  if ($LASTEXITCODE -ne 0) { return (Get-Location).Path }
  return $r
}
