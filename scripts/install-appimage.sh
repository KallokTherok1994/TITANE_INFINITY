#!/bin/bash
# TITANE∞ v27.0.0 - Installation Script (AppImage)
# Date: 30 janvier 2026

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║          TITANE∞ v27.0.0 - Installation (AppImage)        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
VERSION="27.0.0"
APPIMAGE_NAME="TITANE-Infinity_${VERSION}_amd64.AppImage"
INSTALL_DIR="$HOME/.local/bin"
DESKTOP_DIR="$HOME/.local/share/applications"
ICON_DIR="$HOME/.local/share/icons/hicolor/128x128/apps"

# Vérifications préliminaires
if [ ! -f "deployment/latest/v${VERSION}/${APPIMAGE_NAME}" ]; then
    echo -e "${RED}✗ Erreur: AppImage introuvable!${NC}"
    echo "  Chemin attendu: deployment/latest/v${VERSION}/${APPIMAGE_NAME}"
    exit 1
fi

echo -e "${GREEN}✓${NC} AppImage trouvée: ${APPIMAGE_NAME}"

# Créer les répertoires si nécessaire
mkdir -p "$INSTALL_DIR"
mkdir -p "$DESKTOP_DIR"
mkdir -p "$ICON_DIR"

# Copier l'AppImage
echo ""
echo "[1/4] Installation du binaire..."
cp "deployment/latest/v${VERSION}/${APPIMAGE_NAME}" "$INSTALL_DIR/titane-infinity"
chmod +x "$INSTALL_DIR/titane-infinity"
echo -e "${GREEN}✓${NC} Binaire installé: $INSTALL_DIR/titane-infinity"

# Copier l'icône
echo ""
echo "[2/4] Installation de l'icône..."
if [ -f "src-tauri/icons/128x128.png" ]; then
    cp "src-tauri/icons/128x128.png" "$ICON_DIR/titane-infinity.png"
    echo -e "${GREEN}✓${NC} Icône installée: $ICON_DIR/titane-infinity.png"
else
    echo -e "${YELLOW}⚠${NC} Icône source introuvable, ignorée"
fi

# Créer le fichier .desktop
echo ""
echo "[3/4] Création de l'entrée menu..."
cat > "$DESKTOP_DIR/titane-infinity.desktop" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=TITANE Infinity
Comment=TITANE∞ v${VERSION} - Cognitive Operating System
Exec=$INSTALL_DIR/titane-infinity
Icon=titane-infinity
Terminal=false
Categories=Development;Utility;
Keywords=AI;Cognitive;Assistant;
StartupNotify=true
StartupWMClass=TITANE-Infinity
EOF

chmod +x "$DESKTOP_DIR/titane-infinity.desktop"
echo -e "${GREEN}✓${NC} Entrée menu créée: $DESKTOP_DIR/titane-infinity.desktop"

# Mettre à jour le cache
echo ""
echo "[4/4] Mise à jour des caches système..."
if command -v update-desktop-database >/dev/null 2>&1; then
    update-desktop-database "$DESKTOP_DIR" 2>/dev/null || true
    echo -e "${GREEN}✓${NC} Cache desktop mis à jour"
fi

if command -v gtk-update-icon-cache >/dev/null 2>&1; then
    gtk-update-icon-cache -f -t "$HOME/.local/share/icons/hicolor" 2>/dev/null || true
    echo -e "${GREEN}✓${NC} Cache icônes mis à jour"
fi

# Vérifier PATH
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
    echo -e "${YELLOW}⚠ ATTENTION: $INSTALL_DIR n'est pas dans votre PATH${NC}"
    echo ""
    echo "Pour ajouter au PATH, exécutez:"
    echo "  echo 'export PATH=\"\$HOME/.local/bin:\$PATH\"' >> ~/.bashrc"
    echo "  source ~/.bashrc"
    echo ""
else
    echo -e "${GREEN}✓${NC} PATH correctement configuré"
    echo ""
fi

# Résumé
echo "✅ INSTALLATION COMPLÈTE"
echo ""
echo "📦 Package installé:"
echo "   • Binaire: $INSTALL_DIR/titane-infinity"
echo "   • Desktop: $DESKTOP_DIR/titane-infinity.desktop"
echo "   • Icône:   $ICON_DIR/titane-infinity.png"
echo ""
echo "🚀 Lancement:"
echo "   • Terminal:        titane-infinity"
echo "   • Menu:            Chercher 'TITANE' dans le lanceur"
echo "   • Chemin complet:  $INSTALL_DIR/titane-infinity"
echo ""
echo "═══════════════════════════════════════════════════════════"
