#!/bin/bash

# TITANE∞ v9.0.0 - Script de Lancement Tauri
# Lance l'application Tauri en mode développement

cd "$(dirname "$0")"

echo "🚀 TITANE∞ v9.0.0 - Lancement de l'application Tauri..."
echo ""

# Vérifier si npm est disponible
if ! command -v npm &> /dev/null; then
    echo "❌ Erreur: npm n'est pas installé ou pas dans le PATH"
    echo ""
    echo "Solutions:"
    echo "1. Si vous utilisez nvm via Flatpak:"
    echo "   flatpak run --command=bash io.github.nvm_sh.nvm -c 'cd $(pwd) && npm run tauri dev'"
    echo ""
    echo "2. Ou installez Node.js directement sur votre système:"
    echo "   sudo apt install nodejs npm  # Sur Ubuntu/Debian"
    echo "   sudo dnf install nodejs npm  # Sur Fedora"
    exit 1
fi

echo "✅ npm trouvé: $(which npm)"
echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""
echo "📦 Installation des dépendances si nécessaire..."
npm install

echo ""
echo "🔧 Lancement de Tauri en mode développement..."
echo "   Cela va:"
echo "   - Démarrer le serveur Vite (frontend)"
echo "   - Compiler le backend Rust"
echo "   - Ouvrir la fenêtre de l'application"
echo ""

npm run tauri dev
