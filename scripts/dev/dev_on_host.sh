#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#   TITANE∞ v14 - Development Server for Flatpak Environment
#   Runs Tauri dev mode using host system's toolchain
# ═══════════════════════════════════════════════════════════════

set -e

PROJECT_DIR="/home/titane/Documents/TITANE_INFINITY"

echo "🚀 TITANE∞ v14 - Development Mode"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if we're in Flatpak
if command -v flatpak-spawn &> /dev/null; then
    echo "✅ Flatpak environment detected"
    echo "🔧 Launching Tauri dev on host system..."
    echo ""
    echo "💡 The app window will open on your host system"
    echo "💡 Keep this terminal open while developing"
    echo ""

    # Run on host
    flatpak-spawn --host bash -c "cd '$PROJECT_DIR' && pnpm tauri dev"

else
    echo "✅ Native environment detected"
    echo "🔧 Launching normally..."

    cd "$PROJECT_DIR"
    pnpm tauri dev
fi
