#Requires -Version 5.1
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$msiDir = Join-Path $root 'src-tauri\target\release\bundle\msi'
$package = Get-Content -Raw -LiteralPath (Join-Path $root 'package.json') | ConvertFrom-Json
$version = [string]$package.version

function Get-Sha256Line {
    param([string]$Path)
    if (Get-Command Get-FileHash -ErrorAction SilentlyContinue) {
        $hash = Get-FileHash -LiteralPath $Path -Algorithm SHA256
        return "{0}  {1}" -f $hash.Hash.ToLowerInvariant(), (Split-Path $hash.Path -Leaf)
    }

    $stream = [System.IO.File]::OpenRead($Path)
    try {
        $sha = [System.Security.Cryptography.SHA256]::Create()
        $bytes = $sha.ComputeHash($stream)
        $hex = -join ($bytes | ForEach-Object { $_.ToString('x2') })
        return "{0}  {1}" -f $hex, (Split-Path $Path -Leaf)
    } finally {
        $stream.Dispose()
    }
}

if (-not (Test-Path -LiteralPath $msiDir)) {
    Write-Output 'MSI_COUNT=0'
    Write-Output 'MSI_FILES='
    Write-Output 'SHA256SUMS='
    Write-Output 'WINDOWS_MSI_ARTIFACT=FAIL'
    Write-Output 'WINDOWS_MSI_V35=PENDING'
    exit 1
}

$msis = Get-ChildItem -LiteralPath $msiDir -Filter '*.msi' -File -ErrorAction SilentlyContinue | Where-Object { $_.Length -gt 0 }
if (-not $msis -or $msis.Count -eq 0) {
    Write-Output 'MSI_COUNT=0'
    Write-Output 'MSI_FILES='
    Write-Output 'SHA256SUMS='
    Write-Output 'WINDOWS_MSI_ARTIFACT=FAIL'
    Write-Output 'WINDOWS_MSI_V35=PENDING'
    exit 1
}

$shaFile = Join-Path $msiDir 'SHA256SUMS.txt'
$msis | ForEach-Object { Get-Sha256Line -Path $_.FullName } | Set-Content -LiteralPath $shaFile -Encoding ascii

$versionMatch = $msis | Where-Object { $_.Name -like "*$version*" }
$status = if ($versionMatch) { 'PASS' } else { 'UNKNOWN' }
$v35 = if ($version -like '35.*' -and $status -eq 'PASS') { 'PASS' } elseif ($version -like '35.*') { 'PENDING' } else { 'UNKNOWN' }

Write-Output "MSI_COUNT=$($msis.Count)"
Write-Output "MSI_FILES=$($msis.Name -join ',')"
Write-Output "SHA256SUMS=$shaFile"
Write-Output "WINDOWS_MSI_ARTIFACT=$status"
Write-Output "WINDOWS_MSI_V35=$v35"

if ($status -eq 'FAIL') { exit 1 }
