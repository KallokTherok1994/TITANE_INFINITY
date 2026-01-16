#!/bin/bash
# TITANE∞ Fast Build Script
# Résout le blocage 790/791 avec compilation parallèle optimisée

set -euo pipefail

ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cd "$ROOT"

# Prefer repo-pinned Node toolchain when available
NODE_TOOLS_BIN="$ROOT/.tools/node/current/bin"
if [[ -d "$NODE_TOOLS_BIN" ]]; then
	export PATH="$NODE_TOOLS_BIN:$PATH"
fi

# Safety guard: this script produces production bundles (deb/AppImage).
# Per TITANE∞ governance, do not run without explicit authorization.
if [[ "${TITANE_BUILD_ASSUME_YES:-0}" != "1" ]]; then
	echo "❌ Refus: build-fast.sh déclenche un bundle PRODUCTION (deb/AppImage)."
	echo "   Autorisation explicite requise (politique TITANE∞)."
	echo "   Pour continuer: TITANE_BUILD_ASSUME_YES=1 ./build-fast.sh"
	exit 2
fi

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║           TITANE∞ - BUILD RAPIDE (PRODUCTION)           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# 1. Build React/Vite
echo "📦 Étape 1/3: Build frontend (Vite)..."
if command -v corepack >/dev/null 2>&1; then
	NODE_ENV=production corepack pnpm run build
elif command -v pnpm >/dev/null 2>&1; then
	NODE_ENV=production pnpm run build
else
	echo "❌ pnpm requis (corepack/pnpm introuvable)."
	exit 1
fi
echo "✓ Frontend compilé"
echo ""

# 2. Build Rust (mode release optimisé)
echo "🦀 Étape 2/3: Build backend (Rust release)..."
cd src-tauri
time cargo build --release
echo "✓ Backend compilé"
echo ""

# 3. Création des packages
echo "📦 Étape 3/3: Génération des packages..."
if command -v corepack >/dev/null 2>&1; then
	corepack pnpm exec tauri build --config runtime/stable/tauri.stable.conf.json --bundles deb
elif command -v pnpm >/dev/null 2>&1; then
	pnpm exec tauri build --config runtime/stable/tauri.stable.conf.json --bundles deb
else
	echo "❌ pnpm requis (corepack/pnpm introuvable)."
	exit 1
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                    BUILD TERMINÉ ✓                        ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "📦 Packages disponibles:"
find src-tauri/target/release/bundle -name "*.deb" -o -name "*.rpm" -o -name "*.AppImage" | xargs ls -lh
