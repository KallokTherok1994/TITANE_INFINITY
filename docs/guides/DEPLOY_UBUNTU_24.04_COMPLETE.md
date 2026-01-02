# 🚀 Déploiement TITANE∞ sur Ubuntu 24.04 LTS — Guide Complet

**Plateforme:** Ubuntu 24.04 LTS (Noble Numbat)  
**Type:** Guide de déploiement complet du développement à la production  
**Durée:** 60-90 minutes (installation incluse)

---

## 📋 VUE D'ENSEMBLE

Ce guide couvre l'installation complète et le déploiement de TITANE∞ sur une machine Ubuntu 24.04 LTS fraîche, de zéro à l'application packagée en AppImage.

---

## ⚡ DÉMARRAGE RAPIDE (Installation Système)

### Étape 1: Prérequis Système Ubuntu

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer les dépendances système Tauri v2
sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libssl-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  libjavascriptcoregtk-4.1-dev \
  libsoup-3.0-dev \
  libasound2-dev

# Installer Git (si pas déjà installé)
sudo apt install -y git
```

**Temps:** ~5 minutes

### Étape 2: Installer Rust

```bash
# Installer Rust via rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Choisir: 1) Proceed with installation (default)
# Puis charger l'environnement:
source "$HOME/.cargo/env"

# Vérifier l'installation
rustc --version  # Devrait afficher 1.70+
cargo --version
```

**Temps:** ~3 minutes

### Étape 3: Installer Node.js 20 LTS

```bash
# Installer Node.js 20 via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Vérifier l'installation
node --version   # Devrait afficher v20.x.x
npm --version

# Installer pnpm (recommandé)
sudo npm install -g pnpm@9.0.0
pnpm --version
```

**Temps:** ~3 minutes

### Étape 4: Cloner le Repository

```bash
# Créer un dossier de travail
mkdir -p ~/Projects
cd ~/Projects

# Cloner TITANE∞
git clone https://github.com/KallokTherok1994/TITANE_INFINITY.git
cd TITANE_INFINITY

# Vérifier la branche
git branch --show-current
```

**Temps:** ~2 minutes

---

## 🔧 DÉPLOIEMENT AUTOMATISÉ

Une fois les prérequis installés, utilisez les scripts de déploiement automatisés.

### Option A: Correction Problèmes + Build (Recommandé pour première fois)

```bash
# Se placer dans le projet
cd ~/Projects/TITANE_INFINITY

# Exécuter le script de correction automatique
./scripts/deployment/deploy-fix-complete.sh

# Durée: ~45 minutes
# Ce script:
# - Installe toutes les dépendances (pnpm install)
# - Crée le fichier .env avec passphrase
# - Rend tous les scripts exécutables
# - Build le frontend (Vite)
# - Build le backend Rust (Tauri dev)
# - Valide la configuration
```

**Résultat:** Système 100% opérationnel, prêt pour `npm run dev`

### Option B: Déploiement Complet (AppImage Production)

```bash
# Se placer dans le projet
cd ~/Projects/TITANE_INFINITY

# Déploiement complet avec packaging AppImage
./scripts/deployment/tauri-full-deploy.sh --mode stable

# Durée: ~40-50 minutes
# Ce script exécute:
# - 10 étapes complètes (voir détails ci-dessous)
# - Génère l'AppImage dans runtime/stable/
```

**Résultat:** `runtime/stable/TITANE-Infinity_26.2.0_amd64.AppImage`

### Option C: Build Rapide Développement

```bash
# Build dev rapide sans tests/audit
./scripts/deployment/tauri-full-deploy.sh \
  --mode dev \
  --skip-tests \
  --skip-audit

