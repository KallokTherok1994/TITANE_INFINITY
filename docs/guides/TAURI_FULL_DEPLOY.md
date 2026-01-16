# 🚀 Guide: Déploiement Complet Tauri Local

**Script:** `scripts/deployment/tauri-full-deploy.sh`  
**Version:** 26.2.0  
**Type:** Pipeline de déploiement (document historique; exécution soumise à gouvernance)

> NOTE (gouvernance): ce guide décrit une chaîne de build/package. Les builds/bundles production sont interdits
> sans autorisation explicite. Runtime actuel: v26.3.0. Production: EN ATTENTE (autorisation requise).

---

## 📋 DESCRIPTION

Script de déploiement complet pour TITANE∞ en mode Tauri local. Pipeline automatisé en 10 étapes couvrant:
- Vérification environnement
- Nettoyage (optionnel)
- Installation dépendances
- Lint & type check
- Tests (optionnel)
- Audit sécurité (optionnel)
- Build frontend (Vite)
- Build & package Tauri
- Déploiement local (optionnel)
- Vérification finale

---

## 🎯 UTILISATION

### Déploiement Standard

```bash
# Déploiement complet (mode stable, OS actuel)
./scripts/deployment/tauri-full-deploy.sh

# Résultat:
# - Linux:   runtime/stable/*.AppImage
# - macOS:   runtime/stable/*.app
# - Windows: runtime/stable/*.exe
```

### Options Avancées

```bash
# Mode production
./scripts/deployment/tauri-full-deploy.sh --mode production

# Mode dev (plus rapide)
./scripts/deployment/tauri-full-deploy.sh --mode dev

# Sauter les tests (pour builds rapides)
./scripts/deployment/tauri-full-deploy.sh --skip-tests

# Sauter le nettoyage (rebuild incrémental)
./scripts/deployment/tauri-full-deploy.sh --skip-clean

# Installation deps uniquement
./scripts/deployment/tauri-full-deploy.sh --install-only

# Build sans packaging
./scripts/deployment/tauri-full-deploy.sh --build-only

# Déployer vers un dossier custom
./scripts/deployment/tauri-full-deploy.sh --deploy-local ~/Applications/

# Simulation (dry-run)
./scripts/deployment/tauri-full-deploy.sh --dry-run --verbose
```

### Combinaisons Pratiques

```bash
# Build rapide pour dev
./scripts/deployment/tauri-full-deploy.sh --mode dev --skip-tests --skip-audit

# Build complet pour production
./scripts/deployment/tauri-full-deploy.sh --mode production --deploy-local ~/Apps/

# Debug avec logs verbeux
./scripts/deployment/tauri-full-deploy.sh --verbose --skip-tests
```

---

## 🔧 OPTIONS COMPLÈTES

| Option | Valeur | Description |
|--------|--------|-------------|
| `--target` | linux\|windows\|macos\|all | Plateforme cible (default: current) |
| `--mode` | dev\|stable\|production | Mode de build (default: stable) |
| `--skip-clean` | - | Ne pas nettoyer avant build |
| `--skip-tests` | - | Sauter les tests |
| `--skip-audit` | - | Sauter les audits sécurité |
| `--install-only` | - | Installer deps et arrêter |
| `--build-only` | - | Build sans packaging |
| `--deploy-local` | PATH | Déployer vers PATH local |
| `--dry-run` | - | Mode simulation |
| `--verbose` | - | Logs détaillés |
| `--help` | - | Afficher l'aide |

---

## 📊 PIPELINE DÉTAILLÉ (10 ÉTAPES)

### STEP 1: Environment Check (30 sec)
- ✓ Vérification Node.js ≥20.0.0
- ✓ Vérification Rust ≥1.70
- ✓ Détection package manager (pnpm/npm)
- ✓ Vérification Tauri CLI
- ✓ Vérification espace disque
- ✓ Affichage configuration

### STEP 2: Clean (1 min)
- ✓ Suppression dist/
- ✓ Suppression build/
- ✓ Suppression src-tauri/target/
- ✓ Suppression caches Vite
- ✓ Suppression artefacts précédents

