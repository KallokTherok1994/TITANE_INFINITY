# 🔩 TITANE∞ - SETUP TAURI (HORS FLATPAK)

## ⚠️ PROBLÈME DÉTECTÉ

Vous êtes actuellement dans un **environnement Flatpak** (Freedesktop SDK 25.08).
Cet environnement conteneurisé **ne permet PAS** de compiler Tauri car :

- ❌ Pas d'accès aux bibliothèques système (WebKit, GTK)
- ❌ Pas de `sudo` ou `su` pour installer des paquets
- ❌ Isolation du système hôte

## ✅ SOLUTION : Terminal Natif

### 1. Ouvrir un VRAI Terminal Linux

**Sur Pop!_OS :**
```bash
# Option A : Raccourci clavier
Super + T

# Option B : Chercher "Terminal" dans le menu applications
# Option C : GNOME Terminal depuis le dash
```

### 2. Vérifier que vous êtes HORS Flatpak

```bash
cat /etc/os-release
# Doit afficher "Pop!_OS" ou "Ubuntu", PAS "Freedesktop SDK"

whoami
# Doit afficher votre nom d'utilisateur

which sudo
# Doit afficher : /usr/bin/sudo
```

### 3. Installer les Dépendances Tauri v2

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
  curl \
  wget \
  file
```

### 4. Vérifier l'Installation

```bash
pkg-config --modversion webkit2gtk-4.1
# Doit afficher une version (ex: 2.44.2)

pkg-config --modversion javascriptcoregtk-4.1
# Doit afficher une version
```

### 5. Lancer TITANE∞ en Mode Tauri

```bash
cd /home/titane/Documents/TITANE_INFINITY
./dev_tauri.sh
```

**Résultat attendu :**
```
🌌 TITANE∞ v17.3 - Démarrage mode développement
✅ Ports 1420 et 1421 libérés
🚀 Lancement de Tauri + Vite...
   → Vite dev server: http://localhost:1420

  VITE v6.4.1  ready in 168 ms
  ➜  Local:   http://127.0.0.1:1420/

   Compiling titane-infinity v19.1.0
   Finished `dev` profile in 45.2s

[Fenêtre Tauri s'ouvre avec TITANE∞]
```

---

## 🎯 PRÉFÉRENCE SYSTÈME ENREGISTRÉE

> **TITANE∞ DOIT TOUJOURS ÊTRE DÉVELOPPÉ ET DÉPLOYÉ EN TAURI**

### Pourquoi Tauri ?

1. **Performance** : Application native (~15 MB vs navigateur)
2. **Sécurité** : Sandbox OS, pas d'injection XSS
3. **Desktop-First** : Accès filesystem, notifications système
4. **Cross-Platform** : Linux, Windows, macOS depuis un seul code
5. **Moderne** : Rust backend + React frontend

### Architecture TITANE∞

```
TITANE_INFINITY/
├── src/                    # Frontend React + TypeScript
│   ├── components/         # Composants UI
│   ├── styles/             # Design System v24 CSS
│   │   └── titane-design-system-v24.css  ⭐
│   └── main.tsx            # Entry point
│
├── src-tauri/              # Backend Rust Tauri
│   ├── src/                # Code Rust
│   ├── tauri.conf.json     # Config Tauri
│   └── Cargo.toml          # Dépendances Rust
│
├── dev_tauri.sh            # 🚀 Script de dev (PORT 1420)
└── build_production.sh     # 📦 Build production
```

---

## 📋 CHECKLIST PRÉ-LANCEMENT

- [ ] Êtes-vous dans un **vrai terminal** (pas Flatpak) ?
- [ ] `sudo` fonctionne-t-il ?
- [ ] WebKit 2 GTK 4.1 est-il installé ?
- [ ] Node.js + pnpm sont-ils installés ?
- [ ] Rust + Cargo sont-ils installés ?

### Installer Rust (si nécessaire)

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

### Installer Node + pnpm (si nécessaire)

```bash
# Node.js via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# pnpm
npm install -g pnpm
```

---

## 🔧 DÉPANNAGE

### Erreur : `unable to find library -lwebkit2gtk-4.1`

**Solution :**
```bash
sudo apt-get install libwebkit2gtk-4.1-dev libjavascriptcoregtk-4.1-dev
```

### Erreur : Port 1420 déjà utilisé

**Solution :**
```bash
lsof -ti:1420 | xargs -r kill -9
```

### Erreur : `command not found: tauri`

**Solution :**
```bash
pnpm install
# Tauri CLI est installé comme dépendance locale
```

### Performance : Fenêtre blanche au lancement

**Solution :**
- Le design system v24 est chargé depuis `main.tsx`
- Vérifier que `titane-design-system-v24.css` existe
- Ouvrir DevTools (F12) → Console pour diagnostiquer

---

## 🚀 COMMANDES PRINCIPALES

```bash
# Développement (HOT RELOAD)
./dev_tauri.sh

# Build production (.deb, .AppImage, .dmg)
./build_production.sh

# Clean cache
rm -rf src-tauri/target/
rm -rf node_modules/
pnpm install

# Tests
pnpm test

# Lint
pnpm lint
```

---

## 🎨 DESIGN SYSTEM v24 INTÉGRÉ

Le **thème métallique monochrome** est automatiquement chargé :

- **Fichier** : `src/styles/titane-design-system-v24.css`
- **Import** : `src/main.tsx` ligne 4
- **Couleurs** : #727b81 (primary), #c4c4c4 (light), #93b399 (accent)
- **Style** : HUD technologique, Tron Legacy, Vercel AI

Tous les composants utilisent les tokens CSS variables :
```css
var(--text-primary)
var(--bg-card)
var(--metal-primary-500)
```

---

🔩 **TITANE∞ v24 — TAURI FIRST, ALWAYS** 🔩
