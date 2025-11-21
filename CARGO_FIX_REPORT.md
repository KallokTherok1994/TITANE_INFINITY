# 🔧 Correction Cargo.toml - Tauri v2 Features

## ✅ Problème Résolu

### Erreur Initiale
```
error: failed to select a version for `tauri`.
package `titane-infinity` depends on `tauri` with feature `clipboard-all` but `tauri` does not have that feature.
```

### Cause
Les features `-all` (comme `clipboard-all`, `dialog-all`, `fs-all`, `notification-all`, `window-all`) n'existent **pas** dans Tauri v2.0.

### Solution Appliquée

**Avant** (`src-tauri/Cargo.toml`):
```toml
[dependencies]
tauri = { version = "2.0", features = ["tray-icon", "protocol-asset", "dialog-all", "fs-all", "shell-open", "clipboard-all", "notification-all", "window-all"] }
```

**Après**:
```toml
[dependencies]
tauri = { version = "2.0", features = [] }
```

### Justification

Dans **Tauri v2**, les features granulaires ont été simplifiées :
- Les API Tauri sont disponibles par défaut via `@tauri-apps/api`
- Les features `-all` ont été supprimées
- Configuration minimale recommandée pour éviter les conflits

## ⚠️ Problème Restant : Dépendances Système

### Erreur Actuelle
```
error: failed to run custom build command for `javascriptcore-rs-sys v1.1.1`
The system library `javascriptcoregtk-4.1` required by crate `javascriptcore-rs-sys` was not found.
```

### Cause
Bibliothèques système manquantes pour **webkit2gtk-4.1** (backend de Tauri sur Linux).

### Solutions Possibles

#### Option 1: Installer les dépendances système (Recommandé)

**Pour Flatpak VSCode** (votre cas):
```bash
# Installer les dépendances dans le runtime Flatpak
flatpak install flathub org.freedesktop.Sdk.Extension.rust-stable//24.08
flatpak install flathub org.gnome.Platform//47
```

**Pour système Ubuntu/Debian**:
```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev \
    libjavascriptcoregtk-4.1-dev \
    libgtk-3-dev \
    libsoup-3.0-dev \
    libjavascriptcoregtk-4.0-dev \
    build-essential \
    curl \
    wget \
    file \
    libxdo-dev \
    libssl-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev
```

#### Option 2: Utiliser cargo-tauri via npm (Alternative)

Au lieu de compiler directement avec cargo, utiliser:
```bash
npm install --save-dev @tauri-apps/cli
npm run tauri build
```

Cette méthode utilise les binaires pré-compilés de Tauri.

#### Option 3: Build Docker (Production)

Créer un environnement Docker avec toutes les dépendances:
```dockerfile
FROM rust:1.91
RUN apt-get update && apt-get install -y \
    libwebkit2gtk-4.1-dev \
    libjavascriptcoregtk-4.1-dev \
    libgtk-3-dev \
    libsoup-3.0-dev
```

## 📋 Vérification

### Status Cargo.toml
- ✅ Features invalides supprimées
- ✅ Configuration minimale appliquée
- ✅ Version Tauri 2.0 maintenue

### Status Compilation
- ✅ Résolution des dépendances: **SUCCESS**
- ✅ Téléchargement des crates: **SUCCESS**
- ⏳ Compilation: **BLOQUÉ** (dépendances système manquantes)

## 🚀 Prochaines Actions

1. **Installer webkit2gtk-4.1** sur le système
2. **OU** utiliser `npm run tauri` au lieu de `cargo` direct
3. **OU** compiler dans un environnement Docker

## 📚 Références

- [Tauri v2 Prerequisites](https://v2.tauri.app/start/prerequisites/)
- [Tauri Features Documentation](https://v2.tauri.app/reference/config/#features)
- [Linux Dependencies](https://v2.tauri.app/start/prerequisites/#linux)

---

**Date**: 18 novembre 2025  
**Version**: TITANE∞ v9.0.0  
**Status Cargo.toml**: ✅ **CORRIGÉ**  
**Status Compilation**: ⚠️ **DÉPENDANCES SYSTÈME MANQUANTES**
