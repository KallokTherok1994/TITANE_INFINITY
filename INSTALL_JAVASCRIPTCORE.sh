#!/bin/bash

echo "════════════════════════════════════════════════════════════"
echo "  INSTALLATION JAVASCRIPTCOREGTK-4.1"
echo "  Dépendance manquante pour build Tauri production"
echo "════════════════════════════════════════════════════════════"
echo ""

echo "📦 Installation de libjavascriptcoregtk-4.1-dev..."
sudo apt-get update
sudo apt-get install -y libjavascriptcoregtk-4.1-dev

echo ""
echo "✅ Installation terminée !"
echo ""
echo "Maintenant, retourne dans VSCode et lance :"
echo "  npm run tauri:build"
echo ""
