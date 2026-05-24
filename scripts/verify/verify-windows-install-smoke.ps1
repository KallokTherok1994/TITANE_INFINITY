#Requires -Version 5.1
[CmdletBinding()]
param(
    [string]$MsiPath,
    [string]$ExpectedVersion,
    [switch]$Install,
    [switch]$Uninstall
)

$ErrorActionPreference = 'Continue'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$runtimeDir = Join-Path $root 'runtime\windows'
$statusPath = Join-Path $runtimeDir 'install-smoke-status.json'
$screenshotPath = Join-Path $runtimeDir 'install-smoke-screenshot.png'
New-Item -ItemType Directory -Force -Path $runtimeDir | Out-Null

function Write-SmokeStatus {
    param([hashtable]$Payload)
    $Payload.generated_at = (Get-Date).ToUniversalTime().ToString('o')
    $Payload | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $statusPath -Encoding utf8
}

function Test-Administrator {
    try {
        $current = [Security.Principal.WindowsIdentity]::GetCurrent()
        $principal = New-Object Security.Principal.WindowsPrincipal($current)
        return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    } catch {
        return $false
    }
}

function Get-TitaneArpEntry {
    $arpKeys = @(
        'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*',
        'HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*',
        'HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*'
    )
    Get-ItemProperty -Path $arpKeys -ErrorAction SilentlyContinue |
        Where-Object {
            $_.DisplayName -like '*TITANE*' -or
            $_.DisplayName -like '*titane*' -or
            $_.DisplayName -like '*Titan*'
        } |
        Sort-Object DisplayVersion -Descending |
        Select-Object -First 1
}

function Get-TitaneShortcut {
    $startMenuPaths = @(
        "$env:ProgramData\Microsoft\Windows\Start Menu\Programs",
        "$env:APPDATA\Microsoft\Windows\Start Menu\Programs"
    )
    Get-ChildItem -Path $startMenuPaths -Filter '*Titan*.lnk' -Recurse -ErrorAction SilentlyContinue |
        Select-Object -First 1
}

function Resolve-ShortcutTarget {
    param([string]$ShortcutPath)
    try {
        $shell = New-Object -ComObject WScript.Shell
        $shortcut = $shell.CreateShortcut($ShortcutPath)
        return $shortcut.TargetPath
    } catch {
        return $null
    }
}

function Resolve-LaunchTarget {
    param($ArpEntry, $Shortcut)
    if ($Shortcut) {
        $target = Resolve-ShortcutTarget -ShortcutPath $Shortcut.FullName
        if ($target -and (Test-Path -LiteralPath $target)) { return $target }
    }
    if ($ArpEntry -and $ArpEntry.DisplayIcon) {
        $candidate = ([string]$ArpEntry.DisplayIcon) -replace '",?\d+$', '' -replace '^"', ''
        if ($candidate -and (Test-Path -LiteralPath $candidate)) { return $candidate }
    }
    if ($ArpEntry -and $ArpEntry.InstallLocation) {
        $exe = Get-ChildItem -LiteralPath $ArpEntry.InstallLocation -Filter '*.exe' -File -ErrorAction SilentlyContinue |
            Where-Object { $_.Name -like '*titane*' -or $_.Name -like '*titan*' } |
            Select-Object -First 1
        if ($exe) { return $exe.FullName }
    }
    return $null
}

