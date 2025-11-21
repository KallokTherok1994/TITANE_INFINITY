#!/bin/bash
set -euo pipefail

# ═══════════════════════════════════════════════════════════════════════════
#  TITANE∞ v15.6 - INSTALLATION WEBKITGTK POUR POP!_OS 22.04
# ═══════════════════════════════════════════════════════════════════════════
#  Ce script doit être exécuté HORS de l'environnement Flatpak VS Code
#  Ouvrir un terminal natif Pop!_OS et exécuter :
#    cd ~/Documents/TITANE_NEWGEN/TITANE_INFINITY
#    bash install-webkit-popos.sh
# ═══════════════════════════════════════════════════════════════════════════

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  🚀 TITANE∞ v15.6 - INSTALLATION WEBKITGTK"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Vérification qu'on n'est PAS dans Flatpak
if [ -f /.flatpak-info ] || [ -n "${FLATPAK_ID:-}" ]; then
    echo "❌ ERREUR : Ce script ne peut pas s'exécuter dans Flatpak"
    echo ""
    echo "📌 SOLUTION :"
    echo "  1. Ouvrir un terminal NATIF Pop!_OS (Ctrl+Alt+T)"
    echo "  2. cd ~/Documents/TITANE_NEWGEN/TITANE_INFINITY"
    echo "  3. bash install-webkit-popos.sh"
    echo ""
    exit 1
fi

# Vérification OS
if [ ! -f /etc/os-release ]; then
    echo "❌ Impossible de détecter l'OS"
    exit 1
fi

. /etc/os-release

if [ "$ID" != "pop" ] && [ "$ID" != "ubuntu" ]; then
    echo "⚠️ Ce script est conçu pour Pop!_OS/Ubuntu"
    echo "OS détecté : $PRETTY_NAME"
    echo ""
    read -p "Continuer quand même ? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "📦 OS détecté : $PRETTY_NAME"
echo ""

# Vérification privilèges sudo
if ! sudo -v; then
    echo "❌ Privilèges sudo requis"
    exit 1
fi

echo "🔄 Mise à jour des paquets..."
sudo apt update

echo ""
echo "🔍 Vérification disponibilité WebKitGTK 4.1..."

# Tentative installation WebKitGTK 4.1
if apt-cache show libwebkit2gtk-4.1-dev >/dev/null 2>&1; then
    echo "✅ WebKitGTK 4.1 disponible"
    echo ""
    echo "📦 Installation de WebKitGTK 4.1..."
    sudo apt install -y \
        libwebkit2gtk-4.1-dev \
        libjavascriptcoregtk-4.1-dev \
        build-essential \
        curl \
        wget \
        file \
        libssl-dev \
        libayatana-appindicator3-dev \
        librsvg2-dev
    
    WEBKIT_VERSION="4.1"
    echo ""
    echo "✅ WebKitGTK 4.1 installé avec succès"
else
    echo "⚠️ WebKitGTK 4.1 non disponible sur Pop!_OS 22.04"
    echo "📦 Installation de WebKitGTK 4.0 (compatible)..."
    echo ""
    
    sudo apt install -y \
        libwebkit2gtk-4.0-dev \
        libjavascriptcoregtk-4.0-dev \
        build-essential \
        curl \
        wget \
        file \
        libssl-dev \
        libayatana-appindicator3-dev \
        librsvg2-dev
    
    WEBKIT_VERSION="4.0"
    echo ""
    echo "✅ WebKitGTK 4.0 installé avec succès"
    echo ""
    echo "⚙️ Configuration automatique de Tauri pour WebKitGTK 4.0..."
    
    # Backup Cargo.toml
    if [ -f src-tauri/Cargo.toml ]; then
        cp src-tauri/Cargo.toml src-tauri/Cargo.toml.backup_$(date +%Y%m%d_%H%M%S)
        echo "✅ Backup : src-tauri/Cargo.toml.backup_$(date +%Y%m%d_%H%M%S)"
    fi
    
    # Modification Cargo.toml pour WebKitGTK 4.0
    if [ -f src-tauri/Cargo.toml ]; then
        sed -i 's/webkit2gtk = { version = "=2.0", features = \["v2_40"\] }/webkit2gtk = { version = "2.0", features = ["v2_38"] }/' src-tauri/Cargo.toml
        echo "✅ src-tauri/Cargo.toml configuré pour WebKitGTK 4.0"
    fi
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  ✅ INSTALLATION COMPLÉTÉE"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "WebKitGTK Version : $WEBKIT_VERSION"
echo ""
echo "🧪 TEST DE COMPILATION :"
echo "  cd ~/Documents/TITANE_NEWGEN/TITANE_INFINITY"
echo "  npm run tauri build"
echo ""
echo "🚀 LANCEMENT DEV :"
echo "  npm run tauri dev"
echo ""
echo "📝 NOTES :"
if [ "$WEBKIT_VERSION" = "4.0" ]; then
    echo "  - WebKitGTK 4.0 utilisé (compatible Pop!_OS 22.04)"
    echo "  - Pour 4.1 : Upgrade vers Pop!_OS 24.04 recommandé"
fi
echo "  - Frontend fonctionnel : npm run dev (:5173)"
echo "  - Tauri natif requiert WebKitGTK installé"
echo ""
echo "═══════════════════════════════════════════════════════════"
