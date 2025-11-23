# 🚀 Guide de déploiement rapide - TITANE∞ v17.3.0

## 📋 Prérequis

### Système (Linux)
```bash
# Vérifier dépendances système
dpkg -l | grep -E "libwebkit2gtk-4.1-dev|libjavascriptcoregtk-4.1-dev"

# Installer si manquantes
sudo apt-get update
sudo apt-get install -y \
  libwebkit2gtk-4.1-dev \
  libjavascriptcoregtk-4.1-dev \
  build-essential \
  curl \
  wget \
  libssl-dev
```

### Tools
```bash
# Node.js 20+
node --version  # doit être >= 20.0.0

# pnpm 9+
pnpm --version  # doit être >= 9.0.0

# Rust stable
rustc --version  # doit être >= 1.70.0
cargo --version

# Tauri CLI (installé via pnpm)
pnpm tauri --version
```

---

## 🔨 Build production local

### Méthode 1: Script automatique (recommandé)

```bash
# Build Linux complet (deb + AppImage + rpm)
./scripts/deploy-production.sh

# Build spécifique
./scripts/deploy-production.sh --bundle deb
./scripts/deploy-production.sh --bundle appimage

# Build avec signature + upload GitHub
./scripts/deploy-production.sh --sign --upload

# Mode verbose pour debugging
./scripts/deploy-production.sh --verbose
```

### Méthode 2: Commandes manuelles

```bash
# 1. Nettoyer builds précédents
rm -rf dist/ src-tauri/target/release/

# 2. Build frontend Vite
pnpm run build

# 3. Build Tauri production
pnpm tauri build --verbose

# Artefacts générés dans:
# - src-tauri/target/release/bundle/deb/
# - src-tauri/target/release/bundle/appimage/
# - src-tauri/target/release/bundle/rpm/
```

### Méthode 3: Build bundles spécifiques

```bash
# Uniquement .deb
pnpm tauri build --bundles deb

# Uniquement .AppImage
pnpm tauri build --bundles appimage

# Uniquement .rpm
pnpm tauri build --bundles rpm

# Plusieurs formats
pnpm tauri build --bundles deb,appimage
```

---

## 📦 Artefacts générés

### Structure
```
src-tauri/target/release/
├── titane-infinity                    # Binary Linux (ELF)
└── bundle/
    ├── deb/
    │   └── titane-infinity_17.3.0_amd64.deb          # ~15-20 MB
    ├── appimage/
    │   └── titane-infinity_17.3.0_amd64.AppImage     # ~25-30 MB
    └── rpm/
        └── titane-infinity-17.3.0-1.x86_64.rpm       # ~15-20 MB
```

### Checksums
```bash
cd src-tauri/target/release/bundle/
sha256sum deb/*.deb appimage/*.AppImage rpm/*.rpm > SHA256SUMS.txt
cat SHA256SUMS.txt
```

---

## 🧪 Test des artefacts

### .deb (Debian/Ubuntu)
```bash
# Installation
sudo dpkg -i src-tauri/target/release/bundle/deb/titane-infinity_17.3.0_amd64.deb
sudo apt-get install -f  # Résoudre dépendances

# Lancer
titane-infinity

# Vérifier installation
dpkg -l | grep titane-infinity
which titane-infinity

# Désinstaller
sudo apt remove titane-infinity
```

### .AppImage (Portable)
```bash
cd src-tauri/target/release/bundle/appimage/

# Rendre exécutable
chmod +x titane-infinity_17.3.0_amd64.AppImage

# Lancer (aucune installation requise)
./titane-infinity_17.3.0_amd64.AppImage

# Tester dans un système propre
docker run -it --rm \
  -v $(pwd):/app \
  -e DISPLAY=$DISPLAY \
  -v /tmp/.X11-unix:/tmp/.X11-unix \
  ubuntu:22.04 \
  /app/titane-infinity_17.3.0_amd64.AppImage
```

### .rpm (RedHat/Fedora)
```bash
# Installation
sudo rpm -i src-tauri/target/release/bundle/rpm/titane-infinity-17.3.0-1.x86_64.rpm

# Lancer
titane-infinity

# Désinstaller
sudo rpm -e titane-infinity
```

---

## 🚀 Déploiement CI/CD GitHub Actions

### Prérequis GitHub
1. Repository public/private avec GitHub Actions activé
2. Secrets configurés (optionnel pour signature):
   - `TAURI_SIGNING_PRIVATE_KEY`
   - `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`
   - `GPG_PRIVATE_KEY` (Linux signing)
   - `APPLE_CERTIFICATE` (macOS signing)
   - `APPLE_ID` / `APPLE_PASSWORD` (macOS notarization)

### Déclencher un release

#### Via tag Git
```bash
# 1. Créer tag version
git tag v17.3.0 -m "Release v17.3.0 - Phase 8 Complete"

# 2. Pusher tag (déclenche CI/CD automatique)
git push origin v17.3.0

# 3. GitHub Actions va:
#    - Build Linux, Windows, macOS
#    - Générer tous les bundles
#    - Créer GitHub Release
#    - Upload tous les artefacts
```

