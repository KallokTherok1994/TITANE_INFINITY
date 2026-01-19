# 🚀 GUIDE UTILISATION - ICÔNE TITANE∞ DESKTOP

**Date**: 27 novembre 2025
**Icône créée**: `~/Bureau/TITANE_Installer.desktop` ✅

---

## 🖱️ UTILISATION ICÔNE BUREAU

### Double-Clic (Installation Complète)
```
1. Double-cliquer sur l'icône "🚀 TITANE∞ Installer"
2. Interface Zenity s'ouvre avec 4 options :

   ┌─────────────────────────────────────────────────┐
   │ ⭕ Installation complète                        │
   │    └─ Build + Deploy + Création raccourcis     │
   │                                                 │
   │ ⭕ Réinstallation                               │
   │    └─ Écrase installation actuelle             │
   │                                                 │
   │ ⭕ Réparation (Self-Heal)                       │
   │    └─ Répare sans réinstaller                  │
   │                                                 │
   │ ⭕ Mise à jour                                   │
   │    └─ Update vers dernière version             │
   └─────────────────────────────────────────────────┘

3. Sélectionner mode → Cliquer OK
4. Barre de progression s'affiche :
   - Vérification prérequis (0-10%)
   - Installation dépendances (10-25%)
   - Build Frontend React+Vite (25-50%)
   - Build Backend Rust+Tauri (50-70%)
   - Build application Tauri (70-85%)
   - Déploiement OS (85-95%)
   - Création raccourci (95-100%)
5. Popup de confirmation : "Lancer TITANE∞ OS ?"
   - Cliquer "Lancer" → App démarre
   - Cliquer "Fermer" → Installation terminée
```

### Clic Droit (Actions Rapides)
```
🖱️ Clic droit sur icône → Menu contextuel :

┌────────────────────────────────────────┐
│ 🔨 Build seulement (sans install)    │  ← Lance scripts/autobuild_full.sh
│ 🛠️ Mode Réparation                    │  ← Popup info réparation
│ ⬆️ Mise à jour                         │  ← Popup info mise à jour
└────────────────────────────────────────┘
```

---

## 📋 DÉTAILS MODES D'INSTALLATION

### 1. Installation Complète (Recommandé - Première fois)
**Pipeline complet** :
- ✅ Vérification prérequis système (Node, npm, Rust, Cargo)
- ✅ Installation dépendances (pnpm install --legacy-peer-deps)
- ✅ Build Frontend (React + TypeScript + Vite → dist/)
- ✅ Build Backend (Rust release → 13 MB optimisé)
- ✅ Build Tauri (packaging .deb, .rpm, .AppImage)
- ✅ Déploiement `/opt/TITANE_Infinity/`
- ✅ Création raccourci système + utilisateur
- ✅ Logs détaillés : `/tmp/titane_install.log`

**Durée estimée** : 8-12 minutes (compilation Rust ~5 min)

### 2. Réinstallation (Si installation corrompue)
**Actions** :
- 🗑️ Suppression `/opt/TITANE_Infinity/`
- 🔄 Rebuild complet (auto_build.sh)
- 📦 Redéploiement système
- ✅ Logs : `/tmp/titane_reinstall.log`

**Durée estimée** : 10-15 minutes

### 3. Réparation Self-Heal (Si app ne lance pas)
**Actions** :
- 🔍 Analyse système
- 🛠️ Réparation configuration
- 🔧 Reset dépendances si nécessaire
- ✅ Logs : `/tmp/titane_repair.log`

**Durée estimée** : 2-5 minutes

### 4. Mise à jour (Nouvelle version disponible)
**Actions** :
- 📥 Pull dernière version Git
- 🔨 Rebuild incrémental
- 📦 Redéploiement
- ✅ Logs : `/tmp/titane_update.log`

**Durée estimée** : 5-8 minutes

---

## 🎯 INSTALLATION RAPIDE (RECOMMANDÉE)

**Pour déployer TITANE∞ maintenant** :

```bash
# Méthode 1: Double-clic icône bureau
1. Aller sur Bureau
2. Double-clic "🚀 TITANE∞ Installer"
3. Choisir "Installation complète"
4. Attendre 8-12 min
5. Cliquer "Lancer" → App démarre ✅

# Méthode 2: Terminal (plus de contrôle)
cd ~/Documents/TITANE_INFINITY
bash installer_gui/titane_installer.sh

# Méthode 3: Build seul (sans GUI)
cd ~/Documents/TITANE_INFINITY
bash scripts/autobuild_full.sh
```

