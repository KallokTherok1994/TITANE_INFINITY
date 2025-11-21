#!/bin/bash
# TITANE∞ v8.0 - Validation Script

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║         🌌 TITANE∞ v8.0 - Validation du Projet 🌌           ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check function
check() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
        return 1
    fi
}

ERRORS=0

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📁 Structure du Projet"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check backend files
[ -f "core/backend/main.rs" ] && check 0 "main.rs présent" || check 1 "main.rs manquant" && ((ERRORS++))
[ -f "core/backend/system/mod.rs" ] && check 0 "system/mod.rs présent" || check 1 "system/mod.rs manquant" && ((ERRORS++))

# Check modules
MODULES=("helios" "nexus" "harmonia" "sentinel" "watchdog" "self_heal" "adaptive_engine" "memory")
for module in "${MODULES[@]}"; do
    [ -f "core/backend/system/$module/mod.rs" ] && check 0 "$module/mod.rs présent" || check 1 "$module/mod.rs manquant" && ((ERRORS++))
done

# Check shared files
[ -f "core/backend/shared/types.rs" ] && check 0 "shared/types.rs présent" || check 1 "shared/types.rs manquant" && ((ERRORS++))
[ -f "core/backend/shared/utils.rs" ] && check 0 "shared/utils.rs présent" || check 1 "shared/utils.rs manquant" && ((ERRORS++))
[ -f "core/backend/shared/macros.rs" ] && check 0 "shared/macros.rs présent" || check 1 "shared/macros.rs manquant" && ((ERRORS++))

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚛️  Frontend"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

[ -f "core/frontend/App.tsx" ] && check 0 "App.tsx présent" || check 1 "App.tsx manquant" && ((ERRORS++))
[ -f "core/frontend/main.tsx" ] && check 0 "main.tsx présent" || check 1 "main.tsx manquant" && ((ERRORS++))
[ -f "core/frontend/hooks/useTitaneCore.ts" ] && check 0 "useTitaneCore hook présent" || check 1 "useTitaneCore hook manquant" && ((ERRORS++))
[ -f "core/frontend/devtools/DevTools.tsx" ] && check 0 "DevTools présent" || check 1 "DevTools manquant" && ((ERRORS++))

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚙️  Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

[ -f "package.json" ] && check 0 "package.json présent" || check 1 "package.json manquant" && ((ERRORS++))
[ -f "vite.config.ts" ] && check 0 "vite.config.ts présent" || check 1 "vite.config.ts manquant" && ((ERRORS++))
[ -f "tsconfig.json" ] && check 0 "tsconfig.json présent" || check 1 "tsconfig.json manquant" && ((ERRORS++))
[ -f "src-tauri/Cargo.toml" ] && check 0 "Cargo.toml présent" || check 1 "Cargo.toml manquant" && ((ERRORS++))
[ -f "src-tauri/tauri.conf.json" ] && check 0 "tauri.conf.json présent" || check 1 "tauri.conf.json manquant" && ((ERRORS++))

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📚 Documentation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

[ -f "docs/README.md" ] && check 0 "README présent" || check 1 "README manquant" && ((ERRORS++))
[ -f "docs/ARCHITECTURE.md" ] && check 0 "ARCHITECTURE présent" || check 1 "ARCHITECTURE manquant" && ((ERRORS++))
[ -f "docs/MODULES.md" ] && check 0 "MODULES présent" || check 1 "MODULES manquant" && ((ERRORS++))
[ -f "docs/SECURITY.md" ] && check 0 "SECURITY présent" || check 1 "SECURITY manquant" && ((ERRORS++))
[ -f "docs/DEVELOPER_GUIDE.md" ] && check 0 "DEVELOPER_GUIDE présent" || check 1 "DEVELOPER_GUIDE manquant" && ((ERRORS++))
[ -f "docs/CHANGELOG.md" ] && check 0 "CHANGELOG présent" || check 1 "CHANGELOG manquant" && ((ERRORS++))

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Scripts"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

[ -f "system/scripts/install_deps.sh" ] && check 0 "install_deps.sh présent" || check 1 "install_deps.sh manquant" && ((ERRORS++))
[ -f "system/scripts/run.sh" ] && check 0 "run.sh présent" || check 1 "run.sh manquant" && ((ERRORS++))
[ -f "system/scripts/build.sh" ] && check 0 "build.sh présent" || check 1 "build.sh manquant" && ((ERRORS++))
[ -f "system/scripts/clean.sh" ] && check 0 "clean.sh présent" || check 1 "clean.sh manquant" && ((ERRORS++))

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Statistiques"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

RUST_FILES=$(find core/backend -name "*.rs" | wc -l)
TS_FILES=$(find core/frontend -name "*.ts" -o -name "*.tsx" | wc -l)
DOC_FILES=$(find docs -name "*.md" | wc -l)

echo "  Fichiers Rust:       $RUST_FILES"
echo "  Fichiers TypeScript: $TS_FILES"
echo "  Documentation:       $DOC_FILES"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ VALIDATION RÉUSSIE - Projet complet et prêt${NC}"
    echo ""
    echo "🚀 Prochaines étapes:"
    echo "   1. ./system/scripts/install_deps.sh"
    echo "   2. ./system/scripts/run.sh"
else
    echo -e "${RED}❌ VALIDATION ÉCHOUÉE - $ERRORS erreur(s) détectée(s)${NC}"
    exit 1
fi

echo ""
echo "╚═══════════════════════════════════════════════════════════════╝"