#### Via workflow_dispatch (manuel)
```bash
# Interface GitHub:
# 1. Aller sur Actions → Production Release
# 2. Cliquer "Run workflow"
# 3. Choisir platform: linux / windows / macos / all
# 4. Click "Run"

# Ou via gh CLI:
gh workflow run release.yml -f platform=all
```

### Monitoring du build

```bash
# Suivre le workflow en temps réel
gh run watch

# Voir les logs
gh run view --log

# Télécharger les artifacts
gh run download
```

---

## 📊 Vérification post-build

### Métriques de qualité

```bash
# 1. Taille des binaries
du -sh src-tauri/target/release/bundle/deb/*.deb
du -sh src-tauri/target/release/bundle/appimage/*.AppImage

# 2. Dépendances du binary
ldd src-tauri/target/release/titane-infinity

# 3. Sections du binary
readelf -S src-tauri/target/release/titane-infinity

# 4. Symboles (doivent être stripped en release)
nm src-tauri/target/release/titane-infinity | wc -l  # Doit être minimal

# 5. Analyser taille avec cargo-bloat
cargo install cargo-bloat
cargo bloat --release --crates -n 20
```

### Tests de validation

```bash
# 1. Lancer l'app
./src-tauri/target/release/titane-infinity &
APP_PID=$!

# 2. Vérifier qu'elle démarre
sleep 5
ps -p $APP_PID || echo "ERROR: App crashed"

# 3. Vérifier usage mémoire
ps -o pid,rss,vsz,cmd -p $APP_PID
# RSS doit être < 100 MB

# 4. Vérifier logs
journalctl -f | grep titane-infinity

# 5. Killer proprement
kill $APP_PID
```

---

## 🔐 Signature de code

### Linux (GPG)

```bash
# 1. Générer clé GPG (si pas déjà fait)
gpg --full-generate-key

# 2. Exporter clé publique
gpg --export -a "Your Name" > public.key

# 3. Signer .deb
dpkg-sig --sign builder src-tauri/target/release/bundle/deb/*.deb

# 4. Vérifier signature
dpkg-sig --verify src-tauri/target/release/bundle/deb/*.deb
```

### Windows (signtool)

```powershell
# Nécessite certificat code signing (.pfx)
signtool sign /f certificate.pfx /p PASSWORD /t http://timestamp.digicert.com /fd SHA256 titane-infinity.exe

# Vérifier
signtool verify /pa titane-infinity.exe
```

### macOS (codesign)

```bash
# 1. Signer l'app bundle
codesign --deep --force --verify --verbose \
  --sign "Developer ID Application: YOUR NAME" \
  --options runtime \
  "TITANE∞.app"

# 2. Notariser avec Apple
xcrun notarytool submit titane-infinity.dmg \
  --apple-id YOUR_EMAIL \
  --password YOUR_APP_PASSWORD \
  --team-id YOUR_TEAM_ID \
  --wait

# 3. Stapler le ticket
xcrun stapler staple "TITANE∞.app"

# 4. Vérifier
codesign --verify --deep --strict --verbose=2 "TITANE∞.app"
spctl --assess --verbose "TITANE∞.app"
```

---

## 📤 Distribution

### 1. GitHub Releases (automatique via CI/CD)

```bash
# Les artefacts sont automatiquement uploadés vers:
# https://github.com/KallokTherok1994/TITANE_INFINITY/releases/tag/v17.3.0

# Users peuvent télécharger directement
# Auto-updater Tauri peut utiliser latest.json
```

### 2. CDN custom (optionnel)

```bash
# Upload vers S3/CloudFront
aws s3 sync src-tauri/target/release/bundle/ \
  s3://releases.titane.com/v17.3.0/ \
  --acl public-read

# Mettre à jour latest.json
aws s3 cp latest.json s3://releases.titane.com/latest.json \
  --acl public-read \
  --cache-control "max-age=300"
```

### 3. Package repositories

#### Debian repository
```bash
# Setup repository avec reprepro ou aptly
# https://wiki.debian.org/DebianRepository/Setup
```

#### Flatpak
```bash
# Package en Flatpak pour Flathub
# https://docs.flatpak.org/en/latest/
```

#### Snap
```bash
# Package en Snap pour Snapcraft
snapcraft init
snapcraft
sudo snap install titane-infinity_17.3.0_amd64.snap --dangerous
```

---

## 🔄 Auto-update

### Configuration Tauri

Dans `src-tauri/tauri.conf.json`:
```json
{
  "updater": {
    "active": true,
    "endpoints": [
      "https://releases.titane.com/latest.json",
      "https://github.com/KallokTherok1994/TITANE_INFINITY/releases/latest/download/latest.json"
    ],
    "dialog": true,
    "pubkey": "YOUR_PUBLIC_KEY_HERE"
  }
}
```

