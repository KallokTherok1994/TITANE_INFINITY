#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# 🔧 TITANE∞ v17 - FIX WEBKIT DEPENDENCIES
# ═══════════════════════════════════════════════════════════════════════════

echo "════════════════════════════════════════════════════════════════"
echo "   🔧 TITANE∞ - FIX WEBKIT DEPENDENCIES"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Vérification OS
if [ ! -f /etc/os-release ]; then
    echo "❌ OS non supporté (Linux uniquement)"
    exit 1
fi

source /etc/os-release

echo "📋 OS détecté: $NAME $VERSION"
echo ""

# Installation selon la distribution
case "$ID" in
    ubuntu|debian|pop)
        echo "📦 Installation dépendances Ubuntu/Debian/Pop!_OS..."
        echo ""
        
        sudo apt-get update
        
        echo ""
        echo "📥 Installation WebKit2GTK 4.1..."
        sudo apt-get install -y \
            libwebkit2gtk-4.1-dev \
            libgtk-3-dev \
            libayatana-appindicator3-dev \
            librsvg2-dev \
            patchelf \
            libjavascriptcoregtk-4.1-dev \
            libsoup-3.0-dev \
            libgdk-pixbuf-2.0-dev
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ Dépendances WebKit installées avec succès"
        else
            echo ""
            echo "❌ Échec installation - Vérifiez les permissions sudo"
            exit 1
        fi
        ;;
        
    fedora|rhel|centos)
        echo "📦 Installation dépendances Fedora/RHEL/CentOS..."
        echo ""
        
        sudo dnf install -y \
            webkit2gtk4.1-devel \
            gtk3-devel \
            libappindicator-gtk3-devel \
            librsvg2-devel \
            patchelf
        ;;
        
    arch|manjaro)
        echo "📦 Installation dépendances Arch/Manjaro..."
        echo ""
        
        sudo pacman -S --needed \
            webkit2gtk-4.1 \
            gtk3 \
            libappindicator-gtk3 \
            librsvg \
            patchelf
        ;;
        
    *)
        echo "⚠️  Distribution non reconnue: $ID"
        echo "Référez-vous à: https://tauri.app/v1/guides/getting-started/prerequisites"
        exit 1
        ;;
esac

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "   ✅ INSTALLATION TERMINÉE"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "🔍 Vérification des packages..."
echo ""

# Vérification pkg-config
if pkg-config --exists javascriptcoregtk-4.1; then
    VERSION=$(pkg-config --modversion javascriptcoregtk-4.1)
    echo "✅ javascriptcoregtk-4.1: $VERSION"
else
    echo "❌ javascriptcoregtk-4.1: NOT FOUND"
fi

if pkg-config --exists webkit2gtk-4.1; then
    VERSION=$(pkg-config --modversion webkit2gtk-4.1)
    echo "✅ webkit2gtk-4.1: $VERSION"
else
    echo "❌ webkit2gtk-4.1: NOT FOUND"
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "   🚀 PRÊT POUR COMPILATION TAURI"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Commandes suivantes:"
echo "   cd src-tauri"
echo "   cargo clean"
echo "   cargo check"
echo "   npm run dev"
echo ""
