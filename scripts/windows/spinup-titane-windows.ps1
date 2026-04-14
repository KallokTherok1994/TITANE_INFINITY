# TITANE_INFINITY — SPINUP Windows (installation complète)
# Usage : Exécuter en tant qu’administrateur

Write-Host "=== TITANE_INFINITY — Installation complète Windows ===" -ForegroundColor Cyan

# 1. Dépendances système
Write-Host "→ Vérification Node.js, pnpm, Rust, Git, VS Build Tools..." -ForegroundColor Yellow
# (ajoutez ici les vérifications et installations automatiques si besoin)

# 2. Clonage du projet (si besoin)
# git clone https://github.com/KallokTherok1994/TITANE_INFINITY.git

# 3. Installation JS
Write-Host "→ Installation des dépendances JS..." -ForegroundColor Yellow
corepack enable
corepack prepare pnpm@latest --activate
pnpm install

# 4. Copie .env
if (!(Test-Path .env) -and (Test-Path .env.example)) {
    Copy-Item .env.example .env
    Write-Host "[WARN] .env créé depuis .env.example. Renseignez vos clés API." -ForegroundColor Yellow
}

# 5. Génération config Tauri
pnpm run gen:tauri-config

# 6. Installation et activation Ollama + modèles
Write-Host "→ Installation Ollama + modèles..." -ForegroundColor Yellow
cd scripts/launch
./launch-ollama.ps1 install
cd ../..

# 7. Build production (optionnel)
# pnpm run build:production

Write-Host "=== Installation TITANE_INFINITY terminée ===" -ForegroundColor Green
Write-Host "Lancez TITANE avec : scripts/launch/launch-titane.ps1" -ForegroundColor Cyan
