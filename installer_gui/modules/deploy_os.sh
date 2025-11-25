#!/bin/bash
# TITANE∞ OS - Déploiement OS

echo "🖥️  Déploiement dans le système..."

PROJECT_DIR="$(dirname "$(dirname "$(dirname "$0")")")"
INSTALL_DIR="/opt/TITANE_Infinity"

# Créer le dossier d'installation
echo "📁 Création de $INSTALL_DIR..."
sudo mkdir -p "$INSTALL_DIR"

# Copier les fichiers
echo "📋 Copie des fichiers..."
sudo cp -r "$PROJECT_DIR/dist" "$INSTALL_DIR/"
sudo cp "$PROJECT_DIR/src-tauri/target/release/titane-infinity" "$INSTALL_DIR/"

# Copier l'icône si elle existe
if [ -f "$PROJECT_DIR/installer/assets/icon.png" ]; then
    sudo cp "$PROJECT_DIR/installer/assets/icon.png" "$INSTALL_DIR/"
fi

# Permissions
echo "🔐 Configuration des permissions..."
sudo chmod +x "$INSTALL_DIR/titane-infinity"
sudo chown -R $USER:$USER "$INSTALL_DIR"

# Créer dossier logs
sudo mkdir -p "$INSTALL_DIR/logs"
sudo chown -R $USER:$USER "$INSTALL_DIR/logs"

echo "✅ Déploiement terminé dans $INSTALL_DIR"
exit 0
