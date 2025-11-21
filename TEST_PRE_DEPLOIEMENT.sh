#!/bin/bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🔍 TITANE∞ v10.0.0 — TEST PRÉ-DÉPLOIEMENT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Vérifie que l'environnement est prêt pour le déploiement
# Durée : ~30 secondes
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FLATPAK_SPAWN="/usr/bin/flatpak-spawn"
ERRORS=0

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 TITANE∞ — TEST PRÉ-DÉPLOIEMENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 1 : Environnement
echo -n "🔹 Environnement : "
if [ -n "$FLATPAK_ID" ]; then
    echo -e "${GREEN}✅ Flatpak ($FLATPAK_ID)${NC}"
    USE_FLATPAK=true
else
    echo -e "${GREEN}✅ Natif (système hôte)${NC}"
    USE_FLATPAK=false
fi

# Test 2 : flatpak-spawn (si Flatpak)
if [ "$USE_FLATPAK" = true ]; then
    echo -n "🔹 flatpak-spawn : "
    if [ -x "$FLATPAK_SPAWN" ]; then
        echo -e "${GREEN}✅ $FLATPAK_SPAWN${NC}"
    else
        echo -e "${RED}❌ Non trouvé${NC}"
        ((ERRORS++))
    fi
fi

# Test 3 : Système
echo -n "🔹 Système : "
if [ "$USE_FLATPAK" = true ]; then
    HOST_OS=$($FLATPAK_SPAWN --host cat /etc/os-release 2>/dev/null | grep "PRETTY_NAME" | cut -d'"' -f2)
else
    HOST_OS=$(cat /etc/os-release 2>/dev/null | grep "PRETTY_NAME" | cut -d'"' -f2)
fi
if [ -n "$HOST_OS" ]; then
    echo -e "${GREEN}✅ $HOST_OS${NC}"
else
    echo -e "${RED}❌ Inaccessible${NC}"
    ((ERRORS++))
fi

# Test 4 : webkit2gtk-4.1
echo -n "🔹 webkit2gtk-4.1 : "
if [ "$USE_FLATPAK" = true ]; then
    WEBKIT_VERSION=$($FLATPAK_SPAWN --host pkg-config --modversion webkit2gtk-4.1 2>&1)
else
    WEBKIT_VERSION=$(pkg-config --modversion webkit2gtk-4.1 2>&1)
fi
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ v$WEBKIT_VERSION${NC}"
else
    echo -e "${RED}❌ Non installé${NC}"
    echo -e "   ${YELLOW}Solution: sudo apt install libwebkit2gtk-4.1-dev libjavascriptcoregtk-4.1-dev${NC}"
    ((ERRORS++))
fi

# Test 5 : Rust/Cargo
echo -n "🔹 Rust/Cargo : "
if [ "$USE_FLATPAK" = true ]; then
    RUST_VERSION=$($FLATPAK_SPAWN --host bash -c 'source $HOME/.cargo/env 2>/dev/null && cargo --version' 2>&1 | awk '{print $2}')
else
    RUST_VERSION=$(bash -c 'source $HOME/.cargo/env 2>/dev/null && cargo --version' 2>&1 | awk '{print $2}')
fi
if [ -n "$RUST_VERSION" ]; then
    echo -e "${GREEN}✅ v$RUST_VERSION${NC}"
else
    echo -e "${RED}❌ Non installé${NC}"
    echo -e "   ${YELLOW}Solution: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh${NC}"
    ((ERRORS++))
fi

# Test 6 : Tauri CLI
echo -n "🔹 Tauri CLI : "
if [ "$USE_FLATPAK" = true ]; then
    TAURI_CHECK=$($FLATPAK_SPAWN --host bash -c 'source $HOME/.cargo/env 2>/dev/null && command -v cargo-tauri' 2>&1)
    if [ -n "$TAURI_CHECK" ]; then
        TAURI_VERSION=$($FLATPAK_SPAWN --host bash -c 'source $HOME/.cargo/env 2>/dev/null && cargo-tauri --version' 2>&1 | awk '{print $2}')
        echo -e "${GREEN}✅ v$TAURI_VERSION${NC}"
    else
        echo -e "${YELLOW}⚠️  Non installé (installation auto par script)${NC}"
    fi
