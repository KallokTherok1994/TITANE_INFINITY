# 🛠️ TITANE∞ — Guide de Configuration Développement

**Version:** v24.2.0  
**Date:** 15 décembre 2025  
**Audience:** Développeurs

---

## 📋 Table des Matières

1. [Environnement Requis](#environnement-requis)
2. [Installation Développement](#installation-développement)
3. [Configuration IDE](#configuration-ide)
4. [Dual Runtime (Dev/Stable)](#dual-runtime-devstable)
5. [Outils Développement](#outils-développement)
6. [Workflows Git](#workflows-git)

---

## 🔧 Environnement Requis

### Versions Minimales

| Tool | Version Minimale | Version Recommandée |
|------|------------------|---------------------|
| **Node.js** | v18.0+ | v20.11+ (LTS) |
| **npm** | v9.0+ | v10.2+ |
| **Rust** | 1.75+ | 1.80+ |
| **Cargo** | 1.75+ | 1.80+ |
| **Tauri CLI** | 2.0+ | 2.0.6+ |
| **Git** | 2.30+ | 2.43+ |

### Système d'Exploitation

- **Recommandé:** Ubuntu 24.04 LTS
- **Supporté:** Ubuntu 22.04+, Debian 12+, Fedora 38+
- **Possible:** macOS 12+, Windows 10/11 (WSL2 recommandé)

---

## 🚀 Installation Développement

### 1. Installation Complète (Ubuntu 24.04)

```bash
# Télécharger script d'installation
wget https://raw.githubusercontent.com/KallokTherok1994/TITANE_INFINITY/main/TITANE_POST_INSTALL_UBUNTU.sh
chmod +x TITANE_POST_INSTALL_UBUNTU.sh

# Exécuter
./TITANE_POST_INSTALL_UBUNTU.sh

# Recharger environnement
source ~/.bashrc
```

**Ce script installe:**
- ✅ Rust (stable + nightly)
- ✅ Node.js LTS via NVM
- ✅ Dépendances Tauri (WebKit2GTK 4.1, GTK3, ALSA, librsvg)
- ✅ VSCode + extensions (rust-analyzer, Tauri, ESLint, Prettier)
- ✅ Build tools (gcc, make, pkg-config)
- ✅ Repository TITANE∞ + dépendances

---

### 2. Installation Manuelle (Autres OS)

#### a) Installer Rust

```bash
# Via rustup (officiel)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Configuration
source $HOME/.cargo/env

# Installer nightly (requis pour certains features)
rustup install nightly
rustup component add clippy rustfmt --toolchain stable

# Vérifier
cargo --version
rustc --version
```

#### b) Installer Node.js

```bash
# Via NVM (recommandé)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Recharger shell
source ~/.bashrc

# Installer Node LTS
nvm install --lts
nvm use --lts

# Vérifier
node --version  # v20.11+ attendu
npm --version   # v10.2+ attendu
```

#### c) Installer Dépendances Tauri

**Ubuntu/Debian:**

```bash
sudo apt update
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
    libasound2-dev \
    libsoup-3.0-dev \
    patchelf
```

**Fedora:**

```bash
sudo dnf install \
    webkit2gtk4.1-devel \
    openssl-devel \
    gtk3-devel \
    libappindicator-gtk3-devel \
    librsvg2-devel \
    alsa-lib-devel
```

**macOS:**

```bash
# Via Homebrew
brew install pkg-config
```

#### d) Cloner Repository

```bash
# Via HTTPS
git clone https://github.com/KallokTherok1994/TITANE_INFINITY.git

# Ou via SSH (recommandé)
git clone git@github.com:KallokTherok1994/TITANE_INFINITY.git

cd TITANE_INFINITY
```

#### e) Installer Dépendances Projet

```bash
# Installer dépendances npm
pnpm install

# Ou avec legacy peer deps (si conflits)
pnpm install --legacy-peer-deps

# Compiler backend Rust (première fois)
cd src-tauri
cargo build
cd ..
```

---

## 💻 Configuration IDE

### VSCode (Recommandé)

#### Extensions Essentielles

Installer via VSCode Extensions ou CLI:

```bash
# Rust
code --install-extension rust-lang.rust-analyzer
code --install-extension tauri-apps.tauri-vscode

# JavaScript/TypeScript
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension bradlc.vscode-tailwindcss

# Git
code --install-extension eamodio.gitlens

# Autres
code --install-extension usernamehw.errorlens
code --install-extension streetsidesoftware.code-spell-checker
```

#### Configuration Workspace

Créer `.vscode/settings.json`:

```json
{
  "rust-analyzer.checkOnSave.command": "clippy",
  "rust-analyzer.cargo.features": "all",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "[rust]": {
    "editor.defaultFormatter": "rust-lang.rust-analyzer"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/target": true,
    "**/.vite": true
  }
}
```

#### Tasks VSCode

Le projet inclut `.vscode/tasks.json` avec tasks préconfigurées:

- **🟢 Launch Titan-Dev** - Démarrer développement
- **🔵 Build Titan-Stable** - Build production
- **⚛️ Reload React** - Reload hot-reload
- **🧪 Run All Tests** - Tests complets
- **📊 Dev Logs (Vite/Tauri)** - Logs temps réel

**Utilisation:**
- `Ctrl+Shift+P` → `Tasks: Run Task`
- Ou `Terminal` → `Run Task...`

---

## 🎯 Dual Runtime (Dev/Stable)

TITANE∞ utilise une **architecture dual-runtime**:

### Titan-Dev (Développement)

**Caractéristiques:**
- ✅ Hot-reload frontend (Vite HMR)
- ✅ Compilation rapide Rust (debug mode)
- ✅ Logs détaillés
- ✅ DevTools activés
- ✅ Source maps complètes

**Lancer:**

```bash
# Méthode 1: Script dédié
./runtime/dev/run-dev.sh

# Méthode 2: npm
pnpm run dev:tauri

# Méthode 3: VSCode Task
# Terminal → Run Task → "🟢 Launch Titan-Dev"
```

**Fichiers générés:**
- `target/debug/titane-infinity` (binaire non-optimisé)
- `runtime/dev/logs/vite.log`
- `runtime/dev/logs/tauri.log`

---

### Titan-Stable (Production)

**Caractéristiques:**
- ✅ Compilation optimisée (release mode)
- ✅ Minification frontend
- ✅ Tree-shaking agressif
- ✅ Code splitting optimal
- ✅ AppImage/DEB/RPM packaging

**Build:**

```bash
# Méthode 1: Script dédié
./runtime/stable/build.sh

# Méthode 2: npm
pnpm run build

# Méthode 3: VSCode Task
# Terminal → Run Task → "🔵 Build Titan-Stable"
```

**Fichiers générés:**
- `src-tauri/target/release/titane-infinity` (binaire optimisé)
- `src-tauri/target/release/bundle/appimage/*.AppImage`
- `src-tauri/target/release/bundle/deb/*.deb`

---

## 🛠️ Outils Développement

### Linting & Formatting

#### ESLint (JavaScript/TypeScript)

```bash
# Linter frontend
pnpm run lint

# Auto-fix
pnpm run lint:fix
```

**Configuration:** `.eslintrc.json`

#### Clippy (Rust)

```bash
# Linter backend
cd src-tauri
cargo clippy

# Mode strict
cargo clippy -- -D warnings
```

#### Prettier (Code Formatting)

```bash
# Formater frontend
pnpm run format

# Vérifier formatage
pnpm run format:check
```

**Configuration:** `.prettierrc`

---

### Tests

#### Tests Frontend (Vitest)

```bash
# Tous les tests
pnpm test

# Watch mode
pnpm run test:watch

# Coverage
pnpm run test:coverage
```

**Fichiers:** `src/**/*.test.ts`, `src/**/*.test.tsx`

#### Tests Backend (Rust)

```bash
cd src-tauri

# Tous les tests
cargo test

# Tests spécifiques
cargo test omega::
cargo test conversation_engine::

# Avec logs
cargo test -- --nocapture
```

**Fichiers:** `src-tauri/src/**/*_test.rs`, `src-tauri/tests/`

#### Tests E2E (Playwright - optionnel)

```bash
# Installer Playwright
pnpm run test:e2e:install

# Lancer tests E2E
pnpm run test:e2e

# Mode UI
pnpm run test:e2e:ui
```

---

### Profiling Performance

#### Frontend (Vite)

```bash
# Build avec profiling
pnpm run build -- --mode profiling

# Analyser bundle
pnpm run analyze
```

#### Backend (Rust)

```bash
# Build avec profiling symbols
cd src-tauri
cargo build --release --features profiling

# Profiler avec perf (Linux)
perf record ./target/release/titane-infinity
perf report
```

---

## 📁 Structure Projet

```
TITANE_INFINITY/
├── src/                      # Frontend React + TypeScript
│   ├── engines/              # 14 moteurs cognitifs
│   ├── core/                 # Pipelines, healing, safety
│   ├── services/             # AI, API, memory, voice, TTS
│   ├── stores/               # State management (Zustand)
│   ├── hooks/                # Custom React hooks
│   ├── features/             # Modules métier
│   └── ui/                   # Composants + Pages
├── src-tauri/                # Backend Rust
│   ├── src/
│   │   ├── omega/            # Pipeline OMEGA
│   │   ├── conversation_engine/
│   │   ├── ai_providers/
│   │   └── main.rs
│   ├── tests/                # Tests intégration
│   └── Cargo.toml
├── runtime/
│   ├── dev/                  # Scripts Titan-Dev
│   └── stable/               # Scripts Titan-Stable
├── docs/                     # Documentation
├── scripts/                  # Scripts utilitaires
└── .vscode/                  # Configuration VSCode
```

---

## 🔀 Workflows Git

### Branches

- **`MAIN`** - Production stable
- **`chore/*`** - Documentation, maintenance
- **`feat/*`** - Nouvelles fonctionnalités
- **`fix/*`** - Corrections bugs
- **`test/*`** - Tests
- **`perf/*`** - Optimisations performance

### Workflow Standard

```bash
# 1. Créer branche feature
git checkout -b feat/my-feature

# 2. Développer + commits
git add .
git commit -m "feat(scope): description"

# 3. Push
git push origin feat/my-feature

# 4. Pull Request sur GitHub
# 5. Merge après review
```

### Conventions Commits

Format: `type(scope): description`

**Types:**
- `feat:` - Nouvelle feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `test:` - Tests
- `refactor:` - Refactoring
- `perf:` - Performance
- `chore:` - Maintenance

**Exemples:**

```bash
git commit -m "feat(chat): add multi-provider support"
git commit -m "fix(omega): correct pipeline validation"
git commit -m "docs(readme): update installation steps"
git commit -m "test(voice): add VAD integration tests"
```

---

## 🔄 Commandes Développement Courantes

### Développement Quotidien

```bash
# Démarrer dev
pnpm run dev:tauri

# Linter + tests avant commit
pnpm run lint && pnpm test

# Rebuild complet si problèmes
pnpm run clean
pnpm install
pnpm run dev:tauri
```

### Debug

```bash
# Logs frontend
tail -f runtime/dev/logs/vite.log

# Logs backend
tail -f runtime/dev/logs/tauri.log

# Logs Rust (activer dans code)
RUST_LOG=debug pnpm run dev:tauri
```

### Build Production

```bash
# Build optimisé
./runtime/stable/build.sh

# Tester AppImage
./src-tauri/target/release/bundle/appimage/titane-infinity_*.AppImage
```

---

## 🐛 Dépannage Développement

### Problème: Hot-reload ne fonctionne pas

**Solutions:**

```bash
# 1. Vider cache Vite
rm -rf node_modules/.vite

# 2. Restart dev server
pnpm run dev:tauri
```

---

### Problème: Compilation Rust échoue

**Solutions:**

```bash
# 1. Nettoyer build
cd src-tauri
cargo clean

# 2. Update Rust
rustup update

# 3. Rebuild
cargo build
```

---

### Problème: Tests échouent

**Solutions:**

```bash
# 1. Vérifier Node version
node --version  # doit être v20+

# 2. Réinstaller dépendances
rm -rf node_modules
pnpm install

# 3. Re-lancer tests
pnpm test
```

---

## 📚 Ressources Développeurs

### Documentation Interne

- **[Architecture v24](../../01_architecture/ARCHITECTURE_CURRENT_v24.md)**
- **[Data Flow Chat](../../01_architecture/DATA_FLOW_CHAT.md)**
- **[OMEGA Pipeline](../../01_architecture/OMEGA_PIPELINE_DETAILED.md)**
- **[Tauri Commands API](../../06_api/TAURI_COMMANDS_REFERENCE.md)**

### Documentation Externe

- **Tauri v2:** https://v2.tauri.app/
- **React:** https://react.dev/
- **TypeScript:** https://www.typescriptlang.org/
- **Rust:** https://doc.rust-lang.org/
- **Vite:** https://vitejs.dev/

---

## 🎉 Environnement Prêt !

Vous êtes maintenant prêt à développer sur TITANE∞ ! 🚀

**Prochaines étapes:**

1. ✅ Lire [Architecture v24](../../01_architecture/ARCHITECTURE_CURRENT_v24.md)
2. ✅ Consulter [Guide Tests](./TESTING.md)
3. ✅ Explorer le code source
4. ✅ Faire votre première contribution !

---

**© 2025 TITANE∞ — Development Setup Guide**  
**Version:** v24.2.0 | **License:** Proprietary
