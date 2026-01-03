# 📦 MANIFEST — Scripts d'Installation TITANE∞ Ubuntu 24.04 LTS

**Date de création** : 9 décembre 2024  
**Version** : 1.0.0  
**Auteur** : Kevin Thibault / Claude AI

---

## 📄 Fichiers Créés

### 1. **TITANE_POST_INSTALL_UBUNTU.sh** (32 KB, 707 lignes)

**Script principal d'installation automatisée**

- ✅ Installation complète de l'environnement TITANE∞
- ✅ 9 phases d'installation progressives
- ✅ Gestion des erreurs et rollback
- ✅ Logging détaillé dans `~/.titane_install_logs/`
- ✅ Support backup/restore
- ✅ Validation complète de l'environnement
- ✅ Interface colorée et interactive

**Permissions** : `rwxrwxr-x` (exécutable)

**Utilisation** :

```bash
chmod +x TITANE_POST_INSTALL_UBUNTU.sh
./TITANE_POST_INSTALL_UBUNTU.sh
```

---

### 2. **validate_environment.sh** (11 KB)

**Script de validation rapide de l'environnement**

- ✅ Vérification de tous les outils installés
- ✅ Test des versions (Rust, Node, WebKit, etc.)
- ✅ Validation configuration Git & SSH
- ✅ Vérification projet TITANE∞
- ✅ Recommandations personnalisées
- ✅ Code de retour = nombre d'échecs

**Permissions** : `rwxrwxr-x` (exécutable)

**Utilisation** :

```bash
./validate_environment.sh
```

---

### 3. **POST_INSTALL_README.md** (5.5 KB)

**Documentation complète du script d'installation**

Contenu :

- Vue d'ensemble du processus
- Prérequis système
- Guide d'installation rapide
- Description détaillée des 9 phases
- Utilisation avec backup
- Étapes post-installation
- Logs et debugging
- Configuration SSH GitHub
- Structure installée
- Dépannage complet

---

### 4. **QUICKSTART_UBUNTU_24.04.md** (6.9 KB)

**Guide de démarrage rapide pour nouveaux utilisateurs**

Contenu :

- Installation en 3 commandes
- Liste de tout ce qui est installé
- Commandes essentielles
- Structure du projet
- Configuration SSH pas-à-pas
- Dépannage rapide
- Architecture TITANE∞
- Conventions de code
- Checklist post-installation

---

## 🎯 Cas d'Usage

### Scénario 1 : Installation fraîche complète

```bash
# 1. Télécharger
wget https://raw.githubusercontent.com/KallokTherok1994/TITANE_INFINITY/main/TITANE_POST_INSTALL_UBUNTU.sh

# 2. Exécuter
chmod +x TITANE_POST_INSTALL_UBUNTU.sh
./TITANE_POST_INSTALL_UBUNTU.sh

# 3. Valider
./validate_environment.sh

# 4. Démarrer
cd ~/Projets/TITANE_INFINITY
pnpm run tauri dev
```

### Scénario 2 : Restauration depuis backup

```bash
# Exécuter avec backup
./TITANE_POST_INSTALL_UBUNTU.sh
# Entrer le chemin : /media/usb/BACKUP_TITANE_20241209_143022
```

### Scénario 3 : Validation rapide

```bash
# Vérifier l'environnement actuel
./validate_environment.sh

# Si des éléments manquent, réexécuter l'installation
./TITANE_POST_INSTALL_UBUNTU.sh
```

---

## 📋 Ce qui est installé

### Phase 1 : Mise à jour système

- `apt update && apt upgrade`
- Outils essentiels (curl, wget, git, build-essential)

### Phase 2 : Dépendances Tauri v2

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

### Phase 3 : Rust

- rustup (gestionnaire de toolchains)
- stable + nightly toolchains
- rustfmt, clippy
- wasm32-unknown-unknown target

### Phase 4 : Node.js

- NVM (Node Version Manager)
- Node.js LTS
- npm

### Phase 5 : VSCode

- VSCode éditeur
- Extensions :
  - rust-analyzer
  - tauri-vscode
  - eslint, prettier
  - gitlens
  - tailwindcss
  - auto-rename-tag
  - errorlens

### Phase 6 : Configurations

- Clés SSH (depuis backup)
- .gitconfig (depuis backup)
- Paramètres VSCode (depuis backup)

### Phase 7 : Projet TITANE

- Clone du repository
- Checkout branche main

### Phase 8 : Dépendances projet

- `pnpm install`
- `cargo build`

### Phase 9 : Validation

- Rapport complet
- Statistiques
- Recommandations

---

## 🔍 Validation

Le script `validate_environment.sh` vérifie :

| Composant      | Vérification             |
| -------------- | ------------------------ |
| **OS**         | Ubuntu 24.04 LTS         |
| **Rust**       | Version stable installée |
| **Cargo**      | Présent et fonctionnel   |
| **Node.js**    | Version LTS              |
| **npm**        | Compatible               |
| **WebKit2GTK** | Version 4.1+             |
| **GTK3**       | Présent                  |
| **VSCode**     | Installé                 |
| **Git**        | Configuré                |
| **SSH GitHub** | Authentifié              |
| **TITANE**     | Cloné et buildé          |
| **rustfmt**    | Installé                 |
| **clippy**     | Installé                 |
| **wasm32**     | Target ajouté            |
| **Tauri CLI**  | Accessible via npx       |

