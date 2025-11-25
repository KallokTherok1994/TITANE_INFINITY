#!/bin/bash
# TITANE∞ OS - Création du raccourci Desktop

echo "🎛️  Création du raccourci système..."

INSTALL_DIR="/opt/TITANE_Infinity"
DESKTOP_FILE="/usr/share/applications/titane-infinity.desktop"
LOCAL_DESKTOP="$HOME/.local/share/applications/titane-infinity.desktop"

# Créer le fichier .desktop
cat > /tmp/titane-infinity.desktop << EOF
[Desktop Entry]
Name=TITANE∞ OS
Comment=Système IA Unifié - Version Infinie
Exec=$INSTALL_DIR/titane-infinity
Icon=$INSTALL_DIR/icon.png
Type=Application
Categories=Utility;AI;System;Development;
Terminal=false
StartupNotify=true
Keywords=AI;IA;System;TITANE;Intelligence;
EOF

# Installer système
echo "📌 Installation du raccourci système..."
sudo mv /tmp/titane-infinity.desktop "$DESKTOP_FILE"
sudo chmod 644 "$DESKTOP_FILE"

# Installer local
echo "📌 Installation du raccourci utilisateur..."
mkdir -p "$HOME/.local/share/applications"
cp "$DESKTOP_FILE" "$LOCAL_DESKTOP"

# Mise à jour du cache des applications
if command -v update-desktop-database &> /dev/null; then
    update-desktop-database "$HOME/.local/share/applications" 2>/dev/null || true
    sudo update-desktop-database /usr/share/applications 2>/dev/null || true
fi

echo "✅ Raccourci créé: TITANE∞ OS disponible dans le menu Applications"
exit 0
