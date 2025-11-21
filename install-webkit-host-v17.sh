#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# 🔧 INSTALLATION WEBKIT SYSTÈME HÔTE - TITANE∞ v17
# ═══════════════════════════════════════════════════════════════════════════
#
# Ce script installe WebKitGTK >= 2.40 sur le système hôte
# À exécuter HORS Flatpak (terminal système : Ctrl+Alt+T)
#
# Usage: bash install-webkit-host-v17.sh
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

echo "════════════════════════════════════════════════════════════════"
echo "   🔧 INSTALLATION WEBKIT SYSTÈME - TITANE∞ v17"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Vérification environnement
if [ "$FLATPAK_ID" != "" ]; then
    echo "❌ ERREUR: Ce script doit être exécuté HORS Flatpak"
    echo ""
    echo "📋 INSTRUCTIONS:"
    echo "   1. Ouvrir terminal système (Ctrl+Alt+T)"
    echo "   2. cd ~/Documents/TITANE_NEWGEN/TITANE_INFINITY"
    echo "   3. bash install-webkit-host-v17.sh"
    echo ""
    exit 1
fi

echo "✅ Environnement: Système hôte détecté"
echo ""

# Vérification version OS
echo "📊 Détection version système..."
if [ -f /etc/os-release ]; then
    . /etc/os-release
    echo "   OS: $PRETTY_NAME"
    echo "   Version: $VERSION_ID"
else
    echo "⚠️  Impossible de détecter la version OS"
fi
echo ""

# Vérification GLIBC
echo "📊 Vérification GLIBC..."
GLIBC_VERSION=$(ldd --version | head -1 | awk '{print $NF}')
echo "   GLIBC version: $GLIBC_VERSION"

if [ "$(printf '%s\n' "2.37" "$GLIBC_VERSION" | sort -V | head -n1)" = "2.37" ]; then
    echo "   ✅ GLIBC >= 2.37 OK"
else
    echo "   ❌ GLIBC < 2.37 - Migration OS requise"
    echo ""
    echo "   Pour migrer vers Ubuntu/Pop!_OS 24.04:"
    echo "   sudo pop-upgrade release upgrade systemd"
    echo ""
    exit 1
fi
echo ""

# Installation WebKit et dépendances Tauri
echo "📦 Installation des dépendances système..."
echo "   (Mot de passe sudo requis)"
echo ""

sudo apt-get update

echo ""
echo "📦 Installation WebKitGTK 4.1 + dépendances Tauri..."
sudo apt-get install -y \
    libwebkit2gtk-4.1-dev \
    libjavascriptcoregtk-4.1-dev \
    libgtk-3-dev \
    libsoup-3.0-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    patchelf \
    libssl-dev \
    pkg-config

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "   ✅ INSTALLATION TERMINÉE!"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Vérification
echo "🔍 Vérification des installations..."
echo ""

WEBKIT_OK=false
JSC_OK=false
GTK_OK=false

if pkg-config --exists webkit2gtk-4.1; then
    WEBKIT_VERSION=$(pkg-config --modversion webkit2gtk-4.1)
    echo "   ✅ webkit2gtk-4.1: $WEBKIT_VERSION"
    WEBKIT_OK=true
    
    # Vérification version >= 2.40
    if [ "$(printf '%s\n' "2.40" "$WEBKIT_VERSION" | sort -V | head -n1)" = "2.40" ]; then
        echo "      ✅ Version >= 2.40 OK"
    else
        echo "      ⚠️  Version < 2.40 (peut causer des problèmes)"
    fi
else
    echo "   ❌ webkit2gtk-4.1: manquant"
fi

if pkg-config --exists javascriptcoregtk-4.1; then
    JSC_VERSION=$(pkg-config --modversion javascriptcoregtk-4.1)
    echo "   ✅ javascriptcoregtk-4.1: $JSC_VERSION"
    JSC_OK=true
else
    echo "   ❌ javascriptcoregtk-4.1: manquant"
fi

if pkg-config --exists gtk+-3.0; then
    GTK_VERSION=$(pkg-config --modversion gtk+-3.0)
    echo "   ✅ gtk3: $GTK_VERSION"
    GTK_OK=true
else
    echo "   ❌ gtk3: manquant"
fi

echo ""

if [ "$WEBKIT_OK" = true ] && [ "$JSC_OK" = true ] && [ "$GTK_OK" = true ]; then
    echo "════════════════════════════════════════════════════════════════"
    echo "   ✅ TOUTES LES DÉPENDANCES SONT INSTALLÉES!"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "🚀 PROCHAINES ÉTAPES (dans VS Code):"
    echo ""
    echo "1. Retour dans VS Code Flatpak"
    echo ""
    echo "2. Compiler le backend Rust:"
    echo "   cd ~/Documents/TITANE_NEWGEN/TITANE_INFINITY/src-tauri"
    echo "   cargo clean"
    echo "   cargo build --release"
    echo "   (⏱️  Temps: 5-10 minutes)"
    echo ""
    echo "3. Lancer TITANE∞ complet:"
    echo "   cd ~/Documents/TITANE_NEWGEN/TITANE_INFINITY"
    echo "   npm run dev"
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo "   🌟 WEBKIT PRÊT - BACKEND PRÊT À COMPILER!"
    echo "════════════════════════════════════════════════════════════════"
else
    echo "════════════════════════════════════════════════════════════════"
    echo "   ⚠️  INSTALLATION INCOMPLÈTE"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "Certaines dépendances sont manquantes."
    echo "Vérifiez les erreurs ci-dessus et relancez le script."
    echo ""
    exit 1
fi
