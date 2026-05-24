#Requires -Version 5.1
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$iconPath = Join-Path $root 'src-tauri\icons\icon.ico'
$required = @(16, 24, 32, 48, 64, 256)
$layers = @()
$status = 'UNKNOWN'

if (-not (Test-Path -LiteralPath $iconPath)) {
    Write-Output 'ICON_ICO_EXISTS=NO'
    Write-Output 'ICON_ICO_LAYERS='
    Write-Output 'REQUIRED_LAYERS_PRESENT=NO'
    Write-Output 'WINDOWS_ICON_ICO_MULTILAYER=FAIL'
    exit 1
}

try {
    $bytes = [System.IO.File]::ReadAllBytes($iconPath)
    if ($bytes.Length -lt 6) { throw 'ICO too small' }
    $count = [BitConverter]::ToUInt16($bytes, 4)
    for ($i = 0; $i -lt $count; $i++) {
        $offset = 6 + ($i * 16)
        if ($offset + 1 -ge $bytes.Length) { continue }
        $width = [int]$bytes[$offset]
        if ($width -eq 0) { $width = 256 }
        $layers += $width
    }
    $layers = $layers | Sort-Object -Unique
    $missing = $required | Where-Object { $_ -notin $layers }
    $requiredPresent = if ($missing.Count -eq 0) { 'YES' } else { 'NO' }
    $status = if ($requiredPresent -eq 'YES') { 'PASS' } else { 'FAIL' }
} catch {
    $requiredPresent = 'UNKNOWN'
    $status = 'UNKNOWN'
}

Write-Output 'ICON_ICO_EXISTS=YES'
Write-Output "ICON_ICO_LAYERS=$($layers -join ',')"
Write-Output "REQUIRED_LAYERS_PRESENT=$requiredPresent"
Write-Output "WINDOWS_ICON_ICO_MULTILAYER=$status"

if ($status -eq 'FAIL') { exit 1 }
