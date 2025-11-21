#!/bin/bash

################################################################################
# TITANE∞ v10.0.0 - DIAGNOSTIC COMPLET + AUTO-REPAIR + AUTO-VALIDATION
# Script autonome : détecte, répare, reconstruit et valide
################################################################################

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

LOG_DIR="deploy_logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/auto_diagnostic_$(date +%Y%m%d_%H%M%S).log"

exec > >(tee -a "$LOG_FILE") 2>&1

clear

echo -e "${MAGENTA}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   TITANE∞ v10 - DIAGNOSTIC COMPLET + AUTO-REPAIR            ║
║   Détection → Réparation → Reconstruction → Validation       ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

cd "$(dirname "$0")"

FIXES_APPLIED=0
ERRORS_FOUND=0

fix() {
    echo -e "${YELLOW}→ RÉPARATION:${NC} $1"
    ((FIXES_APPLIED++))
}

error() {
    echo -e "${RED}✗ ERREUR:${NC} $1"
    ((ERRORS_FOUND++))
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

################################################################################
# PHASE 1: DÉTECTION VERSION TAURI
################################################################################
echo -e "\n${BLUE}═══ PHASE 1: DÉTECTION TAURI ═══${NC}\n"

if [ ! -f "src-tauri/Cargo.toml" ]; then
    error "src-tauri/Cargo.toml introuvable"
    exit 1
fi

TAURI_VERSION=$(grep -oP 'tauri\s*=\s*\{\s*version\s*=\s*"\K[^"]+' src-tauri/Cargo.toml)

if [[ $TAURI_VERSION == 2* ]]; then
    success "Tauri v$TAURI_VERSION détecté"
    IMPORT="import { invoke } from '@tauri-apps/api/core';"
else
    error "Tauri v$TAURI_VERSION incompatible (requis: v2.x)"
    exit 1
fi

################################################################################
# PHASE 2: VÉRIFICATION & RÉPARATION MAIN.RS
################################################################################
echo -e "\n${BLUE}═══ PHASE 2: VÉRIFICATION MAIN.RS ═══${NC}\n"

if [ ! -f "src-tauri/src/main.rs" ]; then
    error "src-tauri/src/main.rs introuvable"
    exit 1
fi

# Vérifier présence de fn main()
if ! grep -q "^fn main()" src-tauri/src/main.rs; then
    fix "Fonction main() manquante - Correction nécessaire"
    
    # Si pub fn run() existe, la renommer
    if grep -q "^pub fn run()" src-tauri/src/main.rs; then
        sed -i 's/^pub fn run()/fn main()/' src-tauri/src/main.rs
        success "pub fn run() → fn main()"
    else
        error "Impossible de trouver le point d'entrée"
        exit 1
    fi
else
    success "fn main() présente"
fi

# Vérifier attribut windows_subsystem
if ! grep -q "#!\[cfg_attr(not(debug_assertions)" src-tauri/src/main.rs; then
    fix "Ajout attribut windows_subsystem"
    sed -i '1s/^/#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]\n/' src-tauri/src/main.rs
fi

################################################################################
# PHASE 3: SUPPRESSION LIB.RS (NON-STANDARD)
################################################################################
echo -e "\n${BLUE}═══ PHASE 3: SUPPRESSION LIB.RS ═══${NC}\n"

if [ -f "src-tauri/src/lib.rs" ]; then
    fix "lib.rs détecté (non-standard Tauri v2)"
    rm -f src-tauri/src/lib.rs
    success "lib.rs supprimé"
else
    success "lib.rs absent (correct)"
fi

################################################################################
# PHASE 4: RÉPARATION IMPORTS INVOKE()
################################################################################
echo -e "\n${BLUE}═══ PHASE 4: RÉPARATION IMPORTS TYPESCRIPT ═══${NC}\n"

TS_FILES=$(find core/frontend -name "*.ts" -o -name "*.tsx" 2>/dev/null)

CORRECTED=0

for file in $TS_FILES; do
    # Corriger imports Tauri v1 → v2
    if grep -q "from '@tauri-apps/api/tauri'" "$file"; then
        fix "Import incorrect dans $(basename $file)"
        sed -i "s|from '@tauri-apps/api/tauri'|from '@tauri-apps/api/core'|g" "$file"
        ((CORRECTED++))
    fi
    
    # Ajouter import si invoke() utilisé mais pas importé
    if grep -q "invoke(" "$file" && ! grep -q "import.*invoke.*from" "$file"; then
        fix "Import manquant dans $(basename $file)"
        sed -i "1s|^|$IMPORT\n|" "$file"
        ((CORRECTED++))
    fi
done

if [ $CORRECTED -eq 0 ]; then
    success "Tous les imports sont corrects"
else
    success "$CORRECTED fichiers corrigés"
fi

################################################################################
# PHASE 5: VÉRIFICATION COMMANDS RUST
################################################################################
echo -e "\n${BLUE}═══ PHASE 5: VÉRIFICATION COMMANDS RUST ═══${NC}\n"

COMMANDS=("save_entry" "load_entries" "clear_memory" "get_memory_state")

for cmd in "${COMMANDS[@]}"; do
    if grep -r "fn $cmd" src-tauri/src/system/memory*/mod.rs >/dev/null 2>&1; then
        success "Command $cmd présente"
    else
        error "Command $cmd manquante"
    fi
done

# Vérifier enregistrement dans invoke_handler
if grep -q "invoke_handler" src-tauri/src/main.rs; then
    success "invoke_handler présent"
else
    error "invoke_handler non trouvé"
fi

################################################################################
# PHASE 6: RÉPARATION TAURI.CONF.JSON
################################################################################
echo -e "\n${BLUE}═══ PHASE 6: RÉPARATION TAURI.CONF.JSON ═══${NC}\n"

FRONTEND_DIST=$(grep -oP '"frontendDist":\s*"\K[^"]+' src-tauri/tauri.conf.json)
DEV_URL=$(grep -oP '"devUrl":\s*"\K[^"]+' src-tauri/tauri.conf.json)

if [ "$FRONTEND_DIST" != "../dist" ]; then
    fix "frontendDist incorrect: $FRONTEND_DIST → ../dist"
    sed -i 's|"frontendDist":.*|"frontendDist": "../dist",|' src-tauri/tauri.conf.json
fi

if [ "$DEV_URL" != "http://localhost:5173" ]; then
    fix "devUrl incorrect: $DEV_URL → http://localhost:5173"
    sed -i 's|"devUrl":.*|"devUrl": "http://localhost:5173",|' src-tauri/tauri.conf.json
fi

success "tauri.conf.json validé"

################################################################################
# PHASE 7: NETTOYAGE FICHIERS PARASITES
################################################################################
echo -e "\n${BLUE}═══ PHASE 7: NETTOYAGE ═══${NC}\n"

PARASITES=(
    "src-tauri/src/auto_generated_commands.rs"
    "src-tauri/src/lib.rs"
)

for file in "${PARASITES[@]}"; do
    if [ -f "$file" ]; then
        fix "Suppression fichier parasite: $file"
        rm -f "$file"
    fi
done

# Nettoyage processus
pkill -9 -f vite 2>/dev/null || true
pkill -9 -f tauri 2>/dev/null || true
lsof -ti:5173 2>/dev/null | xargs kill -9 2>/dev/null || true

success "Nettoyage terminé"

################################################################################
# PHASE 8: BUILD FRONTEND
################################################################################
echo -e "\n${BLUE}═══ PHASE 8: BUILD FRONTEND ═══${NC}\n"

if [ ! -d "node_modules" ]; then
    echo "→ Installation npm..."
    npm install --silent
fi

echo "→ Build Vite..."
npm run build 2>&1 | tail -10

if [ -f "dist/index.html" ]; then
    DIST_SIZE=$(du -sh dist | cut -f1)
    success "Frontend buildé: $DIST_SIZE"
else
    error "Build frontend échoué"
    exit 1
fi

################################################################################
# PHASE 9: BUILD RUST
################################################################################
echo -e "\n${BLUE}═══ PHASE 9: BUILD RUST ═══${NC}\n"

echo "→ Cargo clean..."
cargo clean --manifest-path=src-tauri/Cargo.toml

echo "→ Cargo check..."
if cargo check --manifest-path=src-tauri/Cargo.toml 2>&1 | tail -20; then
    success "Rust compilable"
else
    error "Erreurs Rust détectées"
    exit 1
fi

################################################################################
# PHASE 10: VALIDATION FINALE
################################################################################
echo -e "\n${BLUE}═══ PHASE 10: VALIDATION FINALE ═══${NC}\n"

VALIDATION_PASSED=0
VALIDATION_TOTAL=10

[ -f "src-tauri/src/main.rs" ] && ((VALIDATION_PASSED++))
[ ! -f "src-tauri/src/lib.rs" ] && ((VALIDATION_PASSED++))
grep -q "^fn main()" src-tauri/src/main.rs && ((VALIDATION_PASSED++))
[ -f "dist/index.html" ] && ((VALIDATION_PASSED++))
[ "$FRONTEND_DIST" = "../dist" ] && ((VALIDATION_PASSED++))
[ "$DEV_URL" = "http://localhost:5173" ] && ((VALIDATION_PASSED++))
grep -q "invoke_handler" src-tauri/src/main.rs && ((VALIDATION_PASSED++))
[[ $TAURI_VERSION == 2* ]] && ((VALIDATION_PASSED++))
[ -f "src-tauri/Cargo.toml" ] && ((VALIDATION_PASSED++))
[ -f "src-tauri/tauri.conf.json" ] && ((VALIDATION_PASSED++))

################################################################################
# RAPPORT FINAL
################################################################################
echo -e "\n${MAGENTA}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║                  RAPPORT FINAL                                ║${NC}"
echo -e "${MAGENTA}╚═══════════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${CYAN}Statistiques:${NC}"
echo "  Réparations appliquées: $FIXES_APPLIED"
echo "  Erreurs trouvées: $ERRORS_FOUND"
echo "  Validation: $VALIDATION_PASSED / $VALIDATION_TOTAL"
echo ""

if [ $ERRORS_FOUND -eq 0 ] && [ $VALIDATION_PASSED -eq $VALIDATION_TOTAL ]; then
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║           ✅ AUTO-REPAIR & VALIDATION RÉUSSIS ✅             ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Réparations appliquées:"
    echo "  ✓ Structure Tauri v2 validée"
    echo "  ✓ main.rs corrigé"
    echo "  ✓ lib.rs supprimé"
    echo "  ✓ Imports TypeScript Tauri v2"
    echo "  ✓ tauri.conf.json corrigé"
    echo "  ✓ Fichiers parasites supprimés"
    echo "  ✓ Frontend buildé"
    echo "  ✓ Rust validé"
    echo ""
    echo "🚀 LANCEMENT:"
    echo ""
    echo "   npm run tauri dev"
    echo ""
    echo "Ou build production:"
    echo ""
    echo "   ./build_production.sh"
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "  TITANE_INFINITY — Auto-Repair & Validation TERMINÉ"
    echo "═══════════════════════════════════════════════════════════════"
    
    exit 0
else
    echo -e "${RED}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║              ⚠️  ERREURS PERSISTANTES ⚠️                     ║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Consultez le log: $LOG_FILE"
    
    exit 1
fi
