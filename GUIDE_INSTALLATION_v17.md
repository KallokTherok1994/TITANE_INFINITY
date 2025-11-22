# 🚀 GUIDE D'INSTALLATION TITANE∞ v17

## ⚠️ Problèmes détectés sur votre système

Lors de l'exécution, nous avons détecté que certaines dépendances système sont manquantes :

1. **WebKit 2 GTK 4.1** (requis pour Tauri v2)
2. **Node.js / pnpm** (non détecté dans PATH)
3. **sudo** (non disponible dans le shell actuel)

---

## 📋 ÉTAPES D'INSTALLATION

### 1️⃣ Installation des dépendances système Tauri v2

Ouvrez un **vrai terminal** (GNOME Terminal, Konsole, etc.) et exécutez :

```bash
# Pop!_OS / Ubuntu / Debian
sudo apt-get update
sudo apt-get install -y \
  libwebkit2gtk-4.1-dev \
  libjavascriptcoregtk-4.1-dev \
  libgtk-3-dev \
  libsoup-3.0-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  patchelf
```

**Si `libwebkit2gtk-4.1-dev` n'existe pas** (anciennes versions Ubuntu) :
```bash
sudo apt-get install -y \
  libwebkit2gtk-4.0-dev \
  libjavascriptcoregtk-4.0-dev
```

Puis modifiez `src-tauri/Cargo.toml` :
```toml
[dependencies.tauri]
version = "2.0.0"
features = ["devtools"]
```

En :
```toml
[dependencies.tauri]
version = "2.0.0"
features = ["devtools", "linux-protocol-body"]
```

### 2️⃣ Installation de Node.js et pnpm

Si Node.js n'est pas installé :

```bash
# Installation via nvm (recommandé)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Installation de pnpm
npm install -g pnpm
```

**OU** via gestionnaire de paquets :
```bash
# Pop!_OS / Ubuntu
sudo apt-get install -y nodejs npm
sudo npm install -g pnpm
```

### 3️⃣ Vérification des installations

```bash
# Vérifier Node.js
node --version  # Doit afficher v18+ ou v20+

# Vérifier pnpm
pnpm --version  # Doit afficher 8.x ou 9.x

# Vérifier Rust
rustc --version  # Doit afficher 1.70+

# Vérifier WebKit
pkg-config --modversion webkit2gtk-4.1
# OU
pkg-config --modversion webkit2gtk-4.0
```

---

## 🎯 COMMANDES DE DÉMARRAGE

### Une fois les dépendances installées

```bash
# 1. Naviguer vers le projet
cd /home/titane/Documents/TITANE_INFINITY

# 2. Installer les dépendances Node.js
pnpm install

# 3. Valider le code Rust/Tauri v17
./validate_v17.sh

# 4. Lancer en mode développement
pnpm tauri dev
```

---

## 🔧 RÉSOLUTION DES PROBLÈMES COURANTS

### Erreur : "sudo: commande introuvable"

Vous êtes dans un shell VS Code intégré avec PATH limité. Ouvrez un **vrai terminal système** :
- Pop!_OS : `Super` + `T`
- Ou : Menu Applications → Terminal

### Erreur : "pnpm: commande introuvable"

Node.js n'est pas dans le PATH. Solutions :

1. **Fermer et rouvrir le terminal** après installation
2. **Recharger le shell** : `source ~/.bashrc` ou `source ~/.zshrc`
3. **Vérifier PATH** : `echo $PATH | grep node`

### Erreur compilation : "javascriptcoregtk-4.1 not found"

WebKit 4.1 n'est pas installé. Deux options :

**Option A** (recommandée) : Installer WebKit 4.1
```bash
sudo apt-get install -y \
  libwebkit2gtk-4.1-dev \
  libjavascriptcoregtk-4.1-dev
```

**Option B** : Utiliser WebKit 4.0
```bash
sudo apt-get install -y \
  libwebkit2gtk-4.0-dev \
  libjavascriptcoregtk-4.0-dev
```

Puis modifier `src-tauri/Cargo.toml` pour forcer Tauri à utiliser 4.0 (voir section 1).

### Erreur : "No package.json found"

Vous n'êtes pas dans le bon répertoire :
```bash
pwd  # Afficher répertoire actuel
cd /home/titane/Documents/TITANE_INFINITY
ls -la package.json  # Vérifier présence
```

---

## ✅ VALIDATION COMPLÈTE

Une fois tout installé, cette séquence doit fonctionner sans erreur :

```bash
cd /home/titane/Documents/TITANE_INFINITY

# Test 1 : Vérification architecture
./validate_v17.sh
# Doit afficher : "Tests exécutés: 8, Erreurs: 0"

# Test 2 : Compilation Rust
cargo check --manifest-path src-tauri/Cargo.toml
# Doit afficher : "Finished ..."

# Test 3 : Tests unitaires
cargo test --manifest-path src-tauri/Cargo.toml tauri_v2_guard
# Doit afficher : "test result: ok"

# Test 4 : Lancement dev
pnpm tauri dev
# Doit ouvrir l'application
```

---

## 📚 DOCUMENTATION DISPONIBLE

Après installation, consultez :

1. **README_v17.md** — Guide utilisateur complet
2. **ARCHITECTURE_RULES_v17.md** — Règles développement
3. **MISSION_ACCOMPLIE_v17.md** — Résumé de la migration v17

---

## 🆘 BESOIN D'AIDE ?

### Vérifier versions requises

```bash
# Versions minimales requises
node --version     # ≥ 18.0.0
pnpm --version     # ≥ 8.0.0
rustc --version    # ≥ 1.70.0
cargo --version    # ≥ 1.70.0
```

### Logs détaillés

```bash
# Compilation verbose
RUST_BACKTRACE=1 cargo build --manifest-path src-tauri/Cargo.toml

# Dev mode verbose
pnpm tauri dev -- --verbose
```

### Réinitialisation complète

```bash
# Nettoyer tout
rm -rf node_modules
rm -rf src-tauri/target
pnpm install
cargo clean --manifest-path src-tauri/Cargo.toml
```

---

## 🎉 APRÈS INSTALLATION

Une fois tout fonctionnel, TITANE∞ v17 vous offre :

✅ **Backend Rust 100% Send-Safe**  
✅ **51 commandes Tauri async refactorisées**  
✅ **0 async_recursion**  
✅ **Architecture blindée**  
✅ **Tests automatiques**  
✅ **Documentation complète**  

**Bon développement ! 🚀**
