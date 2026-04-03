#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# TITANE∞ v∞ — DEPLOY SCRIPT
# Déploiement local : installation, vérification, création raccourci
# ═══════════════════════════════════════════════════════════════════════════════

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
INSTALL_DIR="${HOME}/.local/share/titane-infinity"
BIN_DIR="${HOME}/.local/bin"
DESKTOP_DIR="${HOME}/.local/share/applications"

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   TITANE∞ v∞ — DEPLOYMENT${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

cd "$PROJECT_ROOT"

# ─────────────────────────────────────────────────────────────────────────────
# 1. FIND BUNDLE
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${YELLOW}[1/5] Locating build artifacts...${NC}"

BUNDLE_DIR="src-tauri/target/release/bundle"
APPIMAGE=""
DEB=""

# Chercher AppImage
if ls "$BUNDLE_DIR/appimage/"*.AppImage 1> /dev/null 2>&1; then
    APPIMAGE=$(ls -1 "$BUNDLE_DIR/appimage/"*.AppImage | head -1)
    echo -e "${GREEN}✓${NC} Found AppImage: $(basename "$APPIMAGE")"
fi

# Chercher DEB
if ls "$BUNDLE_DIR/deb/"*.deb 1> /dev/null 2>&1; then
    DEB=$(ls -1 "$BUNDLE_DIR/deb/"*.deb | head -1)
    echo -e "${GREEN}✓${NC} Found DEB: $(basename "$DEB")"
fi

if [ -z "$APPIMAGE" ] && [ -z "$DEB" ]; then
    echo -e "${RED}✗ No build artifacts found. Run build_titane.sh first.${NC}"
    exit 1
fi
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# 2. SELECT INSTALLATION METHOD
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${YELLOW}[2/5] Selecting installation method...${NC}"

INSTALL_METHOD=""
if [ -n "$1" ]; then
    INSTALL_METHOD="$1"
elif [ -n "$APPIMAGE" ]; then
    INSTALL_METHOD="appimage"
elif [ -n "$DEB" ]; then
    INSTALL_METHOD="deb"
fi

echo -e "${CYAN}Using: ${INSTALL_METHOD}${NC}"
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# 3. INSTALL
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${YELLOW}[3/5] Installing TITANE∞...${NC}"

case "$INSTALL_METHOD" in
    appimage)
        # Créer les répertoires
        mkdir -p "$INSTALL_DIR"
        mkdir -p "$BIN_DIR"

        # Copier AppImage
        cp "$APPIMAGE" "$INSTALL_DIR/titane-infinity.AppImage"
        chmod +x "$INSTALL_DIR/titane-infinity.AppImage"

        # Créer lien symbolique
        ln -sf "$INSTALL_DIR/titane-infinity.AppImage" "$BIN_DIR/titane-infinity"

        echo -e "${GREEN}✓ AppImage installed to: $INSTALL_DIR${NC}"
        ;;

    deb)
        echo -e "${CYAN}Installing DEB package (requires sudo)...${NC}"
        sudo dpkg -i "$DEB" || sudo apt-get install -f -y
        echo -e "${GREEN}✓ DEB package installed${NC}"
        ;;

    *)
        echo -e "${RED}✗ Unknown installation method: $INSTALL_METHOD${NC}"
        exit 1
        ;;
esac
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# 4. CREATE DESKTOP ENTRY
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${YELLOW}[4/5] Creating desktop entry...${NC}"

mkdir -p "$DESKTOP_DIR"

cat > "$DESKTOP_DIR/titane-infinity.desktop" << EOF
[Desktop Entry]
Name=TITANE∞
Comment=Assistant IA Cognitif Avancé
Exec=$BIN_DIR/titane-infinity
Icon=$INSTALL_DIR/icon.png
Terminal=false
Type=Application
Categories=Development;Utility;
StartupWMClass=titane-infinity
EOF

# Copier icône si disponible
if [ -f "src-tauri/icons/128x128.png" ]; then
    cp "src-tauri/icons/128x128.png" "$INSTALL_DIR/icon.png"
fi

# Mettre à jour la base de données des applications
if command -v update-desktop-database &> /dev/null; then
    update-desktop-database "$DESKTOP_DIR" 2>/dev/null || true
fi

echo -e "${GREEN}✓ Desktop entry created${NC}"
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# 5. VERIFY INSTALLATION
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${YELLOW}[5/5] Verifying installation...${NC}"

# Vérifier que le binaire est accessible
if command -v titane-infinity &> /dev/null || [ -x "$BIN_DIR/titane-infinity" ]; then
    echo -e "${GREEN}✓ TITANE∞ is accessible from PATH${NC}"
else
    echo -e "${YELLOW}⚠ TITANE∞ not in PATH. Add to ~/.bashrc:${NC}"
    echo -e "   export PATH=\"\$PATH:$BIN_DIR\""
fi

# Générer checksum
if [ -f "$INSTALL_DIR/titane-infinity.AppImage" ]; then
    CHECKSUM=$(sha256sum "$INSTALL_DIR/titane-infinity.AppImage" | cut -d' ' -f1)
    echo -e "${CYAN}SHA256: ${CHECKSUM:0:16}...${NC}"
    echo "$CHECKSUM  titane-infinity.AppImage" > "$INSTALL_DIR/checksum.sha256"
fi

# ─────────────────────────────────────────────────────────────────────────────
# RÉSUMÉ
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ DEPLOYMENT COMPLETE — TITANE∞ v∞${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}To launch:${NC}"
echo -e "  titane-infinity"
echo -e "  or find 'TITANE∞' in your applications menu"
echo ""

exit 0
