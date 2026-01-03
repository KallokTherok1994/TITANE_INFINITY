# 🔧 Guide d'Installation des Dépendances WebKit — TITANE∞ v∞

**Date**: 24 novembre 2025
**Objectif**: Résoudre le blocage de compilation Tauri lié aux bibliothèques WebKit manquantes

---

## 🚨 Diagnostic du Problème

### Erreur de Linking Rust
```
rust-lld: error: unable to find library -lwebkit2gtk-4.1
rust-lld: error: unable to find library -ljavascriptcoregtk-4.1
```

### Cause
Tauri 2.0 nécessite les bibliothèques de développement WebKit GTK pour compiler l'interface native. Ces bibliothèques ne sont pas présentes dans les environnements Flatpak isolés ou les installations minimales Linux.

---

## 📦 Installation par Distribution

### Ubuntu / Debian / Pop!_OS (Recommandé)

```bash
# Mettre à jour les dépôts
sudo apt update

# Installer WebKit 4.1 + dépendances Tauri
sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  libjavascriptcoregtk-4.1-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  patchelf

# Vérifier l'installation
pkg-config --exists webkit2gtk-4.1 && echo "✅ WebKit 4.1 installé"
```

**Alternative (WebKit 4.0 - Legacy)** :
```bash
sudo apt install -y \
  libwebkit2gtk-4.0-dev \
  libjavascriptcoregtk-4.0-dev
```

### Fedora / RHEL / CentOS

```bash
# Installer WebKit GTK 4.1
sudo dnf install -y \
  webkit2gtk4.1-devel \
  gtk3-devel \
  libappindicator-gtk3-devel \
  librsvg2-devel

# Vérifier
pkg-config --exists webkit2gtk-4.1 && echo "✅ WebKit 4.1 installé"
```

### Arch Linux / Manjaro

```bash
# Installer via pacman
sudo pacman -S --needed \
  webkit2gtk-4.1 \
  gtk3 \
  libappindicator-gtk3 \
  librsvg

# Vérifier
pkg-config --exists webkit2gtk-4.1 && echo "✅ WebKit 4.1 installé"
```

### openSUSE

```bash
# Installer via zypper
sudo zypper install -y \
  webkit2gtk3-devel \
  gtk3-devel \
  libappindicator3-devel \
  librsvg-devel

# Vérifier
pkg-config --exists webkit2gtk-4.1 && echo "✅ WebKit installé"
```

### NixOS

```nix
# Ajouter à configuration.nix
environment.systemPackages = with pkgs; [
  webkitgtk_4_1
  gtk3
  libappindicator
  librsvg
];
```

Ou dans `shell.nix` pour un environnement dev :
```nix
{ pkgs ? import <nixpkgs> {} }:
pkgs.mkShell {
  buildInputs = with pkgs; [
    webkitgtk_4_1
    gtk3
    pkg-config
    openssl
  ];
}
```

---

## 🐳 Solution Docker (Multi-Distribution)

### Dockerfile Complet

Créer `Dockerfile.tauri-full` :

```dockerfile
FROM rust:1.91.1

# Installation dépendances système
RUN apt-get update && apt-get install -y \
    libwebkit2gtk-4.1-dev \
    libjavascriptcoregtk-4.1-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    patchelf \
    curl \
    wget \
    file \
    libssl-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Installation Node.js 20.x
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Installation pnpm
RUN pnpm install -g pnpm

# Installation Tauri CLI
RUN cargo install tauri-cli --version "^2.0"

WORKDIR /workspace

CMD ["/bin/bash"]
```

### Utilisation

```bash
# Build l'image
docker build -f Dockerfile.tauri-full -t titane-infinity-builder .

# Compiler le projet
docker run --rm -v $(pwd):/workspace titane-infinity-builder \
  bash -c "cd /workspace && pnpm install && pnpm tauri build"
```

---

## 🛠️ Scripts de Build Automatisés

### Script Universal (build_with_deps.sh)

Créer `build_with_deps.sh` :

```bash
#!/bin/bash
set -e

echo "🔍 Détection de la distribution..."

# Détecter la distribution
if [ -f /etc/os-release ]; then
    . /etc/os-release
    DISTRO=$ID
else
    echo "❌ Distribution non reconnue"
    exit 1
fi

echo "✅ Distribution détectée: $DISTRO"

# Installation selon la distribution
case "$DISTRO" in
    ubuntu|debian|pop)
        echo "📦 Installation via apt..."
        sudo apt update
        sudo apt install -y \
            libwebkit2gtk-4.1-dev \
            libjavascriptcoregtk-4.1-dev \
            libgtk-3-dev \
            libayatana-appindicator3-dev \
            librsvg2-dev
        ;;
    fedora|rhel|centos)
        echo "📦 Installation via dnf..."
        sudo dnf install -y \
            webkit2gtk4.1-devel \
            gtk3-devel \
            libappindicator-gtk3-devel \
            librsvg2-devel
        ;;
    arch|manjaro)
        echo "📦 Installation via pacman..."
        sudo pacman -S --needed --noconfirm \
            webkit2gtk-4.1 \
            gtk3 \
            libappindicator-gtk3 \
            librsvg
        ;;
    opensuse*)
        echo "📦 Installation via zypper..."
        sudo zypper install -y \
            webkit2gtk3-devel \
            gtk3-devel \
            libappindicator3-devel \
            librsvg-devel
        ;;
    *)
        echo "❌ Distribution non supportée: $DISTRO"
        echo "ℹ️  Installer manuellement webkit2gtk-4.1-dev"
        exit 1
        ;;
esac

# Vérification
echo ""
echo "🔍 Vérification de l'installation..."
if pkg-config --exists webkit2gtk-4.1; then
    echo "✅ WebKit 4.1 correctement installé"
    pkg-config --modversion webkit2gtk-4.1
else
    echo "❌ WebKit 4.1 non détecté"
    exit 1
fi

echo ""
echo "🚀 Lancement de la compilation Tauri..."
cd "$(dirname "$0")"
pnpm run tauri build
```

