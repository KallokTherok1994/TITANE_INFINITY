#!/bin/bash
# TITANE∞ OS - Désinstallateur Graphique (Zenity)

INSTALL_DIR="/opt/TITANE_Infinity"
DESKTOP_FILE="/usr/share/applications/titane-infinity.desktop"
LOCAL_DESKTOP="$HOME/.local/share/applications/titane-infinity.desktop"

# Vérifier Zenity
if ! command -v zenity &> /dev/null; then
    echo "❌ Zenity n'est pas installé"
    exit 1
fi

# Confirmation
zenity --question \
    --title="TITANE∞ OS - Désinstallation" \
    --text="<big><b>⚠️  Confirmer la désinstallation ?</b></big>\n\n\
Cela va supprimer:\n\
• $INSTALL_DIR\n\
• Les raccourcis du menu Applications\n\
• Les caches locaux\n\n\
<i>Cette action est irréversible.</i>" \
    --width=450 \
    --ok-label="Désinstaller" \
    --cancel-label="Annuler"

if [ $? -ne 0 ]; then
    zenity --info \
        --title="TITANE∞ OS" \
        --text="Désinstallation annulée." \
        --width=300
    exit 0
fi

# Désinstallation avec progression
(
echo "25" ; echo "# Suppression de $INSTALL_DIR..."
if [ -d "$INSTALL_DIR" ]; then
    sudo rm -rf "$INSTALL_DIR"
fi

echo "50" ; echo "# Suppression des raccourcis..."
if [ -f "$DESKTOP_FILE" ]; then
    sudo rm "$DESKTOP_FILE"
fi
if [ -f "$LOCAL_DESKTOP" ]; then
    rm "$LOCAL_DESKTOP"
fi

echo "75" ; echo "# Nettoyage des caches..."
rm -rf ~/.cache/TITANE_Infinity 2>/dev/null || true

echo "100" ; echo "# Désinstallation terminée !"
sleep 1
) | zenity --progress \
    --title="TITANE∞ OS - Désinstallation" \
    --text="Préparation..." \
    --percentage=0 \
    --auto-close \
    --width=400

# Confirmation finale
zenity --info \
    --title="TITANE∞ OS - Désinstallation terminée" \
    --text="<big><b>✅ TITANE∞ OS désinstallé avec succès</b></big>\n\n\
Tous les fichiers ont été supprimés proprement." \
    --width=400

exit 0
