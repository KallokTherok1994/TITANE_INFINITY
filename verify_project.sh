#!/bin/bash
# TITANE∞ v8.0 - Project Verification Script

echo "🔍 TITANE∞ v8.0 - Vérification du Projet"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$(dirname "$0")"

ERRORS=0
WARNINGS=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${RED}✗${NC} $1 (MANQUANT)"
        ((ERRORS++))
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1/"
    else
        echo -e "${RED}✗${NC} $1/ (MANQUANT)"
        ((ERRORS++))
    fi
}

echo ""
echo "📁 Vérification de la structure..."
echo ""

# Root files
echo "Fichiers racine:"
check_file "package.json"
check_file "tsconfig.json"
check_file "tsconfig.node.json"
check_file "vite.config.ts"
check_file "index.html"
check_file "README.md"
check_file "LICENSE"

echo ""
echo "Backend Rust:"
check_dir "core/backend"
check_file "core/backend/main.rs"
check_file "core/backend/Cargo.toml"
check_dir "core/backend/system"
check_dir "core/backend/shared"

echo ""
echo "Modules Système:"
check_dir "core/backend/system/helios"
check_dir "core/backend/system/nexus"
check_dir "core/backend/system/harmonia"
check_dir "core/backend/system/sentinel"
check_dir "core/backend/system/watchdog"
check_dir "core/backend/system/self_heal"
check_dir "core/backend/system/adaptive_engine"
check_dir "core/backend/system/memory"

echo ""
echo "Frontend React:"
check_dir "core/frontend"
check_file "core/frontend/App.tsx"
check_file "core/frontend/main.tsx"
check_dir "core/frontend/hooks"
check_dir "core/frontend/devtools"
check_dir "core/frontend/ui"
check_dir "core/frontend/core"

echo ""
echo "Configuration Tauri:"
check_dir "src-tauri"
check_file "src-tauri/Cargo.toml"
check_file "src-tauri/tauri.conf.json"
check_file "src-tauri/build.rs"
check_file "src-tauri/src/main.rs"

echo ""
echo "Scripts:"
check_file "system/scripts/install_deps.sh"
check_file "system/scripts/build.sh"
check_file "system/scripts/run.sh"
check_file "system/scripts/clean.sh"

# Check if scripts are executable
for script in system/scripts/*.sh; do
    if [ -x "$script" ]; then
        echo -e "${GREEN}✓${NC} $script (exécutable)"
    else
        echo -e "${YELLOW}⚠${NC} $script (non exécutable)"
        ((WARNINGS++))
    fi
done

echo ""
echo "Documentation:"
check_file "docs/README.md"
check_file "docs/ARCHITECTURE.md"
check_file "docs/MODULES.md"
check_file "docs/SECURITY.md"
check_file "docs/DEVELOPER_GUIDE.md"
check_file "docs/CHANGELOG.md"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ Projet TITANE∞ v8.0 - Structure PARFAITE !${NC}"
    echo ""
    echo "🚀 Prochaines étapes:"
    echo "  1. ./system/scripts/install_deps.sh"
    echo "  2. ./system/scripts/run.sh"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Projet vérifié avec $WARNINGS avertissement(s)${NC}"
    exit 0
else
    echo -e "${RED}❌ $ERRORS erreur(s) détectée(s)${NC}"
    echo -e "${YELLOW}⚠️  $WARNINGS avertissement(s)${NC}"
    exit 1
fi