# Durée: ~25-30 minutes
```

---

## 📦 DÉTAILS PIPELINE COMPLET (Option B)

### Les 10 Étapes du Déploiement

#### 1. Environment Check (30 sec)
- ✓ Vérification Node.js ≥20.0.0
- ✓ Vérification Rust ≥1.70
- ✓ Détection pnpm/npm
- ✓ Vérification Tauri CLI
- ✓ Vérification espace disque (≥5 GB requis)

#### 2. Clean (1 min)
- ✓ Suppression dist/
- ✓ Suppression node_modules/.cache/
- ✓ Suppression src-tauri/target/
- ✓ Suppression anciens AppImages

#### 3. Install Dependencies (5 min)
- ✓ `pnpm install --frozen-lockfile`
- ✓ `cargo fetch` (dépendances Rust)
- ✓ Création .env si absent

#### 4. Lint & Type Check (2 min)
- ✓ ESLint check
- ✓ TypeScript check
- ✓ Prettier check

#### 5. Tests (5-10 min)
- ✓ Tests frontend (Vitest)
- ✓ Tests architecture (4-Ring model)
- ✓ Tests compliance (Tauri-only, local-first)
- ✓ Tests Rust (cargo test)

#### 6. Security Audit (2 min)
- ✓ npm audit (niveau high)
- ✓ cargo audit

#### 7. Build Frontend (3 min)
- ✓ Compilation Vite (mode production)
- ✓ Génération dist/ (~15-25 MB)

#### 8. Build & Package Tauri (15-20 min)
- ✓ Compilation Rust (release mode)
- ✓ Bundling Tauri
- ✓ Génération AppImage (~150-200 MB)
- ✓ Génération .deb (optionnel)

#### 9. Deploy Local (optionnel)
- ✓ Copie vers dossier custom

#### 10. Verification (30 sec)
- ✓ Vérification présence AppImage
- ✓ Affichage taille fichiers

---

## 🎯 UTILISATION DES SCRIPTS

### Script 1: deploy-fix-complete.sh

**Usage:**
```bash
# Complet (toutes les 5 phases)
./scripts/deployment/deploy-fix-complete.sh

# Phase spécifique
./scripts/deployment/deploy-fix-complete.sh --phase 2

# Simulation (dry-run)
./scripts/deployment/deploy-fix-complete.sh --dry-run

# Logs verbeux
./scripts/deployment/deploy-fix-complete.sh --verbose
```

**Phases:**
1. Déblocage immédiat (15 min)
2. Build frontend (5 min)
3. Build backend Rust (10 min)
4. Validation complète (10 min)
5. Sécurisation production (5 min)

### Script 2: tauri-full-deploy.sh

**Usage:**
```bash
# Standard (stable)
./scripts/deployment/tauri-full-deploy.sh

# Mode dev (rapide)
./scripts/deployment/tauri-full-deploy.sh --mode dev

# Sans tests (plus rapide)
./scripts/deployment/tauri-full-deploy.sh --skip-tests

# Production avec déploiement custom
./scripts/deployment/tauri-full-deploy.sh \
  --mode production \
  --deploy-local ~/Applications/

# Aide complète
./scripts/deployment/tauri-full-deploy.sh --help
```

**Options:**
- `--mode` : dev | stable | production
- `--skip-clean` : Ne pas nettoyer avant build
- `--skip-tests` : Sauter les tests
- `--skip-audit` : Sauter les audits sécurité
- `--deploy-local PATH` : Déployer vers PATH
- `--dry-run` : Simulation
- `--verbose` : Logs détaillés

---

## 📁 STRUCTURE FICHIERS UBUNTU

### Après Installation Système
```
~/.cargo/                       # Rust + cargo
~/.nvm/                         # Node Version Manager (optionnel)
~/.config/                      # Configs utilisateur
~/Projects/TITANE_INFINITY/     # Projet cloné
```

### Après Build Complet
```
~/Projects/TITANE_INFINITY/
├── node_modules/               # Dépendances Node (~500 MB)
├── dist/                       # Frontend compilé (~15-25 MB)
├── src-tauri/target/           # Rust artifacts (~2-3 GB)
├── runtime/stable/
│   ├── TITANE-Infinity_26.2.0_amd64.AppImage  (~150-200 MB)
│   └── TITANE-Infinity_26.2.0_amd64.deb       (~150-200 MB, optionnel)
└── logs/deployment/            # Logs déploiement
```

### Espace Disque Requis
- **Installation système:** ~1 GB
- **Dépendances projet:** ~3-4 GB
- **Build artifacts:** ~2-3 GB
- **Total recommandé:** ≥10 GB libres

---

## 🚀 INSTALLATION & LANCEMENT AppImage

### Installer l'AppImage

```bash
# Copier vers ~/Applications
mkdir -p ~/Applications
cp runtime/stable/TITANE-Infinity_*.AppImage ~/Applications/

# Rendre exécutable
chmod +x ~/Applications/TITANE-Infinity_*.AppImage

