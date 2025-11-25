#!/bin/bash
# TITANE∞ OS - Mise à jour Graphique (Zenity)

PROJECT_DIR="$(dirname "$(dirname "$0")")"
INSTALL_DIR="/opt/TITANE_Infinity"

# Vérifier Zenity
if ! command -v zenity &> /dev/null; then
    echo "❌ Zenity n'est pas installé"
    exit 1
fi

# Confirmation
zenity --question \
    --title="TITANE∞ OS - Mise à jour" \
    --text="<big><b>Mettre à jour TITANE∞ OS ?</b></big>\n\n\
Cette opération va:\n\
• Vérifier les mises à jour disponibles\n\
• Recompiler l'application\n\
• Redéployer dans $INSTALL_DIR\n\n\
<i>Durée estimée: 2-5 minutes</i>" \
    --width=450 \
    --ok-label="Mettre à jour" \
    --cancel-label="Annuler"

if [ $? -ne 0 ]; then
    exit 0
fi

# Mise à jour avec progression
(
echo "10" ; echo "# Vérification des mises à jour Git..."
cd "$PROJECT_DIR"
if [ -d ".git" ]; then
    git fetch origin 2>&1
    git pull origin main 2>&1
fi

echo "25" ; echo "# Self-Heal préventif..."
bash "$PROJECT_DIR/installer/self_heal.sh" 2>&1

echo "40" ; echo "# Compilation du Frontend..."
pnpm install 2>&1
pnpm build 2>&1

echo "65" ; echo "# Compilation du Backend..."
cd src-tauri
cargo build --release --no-default-features 2>&1
cd ..

echo "85" ; echo "# Redéploiement..."
if [ -d "$INSTALL_DIR" ]; then
    sudo cp -r dist "$INSTALL_DIR/"
    sudo cp src-tauri/target/release/titane-infinity "$INSTALL_DIR/"
fi

echo "100" ; echo "# Mise à jour terminée !"
sleep 1
) | zenity --progress \
    --title="TITANE∞ OS - Mise à jour en cours" \
    --text="Préparation..." \
    --percentage=0 \
    --auto-close \
    --width=500

# Succès
zenity --info \
    --title="TITANE∞ OS - Mise à jour terminée" \
    --text="<big><b>✅ TITANE∞ OS mis à jour avec succès !</b></big>\n\n\
Version: v19.1.0\n\
Installation: $INSTALL_DIR" \
    --width=400

exit 0
