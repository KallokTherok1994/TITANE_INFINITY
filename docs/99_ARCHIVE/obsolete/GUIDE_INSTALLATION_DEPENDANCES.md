# 📦 Installation des Dépendances Système - TITANE∞ v15.5

## ⚠️ Accès Root Requis

L'installation des dépendances système nécessite des privilèges administrateur. Plusieurs méthodes sont disponibles selon votre système :

---

## 🚀 Méthode 1: Script Automatique (Recommandé)

### Exécution
```bash
cd /home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY
./INSTALL_DEPENDENCIES.sh
```

Le script détecte automatiquement votre gestionnaire de paquets (apt-get, dnf, pacman) et installe toutes les dépendances nécessaires.

---

## 🔧 Méthode 2: Installation Manuelle

### Pour Ubuntu/Debian/Pop!_OS
```bash
sudo apt-get update
sudo apt-get install -y \
  libwebkit2gtk-4.1-dev \
  libjavascriptcoregtk-4.1-dev \
  libgtk-3-dev \
  libsoup-3.0-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  patchelf \
  libssl-dev \
  pkg-config \
  build-essential \
  curl \
  wget
```

### Pour Fedora/RHEL
```bash
sudo dnf install -y \
  webkit2gtk4.1-devel \
  gtk3-devel \
  libsoup3-devel \
  libappindicator-gtk3-devel \
  librsvg2-devel \
  patchelf \
  openssl-devel \
  pkg-config \
  gcc \
  gcc-c++ \
  make
```

### Pour Arch Linux
```bash
sudo pacman -S --noconfirm \
  webkit2gtk-4.1 \
  gtk3 \
  libsoup3 \
  libappindicator-gtk3 \
  librsvg \
  patchelf \
  openssl \
  pkg-config \
  base-devel
```

---

## 🔍 Vérification Post-Installation

```bash
# Vérifier webkit2gtk
pkg-config --exists webkit2gtk-4.1 && echo "✅ WebKitGTK 4.1" || echo "❌ Manquant"

# Vérifier GTK3
pkg-config --modversion gtk+-3.0

# Vérifier libsoup
pkg-config --modversion libsoup-3.0

# Lister toutes les dépendances
pkg-config --list-all | grep -E "webkit|gtk|soup"
```

---

## ⚠️ Si `sudo` n'est pas disponible

### Option A: Utiliser `pkexec`
```bash
pkexec apt-get update
pkexec apt-get install -y libwebkit2gtk-4.1-dev [...]
```

### Option B: Session Root
```bash
su -
apt-get update
apt-get install -y libwebkit2gtk-4.1-dev [...]
exit
```

### Option C: Demander à l'administrateur système
Si vous êtes sur un système multi-utilisateur, contactez votre administrateur pour installer ces paquets.

---

## 🐛 Dépannage

### Problème: `libwebkit2gtk-4.1-dev` introuvable

**Solution 1**: Utiliser la version 4.0 (compatible Tauri)
```bash
sudo apt-get install -y libwebkit2gtk-4.0-dev libjavascriptcoregtk-4.0-dev
```

Puis modifier `src-tauri/Cargo.toml`:
```toml
[dependencies]
webkit2gtk = { version = "2.0", features = ["v2_38"] }
```

**Solution 2**: Ajouter le dépôt Ubuntu latest
```bash
sudo add-apt-repository ppa:webkit-team/ppa
sudo apt-get update
sudo apt-get install -y libwebkit2gtk-4.1-dev
```

### Problème: Erreurs de compilation persistantes

**Vérifier les versions installées**:
```bash
dpkg -l | grep webkit
dpkg -l | grep gtk-3
```

**Réinstaller les paquets de développement**:
```bash
sudo apt-get install --reinstall libwebkit2gtk-4.1-dev
```

**Nettoyer le cache Cargo**:
```bash
cd src-tauri
cargo clean
cargo build --release
```

---

## ✅ Après Installation

### Compiler le Backend
```bash
cd /home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY/src-tauri
cargo build --release
```

### Build Complet
```bash
cd /home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY
npm run tauri build
```

### Lancer l'Application
```bash
npm run tauri:dev
```

---

## 📊 État Actuel du Système

| Composant | Version | Statut |
|-----------|---------|--------|
| **Frontend** | 15.5.0 | ✅ Build OK |
| **TypeScript** | 0 erreurs | ✅ Compilé |
| **Vite** | 6.4.1 | ✅ Opérationnel |
| **Backend Rust** | 15.5.0 | ⏳ Attente dépendances |
| **Tauri** | 2.0 | ⏳ Attente dépendances |

---

## 🔗 Ressources

- **Tauri Prerequisites**: https://v2.tauri.app/start/prerequisites/
- **WebKitGTK**: https://webkitgtk.org/
- **Documentation TITANE∞**: `VALIDATION_FINALE_v15.5.md`

---

## 📝 Commandes Rapides

```bash
# Tout en une fois (Ubuntu/Debian)
sudo apt-get update && sudo apt-get install -y \
  libwebkit2gtk-4.1-dev libgtk-3-dev libsoup-3.0-dev \
  libayatana-appindicator3-dev librsvg2-dev patchelf \
  libssl-dev pkg-config build-essential

# Puis compiler
cd /home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY
cargo build --release -p titane-infinity
npm run tauri build
```

---

**Note**: L'absence de `sudo` dans votre terminal indique soit un environnement restreint, soit une configuration système particulière. Si vous ne pouvez pas utiliser `sudo` ou `pkexec`, vous devrez demander à un administrateur d'installer ces paquets pour vous.
