#Requires -Version 5.1
[CmdletBinding()]
param()

$ErrorActionPreference = 'Continue'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path

function Get-CommandStatus {
    param([string]$Name)
    if (Get-Command $Name -ErrorAction SilentlyContinue) { return 'PASS' }
    return 'FAIL'
}

function Get-VSInstallPath {
    $vswhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
    if (Test-Path -LiteralPath $vswhere) {
        $install = & $vswhere -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath 2>$null
        if ($LASTEXITCODE -eq 0 -and $install) { return ($install | Select-Object -First 1) }
    }
    $fallback = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\2022\BuildTools"
    if (Test-Path -LiteralPath $fallback) { return $fallback }
    return $null
}

function Get-MSVCBinaryStatus {
    param([string]$BinaryName)
    if (Get-Command $BinaryName -ErrorAction SilentlyContinue) { return 'PASS' }
    $install = Get-VSInstallPath
    if (-not $install) { return 'UNKNOWN' }
    $matches = Get-ChildItem -LiteralPath (Join-Path $install 'VC\Tools\MSVC') -Filter $BinaryName -Recurse -ErrorAction SilentlyContinue | Where-Object {
        $_.FullName -like '*\bin\Hostx64\x64\*' -or $_.FullName -like '*\bin\Hostx86\x64\*'
    }
    if ($matches) { return 'PASS' }
    return 'FAIL'
}

function Get-FirstLine {
    param([scriptblock]$Command)
    try {
        $value = & $Command 2>$null | Select-Object -First 1
        if ($LASTEXITCODE -ne 0 -and -not $value) { return 'UNKNOWN' }
        if ($value) { return ($value -replace "`r|`n", '').Trim() }
        return 'UNKNOWN'
    } catch {
        return 'UNKNOWN'
    }
}

function Test-WebView2 {
    $keys = @(
        'HKLM:\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}',
        'HKLM:\SOFTWARE\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}',
        'HKCU:\SOFTWARE\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}'
    )
    foreach ($key in $keys) {
        if (Test-Path -LiteralPath $key) { return 'PASS' }
    }
    return 'FAIL'
}

function Test-VbScript {
    try {
        $feature = Get-WindowsOptionalFeature -Online -FeatureName VBSCRIPT -ErrorAction SilentlyContinue
        if ($feature) {
            if ($feature.State -eq 'Enabled') { return 'PASS' }
            return 'FAIL'
        }
        return 'UNKNOWN_WITH_NOTE'
    } catch {
        return 'UNKNOWN_WITH_NOTE'
    }
}

function Test-MSVCBuildTools {
    if (Get-VSInstallPath) { return 'PASS' }
    return 'UNKNOWN'
}

$osHost = if ($env:GITHUB_ACTIONS -eq 'true') { 'GITHUB_ACTIONS_WINDOWS' } elseif ([Environment]::OSVersion.Platform -eq 'Win32NT' -and [Environment]::OSVersion.Version.Build -ge 22000) { 'WINDOWS_11_LOCAL' } elseif ([Environment]::OSVersion.Platform -eq 'Win32NT') { 'WINDOWS_LOCAL' } else { 'UNKNOWN' }
$package = Get-Content -Raw -LiteralPath (Join-Path $root 'package.json') | ConvertFrom-Json
$expected = [string]$package.packageManager
$expectedPnpm = if ($expected -match '^pnpm@([^+]+)') { $Matches[1] } else { 'UNKNOWN' }
$pnpmVersion = Get-FirstLine { pnpm --version }
$pnpmMatch = if ($expectedPnpm -ne 'UNKNOWN' -and $pnpmVersion -eq $expectedPnpm) { 'YES' } else { 'NO' }
$rustHostOutput = try { rustc -vV 2>$null } catch { @() }
$rustDefaultHost = (($rustHostOutput) | Where-Object { $_ -like 'host:*' } | Select-Object -First 1) -replace '^host:\s*',''
if (-not $rustDefaultHost) { $rustDefaultHost = 'UNKNOWN' }

$nodeVersion = Get-FirstLine { node --version }
$cargoVersion = Get-FirstLine { cargo --version }
$rustVersion = Get-FirstLine { rustc --version }
$msvc = Test-MSVCBuildTools
$cl = Get-MSVCBinaryStatus 'cl.exe'
$link = Get-MSVCBinaryStatus 'link.exe'
$webview2 = Test-WebView2
$vbscript = Test-VbScript

$required = @($nodeVersion, $pnpmVersion, $rustVersion, $cargoVersion)
$hasMissingRequired = $required | Where-Object { $_ -eq 'UNKNOWN' }
$hasFail = @($pnpmMatch, $cl, $link, $webview2) | Where-Object { $_ -in @('NO','FAIL') }
$hasUnknown = @($msvc, $vbscript, $rustDefaultHost) | Where-Object { $_ -like 'UNKNOWN*' }
$windows11Toolchain = if ($osHost -notin @('WINDOWS_11_LOCAL','GITHUB_ACTIONS_WINDOWS','WINDOWS_LOCAL')) {
    'UNKNOWN'
} elseif ($hasMissingRequired -or $hasFail) {
    'FAIL'
} elseif ($hasUnknown) {
    'PARTIAL'
} else {
    'PASS'
}

Write-Output "OS_HOST=$osHost"
Write-Output "WINDOWS_VERSION=$([Environment]::OSVersion.Version)"
Write-Output "NODE_VERSION=$nodeVersion"
Write-Output "PNPM_VERSION=$pnpmVersion"
Write-Output "PNPM_PACKAGE_MANAGER_EXPECTED=$expected"
Write-Output "PNPM_PACKAGE_MANAGER_MATCH=$pnpmMatch"
Write-Output "RUSTC_VERSION=$rustVersion"
Write-Output "RUST_DEFAULT_HOST=$rustDefaultHost"
Write-Output "CARGO_VERSION=$cargoVersion"
Write-Output "MSVC_BUILD_TOOLS=$msvc"
Write-Output "CL_EXE=$cl"
Write-Output "LINK_EXE=$link"
Write-Output "WEBVIEW2_RUNTIME=$webview2"
Write-Output "VBSCRIPT_STATUS=$vbscript"
Write-Output "WINDOWS_11_TOOLCHAIN=$windows11Toolchain"

if ($windows11Toolchain -eq 'FAIL') { exit 1 }
