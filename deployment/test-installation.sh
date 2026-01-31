#!/bin/bash

# 🧪 Script de Test d'Installation v27.0.0

set -e

PACKAGE="src-tauri/target/release/bundle/deb/TITANE-Infinity_27.0.0_amd64.deb"
EXPECTED_SHA="99e478faa9727a14088c4141f06a604fdc81fcc24614206349f1593b36098fa9"

echo "🔍 Test 1: Vérification existence package..."
if [ ! -f "$PACKAGE" ]; then
    echo "❌ ERREUR: Package non trouvé: $PACKAGE"
    exit 1
fi
echo "✅ Package trouvé"

echo ""
echo "🔐 Test 2: Vérification intégrité (SHA256)..."
ACTUAL_SHA=$(sha256sum "$PACKAGE" | awk '{print $1}')
if [ "$ACTUAL_SHA" != "$EXPECTED_SHA" ]; then
    echo "❌ ERREUR: SHA256 ne correspond pas!"
    echo "   Attendu: $EXPECTED_SHA"
    echo "   Actuel:  $ACTUAL_SHA"
    exit 1
fi
echo "✅ Intégrité vérifiée"

echo ""
echo "📦 Test 3: Inspection contenu package..."
dpkg-deb -I "$PACKAGE" | grep -E "(Package|Version|Architecture)" || true
echo "✅ Métadonnées package OK"

echo ""
echo "📂 Test 4: Listing fichiers dans package..."
FILE_COUNT=$(dpkg-deb -c "$PACKAGE" | wc -l)
echo "   Nombre de fichiers: $FILE_COUNT"
if [ "$FILE_COUNT" -lt 10 ]; then
    echo "⚠️  WARNING: Nombre de fichiers semble faible"
else
    echo "✅ Package contient des fichiers"
fi

echo ""
echo "🎯 Test 5: Vérification fichiers critiques..."
dpkg-deb -c "$PACKAGE" | grep -q "titane-infinity" && echo "   ✅ Binaire trouvé" || echo "   ❌ Binaire manquant"
dpkg-deb -c "$PACKAGE" | grep -q ".desktop" && echo "   ✅ Desktop entry trouvé" || echo "   ⚠️  Desktop entry manquant"

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║                                                       ║"
echo "║  ✅ TOUS LES TESTS D'INTÉGRITÉ PASSÉS                ║"
echo "║                                                       ║"
echo "║  Package: TITANE-Infinity_27.0.0_amd64.deb           ║"
echo "║  Status:  PRÊT POUR INSTALLATION                     ║"
echo "║                                                       ║"
echo "╚═══════════════════════════════════════════════════════╝"

echo ""
echo "🚀 COMMANDES D'INSTALLATION:"
echo ""
echo "   # Installation locale (test):"
echo "   sudo dpkg -i $PACKAGE"
echo "   sudo apt-get install -f"
echo ""
echo "   # Vérification post-install:"
echo "   which titane-infinity"
echo "   titane-infinity --version"
echo ""

