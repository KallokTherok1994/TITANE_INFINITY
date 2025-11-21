#!/bin/bash
# TITANE∞ v15.5 - Script de test post-installation
# Vérifie que toutes les dépendances sont correctement installées

set -e

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🧪 TITANE∞ v15.5 - Tests de Dépendances                  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

ERRORS=0

# Test 1 : Vérifier webkit2gtk
echo "🔍 Test 1/7 : Vérification webkit2gtk..."
if pkg-config --exists webkit2gtk-4.1 2>/dev/null; then
    VERSION=$(pkg-config --modversion webkit2gtk-4.1)
    echo "✅ webkit2gtk-4.1 installé : v$VERSION"
elif pkg-config --exists webkit2gtk-4.0 2>/dev/null; then
    VERSION=$(pkg-config --modversion webkit2gtk-4.0)
    echo "✅ webkit2gtk-4.0 installé : v$VERSION"
else
    echo "🚨 ERREUR : webkit2gtk non trouvé"
    ERRORS=$((ERRORS + 1))
fi

# Test 2 : Vérifier javascriptcoregtk
echo ""
echo "🔍 Test 2/7 : Vérification javascriptcoregtk..."
if pkg-config --exists javascriptcoregtk-4.1 2>/dev/null; then
    VERSION=$(pkg-config --modversion javascriptcoregtk-4.1)
    echo "✅ javascriptcoregtk-4.1 installé : v$VERSION"
elif pkg-config --exists javascriptcoregtk-4.0 2>/dev/null; then
    VERSION=$(pkg-config --modversion javascriptcoregtk-4.0)
    echo "✅ javascriptcoregtk-4.0 installé : v$VERSION"
else
    echo "🚨 ERREUR : javascriptcoregtk non trouvé"
    ERRORS=$((ERRORS + 1))
fi

# Test 3 : Vérifier GTK3
echo ""
echo "🔍 Test 3/7 : Vérification GTK3..."
if pkg-config --exists gtk+-3.0 2>/dev/null; then
    VERSION=$(pkg-config --modversion gtk+-3.0)
    echo "✅ GTK3 installé : v$VERSION"
else
    echo "⚠️  WARNING : GTK3 non trouvé (peut causer des problèmes)"
    ERRORS=$((ERRORS + 1))
fi

# Test 4 : Vérifier librsvg
echo ""
echo "🔍 Test 4/7 : Vérification librsvg..."
if pkg-config --exists librsvg-2.0 2>/dev/null; then
    VERSION=$(pkg-config --modversion librsvg-2.0)
    echo "✅ librsvg installé : v$VERSION"
else
    echo "⚠️  WARNING : librsvg non trouvé"
fi

# Test 5 : Vérifier openssl
echo ""
echo "🔍 Test 5/7 : Vérification OpenSSL..."
if pkg-config --exists openssl 2>/dev/null; then
    VERSION=$(pkg-config --modversion openssl)
    echo "✅ OpenSSL installé : v$VERSION"
else
    echo "⚠️  WARNING : OpenSSL non trouvé par pkg-config"
fi

# Test 6 : Vérifier Rust
echo ""
echo "🔍 Test 6/7 : Vérification Rust toolchain..."
if command -v rustc &> /dev/null; then
    RUST_VERSION=$(rustc --version | cut -d' ' -f2)
    echo "✅ Rust installé : v$RUST_VERSION"
else
    echo "🚨 ERREUR : Rust non installé"
    echo "   Installer avec : curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    ERRORS=$((ERRORS + 1))
fi

# Test 7 : Vérifier Node.js
echo ""
echo "🔍 Test 7/7 : Vérification Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js installé : $NODE_VERSION"
else
    echo "🚨 ERREUR : Node.js non installé"
    ERRORS=$((ERRORS + 1))
fi

# Résumé
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
if [ $ERRORS -eq 0 ]; then
    echo "║  ✅ TOUS LES TESTS RÉUSSIS                                  ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "🚀 Vous pouvez maintenant compiler TITANE∞ :"
    echo ""
    echo "   cd ~/Documents/TITANE_NEWGEN/TITANE_INFINITY"
    echo "   cd src-tauri && cargo clean && cd .."
    echo "   npm run tauri:build"
    echo ""
else
    echo "║  🚨 $ERRORS ERREUR(S) DÉTECTÉE(S)                              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "👉 Veuillez corriger les erreurs avant de compiler."
    echo "   Exécutez : bash install_system_deps.sh"
    echo ""
    exit 1
fi

# Test optionnel : compilation Rust
echo "🧪 Test optionnel : Compilation Rust (appuyez sur Entrée pour continuer, Ctrl+C pour ignorer)"
read -r

echo ""
echo "🔨 Test de compilation Rust..."
cd ~/Documents/TITANE_NEWGEN/TITANE_INFINITY/src-tauri

if cargo check 2>&1 | grep -q "error"; then
    echo "🚨 Erreurs de compilation détectées"
    echo "Consultez les logs ci-dessus"
    exit 1
else
    echo "✅ Compilation Rust réussie (cargo check)"
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🎉 TOUTES LES VÉRIFICATIONS RÉUSSIES                       ║"
echo "║     TITANE∞ est prêt à être compilé !                       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
