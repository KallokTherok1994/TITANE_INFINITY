# 🚀 TITANE∞ - COMMANDES ESSENTIELLES

## 🎯 Script Titane (Unifié)

### Commandes Principales

```bash
# 1. Vérifier l'état du système
./titane health

# 2. Nettoyer le projet
./titane clean

# 3. Réparer les dépendances
./titane repair

# 4. Corriger les erreurs TypeScript/Rust
./titane fix

# 5. Build development
./titane build dev

# 6. Build production
./titane build prod

# 7. Déploiement complet (dev)
./titane deploy dev

# 8. Déploiement complet (prod)
./titane deploy prod

# 9. Processus complet (clean + repair + fix + build + deploy)
./titane full dev

# 10. Aide
./titane help
```

## 🧪 Tests

### Frontend (Vitest)

```bash
# Tous les tests
pnpm test

# Tests en mode watch
pnpm run test:watch

# Coverage
pnpm run test:coverage

# Tests unitaires uniquement
vitest run --config vitest.unit.config.ts

# Tests d'intégration uniquement
vitest run --config vitest.integration.config.ts

# Tests E2E
pnpm run test:e2e
```

### Backend (Rust)

```bash
# Tous les tests Rust
pnpm run test:rust
# OU
cd src-tauri && cargo test

# Tests avec output détaillé
cargo test -- --nocapture

# Tests release optimisé
cargo test --release

# Tests d'un module spécifique
cargo test --package titane-infinity --lib security::validation
```

### Tests Complets

```bash
# Tous les tests (Frontend + Backend + E2E + Architecture)
pnpm run test:all

# Tests architecture
pnpm run test:architecture

# Tests compliance
pnpm run test:compliance

# Tests OMEGA
pnpm run test:omega
```

## 🔧 Build & Development

### Development

```bash
# Démarrer le mode dev (Tauri + Vite)
pnpm run dev

# Build frontend uniquement
pnpm run build

# Build production complète (lint + format + build + Tauri)
pnpm run build:production
```

### Vérifications

```bash
# TypeScript check (sans build)
pnpm run check

# ESLint
pnpm run lint

# ESLint avec fix auto
pnpm run lint:fix

# Prettier check
pnpm run format:check

# Prettier format
pnpm run format

# Vérification complète (lint + format + check + tests + verify)
pnpm run verify
```

### Tauri-Only & Local-First

```bash
# Vérifier conformité Tauri-only
pnpm run verify:tauri-only

# Vérifier conformité local-first
pnpm run verify:local-first

# Vérifier configs Tauri
pnpm run verify:tauri-configs
```

## 🔒 Sécurité

### Audits

```bash
# Audit npm
pnpm audit

# Audit Rust (cargo audit requis: cargo install cargo-audit)
cd src-tauri && cargo audit

# Audit complet
pnpm run audit
```

### Validation

```bash
# Script validation sécurité
bash scripts/verify/enforce-tauri-only.sh

# Script validation local-first
bash scripts/verify/enforce-local-first.sh

# Validation configs Tauri
bash scripts/verify/validate-tauri-configs.sh
```

## 📊 Analyse & Monitoring

### Bundle Analysis

```bash
# Vite bundle visualizer
npx vite-bundle-visualizer

# Analyse taille bundles
du -sh dist/assets/* | sort -h

# Analyse dependencies
npm list --depth=0
```

### Code Metrics

```bash
# Compter lignes TypeScript
find src -name "*.tsx" -o -name "*.ts" | xargs wc -l

# Compter lignes Rust
find src-tauri/src -name "*.rs" | xargs wc -l

# Recherche TODO/FIXME
grep -r "TODO\|FIXME\|XXX\|HACK" src/ --include="*.ts" --include="*.tsx"

# Recherche unsafe/unwrap en Rust
grep -r "unsafe\|unwrap()\|panic!" src-tauri/src/ --include="*.rs"
```

## 🧹 Nettoyage

