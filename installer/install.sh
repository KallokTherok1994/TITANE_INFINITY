#!/bin/bash
# TITANE∞ OS - Installateur Complet
# © 2025 Humain Total / Kevin Thibault

set -e

INSTALL_DIR="/opt/TITANE_Infinity"
DESKTOP_FILE="/usr/share/applications/titane-infinity.desktop"
LOCAL_DESKTOP="$HOME/.local/share/applications/titane-infinity.desktop"

echo "╔══════════════════════════════════════════════════════════╗"
echo "║   TITANE∞ OS - Installation Automatique                 ║"
echo "║   Version v19.1.0                                        ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# 1. Vérification des prérequis
echo "📋 [1/8] Vérification des prérequis..."
bash "$(dirname "$0")/checks/check_dependencies.sh"

# 2. Installation des dépendances manquantes
echo "📦 [2/8] Installation des dépendances..."
if ! command -v cargo &> /dev/null; then
    echo "⚙️  Installation de Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
fi

if ! command -v pnpm &> /dev/null; then
    echo "⚙️  Installation de PNPM..."
    npm install -g pnpm
fi

# Vérifier WebKitGTK
if ! dpkg -l | grep -q "libwebkit2gtk-4.1-0"; then
    echo "⚙️  Installation de WebKitGTK 4.1..."
    sudo apt-get update
    sudo apt-get install -y \
        libwebkit2gtk-4.1-dev \
        libgtk-3-dev \
        libayatana-appindicator3-dev \
        librsvg2-dev \
        patchelf
fi

# 3. Nettoyage
echo "🧹 [3/8] Nettoyage des builds précédents..."
cd "$(dirname "$0")/.."
rm -rf dist/ src-tauri/target/release/

# 4. Build Frontend
echo "🎨 [4/8] Build du Frontend React..."
pnpm install
pnpm build

if [ ! -d "dist" ]; then
    echo "❌ Erreur: Build frontend échoué"
    exit 1
fi

# 5. Build Backend
echo "🦀 [5/8] Build du Backend Rust..."
cd src-tauri
cargo build --release --no-default-features

if [ ! -f "target/release/titane-infinity" ]; then
    echo "❌ Erreur: Build backend échoué"
    exit 1
fi

# 6. Build Tauri
echo "🌓 [6/8] Build de l'application Tauri..."
cd ..
pnpm tauri build --no-bundle

# 7. Déploiement OS
echo "🖥  [7/8] Déploiement dans /opt/..."
sudo mkdir -p "$INSTALL_DIR"
sudo cp -r dist "$INSTALL_DIR/"
sudo cp src-tauri/target/release/titane-infinity "$INSTALL_DIR/"
sudo cp installer/assets/icon.png "$INSTALL_DIR/" 2>/dev/null || true

# Créer le fichier .desktop
cat > /tmp/titane-infinity.desktop << EOF
[Desktop Entry]
Name=TITANE∞ OS
Comment=Système IA Unifié - Version Infinie
Exec=$INSTALL_DIR/titane-infinity
Icon=$INSTALL_DIR/icon.png
Type=Application
Categories=Utility;AI;System;
Terminal=false
StartupNotify=true
EOF

sudo mv /tmp/titane-infinity.desktop "$DESKTOP_FILE"
mkdir -p "$HOME/.local/share/applications"
cp "$DESKTOP_FILE" "$LOCAL_DESKTOP"

# Permissions
sudo chmod +x "$INSTALL_DIR/titane-infinity"
sudo chown -R $USER:$USER "$INSTALL_DIR"

# 8. Vérification post-installation
echo "✅ [8/8] Vérification de l'installation..."
if [ -f "$INSTALL_DIR/titane-infinity" ]; then
    echo ""
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║   ✅ TITANE∞ OS installé avec succès !                  ║"
    echo "║                                                          ║"
    echo "║   Lancer: $INSTALL_DIR/titane-infinity    ║"
    echo "║   Ou depuis le menu Applications                         ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo ""

    # Créer logs directory
    mkdir -p "$INSTALL_DIR/logs"
    echo "{\"status\":\"installed\",\"version\":\"v19.1.0\",\"date\":\"$(date -Iseconds)\"}" > "$INSTALL_DIR/logs/install_report.json"
else
    echo "❌ Erreur lors de l'installation"
    exit 1
fi
