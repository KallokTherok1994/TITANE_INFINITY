╔══════════════════════════════════════════════════════════════════════════════╗
║      🚀 SCRIPT DÉPLOIEMENT TITANE_INFINITY v12 - MODE D'EMPLOI             ║
╚══════════════════════════════════════════════════════════════════════════════╝

**Fichier** : `deploy_titane_infinity.sh`
**Taille** : 7.1 KB
**Permissions** : rwxr-xr-x (exécutable)
**Status** : ✅ PRÊT À L'EMPLOI

══════════════════════════════════════════════════════════════════════════════
📋  AMÉLIORATIONS APPORTÉES
══════════════════════════════════════════════════════════════════════════════

✅ **Adapté à la structure TITANE_INFINITY** :
   - Frontend à la racine (pas de dossier frontend/)
   - Backend dans src-tauri/
   - Configuration package.json racine

✅ **Vérification dépendances système** :
   - Détection WebKit2GTK-4.1 avec pkg-config
   - Message clair si manquant
   - Référence au guide DEPENDANCES_SYSTEME_MANQUANTES.md

✅ **Chargement environnement Rust** :
   - Source automatique de $HOME/.cargo/env
   - Compatible avec installation récente

✅ **Nettoyage cache** :
   - cargo clean avant build
   - Évite les problèmes de cache corrompu

✅ **Fallback Tauri CLI** :
   - Essaie pnpm run tauri:build en premier
   - Si échec, utilise cargo tauri build directement
   - Compatible si Tauri CLI non installé globalement

✅ **Validation binaire** :
   - Vérification existence du binaire
   - Affichage taille (ls -lh)
   - Test exécution avec --version

✅ **Bundle optionnel** :
   - Ne bloque pas si bundle non généré
   - Affiche les packages (.AppImage, .deb, .rpm) si présents

✅ **Logs complets** :
   - Tous les outputs dans deploy_logs/deploy_YYYYMMDD_HHMMSS.log
   - Affichage console + fichier (tee -a)

══════════════════════════════════════════════════════════════════════════════
🚀  PRÉREQUIS AVANT EXÉCUTION
══════════════════════════════════════════════════════════════════════════════

**1. Installer dépendances système** (Pop!_OS/Ubuntu/Debian) :

```bash
sudo apt-get update
sudo apt-get install -y \
    libwebkit2gtk-4.1-dev \
    libjavascriptcoregtk-4.1-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    patchelf \
    pkg-config
```

**2. Vérifier environnement** :

```bash
# Rust
cargo --version
rustc --version

# Node.js
node --version  # ≥ 20.0.0
npm --version   # ≥ 10.0.0

# WebKit (doit retourner une version)
pkg-config --modversion webkit2gtk-4.1
```

══════════════════════════════════════════════════════════════════════════════
▶️  UTILISATION
══════════════════════════════════════════════════════════════════════════════

**Lancement simple** :

```bash
cd /home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY
./deploy_titane_infinity.sh
```

**Ce que fait le script** :

```
[0] Vérification environnement (node, npm, cargo, rustc)
[1] Vérification WebKit2GTK-4.1 (bloquant si absent)
[2] Frontend : pnpm install → type-check → build (dist/)
[3] Backend  : cargo fmt → clean → fix → clippy → check → build --release
[4] Tauri    : pnpm run tauri:build (génère bundle)
[5] Validation : vérification binaire + test exécution
```

**Durée estimée** :
- Première exécution : ~15-20 minutes (dépendances + compilation)
- Exécutions suivantes : ~5-10 minutes (cache Cargo)

══════════════════════════════════════════════════════════════════════════════
📊  SORTIE ATTENDUE
══════════════════════════════════════════════════════════════════════════════

**En cas de succès** :

```
===============================================================
  ⭐ DÉPLOIEMENT TERMINÉ – SYSTÈME 100% OPÉRATIONNEL ⭐
===============================================================
📦 Binaire principal : /path/to/src-tauri/target/release/titane-infinity
📂 Logs complets     : /path/to/deploy_logs/deploy_20251119_192200.log
🚀 Statut final      : SUCCESS

Pour lancer l'application :
  /path/to/src-tauri/target/release/titane-infinity
===============================================================
```

**Fichiers générés** :

