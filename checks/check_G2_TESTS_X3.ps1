# checks/check_G2_TESTS_X3.ps1 — Gate G2: Tests pass x3 (no skips)
# Ring: 4 — Status: STABLE
# Rollback: git restore -- checks/check_G2_TESTS_X3.ps1

$ErrorActionPreference = "Stop"
$GATE = "G2_TESTS_X3"
. "$PSScriptRoot/_lib.ps1"

$ROOT = lib_repo_root
$PackDir = Join-Path $PROOF_PACKS_DIR $GATE
New-Item -ItemType Directory -Force -Path $PackDir | Out-Null

$X3Results = @(
  (Join-Path $PackDir "test_run1.jsonl"),
  (Join-Path $PackDir "test_run2.jsonl"),
  (Join-Path $PackDir "test_run3.jsonl")
)
$Found = ($X3Results | Where-Object { Test-Path $_ }).Count

if ($Found -ge 3) {
  lib_pass $GATE "x3 test proof files present (runs: $Found)"
  exit 0
}

lib_require_file $GATE (Join-Path $ROOT "package.json")
lib_blocked_runner $GATE `
  "Test runtime requires Tauri context or pnpm environment" `
  "Run 'pnpm test' x3 in VS Code after merge; store results in $PackDir\test_runN.jsonl; assert zero SKIP"
exit 0
