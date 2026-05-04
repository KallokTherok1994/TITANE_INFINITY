# ═══════════════════════════════════════════════════════════════
#   TITANE∞ Unified Launcher — Windows PowerShell
#   Usage: .\scripts\launch\unified-launcher.ps1 [-NoOllama] [-Dev]
#   Env: $env:TITANE_FB_APP_ID — Facebook App ID (optional)
# ═══════════════════════════════════════════════════════════════

param(
  [switch]$NoOllama,
  [switch]$Dev
)

$ErrorActionPreference = 'Stop'

function Log   { param($Msg) Write-Host "[TITANE Launcher] $Msg" -ForegroundColor Cyan }
function Warn  { param($Msg) Write-Host "[TITANE Launcher] ⚠  $Msg" -ForegroundColor Yellow }
function Die   { param($Msg) Write-Host "[TITANE Launcher] ✗  $Msg" -ForegroundColor Red; exit 1 }

# ─── Step 1: Detect OS ─────────────────────────────────────────
Log "Platform: Windows ($([System.Environment]::OSVersion.VersionString))"

# ─── Step 2: Check Ollama ──────────────────────────────────────
$OllamaOk = $false
if (-not $NoOllama) {
  try {
    $resp = Invoke-RestMethod -Uri 'http://127.0.0.1:11434/api/tags' -TimeoutSec 3 -ErrorAction Stop
    Log "Ollama: reachable ✓"
    $OllamaOk = $true
  } catch {
    Warn "Ollama not reachable — attempting to start..."
    $ollamaExe = Get-Command ollama -ErrorAction SilentlyContinue
    if ($ollamaExe) {
      Start-Process -FilePath $ollamaExe.Source -ArgumentList 'serve' -WindowStyle Hidden -PassThru | Out-Null
      Start-Sleep -Seconds 3
      try {
        Invoke-RestMethod -Uri 'http://127.0.0.1:11434/api/tags' -TimeoutSec 3 | Out-Null
        Log "Ollama: started ✓"
        $OllamaOk = $true
      } catch {
        Warn "Ollama still unreachable — continuing in degraded mode"
      }
    } else {
      Warn "Ollama not installed — continuing in degraded mode"
    }
  }
}

# ─── Step 3: Facebook App ID info ──────────────────────────────
if ($env:TITANE_FB_APP_ID) {
  Log "Facebook OAuth: TITANE_FB_APP_ID is set ($($env:TITANE_FB_APP_ID.Length) chars)"
} else {
  Warn "Facebook OAuth: TITANE_FB_APP_ID not set — Facebook login will be unavailable"
}

# ─── Step 4: Launch TITANE∞ ────────────────────────────────────
$RepoRoot = (Get-Item (Join-Path $PSScriptRoot "..\..")).FullName

if ($Dev) {
  Log "Starting in DEV mode (pnpm tauri dev)..."
  Set-Location $RepoRoot
  & corepack pnpm run dev:tauri
} else {
  # Find MSI-installed binary or bundle output
  $InstalledExe = "C:\Program Files\TITANE\titane-infinity.exe"
  $BundleDir    = Join-Path $RepoRoot "src-tauri\target\release\bundle\msi"
  $MsiFiles     = Get-ChildItem -Path $BundleDir -Filter "*.msi" -ErrorAction SilentlyContinue |
                  Sort-Object LastWriteTime -Descending

  $NsisDir  = Join-Path $RepoRoot "src-tauri\target\release\bundle\nsis"
  $ExeFiles = Get-ChildItem -Path $NsisDir -Filter "*Setup*.exe" -ErrorAction SilentlyContinue |
              Sort-Object LastWriteTime -Descending

  $DirectExe = Join-Path $RepoRoot "src-tauri\target\release\titane-infinity.exe"

  if (Test-Path $InstalledExe) {
    Log "Launching installed: $InstalledExe"
    Start-Process -FilePath $InstalledExe -Environment @{ TITANE_FB_APP_ID = $env:TITANE_FB_APP_ID }
  } elseif (Test-Path $DirectExe) {
    Log "Launching build output: $DirectExe"
    $env:TITANE_FB_APP_ID = $env:TITANE_FB_APP_ID
    & $DirectExe
  } else {
    Die "TITANE∞ binary not found. Build with 'pnpm tauri build' first or use -Dev flag."
  }
}
