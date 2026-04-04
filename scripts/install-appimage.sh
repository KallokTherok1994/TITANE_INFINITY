#!/bin/bash
# TITANE∞ v27.0.1 - Installation Script (AppImage)
# Date: 6 février 2026

set -euo pipefail

echo "╔════════════════════════════════════════════════════════════╗"
echo "║          TITANE∞ v27.0.1 - Installation (AppImage)        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
INSTALL_DIR="$HOME/.local/bin"
DESKTOP_DIR="$HOME/.local/share/applications"
ICON_DIR="$HOME/.local/share/icons/hicolor/256x256/apps"

APPIMAGE_PATH="$(ls -1t deployment/latest/*.AppImage runtime/stable/*.AppImage 2>/dev/null | head -n 1 || true)"
APPIMAGE_NAME="$(basename "${APPIMAGE_PATH:-}")"
VERSION="unknown"
TARGET_BINARY_NAME="titane-infinity"
TARGET_BINARY_PATH="$INSTALL_DIR/$TARGET_BINARY_NAME"
SYSTEM_BINARY_PATH="/usr/bin/titane-infinity"
if [[ "$APPIMAGE_NAME" =~ ([0-9]+\.[0-9]+\.[0-9]+) ]]; then
    VERSION="${BASH_REMATCH[1]}"
fi

# Vérifications préliminaires
if [ -z "$APPIMAGE_PATH" ] || [ ! -f "$APPIMAGE_PATH" ]; then
    echo -e "${RED}✗ Erreur: AppImage introuvable!${NC}"
    echo "  Aucun artefact .AppImage récent trouvé dans deployment/latest ou runtime/stable"
    exit 1
fi

echo -e "${GREEN}✓${NC} AppImage trouvée: ${APPIMAGE_NAME}"
if [ -x "$SYSTEM_BINARY_PATH" ]; then
    TARGET_BINARY_NAME="titane-infinity-appimage"
    TARGET_BINARY_PATH="$INSTALL_DIR/$TARGET_BINARY_NAME"

    if [ -e "$INSTALL_DIR/titane-infinity" ]; then
        rm -f "$INSTALL_DIR/titane-infinity"
    fi

    echo -e "${YELLOW}⚠${NC} $SYSTEM_BINARY_PATH existe déjà — l'AppImage sera installée sous ${TARGET_BINARY_NAME} pour éviter de masquer la version DEB"
fi

# Créer les répertoires si nécessaire
mkdir -p "$INSTALL_DIR"
mkdir -p "$DESKTOP_DIR"
mkdir -p "$ICON_DIR"

# Copier l'AppImage
echo ""
echo "[1/4] Installation du binaire..."
cp "$APPIMAGE_PATH" "$TARGET_BINARY_PATH"
chmod +x "$TARGET_BINARY_PATH"
echo -e "${GREEN}✓${NC} Binaire installé: $TARGET_BINARY_PATH"

# Copier l'icône
echo ""
echo "[2/4] Installation de l'icône..."
if [ -f "src-tauri/icons/256x256.png" ]; then
    cp "src-tauri/icons/256x256.png" "$ICON_DIR/titane-infinity.png"
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
Name=TITANE∞ v${VERSION}
Comment=TITANE∞ v${VERSION} - Cognitive Operating System
Exec=$TARGET_BINARY_PATH
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
echo "   • Binaire: $TARGET_BINARY_PATH"
echo "   • Desktop: $DESKTOP_DIR/titane-infinity.desktop"
echo "   • Icône:   $ICON_DIR/titane-infinity.png"
echo ""
echo "🚀 Lancement:"
echo "   • Terminal:        $TARGET_BINARY_NAME"
if [ "$TARGET_BINARY_NAME" != "titane-infinity" ]; then
    echo "   • System DEB:      titane-infinity (préservé)"
fi
echo "   • Menu:            Chercher 'TITANE' dans le lanceur"
echo "   • Chemin complet:  $TARGET_BINARY_PATH"
echo ""
echo "═══════════════════════════════════════════════════════════"
