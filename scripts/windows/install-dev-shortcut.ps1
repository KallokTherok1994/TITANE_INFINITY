# TITANE Windows Dev shortcut installer
# Rollback: remove "$([Environment]::GetFolderPath('Desktop'))\Titan-Dev.lnk"

[CmdletBinding()]
param(
    [ValidateSet('Desktop', 'StartMenu', 'Both')]
    [string]$Scope = 'Both'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$ROOT = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$launcher = Join-Path $ROOT 'scripts\launch\launch-titane.ps1'
$icon = Join-Path $ROOT 'titane-app-icon.png'

if (-not (Test-Path -LiteralPath $launcher)) {
    throw "TITANE Dev launcher not found: $launcher"
}

$powershell = (Get-Command powershell.exe -ErrorAction Stop).Source
$arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$launcher`" -Mode dev"

function New-TitaneDevShortcut {
    param([string]$ShortcutPath)

    $directory = Split-Path -Parent $ShortcutPath
    New-Item -ItemType Directory -Force -Path $directory | Out-Null

    $shell = New-Object -ComObject WScript.Shell
    $shortcut = $shell.CreateShortcut($ShortcutPath)
    $shortcut.TargetPath = $powershell
    $shortcut.Arguments = $arguments
    $shortcut.WorkingDirectory = $ROOT
    $shortcut.Description = 'Titan-Dev Windows native launcher'
    if (Test-Path -LiteralPath $icon) {
        $shortcut.IconLocation = $icon
    }
    $shortcut.Save()

    $verify = $shell.CreateShortcut($ShortcutPath)
    if ($verify.TargetPath -ne $powershell -or $verify.Arguments -ne $arguments) {
        throw "Shortcut verification failed: $ShortcutPath"
    }

    Write-Host "[OK] Titan-Dev shortcut: $ShortcutPath"
    Write-Host "     Target: $($verify.TargetPath) $($verify.Arguments)"
}

$targets = @()
if ($Scope -in @('Desktop', 'Both')) {
    $targets += Join-Path ([Environment]::GetFolderPath('Desktop')) 'Titan-Dev.lnk'
}
if ($Scope -in @('StartMenu', 'Both')) {
    $targets += Join-Path ([Environment]::GetFolderPath('Programs')) 'TITANE_INFINITY\Titan-Dev.lnk'
}

foreach ($target in $targets) {
    New-TitaneDevShortcut -ShortcutPath $target
}