# Option 1: Lancer en double-cliquant dans le gestionnaire de fichiers
# Option 2: Lancer depuis le terminal
~/Applications/TITANE-Infinity_*.AppImage
```

### Intégration Bureau Ubuntu

```bash
# Copier le fichier .desktop
cp titane-infinity.desktop ~/.local/share/applications/

# Copier l'icône
mkdir -p ~/.local/share/icons
cp titane-app-icon.png ~/.local/share/icons/titane-infinity.png

# Mettre à jour la base de données des applications
update-desktop-database ~/.local/share/applications/

# L'application apparaît maintenant dans le menu Applications
```

### Lancer en Mode Dev (pour développement)

```bash
cd ~/Projects/TITANE_INFINITY
npm run dev

# L'application démarre en ~10 secondes
# Hot-reload activé pour le développement
```

---

## 🔍 VÉRIFICATION POST-INSTALLATION

### Vérifier les Versions

```bash
# Node.js
node --version      # ≥ v20.0.0 ✓

# Rust
rustc --version     # ≥ 1.70 ✓
cargo --version

# pnpm
pnpm --version      # 9.x ✓

# Tauri CLI (optionnel)
cargo tauri --version
```

### Vérifier l'AppImage

```bash
# Taille
ls -lh runtime/stable/TITANE-Infinity_*.AppImage

# Permissions
ls -l runtime/stable/TITANE-Infinity_*.AppImage  # Devrait montrer -rwxr-xr-x

# Test lancement (mode verbose)
RUST_LOG=debug runtime/stable/TITANE-Infinity_*.AppImage

# Vérifier processus en cours
ps aux | grep -i titane
```

### Vérifier Logs

```bash
# Logs déploiement
tail -f logs/deployment/tauri-full-deploy-*.log