else
    TAURI_CHECK=$(bash -c 'source $HOME/.cargo/env 2>/dev/null && command -v cargo-tauri' 2>&1)
    if [ -n "$TAURI_CHECK" ]; then
        TAURI_VERSION=$(bash -c 'source $HOME/.cargo/env 2>/dev/null && cargo-tauri --version' 2>&1 | awk '{print $2}')
        echo -e "${GREEN}✅ v$TAURI_VERSION${NC}"
    else
        echo -e "${YELLOW}⚠️  Non installé (installation auto par script)${NC}"
    fi
fi

# Test 7 : Projet
echo -n "🔹 Projet TITANE∞ : "
PROJECT_DIR="/home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY"
if [ -d "$PROJECT_DIR/src-tauri" ] && [ -f "$PROJECT_DIR/src-tauri/Cargo.toml" ]; then
    RUST_FILES=$(find "$PROJECT_DIR/src-tauri/src" -name "*.rs" 2>/dev/null | wc -l)
    echo -e "${GREEN}✅ OK ($RUST_FILES fichiers Rust)${NC}"
else
    echo -e "${RED}❌ Structure invalide${NC}"
    ((ERRORS++))
fi

# Test 8 : Frontend
echo -n "🔹 Frontend (dist/) : "
if [ -d "$PROJECT_DIR/dist" ] && [ -f "$PROJECT_DIR/dist/index.html" ]; then
    echo -e "${GREEN}✅ Déjà buildé${NC}"
else
    NPM_AVAILABLE=false
    if command -v npm &> /dev/null; then
        NPM_AVAILABLE=true
    elif [ "$USE_FLATPAK" = true ] && $FLATPAK_SPAWN --host command -v npm &> /dev/null; then
        NPM_AVAILABLE=true
    fi
    
    if [ "$NPM_AVAILABLE" = true ]; then
        echo -e "${YELLOW}⚠️  Sera buildé (npm disponible)${NC}"
    else
        echo -e "${RED}❌ npm indisponible${NC}"
        echo -e "   ${YELLOW}Solution: sudo apt install nodejs npm${NC}"
        ((ERRORS++))
    fi
fi

# Test 9 : Espace disque
echo -n "🔹 Espace disque : "
DISK_AVAILABLE=$(df -h "$PROJECT_DIR" | awk 'NR==2 {print $4}')
DISK_AVAILABLE_GB=$(df -BG "$PROJECT_DIR" | awk 'NR==2 {print $4}' | sed 's/G//')
if [ "$DISK_AVAILABLE_GB" -ge 5 ]; then
    echo -e "${GREEN}✅ $DISK_AVAILABLE disponible${NC}"
else
    echo -e "${YELLOW}⚠️  $DISK_AVAILABLE disponible (>5GB recommandé)${NC}"
fi

# Test 10 : Permissions écriture
echo -n "🔹 Permissions écriture : "
if [ -w "$PROJECT_DIR" ]; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ Pas de permission écriture${NC}"
    ((ERRORS++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ ENVIRONNEMENT PRÊT POUR DÉPLOIEMENT${NC}"
    echo ""
    echo "Lancer le déploiement complet :"
    echo "  bash ./DEPLOY_AUTO_COMPLET.sh"
    echo ""
    exit 0
else
    echo -e "${RED}❌ $ERRORS ERREUR(S) DÉTECTÉE(S)${NC}"
    echo ""
    echo "Corrigez les erreurs ci-dessus avant de lancer le déploiement."
    echo ""
    exit 1
fi
