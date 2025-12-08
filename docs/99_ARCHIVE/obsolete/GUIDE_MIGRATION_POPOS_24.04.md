# 🚀 GUIDE MIGRATION PROFESSIONNEL - Pop!_OS 24.04 LTS

## TITANE∞ v15.5 - Migration complète et automatisée

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Scripts disponibles](#scripts-disponibles)
3. [Procédure complète](#procédure-complète)
4. [Dépannage](#dépannage)
5. [Vérifications post-migration](#vérifications-post-migration)

---

## 🎯 VUE D'ENSEMBLE

### Pourquoi migrer vers Pop!_OS 24.04 ?

**Problème actuel** : Pop!_OS 22.04 (GLIBC 2.35) est incompatible avec Tauri v2
- ❌ WebKitGTK 4.1 nécessite GLIBC >= 2.37
- ❌ Build Tauri échoue dans VSCode Flatpak
- ❌ Linking impossible entre GLIBC 2.35 et 2.42

**Solution** : Pop!_OS 24.04 LTS (GLIBC 2.39)
- ✅ Support complet Tauri v2
- ✅ WebKitGTK 4.1 natif
- ✅ Build sans workarounds
- ✅ Distribution universelle

### Temps estimé

| Étape | Durée |
|-------|-------|
| Backup | 5-10 min |
| Téléchargement ISO | 10-30 min |
| Installation Pop!_OS 24.04 | 15-30 min |
| Configuration système | 10-20 min |
| Restauration TITANE∞ | 5-10 min |
| Build test | 3-5 min |
| **TOTAL** | **1h - 1h45** |

---

## 📦 SCRIPTS DISPONIBLES

### 1. `backup-pre-migration.sh`
**Avant migration** - Sauvegarde complète

Contenu sauvegardé :
- ✅ TITANE∞ complet (`~/Documents/TITANE_NEWGEN`)
- ✅ Clés SSH (`~/.ssh`)
- ✅ Config Git (`~/.gitconfig`)
- ✅ VSCode settings (`~/.config/Code/User`)
- ✅ Shell configs (`.bashrc`, `.profile`, `.zshrc`)
- ✅ Cargo/Rust config (`~/.cargo`)
- ✅ Liste packages npm globaux
- ✅ Infos système (versions, checksums)

Génère :
- Dossier `Migration_TITANE_Backup_YYYYMMDD_HHMMSS/`
- Archive `.tar.gz` compressée
- Checksum SHA256

**Usage** :
```bash
cd ~/Documents/TITANE_NEWGEN/TITANE_INFINITY
chmod +x backup-pre-migration.sh
./backup-pre-migration.sh
```

### 2. `install-popos-24.04.sh`
**Après installation Pop!_OS 24.04** - Configuration complète système

Installe :
- ✅ Dépendances Tauri v2 complètes (WebKitGTK, JavaScriptCore, GTK, etc.)
- ✅ Rust stable + Cargo
- ✅ Node.js 22 LTS
- ✅ Tauri CLI 2.x
- ✅ Outils dev (vim, htop, ripgrep, etc.)
- ✅ File watchers optimisés (524288)

Vérifie :
- GLIBC version
- WebKitGTK 4.1 disponible
- JavaScriptCore 4.1 disponible

**Usage** :
```bash
# Sur Pop!_OS 24.04 fraîchement installé
cd ~/Documents/TITANE_NEWGEN/TITANE_INFINITY
chmod +x install-popos-24.04.sh
./install-popos-24.04.sh
```

### 3. `restore-after-migration.sh`
**Après configuration système** - Restauration backup

Restaure :
- ✅ TITANE∞ complet
- ✅ Clés SSH (avec permissions correctes)
- ✅ Config Git
- ✅ VSCode settings
- ✅ Shell configs

Réinstalle :
- ✅ node_modules
- ✅ Build frontend
- ✅ Test compilation

**Usage** :
```bash
cd ~/Documents/TITANE_NEWGEN/TITANE_INFINITY
chmod +x restore-after-migration.sh
./restore-after-migration.sh
```

### 4. `reinstall-titane.sh`
**Alternative à restauration** - Installation propre

Pour fresh install sans backup :
- Clone depuis Git OU copie depuis backup
- Nettoyage complet cache
- Installation dépendances
- Build frontend + Tauri
- Test complet

**Usage** :
```bash
chmod +x reinstall-titane.sh
./reinstall-titane.sh
```

---

## 🛠️ PROCÉDURE COMPLÈTE

### PHASE 1 : PRÉPARATION (Pop!_OS 22.04)

#### 1.1 Exécuter backup
```bash
cd ~/Documents/TITANE_NEWGEN/TITANE_INFINITY
./backup-pre-migration.sh
```

#### 1.2 Vérifier backup
```bash
# Localiser l'archive
ls -lh ~/Migration_TITANE_Backup_*.tar.gz

# Vérifier checksum
sha256sum -c ~/Migration_TITANE_Backup_*.tar.gz.sha256
```

#### 1.3 Copier sur disque externe
```bash
# Identifier disque externe
lsblk

# Copier archive
cp ~/Migration_TITANE_Backup_*.tar.gz /media/VOTRE_DISQUE/
cp ~/Migration_TITANE_Backup_*.tar.gz.sha256 /media/VOTRE_DISQUE/
```

#### 1.4 Déconnecter comptes cloud
- Notion : Déconnexion
- GitHub : Token personnel sauvegardé
- Google Workspace : Déconnexion
- Dropbox/Syncthing : Déconnexion

---

### PHASE 2 : INSTALLATION POP!_OS 24.04

#### 2.1 Télécharger ISO
👉 [https://pop.system76.com/](https://pop.system76.com/)

**Choisir** : Pop!_OS 24.04 LTS - AMD64

#### 2.2 Créer clé USB bootable

**Méthode 1** : Balena Etcher
```bash
# Installer Etcher
sudo apt install balena-etcher-electron

# Lancer et suivre l'interface
balena-etcher-electron
```

**Méthode 2** : dd (avancé)
```bash
# ATTENTION : /dev/sdX = votre clé USB (vérifier avec lsblk)
sudo dd if=pop-os_24.04.iso of=/dev/sdX bs=4M status=progress
sync
```

#### 2.3 Installation

1. **Booter sur clé USB** (F12 ou DEL au démarrage)
2. **Choisir "Clean Install"**
   - Effacer disque et installer Pop!_OS 24.04
   - Partitionnement automatique (recommandé)
3. **Langue** : Français
4. **Fuseau horaire** : Europe/Paris
5. **Utilisateur** : Créer compte
6. **Chiffrement disque** : Selon préférence
7. **Installer** et attendre 15-30 min

#### 2.4 Premier démarrage

1. Redémarrer
2. Retirer clé USB
3. Se connecter
4. Mettre à jour système :
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

---

### PHASE 3 : CONFIGURATION SYSTÈME

#### 3.1 Copier scripts depuis backup

**Option A** : Depuis disque externe
```bash
cp /media/VOTRE_DISQUE/Migration_TITANE_Backup_*.tar.gz ~/
```

**Option B** : Télécharger depuis Git
```bash
# Si projet dans Git
git clone VOTRE_REPO ~/Documents/TITANE_NEWGEN
cd ~/Documents/TITANE_NEWGEN/TITANE_INFINITY
```

#### 3.2 Rendre scripts exécutables
```bash
cd ~/Documents/TITANE_NEWGEN/TITANE_INFINITY
chmod +x *.sh
```

#### 3.3 Configuration système complète
```bash
./install-popos-24.04.sh
```

**Durée** : 10-20 minutes

**Ce qui sera installé** :
- Mise à jour système
- WebKitGTK 4.1 + JavaScriptCore
- GTK 3/4
- Rust stable
- Node.js 22 LTS
- Tauri CLI 2.x
- Outils dev

**Vérifications automatiques** :
- GLIBC 2.39 ✅
- WebKitGTK 4.1 ✅
- JavaScriptCore 4.1 ✅

#### 3.4 Recharger terminal
```bash
source ~/.cargo/env
source ~/.bashrc
```

---

### PHASE 4 : RESTAURATION TITANE∞

#### 4.1 Restaurer backup
```bash
./restore-after-migration.sh
```

Le script :
1. Recherche archives backup
2. Vérifie checksum
3. Extrait archive
4. Restaure tous les fichiers
5. Réinstalle TITANE∞

#### 4.2 OU Installation propre
```bash
./reinstall-titane.sh
```

---

### PHASE 5 : TESTS

#### 5.1 Test frontend
```bash
cd ~/Documents/TITANE_NEWGEN/TITANE_INFINITY
npm run dev
```

Vérifier :
- ✅ Vite démarre en < 200ms
- ✅ http://localhost:5173 accessible
- ✅ Hot reload fonctionne

#### 5.2 Test Tauri dev
```bash
npm run tauri:dev
```

Vérifier :
- ✅ Vite démarre automatiquement
- ✅ Fenêtre Tauri s'ouvre
- ✅ Interface TITANE∞ s'affiche
- ✅ Modules fonctionnels
- ✅ Pas d'erreur WebKit

#### 5.3 Test build production
```bash
npm run tauri:build
```

Vérifier :
- ✅ Build réussit (3-5 min)
- ✅ Binaire généré : `src-tauri/target/release/titane-infinity`
- ✅ Packages : `.deb` et `.AppImage`

#### 5.4 Lancer binaire
```bash
./src-tauri/target/release/titane-infinity
```

Vérifier :
- ✅ Application démarre
- ✅ Interface complète
- ✅ Pas de crash

---

## 🔧 DÉPANNAGE

### Problème : Script backup ne trouve pas TITANE∞

**Solution** :
```bash
# Localiser projet
find ~ -name "TITANE_INFINITY" -type d

# Modifier chemin dans script si nécessaire
nano backup-pre-migration.sh
```

### Problème : Archive backup corrompue

**Solution** :
```bash
# Vérifier intégrité
sha256sum -c Migration_TITANE_Backup_*.tar.gz.sha256

# Si échec, refaire backup
./backup-pre-migration.sh
```

### Problème : install-popos-24.04.sh échoue

**Vérifier version** :
```bash
cat /etc/os-release | grep VERSION
ldd --version | head -1
```

**Si Pop!_OS 22.04** :
❌ Ce script est pour 24.04 uniquement

**Si dépendance manquante** :
```bash
# Relancer avec verbose
bash -x install-popos-24.04.sh
```

### Problème : npm install échoue

**Solution** :
```bash
# Nettoyer cache
npm cache clean --force
rm -rf node_modules package-lock.json

# Réinstaller
npm install
```

### Problème : Build Tauri échoue encore

**Vérifier WebKitGTK** :
```bash
pkg-config --modversion webkit2gtk-4.1
pkg-config --modversion javascriptcoregtk-4.1
```

**Si non installé** :
```bash
sudo apt install libwebkit2gtk-4.1-dev libjavascriptcoregtk-4.1-dev
```

---

## ✅ VÉRIFICATIONS POST-MIGRATION

### Checklist système

- [ ] GLIBC 2.39 : `ldd --version`
- [ ] Pop!_OS 24.04 : `cat /etc/os-release`
- [ ] Node 22+ : `node --version`
- [ ] Rust stable : `rustc --version`
- [ ] WebKitGTK 4.1 : `pkg-config --modversion webkit2gtk-4.1`
- [ ] JavaScriptCore 4.1 : `pkg-config --modversion javascriptcoregtk-4.1`

### Checklist TITANE∞

- [ ] Projet restauré : `ls ~/Documents/TITANE_NEWGEN/TITANE_INFINITY`
- [ ] node_modules installés : `ls node_modules | wc -l` (> 100)
- [ ] Frontend build : `npm run build` → `dist/`
- [ ] Type-check : `npm run type-check` → 0 erreur
- [ ] Vite dev : `npm run dev` → http://localhost:5173
- [ ] Tauri dev : `npm run tauri:dev` → fenêtre s'ouvre
- [ ] Tauri build : `npm run tauri:build` → binaire généré

### Performances attendues

| Métrique | Valeur |
|----------|--------|
| Vite startup | < 200ms |
| Frontend build | < 2s |
| Type-check | < 10s |
| Tauri build (première fois) | 3-5 min |
| Tauri build (incrémental) | 30-60s |
| Binaire size | 50-80 MB |
| Bundle .deb | ~50 MB |
| Bundle .AppImage | ~80 MB |

---

## 📚 RÉFÉRENCES

### Documentation officielle

- [Pop!_OS](https://pop.system76.com/)
- [Tauri v2](https://v2.tauri.app/)
- [WebKitGTK](https://webkitgtk.org/)

### Versions cibles

- Pop!_OS 24.04 LTS (GLIBC 2.39)
- Node.js 22 LTS
- Rust stable (latest)
- Tauri CLI 2.x
- WebKitGTK 4.1
- React 18.3.1
- Vite 6.4.1
- TypeScript 5.5.3

---

## 🎉 RÉSUMÉ

### Avant migration (Pop!_OS 22.04)
```bash
./backup-pre-migration.sh
# Copier archive sur disque externe
```

### Installation Pop!_OS 24.04
- Télécharger ISO
- Créer clé USB
- Installer (Clean Install)

### Après migration (Pop!_OS 24.04)
```bash
./install-popos-24.04.sh
./restore-after-migration.sh
# OU
./reinstall-titane.sh
```

### Tests
```bash
npm run dev
npm run tauri:dev
npm run tauri:build
./src-tauri/target/release/titane-infinity
```

**✅ TITANE∞ 100% opérationnel sur Pop!_OS 24.04 !**
