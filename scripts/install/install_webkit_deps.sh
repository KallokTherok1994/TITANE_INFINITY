#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# TITANE∞ v14 - Installation des dépendances WebKit
# À exécuter avec privilèges administrateur
# ═══════════════════════════════════════════════════════════════

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  TITANE∞ v14 - Installation Dépendances WebKit              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Vérification des privilèges root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Ce script nécessite des privilèges administrateur."
    echo ""
    echo "Exécutez avec :"
    echo "  sudo bash install_webkit_deps.sh"
    echo ""
    echo "OU depuis un terminal normal avec mot de passe :"
    echo "  bash install_webkit_deps.sh"
    exit 1
fi

echo "✅ Privilèges administrateur détectés"
echo ""

# Mise à jour des packages
echo "📦 Mise à jour de la liste des packages..."
apt update

echo ""
echo "📥 Installation des dépendances WebKit et GTK..."
echo ""

# Installation des dépendances Tauri
apt install -y \
    libwebkit2gtk-4.1-dev \
    libjavascriptcoregtk-4.1-dev \
    libgtk-3-dev \
    libsoup-3.0-dev \
    libgdk-pixbuf-2.0-dev \
    libpango1.0-dev \
    libcairo2-dev \
    libatk1.0-dev \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    patchelf

if [ $? -eq 0 ]; then
    echo ""
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║  ✅ Installation réussie !                                   ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "Vérification des packages installés :"
    echo ""

    # Vérification
    if pkg-config --exists webkit2gtk-4.1 2>/dev/null; then
        WEBKIT_VERSION=$(pkg-config --modversion webkit2gtk-4.1)
        echo "  ✅ webkit2gtk-4.1: $WEBKIT_VERSION"
    else
        echo "  ⚠️  webkit2gtk-4.1: Non trouvé"
    fi

    if pkg-config --exists javascriptcoregtk-4.1 2>/dev/null; then
        JSC_VERSION=$(pkg-config --modversion javascriptcoregtk-4.1)
        echo "  ✅ javascriptcoregtk-4.1: $JSC_VERSION"
    else
        echo "  ⚠️  javascriptcoregtk-4.1: Non trouvé"
    fi

    if pkg-config --exists gtk+-3.0 2>/dev/null; then
        GTK_VERSION=$(pkg-config --modversion gtk+-3.0)
        echo "  ✅ gtk+-3.0: $GTK_VERSION"
    else
        echo "  ⚠️  gtk+-3.0: Non trouvé"
    fi

    echo ""
    echo "🚀 Vous pouvez maintenant lancer :"
    echo "   cd /home/titane/Documents/TITANE_INFINITY"
    echo "   pnpm tauri dev"
    echo ""
else
    echo ""
    echo "❌ Erreur lors de l'installation"
    echo "Vérifiez les messages d'erreur ci-dessus"
    exit 1
fi
