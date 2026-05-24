#Requires -Version 5.1
<#
.SYNOPSIS
    TITANE Windows Launcher (PowerShell)

.DESCRIPTION
    Lance TITANE en mode developpement, effectue un build production,
    ou execute les verifications de sante selon le parametre Mode.

.PARAMETER Mode
    dev            - Demarre Tauri + Vite en mode developpement HMR (defaut)
    verify-windows - Verifie le host, la toolchain et la readiness Windows prebuild
    build-msi      - Build MSI Windows sans bump de version
    release-msi    - Bump + build MSI + verification artefact
    check          - TypeScript, lint et tests unitaires/Rust
    clean          - Supprime les artefacts (node_modules, target, dist)

.EXAMPLE
    .\launch-titane.ps1
    .\launch-titane.ps1 -Mode verify-windows
    .\launch-titane.ps1 -Mode build-msi
    .\launch-titane.ps1 -Mode check
#>

[CmdletBinding()]
param (
    [ValidateSet('dev', 'check', 'verify-windows', 'build-msi', 'release-msi', 'clean')]
    [string]$Mode = 'dev'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$ROOT = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$windowsEnv = Join-Path $ROOT 'scripts\windows\TitaneWindowsEnv.ps1'
if (Test-Path -LiteralPath $windowsEnv) {
    . $windowsEnv
}

# Helpers
function Write-Header {
    param([string]$Text)
    Write-Host ""
    Write-Host " =====================================================" -ForegroundColor Cyan
    Write-Host "   TITANE Windows Launcher  |  Mode: $Text" -ForegroundColor Cyan
    Write-Host " =====================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Assert-Tool {
    param([string]$Tool, [string]$HintUrl = '')
    if (-not (Get-Command $Tool -ErrorAction SilentlyContinue)) {
        Write-Host "[ERROR] '$Tool' introuvable." -ForegroundColor Red
        if ($HintUrl) { Write-Host "        Installez-le depuis : $HintUrl" -ForegroundColor Yellow }
        exit 1
    }
    $ver = & $Tool --version 2>$null | Select-Object -First 1
    Write-Host "[OK] $Tool`t$ver" -ForegroundColor Green
}

function Invoke-Pnpm {
    param([string[]]$Arguments)
    Push-Location $ROOT
    try {
        & pnpm @Arguments
        if ($LASTEXITCODE -ne 0) { throw "pnpm $($Arguments -join ' ') failed (exit $LASTEXITCODE)" }
    } finally {
        Pop-Location
    }
}

# Environment
Write-Header $Mode

Assert-Tool 'node'  'https://github.com/coreybutler/nvm-windows'
Assert-Tool 'pnpm'  'https://pnpm.io/installation'

if (-not (Get-Command 'cargo' -ErrorAction SilentlyContinue)) {
# Cargo
    Write-Host "[WARN] Cargo introuvable - build Tauri impossible." -ForegroundColor Yellow
    Write-Host "       Installez Rust via https://rustup.rs" -ForegroundColor Yellow
    if ($Mode -in @('dev', 'build-msi', 'release-msi')) {
        Write-Host "[ERROR] Cargo est requis pour les modes dev/build-msi/release-msi. Abandon." -ForegroundColor Red
        exit 1
    }
} else {
    $cargoVer = & cargo --version 2>$null
    Write-Host "[OK] cargo`t$cargoVer" -ForegroundColor Green
}

# WebView2
$wv2Key = 'HKLM:\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}'
if (-not (Test-Path $wv2Key)) {
    Write-Host "[WARN] WebView2 Runtime non detecte." -ForegroundColor Yellow
    Write-Host "       Telechargez : https://developer.microsoft.com/microsoft-edge/webview2/" -ForegroundColor Yellow
    if ($Mode -in @('dev', 'build-msi', 'release-msi')) {
        Write-Host "[ERROR] WebView2 est requis pour executer TITANE. Abandon." -ForegroundColor Red
        exit 1
    }
} else {
    $wv2Ver = (Get-ItemProperty $wv2Key -ErrorAction SilentlyContinue).pv
    Write-Host "[OK] WebView2`t$wv2Ver" -ForegroundColor Green
}

# .env
$envFile = Join-Path $ROOT '.env'
if (-not (Test-Path $envFile)) {
    $envExample = Join-Path $ROOT '.env.example'
    if (Test-Path $envExample) {
        Copy-Item $envExample $envFile
        Write-Host "[WARN] .env cree depuis .env.example. Renseignez vos cles API." -ForegroundColor Yellow
    }
}

# node_modules
$nm = Join-Path $ROOT 'node_modules'
if (-not (Test-Path $nm)) {
    Write-Host "[INFO] Installation des dependances JS..." -ForegroundColor Cyan
    Invoke-Pnpm 'install'
}

# Modes
switch ($Mode) {

    'dev' {
        Write-Host " >> Demarrage en mode developpement (Tauri + Vite HMR)" -ForegroundColor Cyan
        Write-Host ""
        try { Invoke-Pnpm 'run', 'gen:tauri-config' } catch { Write-Host "[WARN] gen:tauri-config: $_" -ForegroundColor Yellow }
        Invoke-Pnpm 'run', 'dev:windows'
    }

    'verify-windows' {
        Write-Host " >> Verifications Windows prebuild" -ForegroundColor Cyan
        Write-Host ""
        Invoke-Pnpm 'run', 'verify:os-host'
        Invoke-Pnpm 'run', 'verify:windows:toolchain'
        Invoke-Pnpm 'run', 'verify:windows:icon'
        Invoke-Pnpm 'run', 'verify:windows:release-readiness', '--', '-Mode', 'PreBuild'
        Write-Host ""
        Write-Host "[DONE] Verifications Windows prebuild terminees." -ForegroundColor Green
    }

    'build-msi' {
        Write-Host " >> Build MSI Windows (sans bump version)" -ForegroundColor Cyan
        Write-Host ""
        Invoke-Pnpm 'run', 'build:windows:msi'
        Invoke-Pnpm 'run', 'verify:windows:msi-artifact'
        $bundleDir = Join-Path $ROOT 'src-tauri\target\release\bundle'
        Write-Host ""
        Write-Host "[DONE] Artefacts dans : $bundleDir" -ForegroundColor Green
    }

    'release-msi' {
        Write-Host " >> Release MSI Windows (bump + build + verification artefact)" -ForegroundColor Cyan
        Write-Host ""
        Invoke-Pnpm 'run', 'release:windows:msi'
        Write-Host ""
        Write-Host "[DONE] Release MSI Windows terminee." -ForegroundColor Green
    }

    'check' {
        Write-Host " >> Verifications TypeScript + Lint + Tests" -ForegroundColor Cyan
        Write-Host ""
        Invoke-Pnpm 'run', 'check'
        Invoke-Pnpm 'run', 'lint'
        Invoke-Pnpm 'run', 'test:all'
        Write-Host ""
        Write-Host "[DONE] Toutes les verifications sont passees." -ForegroundColor Green
    }

    'clean' {
        Write-Host " >> Nettoyage des artefacts" -ForegroundColor Cyan
        Write-Host ""
        Invoke-Pnpm 'run', 'clean:all'
        Write-Host "[DONE] Nettoyage termine." -ForegroundColor Green
    }
}

Write-Host ""
Write-Host " [OK] TITANE - operation '$Mode' terminee." -ForegroundColor Cyan
Write-Host ""
