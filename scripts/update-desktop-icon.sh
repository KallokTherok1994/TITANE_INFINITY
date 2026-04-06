#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# TITANE∞ - Auto-Update Desktop Icon Script
# Mise à jour automatique de l'icône dans le menu des applications
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        TITANE∞ - Desktop Icon Auto-Update                    ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Détection du répertoire du projet (racine du repo)
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
ICON_DIR="$PROJECT_DIR/src-tauri/icons"
DESKTOP_FILE="$PROJECT_DIR/titane-infinity.desktop"
DESKTOP_INSTALL_DIR="$HOME/.local/share/applications"
LAUNCHER_SCRIPT="$PROJECT_DIR/launch-titane.sh"

extract_version_from_path() {
    local artifact_path="$1"
    local artifact_name=""

    artifact_name="$(basename "$artifact_path")"
    if [[ "$artifact_name" =~ ([0-9]+\.[0-9]+\.[0-9]+) ]]; then
        printf '%s' "${BASH_REMATCH[1]}"
    fi
}

# Créer le répertoire si nécessaire
mkdir -p "$DESKTOP_INSTALL_DIR"

echo -e "${YELLOW}[1/4]${NC} Mise à jour du fichier .desktop avec chemins actuels..."

# Détecter l'exécutable à utiliser (priorité: AppImage la plus récente déployée/stable → binaire installé → cargo release → cargo debug)
BINARY_PATH=""

