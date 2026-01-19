# 🚀 Guide de Déploiement TITANE∞ v9 — Tauri

## 📋 Prérequis

### Système
- **OS**: Linux (Pop!_OS, Ubuntu, Debian), macOS, ou Windows
- **Rust**: >= 1.70
- **Node.js**: >= 20.x
- **npm**: >= 10.x

### Dépendances Linux (Pop!_OS/Ubuntu)
```bash
sudo apt update
sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  libjavascriptcoregtk-4.1-dev \
  libsoup-3.0-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  build-essential \
  curl \
  wget \
  file \
  pkg-config \
  libssl-dev
```

---

## 🎯 Déploiement Rapide

### Option 1: Script Automatique (Recommandé)

```bash
# Rendre le script exécutable
chmod +x deploy_titane.sh

# Lancer le déploiement complet
./deploy_titane.sh

# Ou en mode debug (plus rapide)
./deploy_titane.sh debug
```

Le script effectue automatiquement:
1. ✅ Vérification des dépendances
2. ✅ Installation Rust/Cargo si nécessaire
3. ✅ Installation Tauri CLI
4. ✅ Installation dépendances frontend
5. ✅ Build frontend (Vite + React)
6. ✅ Compilation backend Rust
7. ✅ Build Tauri complet
8. ✅ Optimisation binaires
9. ✅ Exécution tests
10. ✅ Packaging release
11. ✅ Génération artefacts

### Option 2: Manuel

```bash
# 1. Installation dépendances
pnpm install --legacy-peer-deps

# 2. Build frontend
pnpm run build

# 3. Build Tauri (production)
cargo tauri build

# 4. Ou en mode dev
cargo tauri dev
```

---

## 📦 Formats de Build Générés

### Linux
- **AppImage**: `src-tauri/target/release/bundle/appimage/titane-infinity_*.AppImage`
- **DEB**: `src-tauri/target/release/bundle/deb/titane-infinity_*.deb`

### macOS
- **DMG**: `src-tauri/target/release/bundle/dmg/TITANE∞ v9_*.dmg`
- **App**: `src-tauri/target/release/bundle/macos/TITANE∞ v9.app`

### Windows
- **MSI**: `src-tauri/target/release/bundle/msi/TITANE∞ v9_*.msi`
- **NSIS**: `src-tauri/target/release/bundle/nsis/TITANE∞ v9_*.exe`

---

## 🛠️ Commandes Disponibles

### Frontend
```bash
pnpm run dev          # Dev server (Vite)
pnpm run build        # Build production
pnpm run preview      # Preview build
pnpm run type-check   # Vérification TypeScript
pnpm run lint         # Linting ESLint
```

### Tauri
```bash
cargo tauri dev      # Mode développement
cargo tauri build    # Build production
cargo tauri build --debug  # Build debug
cargo tauri info     # Infos système
```

### Tests
```bash
# Frontend
pnpm test

# Backend Rust
cd src-tauri
cargo test --all

# Vérification globale
pnpm run verify
```

---

## 🔧 Configuration

### tauri.conf.json
Configuration principale de l'application Tauri. Modifiable pour:
- Permissions système (fs, dialog, shell, etc.)
- Configuration fenêtre (taille, titre, etc.)
- CSP (Content Security Policy)
- Bundle (icônes, identifier, etc.)

### Cargo.toml
Configuration Rust backend:
- Dépendances
- Version
- Features Tauri

### package.json
Configuration frontend:
- Scripts npm
- Dépendances React/Vite
- Version application

---

## 📊 Artefacts de Release

Après build, les artefacts sont disponibles dans:

```
release/TITANE_v9.0.0_YYYYMMDD/
├── bundle/              # Packages installables
│   ├── appimage/       # Linux AppImage
│   ├── deb/            # Debian package
│   ├── dmg/            # macOS DMG
│   └── msi/            # Windows MSI
├── titane-infinity     # Binaire brut
├── README.md
├── LICENSE
└── VERSION.txt         # Infos build
```

---

## 🐛 Dépannage

### Erreur: webkit2gtk non trouvé
```bash
sudo apt install libwebkit2gtk-4.1-dev
```

### Erreur: Rust non installé
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

### Erreur: Node.js manquant
Utilisez nvm:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
source ~/.bashrc
nvm install --lts
```

### Build échoue avec erreurs de permissions
```bash
chmod +x deploy_titane.sh
# Puis relancer
./deploy_titane.sh
```

### Cache corrompu
```bash
cargo clean
rm -rf node_modules
pnpm install --legacy-peer-deps
```

---

## 🚀 CI/CD (GitHub Actions)

Un workflow GitHub Actions est disponible dans `.github/workflows/deploy.yml`.

Il permet:
- ✅ Build multi-plateforme (Linux, macOS, Windows)
- ✅ Tests automatiques
- ✅ Génération release automatique
- ✅ Upload artefacts

Pour l'activer:
1. Push sur branch `main` ou `master`
2. Les builds se lancent automatiquement
3. Les artefacts sont disponibles dans l'onglet Actions

---

## 📝 Checklist Pre-Release

- [ ] Version mise à jour dans `package.json`
- [ ] Version mise à jour dans `src-tauri/Cargo.toml`
- [ ] Version mise à jour dans `src-tauri/tauri.conf.json`
- [ ] Changelog à jour
- [ ] Tests passent (frontend + backend)
- [ ] Build production réussi
- [ ] Binaires testés sur plateforme cible
- [ ] Documentation à jour
- [ ] Release notes préparées

---

## 🎯 Performance

### Optimisations Build
Le script applique automatiquement:
- Compilation optimisée (`--release`)
- Strip binaires (réduction taille)
- Tree-shaking frontend
- Minification assets
- Compression brotli

### Temps de Build Approximatifs
- **Frontend**: 30-60s
- **Backend Rust**: 2-5 min (première fois), 30s-1min (incrémental)
- **Packaging**: 30-60s
- **Total**: ~5-10 min (première fois), ~2-3 min (incrémental)

---

## 📞 Support

- **Issues**: GitHub Issues
- **Docs**: `/docs`
- **Changelog**: `CHANGELOG_v9.0.0.md`
- **Rapport déploiement**: `DEPLOYMENT_REPORT_v9.0.0.md`

---

**TITANE∞ v9 — Déploiement Officiel : Activé, Stable, Fonctionnel.**
