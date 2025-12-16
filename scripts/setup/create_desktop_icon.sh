#!/bin/bash
# TITANE∞ - Icône de Lancement Rapide sur Bureau
# Crée l'icône .desktop sur le bureau

DESKTOP_DIR="$HOME/Desktop"
[ ! -d "$DESKTOP_DIR" ] && DESKTOP_DIR="$HOME/Bureau"
[ ! -d "$DESKTOP_DIR" ] && mkdir -p "$HOME/Desktop" && DESKTOP_DIR="$HOME/Desktop"

INSTALLER_SCRIPT="/home/titane/Documents/TITANE_INFINITY/installer_gui/titane_installer.sh"
ICON_PATH="/home/titane/Documents/TITANE_INFINITY/src-tauri/icons/128x128.png"

DESKTOP_FILE="$DESKTOP_DIR/TITANE_Installer.desktop"

cat > "$DESKTOP_FILE" << 'EOF'
[Desktop Entry]
Version=1.0
Type=Application
Name=🚀 TITANE∞ Installer v16.2.2
Comment=Installeur Graphique TITANE∞ v16.2.2 - Chat IA Fixed + 20 Engines
Exec=bash /home/titane/Documents/TITANE_INFINITY/installer_gui/titane_installer.sh
Icon=/home/titane/Documents/TITANE_INFINITY/src-tauri/icons/128x128.png
Terminal=false
Categories=System;Utility;Development;
StartupNotify=true
Keywords=TITANE;Installer;Deploy;Build;v16.2.2;
Actions=BuildOnly;RepairMode;UpdateMode;

[Desktop Action BuildOnly]
Name=🔨 Build Production (Pipeline Complet)
Exec=bash /home/titane/Documents/TITANE_INFINITY/scripts/autobuild_full.sh

[Desktop Action RepairMode]
Name=🛠️ Mode Réparation (Self-Heal)
Exec=bash /home/titane/Documents/TITANE_INFINITY/installer_gui/titane_installer.sh

[Desktop Action UpdateMode]
Name=⬆️ Build & Test Dev (Fast)
Exec=bash -c "cd /home/titane/Documents/TITANE_INFINITY && npm run tauri:dev"
EOF

chmod +x "$DESKTOP_FILE"

# Rendre le .desktop exécutable (GNOME/Pop!_OS)
gio set "$DESKTOP_FILE" "metadata::trusted" true 2>/dev/null || true

echo "✅ Icône créée sur le bureau: $DESKTOP_FILE"
echo ""
echo "🎯 Actions disponibles:"
echo "   - Double-clic: Lance l'installeur GUI"
echo "   - Clic droit → Build seulement"
echo "   - Clic droit → Mode Réparation"
echo "   - Clic droit → Mise à jour"
echo ""
echo "📍 Emplacement: $DESKTOP_FILE"