---

## 📊 Logs & Diagnostics

### Emplacement des logs

```
~/.titane_install_logs/install_YYYYMMDD_HHMMSS.log
```

### Structure d'un log

```
[20241209_110630] === PHASE 1 : MISE À JOUR SYSTÈME ===
[20241209_110630] STEP: Mise à jour des sources APT...
[20241209_110645] SUCCESS: Sources mises à jour
[20241209_110645] STEP: Mise à niveau des packages...
...
```

### En cas d'erreur

1. Consulter le log : `~/.titane_install_logs/install_*.log`
2. Chercher `ERROR` : `grep ERROR ~/.titane_install_logs/install_*.log`
3. Réexécuter le script (il détecte ce qui est déjà installé)
4. Si bloqué, exécuter manuellement la commande problématique

---

## 🛠️ Dépannage

### Script s'arrête avec "set -e"

Le script utilise `set -e` pour s'arrêter en cas d'erreur. Consultez le log pour identifier la commande qui a échoué.

### WebKit2GTK introuvable

```bash
sudo apt update
sudo apt install --reinstall libwebkit2gtk-4.1-dev libjavascriptcoregtk-4.1-dev
pkg-config --modversion webkit2gtk-4.1
```

### Rust non chargé après installation

```bash
source ~/.cargo/env
rustc --version
```

### NVM non chargé

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
node --version
```

### Permissions SSH incorrectes

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_*
chmod 644 ~/.ssh/id_*.pub
chmod 644 ~/.ssh/known_hosts
```

---

## 🔐 Sécurité

### Clés SSH

- Le script restaure les clés depuis backup avec permissions correctes
- Génération automatique si pas de backup
- Test de connexion GitHub inclus

### Logs

- Contiennent les commandes exécutées
- **Ne contiennent PAS** de secrets (tokens, passwords)
- Conservés dans `~/.titane_install_logs/` (home utilisateur)

---

## 🚀 Prochaines Étapes

Après installation réussie :

1. **Recharger l'environnement**

   ```bash
   source ~/.bashrc
   ```

2. **Valider l'installation**

   ```bash
   ./validate_environment.sh
   ```

3. **Naviguer vers le projet**

   ```bash
   cd ~/Projets/TITANE_INFINITY
   ```

4. **Lancer en développement**

   ```bash
   pnpm run tauri dev
   ```

5. **Build de production**
   ```bash
   pnpm run tauri build
   ```

---

## 📚 Documentation Associée

### Fichiers projet

- `ARCHITECTURE.md` — Architecture des 9 moteurs
- `.github/instructions/titane.instructions.md` — Conventions de développement
- `README.md` — Présentation du projet

### Scripts utiles

- `auto_build.sh` — Build automatisé
- `dev_on_host.sh` — Dev sans conteneur
- `build_production.sh` — Build production optimisé

---

## 🔄 Maintenance

### Mise à jour du script

```bash
cd ~/Projets/TITANE_INFINITY
git pull origin main
chmod +x TITANE_POST_INSTALL_UBUNTU.sh
```

### Réexécution

Le script est **idempotent** : il détecte ce qui est déjà installé et ne réinstalle que ce qui manque.

```bash
./TITANE_POST_INSTALL_UBUNTU.sh
```

---

## 📈 Statistiques

### Temps d'exécution typique

- **Installation complète** : 15-30 minutes (selon connexion internet)
- **Validation** : ~5 secondes
- **Avec backup** : +2-3 minutes (restauration configs)

### Espace disque requis

- **Outils système** : ~500 MB
- **Rust + toolchains** : ~1.5 GB
- **Node.js + npm** : ~200 MB
- **VSCode + extensions** : ~500 MB
- **TITANE + dépendances** : ~1 GB
- **Total** : ~3.7 GB

---

## ✅ Checklist de Livraison

- [x] `TITANE_POST_INSTALL_UBUNTU.sh` créé et exécutable
- [x] `validate_environment.sh` créé et exécutable
- [x] `POST_INSTALL_README.md` documentation complète
- [x] `QUICKSTART_UBUNTU_24.04.md` guide rapide
- [x] `MANIFEST.md` ce fichier
- [x] Scripts testés localement
- [x] Permissions correctes (755 pour .sh)
- [x] Compatibilité Ubuntu 24.04 LTS vérifiée
- [x] Gestion d'erreurs robuste
- [x] Logs détaillés
- [x] Interface utilisateur claire
- [x] Documentation exhaustive

---

## 🎉 Résultat Final

**4 fichiers créés** pour une installation complète et automatisée de TITANE∞ sur Ubuntu 24.04 LTS.

L'utilisateur peut maintenant :

1. Installer l'environnement en une commande
2. Valider la configuration rapidement
3. Consulter la documentation détaillée
4. Suivre le guide de démarrage rapide

**Objectif atteint : Installation zero-friction de TITANE∞! 🚀**

---

_Généré le 9 décembre 2024_  
_Version 1.0.0_  
_Kevin Thibault / Claude AI_