function Capture-Screenshot {
    try {
        Add-Type -AssemblyName System.Windows.Forms
        Add-Type -AssemblyName System.Drawing
        $bounds = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
        $bitmap = New-Object System.Drawing.Bitmap $bounds.Width, $bounds.Height
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        $graphics.CopyFromScreen($bounds.Location, [System.Drawing.Point]::Empty, $bounds.Size)
        $bitmap.Save($screenshotPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $graphics.Dispose()
        $bitmap.Dispose()
        return $screenshotPath
    } catch {
        return $null
    }
}

if (-not $Install -and -not $Uninstall) {
    Write-Output 'WINDOWS_MSI_INSTALL=PENDING'
    Write-Output 'START_MENU_SHORTCUT=UNKNOWN'
    Write-Output 'ADD_REMOVE_PROGRAMS=UNKNOWN'
    Write-Output 'APP_LAUNCH=UNKNOWN'
    Write-Output 'VISIBLE_VERSION=UNKNOWN'
    Write-Output 'WINDOWS_MSI_UNINSTALL=UNKNOWN'
    Write-Output 'WINDOWS_ROLLBACK=UNKNOWN'
    Write-Output 'WINDOWS_INSTALL_SMOKE=PENDING'
    Write-Output "WINDOWS_INSTALL_SMOKE_STATUS=$statusPath"
    exit 0
}

$installStatus = 'UNKNOWN'
$shortcutStatus = 'UNKNOWN'
$arpStatus = 'UNKNOWN'
$launchStatus = 'UNKNOWN'
$versionStatus = 'UNKNOWN'
$uninstallStatus = 'UNKNOWN'
$rollbackStatus = 'UNKNOWN'
$launchTarget = $null
$launchPid = $null
$screenshot = $null
$installExitCode = $null
$adminShell = Test-Administrator

if ($Install) {
    if (-not $MsiPath -or -not (Test-Path -LiteralPath $MsiPath)) {
        $installStatus = 'FAIL'
    } elseif (-not $adminShell) {
        $installStatus = 'BLOCKED_ADMIN_REQUIRED'
    } else {
        $msiLog = Join-Path $runtimeDir 'install-msiexec.log'
        $process = Start-Process msiexec.exe -ArgumentList @('/i', "`"$MsiPath`"", '/qn', '/norestart', '/L*v', "`"$msiLog`"") -Wait -PassThru
        $installExitCode = $process.ExitCode
        $logText = if (Test-Path -LiteralPath $msiLog) { Get-Content -Raw -LiteralPath $msiLog } else { '' }
        $installStatus = if ($installExitCode -eq 0) {
            'PASS'
        } elseif ($installExitCode -eq 1603 -and $logText -match 'Error 1925|sufficient privileges|administrator') {
            'BLOCKED_ADMIN_REQUIRED'
        } else {
            'FAIL'
        }
    }
}

$shortcut = $null
$arp = $null
if (-not $Install -or $installStatus -eq 'PASS' -or $Uninstall) {
    $shortcut = Get-TitaneShortcut
    $shortcutStatus = if ($shortcut) { 'PASS' } else { 'UNKNOWN' }

    $arp = Get-TitaneArpEntry
    $arpStatus = if ($arp) { 'PASS' } else { 'UNKNOWN' }
    if ($ExpectedVersion -and $arp -and $arp.DisplayVersion) {
        $versionStatus = if ([string]$arp.DisplayVersion -eq $ExpectedVersion) { 'PASS' } else { 'FAIL' }
    }
}

if ($installStatus -eq 'BLOCKED_ADMIN_REQUIRED' -and -not $Uninstall) {
    $rollbackStatus = 'DOCUMENTED_NOT_EXECUTED'
}

if ($Install -and $installStatus -eq 'PASS') {
    $launchTarget = Resolve-LaunchTarget -ArpEntry $arp -Shortcut $shortcut
    if ($launchTarget) {
        try {
            $app = Start-Process -FilePath $launchTarget -PassThru
            $launchPid = $app.Id
            Start-Sleep -Seconds 20
            $alive = Get-Process -Id $launchPid -ErrorAction SilentlyContinue
            $launchStatus = if ($alive) { 'PASS' } else { 'FAIL' }
            $screenshot = Capture-Screenshot
            if ($alive) {
                Stop-Process -Id $launchPid -Force -ErrorAction SilentlyContinue
            }
        } catch {
            $launchStatus = 'FAIL'
        }
    } else {
        $launchStatus = 'UNKNOWN'
    }
}

if ($Uninstall) {
    if (Test-Path -LiteralPath $statusPath) {
        try {
            $previous = Get-Content -Raw -LiteralPath $statusPath | ConvertFrom-Json
            if ($previous.launch_pid) {
                Stop-Process -Id ([int]$previous.launch_pid) -Force -ErrorAction SilentlyContinue
            }
        } catch {}
    }
    if ($MsiPath -and (Test-Path -LiteralPath $MsiPath)) {
        $process = Start-Process msiexec.exe -ArgumentList @('/x', "`"$MsiPath`"", '/qn', '/norestart') -Wait -PassThru
        $uninstallStatus = if ($process.ExitCode -eq 0) { 'PASS' } else { 'FAIL' }
        $rollbackStatus = $uninstallStatus
    } else {
        $uninstallStatus = 'FAIL'
        $rollbackStatus = 'FAIL'
    }
}

$overall = if ($installStatus -eq 'BLOCKED_ADMIN_REQUIRED') {
    'BLOCKED_ADMIN_REQUIRED'
} elseif ($installStatus -eq 'FAIL' -or $versionStatus -eq 'FAIL' -or $uninstallStatus -eq 'FAIL') {
    'FAIL'
} elseif ($Install -and $installStatus -eq 'PASS') {
    if ($launchStatus -eq 'PASS' -and $versionStatus -eq 'PASS') { 'PASS' } else { 'UNKNOWN' }
} else {
    'UNKNOWN'
}

Write-SmokeStatus @{
    msi_path = $MsiPath
    expected_version = $ExpectedVersion
    windows_msi_install = $installStatus
    msiexec_exit_code = $installExitCode
    msiexec_log = if ($Install) { Join-Path $runtimeDir 'install-msiexec.log' } else { $null }
    admin_shell = if ($adminShell) { 'YES' } else { 'NO' }
    start_menu_shortcut = $shortcutStatus
    shortcut_path = if ($shortcut) { $shortcut.FullName } else { $null }
    add_remove_programs = $arpStatus
    arp_display_name = if ($arp) { $arp.DisplayName } else { $null }
    arp_display_version = if ($arp) { $arp.DisplayVersion } else { $null }
    install_location = if ($arp) { $arp.InstallLocation } else { $null }
    app_launch = $launchStatus
    launch_target = $launchTarget
    launch_pid = $launchPid
    visible_version = $versionStatus
    screenshot = $screenshot
    windows_msi_uninstall = $uninstallStatus
    windows_rollback = $rollbackStatus
    windows_install_smoke = $overall
}

Write-Output "WINDOWS_MSI_INSTALL=$installStatus"
Write-Output "ADMIN_SHELL=$(if ($adminShell) { 'YES' } else { 'NO' })"
Write-Output "START_MENU_SHORTCUT=$shortcutStatus"
Write-Output "ADD_REMOVE_PROGRAMS=$arpStatus"
Write-Output "APP_LAUNCH=$launchStatus"
Write-Output "VISIBLE_VERSION=$versionStatus"
Write-Output "WINDOWS_MSI_UNINSTALL=$uninstallStatus"
Write-Output "WINDOWS_ROLLBACK=$rollbackStatus"
Write-Output "WINDOWS_INSTALL_SMOKE=$overall"
Write-Output "WINDOWS_INSTALL_SMOKE_STATUS=$statusPath"
if ($screenshot) { Write-Output "WINDOWS_INSTALL_SCREENSHOT=$screenshot" }

if ($overall -eq 'FAIL') { exit 1 }
