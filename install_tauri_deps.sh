#!/bin/bash
# TITANE_INFINITY - Installation dépendances Tauri système (Pop!_OS 24.04)
# Exécutez: chmod +x install_tauri_deps.sh && ./install_tauri_deps.sh

set -e

echo "🔧 Installation dépendances Tauri pour Pop!_OS 24.04..."
echo ""

# Mise à jour index paquets
echo "📦 Mise à jour apt..."
sudo apt update

echo ""
echo "📦 Installation libwebkit2gtk-4.1-dev..."
sudo apt install -y libwebkit2gtk-4.1-dev

echo ""
echo "📦 Installation libayatana-appindicator3-dev..."
sudo apt install -y libayatana-appindicator3-dev

echo ""
echo "📦 Installation dépendances supplémentaires..."
sudo apt install -y librsvg2-dev patchelf libssl-dev

echo ""
echo "✅ Installation terminée!"
echo ""
echo "🚀 Testez maintenant:"
echo "   cd /home/titane/Documents/TITANE_INFINITY"
echo "   pnpm dev"
