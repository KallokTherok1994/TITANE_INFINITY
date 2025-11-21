#!/bin/bash
# TITANE∞ v8.0 - Clean Script

set -e

echo "🧹 TITANE∞ v8.0 - Nettoyage complet"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$(dirname "$0")/../.."

# Clean npm
if [ -d "node_modules" ]; then
    echo "🗑️  Suppression de node_modules..."
    rm -rf node_modules
fi

# Clean build artifacts
if [ -d "dist" ]; then
    echo "🗑️  Suppression de dist..."
    rm -rf dist
fi

# Clean Rust target
if [ -d "src-tauri/target" ]; then
    echo "🗑️  Suppression de target Rust..."
    rm -rf src-tauri/target
fi

# Clean package lock
if [ -f "package-lock.json" ]; then
    echo "🗑️  Suppression de package-lock.json..."
    rm -f package-lock.json
fi

# Clean Cargo lock
if [ -f "src-tauri/Cargo.lock" ]; then
    echo "🗑️  Suppression de Cargo.lock..."
    rm -f src-tauri/Cargo.lock
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Nettoyage terminé!"
echo ""
echo "Pour réinstaller: ./system/scripts/install_deps.sh"
