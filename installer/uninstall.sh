#!/bin/bash
# TITANE∞ OS - Désinstallateur

INSTALL_DIR="/opt/TITANE_Infinity"
DESKTOP_FILE="/usr/share/applications/titane-infinity.desktop"
LOCAL_DESKTOP="$HOME/.local/share/applications/titane-infinity.desktop"

echo "╔══════════════════════════════════════════════════════════╗"
echo "║   TITANE∞ OS - Désinstallation                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

read -p "⚠️  Êtes-vous sûr de vouloir désinstaller TITANE∞ OS ? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Désinstallation annulée."
    exit 0
fi

echo "🗑️  Suppression des fichiers..."

# Supprimer le dossier d'installation
if [ -d "$INSTALL_DIR" ]; then
    sudo rm -rf "$INSTALL_DIR"
    echo "✅ Dossier $INSTALL_DIR supprimé"
fi

# Supprimer les fichiers .desktop
if [ -f "$DESKTOP_FILE" ]; then
    sudo rm "$DESKTOP_FILE"
    echo "✅ Fichier $DESKTOP_FILE supprimé"
fi

if [ -f "$LOCAL_DESKTOP" ]; then
    rm "$LOCAL_DESKTOP"
    echo "✅ Fichier $LOCAL_DESKTOP supprimé"
fi

# Nettoyer les caches
echo "🧹 Nettoyage des caches..."
rm -rf ~/.cache/TITANE_Infinity 2>/dev/null || true

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║   ✅ TITANE∞ OS désinstallé avec succès                 ║"
echo "╚══════════════════════════════════════════════════════════╝"