shopt -s nullglob
DEPLOY_APPIMAGES=("$PROJECT_DIR"/deployment/latest/*.AppImage)
STABLE_APPIMAGES=("$PROJECT_DIR"/runtime/stable/*.AppImage)
BUNDLE_APPIMAGES=("$PROJECT_DIR"/src-tauri/target/release/bundle/appimage/*.AppImage)
ALL_APPIMAGES=("${DEPLOY_APPIMAGES[@]}" "${STABLE_APPIMAGES[@]}" "${BUNDLE_APPIMAGES[@]}")
shopt -u nullglob

if [ ${#ALL_APPIMAGES[@]} -gt 0 ]; then
    BINARY_PATH="$(ls -1t "${ALL_APPIMAGES[@]}" 2>/dev/null | head -n 1)"
    echo -e "      ✓ AppImage la plus récente trouvée"
elif [ -x "/usr/bin/titane-infinity" ]; then
    BINARY_PATH="/usr/bin/titane-infinity"
    echo -e "      ✓ Binaire installé trouvé (/usr/bin)"
elif [ -x "$PROJECT_DIR/src-tauri/target/release/titane-infinity" ]; then
    BINARY_PATH="$PROJECT_DIR/src-tauri/target/release/titane-infinity"
    echo -e "      ✓ Binaire Release trouvé"
elif [ -x "$PROJECT_DIR/src-tauri/target/debug/titane-infinity" ]; then
    BINARY_PATH="$PROJECT_DIR/src-tauri/target/debug/titane-infinity"
    echo -e "      ✓ Binaire Debug trouvé"
else
    echo -e "${YELLOW}      ⚠ Aucun exécutable trouvé, utilisation du chemin par défaut${NC}"
    BINARY_PATH="$PROJECT_DIR/src-tauri/target/release/titane-infinity"
fi

# Assurer les répertoires de logs attendus par l'action "Logs"
mkdir -p "$HOME/.titane/logs"
chmod +x "$LAUNCHER_SCRIPT" 2>/dev/null || true

# Si on lance une AppImage, vérifier si FUSE est utilisable.
# En environnement restreint, le montage AppImage peut échouer ("Operation not permitted");
# on bascule alors sur --appimage-extract-and-run pour garantir le démarrage.
EXEC_BASE="$BINARY_PATH"
if [[ "$BINARY_PATH" == *.AppImage ]]; then
    MOUNT_PROBE_OUT="$(timeout 2s "$BINARY_PATH" --appimage-mount 2>&1 || true)"
    MOUNT_PROBE_FIRST_LINE="$(printf '%s\n' "$MOUNT_PROBE_OUT" | head -n 1)"

    if [[ "$MOUNT_PROBE_OUT" == *"Cannot mount AppImage"* || "$MOUNT_PROBE_OUT" == *"mount failed"* || "$MOUNT_PROBE_OUT" == *"fusermount"* ]]; then
        EXEC_BASE="$BINARY_PATH --appimage-extract-and-run"
        echo -e "      ${YELLOW}⚠ FUSE indisponible → --appimage-extract-and-run${NC}"
    elif [[ "$MOUNT_PROBE_FIRST_LINE" == /* ]]; then
        :
    else
        EXEC_BASE="$BINARY_PATH --appimage-extract-and-run"
        echo -e "      ${YELLOW}⚠ FUSE indéterminé → --appimage-extract-and-run${NC}"
    fi
fi

# Icône principale
ICON_PATH="$ICON_DIR/128x128.png"
if [ ! -f "$ICON_PATH" ]; then
    ICON_PATH="$ICON_DIR/icon.png"
fi

# Version affichée dans le menu : reflète le binaire réellement sélectionné.
CANONICAL_VERSION=""
if [ -f "$PROJECT_DIR/src-tauri/tauri.conf.json" ]; then
    CANONICAL_VERSION="$(grep -m1 '"version"' "$PROJECT_DIR/src-tauri/tauri.conf.json" | sed -E 's/.*"version"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/')"
fi
if [ -z "$CANONICAL_VERSION" ] && [ -f "$PROJECT_DIR/runtime/stable/tauri.conf.json" ]; then
    CANONICAL_VERSION="$(grep -m1 '"version"' "$PROJECT_DIR/runtime/stable/tauri.conf.json" | sed -E 's/.*"version"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/')"
fi
if [ -z "$CANONICAL_VERSION" ] && [ -f "$PROJECT_DIR/package.json" ]; then
    CANONICAL_VERSION="$(grep -m1 '"version"' "$PROJECT_DIR/package.json" | sed -E 's/.*"version"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/')"
fi

APP_VERSION="$(extract_version_from_path "$BINARY_PATH")"
if [ -z "$APP_VERSION" ]; then
    APP_VERSION="$CANONICAL_VERSION"
fi
if [ -z "$APP_VERSION" ]; then
    APP_VERSION="unknown"
fi

if [ -n "$CANONICAL_VERSION" ] && [ -n "$APP_VERSION" ] && [ "$APP_VERSION" != "$CANONICAL_VERSION" ]; then
    echo -e "      ${YELLOW}⚠ Launcher version aligned to selected binary: $APP_VERSION (canonical repo version: $CANONICAL_VERSION)${NC}"
fi

APP_NAME="TITANE∞ v$APP_VERSION"

# Créer le fichier .desktop mis à jour
cat > "$DESKTOP_FILE" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=$APP_NAME
Comment=🏛️ Cognitive OS - Multi-Provider AI - Production Perfect
Exec=$LAUNCHER_SCRIPT
Icon=$ICON_PATH
Terminal=false
Categories=Development;Utility;AI;
Keywords=AI;Chat;Cognitive;System;Memory;Singularity;
StartupWMClass=titane-infinity
StartupNotify=true
Actions=DevMode;Logs;Config;

[Desktop Action DevMode]
Name=🔧 Developer Mode
Exec=$LAUNCHER_SCRIPT --dev

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

# Sur certains systèmes, une entrée globale peut exister sous un nom différent
# (ex: /usr/share/applications/TITANE-Infinity.desktop avec Exec=titane-infinity).
# On installe aussi un override local avec le même nom pour garantir que le menu
# lance le bon binaire.
cp "$DESKTOP_FILE" "$DESKTOP_INSTALL_DIR/TITANE-Infinity.desktop"
chmod +x "$DESKTOP_INSTALL_DIR/TITANE-Infinity.desktop"

echo -e "      ✓ Fichiers copiés vers:"
echo -e "        - $DESKTOP_INSTALL_DIR/titane-infinity.desktop"
echo -e "        - $DESKTOP_INSTALL_DIR/TITANE-Infinity.desktop"

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
