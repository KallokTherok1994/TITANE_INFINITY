#Requires -Version 5.1
[CmdletBinding()]
param(
    [ValidateSet('PreBuild','PostBuild')]
    [string]$Mode = 'PreBuild'
)

$ErrorActionPreference = 'Continue'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path

function Invoke-RepoCommand {
    param([string[]]$Command)
    Push-Location $root
    try {
        $output = & $Command[0] @($Command | Select-Object -Skip 1) 2>&1
        $exitCode = $LASTEXITCODE
        return [pscustomobject]@{ Output = $output; ExitCode = $exitCode }
    } finally {
        Pop-Location
    }
}

function Get-Field {
    param([object[]]$Output, [string]$Name)
    $line = $Output | Where-Object { "$_" -like "$Name=*" } | Select-Object -Last 1
    if ($line) { return ([string]$line).Substring($Name.Length + 1) }
    return 'UNKNOWN'
}

$package = Get-Content -Raw -LiteralPath (Join-Path $root 'package.json') | ConvertFrom-Json
$version = [string]$package.version

if ($Mode -eq 'PreBuild') {
    $os = Invoke-RepoCommand @('node', 'scripts/verify/verify-os-host.mjs')
    $toolchain = Invoke-RepoCommand @('powershell', '-ExecutionPolicy', 'Bypass', '-File', 'scripts/verify/verify-windows-toolchain.ps1')
    $icon = Invoke-RepoCommand @('powershell', '-ExecutionPolicy', 'Bypass', '-File', 'scripts/verify/verify-windows-icon.ps1')
    $tauri = Invoke-RepoCommand @('pnpm', 'run', 'verify:tauri-configs')

    $statuses = @(
        Get-Field $os.Output 'OS_HOST_CLASSIFICATION',
        Get-Field $toolchain.Output 'WINDOWS_11_TOOLCHAIN',
        Get-Field $icon.Output 'WINDOWS_ICON_ICO_MULTILAYER',
        $(if ($tauri.ExitCode -eq 0) { 'PASS' } else { 'FAIL' })
    )
    $pre = if ($statuses -contains 'FAIL') { 'FAIL' } elseif ($statuses -contains 'PARTIAL') { 'PARTIAL' } elseif ($statuses -contains 'UNKNOWN') { 'PARTIAL' } else { 'PASS' }
    Write-Output "WINDOWS_RELEASE_READINESS_PREBUILD=$pre"
    Write-Output 'WINDOWS_RELEASE_READINESS_POSTBUILD=PENDING'
    Write-Output "WINDOWS_MSI_V35=$(if ($version -like '35.*') { 'PENDING' } else { 'UNKNOWN' })"
    if ($pre -eq 'FAIL') { exit 1 }
    exit 0
}

$artifact = Invoke-RepoCommand @('powershell', '-ExecutionPolicy', 'Bypass', '-File', 'scripts/verify/verify-windows-msi-artifact.ps1')
$smokeStatusFile = Join-Path $root 'runtime\windows\install-smoke-status.json'
$smoke = if (Test-Path -LiteralPath $smokeStatusFile) {
    $smokeJson = Get-Content -Raw -LiteralPath $smokeStatusFile | ConvertFrom-Json
    [pscustomobject]@{
        Output = @(
            "WINDOWS_INSTALL_SMOKE=$($smokeJson.windows_install_smoke)",
            "WINDOWS_MSI_INSTALL=$($smokeJson.windows_msi_install)",
            "APP_LAUNCH=$($smokeJson.app_launch)",
            "VISIBLE_VERSION=$($smokeJson.visible_version)",
            "WINDOWS_MSI_UNINSTALL=$($smokeJson.windows_msi_uninstall)",
            "WINDOWS_ROLLBACK=$($smokeJson.windows_rollback)"
        )
        ExitCode = 0
    }
} else {
    Invoke-RepoCommand @('powershell', '-ExecutionPolicy', 'Bypass', '-File', 'scripts/verify/verify-windows-install-smoke.ps1')
}
$artifactStatus = Get-Field $artifact.Output 'WINDOWS_MSI_ARTIFACT'
$smokeStatus = Get-Field $smoke.Output 'WINDOWS_INSTALL_SMOKE'
$rollbackStatus = Get-Field $smoke.Output 'WINDOWS_ROLLBACK'
$post = if ($artifactStatus -eq 'PASS' -and $smokeStatus -eq 'PASS' -and $rollbackStatus -eq 'PASS') { 'PASS' } elseif ($artifactStatus -eq 'FAIL') { 'FAIL' } elseif ($smokeStatus -eq 'PENDING') { 'PENDING' } else { 'PARTIAL' }
$msiV35 = if ($version -like '35.*' -and $artifactStatus -eq 'PASS') { 'PASS' } elseif ($version -like '35.*') { 'FAIL' } else { 'UNKNOWN' }

Write-Output 'WINDOWS_RELEASE_READINESS_PREBUILD=UNKNOWN'
Write-Output "WINDOWS_RELEASE_READINESS_POSTBUILD=$post"
Write-Output "WINDOWS_MSI_V35=$msiV35"
Write-Output "WINDOWS_INSTALL_SMOKE=$smokeStatus"
Write-Output "WINDOWS_ROLLBACK=$rollbackStatus"
Write-Output 'WINDOWS_CODE_SIGNING=UNKNOWN_OR_DEV_UNSIGNED'

if ($post -eq 'FAIL') { exit 1 }
