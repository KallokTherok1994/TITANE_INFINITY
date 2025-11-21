# 🚀 Pack Scripts TITANE∞ v6.0 — Guide Rapide

**4 Scripts Ultra-Professionnels pour Pop!_OS 24.04 LTS**

---

## 📦 Scripts Disponibles

### 1️⃣ `install-popos-titane.sh` (20K)

**Installation complète système TITANE∞**

```bash
sudo bash install-popos-titane.sh
```

**Installe** :
- ✅ Rust stable + Cargo
- ✅ Node.js 22 LTS (Nodesource)
- ✅ WebKitGTK 4.1 + JavaScriptCore 4.1
- ✅ Tauri CLI v2
- ✅ Build tools (gcc, cmake, pkg-config)

**Temps** : 15-20 minutes

---

### 2️⃣ `diagnostics-postinstall.sh` (20K)

**Diagnostics complet du système**

```bash
sudo bash diagnostics-postinstall.sh
```

**Vérifie** :
- ✅ OS & GLIBC (>= 2.39)
- ✅ Toolchain (Rust, Node, Tauri)
- ✅ Stack WebKitGTK
- ✅ Projet TITANE∞

**Temps** : 2-3 minutes

---

### 3️⃣ `rebuild-titane.sh` (21K)

**Rebuild complet Frontend + Backend + Tauri**

```bash
bash rebuild-titane.sh
```

**Actions** :
- ✅ Backup automatique
- ✅ Nettoyage complet
- ✅ Build frontend (Vite)
- ✅ Build backend (Rust)
- ✅ Génération bundles (.deb, .AppImage)

**Temps** : 15-25 minutes

---

### 4️⃣ `restore-environment.sh` (21K)

**Restauration environnement post-migration**

```bash
sudo bash restore-environment.sh
```

**Restaure** :
- ✅ SSH (permissions 700/600)
- ✅ Git config
- ✅ Projet TITANE∞
- ✅ Dépendances npm

**Temps** : 5-10 minutes

---

## 🎯 Workflow Migration Complet

```bash
# 1. Backup (Pop!_OS 22.04)
bash backup-pre-migration.sh

# 2. Upgrade système
sudo do-release-upgrade

# 3. Installation TITANE∞ (Pop!_OS 24.04)
sudo bash install-popos-titane.sh

# 4. Restauration environnement
sudo bash restore-environment.sh

# 5. Diagnostics
sudo bash diagnostics-postinstall.sh

# 6. Rebuild (optionnel)
bash rebuild-titane.sh
```

**Temps total** : 1h15 - 1h55

---

## 📊 Logs & Rapports

Tous les scripts génèrent logs + rapports Markdown :

```
/opt/titane/logs/
├── install/
│   ├── install_YYYYMMDD_HHMMSS.log
│   └── report_YYYYMMDD_HHMMSS.md
├── diagnostics/
│   ├── diagnostics_YYYYMMDD_HHMMSS.log
│   └── diagnostics_YYYYMMDD_HHMMSS.md
├── rebuild/
│   ├── rebuild_YYYYMMDD_HHMMSS.log
│   └── report_YYYYMMDD_HHMMSS.md
└── restore/
    ├── restore_YYYYMMDD_HHMMSS.log
    └── report_YYYYMMDD_HHMMSS.md
```

---

## ✅ Caractéristiques

- ✅ **Robustes** : `set -euo pipefail`, gestion erreurs complète
- ✅ **Idempotents** : Détection installations existantes
- ✅ **Lisibles** : Comments détaillés, output coloré
- ✅ **Sécurisés** : Checksums SHA256, permissions SSH strictes
- ✅ **Automatisés** : Aucune interaction requise
- ✅ **Conformes DevOps** : Structure modulaire, logs complets

---

## 🔍 Vérification Installation

Après `install-popos-titane.sh` :

```bash
source ~/.cargo/env
rustc --version
cargo --version
cargo tauri --version
node --version
npm --version
```

---

## 🐛 Troubleshooting

### Erreur "Rust not found"
```bash
source ~/.cargo/env
```

### Erreur GLIBC
```bash
ldd --version  # Doit être >= 2.39
# Si < 2.39 → Migration Pop!_OS 24.04 requise
```

### Erreur WebKitGTK
```bash
pkg-config --modversion webkit2gtk-4.1
# Si manquant : sudo bash install-popos-titane.sh
```

---

## 📚 Documentation Complète

- **PACK_SCRIPTS_TITANE_v6.0.txt** — Documentation détaillée
- **GUIDE_MIGRATION_POPOS_24.04.md** — Guide migration système
- **STATUS_FINAL.md** — État système TITANE∞

---

## ✨ Support

**Version** : 6.0.0  
**Date** : 20 Novembre 2025  
**Auteur** : GitHub Copilot (Claude Sonnet 4.5)  
**Projet** : TITANE∞ v15.5.0

---

**🚀 Prêt pour Pop!_OS 24.04 LTS**
