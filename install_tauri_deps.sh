#!/bin/bash

# Script d'installation des dépendances Tauri depuis Flatpak VSCode
# Ce script utilise flatpak-spawn pour exécuter les commandes sur l'hôte

echo "════════════════════════════════════════════════════════════════"
echo "   🔧 Installation des dépendances Tauri (depuis Flatpak)"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "⚠️  ATTENTION : Ce script nécessite votre mot de passe root"
echo ""

# Vérifier si nous sommes dans Flatpak
if [ -f /.flatpak-info ]; then
    echo "✅ Détection : VSCode Flatpak"
    SPAWN_CMD="flatpak-spawn --host"
else
    echo "✅ Détection : Système hôte direct"
    SPAWN_CMD=""
fi

echo ""
echo "📦 Installation des packages système requis..."
echo ""

# Commandes d'installation
$SPAWN_CMD sudo apt-get update

$SPAWN_CMD sudo apt-get install -y \
  libwebkit2gtk-4.1-dev \
  libjavascriptcoregtk-4.1-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  patchelf

if [ $? -eq 0 ]; then
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo "   ✅ DÉPENDANCES INSTALLÉES AVEC SUCCÈS"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "🚀 Vous pouvez maintenant lancer le build Tauri :"
    echo ""
    echo "   ./build_tauri_complete.sh"
    echo ""
    echo "   OU"
    echo ""
    echo "   npm run tauri build"
    echo ""
else
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo "   ❌ ERREUR D'INSTALLATION"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "💡 Essayez manuellement dans un terminal hôte :"
    echo ""
    echo "   sudo apt-get update"
    echo "   sudo apt-get install -y libwebkit2gtk-4.1-dev libjavascriptcoregtk-4.1-dev"
    echo ""
fi
