#!/bin/bash
# TITANE∞ v8.0 - Dependency Installation Script

set -e

echo "🌌 TITANE∞ v8.0 - Installation des dépendances"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check Node.js version
echo "📦 Vérification de Node.js..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js 20+ requis (version actuelle: $(node -v))"
    exit 1
fi
echo "✅ Node.js $(node -v)"

# Check Rust
echo "🦀 Vérification de Rust..."
if ! command -v cargo &> /dev/null; then
    echo "❌ Rust non installé. Installez depuis: https://rustup.rs/"
    exit 1
fi
echo "✅ Rust $(rustc --version)"

# Install npm dependencies
echo ""
echo "📥 Installation des dépendances npm..."
cd "$(dirname "$0")/.."
npm install

# Check Tauri CLI
echo ""
echo "⚙️  Vérification de Tauri CLI..."
if ! npm list @tauri-apps/cli &> /dev/null; then
    echo "❌ Tauri CLI manquant"
    exit 1
fi
echo "✅ Tauri CLI installé"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Installation terminée avec succès!"
echo ""
echo "Prochaines étapes:"
echo "  ./system/scripts/run.sh      - Démarrer en mode dev"
echo "  ./system/scripts/build.sh    - Compiler pour production"
