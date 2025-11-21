#!/bin/bash

################################################################################
# TITANE∞ v10 - FIX WEBKIT DEPENDENCIES
# Résolution problème webkit2gtk-4.1 → fallback vers webkit2gtk-4.0
################################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  TITANE∞ v10 - FIX WEBKIT DEPENDENCIES${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Vérifier versions webkit disponibles
echo -e "${YELLOW}[INFO]${NC} Versions webkit disponibles:"
pkg-config --list-all | grep -E "webkit|javascript" || echo "  (aucune via pkg-config)"
echo ""

# Vérifier si webkit2gtk-4.0 existe
if pkg-config --exists webkit2gtk-4.0 2>/dev/null; then
    WEBKIT_VERSION=$(pkg-config --modversion webkit2gtk-4.0)
    echo -e "${GREEN}[OK]${NC} webkit2gtk-4.0 v${WEBKIT_VERSION} détecté"
    echo ""
    
    # Downgrade Tauri pour compatibilité webkit 4.0
    echo -e "${YELLOW}[FIX]${NC} Modification Cargo.toml pour webkit2gtk-4.0..."
    
    cd "$(dirname "$0")/src-tauri"
    
    # Backup Cargo.toml
    cp Cargo.toml Cargo.toml.backup_webkit
    
    # Downgrade tauri et dépendances webkit
    sed -i 's/tauri = { version = "2\./tauri = { version = "1.7/g' Cargo.toml
    sed -i 's/tauri-build = "2\./tauri-build = "1.5/g' Cargo.toml
    
    echo -e "${GREEN}[OK]${NC} Cargo.toml modifié (backup: Cargo.toml.backup_webkit)"
    
    # Nettoyer cache
    echo ""
    echo -e "${YELLOW}[INFO]${NC} Nettoyage cache Cargo..."
    cargo clean
    
    echo ""
    echo -e "${GREEN}[✓ SUCCESS]${NC} Configuration adaptée pour webkit2gtk-4.0"
    echo ""
    echo -e "${CYAN}Relancer:${NC} ./launch_dev.sh"
    
elif pkg-config --exists gtk+-3.0 2>/dev/null; then
    GTK_VERSION=$(pkg-config --modversion gtk+-3.0)
    echo -e "${YELLOW}[FALLBACK]${NC} gtk+-3.0 v${GTK_VERSION} détecté"
    echo ""
    echo -e "${YELLOW}[INFO]${NC} webkit2gtk-4.1 non disponible sur ce système"
    echo -e "${YELLOW}[INFO]${NC} Pop!_OS 22.04 supporte webkit2gtk-4.0 uniquement"
    echo ""
    echo -e "${CYAN}Solutions:${NC}"
    echo "  1. Mettre à jour vers Ubuntu/Pop!_OS 24.04+ (webkit 4.1)"
    echo "  2. Downgrade Tauri v2 → v1.7 (compatible webkit 4.0)"
    echo "  3. Build sans webview (CLI uniquement)"
    echo ""
    echo -e "${YELLOW}[RECOMMANDATION]${NC} Option 2 (downgrade Tauri)"
    echo ""
    
    read -p "Appliquer downgrade Tauri v2 → v1.7? [y/N] " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd "$(dirname "$0")/src-tauri"
        cp Cargo.toml Cargo.toml.backup_v2
        
        # Downgrade vers Tauri v1.7
        cat > Cargo.toml << 'ENDCARGO'
[package]
name = "titane-infinity"
version = "10.0.0"
description = "TITANE∞ - Système cognitif sentient"
authors = ["TITANE"]
license = ""
repository = ""
edition = "2021"

[build-dependencies]
tauri-build = { version = "1.5", features = [] }

[dependencies]
tauri = { version = "1.7", features = ["shell-open"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
log = "0.4"
env_logger = "0.11"
rand = "0.8"
chrono = { version = "0.4", features = ["serde"] }
uuid = { version = "1.0", features = ["v4", "serde"] }
base64 = "0.22"
aes-gcm = "0.10"
sha2 = "0.10"
once_cell = "1.19"

[features]
custom-protocol = ["tauri/custom-protocol"]

[[bin]]
name = "titane-infinity"
path = "src/main.rs"
ENDCARGO
        
        echo -e "${GREEN}[OK]${NC} Downgrade Tauri v2 → v1.7 appliqué"
        
        # Adapter tauri.conf.json pour v1
        if [ -f "tauri.conf.json" ]; then
            cp tauri.conf.json tauri.conf.json.backup_v2
            echo -e "${YELLOW}[INFO]${NC} tauri.conf.json sauvegardé (backup_v2)"
        fi
        
        cargo clean
        
        echo ""
        echo -e "${GREEN}[✓ SUCCESS]${NC} Projet adapté pour Tauri v1.7"
        echo ""
        echo -e "${CYAN}Relancer:${NC} ./launch_dev.sh"
    else
        echo -e "${YELLOW}[SKIP]${NC} Downgrade annulé"
    fi
    
else
    echo -e "${RED}[ERREUR]${NC} Aucune version GTK détectée"
    echo ""
    echo -e "${YELLOW}[INFO]${NC} Installation requise:"
    echo "  apt install libgtk-3-dev libwebkit2gtk-4.0-dev"
fi

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
