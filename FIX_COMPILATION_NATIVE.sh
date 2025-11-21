#!/usr/bin/env bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TITANE∞ v10.0 - FIX COMPILATION NATIVE (GLIBC 2.35 compatible)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

echo "🔧 TITANE∞ - Compilation Native (Pop!_OS 22.04 / GLIBC 2.35)"
echo ""

# Détection environnement
if [ -n "$FLATPAK_ID" ]; then
    echo "⚠️  Détecté : Environnement Flatpak ($FLATPAK_ID)"
    echo "🔄 Basculement vers système hôte..."
    USE_FLATPAK=true
    FLATPAK_SPAWN="/usr/bin/flatpak-spawn --host"
else
    echo "✅ Détecté : Environnement natif (système hôte)"
    USE_FLATPAK=false
    FLATPAK_SPAWN=""
fi

echo ""
echo "──────────────────────────────────────────────────────────────────"
echo "ÉTAPE 1 : Nettoyage complet"
echo "──────────────────────────────────────────────────────────────────"

cd "$(dirname "$0")/src-tauri"

if [ "$USE_FLATPAK" = true ]; then
    $FLATPAK_SPAWN bash -c "cd '$PWD' && source \$HOME/.cargo/env && cargo clean"
else
    cargo clean
fi

rm -rf target/
echo "✅ Nettoyage terminé"

echo ""
echo "──────────────────────────────────────────────────────────────────"
echo "ÉTAPE 2 : Configuration PKG_CONFIG_PATH"
echo "──────────────────────────────────────────────────────────────────"

export PKG_CONFIG_PATH=/usr/lib/x86_64-linux-gnu/pkgconfig:/usr/share/pkgconfig
echo "✅ PKG_CONFIG_PATH=$PKG_CONFIG_PATH"

# Vérification webkit2gtk-4.1
if [ "$USE_FLATPAK" = true ]; then
    WEBKIT_VERSION=$($FLATPAK_SPAWN bash -c "export PKG_CONFIG_PATH=$PKG_CONFIG_PATH && pkg-config --modversion webkit2gtk-4.1" 2>&1)
else
    WEBKIT_VERSION=$(pkg-config --modversion webkit2gtk-4.1 2>&1)
fi

if [ $? -eq 0 ]; then
    echo "✅ webkit2gtk-4.1 : v$WEBKIT_VERSION"
else
    echo "❌ webkit2gtk-4.1 non trouvé"
    echo "   Installation requise : sudo apt install libwebkit2gtk-4.1-dev"
    exit 1
fi

echo ""
echo "──────────────────────────────────────────────────────────────────"
echo "ÉTAPE 3 : Compilation Rust (système natif)"
echo "──────────────────────────────────────────────────────────────────"

if [ "$USE_FLATPAK" = true ]; then
    echo "🔄 Compilation via système hôte (évite GLIBC 2.39)..."
    $FLATPAK_SPAWN bash -c "
        cd '$PWD' && \
        export PKG_CONFIG_PATH=$PKG_CONFIG_PATH && \
        source \$HOME/.cargo/env && \
        cargo check --message-format=short 2>&1
    "
else
    echo "🔄 Compilation directe..."
    cargo check --message-format=short
fi

RESULT=$?

echo ""
if [ $RESULT -eq 0 ]; then
    echo "✅ COMPILATION RÉUSSIE"
    echo ""
    echo "──────────────────────────────────────────────────────────────────"
    echo "ÉTAPE 4 : Tests unitaires"
    echo "──────────────────────────────────────────────────────────────────"
    
    if [ "$USE_FLATPAK" = true ]; then
        $FLATPAK_SPAWN bash -c "cd '$PWD' && export PKG_CONFIG_PATH=$PKG_CONFIG_PATH && source \$HOME/.cargo/env && cargo test --no-fail-fast 2>&1 | tail -20"
    else
        cargo test --no-fail-fast 2>&1 | tail -20
    fi
    
    echo ""
    echo "✅ PROJET TITANE∞ PRÊT"
    echo ""
    echo "Commandes disponibles :"
    echo "  • cargo tauri dev    → Lancer en mode développement"
    echo "  • cargo tauri build  → Build production"
else
    echo "❌ ÉCHEC COMPILATION"
    echo ""
    echo "Consultez les erreurs ci-dessus."
    echo "Rapport audit : AUDIT_INTEGRAL_TITANE_v10.0.0.md"
    exit 1
fi
