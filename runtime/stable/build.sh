#!/bin/bash
# TITANE∞ — Build STABLE RUNTIME (Production)
# Usage: ./runtime/stable/build.sh

set -e

echo "🔵 TITANE∞ — Building STABLE RUNTIME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Navigate to project root
cd "$(dirname "$0")/../.."

# Prefer repo-pinned Node toolchain when available
NODE_TOOLS_BIN="$PWD/.tools/node/current/bin"
if [[ -d "$NODE_TOOLS_BIN" ]]; then
    export PATH="$NODE_TOOLS_BIN:$PATH"
fi

# Check we're on stable-runtime branch
CURRENT_BRANCH=$(git branch --show-current)
if [[ $CURRENT_BRANCH != "stable-runtime" ]]; then
    echo "⚠️  WARNING: Not on stable-runtime branch"
    echo "Current: $CURRENT_BRANCH"
    echo ""
    if [[ "${TITANE_BUILD_ASSUME_YES:-0}" == "1" ]]; then
        echo "✅ TITANE_BUILD_ASSUME_YES=1 → continue non-interactif"
    else
        REPLY=""
        if [[ -t 0 ]]; then
            read -r -p "❓ Continue anyway? (y/n) [y]: " REPLY
        else
            REPLY="y"
        fi
        if [[ -z "$REPLY" || $REPLY =~ ^[Yy]$ ]]; then
            :
        else
            echo "❌ Build cancelled"
            exit 1
        fi
    fi
fi

echo "📋 Build Configuration:"
echo "  • Mode: PRODUCTION"
echo "  • Target: Titan-Stable (user runtime)"
echo "  • Optimizations: MAX"
echo "  • DevTools: ENABLED"
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
    # Le repo force pnpm (preinstall). On installe donc via pnpm quand possible.
    if [[ -f "pnpm-lock.yaml" ]]; then
        if command -v corepack >/dev/null 2>&1; then
            corepack pnpm install
        elif command -v pnpm >/dev/null 2>&1; then
            pnpm install
        else
            echo "❌ pnpm requis mais introuvable (corepack/pnpm)."
            exit 1
        fi
    else
        npm install
    fi
fi

# Build frontend (production mode)
echo ""
echo "⚛️  Building React frontend (production)..."
NODE_ENV=production npm run build

# Build Tauri app (production)
echo ""
echo "🦀 Building Tauri app (production)..."
if node -e "const p=require('./package.json'); process.exit(p.scripts && p.scripts.tauri ? 0 : 1)"; then
    npm run tauri build -- --config runtime/stable/tauri.conf.json
else
    npx tauri build --config runtime/stable/tauri.conf.json
fi

# Copy build to runtime/stable/
echo ""
echo "📦 Copying build artifacts to runtime/stable/..."
mkdir -p runtime/stable/build/

# Detect platform and copy appropriate executable
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    shopt -s nullglob
    APPIMAGES=(src-tauri/target/release/bundle/appimage/*.AppImage)
    DEBS=(src-tauri/target/release/bundle/deb/*.deb)
    if [[ ${#APPIMAGES[@]} -eq 0 ]]; then
        echo "❌ No AppImage produced in src-tauri/target/release/bundle/appimage/"
        exit 1
    fi

    for src in "${APPIMAGES[@]}"; do
        base="$(basename "$src")"
        tmp="runtime/stable/${base}.new"
        dest="runtime/stable/${base}"

        cp "$src" "$tmp"

        if mv -f "$tmp" "$dest" 2>/dev/null; then
            :
        else
            ts="$(date +%Y%m%d-%H%M%S)"
            alt="runtime/stable/${base%.AppImage}-${ts}.AppImage"
            mv -f "$tmp" "$alt"
            echo "⚠️  Destination busy, wrote: $alt"
        fi
    done

    echo "✅ Linux AppImage ready: runtime/stable/*.AppImage"

    if [[ ${#DEBS[@]} -gt 0 ]]; then
        for src in "${DEBS[@]}"; do
            base="$(basename "$src")"
            tmp="runtime/stable/${base}.new"
            dest="runtime/stable/${base}"

            cp "$src" "$tmp"
            if mv -f "$tmp" "$dest" 2>/dev/null; then
                :
            else
                ts="$(date +%Y%m%d-%H%M%S)"
                alt="runtime/stable/${base%.deb}-${ts}.deb"
                mv -f "$tmp" "$alt"
                echo "⚠️  Destination busy, wrote: $alt"
            fi
        done

        echo "✅ Linux DEB ready: runtime/stable/*.deb"
    fi

    echo ""
    echo "🔄 Updating desktop entry to point to Stable artifact..."
    bash scripts/update-desktop-icon.sh || true
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
