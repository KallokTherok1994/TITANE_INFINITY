#!/bin/bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🔮 TITANE∞ v10 — SOLUTION BUILD WEBKIT (Natif ou Flatpak)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

PROJECT_DIR="/home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY"
TAURI_DIR="$PROJECT_DIR/src-tauri"
FLATPAK_SPAWN="/usr/bin/flatpak-spawn"

# Détection environnement
if [ -n "$FLATPAK_ID" ]; then
    USE_FLATPAK=true
    echo "🔍 Environnement: Flatpak ($FLATPAK_ID)"
else
    USE_FLATPAK=false
    echo "🔍 Environnement: Natif (système hôte)"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔮 TITANE∞ — BUILD DEPUIS SYSTÈME HÔTE (webkit v2.48.7)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo "📊 ÉTAPE 1 : Vérification environnement hôte"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -n "🔹 OS : "
if [ "$USE_FLATPAK" = true ]; then
    /usr/bin/flatpak-spawn --host cat /etc/os-release | grep "PRETTY_NAME" | cut -d'"' -f2
else
    cat /etc/os-release | grep "PRETTY_NAME" | cut -d'"' -f2
fi

echo -n "🔹 webkit2gtk-4.1 : "
if [ "$USE_FLATPAK" = true ]; then
    WEBKIT_VERSION=$(/usr/bin/flatpak-spawn --host pkg-config --modversion webkit2gtk-4.1 2>&1)
else
    WEBKIT_VERSION=$(pkg-config --modversion webkit2gtk-4.1 2>&1)
fi
if [ $? -eq 0 ]; then
    echo "✅ v$WEBKIT_VERSION"
else
    echo "❌ NON INSTALLÉ"
    echo ""
    echo "⚠️  Installation requise sur système hôte :"
    echo "   flatpak-spawn --host sudo apt update"
    echo "   flatpak-spawn --host sudo apt install -y libwebkit2gtk-4.1-dev libjavascriptcoregtk-4.1-dev"
    exit 1
fi

echo -n "🔹 Rust/Cargo : "
if [ "$USE_FLATPAK" = true ]; then
    RUST_VERSION=$(/usr/bin/flatpak-spawn --host bash -c 'source $HOME/.cargo/env 2>/dev/null && cargo --version' 2>&1 | awk '{print $2}')
else
    RUST_VERSION=$(bash -c 'source $HOME/.cargo/env 2>/dev/null && cargo --version' 2>&1 | awk '{print $2}')
fi
if [ -n "$RUST_VERSION" ]; then
    echo "✅ v$RUST_VERSION"
else
    echo "❌ NON INSTALLÉ"
    echo ""
    echo "⚠️  Installation Rust requise :"
    echo "   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    exit 1
fi

echo -n "🔹 Tauri CLI : "
if [ "$USE_FLATPAK" = true ]; then
    TAURI_AVAILABLE=$(/usr/bin/flatpak-spawn --host bash -c 'source $HOME/.cargo/env 2>/dev/null && which cargo-tauri' 2>&1)
else
    TAURI_AVAILABLE=$(bash -c 'source $HOME/.cargo/env 2>/dev/null && which cargo-tauri' 2>&1)
fi
if [ $? -eq 0 ]; then
    echo "✅ Installé"
else
    echo "⚠️  NON INSTALLÉ (installation automatique)"
    echo "   Installation : cargo install tauri-cli --version ^2.0.0"
fi

echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo "📊 ÉTAPE 2 : Vérification projet"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ! -d "$TAURI_DIR" ]; then
    echo "❌ Répertoire Tauri introuvable : $TAURI_DIR"
    exit 1
fi

echo "✅ Projet : $PROJECT_DIR"
echo "✅ Tauri : $TAURI_DIR"
echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo "📊 ÉTAPE 3 : Build production via système hôte"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Vérifier si dist/ existe
if [ -d "$PROJECT_DIR/dist" ]; then
    echo "✅ Frontend déjà buildé : $PROJECT_DIR/dist"
    echo ""
else
    echo "⚠️  Frontend non buildé, npm non disponible sur système hôte"
    echo "   Buildez le frontend d'abord :"
    echo "   cd $PROJECT_DIR && npm run build"
    exit 1
fi

echo "🚀 Lancement du build backend..."
echo "   Commande : cargo build --release"
if [ "$USE_FLATPAK" = true ]; then
    echo "   Environnement : Flatpak → Hôte"
else
    echo "   Environnement : Natif"
fi
echo "   Webkit : v$WEBKIT_VERSION"
echo ""

# Build via flatpak-spawn (accès webkit hôte) ou direct
if [ "$USE_FLATPAK" = true ]; then
    /usr/bin/flatpak-spawn --host bash -c "source \$HOME/.cargo/env 2>/dev/null && cd '$TAURI_DIR' && cargo build --release"
else
    bash -c "source $HOME/.cargo/env 2>/dev/null && cd '$TAURI_DIR' && cargo build --release"
fi

BUILD_EXIT_CODE=$?

echo ""
if [ $BUILD_EXIT_CODE -eq 0 ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ BUILD RÉUSSI"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📦 Binaire généré :"
    echo "   $TAURI_DIR/target/release/titane-infinity"
    echo ""
    if [ "$USE_FLATPAK" = true ]; then
        /usr/bin/flatpak-spawn --host ls -lh "$TAURI_DIR/target/release/titane-infinity" 2>/dev/null || echo "   (vérifier manuellement)"
    else
        ls -lh "$TAURI_DIR/target/release/titane-infinity" 2>/dev/null || echo "   (vérifier manuellement)"
    fi
    echo ""
    echo "🎉 TITANE∞ v10 backend prêt !"
    echo ""
    echo "📋 Prochaines étapes :"
    echo "   1. Test : $TAURI_DIR/target/release/titane-infinity"
    echo "   2. Bundle complet : cd $TAURI_DIR && cargo tauri build (nécessite npm sur hôte)"
else
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "❌ BUILD ÉCHOUÉ (code $BUILD_EXIT_CODE)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📋 Vérifications recommandées :"
    echo "   1. Logs complets : voir sortie ci-dessus"
    if [ "$USE_FLATPAK" = true ]; then
        echo "   2. Dépendances : /usr/bin/flatpak-spawn --host apt list --installed | grep webkit"
        echo "   3. Build manuel : cd $TAURI_DIR && /usr/bin/flatpak-spawn --host bash -c 'source \$HOME/.cargo/env && cargo build'"
    else
        echo "   2. Dépendances : apt list --installed | grep webkit"
        echo "   3. Build manuel : cd $TAURI_DIR && cargo build"
    fi
    exit $BUILD_EXIT_CODE
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Script terminé avec succès"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