### Génération des clés de signature

```bash
# Générer paire de clés pour updater
pnpm tauri signer generate -w ~/.tauri/titane-infinity.key

# Ajouter la clé publique dans tauri.conf.json
# Ajouter la clé privée dans secrets GitHub (TAURI_SIGNING_PRIVATE_KEY)
```

### Test de l'auto-update

```rust
// src-tauri/src/main.rs
#[tauri::command]
async fn check_for_updates(app: tauri::AppHandle) -> Result<String, String> {
    let update_available = app.updater()
        .check()
        .await
        .map_err(|e| e.to_string())?;
    
    if let Some(update) = update_available {
        update.download_and_install().await
            .map_err(|e| e.to_string())?;
        Ok(format!("Updated to v{}", update.version))
    } else {
        Ok("Already up to date".to_string())
    }
}
```

---

## 🐛 Troubleshooting

### Build échoue avec "webkit2gtk not found"
```bash
# Installer dépendances manquantes
sudo apt-get install -y \
  libwebkit2gtk-4.1-dev \
  libjavascriptcoregtk-4.1-dev

# Ou pour webkit2gtk-4.0 (ancienne version)
sudo apt-get install -y \
  libwebkit2gtk-4.0-dev \
  libjavascriptcoregtk-4.0-dev
```

### Build Rust très lent
```bash
# Activer cache Rust
export CARGO_INCREMENTAL=1

# Utiliser sccache (cache distribué)
cargo install sccache
export RUSTC_WRAPPER=sccache

# Augmenter parallélisme
export CARGO_BUILD_JOBS=$(nproc)
```

### Binary trop gros
```bash
# Vérifier les optimisations dans Cargo.toml
[profile.release]
opt-level = "z"        # Optimiser pour taille (au lieu de 3)
lto = true
strip = true
codegen-units = 1

# Rebuild
cargo clean
pnpm tauri build
```

### .AppImage ne lance pas
```bash
# Vérifier FUSE
sudo apt-get install fuse libfuse2

# Extraire et lancer directement
./titane-infinity_17.3.0_amd64.AppImage --appimage-extract
./squashfs-root/AppRun

# Tester avec appimage-extract-and-run
./titane-infinity_17.3.0_amd64.AppImage --appimage-extract-and-run
```

### Erreur "Failed to load shared libraries"
```bash
# Lister dépendances manquantes
ldd src-tauri/target/release/titane-infinity | grep "not found"

# Installer bibliothèques manquantes
sudo apt-get install -y <missing-lib>
```

---

## 📈 Checklist de déploiement

### Pre-deployment
- [ ] Code review complète
- [ ] Tous les tests passent (`pnpm test`)
- [ ] Lint sans erreurs (`pnpm run lint`)
- [ ] Type-check OK (`pnpm run type-check`)
- [ ] Build local réussi
- [ ] Artefacts testés manuellement
- [ ] Documentation à jour
- [ ] CHANGELOG.md mis à jour
- [ ] Version bumped dans package.json et Cargo.toml

### Deployment
- [ ] Tag Git créé (`git tag v17.3.0`)
- [ ] Tag pushé (`git push origin v17.3.0`)
- [ ] GitHub Actions workflow réussi
- [ ] Artefacts générés pour toutes plateformes
- [ ] Checksums SHA256 générés
- [ ] Code signing appliqué (si configuré)
- [ ] GitHub Release créée
- [ ] Release notes publiées

### Post-deployment
- [ ] Télécharger et tester chaque artefact
- [ ] Vérifier checksums
- [ ] Installer sur système propre
- [ ] Tester fonctionnalités critiques
- [ ] Vérifier auto-update (si activé)
- [ ] Monitor crash reports (Sentry)
- [ ] Monitor performance metrics
- [ ] Update documentation website
- [ ] Annoncer release (blog, social media)

---

## 🎯 Commandes utiles

```bash
# Vérifier version actuelle
pnpm tauri info

# Nettoyer complètement
pnpm tauri clean
cargo clean
rm -rf dist/ node_modules/

# Réinstaller tout
pnpm install --frozen-lockfile
pnpm tauri build

# Profiling Rust
cargo install flamegraph
cargo flamegraph --release

# Audit sécurité
cargo audit
pnpm audit

# Mettre à jour dépendances
cargo update
pnpm update

# Stats de build
cargo tree  # Arbre de dépendances Rust
pnpm list   # Arbre de dépendances Node
```

---

## 📚 Ressources

- [Documentation Tauri officielle](https://tauri.app/v2/guides/building/)
- [GitHub Actions Workflows](https://docs.github.com/en/actions)
- [Cargo Book](https://doc.rust-lang.org/cargo/)
- [Guide déploiement complet](./DEPLOYMENT_PRODUCTION_TAURI_v17.3.0.md)

---

**TITANE∞ v17.3.0 - Prêt pour production!** 🚀