**Skip:** `--skip-clean`

### STEP 3: Install Dependencies (5 min)
- ✓ Installation dépendances Node (pnpm install)
- ✓ Fetch dépendances Rust (cargo fetch)
- ✓ Vérification/création .env

**Stop après:** `--install-only`

### STEP 4: Lint & Type Check (2 min)
- ✓ ESLint check
- ✓ TypeScript check
- ✓ Prettier check

### STEP 5: Tests (5-10 min)
- ✓ Tests frontend (Vitest)
- ✓ Tests architecture
- ✓ Tests compliance
- ✓ Tests Rust (cargo test)

**Skip:** `--skip-tests`

### STEP 6: Security Audit (2 min)
- ✓ pnpm audit (niveau high)
- ✓ cargo audit

**Skip:** `--skip-audit`

### STEP 7: Build Frontend (3 min)
- ✓ Compilation Vite (production)
- ✓ Vérification dist/index.html
- ✓ Affichage taille bundle

### STEP 8: Build & Package Tauri (15-20 min)
- ✓ Sélection config (dev/stable/production)
- ✓ Compilation Rust + bundling Tauri
- ✓ Copie artefacts vers runtime/

**Artefacts générés:**
- **Linux:** AppImage + .deb (optionnel)
- **macOS:** .app + .dmg (optionnel)
- **Windows:** .exe (NSIS) + .msi (optionnel)

**Stop après:** `--build-only`

### STEP 9: Deploy Local (1 min)
- ✓ Création dossier destination
- ✓ Copie artefacts vers PATH custom

**Activation:** `--deploy-local PATH`

### STEP 10: Verification (30 sec)
- ✓ Comptage artefacts
- ✓ Affichage tailles fichiers
- ✓ Résumé déploiement

---

## ⏱️ TEMPS D'EXÉCUTION

### Mode Complet (Toutes options)
- **Clean + Install + Lint + Tests + Audit + Build:** ~40-50 minutes
- **Première fois:** +5 min (téléchargement deps Rust)

### Mode Rapide (Skip tests/audit)
```bash
./scripts/deployment/tauri-full-deploy.sh --skip-tests --skip-audit
```
- **Clean + Install + Lint + Build:** ~25-30 minutes

### Mode Ultra-Rapide (Dev, skip clean/tests/audit)
```bash
./scripts/deployment/tauri-full-deploy.sh --mode dev --skip-clean --skip-tests --skip-audit
```
- **Build incrémental:** ~10-15 minutes

### Mode Deps Seulement
```bash
./scripts/deployment/tauri-full-deploy.sh --install-only
```
- **Install deps:** ~5 minutes

---

## 📁 STRUCTURE OUTPUTS

### Mode Stable (default)
```
runtime/stable/
├── TITANE-Infinity_26.2.0_amd64.AppImage  (Linux)
├── TITANE-Infinity_26.2.0_amd64.deb       (Linux, optionnel)
├── TITANE-Infinity.app/                   (macOS)
├── TITANE-Infinity_26.2.0_x64.dmg         (macOS, optionnel)
├── TITANE-Infinity_26.2.0_x64-setup.exe   (Windows)
└── TITANE-Infinity_26.2.0_x64_en-US.msi   (Windows, optionnel)
```

### Mode Dev
```
runtime/dev/
└── [Mêmes artefacts avec config dev]
```

### Déploiement Local Custom
```
~/Applications/  (ou autre PATH)
└── [Artefacts copiés depuis runtime/stable ou dev]
```

---

## 🔍 LOGS & DEBUGGING

### Logs Automatiques
```bash
# Logs sauvegardés dans:
logs/deployment/tauri-full-deploy-YYYYMMDD_HHMMSS.log

# Voir logs en temps réel (autre terminal):
tail -f logs/deployment/tauri-full-deploy-*.log
```

### Mode Verbose
```bash
./scripts/deployment/tauri-full-deploy.sh --verbose
# Affiche chaque commande exécutée
```

### Dry-Run (Simulation)
```bash
./scripts/deployment/tauri-full-deploy.sh --dry-run --verbose
# Aucun changement, affiche ce qui serait fait
```

