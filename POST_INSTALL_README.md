# 🚀 TITANE∞ — Guide d'Installation Post-Ubuntu 24.04 LTS

## Vue d'ensemble

Le script `TITANE_POST_INSTALL_UBUNTU.sh` automatise **complètement** la configuration d'un environnement de développement TITANE∞ sur une installation fraîche d'Ubuntu 24.04 LTS.

## Prérequis

- **Ubuntu 24.04 LTS** (installation fraîche recommandée)
- **Connexion internet** active
- **Droits sudo** sur le système
- *(Optionnel)* Backup précédent de vos configurations

## Installation rapide

```bash
# 1. Télécharger le script
wget https://raw.githubusercontent.com/KallokTherok1994/TITANE_INFINITY/main/TITANE_POST_INSTALL_UBUNTU.sh

# 2. Rendre exécutable
chmod +x TITANE_POST_INSTALL_UBUNTU.sh

# 3. Exécuter
./TITANE_POST_INSTALL_UBUNTU.sh
```

## Ce que fait le script

### Phase 0 : Vérification environnement
- ✅ Détection Ubuntu 24.04 LTS
- ✅ Test connexion internet

### Phase 1 : Mise à jour système
- `apt update && apt upgrade`
- Installation outils essentiels (curl, wget, git, build-essential, etc.)

### Phase 2 : Dépendances Tauri v2 ⚡ (CRITIQUE)
```
libgtk-3-dev
libwebkit2gtk-4.1-dev
libjavascriptcoregtk-4.1-dev
libsoup-3.0-dev
libayatana-appindicator3-dev
libasound2-dev
librsvg2-dev
patchelf
```

### Phase 3 : Installation Rust
- Installation via `rustup`
- Toolchains : `stable` + `nightly`
- Composants : `rustfmt`, `clippy`
- Target : `wasm32-unknown-unknown`

### Phase 4 : Installation Node.js
- Installation de **NVM** (Node Version Manager)
- Installation Node.js **LTS**
- Configuration automatique

### Phase 5 : Installation VSCode
- Ajout du repository officiel Microsoft
- Installation VSCode
- Extensions essentielles :
  - `rust-lang.rust-analyzer`
  - `tauri-apps.tauri-vscode`
  - `dbaeumer.vscode-eslint`
  - `esbenp.prettier-vscode`
  - `eamodio.gitlens`
  - `yzhang.markdown-all-in-one`
  - `bradlc.vscode-tailwindcss`
  - `formulahendry.auto-rename-tag`
  - `usernamehw.errorlens`

### Phase 6 : Restauration configurations
Si vous avez un backup précédent :
- 🔑 Clés SSH (`~/.ssh`)
- ⚙️ Configuration Git (`~/.gitconfig`)
- 🎨 Paramètres VSCode

Sinon, configuration manuelle guidée.

### Phase 7 : Clonage TITANE_INFINITY
- Création répertoire `~/Projets`
- Clonage via SSH (ou HTTPS si SSH non configuré)
- Checkout branche `main`

### Phase 8 : Installation dépendances TITANE
- `npm install`
- Vérification Tauri CLI
- `cargo check` + `cargo build`

### Phase 9 : Validation finale
Rapport complet de l'environnement :
- ✅ OS
- ✅ Rust / Cargo
- ✅ Node.js / npm
- ✅ WebKit2GTK
- ✅ VSCode
- ✅ Git
- ✅ SSH GitHub
- ✅ Projet TITANE

## Utilisation avec backup

Si vous avez créé un backup avec le script de sauvegarde :

```bash
./TITANE_POST_INSTALL_UBUNTU.sh
# Quand demandé, entrer le chemin :
# /media/usb/BACKUP_TITANE_20241209_143022
```

Le script restaurera automatiquement :
- Vos clés SSH
- Votre configuration Git
- Vos paramètres VSCode
- Vos extensions VSCode additionnelles

## Après l'installation

### 1. Recharger l'environnement
```bash
source ~/.bashrc
```

### 2. Naviguer vers TITANE
```bash
cd ~/Projets/TITANE_INFINITY
```

### 3. Lancer en développement
```bash
npm run tauri dev
```

### 4. Build de production
```bash
npm run tauri build
```

## Logs et debugging

Tous les logs sont sauvegardés dans :
```
~/.titane_install_logs/install_YYYYMMDD_HHMMSS.log
```

En cas de problème, consultez ce fichier pour les détails complets.

## Configuration SSH GitHub

Si vous n'avez pas de backup, configurez SSH manuellement :

```bash
# 1. Générer une nouvelle clé
ssh-keygen -t ed25519 -C "votre_email@example.com"

# 2. Afficher la clé publique
cat ~/.ssh/id_ed25519.pub

# 3. Ajouter la clé à GitHub
# https://github.com/settings/keys
# Cliquer "New SSH key", coller la clé publique

# 4. Tester la connexion
ssh -T git@github.com
```

## Structure installée

```
~/
├── .cargo/              # Rust toolchain
├── .nvm/                # Node Version Manager
├── .ssh/                # Clés SSH (si restaurées)
├── .gitconfig           # Configuration Git
├── .config/Code/        # Paramètres VSCode
└── Projets/
    └── TITANE_INFINITY/ # Projet cloné
        ├── src/         # Frontend React
        ├── src-tauri/   # Backend Rust
        └── ...
```

## Dépannage

### Erreur WebKit2GTK
```bash
sudo apt install --reinstall libwebkit2gtk-4.1-dev
pkg-config --modversion webkit2gtk-4.1
```

### NVM non chargé
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

### Cargo non trouvé
```bash
source "$HOME/.cargo/env"
```

### Permission denied sur SSH
```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_ed25519
chmod 644 ~/.ssh/id_ed25519.pub
```

## Validation manuelle

Vérifier que tout est installé :

```bash
# OS
lsb_release -a

# Rust
rustc --version
cargo --version

# Node.js
node --version
npm --version

# WebKit
pkg-config --modversion webkit2gtk-4.1

# VSCode
code --version

# Git
git --version

# SSH GitHub
ssh -T git@github.com

# TITANE
cd ~/Projets/TITANE_INFINITY && npm run tauri --version
```

## Support

- **GitHub Issues** : https://github.com/KallokTherok1994/TITANE_INFINITY/issues
- **Documentation** : Voir `ARCHITECTURE.md` dans le projet

## Changelog script

### v1.0.0 (2024-12-09)
- Installation complète automatisée
- Support backup/restore
- Validation environnement
- Logs détaillés
- Support Ubuntu 24.04 LTS

---

**Créé avec 💜 par Kevin Thibault & Claude AI**
