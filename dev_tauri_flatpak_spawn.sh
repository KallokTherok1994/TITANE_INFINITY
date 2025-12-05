#!/bin/bash

##############################################################################
# TITANE∞ - Lancement Tauri via flatpak-spawn (depuis VS Code Flatpak)
# Permet de sortir du conteneur VS Code pour accéder au système hôte
##############################################################################

echo "🔩 TITANE∞ - Lancement Tauri via système hôte"
echo ""

# Vérifier que flatpak-spawn est disponible
if ! command -v flatpak-spawn &> /dev/null; then
    echo "❌ flatpak-spawn non disponible"
    echo "   → Utilisez un terminal système (Super+T) à la place"
    exit 1
fi

echo "🌐 Exécution sur le système hôte (hors Flatpak)..."
echo ""

# Exécuter dev_tauri.sh sur le système HÔTE (pas dans le conteneur)
flatpak-spawn --host bash -c "cd /home/titane/Documents/TITANE_INFINITY && ./dev_tauri.sh"

echo ""
echo "🛑 Tauri arrêté (système hôte)"
