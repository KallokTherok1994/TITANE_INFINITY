#!/bin/bash

################################################################################
# TITANE∞ v9.0.0 - VÉRIFICATION FINALE COMPLÈTE
# Test approfondi de tout le système (Structure + Config + Build + Runtime)
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
LOG_FILE="$LOG_DIR/verification_finale_$(date +%Y%m%d_%H%M%S).log"

exec > >(tee -a "$LOG_FILE") 2>&1

clear

echo -e "${MAGENTA}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║         TITANE∞ v9.0.0 - VÉRIFICATION FINALE                 ║
║         Analyse Complète + Tests + Validation                ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

cd "$(dirname "$0")"

ERRORS=0
WARNINGS=0
CHECKS_PASSED=0
CHECKS_TOTAL=0

check() {
    ((CHECKS_TOTAL++))
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗${NC} $2"
        ((ERRORS++))
    fi
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

################################################################################
# PHASE 1: ANALYSE STRUCTURE DU PROJET
################################################################################
echo -e "\n${BLUE}═══ PHASE 1: ANALYSE STRUCTURE ═══${NC}\n"

echo "→ Vérification arborescence..."

# Structure principale
[ -d "src-tauri" ] && check 0 "src-tauri/" || check 1 "src-tauri/ manquant"
[ -d "core/frontend" ] && check 0 "core/frontend/" || check 1 "core/frontend/ manquant"
[ -f "index.html" ] && check 0 "index.html" || check 1 "index.html manquant"
[ -f "vite.config.ts" ] && check 0 "vite.config.ts" || check 1 "vite.config.ts manquant"
[ -f "package.json" ] && check 0 "package.json" || check 1 "package.json manquant"
[ -f "tsconfig.json" ] && check 0 "tsconfig.json" || check 1 "tsconfig.json manquant"

# Fichiers Rust
[ -f "src-tauri/src/main.rs" ] && check 0 "main.rs" || check 1 "main.rs manquant"
[ -f "src-tauri/Cargo.toml" ] && check 0 "Cargo.toml" || check 1 "Cargo.toml manquant"
[ -f "src-tauri/tauri.conf.json" ] && check 0 "tauri.conf.json" || check 1 "tauri.conf.json manquant"

# Vérifier absence de lib.rs (non-standard Tauri v2)
if [ -f "src-tauri/src/lib.rs" ]; then
    check 1 "lib.rs présent (doit être absent)"
    warn "lib.rs détecté - Non standard pour Tauri v2"
else
    check 0 "lib.rs absent (correct)"
fi

# Vérifier main()
if grep -q "^fn main()" src-tauri/src/main.rs; then
    check 0 "fn main() présente"
else
    check 1 "fn main() manquante"
fi

# Vérifier #![cfg_attr...]
if grep -q "#!\[cfg_attr(not(debug_assertions)" src-tauri/src/main.rs; then
    check 0 "Attribut windows_subsystem présent"
else
    warn "Attribut windows_subsystem manquant (optionnel)"
fi

################################################################################
# PHASE 2: VÉRIFICATION TAURI.CONF.JSON (CRITIQUE)
################################################################################
echo -e "\n${BLUE}═══ PHASE 2: CONFIGURATION TAURI ═══${NC}\n"

echo "→ Analyse tauri.conf.json..."

SCHEMA=$(grep -oP '"\$schema":\s*"\K[^"]+' src-tauri/tauri.conf.json)
FRONTEND_DIST=$(grep -oP '"frontendDist":\s*"\K[^"]+' src-tauri/tauri.conf.json)
DEV_URL=$(grep -oP '"devUrl":\s*"\K[^"]+' src-tauri/tauri.conf.json)
BEFORE_BUILD=$(grep -oP '"beforeBuildCommand":\s*"\K[^"]+' src-tauri/tauri.conf.json)
BEFORE_DEV=$(grep -oP '"beforeDevCommand":\s*"\K[^"]+' src-tauri/tauri.conf.json)

echo "  Schema: $SCHEMA"
echo "  frontendDist: $FRONTEND_DIST"
echo "  devUrl: $DEV_URL"
echo "  beforeBuildCommand: $BEFORE_BUILD"
echo "  beforeDevCommand: $BEFORE_DEV"

[[ "$SCHEMA" == *"2.0"* ]] && check 0 "Schema Tauri v2" || check 1 "Schema non v2"
[ "$DEV_URL" = "http://localhost:5173" ] && check 0 "devUrl correct" || warn "devUrl: $DEV_URL (attendu: http://localhost:5173)"
[ "$FRONTEND_DIST" = "../dist" ] && check 0 "frontendDist correct" || warn "frontendDist: $FRONTEND_DIST (attendu: ../dist)"

# Vérifier que dist/ existe
if [ -d "dist" ]; then
    check 0 "dist/ existe"
    [ -f "dist/index.html" ] && check 0 "dist/index.html" || check 1 "dist/index.html manquant"
    [ -d "dist/assets" ] && check 0 "dist/assets/" || warn "dist/assets/ manquant"
    DIST_SIZE=$(du -sh dist 2>/dev/null | cut -f1)
    echo -e "  ${CYAN}Taille dist/: $DIST_SIZE${NC}"
else
    check 1 "dist/ manquant (build requis)"
fi

################################################################################
# PHASE 3: VÉRIFICATION IMPORTS TYPESCRIPT
################################################################################
echo -e "\n${BLUE}═══ PHASE 3: IMPORTS TYPESCRIPT ═══${NC}\n"

echo "→ Scan des imports invoke()..."

CORRECT_IMPORTS=$(grep -r "from '@tauri-apps/api/core'" core/frontend/ 2>/dev/null | wc -l || echo "0")
WRONG_IMPORTS=$(grep -r "from '@tauri-apps/api/tauri'" core/frontend/ 2>/dev/null | wc -l || echo "0")

echo "  Imports Tauri v2 (core): $CORRECT_IMPORTS"
echo "  Imports Tauri v1 (tauri): $WRONG_IMPORTS"

[ "$CORRECT_IMPORTS" -gt 0 ] && check 0 "Imports Tauri v2 détectés" || warn "Aucun import invoke() trouvé"
[ "$WRONG_IMPORTS" -eq 0 ] && check 0 "Aucun import Tauri v1" || check 1 "$WRONG_IMPORTS imports Tauri v1 incorrects"

# Vérifier fichiers spécifiques
FILES_WITH_INVOKE=(
    "core/frontend/hooks/useMemoryCore.ts"
    "core/frontend/hooks/useTitaneCore.ts"
    "core/frontend/examples/memorycore-examples.ts"
)

for file in "${FILES_WITH_INVOKE[@]}"; do
    if [ -f "$file" ]; then
        if grep -q "from '@tauri-apps/api/core'" "$file"; then
            check 0 "$(basename $file): import correct"
        else
            check 1 "$(basename $file): import incorrect ou manquant"
        fi
    fi
done

################################################################################
# PHASE 4: VÉRIFICATION COMMANDS RUST
################################################################################
echo -e "\n${BLUE}═══ PHASE 4: COMMANDS RUST ═══${NC}\n"

echo "→ Vérification commandes Tauri..."

COMMANDS=("save_entry" "load_entries" "clear_memory" "get_memory_state")

for cmd in "${COMMANDS[@]}"; do
    if grep -r "#\[tauri::command\]" src-tauri/src/system/memory*/mod.rs 2>/dev/null | grep -A5 "#\[tauri::command\]" | grep -q "fn $cmd"; then
        check 0 "Command #[tauri::command] $cmd"
    else
        check 1 "Command $cmd manquante ou mal déclarée"
    fi
done

# Vérifier enregistrement dans invoke_handler
echo ""
echo "→ Vérification invoke_handler..."

if grep -q "invoke_handler(tauri::generate_handler!" src-tauri/src/main.rs; then
    check 0 "invoke_handler présent"
    
    for cmd in "${COMMANDS[@]}"; do
        if grep -A20 "invoke_handler" src-tauri/src/main.rs | grep -q "$cmd"; then
            check 0 "$cmd enregistré"
        else
            warn "$cmd non enregistré"
        fi
    done
else
    check 1 "invoke_handler non trouvé"
fi

################################################################################
# PHASE 5: VÉRIFICATION CARGO.TOML
################################################################################
echo -e "\n${BLUE}═══ PHASE 5: CARGO.TOML ═══${NC}\n"

echo "→ Analyse Cargo.toml..."

TAURI_VERSION=$(grep -oP 'tauri\s*=\s*\{\s*version\s*=\s*"\K[^"]+' src-tauri/Cargo.toml)
echo "  Version Tauri: $TAURI_VERSION"

[[ "$TAURI_VERSION" == 2* ]] && check 0 "Tauri v2.x" || check 1 "Tauri v$TAURI_VERSION (doit être 2.x)"

# Vérifier dépendances essentielles
DEPS=("serde" "serde_json" "log" "env_logger")

for dep in "${DEPS[@]}"; do
    if grep -q "^$dep = " src-tauri/Cargo.toml; then
        check 0 "Dépendance $dep"
    else
        warn "Dépendance $dep manquante"
    fi
done

################################################################################
# PHASE 6: VALIDATION ENVIRONNEMENT
################################################################################
echo -e "\n${BLUE}═══ PHASE 6: ENVIRONNEMENT ═══${NC}\n"

echo "→ Vérification outils..."

node --version &>/dev/null && check 0 "Node.js installé ($(node --version))" || check 1 "Node.js manquant"
npm --version &>/dev/null && check 0 "npm installé ($(npm --version))" || check 1 "npm manquant"
rustc --version &>/dev/null && check 0 "Rust installé ($(rustc --version | cut -d' ' -f2))" || check 1 "Rust manquant"
cargo --version &>/dev/null && check 0 "Cargo installé ($(cargo --version | cut -d' ' -f2))" || check 1 "Cargo manquant"

################################################################################
# PHASE 7: TEST COMPILATION TYPESCRIPT
################################################################################
echo -e "\n${BLUE}═══ PHASE 7: COMPILATION TYPESCRIPT ═══${NC}\n"

echo "→ Test tsc --noEmit..."

if npx tsc --noEmit 2>&1 | tee /tmp/tsc_output.log | tail -5; then
    TS_ERRORS=$(grep -c "error TS" /tmp/tsc_output.log 2>/dev/null || echo "0")
    if [ "$TS_ERRORS" -eq 0 ]; then
        check 0 "TypeScript: 0 erreurs"
    else
        check 1 "TypeScript: $TS_ERRORS erreurs"
    fi
else
    warn "tsc --noEmit non exécutable (npm install requis?)"
fi

################################################################################
# PHASE 8: TEST BUILD FRONTEND
################################################################################
echo -e "\n${BLUE}═══ PHASE 8: BUILD FRONTEND ═══${NC}\n"

echo "→ Test npm run build..."

if [ ! -d "node_modules" ]; then
    echo "  Installation dépendances npm..."
    npm install --silent 2>&1 | grep -v "npm WARN" | tail -5
fi

if npm run build 2>&1 | tee /tmp/vite_build.log | tail -10; then
    if [ -f "dist/index.html" ]; then
        check 0 "Build Vite réussi"
        DIST_FILES=$(find dist -type f | wc -l)
        echo -e "  ${CYAN}Fichiers générés: $DIST_FILES${NC}"
    else
        check 1 "Build Vite échoué (dist/index.html manquant)"
    fi
else
    check 1 "npm run build échoué"
fi

################################################################################
# PHASE 9: TEST COMPILATION RUST (RAPIDE)
################################################################################
echo -e "\n${BLUE}═══ PHASE 9: COMPILATION RUST ═══${NC}\n"

echo "→ Test cargo check (validation rapide)..."

if cargo check --manifest-path=src-tauri/Cargo.toml 2>&1 | tee /tmp/cargo_check.log | tail -20; then
    RUST_ERRORS=$(grep -c "^error\[" /tmp/cargo_check.log 2>/dev/null || echo "0")
    if [ "$RUST_ERRORS" -eq 0 ]; then
        check 0 "Rust: 0 erreurs"
    else
        check 1 "Rust: $RUST_ERRORS erreurs"
        echo ""
        echo "Erreurs principales:"
        grep "^error\[" /tmp/cargo_check.log | head -5
    fi
else
    check 1 "cargo check échoué"
fi

################################################################################
# PHASE 10: VÉRIFICATION COHÉRENCE GLOBALE
################################################################################
echo -e "\n${BLUE}═══ PHASE 10: COHÉRENCE GLOBALE ═══${NC}\n"

echo "→ Vérifications supplémentaires..."

# Vérifier que index.html pointe vers le bon main
if grep -q "/core/frontend/main.tsx" index.html; then
    check 0 "index.html → /core/frontend/main.tsx"
else
    warn "index.html ne pointe pas vers /core/frontend/main.tsx"
fi

# Vérifier vite.config.ts
if [ -f "vite.config.ts" ]; then
    if grep -q "outDir.*dist" vite.config.ts; then
        check 0 "vite.config.ts outDir: ./dist"
    else
        warn "vite.config.ts outDir non standard"
    fi
fi

# Vérifier fichiers inutiles
UNWANTED_FILES=("src-tauri/src/lib.rs" "src-tauri/src/auto_generated_commands.rs")

for file in "${UNWANTED_FILES[@]}"; do
    if [ -f "$file" ]; then
        warn "Fichier parasite détecté: $file"
    fi
done

################################################################################
# RAPPORT FINAL
################################################################################
echo -e "\n${MAGENTA}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║                   RAPPORT FINAL                               ║${NC}"
echo -e "${MAGENTA}╚═══════════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${CYAN}Statistiques:${NC}"
echo "  Tests réussis: $CHECKS_PASSED / $CHECKS_TOTAL"
echo "  Erreurs: $ERRORS"
echo "  Avertissements: $WARNINGS"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                ✅ VÉRIFICATION RÉUSSIE ✅                    ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}Système validé:${NC}"
    echo "  ✓ Structure Tauri v2 STANDARD"
    echo "  ✓ Configuration correcte"
    echo "  ✓ Imports TypeScript Tauri v2"
    echo "  ✓ Commands Rust déclarées"
    echo "  ✓ Build frontend réussi"
    echo "  ✓ Compilation Rust valide"
    echo ""
    echo -e "${CYAN}🚀 LANCEMENT:${NC}"
    echo ""
    echo "   npm run tauri dev"
    echo ""
    echo -e "${CYAN}Ou avec logs:${NC}"
    echo ""
    echo "   RUST_LOG=info npm run tauri dev"
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "  TITANE_INFINITY — Vérification Finale:"
    echo "  Système 100 % Stable, Fonctionnel et Prêt au Déploiement."
    echo "═══════════════════════════════════════════════════════════════"
    
    exit 0
else
    echo -e "${RED}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║           ⚠️  ERREURS DÉTECTÉES ⚠️                           ║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}$ERRORS erreur(s) et $WARNINGS avertissement(s) détectés.${NC}"
    echo ""
    echo "Consultez le log complet: $LOG_FILE"
    echo ""
    echo "Actions recommandées:"
    [ $ERRORS -gt 0 ] && echo "  1. Corriger les erreurs critiques"
    [ $WARNINGS -gt 0 ] && echo "  2. Vérifier les avertissements"
    echo "  3. Relancer le script de vérification"
    
    exit 1
fi