---

## ✅ PRÉREQUIS

### Système
- **Node.js:** ≥20.0.0
- **Rust:** ≥1.70
- **Package manager:** pnpm (recommandé) ou npm
- **Espace disque:** ≥5 GB disponible

### Linux Supplémentaire
```bash
sudo apt install -y \
  libwebkit2gtk-4.0-dev \
  build-essential \
  curl \
  wget \
  libssl-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

### macOS Supplémentaire
```bash
xcode-select --install
```

### Windows Supplémentaire
- Visual Studio Build Tools 2019+
- WebView2 Runtime

---

## 🚨 DÉPANNAGE

### "Node.js too old"
```bash
# Installer Node 20+
nvm install 20
nvm use 20
```

### "Rust not found"
```bash
# Installer Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup update stable
```

### "pnpm not found"
```bash
# Installer pnpm
pnpm install -g pnpm@9.0.0
# OU
corepack enable
```

### Build Tauri échoue
```bash
# Nettoyer complètement et rebuild
./scripts/deployment/tauri-full-deploy.sh --mode dev
# Vérifier logs:
tail -f logs/deployment/tauri-full-deploy-*.log
```

### Port 5173 occupé
```bash
# Tuer processus sur port 5173
lsof -ti :5173 | xargs kill -9
```

---

## 📚 RÉFÉRENCES

### Scripts Connexes
- `scripts/deployment/deploy-fix-complete.sh` — Correction problèmes déploiement
- `titane.sh` — Script principal TITANE
- `scripts/maintenance/auto-heal.sh` — Auto-réparation

### Documentation
- `AUDIT_DEPLOYMENT_DIAGNOSTIC_v26.2.0_COMPLET.md` — Diagnostic déploiement
- `PLAN_ACTION_DEPLOYEMENT_v26.2.0.md` — Plan d'action
- `DEMARRAGE_RAPIDE.md` — Quick start
- `DEVELOPMENT_SETUP.md` — Setup développement

---

## 🎯 USE CASES

### Développeur Local
```bash
# Build dev rapide pour tester
./scripts/deployment/tauri-full-deploy.sh \
  --mode dev \
  --skip-tests \
  --skip-audit
```

### CI/CD Production
```bash
# Build complet avec tous les checks
./scripts/deployment/tauri-full-deploy.sh \
  --mode production
```

### Release Candidate
```bash
# Build stable avec déploiement
./scripts/deployment/tauri-full-deploy.sh \
  --mode stable \
  --deploy-local ~/Releases/TITANE-v26.2.0/
```

### Debug Build Issues
```bash
# Build avec logs verbeux
./scripts/deployment/tauri-full-deploy.sh \
  --verbose \
  --skip-tests
```

---

## ⚙️ CONFIGURATION

### Variables Environnement (.env)
```bash
# Créé automatiquement si absent
TITANE_SECRETS_PASSPHRASE=<auto-généré>
TITANE_DATA_PATH=./data
TITANE_MEMORY_PATH=./data/memory
TITANE_LOGS_PATH=./logs
RUST_LOG=info
RUST_BACKTRACE=0
```

### Configs Tauri
- **Dev:** `runtime/dev/tauri.dev.conf.json`
- **Stable:** `runtime/stable/tauri.stable.conf.json`
- **Production:** `runtime/stable/tauri.stable.conf.json` (avec devtools=false)

---

## 📊 MÉTRIQUES

### Tailles Approximatives
- **AppImage (Linux):** ~150-200 MB
- **.app (macOS):** ~180-250 MB
- **.exe (Windows):** ~140-190 MB

### Performance Build
- **Clean build:** 40-50 min
- **Incremental build:** 10-15 min
- **Install deps:** 5 min
- **Frontend build:** 3 min
- **Tauri package:** 15-20 min

---

**Guide Créé:** 2025-12-24  
**Version:** 1.0.0  
**Script:** `scripts/deployment/tauri-full-deploy.sh`  
**Compatibilité:** Linux, macOS, Windows

© 2025 TITANE Team. All rights reserved.
