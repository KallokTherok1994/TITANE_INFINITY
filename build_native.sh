#!/bin/bash
# Script de compilation TITANE∞ v15.5 depuis le système hôte

set -e

echo "🔨 Compilation TITANE∞ v15.5"
echo "============================"
echo ""

# Vérifier webkit
echo "📦 Vérification des dépendances..."
if pkg-config --exists webkit2gtk-4.1 2>/dev/null; then
    echo "✅ webkit2gtk-4.1 trouvé"
    WEBKIT_VERSION="4.1"
elif pkg-config --exists webkit2gtk-4.0 2>/dev/null; then
    echo "✅ webkit2gtk-4.0 trouvé"
    WEBKIT_VERSION="4.0"
else
    echo "❌ Aucune version de webkit2gtk trouvée"
    echo ""
    echo "Installez webkit avec:"
    echo "  sudo apt-get install libwebkit2gtk-4.0-dev libjavascriptcoregtk-4.0-dev"
    exit 1
fi

echo ""
echo "🧹 Nettoyage du cache cargo..."
cd /home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY/src-tauri
rm -rf target/.cargo-lock

echo ""
echo "🚀 Compilation Rust (backend)..."
cargo build --release 2>&1 | tee /tmp/titane_build.log

if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo ""
    echo "✅ Backend compilé avec succès!"
    echo ""
    echo "📦 Build frontend..."
    cd /home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY
    npm run build
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 COMPILATION COMPLÈTE RÉUSSIE !"
        echo ""
        echo "Binary: src-tauri/target/release/titane-infinity"
        echo "Taille: $(du -h src-tauri/target/release/titane-infinity | cut -f1)"
        echo ""
        echo "Pour lancer l'application:"
        echo "  ./src-tauri/target/release/titane-infinity"
        echo "ou"
        echo "  npm run tauri:dev"
    else
        echo "❌ Erreur compilation frontend"
        exit 1
    fi
else
    echo ""
    echo "❌ Erreur compilation backend"
    echo "Log complet: /tmp/titane_build.log"
    exit 1
fi
