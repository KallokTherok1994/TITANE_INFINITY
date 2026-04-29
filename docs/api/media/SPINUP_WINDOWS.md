# TITANE∞ — Windows Spin-Up Procedure

> Version: 30.1.5 · Runtime: Tauri 2 · Node: 24 · pnpm engine-strict

---

## Prérequis système

| Composant | Version minimale | Commande de vérification |
|-----------|-----------------|--------------------------|
| Windows | 10 (21H2) / 11 | `winver` |
| Node.js | 24.x LTS | `node --version` |
| pnpm | 9.x | `pnpm --version` |
| Rust + Cargo | stable (1.77+) | `rustup show` |
| Git | 2.40+ | `git --version` |
| Visual Studio Build Tools | 2019 / 2022 | `msbuild --version` |
| WebView2 Runtime | dernière version stable | Inclus Windows 11 / télécharger sinon |
| Ollama *(optionnel)* | 0.3+ | `ollama --version` |

---

## Étape 1 — Installer les dépendances système

### 1.1 Installer Node.js 24 via nvm-windows

```powershell
# Télécharger nvm-windows depuis https://github.com/coreybutler/nvm-windows
nvm install 24
nvm use 24
node --version  # doit afficher v24.x
```

### 1.2 Activer pnpm via Corepack

```powershell
corepack enable
corepack prepare pnpm@latest --activate
pnpm --version
```

### 1.3 Installer Rust

```powershell
# Télécharger et exécuter depuis https://rustup.rs
rustup default stable
rustup update
rustup target add x86_64-pc-windows-msvc
```

### 1.4 Installer Visual Studio Build Tools

Télécharger **Visual Studio Build Tools 2022** depuis :
<https://visualstudio.microsoft.com/visual-cpp-build-tools/>

Sélectionner les composants :
- **C++ build tools** (workload complet)
- **Windows 10/11 SDK**
- **MSVC v143 toolchain**

### 1.5 Vérifier WebView2 Runtime

WebView2 est inclus nativement sous Windows 11. Sous Windows 10 :

```powershell
# Vérifier la présence
reg query "HKLM\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}" /v pv 2>$null
# Si absent, télécharger depuis :
# https://developer.microsoft.com/microsoft-edge/webview2/
```

---

## Étape 2 — Cloner et préparer le projet

```powershell
git clone https://github.com/KallokTherok1994/TITANE_INFINITY.git
cd TITANE_INFINITY

# Vérifier la version Node imposée par le projet
Get-Content .nvmrc   # doit indiquer 24

# Installer les dépendances JS
pnpm install
```

---

## Étape 3 — Configurer les variables d'environnement

```powershell
# Copier l'exemple de configuration
Copy-Item .env.example .env

# Éditer .env avec les clés API requises
notepad .env
```

Variables clés à renseigner :

| Variable | Description |
|----------|-------------|
| `VITE_GEMINI_API_KEY` | Clé API Google Gemini |
| `VITE_OPENAI_API_KEY` | Clé API OpenAI |
| `VITE_ANTHROPIC_API_KEY` | Clé API Anthropic (Claude) |
| `TITANE_ENV` | `development` ou `production` |

---

## Étape 4 — Générer la configuration Tauri

```powershell
pnpm run gen:tauri-config
```

---

## Étape 5 — Démarrer en mode développement

### Option A — Script PowerShell (recommandé)

```powershell
.\scripts\launch\launch-titane.ps1
```

### Option B — Script batch

```batch
scripts\launch\launch-titane.bat
```

### Option C — Commande pnpm directe

```powershell
pnpm run dev:tauri
```

---


## Étape 6 — Installation et activation automatique d’Ollama (IA locale)

> **NOUVEAU** : L’installation d’Ollama et des modèles nécessaires est désormais automatisée pour Windows.

```powershell
# 1. Lancer le script d’installation Ollama + modèles (admin recommandé)
cd scripts\launch
./launch-ollama.ps1 install

# 2. Vérifier le statut Ollama et la présence des modèles
./launch-ollama.ps1 status
```

Ce script :
- Installe Ollama (si absent)
- Démarre le service Ollama
- Télécharge tous les modèles nécessaires à TITANE∞
- Vérifie la disponibilité de l’API et des modèles

> **Remarque** : Pour démarrer Ollama manuellement :
```powershell
./launch-ollama.ps1 serve
```

Pour installer ou mettre à jour uniquement les modèles :
```powershell
./launch-ollama.ps1 pull
```

---

---

## Étape 7 — Build production Windows

```powershell
# Bumper la version patch avant tout build distributable
pnpm run bump:version
pnpm run sync:versions

# Build Tauri (génère un installateur .msi / .exe dans src-tauri/target/release/bundle/)
pnpm run build:production
```

L'artefact final se trouve dans :

```
src-tauri\target\release\bundle\msi\titane-infinity_*.msi
src-tauri\target\release\bundle\nsis\titane-infinity_*.exe
```

---

## Rollback / Réinitialisation

```powershell
# Nettoyer les artefacts de build
pnpm run clean:all

# Réinstaller toutes les dépendances
pnpm install

# Reconstruire le cache Vite uniquement
pnpm run clean:vite
```

---

## Vérifications de santé

```powershell
# TypeScript — aucune erreur de type
pnpm run check

# Lint
pnpm run lint

# Tests unitaires + Rust
pnpm run test:all

# Vérifications d'invariants (Tauri-only, online-first, etc.)
pnpm run verify
```

---

## Ports utilisés en développement

| Port | Service |
|------|---------|
| 1420 | Vite dev server (frontend) |
| 11434 | Ollama API (local LLM) |

---

## Dépannage courant Windows

| Symptôme | Cause probable | Solution |
|----------|---------------|----------|
| `error: linker 'link.exe' not found` | Build Tools MSVC absent | Installer VS Build Tools 2022 |
| `WebView2 not found` | WebView2 absent | Installer depuis microsoft.com |
| `pnpm: command not found` | Corepack non activé | `corepack enable` |
| `EPERM` lors de `pnpm install` | Droits insuffisants | Ouvrir terminal en administrateur |
| Port 1420 occupé | Autre processus | `netstat -ano \| findstr 1420` puis `taskkill /PID <id>` |
| Ollama non accessible | Service arrêté | `ollama serve` dans un terminal séparé |
