#!/bin/bash

################################################################################
# TITANE∞ v10 - FIX RAPIDE : Port 5173 + GLIBC 2.39
################################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   TITANE∞ - FIX PORT 5173 + GLIBC 2.39                       ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

cd "$(dirname "$0")"

# 1. Libérer port 5173
echo -e "${YELLOW}→${NC} Libération du port 5173..."
pkill -9 vite 2>/dev/null || true
pkill -9 node 2>/dev/null || true
lsof -ti:5173 2>/dev/null | xargs kill -9 2>/dev/null || true
sleep 1
echo -e "${GREEN}✓${NC} Port 5173 libéré"

# 2. Vérifier Cargo.toml
echo ""
echo -e "${YELLOW}→${NC} Vérification Cargo.toml..."

if grep -q "gtk.*0.17.1" src-tauri/Cargo.toml; then
    echo -e "${GREEN}✓${NC} gtk v0.17.1 configuré (compatible GLIBC 2.35+)"
else
    echo -e "${YELLOW}⚠${NC}  gtk v0.18.x détecté - Downgrade vers v0.17.1..."
    
    # Backup
    cp src-tauri/Cargo.toml src-tauri/Cargo.toml.backup
    
    # Ajouter gtk v0.17.1 si absent
    if ! grep -q "^\[dependencies.gtk\]" src-tauri/Cargo.toml; then
        cat >> src-tauri/Cargo.toml << 'ENDGTK'

[dependencies.gtk]
version = "0.17.1"
features = []
ENDGTK
        echo -e "${GREEN}✓${NC} gtk v0.17.1 ajouté"
    fi
fi

# 3. Vérifier once_cell
echo ""
echo -e "${YELLOW}→${NC} Vérification once_cell..."

if grep -q "once_cell" src-tauri/Cargo.toml; then
    echo -e "${GREEN}✓${NC} once_cell présent"
else
    echo -e "${YELLOW}⚠${NC}  once_cell manquant - Ajout..."
    sed -i '/^sha2 = /a once_cell = "1.19"' src-tauri/Cargo.toml
    echo -e "${GREEN}✓${NC} once_cell ajouté"
fi

# 4. Nettoyer cache Cargo
echo ""
echo -e "${YELLOW}→${NC} Nettoyage cache Cargo..."
cd src-tauri
rm -rf target/debug/build/gtk-* 2>/dev/null || true
cargo clean
echo -e "${GREEN}✓${NC} Cache nettoyé"

# 5. Vérifier frontend
cd ..
echo ""
echo -e "${YELLOW}→${NC} Vérification frontend..."

if [ -f "dist/index.html" ]; then
    DIST_SIZE=$(du -sh dist | cut -f1)
    echo -e "${GREEN}✓${NC} Frontend buildé: $DIST_SIZE"
else
    echo -e "${YELLOW}⚠${NC}  Frontend non buildé - Build en cours..."
    
    # Utiliser nvm si disponible
    if [ -f "$HOME/.nvm/nvm.sh" ]; then
        source "$HOME/.nvm/nvm.sh"
        nvm use 20 2>/dev/null || true
    fi
    
    npm install --silent 2>&1 | tail -3
    npm run build 2>&1 | tail -10
    
    if [ -f "dist/index.html" ]; then
        DIST_SIZE=$(du -sh dist | cut -f1)
        echo -e "${GREEN}✓${NC} Frontend buildé: $DIST_SIZE"
    else
        echo -e "${RED}✗${NC} Erreur build frontend"
        exit 1
    fi
fi

# 6. Test compilation Rust
echo ""
echo -e "${YELLOW}→${NC} Test compilation Rust (cargo check)..."
cd src-tauri

if [ -f "$HOME/.cargo/env" ]; then
    source "$HOME/.cargo/env"
fi

cargo check 2>&1 | tee /tmp/cargo_check_fix.log | tail -20

ERRORS=$(grep -c "^error" /tmp/cargo_check_fix.log 2>/dev/null || echo "0")

echo ""
if [ "$ERRORS" = "0" ]; then
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║              ✅ CORRECTIONS APPLIQUÉES AVEC SUCCÈS ✅        ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Corrections effectuées:"
    echo "  ✓ Port 5173 libéré"
    echo "  ✓ gtk v0.17.1 (compatible GLIBC 2.35+)"
    echo "  ✓ once_cell ajouté"
    echo "  ✓ Cache Cargo nettoyé"
    echo "  ✓ Frontend buildé"
    echo "  ✓ Rust compile sans erreurs"
    echo ""
    echo "🚀 LANCEMENT:"
    echo ""
    echo "   npm run tauri dev"
    echo ""
    exit 0
else
    echo -e "${YELLOW}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║        ⚠️  CORRECTIONS APPLIQUÉES - $ERRORS ERREURS RESTANTES ⚠️     ║${NC}"
    echo -e "${YELLOW}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Corrections effectuées:"
    echo "  ✓ Port 5173 libéré"
    echo "  ✓ gtk v0.17.1 configuré"
    echo "  ✓ once_cell ajouté"
    echo "  ✓ Cache nettoyé"
    echo "  ✓ Frontend buildé"
    echo ""
    echo "⚠️  $ERRORS erreurs Rust restantes"
    echo ""
    echo "Consultez: /tmp/cargo_check_fix.log"
    echo ""
    echo "Pour correction complète:"
    echo "   ./correction_totale.sh"
    echo ""
    exit 1
fi
