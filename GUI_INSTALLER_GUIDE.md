# 🖥️ TITANE∞ OS - Installateur Graphique (Zenity)

**Version:** v19.1.0
**Date:** 25 novembre 2025
**Phase:** 2 - Interface utilisateur d'installation

---

## 📋 Vue d'ensemble

L'installateur graphique TITANE∞ OS offre une expérience d'installation conviviale via Zenity, permettant une installation système complète sans ligne de commande.

### ✨ Fonctionnalités

- ✅ Interface graphique intuitive (Zenity)
- ✅ Barres de progression en temps réel
- ✅ 4 modes d'installation
- ✅ Détection automatique des erreurs
- ✅ Installation système complète (/opt/)
- ✅ Raccourci menu Applications
- ✅ Logs détaillés

---

## 🚀 Lancement rapide

### Installation graphique

```bash
bash installer_gui/titane_installer.sh
```

### Désinstallation graphique

```bash
bash installer_gui/titane_uninstaller.sh
```

### Mise à jour graphique

```bash
bash installer_gui/titane_updater.sh
```

---

## 📁 Structure

```
installer_gui/
├── titane_installer.sh          # Installateur principal (GUI)
├── titane_uninstaller.sh        # Désinstallateur (GUI)
├── titane_updater.sh            # Mise à jour (GUI)
├── modules/
│   ├── pre_checks.sh           # Vérification prérequis
│   ├── install_dependencies.sh # Installation dépendances
│   ├── build_frontend.sh       # Build React + Vite
│   ├── build_backend.sh        # Build Rust
│   ├── build_tauri.sh          # Build Tauri
│   ├── deploy_os.sh            # Déploiement OS
│   ├── create_desktop_entry.sh # Raccourci menu
│   └── post_install.sh         # Finalisation
└── ui/                          # (Réservé pour futures extensions)
```

---

## 🎯 Modes d'installation

### 1. Installation complète

**Pipeline complet (7 phases) :**

1. **Vérification prérequis** (0-10%)
   - Check Rust, Node, PNPM, WebKitGTK
   - Validation espace disque (>= 5 GB)

2. **Installation dépendances** (10-25%)
   - Auto-install Rust (si manquant)
   - Installation PNPM
   - Installation WebKitGTK 4.1

3. **Build Frontend** (25-50%)
   - `pnpm install` (639 packages)
   - `pnpm build` (dist/ généré)

4. **Build Backend** (50-70%)
   - `cargo build --release --no-default-features`
   - Binaire: 280 modules compilés

5. **Build Tauri** (70-85%)
   - `pnpm tauri build --no-bundle`
   - Packaging final

6. **Déploiement OS** (85-95%)
   - Copie vers `/opt/TITANE_Infinity/`
   - Configuration permissions

7. **Création raccourci** (95-100%)
   - Génération `.desktop`
   - Mise à jour menu Applications

**Durée totale:** 3-10 minutes (selon machine)

---

### 2. Réinstallation

- Nettoyage de l'installation précédente
- Rebuild complet (auto_build.sh)
- Redéploiement

**Durée:** 2-5 minutes

---

### 3. Réparation (Self-Heal)

- Analyse système complète
- Vérification intégrité fichiers
- Réparation automatique
- Logs détaillés

**Durée:** 1-3 minutes

---

### 4. Mise à jour

- Vérification mises à jour Git
- Self-Heal préventif
- Rebuild + Redéploiement
- Conservation des données

**Durée:** 2-5 minutes

---

## 🖼️ Interface utilisateur

### Écran de bienvenue

```
┌──────────────────────────────────────────────────┐
│  TITANE∞ OS Installer                           │
│                                                  │
│  Bienvenue dans TITANE∞ OS Installer           │
│                                                  │
│  Version: v19.1.0                               │
│  Installation native, locale et sécurisée      │
│                                                  │
│  Ce programme va installer TITANE∞ OS sur       │
│  votre système.                                 │
│                                                  │
│                       [OK]                       │
└──────────────────────────────────────────────────┘
```

### Sélection du mode

```
┌──────────────────────────────────────────────────┐
│  Mode d'installation                             │
│                                                  │
│  ○ Installation complète                        │
│    Installation complète avec toutes les        │
│    dépendances                                  │
│                                                  │
│  ○ Réinstallation                               │
│    Réinstaller TITANE∞ OS (conserve données)   │
│                                                  │
│  ○ Réparation (Self-Heal)                       │
│    Réparer l'installation existante            │
│                                                  │
│  ○ Mise à jour                                  │
│    Mettre à jour vers la dernière version      │
│                                                  │
│                [OK]      [Annuler]              │
└──────────────────────────────────────────────────┘
```

### Barre de progression

