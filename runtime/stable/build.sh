#!/bin/bash
# TITANE∞ — Build STABLE RUNTIME (Production)
# Usage: ./runtime/stable/build.sh

set -e

echo "🔵 TITANE∞ — Building STABLE RUNTIME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Navigate to project root
cd "$(dirname "$0")/../.."

# Check we're on stable-runtime branch
CURRENT_BRANCH=$(git branch --show-current)
if [[ $CURRENT_BRANCH != "stable-runtime" ]]; then
    echo "⚠️  WARNING: Not on stable-runtime branch"
    echo "Current: $CURRENT_BRANCH"
    echo ""
    read -p "❓ Continue anyway? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Build cancelled"
        exit 1
    fi
fi

echo "📋 Build Configuration:"
echo "  • Mode: PRODUCTION"
echo "  • Target: Titan-Stable (user runtime)"
echo "  • Optimizations: MAX"
echo "  • DevTools: DISABLED"
echo "  • Hot Reload: DISABLED"
echo "  • Logging: MINIMAL"
echo "  • OMEGA Pipeline: FULL ACTIVATION"
echo ""

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/ build/ runtime/stable/build/ runtime/stable/dist/
rm -f runtime/stable/*.AppImage runtime/stable/*.exe runtime/stable/*.dmg

# Install dependencies (if needed)
if [[ ! -d "node_modules" ]]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build frontend (production mode)
echo ""
echo "⚛️  Building React frontend (production)..."
NODE_ENV=production npm run build

# Build Tauri app (production)
echo ""
echo "🦀 Building Tauri app (production)..."
npm run tauri build -- --config runtime/stable/tauri.conf.json

# Copy build to runtime/stable/
echo ""
echo "📦 Copying build artifacts to runtime/stable/..."
mkdir -p runtime/stable/build/

# Detect platform and copy appropriate executable
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    cp src-tauri/target/release/bundle/appimage/*.AppImage runtime/stable/
    echo "✅ Linux AppImage ready: runtime/stable/*.AppImage"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    cp src-tauri/target/release/bundle/macos/*.app runtime/stable/
    echo "✅ macOS app ready: runtime/stable/*.app"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    cp src-tauri/target/release/bundle/msi/*.msi runtime/stable/
    echo "✅ Windows MSI ready: runtime/stable/*.msi"
fi

echo ""
echo "🎉 BUILD COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Executable location: runtime/stable/"
echo ""
echo "🚀 Launch Titan-Stable:"
echo "  Linux:   ./runtime/stable/*.AppImage"
echo "  macOS:   open runtime/stable/*.app"
echo "  Windows: runtime/stable/*.msi (install first)"
echo ""
echo "💡 This is your USER RUNTIME:"
echo "  • No hot reload (stable experience)"
echo "  • Optimized performance"
echo "  • Full OMEGA pipeline active"
echo "  • Use this for daily Titan interactions"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
