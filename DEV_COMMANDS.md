# TITANE_INFINITY - Commandes de Développement Essentielles

**Version:** 1.0.0  
**Dernière mise à jour:** 2025-12-20

---

## 📋 Table des Matières

1. [Développement](#développement)
2. [Build](#build)
3. [Tests](#tests)
4. [Qualité de Code](#qualité-de-code)
5. [Debugging](#debugging)
6. [Git & Versioning](#git--versioning)
7. [Monitoring](#monitoring)
8. [Utilitaires](#utilitaires)

---

## Développement

### Frontend Seul (Hot Reload)

```bash
# Lancer le serveur de dev frontend
npm run dev
# Ou avec pnpm
pnpm dev

# Accessible sur: http://localhost:5173
# Hot reload automatique sur modification
```

**Utilisation:**
- Développement UI rapide
- Tests de composants isolés
- Pas de backend Rust actif

### Application Complète (Tauri)

```bash
# Lancer l'app Tauri complète
npm run tauri dev

# Variante avec logs détaillés
npm run tauri dev -- --verbose
```

**Utilisation:**
- Développement full-stack
- Test des intégrations Rust ↔ React
- Test des fonctionnalités OS (filesystem, etc.)

### Modes de Développement Avancés

```bash
# Dev avec port personnalisé
VITE_PORT=3000 npm run dev

# Dev avec logs niveau DEBUG
VITE_LOG_LEVEL=DEBUG npm run dev

# Dev avec hot reload Rust (cargo-watch)
# Installer: cargo install cargo-watch
cd src-tauri && cargo watch -x run

# Dev avec profiling React
npm run dev -- --profile
```

---

## Build

### Build Frontend

```bash
# Build optimisé pour production
npm run build

# Build avec source maps (debugging)
npm run build -- --sourcemap

# Build pour preview local
npm run build && npm run preview
```

**Sortie:** `dist/`

### Build Application Tauri

```bash
# Build complet (frontend + backend)
npm run tauri build

# Build pour plateforme spécifique
npm run tauri build -- --target x86_64-pc-windows-msvc  # Windows
npm run tauri build -- --target x86_64-apple-darwin     # macOS Intel
npm run tauri build -- --target aarch64-apple-darwin    # macOS Apple Silicon
npm run tauri build -- --target x86_64-unknown-linux-gnu # Linux

# Build debug (plus rapide, non optimisé)
npm run tauri build -- --debug
```

**Sortie:** `src-tauri/target/release/`

### Build Rust Seul

```bash
cd src-tauri

# Build release
cargo build --release

# Build debug
cargo build

# Build avec features spécifiques
cargo build --features "feature-name"

cd ..
```

---

## Tests

### Tests Unitaires/Intégration (Vitest)

```bash
# Lancer tous les tests
npm run test

# Tests en mode watch (auto re-run)
npm run test -- --watch

# Tests avec UI interactive
npm run test:ui

# Tests avec coverage
npm run test -- --coverage

# Tester un fichier spécifique
npm run test -- src/engines/orchestrator.test.ts

# Tester un pattern
npm run test -- --grep "OMEGA Pipeline"
```

### Tests E2E (Playwright)

```bash
# Lancer les tests E2E
npm run test:e2e

# Tests E2E avec UI
npm run test:e2e -- --ui

# Tests E2E en mode debug
npm run test:e2e -- --debug

# Tests E2E sur navigateur spécifique
npm run test:e2e -- --project=chromium
npm run test:e2e -- --project=firefox
npm run test:e2e -- --project=webkit

# Générer rapport E2E
npm run test:e2e -- --reporter=html
```

### Tests Rust

```bash
cd src-tauri

# Tous les tests
cargo test

# Tests avec output détaillé
cargo test -- --nocapture

# Test spécifique
cargo test test_name

# Tests d'intégration seuls
cargo test --test integration_test

cd ..
```

### Tests de Performance

```bash
# Benchmark Vitest
npm run test -- --benchmark

# Profiling React
npm run dev -- --profile
# Ouvrir DevTools > Profiler

# Analyse bundle size
npm run build -- --analyze
```

---

## Qualité de Code

### Linting

```bash
# ESLint
npm run lint

# Fix automatique
npm run lint:fix

# Lint fichiers spécifiques
npm run lint -- src/components/**/*.tsx

# Lint avec règles strictes
npm run lint -- --max-warnings 0
```

### TypeScript

```bash
# Type checking
npm run type-check

# Type checking en watch mode
npm run type-check -- --watch

# Générer déclarations .d.ts
npx tsc --declaration --emitDeclarationOnly
```

### Formatting

```bash
# Prettier (si configuré)
npm run format

# Check format sans modifier
npm run format:check

# Format fichiers spécifiques
npx prettier --write "src/**/*.{ts,tsx}"
```

### Rust Linting

```bash
cd src-tauri

# Clippy (linter Rust)
cargo clippy

# Clippy strict
cargo clippy -- -D warnings

# Format Rust
cargo fmt

# Check format sans modifier
cargo fmt -- --check

cd ..
```

---

## Debugging

### Frontend

```bash
# Lancer avec DevTools Chrome
npm run dev
# Puis ouvrir: chrome://inspect

# Logs navigateur
# DevTools > Console
# window.__TITANE_LOG__.level = 'TRACE'

# React DevTools
# Installer extension: React Developer Tools
```

### Backend Rust

```bash
# Logs Rust détaillés
RUST_LOG=debug npm run tauri dev

# Logs niveau TRACE (très verbeux)
RUST_LOG=trace npm run tauri dev

# Logs module spécifique
RUST_LOG=titane_infinity::omega=debug npm run tauri dev

# Debugger Rust (VSCode)
# 1. Installer extension "rust-analyzer"
# 2. F5 ou Debug > Start Debugging
# 3. Breakpoints dans .rs files
```

### Monitoring

```bash
# Activer monitoring en dev
VITE_SENTRY_DSN=your-dsn npm run dev

# DevTools console
window.__TITANE_MONITORING__.getMetrics()
window.__TITANE_MONITORING__.exportMetrics()

# Tester erreur tracking
window.__TITANE_MONITORING__.trackError(new Error('test'))
```

### Network Debugging

```bash
# Proxy pour inspecter requêtes
# DevTools > Network

# Mock API responses
# Utiliser MSW: src/mocks/handlers.ts
npm run dev -- --mock
```

---

## Git & Versioning

### Workflow Git

```bash
# Créer branche feature
git checkout -b feature/nom-feature

# Voir les changements
git status
git diff

# Stage changements
git add .

# Commit (format conventionnel)
git commit -m "feat: description"
# Types: feat, fix, docs, refactor, test, chore

# Push
git push origin feature/nom-feature

# Créer PR sur GitHub
# https://github.com/KallokTherok1994/TITANE_INFINITY/pulls
```

### Versionning

```bash
# Bump version (package.json + Cargo.toml)
npm version patch   # 1.0.0 -> 1.0.1
npm version minor   # 1.0.0 -> 1.1.0
npm version major   # 1.0.0 -> 2.0.0

# Créer tag Git
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0
```

### Nettoyage

```bash
# Clean node_modules
rm -rf node_modules
npm install

# Clean Rust build
cd src-tauri
cargo clean
cd ..

# Clean tout
npm run clean  # Si script configuré
```

---

## Monitoring

### Web Vitals

```bash
# Activer en dev
npm run dev

# Console DevTools
window.__TITANE_MONITORING__.getMetrics()

# Export JSON
window.__TITANE_MONITORING__.exportMetrics()
```

### Performance

```bash
# Lighthouse audit
npx lighthouse http://localhost:5173 --view

# Bundle analysis
npm run build -- --analyze
npx vite-bundle-visualizer

# Memory profiling
# DevTools > Memory > Take heap snapshot
```

### Error Tracking

```bash
# Test Sentry integration
VITE_SENTRY_DSN=your-dsn npm run dev

# Trigger test error
window.__TITANE_MONITORING__.trackError(new Error('Test error'))

# Check Sentry dashboard
# https://sentry.io/
```

---

## Utilitaires

### Dépendances

```bash
# Lister dépendances
npm list

# Vérifier versions obsolètes
npm outdated

# Mettre à jour dépendances
npm update

# Audit sécurité
npm audit
npm audit fix

# Installer nouvelle dépendance
npm install package-name
npm install -D package-name  # Dev dependency
```

### Génération

```bash
# Générer composant React
npx generate-react-cli component NomComposant

# Générer types depuis JSON Schema
npx json2ts schema.json > types.ts

# Générer documentation
npx typedoc --out docs src
```

### Database/Storage (si applicable)

```bash
# Migrations
npm run migrate
npm run migrate:rollback

# Seed data
npm run seed
```

### CI/CD Local

```bash
# Simuler CI en local
npm run ci

# Équivalent de CI workflow
npm run lint && npm run type-check && npm run test && npm run build
```

---

## Scripts Personnalisés

### Créer un script npm

**package.json:**
```json
{
  "scripts": {
    "custom": "echo 'Custom script'",
    "dev:inspect": "VITE_LOG_LEVEL=DEBUG npm run dev"
  }
}
```

### Créer un script shell

**scripts/custom.sh:**
```bash
#!/bin/bash
echo "Custom shell script"
```

```bash
# Rendre exécutable
chmod +x scripts/custom.sh

# Exécuter
./scripts/custom.sh
```

---

## Raccourcis Clavier (Recommandés)

### VSCode

| Raccourci | Action |
|-----------|--------|
| `Cmd/Ctrl + Shift + P` | Command Palette |
| `Cmd/Ctrl + P` | Quick Open File |
| `Cmd/Ctrl + Shift + F` | Search in Files |
| `F5` | Start Debugging |
| `Cmd/Ctrl + Shift + B` | Run Build Task |
| `Cmd/Ctrl + J` | Toggle Terminal |

### Terminal

```bash
# Historique commandes
history | grep "npm run"

# Répéter dernière commande
!!

# Alias utiles (ajouter à ~/.bashrc ou ~/.zshrc)
alias dev="npm run dev"
alias test="npm run test"
alias build="npm run build"
```

---

## Troubleshooting Rapide

```bash
# Port déjà utilisé
lsof -ti:5173 | xargs kill -9

# Cache Vite corrompu
rm -rf node_modules/.vite

# Lock file désynchronisé
rm -rf node_modules package-lock.json
npm install

# TypeScript errors persistantes
npx tsc --noEmit --skipLibCheck

# Rust compilation lente
cd src-tauri && cargo clean && cd ..
```

---

## Ressources

**Commandes complètes:**
- npm: `npm help`
- cargo: `cargo --help`
- git: `git --help`

**Documentation:**
- Setup: `DEVELOPMENT_SETUP.md`
- Architecture: `docs/guides/`
- API: `docs/api/`

---

**Bon développement! 🚀**
