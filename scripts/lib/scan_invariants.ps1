param(
  [Parameter(Mandatory=$true)][string]$PackDir
)

$ErrorActionPreference = 'Stop'
$RootDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$OutFile = Join-Path $PackDir '04_INVARIANTS_CHECK.md'

"# 04_INVARIANTS_CHECK" | Tee-Object -FilePath $OutFile -Append
(Get-Date -Format o) | Tee-Object -FilePath $OutFile -Append

bash "$RootDir/scripts/gates/g_frontend_no_web.sh" | Tee-Object -FilePath $OutFile -Append
bash "$RootDir/scripts/gates/g_network_one_door.sh" | Tee-Object -FilePath $OutFile -Append
bash "$RootDir/scripts/gates/g_no_test_skips.sh" | Tee-Object -FilePath $OutFile -Append
