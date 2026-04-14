# TITANE∞ — Windows Ollama Launcher & Model Installer
# Usage: .\launch-ollama.ps1 [install|serve|pull|status]

param(
    [ValidateSet('install', 'serve', 'pull', 'status')]
    [string]$Action = 'install'
)

$ErrorActionPreference = 'Stop'
$OLLAMA_URL = "http://localhost:11434"
$MODELS = @('qwen2.5:latest', 'llama3.1:8b', 'mistral:7b')

function Assert-Tool {
    param([string]$Tool, [string]$HintUrl = '')
    if (-not (Get-Command $Tool -ErrorAction SilentlyContinue)) {
        Write-Host "[ERROR] '$Tool' introuvable." -ForegroundColor Red
        if ($HintUrl) { Write-Host "        Installez-le depuis : $HintUrl" -ForegroundColor Yellow }
        exit 1
    }
}

function Install-Ollama {
    Write-Host "[INFO] Installation d'Ollama pour Windows..." -ForegroundColor Cyan
    $ollamaUrl = "https://ollama.com/download/OllamaSetup.exe"
    $installer = "$env:TEMP\OllamaSetup.exe"
    Invoke-WebRequest -Uri $ollamaUrl -OutFile $installer
    Start-Process -FilePath $installer -Wait
    Remove-Item $installer
    Write-Host "[OK] Ollama installé. Relancez ce script si besoin."
}

function Start-Ollama {
    Write-Host "[INFO] Démarrage du service Ollama..." -ForegroundColor Cyan
    Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden
    Start-Sleep -Seconds 5
}

function Wait-Ollama {
    $maxTries = 10
    for ($i=0; $i -lt $maxTries; $i++) {
        try {
            Invoke-RestMethod "$OLLAMA_URL/api/version" -TimeoutSec 2 | Out-Null
            return
        } catch {
            Start-Sleep -Seconds 2
        }
    }
    Write-Host "[ERROR] Ollama ne répond pas sur $OLLAMA_URL" -ForegroundColor Red
    exit 1
}

function Pull-Models {
    foreach ($model in $MODELS) {
        Write-Host "[INFO] Téléchargement modèle: $model" -ForegroundColor Cyan
        & ollama pull $model
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] Échec téléchargement $model" -ForegroundColor Red
            exit 1
        }
    }
    Write-Host "[OK] Tous les modèles sont installés." -ForegroundColor Green
    & ollama list
}

function Status-Ollama {
    try {
        $tags = Invoke-RestMethod "$OLLAMA_URL/api/tags"
        Write-Host "[OK] Ollama actif. Modèles installés :" -ForegroundColor Green
        $tags.models | ForEach-Object { Write-Host $_.name }
    } catch {
        Write-Host "[ERROR] Ollama non actif ou inaccessible." -ForegroundColor Red
    }
}

Assert-Tool 'curl' 'https://curl.se/windows/'
Assert-Tool 'ollama' 'https://ollama.com/download'

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
