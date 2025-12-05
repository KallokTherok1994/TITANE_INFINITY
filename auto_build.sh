#!/bin/bash
# TITANE∞ OS - Auto Build Complete

set -e

echo "╔══════════════════════════════════════════════════════════╗"
echo "║   TITANE∞ AUTO-BUILD SYSTEM                             ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

PROJECT_DIR="$(dirname "$0")"
cd "$PROJECT_DIR"

# 1. Self-Heal préventif
echo "🔧 [1/4] Self-Heal préventif..."
bash installer/self_heal.sh || {
    echo "⚠️  Self-Heal a détecté des problèmes (non-bloquant)"
}

# 2. Build Frontend
echo "🎨 [2/4] Build Frontend (Vite + React)..."
pnpm install
pnpm build

# 3. Build Backend
echo "🦀 [3/4] Build Backend (Rust + Tauri)..."
cd src-tauri
cargo build --release --no-default-features

# 4. Validation
echo "✅ [4/4] Validation du build..."
if [ -f "target/release/titane-infinity" ] && [ -d "../dist" ]; then
    echo ""
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║   ✅ Build TITANE∞ terminé avec succès !                ║"
    echo "║                                                          ║"
    echo "║   Binaire: src-tauri/target/release/titane-infinity     ║"
    echo "║   Frontend: dist/                                       ║"
    echo "║                                                          ║"
    echo "║   Lancer: pnpm tauri dev                                ║"
    echo "║   Installer: sudo bash installer/install.sh             ║"
    echo "╚══════════════════════════════════════════════════════════╝"
else
    echo "❌ Erreur: Build incomplet"
    exit 1
fi
