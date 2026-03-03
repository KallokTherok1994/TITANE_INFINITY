param(
  [string]$Pack = ""
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if ([string]::IsNullOrWhiteSpace($Pack)) {
  bash scripts/run_final.sh
} else {
  bash scripts/run_final.sh $Pack
}
