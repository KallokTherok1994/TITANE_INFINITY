# TITANE_INFINITY - Guide de Configuration Développement

**Version:** 1.0.0  
**Dernière mise à jour:** 2025-12-20  
**Compatibilité:** Windows, macOS, Linux

---

## Vue d'ensemble

TITANE_INFINITY est une application Tauri v2 (Rust + React + TypeScript) nécessitant un environnement de développement spécifique pour le frontend et le backend.

**Stack Technique:**

- **Frontend:** React 18.3.1 + Vite 6.0.5 + TypeScript 5.7.3
- **Backend:** Tauri v2.2.0 + Rust 1.83
- **Testing:** Vitest 4.0.13 + Playwright 1.56.1
- **State Management:** Zustand 5.0.2

---

## Prérequis Système

### 1. Node.js & Package Manager

**Node.js 18+ requis (recommandé: 20 LTS)**

```bash
# Vérifier la version
node --version  # Doit être >= 18.0.0
npm --version   # Doit être >= 9.0.0
```

**Installation:**

- **Windows:** Télécharger depuis [nodejs.org](https://nodejs.org/)
- **macOS:** `brew install node@20`
- **Linux:**
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
  ```

**Alternative: pnpm (recommandé pour vitesse)**

```bash
pnpm install -g pnpm
```

### 2. Rust & Cargo

**Rust 1.83+ requis**

```bash
# Installation rustup (gestionnaire Rust)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Vérification
rustc --version  # Doit être >= 1.83.0
cargo --version
```

**Configuration:**

```bash
# Configurer toolchain stable
rustup default stable
rustup update
```

### 3. Build Tools Système

#### Windows

```powershell
# Microsoft C++ Build Tools
# Télécharger: https://visualstudio.microsoft.com/downloads/
# Installer: "Desktop development with C++"

# WebView2 (requis pour Tauri)
# Installer Microsoft Edge WebView2 Runtime
```

#### macOS

```bash
# Xcode Command Line Tools
xcode-select --install

# Vérification
xcode-select -p
```

#### Linux (Debian/Ubuntu)

```bash
sudo apt update
sudo apt install -y \
  libwebkit2gtk-4.0-dev \
  build-essential \
  curl \
  wget \
  file \
  libssl-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

#### Linux (Fedora)

```bash
sudo dnf install \
  webkit2gtk4.0-devel \
  openssl-devel \
  curl \
  wget \
  file \
  libappindicator-gtk3-devel \
  librsvg2-devel
```

### 4. Git

```bash
# Vérification
git --version  # Doit être >= 2.0.0

# Configuration (si pas déjà fait)
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@example.com"
```

---

## Installation du Projet

### 1. Cloner le Repository

```bash
# HTTPS
git clone https://github.com/KallokTherok1994/TITANE_INFINITY.git
cd TITANE_INFINITY

# SSH (recommandé si configuré)
git clone git@github.com:KallokTherok1994/TITANE_INFINITY.git
cd TITANE_INFINITY
```

### 2. Installer les Dépendances

**Option A: npm**

```bash
pnpm install
```

**Option B: pnpm (plus rapide)**

```bash
pnpm install
```

**Temps estimé:** 2-5 minutes (dépend de la connexion)

### 3. Configuration Rust (Tauri)

```bash
# Installer dépendances Rust du backend
cd src-tauri
cargo fetch
cargo build
cd ..
```

**Temps estimé:** 5-10 minutes (première compilation)

### 4. Configuration Environnement

```bash
# Copier le template .env
cp .env.example .env

# Éditer .env avec vos configurations
# (optionnel, valeurs par défaut fonctionnent)
```

**Variables importantes:**

```bash
# .env
VITE_LOG_LEVEL=INFO                    # DEBUG en dev
VITE_SENTRY_DSN=                       # Optionnel (monitoring)
VITE_SENTRY_ENVIRONMENT=development    # development/staging/production
VITE_APP_VERSION=26.2.0
```

---

## Commandes de Développement

### Développement Frontend (Hot Reload)

```bash
# Lancer le serveur de dev frontend seul
pnpm run dev
# Ou avec pnpm
pnpm dev

# Accessible sur: http://localhost:5173
```

### Développement Full Stack (Tauri)

```bash
# Lancer l'app Tauri complète (Rust + React)
pnpm run tauri dev
# Ou
pnpm tauri dev

# Lance automatiquement:
# - Backend Rust (Tauri)
# - Frontend React (Vite)
# - Hot reload activé
```

### Build Production

```bash
# Build frontend seul
pnpm run build

# Build app Tauri complète
pnpm run tauri build

# Résultat dans: src-tauri/target/release/
```

### Tests

```bash
# Tests unitaires/intégration (Vitest)
pnpm run test

# Tests avec UI
pnpm run test:ui

# Tests E2E (Playwright)
pnpm run test:e2e

# Tests Rust
cd src-tauri
cargo test
cd ..
```

### Linting & Formatting

```bash
# ESLint
pnpm run lint
pnpm run lint:fix

# TypeScript check
pnpm run type-check

# Prettier (si configuré)
pnpm run format
```

---

## Structure du Projet

```
TITANE_INFINITY/
├── src/                      # Frontend React
│   ├── components/           # Composants React
│   ├── engines/              # Moteurs cognitifs (Ring 2)
│   ├── services/             # Services I/O (Ring 3)
│   ├── types/                # Types TypeScript (Ring 1)
│   ├── pages/                # Pages routing
│   ├── hooks/                # React hooks personnalisés
│   ├── stores/               # Zustand stores
│   ├── utils/                # Utilitaires
│   ├── config/               # Configuration
│   └── main.tsx              # Point d'entrée
├── src-tauri/                # Backend Rust
│   ├── src/
│   │   ├── main.rs           # Point d'entrée Rust
│   │   ├── omega/            # OMEGA Pipeline backend
│   │   ├── commands/         # Commandes Tauri
│   │   └── ...
│   ├── Cargo.toml            # Dépendances Rust
│   └── tauri.conf.json       # Config Tauri
├── e2e/                      # Tests E2E Playwright
├── docs/                     # Documentation
├── public/                   # Assets statiques
├── package.json              # Dépendances npm
├── vite.config.ts            # Config Vite
├── tsconfig.json             # Config TypeScript
└── .env.example              # Template environnement
```

---

## Architecture 4-Ring Model

**RÈGLE FONDAMENTALE:** Les anneaux intérieurs ne peuvent JAMAIS importer les anneaux extérieurs.

```
Ring 1 (Core)     → src/types/, src/constants/
Ring 2 (Engines)  → src/engines/*/  (imports Ring 1 only)
Ring 3 (Services) → src/services/*/ (imports Ring 1-2)
Ring 4 (OS/UI)    → src-tauri/, components (imports all)
```

**Violation d'architecture = Rejet du PR**

---

## Workflow de Développement

### 1. Créer une branche

```bash
git checkout -b feature/nom-feature
# Ou
git checkout -b fix/nom-bug
```

### 2. Développer avec hot reload

```bash
# Terminal 1: Frontend
pnpm run dev

# Terminal 2: Tests auto
pnpm run test -- --watch

# Terminal 3: Type checking
pnpm run type-check -- --watch
```

### 3. Valider avant commit

```bash
# Lint
pnpm run lint

# Tests
pnpm run test

# Build (vérification)
pnpm run build
```

### 4. Commit

```bash
git add .
git commit -m "feat: description du changement"
# Ou fix:, docs:, refactor:, test:, chore:
```

### 5. Push & PR

```bash
git push origin feature/nom-feature
# Créer PR sur GitHub
```

---

## Troubleshooting

### Erreur: "Could not find declaration file for module 'X'"

```bash
# Réinstaller les types
pnpm install --save-dev @types/node
pnpm install
```

### Erreur Rust: "linking with 'cc' failed"

```bash
# Linux: Installer build-essential
sudo apt install build-essential

# macOS: Installer Xcode CLI tools
xcode-select --install

# Windows: Installer MSVC Build Tools
```

### Erreur Tauri: "failed to bundle project"

```bash
# Nettoyer et rebuilder
rm -rf src-tauri/target
cargo clean
pnpm run tauri build
```

### Port 5173 déjà utilisé

```bash
# Changer le port dans vite.config.ts
export default defineConfig({
  server: { port: 3000 }
})
```

### Erreur: "WebView2 not found" (Windows)

```bash
# Installer WebView2 Runtime
# https://developer.microsoft.com/microsoft-edge/webview2/
```

---

## Extensions VSCode Recommandées

```json
{
  "recommendations": [
    "rust-lang.rust-analyzer",
    "tauri-apps.tauri-vscode",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "GitHub.copilot"
  ]
}
```

**Installer:**

1. Ouvrir VSCode
2. Cmd/Ctrl + Shift + P
3. "Extensions: Show Recommended Extensions"
4. Installer toutes

---

## Bonnes Pratiques

### Commits

- Messages en anglais ou français (cohérent dans le projet)
- Format: `type: description courte`
- Types: feat, fix, docs, refactor, test, chore

### Code

- TypeScript strict mode: 100% typé
- 4-ring model: Respecter les frontières
- Tests: Couvrir les nouvelles fonctionnalités
- Logs: Utiliser le logger centralisé (`src/utils/logger.ts`)

### Performance

- Lazy-load les engines lourds (`src/utils/lazyEngineLoader.tsx`)
- Éviter les re-renders inutiles (React.memo, useMemo)
- Profiler avec DevTools: `window.__TITANE_MONITORING__`

---

## Ressources

**Documentation:**

- Tauri: https://tauri.app/v2/
- React: https://react.dev/
- Vite: https://vitejs.dev/
- Vitest: https://vitest.dev/
- Playwright: https://playwright.dev/

**Projet:**

- Issues: https://github.com/KallokTherok1994/TITANE_INFINITY/issues
- Wiki: https://github.com/KallokTherok1994/TITANE_INFINITY/wiki
- Discussions: https://github.com/KallokTherok1994/TITANE_INFINITY/discussions

---

## Support

**Problème avec le setup?**

1. Vérifier les versions: Node, Rust, build tools
2. Consulter le troubleshooting ci-dessus
3. Créer une issue: https://github.com/KallokTherok1994/TITANE_INFINITY/issues

**Questions?**

- Discussions GitHub
- Documentation `docs/`

---

**Bon développement! 🚀**