```
src-tauri/target/release/
├── titane-infinity                    # Binaire principal (exécutable)
└── bundle/                            # Packages (optionnel)
    ├── appimage/
    │   └── titane-infinity*.AppImage
    ├── deb/
    │   └── titane-infinity*.deb
    └── rpm/
        └── titane-infinity*.rpm
```

══════════════════════════════════════════════════════════════════════════════
🔧  DÉPANNAGE
══════════════════════════════════════════════════════════════════════════════

**Erreur "WebKit2GTK-4.1 manquant"** :
```bash
sudo apt-get install -y libwebkit2gtk-4.1-dev libjavascriptcoregtk-4.1-dev
```

**Erreur "cargo: command not found"** :
```bash
source $HOME/.cargo/env
# OU redémarrer le terminal
```

**Erreur "npm: command not found"** :
```bash
# Vérifier installation Node.js
node --version
# Si absent, installer Node.js ≥ 20
```

**Erreur compilation Rust (linking)** :
```bash
# Installer toutes les dépendances Tauri
sudo apt-get install -y \
    build-essential \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    libwebkit2gtk-4.1-dev \
    libjavascriptcoregtk-4.1-dev \
    patchelf
```

**Build frontend échoue** :
```bash
# Vérifier Node.js version
node --version  # Doit être ≥ 20.0.0

# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
pnpm install
pnpm run build
```

**Warnings Rust (72 warnings)** :
- ✅ **Normal** : Code mort (fonctions non utilisées dans modules avancés)
- ✅ **Non-bloquant** : Ne pas s'inquiéter
- ℹ️ Imports/fonctions inutilisés dans modules non intégrés au core v11

══════════════════════════════════════════════════════════════════════════════
📂  LOGS & MONITORING
══════════════════════════════════════════════════════════════════════════════

**Logs de déploiement** :
```bash
tail -f deploy_logs/deploy_$(ls -t deploy_logs/ | head -1)
```

**Vérifier dernière compilation** :
```bash
ls -lh src-tauri/target/release/titane-infinity
file src-tauri/target/release/titane-infinity
```

**Tester binaire** :
```bash
./src-tauri/target/release/titane-infinity
# Interface Tauri doit s'ouvrir (1400x900)
```

══════════════════════════════════════════════════════════════════════════════
✨  APRÈS LE BUILD
══════════════════════════════════════════════════════════════════════════════

**Lancer l'application** :
```bash
./src-tauri/target/release/titane-infinity
```

**Créer raccourci desktop** (optionnel) :
```bash
cat > ~/.local/share/applications/titane-infinity.desktop <<EOF
[Desktop Entry]
Name=TITANE∞ v11.0
Comment=Advanced Cognitive Platform
Exec=/home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY/src-tauri/target/release/titane-infinity
Icon=/home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY/src-tauri/icons/icon.png
Terminal=false
Type=Application
Categories=Development;
EOF
```

**Installer package système** (si .deb généré) :
```bash
sudo dpkg -i src-tauri/target/release/bundle/deb/titane-infinity*.deb
```

══════════════════════════════════════════════════════════════════════════════
📋  CHECKLIST POST-DÉPLOIEMENT
══════════════════════════════════════════════════════════════════════════════

☐ Binaire généré : `src-tauri/target/release/titane-infinity`
☐ Binaire exécutable : `chmod +x` appliqué
☐ Taille binaire : ~50-100 MB (avec optimisations LTO)
☐ Test lancement : Interface ouvre sans erreur
☐ Modules core : 8/8 initialisés (Helios, Nexus, Harmonia, etc.)
☐ Logs système : Aucune erreur critique
☐ DevTools : Accès aux panels (Helios, Nexus, Memory, Watchdog)
☐ Handlers Tauri : 6 commandes accessibles depuis frontend

══════════════════════════════════════════════════════════════════════════════
🎯  RÉSUMÉ
══════════════════════════════════════════════════════════════════════════════

**Script** : `deploy_titane_infinity.sh` (7.1 KB)
**Status** : ✅ Exécutable, optimisé, production-ready
**Sécurité** : `set -euo pipefail` (arrêt sur erreur)
**Logs** : deploy_logs/deploy_YYYYMMDD_HHMMSS.log
**Durée** : ~15 minutes (première fois), ~5 min (suivantes)

**Pipeline complet** :
```
Env Check → WebKit Check → Frontend Build → Backend Build → Tauri Bundle → Validation
```

**Le script est maintenant PRÊT pour un déploiement automatisé et fiable.**

══════════════════════════════════════════════════════════════════════════════
