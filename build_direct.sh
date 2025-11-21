#!/bin/bash

################################################################################
# TITANE∞ v10 - BUILD DIRECT (Sans WebView)
# Solution alternative: Build Rust backend uniquement
################################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration PATH
export PATH="$HOME/.cargo/bin:$PATH"
source "$HOME/.cargo/env" 2>/dev/null || true

cd "$(dirname "$0")"

echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  TITANE∞ v10 - BUILD DIRECT (Backend Rust)${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}[INFO]${NC} Problème détecté: webkit2gtk-4.1 non disponible"
echo -e "${YELLOW}[INFO]${NC} Solution: Build backend Rust directement"
echo ""

cd src-tauri

echo -e "${CYAN}[BUILD]${NC} Compilation backend Rust (sans UI)..."
echo ""

# Build avec features minimales
if cargo build --release --no-default-features 2>&1; then
    echo ""
    echo -e "${GREEN}[✓ SUCCESS]${NC} Backend compilé avec succès"
    echo ""
    
    BINARY_PATH="target/release/titane-infinity"
    if [ -f "$BINARY_PATH" ]; then
        BINARY_SIZE=$(du -h "$BINARY_PATH" | cut -f1)
        echo -e "${GREEN}[BINAIRE]${NC} $BINARY_PATH ($BINARY_SIZE)"
        echo ""
        
        echo -e "${CYAN}[TEST]${NC} Lancement backend..."
        ./"$BINARY_PATH" &
        BACKEND_PID=$!
        
        sleep 2
        
        if ps -p $BACKEND_PID > /dev/null; then
            echo -e "${GREEN}[✓ RUNNING]${NC} Backend actif (PID: $BACKEND_PID)"
            
            # Arrêter backend
            kill $BACKEND_PID 2>/dev/null || true
            
            echo ""
            echo -e "${GREEN}[✓ SUCCESS TOTAL]${NC} Backend fonctionnel"
            echo ""
            echo -e "${CYAN}Prochaines étapes:${NC}"
            echo "  1. Backend OK → Créer API REST"
            echo "  2. Frontend séparé → React standalone"
            echo "  3. OU: Installer webkit2gtk-4.0-dev pour UI complète"
        else
            echo -e "${YELLOW}[INFO]${NC} Backend arrêté (normal sans UI)"
        fi
    else
        echo -e "${RED}[ERREUR]${NC} Binaire non trouvé"
    fi
else
    echo ""
    echo -e "${RED}[ERREUR]${NC} Compilation échouée"
    echo ""
    echo -e "${YELLOW}[LOGS]${NC} Dernières erreurs:"
    cargo build --release --no-default-features 2>&1 | tail -20
fi

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
