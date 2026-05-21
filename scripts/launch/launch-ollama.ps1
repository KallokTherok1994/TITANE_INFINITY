# TITANE∞ — Windows Ollama Launcher & Model Installer
# Usage: .\launch-ollama.ps1 [install|serve|pull|status]

param(
    [ValidateSet('install', 'serve', 'pull', 'status')]
    [string]$Action = 'install'
)

$ErrorActionPreference = 'Stop'
$ROOT = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$windowsEnv = Join-Path $ROOT 'scripts\windows\TitaneWindowsEnv.ps1'
if (Test-Path -LiteralPath $windowsEnv) {
    . $windowsEnv
}

$OLLAMA_URL = "http://127.0.0.1:11434"
$MODELS = @('gemma2:2b', 'qwen3.5:9b', 'nomic-embed-text')

function Assert-Tool {
    param([string]$Tool, [string]$HintUrl = '')
    if (-not (Get-Command $Tool -ErrorAction SilentlyContinue)) {
        Write-Host "[ERROR] '$Tool' introuvable." -ForegroundColor Red
        if ($HintUrl) { Write-Host "        Installez-le depuis : $HintUrl" -ForegroundColor Yellow }
        exit 1
    }
}

function Install-Ollama {
    if (Get-Command 'ollama' -ErrorAction SilentlyContinue) {
        Write-Host "[OK] Ollama déjà installé." -ForegroundColor Green
        return
    }

    Write-Host "[INFO] Installation d'Ollama pour Windows..." -ForegroundColor Cyan
    if (Get-Command 'winget' -ErrorAction SilentlyContinue) {
        & winget install -e --id Ollama.Ollama --accept-package-agreements --accept-source-agreements
        if ($LASTEXITCODE -ne 0) {
            throw "winget install Ollama.Ollama a échoué (exit $LASTEXITCODE)"
        }
    } else {
        $ollamaUrl = "https://ollama.com/download/OllamaSetup.exe"
        $installer = Join-Path $env:TEMP 'OllamaSetup.exe'
        Invoke-WebRequest -Uri $ollamaUrl -OutFile $installer
        Start-Process -FilePath $installer -Wait
        Remove-Item $installer -Force
    }

    if (Test-Path -LiteralPath $windowsEnv) {
        . $windowsEnv
    }
    Assert-Tool 'ollama' 'https://ollama.com/download'
    Write-Host "[OK] Ollama installé." -ForegroundColor Green
}

function Start-Ollama {
    Assert-Tool 'ollama' 'https://ollama.com/download'
    Write-Host "[INFO] Démarrage du service Ollama..." -ForegroundColor Cyan
    try {
        Invoke-RestMethod "$OLLAMA_URL/api/version" -TimeoutSec 2 | Out-Null
        Write-Host "[OK] Ollama répond déjà sur $OLLAMA_URL" -ForegroundColor Green
        return
    } catch {
        # Start hidden below.
    }
    Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden
    Start-Sleep -Seconds 5
}

function Wait-Ollama {
    $maxTries = 30  # 30 × 2s = 60s
    Write-Host "[INFO] Attente démarrage Ollama (max 60s)..." -ForegroundColor Cyan
    for ($i=0; $i -lt $maxTries; $i++) {
        try {
            Invoke-RestMethod "$OLLAMA_URL/api/version" -TimeoutSec 2 | Out-Null
            Write-Host "[OK] Ollama actif." -ForegroundColor Green
            return
        } catch {
            Write-Host "[INFO] Tentative $($i+1)/$maxTries..." -ForegroundColor DarkGray
            Start-Sleep -Seconds 2
        }
    }
    Write-Host "[ERROR] Ollama ne répond pas sur $OLLAMA_URL après $maxTries essais." -ForegroundColor Red
    exit 1
}

function Pull-Models {
    Assert-Tool 'ollama' 'https://ollama.com/download'

    # Vérifier espace disque : ~7 GB requis pour les modèles par défaut
    try {
        $freeGB = [math]::Round((Get-PSDrive C -ErrorAction SilentlyContinue).Free / 1GB, 1)
        if ($freeGB -lt 7) {
            Write-Host "[ERROR] Espace disque insuffisant : ${freeGB} GB disponibles, 7 GB requis." -ForegroundColor Red
            Write-Host "        Libérez de l'espace puis relancez." -ForegroundColor Yellow
            exit 1
        }
        Write-Host "[OK] Espace disque : ${freeGB} GB disponibles." -ForegroundColor Green
    } catch {
        Write-Host "[WARN] Impossible de vérifier l'espace disque — on continue." -ForegroundColor Yellow
    }

    $failed = @()
    foreach ($model in $MODELS) {
        Write-Host "[INFO] Téléchargement modèle: $model" -ForegroundColor Cyan
        & ollama pull $model
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[WARN] Échec téléchargement $model — on continue avec les autres." -ForegroundColor Yellow
            $failed += $model
        } else {
            Write-Host "[OK] $model installé." -ForegroundColor Green
        }
    }
    if ($failed.Count -gt 0) {
        Write-Host "[WARN] Modèles non installés : $($failed -join ', ')" -ForegroundColor Yellow
        Write-Host "       Relancez : .\launch-ollama.ps1 pull" -ForegroundColor Yellow
    } else {
        Write-Host "[OK] Tous les modèles sont installés." -ForegroundColor Green
    }
    & ollama list
}

function Status-Ollama {
    Assert-Tool 'ollama' 'https://ollama.com/download'
    try {
        $tags = Invoke-RestMethod "$OLLAMA_URL/api/tags"
        Write-Host "[OK] Ollama actif. Modèles installés :" -ForegroundColor Green
        $tags.models | ForEach-Object { Write-Host $_.name }
    } catch {
        Write-Host "[ERROR] Ollama non actif ou inaccessible." -ForegroundColor Red
    }
}

switch ($Action) {
    'install' {
        Install-Ollama
        Start-Ollama
        Wait-Ollama
        Pull-Models
    }
    'serve' {
        Start-Ollama
        Wait-Ollama
    }
    'pull' {
        Wait-Ollama
        Pull-Models
    }
    'status' {
        Status-Ollama
    }
    default {
        Write-Host "Action inconnue. Utilisez install|serve|pull|status."
        exit 1
    }
}
