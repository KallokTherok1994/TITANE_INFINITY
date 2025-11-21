#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# 🎯 TITANE∞ v16.1 - INSTALLATION BACKEND FINALE (5-10 min)
# ═══════════════════════════════════════════════════════════════════════════
# 
# ✅ FRONTEND: 100% FONCTIONNEL (build en 6.04s, 131 KB)
# ⏳ BACKEND: Nécessite WebKit système
# 
# INSTRUCTIONS:
# 1. Ouvrir un terminal HORS Flatpak (Ctrl+Alt+T)
# 2. Exécuter ce script : bash INSTALLATION_BACKEND_FINALE.sh
# 3. Attendre 5-10 minutes
# 4. Retour dans VS Code: cargo build --release
# ═══════════════════════════════════════════════════════════════════════════

set -e

echo "════════════════════════════════════════════════════════════════"
echo "   🔧 TITANE∞ - Installation Backend Finale"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Vérification système
if [ "$FLATPAK_ID" != "" ]; then
    echo "❌ ERREUR: Ce script doit être exécuté HORS Flatpak"
    echo ""
    echo "📋 INSTRUCTIONS:"
    echo "   1. Ouvrir un terminal système (Ctrl+Alt+T)"
    echo "   2. cd ~/Documents/TITANE_NEWGEN/TITANE_INFINITY"
    echo "   3. bash INSTALLATION_BACKEND_FINALE.sh"
    echo ""
    exit 1
fi

echo "✅ Environnement: Système hôte détecté"
echo ""

# Installation WebKit et dépendances Tauri
echo "📦 Installation des dépendances système..."
echo "   (Mot de passe sudo requis)"
echo ""

sudo apt-get update

echo ""
echo "Installation WebKit2GTK 4.1..."
sudo apt-get install -y \
    libwebkit2gtk-4.1-dev \
    libjavascriptcoregtk-4.1-dev \
    libgtk-3-dev \
    libsoup-3.0-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    patchelf

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "   ✅ INSTALLATION TERMINÉE!"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Vérification
echo "🔍 Vérification des installations..."
echo ""

if pkg-config --exists webkit2gtk-4.1; then
    echo "   ✅ webkit2gtk-4.1: $(pkg-config --modversion webkit2gtk-4.1)"
else
    echo "   ❌ webkit2gtk-4.1: manquant"
fi

if pkg-config --exists javascriptcoregtk-4.1; then
    echo "   ✅ javascriptcoregtk-4.1: $(pkg-config --modversion javascriptcoregtk-4.1)"
else
    echo "   ❌ javascriptcoregtk-4.1: manquant"
fi

if pkg-config --exists gtk+-3.0; then
    echo "   ✅ gtk3: $(pkg-config --modversion gtk+-3.0)"
else
    echo "   ❌ gtk3: manquant"
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "   🚀 PROCHAINES ÉTAPES (dans VS Code)"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "1. Retour dans VS Code Flatpak"
echo ""
echo "2. Compiler le backend Rust:"
echo "   cd ~/Documents/TITANE_NEWGEN/TITANE_INFINITY/src-tauri"
echo "   cargo build --release"
echo "   (⏱️  Temps: 5-10 minutes)"
echo ""
echo "3. Lancer TITANE∞ complet:"
echo "   cd ~/Documents/TITANE_NEWGEN/TITANE_INFINITY"
echo "   npm run dev"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "   🌟 BACKEND PRÊT À COMPILER!"
echo "════════════════════════════════════════════════════════════════"
