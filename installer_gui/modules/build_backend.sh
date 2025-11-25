#!/bin/bash
# TITANE∞ OS - Build Backend

echo "🦀 Compilation du Backend Rust..."

PROJECT_DIR="$(dirname "$(dirname "$(dirname "$0")")")"
cd "$PROJECT_DIR/src-tauri"

# Build release
echo "🔧 Compilation en mode release..."
cargo build --release --no-default-features

if [ ! -f "target/release/titane-infinity" ]; then
    echo "❌ Erreur: Build backend échoué"
    exit 1
fi

echo "✅ Backend compilé avec succès"
exit 0