```bash
# Nettoyage complet
pnpm run clean

# Supprimer node_modules
rm -rf node_modules

# Supprimer target Rust
rm -rf src-tauri/target

# Supprimer dist
rm -rf dist

# Nettoyage profond + réinstall
pnpm run clean && pnpm install && cd src-tauri && cargo clean && cargo build
```

## 🔍 Debugging

### Logs

```bash
# Logs Vite dev server
tail -f runtime/dev/logs/vite.log

# Logs Tauri runtime
tail -f runtime/dev/logs/tauri.log

# Logs build
pnpm run build 2>&1 | tee build.log
```

### Tests Debugging

```bash
# Tests avec debug output
DEBUG=* pnpm test

# Tests Rust verbose
cargo test -- --nocapture --test-threads=1

# Vitest UI (interface graphique)
npx vitest --ui
```

## 📦 Git Workflow

### Branches

```bash
# Dev branch
./scripts/git/switch-dev.sh

# Stable branch
./scripts/git/switch-stable.sh

# Merge dev → stable
./scripts/git/merge-dev-to-stable.sh

# Clean working state
./scripts/git/clean-working-state.sh

# Feature branch (interactive)
git checkout -b feature/nom-feature
```

### Commits

```bash
# Commit avec Husky hooks (lint + format)
git add .
git commit -m "feat: description"

# Bypass hooks (déconseillé)
git commit --no-verify -m "message"
```

## 🚀 Production

### Build Production

```bash
# Build production complète
pnpm run build:production

# OU avec titane.sh
./titane build prod
./titane deploy prod
```

### Validation Pre-Production

```bash
# 1. Vérifications
pnpm run verify

# 2. Tests complets
pnpm run test:all

# 3. Audit sécurité
pnpm run audit

# 4. Build production
pnpm run build:production
```

## 📚 Documentation

### Générer Docs

```bash
# TypeDoc (documentation API TypeScript)
pnpm run docs

# Storybook (composants UI)
pnpm run storybook

# Build Storybook
pnpm run build-storybook
```

### Consulter Docs

```bash
# README principal
cat README.md

# Architecture
cat ARCHITECTURE.md

# Code style
cat CODE_STYLE.md

# Changelog
cat CHANGELOG.md

# Analyses récentes
cat ANALYSE_COMPLETE_PRODUCTION_v24.2.0.md
cat ANALYSE_SECURITE_PERFORMANCE_v24.2.0.md
```

## 🛠️ Maintenance

### Updates

```bash
# Update npm packages (interactif)
npx npm-check-updates -i

# Update Rust crates
cd src-tauri && cargo update

# Update Tauri CLI
pnpm install -D @tauri-apps/cli@latest
```

### Health Checks

```bash
# Vérifier versions outils
node --version
npm --version
cargo --version
rustc --version

# Vérifier dépendances
npm list
cd src-tauri && cargo tree

# Vérifier intégrité
pnpm run verify
```

## 🎯 Raccourcis Utiles

```bash
# Alias recommandés (ajouter à ~/.bashrc ou ~/.zshrc)
alias t='./titane'
alias th='./titane health'
alias tf='./titane full dev'
alias tb='./titane build dev'
alias td='./titane deploy dev'
alias tt='pnpm test'
alias tc='pnpm run check'
alias tl='pnpm run lint:fix'
```

## 📞 Support

### Ressources

- **Documentation**: `/docs/`
- **Architecture**: `ARCHITECTURE.md`
- **Tests**: `FRONTEND_TESTS_FIXED_v25.md`
- **Sécurité**: `AUDIT_SECURITE_COMMANDES_v24.4.0.md`
- **Analyses**: `ANALYSE_COMPLETE_PRODUCTION_v24.2.0.md`

### Troubleshooting

```bash
# Reset complet
pnpm run clean
rm -rf node_modules package-lock.json pnpm-lock.yaml
pnpm install
cd src-tauri && cargo clean && cargo build

# Fix permissions script Titane
chmod +x titane.sh

# Fix TypeScript errors
pnpm run check 2>&1 | less

# Fix Rust errors
cd src-tauri && cargo check
```

---

**TITANE∞ v24.2.0** - Cognitive Operating System  
© 2025 Humain Total / Kevin Thibault / TITANE Team
