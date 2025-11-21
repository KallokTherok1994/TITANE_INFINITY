#!/bin/bash
# TITANE∞ v15.5 - Script d'installation des dépendances système
# Ce script doit être exécuté dans un terminal système HORS du sandbox Flatpak

set -e

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🔧 TITANE∞ v15.5 - Installation Dépendances Système      ║"
echo "║     WebKitGTK + Tauri v2 Dependencies                      ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Vérifier que nous ne sommes PAS dans Flatpak
if [ -f "/.flatpak-info" ]; then
    echo "🚨 ERREUR : Ce script tourne dans un sandbox Flatpak !"
    echo ""
    echo "👉 Ouvrez un terminal système natif :"
    echo "   - GNOME Terminal (Ctrl+Alt+T)"
    echo "   - Konsole"
    echo "   - Tilix"
    echo ""
    echo "Puis exécutez :"
    echo "  cd ~/Documents/TITANE_NEWGEN/TITANE_INFINITY"
    echo "  bash install_system_deps.sh"
    echo ""
    exit 1
fi

# Détection de la distribution
echo "🔍 Détection de la distribution Linux..."
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    VER=$VERSION_ID
    echo "✅ Détecté : $PRETTY_NAME"
else
    echo "🚨 Impossible de détecter la distribution"
    exit 1
fi

echo ""
echo "📦 Installation des dépendances Tauri v2..."
echo ""

case $OS in
    ubuntu|pop|debian|linuxmint|elementary|neon)
        echo "Distribution basée sur Debian/Ubuntu détectée"
        echo ""
        
        # Mise à jour des sources
        echo "🔄 Mise à jour des sources de paquets..."
        sudo apt-get update
        
        # Essayer webkit2gtk-4.1 en premier
        echo ""
        echo "📦 Tentative d'installation de webkit2gtk-4.1..."
        if sudo apt-get install -y libwebkit2gtk-4.1-dev libjavascriptcoregtk-4.1-dev 2>/dev/null; then
            echo "✅ webkit2gtk-4.1 installé avec succès"
        else
            echo "⚠️  webkit2gtk-4.1 non disponible, tentative avec webkit2gtk-4.0..."
            sudo apt-get install -y libwebkit2gtk-4.0-dev libjavascriptcoregtk-4.0-dev
            echo "✅ webkit2gtk-4.0 installé"
        fi
        
        # Installation des autres dépendances
        echo ""
        echo "📦 Installation des dépendances complémentaires..."
        sudo apt-get install -y \
            build-essential \
            curl \
            wget \
            file \
            libssl-dev \
            libgtk-3-dev \
            libayatana-appindicator3-dev \
            librsvg2-dev \
            patchelf
        ;;
    
    fedora|rhel|centos)
        echo "Distribution basée sur Fedora/RHEL détectée"
        echo ""
        sudo dnf install -y \
            webkit2gtk4.1-devel \
            openssl-devel \
            curl \
            wget \
            file \
            gtk3-devel \
            libappindicator-gtk3-devel \
            librsvg2-devel
        ;;
    
    arch|manjaro)
        echo "Distribution basée sur Arch détectée"
        echo ""
        sudo pacman -Syu --noconfirm
        sudo pacman -S --needed --noconfirm \
            webkit2gtk-4.1 \
            gtk3 \
            libappindicator-gtk3 \
            librsvg \
            openssl \
            curl \
            wget \
            file
        ;;
    
    opensuse*|suse)
        echo "Distribution basée sur openSUSE détectée"
        echo ""
        sudo zypper install -y \
            webkit2gtk3-devel \
            libopenssl-devel \
            gtk3-devel \
            libappindicator3-1 \
            librsvg-devel
        ;;
    
    *)
        echo "🚨 Distribution non reconnue : $OS"
        echo ""
        echo "Veuillez installer manuellement :"
        echo "  - webkit2gtk-4.1-dev (ou webkit2gtk-4.0-dev)"
        echo "  - javascriptcoregtk-4.1-dev"
        echo "  - gtk3-dev"
        echo "  - libappindicator3-dev"
        echo "  - librsvg2-dev"
        echo "  - build-essential / base-devel"
        echo "  - openssl-dev"
        exit 1
        ;;
esac

echo ""
echo "✅ Installation terminée !"
echo ""
echo "🔍 Vérification des installations..."
echo ""

# Vérification webkit
if pkg-config --exists webkit2gtk-4.1 2>/dev/null; then
    WEBKIT_VERSION=$(pkg-config --modversion webkit2gtk-4.1)
    echo "✅ webkit2gtk-4.1 : $WEBKIT_VERSION"
elif pkg-config --exists webkit2gtk-4.0 2>/dev/null; then
    WEBKIT_VERSION=$(pkg-config --modversion webkit2gtk-4.0)
    echo "✅ webkit2gtk-4.0 : $WEBKIT_VERSION"
else
    echo "🚨 webkit2gtk non détecté par pkg-config"
    exit 1
fi

# Vérification GTK
if pkg-config --exists gtk+-3.0 2>/dev/null; then
    GTK_VERSION=$(pkg-config --modversion gtk+-3.0)
    echo "✅ gtk+-3.0 : $GTK_VERSION"
else
    echo "⚠️  gtk+-3.0 non détecté"
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✅ DÉPENDANCES INSTALLÉES AVEC SUCCÈS                      ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "🚀 Prochaines étapes :"
echo ""
echo "1. Retournez dans le répertoire du projet :"
echo "   cd ~/Documents/TITANE_NEWGEN/TITANE_INFINITY"
echo ""
echo "2. Nettoyez le cache de build Rust :"
echo "   cd src-tauri && cargo clean && cd .."
echo ""
echo "3. Lancez la compilation :"
echo "   npm run tauri:build"
echo ""
echo "Ou pour tester en mode développement :"
echo "   npm run tauri:dev"
echo ""
echo "📝 Si vous rencontrez encore des problèmes :"
echo "   - Vérifiez les logs : RUST_LOG=debug npm run tauri:dev"
echo "   - Consultez : DIAGNOSTIC_CRASH_COMPLET_v15.5.md"
echo ""
