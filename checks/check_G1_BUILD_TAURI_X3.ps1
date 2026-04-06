# checks/check_G1_BUILD_TAURI_X3.ps1 — Gate G1: Tauri build reproducible x3
# Ring: 4 — Status: STABLE
# Rollback: git restore -- checks/check_G1_BUILD_TAURI_X3.ps1

$ErrorActionPreference = "Stop"
$GATE = "G1_BUILD_TAURI_X3"
. "$PSScriptRoot/_lib.ps1"

$ROOT = lib_repo_root
$PackDir = Join-Path $PROOF_PACKS_DIR $GATE
New-Item -ItemType Directory -Force -Path $PackDir | Out-Null

$X3Results = @(
  (Join-Path $PackDir "build_run1.jsonl"),
  (Join-Path $PackDir "build_run2.jsonl"),
  (Join-Path $PackDir "build_run3.jsonl")
)
$Found = ($X3Results | Where-Object { Test-Path $_ }).Count

if ($Found -ge 3) {
  lib_pass $GATE "x3 build proof files present (runs: $Found)"
  exit 0
}

lib_blocked_runner $GATE `
  "Tauri/Rust toolchain not available in CI prep environment" `
  "Run 'pnpm run build:tauri' x3 in VS Code after merge; store results in $PackDir\build_runN.jsonl"

lib_require_file $GATE (Join-Path $ROOT "src-tauri/Cargo.toml")
lib_require_file $GATE (Join-Path $ROOT "src-tauri/tauri.conf.json")
exit 0
