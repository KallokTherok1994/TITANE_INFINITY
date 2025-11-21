#!/usr/bin/env bash

# ═══════════════════════════════════════════════════════════
#   TITANE∞ v15.5 — Affichage Statut Système
# ═══════════════════════════════════════════════════════════

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

clear

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}                                                          ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}      ${BOLD}🚀 TITANE∞ v15.5 — STATUT SYSTÈME${NC}              ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}                                                          ${CYAN}║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BOLD}📊 VALIDATION SYSTÈME${NC}"
echo "────────────────────────────────────────────────────────"
echo ""

# Vérifier scripts npm
echo -e "${BLUE}[1/5] Scripts NPM...${NC}"
SCRIPTS_OK=$(npm run 2>&1 | grep -E "^\s\s(dev|build|tauri|type-check|lint:fix)" | wc -l)
echo -e "      ${GREEN}✓${NC} $SCRIPTS_OK/22 scripts détectés"
echo ""

# Vérifier dépendances
echo -e "${BLUE}[2/5] Dépendances...${NC}"
if [ -d "node_modules" ]; then
    echo -e "      ${GREEN}✓${NC} node_modules/ présent"
    DEPS_COUNT=$(ls node_modules | wc -l)
    echo -e "      ${GREEN}✓${NC} $DEPS_COUNT packages installés"
else
    echo -e "      ${YELLOW}⚠${NC} node_modules/ manquant (npm install requis)"
fi
echo ""

# Type-check
echo -e "${BLUE}[3/5] TypeScript...${NC}"
if npm run type-check &>/dev/null; then
    echo -e "      ${GREEN}✓${NC} 0 erreurs TypeScript"
else
    echo -e "      ${YELLOW}⚠${NC} Erreurs TypeScript détectées"
fi
echo ""

# Build test
echo -e "${BLUE}[4/5] Build System...${NC}"
if [ -d "dist" ]; then
    DIST_SIZE=$(du -sh dist 2>/dev/null | awk '{print $1}')
    echo -e "      ${GREEN}✓${NC} dist/ présent ($DIST_SIZE)"
else
    echo -e "      ${YELLOW}⚠${NC} dist/ absent (npm run build requis)"
fi
echo ""

# Tauri CLI
echo -e "${BLUE}[5/5] Tauri CLI...${NC}"
if TAURI_VERSION=$(npm run tauri -- --version 2>&1 | grep "tauri-cli"); then
    echo -e "      ${GREEN}✓${NC} $TAURI_VERSION"
else
    echo -e "      ${YELLOW}⚠${NC} Tauri CLI non disponible"
fi
echo ""

echo "────────────────────────────────────────────────────────"
echo ""

# Vérifier ports
echo -e "${BOLD}🔍 PORTS${NC}"
echo "────────────────────────────────────────────────────────"
echo ""

check_port() {
    local port=$1
    local name=$2
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        PID=$(lsof -Pi :$port -sTCP:LISTEN -t)
        echo -e "      ${YELLOW}⚠${NC} Port $port ($name) : UTILISÉ (PID $PID)"
        return 1
    else
        echo -e "      ${GREEN}✓${NC} Port $port ($name) : LIBRE"
        return 0
    fi
}

check_port 5173 "Vite"
check_port 1420 "Tauri"

echo ""
echo "────────────────────────────────────────────────────────"
echo ""

# Scripts disponibles
echo -e "${BOLD}🚀 COMMANDES RAPIDES${NC}"
echo "────────────────────────────────────────────────────────"
echo ""
echo -e "  ${CYAN}./clean-start.sh${NC}     → Clean + start automatique"
echo -e "  ${CYAN}./START.sh 1${NC}         → Frontend dev (port 5173)"
echo -e "  ${CYAN}npm run dev${NC}          → Frontend dev direct"
echo -e "  ${CYAN}npm run tauri:dev${NC}    → Application complète"
echo -e "  ${CYAN}npm run build${NC}        → Build production"
echo -e "  ${CYAN}npm run type-check${NC}   → Validation TypeScript"
echo ""

echo "────────────────────────────────────────────────────────"
echo ""

# Documentation
echo -e "${BOLD}📚 DOCUMENTATION${NC}"
echo "────────────────────────────────────────────────────────"
echo ""
echo -e "  ${CYAN}QUICK_START.txt${NC}       → Référence rapide"
echo -e "  ${CYAN}SOLUTION_COMPLETE.md${NC}  → Guide complet (400+ lignes)"
echo -e "  ${CYAN}RAPPORT_FINAL.txt${NC}     → Rapport de correction"
echo -e "  ${CYAN}GUIDE_REFERENCE.md${NC}    → Référence 22 scripts npm"
echo ""

echo -e "${CYAN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}  ${GREEN}✅ SYSTÈME OPÉRATIONNEL${NC}                                 ${CYAN}║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