Rendre exécutable :
```bash
chmod +x build_with_deps.sh
./build_with_deps.sh
```

---

## 🧪 Vérification Post-Installation

### Test 1 : pkg-config

```bash
# Vérifier présence WebKit
pkg-config --exists webkit2gtk-4.1 && echo "✅ OK" || echo "❌ MANQUANT"

# Afficher version
pkg-config --modversion webkit2gtk-4.1

# Lister toutes les libs WebKit
pkg-config --list-all | grep webkit
```

### Test 2 : Compilation Rust Simple

Créer `test_webkit.rs` :
```rust
fn main() {
    println!("Testing WebKit linking...");
}
```

Compiler avec linking WebKit :
```bash
rustc test_webkit.rs -L /usr/lib/x86_64-linux-gnu -l webkit2gtk-4.1
./test_webkit && echo "✅ Linking OK"
```

### Test 3 : Build Tauri Complet

```bash
cd /home/titane/Documents/TITANE_INFINITY
pnpm run tauri build 2>&1 | tee build.log
grep -i "error" build.log || echo "✅ Build réussi"
```

---

## 🚧 Cas Particuliers

### Environnement Flatpak (Problème Actuel)

**Problème** : Flatpak runtime isole les bibliothèques système.

**Solutions** :

1. **Sortir de Flatpak** (recommandé) :
   ```bash
   # Ouvrir terminal hôte (pas flatpak)
   # Vérifier : echo $container (doit être vide)
   cd /home/titane/Documents/TITANE_INFINITY
   ./build_with_deps.sh
   ```

2. **Installer dans Flatpak SDK** (avancé) :
   ```bash
   flatpak install flathub org.freedesktop.Sdk.Extension.rust-stable//23.08
   flatpak install flathub org.webkit.WebKit2
   ```

3. **Build via Host Script** :
   ```bash
   # Utiliser script existant
   ./build_on_host.sh
   ```

### WSL2 (Windows Subsystem for Linux)

```bash
# Activer systemd si nécessaire
sudo -e /etc/wsl.conf
# Ajouter :
# [boot]
# systemd=true

# Installer dépendances Ubuntu
sudo apt update
sudo apt install -y \
    libwebkit2gtk-4.1-dev \
    libjavascriptcoregtk-4.1-dev \
    libgtk-3-dev \
    build-essential

# Build
pnpm run tauri build
```

### GitHub Actions / CI

Exemple workflow `.github/workflows/build.yml` :

```yaml
name: Build Tauri
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install WebKit Dependencies
        run: |
          sudo apt update
          sudo apt install -y \
            libwebkit2gtk-4.1-dev \
            libjavascriptcoregtk-4.1-dev \
            libgtk-3-dev \
            libayatana-appindicator3-dev \
            librsvg2-dev

      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Dependencies
        run: pnpm install

      - name: Build Tauri
        run: pnpm run tauri build
```

---

## 📋 Checklist de Résolution

- [ ] Identifier la distribution Linux (`cat /etc/os-release`)
- [ ] Exécuter commande d'installation appropriée
- [ ] Vérifier avec `pkg-config --exists webkit2gtk-4.1`
- [ ] Tester compilation : `cd src-tauri && cargo build`
- [ ] Si succès, build complet : `pnpm run tauri build`
- [ ] Vérifier binaire : `./src-tauri/target/release/titane-infinity --version`

---

## 🆘 Résolution des Problèmes

### Erreur : "Package webkit2gtk-4.1 was not found"

```bash
# Vérifier installations disponibles
apt search webkit2gtk | grep webkit2gtk-4

# Si seulement 4.0 disponible, modifier Cargo.toml
# Ou forcer version 4.0 :
sudo apt install libwebkit2gtk-4.0-dev
```

### Erreur : "unable to find library -lgtk-3"

```bash
# Installer GTK3 complet
sudo apt install -y libgtk-3-dev gtk+3.0
```

### Erreur : "permission denied"

```bash
# Vérifier droits sudo
sudo -v

# Ou utiliser Docker (sans sudo nécessaire)
docker run --rm -v $(pwd):/workspace titane-infinity-builder \
  bash -c "cd /workspace && cargo build"
```

---

## 📚 Ressources Supplémentaires

- **Tauri Prerequisites** : https://tauri.app/v1/guides/getting-started/prerequisites
- **WebKit GTK Docs** : https://webkitgtk.org/
- **Rust Linking Guide** : https://doc.rust-lang.org/rustc/command-line-arguments.html#linking

---

## ✅ Validation Finale

Après installation, exécuter :

```bash
# Test complet
cd /home/titane/Documents/TITANE_INFINITY

# Nettoyage
rm -rf src-tauri/target node_modules

# Installation fresh
pnpm install

# Build
pnpm run tauri build

# Si succès :
echo "🎉 TITANE∞ v19.1.0 build réussi !"
./src-tauri/target/release/titane-infinity
```

---

**Guide créé** : 24 novembre 2025
**Version TITANE∞** : v19.1.0
**Auteur** : TITANE Team
**Statut** : ✅ Production Ready
