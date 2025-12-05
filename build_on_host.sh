#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#   TITANE∞ v14 - Build Script for Flatpak Environment
#   Builds Tauri app using host system's Rust toolchain
# ═══════════════════════════════════════════════════════════════

set -e

PROJECT_DIR="/home/titane/Documents/TITANE_INFINITY"
TAURI_DIR="$PROJECT_DIR/src-tauri"

echo "🚀 TITANE∞ v14 - Building on host system..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if we're in Flatpak
if command -v flatpak-spawn &> /dev/null; then
    echo "✅ Flatpak environment detected"
    echo "📦 Using host system's Rust toolchain..."

    # Build frontend first
    echo ""
    echo "🎨 Building frontend..."
    pnpm build

    echo ""
    echo "🦀 Building Rust backend on host..."
    flatpak-spawn --host bash -c "cd '$TAURI_DIR' && cargo build --lib"

    echo ""
    echo "📦 Building Tauri app on host..."
    flatpak-spawn --host bash -c "cd '$PROJECT_DIR' && pnpm tauri build"

else
    echo "✅ Native environment detected"
    echo "📦 Building normally..."

    pnpm build
    cd "$TAURI_DIR"
    cargo build --lib
    cd "$PROJECT_DIR"
    pnpm tauri build
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Build complete!"
echo ""
echo "📍 Binary location:"
flatpak-spawn --host bash -c "ls -lh '$TAURI_DIR/target/release/bundle/'"* 2>/dev/null || \
    ls -lh "$TAURI_DIR/target/release/bundle/"* 2>/dev/null || \
    echo "⚠️  No bundle found yet"
