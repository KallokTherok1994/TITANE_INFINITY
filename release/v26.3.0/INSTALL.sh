#!/bin/bash

# TITANE-Infinity v26.3.0 - Installation Script
# Copyright © 2025 Humain Total / Kevin Thibault

set -e

echo "════════════════════════════════════════════════════"
echo "🚀 TITANE-Infinity v26.3.0 - Installation"
echo "════════════════════════════════════════════════════"
echo ""

# Détection de la distribution
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    echo "❌ Impossible de détecter la distribution Linux"
    exit 1
fi

echo "📋 Distribution détectée: $PRETTY_NAME"
echo ""

# Fonction pour installer le .deb
install_deb() {
    echo "📦 Installation du package Debian..."
    if [ -f "TITANE-Infinity_26.3.0_amd64.deb" ]; then
        sudo dpkg -i TITANE-Infinity_26.3.0_amd64.deb
        echo "🔧 Résolution des dépendances..."
        sudo apt-get install -f -y
        echo "✅ Installation DEB terminée"
    else
        echo "❌ Fichier TITANE-Infinity_26.3.0_amd64.deb non trouvé"
        exit 1
    fi
}

# Fonction pour installer le .rpm
install_rpm() {
    echo "📦 Installation du package RPM..."
    if [ -f "TITANE-Infinity-26.3.0-1.x86_64.rpm" ]; then
        if command -v dnf &> /dev/null; then
            sudo dnf install -y TITANE-Infinity-26.3.0-1.x86_64.rpm
        elif command -v yum &> /dev/null; then
            sudo yum install -y TITANE-Infinity-26.3.0-1.x86_64.rpm
        else
            sudo rpm -i TITANE-Infinity-26.3.0-1.x86_64.rpm
        fi
        echo "✅ Installation RPM terminée"
    else
        echo "❌ Fichier TITANE-Infinity-26.3.0-1.x86_64.rpm non trouvé"
        exit 1
    fi
}

# Fonction pour installer l'AppImage
install_appimage() {
    echo "📦 Configuration de l'AppImage..."
    if [ -f "TITANE-Infinity_26.3.0_amd64.AppImage" ]; then
        chmod +x TITANE-Infinity_26.3.0_amd64.AppImage
        
        # Créer un lien symbolique dans /usr/local/bin (optionnel)
        read -p "Créer un lien symbolique dans /usr/local/bin? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            sudo ln -sf "$(pwd)/TITANE-Infinity_26.3.0_amd64.AppImage" /usr/local/bin/titane-infinity
            echo "✅ Lien symbolique créé: /usr/local/bin/titane-infinity"
        fi
        
        echo "✅ AppImage prêt à l'emploi"
        echo "💡 Lancez avec: ./TITANE-Infinity_26.3.0_amd64.AppImage"
    else
        echo "❌ Fichier TITANE-Infinity_26.3.0_amd64.AppImage non trouvé"
        exit 1
    fi
}

# Vérification des checksums
echo "🔐 Vérification de l'intégrité des fichiers..."
if [ -f "SHA256SUMS" ]; then
    if sha256sum -c SHA256SUMS 2>/dev/null; then
        echo "✅ Intégrité vérifiée"
        echo ""
    else
        echo "⚠️  Échec de la vérification d'intégrité"
        read -p "Continuer quand même? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
else
    echo "⚠️  Fichier SHA256SUMS non trouvé"
    echo ""
fi

# Installation selon la distribution
case "$OS" in
    ubuntu|debian|linuxmint|pop)
        install_deb
        ;;
    fedora|rhel|centos|rocky|almalinux)
        install_rpm
        ;;
    arch|manjaro|endeavouros)
        echo "ℹ️  Pour Arch Linux, utilisez l'AppImage ou créez un PKGBUILD"
        install_appimage
        ;;
    *)
        echo "ℹ️  Distribution non reconnue, utilisation de l'AppImage"
        install_appimage
        ;;
esac

echo ""
echo "════════════════════════════════════════════════════"
echo "✅ Installation terminée!"
echo "════════════════════════════════════════════════════"
echo ""
echo "🚀 Lancez TITANE-Infinity:"
echo "   • Depuis le menu Applications"
echo "   • Ou via terminal: titane-infinity"
echo ""
echo "📚 Documentation: RELEASE_NOTES.md"
echo "🐛 Support: https://github.com/votre-repo/issues"
echo ""
echo "🎉 Bienvenue dans TITANE∞ v26.3.0!"
echo ""
