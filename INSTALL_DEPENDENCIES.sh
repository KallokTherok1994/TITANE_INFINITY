#!/bin/bash
# Script d'installation des dépendances système pour TITANE∞ v15.5
# Backend Tauri 2.0 + WebKitGTK 4.1

set -e

echo "🔧 Installation des dépendances système pour TITANE∞ v15.5..."
echo ""

# Détection du gestionnaire de paquets
if command -v apt-get &> /dev/null; then
    PKG_MANAGER="apt-get"
    UPDATE_CMD="sudo apt-get update"
    INSTALL_CMD="sudo apt-get install -y"
elif command -v dnf &> /dev/null; then
    PKG_MANAGER="dnf"
    UPDATE_CMD="sudo dnf check-update || true"
    INSTALL_CMD="sudo dnf install -y"
elif command -v pacman &> /dev/null; then
    PKG_MANAGER="pacman"
    UPDATE_CMD="sudo pacman -Sy"
    INSTALL_CMD="sudo pacman -S --noconfirm"
else
    echo "❌ Gestionnaire de paquets non supporté"
    echo "Veuillez installer manuellement les dépendances WebKitGTK 4.1"
    exit 1
fi

echo "📦 Gestionnaire détecté: $PKG_MANAGER"
echo ""

# Mise à jour des dépôts
echo "🔄 Mise à jour des dépôts..."
$UPDATE_CMD

echo ""
echo "📥 Installation des dépendances..."

# Installation selon le gestionnaire
case $PKG_MANAGER in
    apt-get)
        $INSTALL_CMD \
            libwebkit2gtk-4.1-dev \
            libjavascriptcoregtk-4.1-dev \
            libgtk-3-dev \
            libsoup-3.0-dev \
            libayatana-appindicator3-dev \
            librsvg2-dev \
            patchelf \
            libssl-dev \
            pkg-config \
            build-essential \
            curl \
            wget
        
        # Vérification alternative si 4.1 non disponible
        if ! pkg-config --exists webkit2gtk-4.1; then
            echo "⚠️  webkit2gtk-4.1 non disponible, tentative avec 4.0..."
            $INSTALL_CMD \
                libwebkit2gtk-4.0-dev \
                libjavascriptcoregtk-4.0-dev
        fi
        ;;
    
    dnf)
        $INSTALL_CMD \
            webkit2gtk4.1-devel \
            gtk3-devel \
            libsoup3-devel \
            libappindicator-gtk3-devel \
            librsvg2-devel \
            patchelf \
            openssl-devel \
            pkg-config \
            gcc \
            gcc-c++ \
            make
        ;;
    
    pacman)
        $INSTALL_CMD \
            webkit2gtk-4.1 \
            gtk3 \
            libsoup3 \
            libappindicator-gtk3 \
            librsvg \
            patchelf \
            openssl \
            pkg-config \
            base-devel
        ;;
esac

echo ""
echo "✅ Dépendances installées avec succès!"
echo ""

# Vérification des installations
echo "🔍 Vérification des installations..."
echo ""

DEPS_OK=true

check_dep() {
    if pkg-config --exists "$1" 2>/dev/null; then
        VERSION=$(pkg-config --modversion "$1")
        echo "✅ $1: $VERSION"
    else
        echo "❌ $1: NON TROUVÉ"
        DEPS_OK=false
    fi
}

check_dep "gtk+-3.0"

# Vérifier webkit2gtk (essayer 4.1 puis 4.0)
if pkg-config --exists "webkit2gtk-4.1" 2>/dev/null; then
    check_dep "webkit2gtk-4.1"
elif pkg-config --exists "webkit2gtk-4.0" 2>/dev/null; then
    check_dep "webkit2gtk-4.0"
    echo "ℹ️  Note: webkit2gtk-4.0 installé au lieu de 4.1 (compatible)"
else
    echo "❌ webkit2gtk: NON TROUVÉ"
    DEPS_OK=false
fi

check_dep "libsoup-3.0" || check_dep "libsoup-2.4"

echo ""

if [ "$DEPS_OK" = true ]; then
    echo "🎉 Toutes les dépendances sont installées correctement!"
    echo ""
    echo "🚀 Vous pouvez maintenant compiler TITANE∞:"
    echo "   cd /home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY"
    echo "   cargo build --release"
    echo "   npm run tauri build"
else
    echo "⚠️  Certaines dépendances n'ont pas pu être vérifiées."
    echo "   Veuillez vérifier manuellement avant de compiler."
fi

echo ""
echo "📚 Documentation: voir VALIDATION_FINALE_v15.5.md"
