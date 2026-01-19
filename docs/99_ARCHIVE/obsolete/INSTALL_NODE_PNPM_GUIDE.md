# 📦 TITANE∞ — GUIDE D'INSTALLATION NODE.JS + PNPM

**Objectif** : Installer l'environnement Node.js pour lancer le frontend Tauri

---

## 🎯 Méthode Recommandée : nvm (Node Version Manager)

### 1. Installer nvm

```bash
# Télécharger et installer nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# OU avec wget
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

### 2. Charger nvm dans le shell

```bash
# Ajouter au .bashrc (si pas déjà fait par l'installer)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Recharger .bashrc
source ~/.bashrc

# Vérifier installation nvm
nvm --version
# → 0.39.7
```

### 3. Installer Node.js

```bash
# Installer dernière version LTS (Long Term Support)
nvm install --lts

# OU installer version spécifique
nvm install 20

# Utiliser la version installée
nvm use 20

# Vérifier installation
node --version
# → v20.11.0 (ou similaire)

npm --version
# → 10.x.x
```

### 4. Installer pnpm

```bash
# Via npm (fourni avec Node.js)
pnpm install -g pnpm

# Vérifier installation
pnpm --version
# → 8.15.0 (ou similaire)
```

---

## 🚀 Étapes Suivantes pour TITANE∞

### 1. Installer dépendances du projet

```bash
cd /home/titane/Documents/TITANE_INFINITY

# Installer toutes les dépendances
pnpm install

# Devrait installer :
# - React + Vite
# - @tauri-apps/api
# - TypeScript
# - TailwindCSS
# - Toutes autres dépendances package.json
```

### 2. Lancer mode développement Tauri

```bash
# Option 1 : Via pnpm script
pnpm run tauri dev

# Option 2 : Via cargo directement
cargo tauri dev

# Devrait démarrer :
# 1. Serveur Vite (frontend React) sur http://localhost:1420
# 2. Application Tauri (fenêtre native avec backend Rust)
```

### 3. Vérifier logs console

**Console backend (terminal)** :
```
>>> TITANE∞ BACKEND STARTING...
[INFO] Persona Engine v24 initialized ✅
[INFO] TITANE∞ Backend ready ✅
```

**Console frontend (DevTools F12)** :
```javascript
🌟 TITANE∞ v24 - Persona Engine (Rust/Tauri) Initialized
```

### 4. Tester commandes Tauri

**Dans DevTools (F12) → Console** :
```javascript
// Test 1 : Initialize
await window.__TAURI__.invoke('persona_initialize')
// → "Persona Engine initialized"

// Test 2 : Get State
await window.__TAURI__.invoke('persona_get_state')
// → { personality: {...}, mood: {...}, behavior: {...}, ... }

// Test 3 : Update
await window.__TAURI__.invoke('persona_update', {
  systemState: 'warning',
  cpu: 75.0,
  memory: 60.0,
  errors: 2
})
// → Updated PersonaState

// Test 4 : React
await window.__TAURI__.invoke('persona_react', {
  reactionType: 'error'
})
// → PersonaState with error reaction applied

// Test 5 : Get Multipliers
await window.__TAURI__.invoke('persona_get_multipliers')
// → { glow: 1.2, motion: 1.1, sound: 1.0, depth: 1.15 }
```

---

## 🐛 Troubleshooting

### Problème : `nvm: command not found`

**Solution** :
```bash
# Recharger le shell
source ~/.bashrc

# Ou redémarrer terminal
exit
# (ouvrir nouveau terminal)
```

### Problème : `pnpm install` échoue

**Solution 1 : Nettoyer cache** :
```bash
pnpm store prune
rm -rf node_modules
pnpm install
```

**Solution 2 : Utiliser npm** :
```bash
pnpm install
```

Puis modifier `src-tauri/tauri.conf.json` :
```json
"beforeDevCommand": "pnpm run dev",
"beforeBuildCommand": "pnpm run build",
```

### Problème : `cargo tauri dev` erreur `pnpm: commande introuvable`

**Solution** : Installer pnpm (voir étape 4 ci-dessus)

OU modifier tauri.conf.json pour utiliser npm :
```json
"beforeDevCommand": "pnpm run dev",
```

### Problème : Port 1420 déjà utilisé

**Solution** :
```bash
# Tuer processus sur port 1420
lsof -ti:1420 | xargs kill -9

