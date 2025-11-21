#!/bin/bash
# TITANE∞ v15.5 - Réinstallation Propre (fresh install)
# Pour installation propre TITANE∞ après migration (sans backup)

set -e  # Arrêt si erreur

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║  🔥 RÉINSTALLATION PROPRE TITANE∞                           ║"
echo "║                                                               ║"
echo "║  Fresh install sur Pop!_OS 24.04                             ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Vérifier prérequis
echo "🔍 Vérification prérequis..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js non installé. Exécutez d'abord : ./install-popos-24.04.sh"
    exit 1
fi

if ! command -v cargo &> /dev/null; then
    echo "❌ Rust non installé. Exécutez d'abord : ./install-popos-24.04.sh"
    exit 1
fi

if ! pkg-config --exists webkit2gtk-4.1; then
    echo "❌ WebKitGTK 4.1 non installé. Exécutez d'abord : ./install-popos-24.04.sh"
    exit 1
fi

echo "  ✅ Node : $(node --version)"
echo "  ✅ NPM : $(npm --version)"
echo "  ✅ Cargo : $(cargo --version)"
echo "  ✅ WebKitGTK : $(pkg-config --modversion webkit2gtk-4.1)"
echo ""

# Localiser TITANE∞
PROJECT_DIR=""

if [ -d "$HOME/Documents/TITANE_NEWGEN/TITANE_INFINITY" ]; then
    PROJECT_DIR="$HOME/Documents/TITANE_NEWGEN/TITANE_INFINITY"
elif [ -d "$(pwd)/TITANE_INFINITY" ]; then
    PROJECT_DIR="$(pwd)/TITANE_INFINITY"
elif [ "$(basename $(pwd))" = "TITANE_INFINITY" ]; then
    PROJECT_DIR="$(pwd)"
else
    echo "❌ Projet TITANE_INFINITY non trouvé"
    echo ""
    echo "Options :"
    echo "  1. Cloner depuis Git"
    echo "  2. Copier depuis backup"
    echo "  3. Spécifier chemin manuellement"
    read -p "Choix (1-3) : " -n 1 -r
    echo
    
    case $REPLY in
        1)
            read -p "URL du repository Git : " GIT_URL
            cd "$HOME/Documents"
            git clone "$GIT_URL" TITANE_NEWGEN
            PROJECT_DIR="$HOME/Documents/TITANE_NEWGEN/TITANE_INFINITY"
            ;;
        2)
            read -p "Chemin du backup : " BACKUP_PATH
            mkdir -p "$HOME/Documents"
            cp -r "$BACKUP_PATH" "$HOME/Documents/TITANE_NEWGEN"
            PROJECT_DIR="$HOME/Documents/TITANE_NEWGEN/TITANE_INFINITY"
            ;;
        3)
            read -p "Chemin du projet : " PROJECT_DIR
            ;;
        *)
            echo "❌ Choix invalide"
            exit 1
            ;;
    esac
fi

echo "📂 Projet TITANE∞ : $PROJECT_DIR"
cd "$PROJECT_DIR"
echo ""

# Nettoyage complet
echo "🧹 1/5 Nettoyage complet..."
rm -rf node_modules
rm -rf dist
rm -rf src-tauri/target
rm -rf .vite
rm -rf package-lock.json
echo "  ✅ Cache nettoyé"
echo ""

# Installation dépendances npm
echo "📦 2/5 Installation dépendances npm..."
npm install
echo "  ✅ node_modules installés ($(ls node_modules | wc -l) packages)"
echo ""

# Type-check TypeScript
echo "📘 3/5 Vérification TypeScript..."
npm run type-check
echo "  ✅ TypeScript OK"
echo ""

# Build frontend
echo "⚡ 4/5 Build frontend..."
npm run build
echo "  ✅ Frontend compilé ($(du -sh dist 2>/dev/null | cut -f1 || echo "N/A"))"
echo ""

# Test Tauri build
echo "🦀 5/5 Test build Tauri (cela peut prendre 3-5 minutes)..."
echo ""

if npm run tauri:build 2>&1 | tee /tmp/titane_build.log; then
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                                                               ║"
    echo "║  ✅ BUILD PRODUCTION RÉUSSI !                                ║"
    echo "║                                                               ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "📦 Binaire généré :"
    ls -lh src-tauri/target/release/titane-infinity 2>/dev/null || echo "  ⚠️  Binaire non trouvé"
    echo ""
    echo "📦 Packages distribution :"
    find src-tauri/target/release/bundle -name "*.deb" -o -name "*.AppImage" 2>/dev/null || echo "  ⚠️  Packages non trouvés"
    echo ""
    echo "🎯 Tester l'application :"
    echo "  ./src-tauri/target/release/titane-infinity"
    echo ""
    echo "🚀 Lancer en mode dev :"
    echo "  npm run tauri:dev"
else
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                                                               ║"
    echo "║  ❌ BUILD ÉCHOUÉ                                             ║"
    echo "║                                                               ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "📋 Log d'erreur : /tmp/titane_build.log"
    echo ""
    echo "Dernières lignes :"
    tail -30 /tmp/titane_build.log
    exit 1
fi
