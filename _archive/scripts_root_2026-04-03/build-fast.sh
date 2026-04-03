#!/bin/bash
# TITANE∞ Fast Build Script
# Résout le blocage 790/791 avec compilation parallèle optimisée

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║         TITANE∞ v24.3.0 - BUILD RAPIDE OPTIMISÉ          ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# 1. Build React/Vite
echo "📦 Étape 1/3: Build frontend (Vite)..."
pnpm run build
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
cd ..
if command -v corepack >/dev/null 2>&1; then
	corepack pnpm exec tauri build --bundles deb
elif command -v pnpm >/dev/null 2>&1; then
	pnpm exec tauri build --bundles deb
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