# Relancer
pnpm run tauri dev
```

### Problème : Fenêtre Tauri ne s'ouvre pas

**Vérifications** :
1. Environnement graphique disponible (X11 / Wayland)
2. Dépendances système Tauri installées :

```bash
# Ubuntu/Debian
sudo apt install libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev

# Arch Linux
sudo pacman -S webkit2gtk \
    base-devel \
    curl \
    wget \
    file \
    openssl \
    appmenu-gtk-module \
    gtk3 \
    libappindicator-gtk3 \
    librsvg
```

---

## 🧪 Validation Complète

### Checklist Installation Node.js
- [ ] nvm installé (`nvm --version`)
- [ ] Node.js installé (`node --version`)
- [ ] npm disponible (`npm --version`)
- [ ] pnpm installé (`pnpm --version`)

### Checklist TITANE∞
- [ ] Dépendances installées (`pnpm install`)
- [ ] Backend Rust compile (`cargo check`)
- [ ] Frontend démarre (`pnpm run dev`)
- [ ] Tauri app démarre (`cargo tauri dev`)

### Checklist IPC Tauri
- [ ] Commande `persona_initialize` fonctionne
- [ ] Commande `persona_get_state` retourne état
- [ ] Commande `persona_update` met à jour état
- [ ] Commande `persona_react` trigger réaction
- [ ] Console frontend log "Rust/Tauri Initialized"

### Checklist UI
- [ ] Page DevTools accessible
- [ ] Living Engines Card s'affiche
- [ ] Mood value displayed (clair, neutre, etc.)
- [ ] Visual multipliers displayed (glow, motion, etc.)
- [ ] Aucune erreur console

---

## 🚀 Build Production

Une fois validation complète :

```bash
# Build release
cargo tauri build

# Résultat dans :
# src-tauri/target/release/bundle/
#   ├── appimage/titane-infinity_xxx_amd64.AppImage  (Linux)
#   ├── deb/titane-infinity_xxx_amd64.deb            (Debian/Ubuntu)
#   ├── rpm/titane-infinity-xxx.x86_64.rpm           (Fedora/RedHat)
#   └── (autres formats selon OS)
```

**Installer** :
```bash
# Linux (Debian/Ubuntu)
sudo dpkg -i src-tauri/target/release/bundle/deb/titane-infinity_*.deb

# Linux (AppImage)
chmod +x src-tauri/target/release/bundle/appimage/titane-infinity_*.AppImage
./src-tauri/target/release/bundle/appimage/titane-infinity_*.AppImage
```

---

## 📊 Résumé Installation

| Étape | Commande | Temps | Status |
|-------|----------|-------|--------|
| 1. Installer nvm | `curl ... \| bash` | 1 min | ⚠️ A faire |
| 2. Charger nvm | `source ~/.bashrc` | 1 sec | ⚠️ A faire |
| 3. Installer Node.js | `nvm install --lts` | 3 min | ⚠️ A faire |
| 4. Installer pnpm | `pnpm install -g pnpm` | 30 sec | ⚠️ A faire |
| 5. Install deps | `pnpm install` | 2 min | ⚠️ A faire |
| 6. Test dev | `cargo tauri dev` | 30 sec | ⚠️ A faire |
| 7. Validation IPC | Console tests | 2 min | ⚠️ A faire |
| **TOTAL** | | **~10 min** | ⚠️ PENDING |

---

## 🎯 Commandes Rapides

```bash
# Installation complète en une fois
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash && \
source ~/.bashrc && \
nvm install --lts && \
pnpm install -g pnpm && \
cd /home/titane/Documents/TITANE_INFINITY && \
pnpm install && \
cargo tauri dev
```

---

**Version** : v24.1.0  
**Guide** : Node.js + pnpm Installation  
**Cible** : TITANE∞ Tauri Development Environment

📦 **Ready to Install!** 🚀
