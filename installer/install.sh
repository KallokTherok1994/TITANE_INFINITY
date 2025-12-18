#!/bin/bash
# TITANE∞ OS - Installateur Complet
# © 2025 Humain Total / Kevin Thibault

set -e

INSTALL_DIR="/opt/TITANE_Infinity"
DESKTOP_FILE="/usr/share/applications/titane-infinity.desktop"
LOCAL_DESKTOP="$HOME/.local/share/applications/titane-infinity.desktop"
BACKUP_DIR="/tmp/titane_backup_$(date +%s)"
VERSION="v24.2.0"

echo "╔══════════════════════════════════════════════════════════╗"
echo "║   TITANE∞ OS - Installation Automatique                 ║"
echo "║   Version v24.2.0                                        ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# 0. Validation Pre-Flight
echo "🔍 [0/9] Validation pre-flight..."

# Vérifier espace disque (besoin ~2GB)
REQUIRED_SPACE_MB=2048
AVAILABLE_SPACE_MB=$(df -m "$(dirname "$0")" | awk 'NR==2 {print $4}')
if [ "$AVAILABLE_SPACE_MB" -lt "$REQUIRED_SPACE_MB" ]; then
    echo "❌ Espace disque insuffisant: ${AVAILABLE_SPACE_MB}MB disponibles, ${REQUIRED_SPACE_MB}MB requis"
    exit 1
fi

# Créer backup si installation existante
if [ -d "$INSTALL_DIR" ]; then
    echo "💾 Backup installation existante vers $BACKUP_DIR..."
    sudo mkdir -p "$BACKUP_DIR"
    sudo cp -r "$INSTALL_DIR" "$BACKUP_DIR/" || true
fi

echo "✅ Pre-flight validation OK"

# 1. Vérification des prérequis
echo "📋 [1/9] Vérification des prérequis..."
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
echo "🧹 [3/9] Nettoyage des builds précédents..."
cd "$(dirname "$0")/.."
rm -rf dist/ src-tauri/target/release/

# 4. Build Frontend
echo "🎨 [4/9] Build du Frontend React..."
pnpm install
pnpm build

if [ ! -d "dist" ]; then
    echo "❌ Erreur: Build frontend échoué"
    [ -d "$BACKUP_DIR" ] && echo "💾 Backup disponible: $BACKUP_DIR"
    exit 1
fi

# Vérifier taille dist
DIST_SIZE=$(du -sm dist | cut -f1)
if [ "$DIST_SIZE" -lt 1 ]; then
    echo "❌ Build frontend invalide (dist trop petit: ${DIST_SIZE}MB)"
    [ -d "$BACKUP_DIR" ] && echo "💾 Backup disponible: $BACKUP_DIR"
    exit 1
fi

# 5. Build Backend
echo "🦀 [5/9] Build du Backend Rust..."
cd src-tauri
cargo build --release --no-default-features

if [ ! -f "target/release/titane-infinity" ]; then
    echo "❌ Erreur: Build backend échoué"
    [ -d "$BACKUP_DIR" ] && echo "💾 Backup disponible: $BACKUP_DIR"
    exit 1
fi

# Vérifier binary size et executable
BINARY_SIZE=$(stat -f%z "target/release/titane-infinity" 2>/dev/null || stat -c%s "target/release/titane-infinity")
if [ "$BINARY_SIZE" -lt 1000000 ]; then
    echo "❌ Binary backend invalide (trop petit: ${BINARY_SIZE} bytes)"
    [ -d "$BACKUP_DIR" ] && echo "💾 Backup disponible: $BACKUP_DIR"
    exit 1
fi

# 6. Build Tauri
echo "🌓 [6/9] Build de l'application Tauri..."
cd ..
pnpm tauri build --no-bundle

# 7. Déploiement OS
echo "🖥  [7/9] Déploiement dans /opt/..."
sudo mkdir -p "$INSTALL_DIR"
sudo cp -r dist "$INSTALL_DIR/"
sudo cp src-tauri/target/release/titane-infinity "$INSTALL_DIR/"
sudo cp installer/assets/icon.png "$INSTALL_DIR/" 2>/dev/null || true

# Créer le fichier .desktop
cat > /tmp/titane-infinity.desktop << EOF
[Desktop Entry]
Name=TITANE∞ OS
Comment=Sys9] Vérification de l'installation..."
if [ -f "$INSTALL_DIR/titane-infinity" ]; then
    # Smoke test: vérifier que le binary est exécutable
    if [ -x "$INSTALL_DIR/titane-infinity" ]; then
        echo "✅ Binary exécutable OK"
    else
        echo "❌ Binary non exécutable"
        [ -d "$BACKUP_DIR" ] && echo "💾 Backup disponible: $BACKUP_DIR"
        exit 1
    fi

    # Vérifier dist
    if [ -d "$INSTALL_DIR/dist" ] && [ "$(ls -A "$INSTALL_DIR/dist")" ]; then
        echo "✅ Frontend dist OK"
    else
        echo "❌ Frontend dist manquant ou vide"
        [ -d "$BACKUP_DIR" ] && echo "💾 Backup disponible: $BACKUP_DIR"
        exit 1
    fi

    # Créer logs directory
    mkdir -p "$INSTALL_DIR/logs"
    echo "{\"status\":\"installed\",\"version\":\"$VERSION\",\"date\":\"$(date -Iseconds)\",\"backup\":\"$BACKUP_DIR\"}" > "$INSTALL_DIR/logs/install_report.json"

    # 9. Cleanup backup si succès
    echo "🧹 [9/9] Cleanup backup (succès)..."
    if [ -d "$BACKUP_DIR" ]; then
        echo "💾 Backup conservé pour rollback manuel si besoin: $BACKUP_DIR"
        echo "   Pour supprimer: sudo rm -rf $BACKUP_DIR"
    fi

    echo ""
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║   ✅ TITANE∞ OS installé avec succès !                  ║"
    echo "║   Version: $VERSION                                      ║"
    echo "║                                                          ║"
    echo "║   Lancer: $INSTALL_DIR/titane-infinity    ║"
    echo "║   Ou depuis le menu Applications                         ║"
    echo "║                                                          ║"
    echo "║   📊 Logs: $INSTALL_DIR/logs/                           ║"
    echo "║   💾 Backup: $BACKUP_DIR (si besoin)                    ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo ""
else
    echo "❌ Erreur: Binary principal non trouvé"
    if [ -d "$BACKUP_DIR" ]; then
        echo "🔄 Rollback automatique depuis $BACKUP_DIR..."
        sudo rm -rf "$INSTALL_DIR"
        sudo mv "$BACKUP_DIR/TITANE_Infinity" "$INSTALL_DIR"
        echo "✅ Rollback terminé - ancienne version restaurée"
    fi

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
    echo "{\"status\":\"installed\",\"version\":\"v24.2.0\",\"date\":\"$(date -Iseconds)\"}" > "$INSTALL_DIR/logs/install_report.json"
else
    echo "❌ Erreur lors de l'installation"
    exit 1
fi
