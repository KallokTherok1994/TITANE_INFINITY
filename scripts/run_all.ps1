$ErrorActionPreference = 'Stop'
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
$PackDir = if ($args.Count -gt 0) { $args[0] } else { Join-Path $RootDir 'proof_packs/OPTION1_LIBSQL_TESTS_2026-03-05_1253_f0ec87ead' }

New-Item -ItemType Directory -Path $PackDir -Force | Out-Null

& "$ScriptDir/lib/scan_invariants.ps1" $PackDir
& "$ScriptDir/lib/run_x3.ps1" "$PackDir/06_TESTS_X3.log" "pnpm run test:rust"
& "$ScriptDir/lib/run_x3.ps1" "$PackDir/07_BUILD_X3.log" "pnpm tauri build"
