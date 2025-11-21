#!/usr/bin/env bash
set -e

# ═══════════════════════════════════════════════════════════
#   TITANE∞ v15.5 — Installation Dépendances Tauri Linux
# ═══════════════════════════════════════════════════════════

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "════════════════════════════════════════════════════════"
echo "  🔧 TITANE∞ — Installation Dépendances Tauri"
echo "════════════════════════════════════════════════════════"
echo ""

echo -e "${YELLOW}⚠️  Ce script nécessite sudo pour installer des packages système${NC}"
echo ""

# Détecter la distribution
if [ -f /etc/os-release ]; then
    . /etc/os-release
    DISTRO=$ID
else
    echo -e "${RED}✗ Impossible de détecter la distribution Linux${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Distribution détectée : $PRETTY_NAME${NC}"
echo ""

case $DISTRO in
    ubuntu|pop|debian|linuxmint)
        echo -e "${BLUE}Installation pour Ubuntu/Pop!_OS/Debian...${NC}"
        echo ""
        
        echo -e "${BLUE}[1/3] Mise à jour des sources...${NC}"
        sudo apt update
        echo ""
        
        echo -e "${BLUE}[2/3] Installation des dépendances Tauri...${NC}"
        sudo apt install -y \
            libwebkit2gtk-4.1-dev \
            libgtk-3-dev \
            libayatana-appindicator3-dev \
            librsvg2-dev \
            patchelf \
            libssl-dev \
            build-essential \
            curl \
            wget \
            file
        
        echo ""
        echo -e "${GREEN}✓ Dépendances installées avec succès${NC}"
        ;;
        
    fedora|rhel|centos)
        echo -e "${BLUE}Installation pour Fedora/RHEL/CentOS...${NC}"
        echo ""
        
        sudo dnf install -y \
            webkit2gtk4.1-devel \
            gtk3-devel \
            libappindicator-gtk3-devel \
            librsvg2-devel \
            patchelf \
            openssl-devel \
            gcc \
            gcc-c++ \
            make
        
        echo ""
        echo -e "${GREEN}✓ Dépendances installées avec succès${NC}"
        ;;
        
    arch|manjaro)
        echo -e "${BLUE}Installation pour Arch/Manjaro...${NC}"
        echo ""
        
        sudo pacman -Sy --needed --noconfirm \
            webkit2gtk-4.1 \
            gtk3 \
            libappindicator-gtk3 \
            librsvg \
            patchelf \
            openssl \
            base-devel
        
        echo ""
        echo -e "${GREEN}✓ Dépendances installées avec succès${NC}"
        ;;
        
    opensuse*)
        echo -e "${BLUE}Installation pour openSUSE...${NC}"
        echo ""
        
        sudo zypper install -y \
            webkit2gtk3-devel \
            gtk3-devel \
            libappindicator3-devel \
            librsvg-devel \
            patchelf \
            libopenssl-devel \
            gcc \
            gcc-c++ \
            make
        
        echo ""
        echo -e "${GREEN}✓ Dépendances installées avec succès${NC}"
        ;;
        
    *)
        echo -e "${RED}✗ Distribution non supportée automatiquement : $DISTRO${NC}"
        echo ""
        echo "Installez manuellement les dépendances suivantes :"
        echo "  - webkit2gtk-4.1 (ou webkit2gtk)"
        echo "  - gtk3"
        echo "  - libappindicator3"
        echo "  - librsvg2"
        echo "  - patchelf"
        echo "  - openssl"
        echo "  - build-essential / gcc / make"
        echo ""
        echo "Consultez : https://tauri.app/v1/guides/getting-started/prerequisites#linux"
        exit 1
        ;;
esac

echo ""
echo "════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ INSTALLATION TERMINÉE${NC}"
echo "════════════════════════════════════════════════════════"
echo ""
echo "🧪 Vérification des bibliothèques installées :"
echo ""

# Vérifier WebKitGTK
if pkg-config --exists webkit2gtk-4.1 2>/dev/null; then
    VERSION=$(pkg-config --modversion webkit2gtk-4.1)
    echo -e "  ${GREEN}✓${NC} WebKitGTK 4.1 : $VERSION"
elif pkg-config --exists webkit2gtk-4.0 2>/dev/null; then
    VERSION=$(pkg-config --modversion webkit2gtk-4.0)
    echo -e "  ${YELLOW}⚠${NC} WebKitGTK 4.0 : $VERSION (4.1 recommandé)"
else
    echo -e "  ${RED}✗${NC} WebKitGTK non détecté"
fi

# Vérifier GTK3
if pkg-config --exists gtk+-3.0 2>/dev/null; then
    VERSION=$(pkg-config --modversion gtk+-3.0)
    echo -e "  ${GREEN}✓${NC} GTK3 : $VERSION"
else
    echo -e "  ${RED}✗${NC} GTK3 non détecté"
fi

echo ""
echo "🚀 Prochaines étapes :"
echo "  1. Relancer la compilation : npm run tauri:dev"
echo "  2. Si erreur persiste : npm run clean && npm install"
echo "  3. Consulter les logs détaillés avec : npm run tauri:dev --verbose"
echo ""