# Logs application (en cours d'exécution)
tail -f ~/.local/share/TITANE-Infinity/logs/*.log
```

---

## 🚨 DÉPANNAGE UBUNTU-SPÉCIFIQUE

### Problème: "webkit2gtk not found"

```bash
# Réinstaller les dépendances Tauri
sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  libjavascriptcoregtk-4.1-dev \
  libsoup-3.0-dev
```

### Problème: "AppImage ne lance pas"

```bash
# Installer FUSE (requis pour AppImage)
sudo apt install -y libfuse2

# Rendre exécutable
chmod +x runtime/stable/TITANE-Infinity_*.AppImage

# Tester avec logs
./runtime/stable/TITANE-Infinity_*.AppImage --appimage-extract-and-run
```

### Problème: "cargo: command not found" après install Rust

```bash
# Recharger l'environnement
source "$HOME/.cargo/env"

# Ajouter à .bashrc pour permanence
echo 'source "$HOME/.cargo/env"' >> ~/.bashrc
```

### Problème: "Node version too old"

```bash
# Installer Node 20 via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Vérifier
node --version  # Devrait afficher v20.x.x
```

### Problème: "pnpm: command not found"

```bash
# Option 1: Via npm
sudo npm install -g pnpm@9.0.0

# Option 2: Via corepack
corepack enable
corepack prepare pnpm@9.0.0 --activate

# Vérifier
pnpm --version
```

### Problème: "Port 5173 already in use"

```bash
# Trouver le processus
lsof -i :5173

# Tuer le processus
kill -9 $(lsof -t -i:5173)
```

### Problème: Build Tauri échoue avec erreur Rust

```bash
# Nettoyer complètement le cache
cd ~/Projects/TITANE_INFINITY
rm -rf src-tauri/target/
cargo clean

# Mettre à jour Rust
rustup update stable

# Rebuild
./scripts/deployment/tauri-full-deploy.sh --skip-tests
```

---

## 📊 BENCHMARKS UBUNTU 24.04

### Machine Test: Ubuntu 24.04 LTS (4 cores, 8 GB RAM, SSD)

| Étape | Temps | Notes |
|-------|-------|-------|
| Installation système | 5 min | Dépendances apt |
| Installation Rust | 3 min | Via rustup |
| Installation Node 20 | 3 min | Via NodeSource |
| Clone repository | 2 min | ~200 MB |
| deploy-fix-complete.sh | 45 min | Première fois |
| tauri-full-deploy.sh (complet) | 42 min | Avec tests/audit |
| tauri-full-deploy.sh (rapide) | 27 min | Sans tests/audit |
| Build incrémental | 12 min | Après modifications |

**Total première installation:** ~60 minutes  
**Total builds suivants:** ~10-15 minutes

---

## 📚 RÉFÉRENCES

### Documentation TITANE
- `AUDIT_DEPLOYMENT_DIAGNOSTIC_v26.2.0_COMPLET.md` — Diagnostic complet
- `PLAN_ACTION_DEPLOYEMENT_v26.2.0.md` — Plan d'action
- `docs/guides/TAURI_FULL_DEPLOY.md` — Guide déploiement général
- `QUICKSTART_UBUNTU_24.04.md` — Setup initial Ubuntu

### Scripts
- `scripts/deployment/deploy-fix-complete.sh` — Correction + build
- `scripts/deployment/tauri-full-deploy.sh` — Pipeline complet
- `titane.sh` — Commandes principales TITANE

### Documentation Ubuntu
- [Ubuntu 24.04 LTS Release Notes](https://wiki.ubuntu.com/NobleNumbat/ReleaseNotes)
- [Tauri v2 Ubuntu Prerequisites](https://v2.tauri.app/start/prerequisites/)

---

## 🎯 CHECKLIST COMPLÈTE UBUNTU

### Avant de Commencer
- [ ] Ubuntu 24.04 LTS installé et à jour
- [ ] Connexion internet stable
- [ ] ≥10 GB d'espace disque libre
- [ ] Droits sudo disponibles

### Installation Système
- [ ] Dépendances apt Tauri installées
- [ ] Git installé
- [ ] Rust ≥1.70 installé et vérifié
- [ ] Node.js ≥20.0.0 installé et vérifié
- [ ] pnpm 9.x installé
- [ ] Repository cloné

### Déploiement
- [ ] Script deploy-fix-complete.sh exécuté (ou tauri-full-deploy.sh)
- [ ] Aucune erreur dans logs/deployment/
- [ ] AppImage généré dans runtime/stable/
- [ ] AppImage exécutable (chmod +x)

### Vérification
- [ ] `npm run dev` démarre l'app en < 10s
- [ ] AppImage se lance sans erreur
- [ ] Intégration bureau fonctionnelle
- [ ] Aucun warning critique dans les logs

### Post-Installation
- [ ] .env configuré avec passphrase
- [ ] Icône bureau installée
- [ ] Raccourcis créés (optionnel)
- [ ] Backup du .env effectué

---

## 💡 CONSEILS UBUNTU

### Performance
- **SSD recommandé** pour les builds Rust (10x plus rapide qu'HDD)
- **≥8 GB RAM** recommandés (swap si moins)
- **4+ cores CPU** pour parallélisation builds

### Sécurité
- Ne pas exécuter builds en tant que root
- Garder le .env privé (gitignored)
- Mettre à jour régulièrement: `sudo apt update && sudo apt upgrade`

### Développement
- Utiliser un IDE avec support Rust/TypeScript (VS Code recommandé)
- Installer extensions: Rust Analyzer, ESLint, Prettier
- Configurer hot-reload: `npm run dev` pour itérations rapides

### Production
- Tester l'AppImage sur machine propre avant distribution
- Vérifier compatibilité avec autres versions Ubuntu (22.04, 23.10)
- Signer l'AppImage pour distributions publiques

---

## 🎉 RÉSUMÉ

**Commandes Essentielles:**

```bash
# 1. Installation système (une fois)
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget libssl-dev libgtk-3-dev -y

# 2. Installer Rust + Node
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pnpm@9.0.0

# 3. Cloner + Déployer
git clone https://github.com/KallokTherok1994/TITANE_INFINITY.git
cd TITANE_INFINITY
./scripts/deployment/tauri-full-deploy.sh

# 4. Lancer l'AppImage
chmod +x runtime/stable/TITANE-Infinity_*.AppImage
./runtime/stable/TITANE-Infinity_*.AppImage
```

**Résultat:** Application TITANE∞ fonctionnelle sur Ubuntu 24.04 LTS en ~60 minutes.

---

**Guide Créé:** 2025-12-24  
**Version:** 1.0.0  
**Plateforme:** Ubuntu 24.04 LTS (Noble Numbat)  
**Compatibilité:** Testé sur Ubuntu 24.04 Desktop & Server

© 2025 TITANE Team. All rights reserved.
