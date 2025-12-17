#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# TITANE∞ - Auto-Update Desktop Icon Script
# Mise à jour automatique de l'icône dans le menu des applications
# ═══════════════════════════════════════════════════════════════

set -e

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        TITANE∞ - Desktop Icon Auto-Update                    ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Détection du répertoire du projet
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ICON_DIR="$PROJECT_DIR/src-tauri/icons"
DESKTOP_FILE="$PROJECT_DIR/titane-infinity.desktop"
DESKTOP_INSTALL_DIR="$HOME/.local/share/applications"

# Créer le répertoire si nécessaire
mkdir -p "$DESKTOP_INSTALL_DIR"

echo -e "${YELLOW}[1/4]${NC} Mise à jour du fichier .desktop avec chemins actuels..."

# Détecter le binaire (dev ou release)
BINARY_PATH=""
if [ -f "$PROJECT_DIR/src-tauri/target/release/titane-infinity" ]; then
    BINARY_PATH="$PROJECT_DIR/src-tauri/target/release/titane-infinity"
    echo -e "      ✓ Binaire Release trouvé"
elif [ -f "$PROJECT_DIR/src-tauri/target/debug/titane-infinity" ]; then
    BINARY_PATH="$PROJECT_DIR/src-tauri/target/debug/titane-infinity"
    echo -e "      ✓ Binaire Debug trouvé"
else
    echo -e "${YELLOW}      ⚠ Aucun binaire trouvé, utilisation du chemin par défaut${NC}"
    BINARY_PATH="$PROJECT_DIR/src-tauri/target/release/titane-infinity"
fi

# Icône principale
ICON_PATH="$ICON_DIR/128x128.png"
if [ ! -f "$ICON_PATH" ]; then
    ICON_PATH="$ICON_DIR/icon.png"
fi

# Créer le fichier .desktop mis à jour
cat > "$DESKTOP_FILE" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=TITANE∞ v24.3.0
Comment=🏛️ Cognitive OS - Multi-Provider AI - Production Perfect
Exec=$BINARY_PATH
Icon=$ICON_PATH
Terminal=false
Categories=Development;Utility;AI;
Keywords=AI;Chat;Cognitive;System;Memory;Singularity;
StartupWMClass=titane-infinity
StartupNotify=true
Actions=DevMode;Logs;Config;

[Desktop Action DevMode]
Name=🔧 Developer Mode
Exec=$BINARY_PATH --dev

[Desktop Action Logs]
Name=📋 View Logs
Exec=gnome-terminal -- tail -f $HOME/.titane/logs/titane.log

[Desktop Action Config]
Name=⚙️ Configuration
Exec=xdg-open $HOME/.titane/
EOF

echo -e "${YELLOW}[2/4]${NC} Copie du fichier .desktop dans les applications..."
cp "$DESKTOP_FILE" "$DESKTOP_INSTALL_DIR/titane-infinity.desktop"
chmod +x "$DESKTOP_INSTALL_DIR/titane-infinity.desktop"
echo -e "      ✓ Fichier copié vers: $DESKTOP_INSTALL_DIR/titane-infinity.desktop"

echo -e "${YELLOW}[3/4]${NC} Mise à jour du cache des icônes..."
# Mettre à jour le cache des icônes si possible
if command -v update-desktop-database &> /dev/null; then
    update-desktop-database "$DESKTOP_INSTALL_DIR" 2>/dev/null || true
    echo -e "      ✓ Cache des applications mis à jour"
fi

if command -v gtk-update-icon-cache &> /dev/null; then
    gtk-update-icon-cache -f -t "$HOME/.local/share/icons/hicolor" 2>/dev/null || true
    echo -e "      ✓ Cache des icônes GTK mis à jour"
fi

echo -e "${YELLOW}[4/4]${NC} Vérification de l'installation..."

# Vérifier que le fichier existe
if [ -f "$DESKTOP_INSTALL_DIR/titane-infinity.desktop" ]; then
    echo -e "${GREEN}✓ Installation réussie!${NC}"
    echo ""
    echo -e "Détails de l'installation:"
    echo -e "  • Fichier .desktop: ${GREEN}$DESKTOP_INSTALL_DIR/titane-infinity.desktop${NC}"
    echo -e "  • Binaire: ${GREEN}$BINARY_PATH${NC}"
    echo -e "  • Icône: ${GREEN}$ICON_PATH${NC}"
    echo ""
    echo -e "${BLUE}ℹ${NC} L'application TITANE∞ est maintenant disponible dans votre menu d'applications"
    echo -e "${BLUE}ℹ${NC} Vous pouvez la lancer en cherchant 'TITANE' dans le lanceur d'applications"
    echo ""
    echo -e "${YELLOW}Note:${NC} L'icône se mettra automatiquement à jour à chaque build."
    echo -e "      Lancez ce script après chaque compilation pour synchroniser."
else
    echo -e "${YELLOW}⚠ Erreur lors de l'installation${NC}"
    exit 1
fi
