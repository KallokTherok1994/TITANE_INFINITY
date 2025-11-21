#!/bin/bash

################################################################################
# TITANE∞ v10 - LANCEMENT DÉVELOPPEMENT
# Configure l'environnement et lance l'application
################################################################################

set -e

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   TITANE∞ v10 - LANCEMENT DÉVELOPPEMENT                      ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

cd "$(dirname "$0")"

# 1. Libérer port 5173
echo -e "${YELLOW}→${NC} Libération port 5173..."
pkill -9 vite 2>/dev/null || true
pkill -9 node 2>/dev/null || true
lsof -ti:5173 2>/dev/null | xargs kill -9 2>/dev/null || true
sleep 1
echo -e "${GREEN}✓${NC} Port 5173 libéré"

# 2. Configurer Rust/Cargo
echo ""
echo -e "${YELLOW}→${NC} Configuration Rust/Cargo..."

if [ -f "$HOME/.cargo/env" ]; then
    source "$HOME/.cargo/env"
    export PATH="$HOME/.cargo/bin:$PATH"
    echo -e "${GREEN}✓${NC} Cargo: $(cargo --version)"
else
    echo -e "${RED}✗${NC} Cargo non trouvé"
    exit 1
fi

# 3. Configurer Node.js
echo ""
echo -e "${YELLOW}→${NC} Configuration Node.js..."

if [ -f "$HOME/.nvm/nvm.sh" ]; then
    source "$HOME/.nvm/nvm.sh"
    nvm use 20 2>/dev/null || nvm use default 2>/dev/null || true
fi

if command -v node &> /dev/null; then
    echo -e "${GREEN}✓${NC} Node: $(node --version)"
    echo -e "${GREEN}✓${NC} npm: $(npm --version)"
else
    echo -e "${RED}✗${NC} Node.js non trouvé"
    exit 1
fi

# 4. Vérifier dépendances
echo ""
echo -e "${YELLOW}→${NC} Vérification dépendances..."

if [ ! -d "node_modules" ]; then
    echo "Installation npm..."
    npm install --silent
fi

if [ ! -f "dist/index.html" ]; then
    echo "Build frontend..."
    npm run build 2>&1 | tail -5
fi

echo -e "${GREEN}✓${NC} Dépendances OK"

# 5. Lancer Tauri Dev
echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🚀 LANCEMENT TITANE∞ v10${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Export PATH pour npm run tauri
export PATH="$HOME/.cargo/bin:$PATH"

# Lancer avec logs
RUST_LOG=info npm run tauri dev