---

## 📂 FICHIERS CRÉÉS

### Icône Bureau
```
~/Bureau/TITANE_Installer.desktop
├─ Double-clic: Lance installer_gui/titane_installer.sh
├─ Clic droit → Build: Lance scripts/autobuild_full.sh
├─ Icône: src-tauri/icons/128x128.png
└─ Permissions: Exécutable (chmod +x)
```

### Après Installation Complète
```
/opt/TITANE_Infinity/
├─ titane-infinity              (binaire principal 13 MB)
├─ icon.png                     (icône app)
└─ [autres assets]

/usr/share/applications/titane-infinity.desktop
└─ Raccourci système (menu Applications)

~/.local/share/applications/titane-infinity.desktop
└─ Raccourci utilisateur

/tmp/titane_install.log
└─ Logs installation complète
```

---

## 🔧 DÉPANNAGE

### Icône ne s'affiche pas sur Bureau
```bash
# Vérifier emplacement
ls -lh ~/Bureau/TITANE_Installer.desktop

# Recréer icône
bash ~/Documents/TITANE_INFINITY/create_desktop_icon.sh

# Rendre exécutable manuellement
chmod +x ~/Bureau/TITANE_Installer.desktop
gio set ~/Bureau/TITANE_Installer.desktop "metadata::trusted" true
```

### Double-clic ne fait rien
```bash
# Tester en terminal
bash ~/Documents/TITANE_INFINITY/installer_gui/titane_installer.sh

# Vérifier Zenity installé
sudo apt install zenity
```

### Installation échoue
```bash
# Consulter logs
cat /tmp/titane_install.log | tail -50

# Nettoyer et réessayer
cd ~/Documents/TITANE_INFINITY
rm -rf node_modules dist src-tauri/target
bash installer_gui/titane_installer.sh
```

### Chat IA ne fonctionne pas après install
```bash
# Vérifier configuration dev
cat src-tauri/tauri.conf.json | grep -A3 "build"

# Doit contenir:
# "beforeDevCommand": "pnpm run vite:dev"  ✅
# "devUrl": "http://localhost:5173"      ✅

# Si incorrect, corriger:
bash ~/Documents/TITANE_INFINITY/test_chat_ia_v19.3.sh
```

---

## 📚 DOCUMENTATION COMPLÈTE

- **FIX_CHAT_IA_FINAL_v19.3.md** : Correction Chat IA (cause racine)
- **DEPLOYMENT_GUIDE_v19.2.md** : Guide déploiement production
- **BUILD_PRODUCTION_REPORT_v19.2.md** : Rapport build complet
- **AUTO_BUILD_GUIDE.md** : Guide auto-build pipeline

---

## ✅ CHECKLIST POST-INSTALLATION

Après installation complète, vérifier :

- [ ] Icône "TITANE∞ OS" dans menu Applications (Super → taper "TITANE")
- [ ] Double-clic icône → App window s'ouvre
- [ ] DevTools s'ouvrent avec F12
- [ ] Chat IA répond (💬 Chat → message "Bonjour" → réponse "Echo: Bonjour")
- [ ] Logs Console affichent `🧠 Starting TITANE∞ v16 Cognitive System...`
- [ ] Fichier binaire existe : `ls -lh /opt/TITANE_Infinity/titane-infinity`
- [ ] Version affichée : `TITANE∞ v16.2.2`

---

## 🎉 RÉSUMÉ

**Icône créée** : `~/Bureau/TITANE_Installer.desktop` ✅

**Actions disponibles** :
1. **Double-clic** → Installer GUI (4 modes au choix)
2. **Clic droit → Build** → Pipeline autobuild complet
3. **Clic droit → Réparation** → Self-heal mode
4. **Clic droit → Mise à jour** → Update automatique

**Installation recommandée** :
```
Double-clic icône → "Installation complète" → Attendre 10 min → "Lancer" ✅
```

**Support** :
- Logs : `/tmp/titane_install.log`
- Doc : `FIX_CHAT_IA_FINAL_v19.3.md`
- Script : `installer_gui/titane_installer.sh`

---

**🚀 TITANE∞ est prêt à être déployé via l'icône Bureau !**
