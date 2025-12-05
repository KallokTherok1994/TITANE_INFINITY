#!/bin/bash
set -e

echo "=========================================="
echo "🚀 TITANE∞ v24.1 - DÉPLOIEMENT OPTIMAL"
echo "=========================================="
echo ""

# Vérification du service TTS
echo "📡 Vérification du service TTS Parler..."
if pgrep -f "tts_api_server.py" > /dev/null; then
    echo "✅ Service TTS actif"
else
    echo "⚠️  Service TTS inactif - Redémarrage..."
    cd tts-service && ./start_tts_background.sh && cd ..
fi

# Installation des dépendances Node.js
echo ""
echo "📦 Installation des dépendances Node.js..."
npm install

# Installation des dépendances Rust
echo ""
echo "🦀 Vérification des dépendances Rust..."
cd src-tauri
cargo check --quiet
cd ..

# Type checking
echo ""
echo "🔍 Vérification TypeScript..."
npm run type-check

# Build optimisé
echo ""
echo "⚡ Build de production optimisé..."
npm run build

# Build Tauri en mode release
echo ""
echo "🔨 Build Tauri (mode release)..."
npm run tauri:build

echo ""
echo "=========================================="
echo "✅ DÉPLOIEMENT COMPLET RÉUSSI"
echo "=========================================="
echo ""
echo "📍 Binaire de production:"
find src-tauri/target/release/bundle -name "*.AppImage" -o -name "*.deb" | head -1
echo ""
echo "🎯 Pour lancer l'application:"
echo "   ./src-tauri/target/release/titane-infinity"
echo ""

