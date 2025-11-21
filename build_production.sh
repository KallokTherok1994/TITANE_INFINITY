#!/bin/bash

################################################################################
# TITANE∞ v10.0.0 - BUILD PRODUCTION
# Génération du binaire optimisé pour déploiement
#
# ⚠️  Ce script doit être exécuté depuis un terminal système natif
#     (hors environnement Flatpak/sandbox)
################################################################################

set -e

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║      TITANE∞ v10 - BUILD PRODUCTION                          ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

cd "$(dirname "$0")"

# 1. Nettoyage
echo "→ Nettoyage des anciens builds..."
rm -rf dist/ 2>/dev/null || true
rm -rf src-tauri/target/release/bundle/ 2>/dev/null || true

# 2. Installation dépendances frontend
echo ""
echo "→ Installation dépendances npm..."
npm install --silent

# 3. Build frontend
echo ""
echo "→ Build frontend (React + Vite)..."
npm run build

# 4. Vérification dist
if [ ! -f "dist/index.html" ]; then
    echo "❌ Erreur: dist/index.html non généré"
    exit 1
fi

echo "✓ Frontend buildé: $(du -sh dist | cut -f1)"

# 5. Nettoyage Cargo
echo ""
echo "→ Nettoyage cache Cargo..."
cd src-tauri
cargo clean

# 6. Build Tauri release
echo ""
echo "→ Build Tauri RELEASE (peut prendre 5-10 min)..."
cargo tauri build --release

# 7. Vérification binaire
if [ -f "target/release/titane-infinity" ]; then
    echo ""
    echo "✓ Binaire généré: target/release/titane-infinity"
    ls -lh target/release/titane-infinity
else
    echo "❌ Erreur: binaire non généré"
    exit 1
fi

# 8. Liste des bundles
echo ""
echo "→ Bundles générés:"
find target/release/bundle -type f \( -name "*.AppImage" -o -name "*.deb" -o -name "*.rpm" \) 2>/dev/null || echo "Aucun bundle"

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║              ✅ BUILD PRODUCTION RÉUSSI                      ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "TITANE_INFINITY v10 — BUILD PRODUCTION TERMINÉ"

cd ..
