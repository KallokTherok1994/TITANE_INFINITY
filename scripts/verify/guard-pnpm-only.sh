#!/usr/bin/env bash
# TITANE∞ PNPM-ONLY GUARD
# Bloque toute régression vers npm/npx/yarn/bun
# v26.3.0 - Governance absolue

set -euo pipefail

# Configuration
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Patterns interdits
FORBIDDEN_PATTERNS=(
    "npx "
    "npm run"
    "npm exec"
    "yarn "
    "bun "
)

# Fichiers/dossiers exclus (binaires, node_modules, etc.)
EXCLUDE_PATTERNS=(
    --exclude-dir=node_modules
    --exclude-dir=dist
    --exclude-dir=target
    --exclude-dir=.git
    --exclude-dir=.tools
    --exclude-dir=.cargo
    --exclude-dir=.pnpm
    --exclude-dir=.vscode
    --exclude-dir=.github
    --exclude-dir=reports
    --exclude-dir=logs
    --exclude-dir=performance-reports
    --exclude-dir=_archive
    --exclude-dir=legacy
    --exclude-dir=backup_*
    --exclude="*.log"
    --exclude="*.md"
    --exclude="*.txt"
    --exclude="*.json"
    --exclude="*.lock"
    --exclude="*.yaml"
    --exclude="*.yml"
    --exclude="*.toml"
    --exclude="*.rs"
    --exclude="*.py"
    --exclude="*.sh"
    --exclude="*.js"
    --exclude="*.ts"
    --exclude="*.tsx"
    --exclude="*.jsx"
    --exclude="*.cjs"
    --exclude="*.mjs"
)

echo -e "${BLUE}🛡️  TITANE∞ PNPM-ONLY GUARD${NC}"
echo -e "${BLUE}═══════════════════════════════${NC}"
echo ""

VIOLATIONS_FOUND=0

for pattern in "${FORBIDDEN_PATTERNS[@]}"; do
    echo -e "🔍 Checking for: ${YELLOW}'${pattern}'${NC}"

    # Recherche des violations
    violations=$(grep -r "${EXCLUDE_PATTERNS[@]}" "${pattern}" . 2>/dev/null || true)

    if [ -n "$violations" ]; then
        echo -e "${RED}❌ VIOLATIONS FOUND for '${pattern}':${NC}"
        echo "$violations" | head -10
        echo ""

        # Compte le nombre de violations
        count=$(echo "$violations" | grep -c "^" || true)
        VIOLATIONS_FOUND=$((VIOLATIONS_FOUND + count))

        if [ "$count" -gt 10 ]; then
            remaining=$((count - 10))
            echo -e "${YELLOW}... and ${remaining} more violations${NC}"
        fi
        echo ""
    else
        echo -e "${GREEN}✅ No violations found${NC}"
        echo ""
    fi
done

echo -e "${BLUE}═══════════════════════════════${NC}"

if [ "$VIOLATIONS_FOUND" -gt 0 ]; then
    echo -e "${RED}🚫 PNPM GOVERNANCE VIOLATION${NC}"
    echo -e "${RED}Found ${VIOLATIONS_FOUND} forbidden package manager references${NC}"
    echo ""
    echo -e "${YELLOW}💡 Fix required: Replace all npx/npm/yarn/bun with pnpm${NC}"
    echo -e "${YELLOW}   Use 'pnpm exec' for running binaries${NC}"
    echo -e "${YELLOW}   Use 'pnpm run' for running scripts${NC}"
    echo ""
    echo -e "${BLUE}📋 Commandes autorisées:${NC}"
    echo -e "  ✅ pnpm install"
    echo -e "  ✅ pnpm run <script>"
    echo -e "  ✅ pnpm exec <binary>"
    echo -e "  ❌ npx <binary>"
    echo -e "  ❌ npm run <script>"
    echo -e "  ❌ yarn <command>"
    echo -e "  ❌ bun <command>"
    echo ""
    exit 1
else
    echo -e "${GREEN}✅ PNPM GOVERNANCE COMPLIANT${NC}"
    echo -e "${GREEN}No forbidden package manager references found${NC}"
    echo ""
    exit 0
fi