```
┌──────────────────────────────────────────────────┐
│  TITANE∞ OS - Installation en cours             │
│                                                  │
│  Compilation du Backend (Rust + Tauri)...       │
│                                                  │
│  ████████████████░░░░░░░░░░░░░░░  50%          │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Écran de succès

```
┌──────────────────────────────────────────────────┐
│  TITANE∞ OS - Installation terminée             │
│                                                  │
│  ✅ TITANE∞ OS installé avec succès !          │
│                                                  │
│  Installation: /opt/TITANE_Infinity             │
│  Logs: /tmp/titane_install.log                  │
│                                                  │
│  Voulez-vous lancer TITANE∞ OS maintenant ?    │
│                                                  │
│              [Lancer]      [Fermer]             │
└──────────────────────────────────────────────────┘
```

### Gestion des erreurs

```
┌──────────────────────────────────────────────────┐
│  TITANE∞ OS - Erreur                            │
│                                                  │
│  ❌ Installation échouée                        │
│                                                  │
│  Échec de la vérification des prérequis.       │
│  Consultez /tmp/titane_install.log             │
│                                                  │
│                       [OK]                       │
└──────────────────────────────────────────────────┘
```

---

## 🔧 Modules détaillés

### pre_checks.sh

**Fonction:** Vérification complète du système avant installation

**Vérifications:**
- Rust >= 1.70
- Node.js >= 18
- PNPM >= 8
- WebKitGTK 4.1
- GCC (build-essential)
- Espace disque >= 5 GB

**Sortie:**
```
✅ Toutes les dépendances sont présentes
```

---

### install_dependencies.sh

**Fonction:** Installation automatique des dépendances manquantes

**Actions:**
1. Installation Rust (curl rustup.rs)
2. Installation PNPM (npm -g)
3. Installation WebKitGTK + GTK3 (apt)

**Packages installés:**
- `libwebkit2gtk-4.1-dev`
- `libgtk-3-dev`
- `libayatana-appindicator3-dev`
- `librsvg2-dev`
- `patchelf`
- `build-essential`

---

### build_frontend.sh

**Fonction:** Compilation du Frontend React + Vite

**Étapes:**
1. `pnpm install` → 639 packages
2. `pnpm build` → génération dist/
3. Validation dist/ existe

**Résultat:**
- dist/ (919 kB → 250 kB gzip)
- 11 chunks optimisés

---

### build_backend.sh

**Fonction:** Compilation Backend Rust

**Commande:**
```bash
cargo build --release --no-default-features
```

**Résultat:**
- Binaire: `target/release/titane-infinity`
- Taille: ~10-15 MB (optimisé)
- Compilation: 280 modules

---

### build_tauri.sh

**Fonction:** Build application Tauri finale

**Commande:**
```bash
pnpm tauri build --no-bundle
```

**Options:**
- `--no-bundle` → Garde binaire simple (pas .deb/.AppImage)
- Intégration dist/ + backend

---

### deploy_os.sh

**Fonction:** Déploiement système dans /opt/

**Actions:**
1. Création `/opt/TITANE_Infinity/`
2. Copie `dist/` (Frontend)
3. Copie `titane-infinity` (Binaire)
4. Copie `icon.png`
5. Configuration permissions
6. Création dossier `logs/`

**Structure finale:**
```
/opt/TITANE_Infinity/
├── titane-infinity       # Binaire principal
├── dist/                 # Frontend assets
│   ├── index.html
│   └── assets/
├── icon.png             # Icône application
└── logs/                # Logs runtime
```

---

### create_desktop_entry.sh

**Fonction:** Création raccourci menu Applications

**Fichier généré:**
```desktop
[Desktop Entry]
Name=TITANE∞ OS
Comment=Système IA Unifié - Version Infinie
Exec=/opt/TITANE_Infinity/titane-infinity
Icon=/opt/TITANE_Infinity/icon.png
Type=Application
Categories=Utility;AI;System;Development;
Terminal=false
StartupNotify=true
Keywords=AI;IA;System;TITANE;Intelligence;
```

**Emplacements:**
- Système: `/usr/share/applications/titane-infinity.desktop`
- Local: `~/.local/share/applications/titane-infinity.desktop`

---

### post_install.sh

**Fonction:** Finalisation + Rapport d'installation

**Actions:**
1. Nettoyage caches build
2. Génération rapport JSON
3. Vérification finale
4. Bannière de succès

**Rapport généré:**
```json
{
  "status": "installed",
  "version": "v19.1.0",
  "date": "2025-11-25T09:50:00Z",
  "install_dir": "/opt/TITANE_Infinity",
  "user": "titane",
  "system": "Linux 6.x"
}
```

---

## 📊 Logs et traces

### Logs d'installation

**Emplacement:** `/tmp/titane_install.log`

**Contenu:**
- Toutes les sorties des modules
- Messages d'erreur détaillés
- Timestamps de chaque phase

**Exemple:**
```log
[2025-11-25 09:45:00] 🔍 Vérification du système...
[2025-11-25 09:45:02] ✅ Rust 1.70 détecté
[2025-11-25 09:45:03] ✅ Node.js 18.x détecté
[2025-11-25 09:45:05] 📦 Installation des dépendances...
[2025-11-25 09:48:00] 🎨 Compilation du Frontend...
...
```

---

### Rapport d'installation

**Emplacement:** `/opt/TITANE_Infinity/logs/install_report.json`

**Utilité:**
- Traçabilité de l'installation
- Support technique
- Diagnostic version

---

## 🎨 Personnalisation

### Icône d'application

**Ajouter une icône personnalisée:**

1. Créer l'icône (PNG 512x512):
   ```bash
   installer/assets/icon.png
   ```

2. L'installateur la copiera automatiquement

**Format recommandé:**
- Taille: 512x512 px
- Format: PNG avec transparence
- Style: Minimal, moderne

---

### Thème Zenity

Zenity utilise le thème GTK système. Pour personnaliser:

```bash
# Changer le thème GTK
gsettings set org.gnome.desktop.interface gtk-theme "Adwaita-dark"
```

---

## 🐛 Dépannage

### Erreur: Zenity non installé

**Symptôme:**
```
❌ Zenity n'est pas installé
```

**Solution:**
```bash
sudo apt-get install zenity
```

---

### Erreur: WebKitGTK manquant

**Symptôme:**
```
⚠️ Certaines dépendances sont manquantes
```

**Solution automatique:**
L'installateur propose d'installer automatiquement via le module `install_dependencies.sh`.

**Solution manuelle:**
```bash
sudo apt-get install libwebkit2gtk-4.1-dev
```

---

### Build échoue

**Symptôme:**
```
❌ Erreur: Build frontend échoué
```

**Solution:**
1. Consulter `/tmp/titane_install.log`
2. Lancer Self-Heal:
   ```bash
   bash installer/self_heal.sh
   ```
3. Réessayer l'installation

---

### Permissions insuffisantes

**Symptôme:**
```
Permission denied: /opt/TITANE_Infinity
```

**Solution:**
L'installateur utilise `sudo` automatiquement pour les opérations système.

---

## 📦 Désinstallation graphique

### Lancement

```bash
bash installer_gui/titane_uninstaller.sh
```

### Processus

1. **Confirmation interactive** (dialogue Zenity)
2. **Suppression complète:**
   - `/opt/TITANE_Infinity/`
   - Raccourcis `.desktop`
   - Caches locaux
3. **Barre de progression**
4. **Confirmation finale**

### Nettoyage inclus

- ✅ Dossier d'installation
- ✅ Raccourcis menu
- ✅ Caches `~/.cache/TITANE_Infinity`
- ❌ Données utilisateur (conservées)

---

## 🔄 Mise à jour graphique

### Lancement

```bash
bash installer_gui/titane_updater.sh
```

### Pipeline

1. **Vérification Git** (fetch + pull)
2. **Self-Heal préventif**
3. **Rebuild Frontend**
4. **Rebuild Backend**
5. **Redéploiement**

### Conservation

- ✅ Données utilisateur
- ✅ Configuration
- ✅ Logs
- ❌ Binaires (remplacés)

---

## 🚀 Utilisation avancée

### Installation silencieuse (sans GUI)

Pour automatisation CI/CD, utilisez la version CLI:

```bash
bash installer/install.sh
```

---

### Installation personnalisée

Modifier les variables dans `titane_installer.sh`:

```bash
INSTALL_DIR="/opt/TITANE_Custom"  # Dossier personnalisé
```

---

### Multi-utilisateurs

Chaque utilisateur peut lancer TITANE∞ OS via son propre menu Applications.

**Partage de l'installation:**
- Installation système: `/opt/` (partagée)
- Données utilisateur: `~/.cache/` (séparées)

---

## 📈 Statistiques

### Tailles d'installation

- **Frontend (dist/):** ~919 kB (250 kB gzip)
- **Backend (binaire):** ~10-15 MB
- **Total installé:** ~15-20 MB
- **Dépendances (dev):** ~2 GB (PNPM cache + Cargo)

### Temps d'installation

| Phase | Durée typique |
|-------|--------------|
| Vérification | 5-10s |
| Dépendances | 30-120s |
| Build Frontend | 30-60s |
| Build Backend | 60-300s |
| Déploiement | 10-20s |
| **Total** | **3-10 min** |

---

## 🎯 Prochaines étapes

### Phase 3 (prochainement)

**Control Panel React:**
- Interface UI intégrée
- 10 sections de configuration
- 15+ commandes Tauri
- Dashboard temps réel

---

## 📚 Références

- **Auto-Build Guide:** `AUTO_BUILD_GUIDE.md`
- **Implementation Report:** `AUTO_SYSTEM_IMPLEMENTATION_REPORT.md`
- **Test Report:** `RAPPORT_TESTS_FINAL_v19.1.0.md`

---

## ✅ Checklist validation

- [x] Installateur GUI fonctionnel
- [x] Barres de progression
- [x] Gestion d'erreurs
- [x] 4 modes d'installation
- [x] Désinstallateur GUI
- [x] Mise à jour GUI
- [x] Logs détaillés
- [x] Documentation complète

---

**Phase 2 terminée avec succès ! 🎉**
