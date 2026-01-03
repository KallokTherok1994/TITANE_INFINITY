#!/bin/bash

echo "🔍 TITANE Orchestration — System Verification"
echo "============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: Directory structure
echo "📁 Checking directory structure..."
if [ -d ".github/agents" ] && [ -d "orchestration/scripts" ] && [ -d "plans" ]; then
    echo -e "${GREEN}✅ Directory structure correct${NC}"
else
    echo -e "${RED}❌ Missing directories${NC}"
    exit 1
fi

# Check 2: Agent files
echo ""
echo "🎭 Checking Copilot agents..."
AGENT_COUNT=$(find .github/agents -name "*.agent.md" 2>/dev/null | wc -l)
if [ "$AGENT_COUNT" -eq 4 ]; then
    echo -e "${GREEN}✅ 4 agents found${NC}"
    ls .github/agents/*.agent.md | sed 's/^/  - /'
else
    echo -e "${RED}❌ Expected 4 agents, found $AGENT_COUNT${NC}"
    exit 1
fi

# Check 3: Scripts
echo ""
echo "📜 Checking TypeScript scripts..."
SCRIPT_COUNT=$(find orchestration/scripts -name "*.ts" 2>/dev/null | wc -l)
if [ "$SCRIPT_COUNT" -eq 3 ]; then
    echo -e "${GREEN}✅ 3 scripts found${NC}"
    ls orchestration/scripts/*.ts | sed 's/^/  - /'
else
    echo -e "${RED}❌ Expected 3 scripts, found $SCRIPT_COUNT${NC}"
    exit 1
fi

# Check 4: Roadmap
echo ""
echo "🗺️  Checking roadmap..."
if [ -f "orchestration/roadmap.yaml" ]; then
    TASK_COUNT=$(grep -c "^  - id:" orchestration/roadmap.yaml)
    echo -e "${GREEN}✅ Roadmap found with $TASK_COUNT tasks${NC}"
else
    echo -e "${RED}❌ Roadmap not found${NC}"
    exit 1
fi

# Check 5: Dependencies
echo ""
echo "📦 Checking npm dependencies..."
cd orchestration
if [ -d "node_modules" ] && [ -f "package-lock.json" ]; then
    PACKAGE_COUNT=$(npm list --depth=0 2>/dev/null | grep -c "├──\|└──")
    echo -e "${GREEN}✅ Dependencies installed ($PACKAGE_COUNT packages)${NC}"
else
    echo -e "${RED}❌ Dependencies not installed${NC}"
    echo -e "${YELLOW}💡 Run: cd orchestration && pnpm install${NC}"
    exit 1
fi

# Check 6: NPM scripts
echo ""
echo "🛠️  Testing NPM scripts..."
pnpm run status > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ pnpm run status — working${NC}"
else
    echo -e "${RED}❌ pnpm run status — failed${NC}"
    exit 1
fi

pnpm run next > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ pnpm run next — working${NC}"
else
    echo -e "${RED}❌ pnpm run next — failed${NC}"
    exit 1
fi

# Check 7: YAML validation
echo ""
echo "✅ Validating YAML syntax..."
cd ..
npx js-yaml orchestration/roadmap.yaml > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ YAML syntax valid${NC}"
else
    echo -e "${RED}❌ YAML syntax invalid${NC}"
    exit 1
fi

# Check 8: Documentation
echo ""
echo "📚 Checking documentation..."
DOC_COUNT=0
[ -f "ORCHESTRATION_MANIFEST.md" ] && ((DOC_COUNT++))
[ -f "SETUP_GUIDE.md" ] && ((DOC_COUNT++))
[ -f "orchestration/architecture.md" ] && ((DOC_COUNT++))

if [ "$DOC_COUNT" -eq 3 ]; then
    echo -e "${GREEN}✅ All documentation present${NC}"
    echo "  - ORCHESTRATION_MANIFEST.md"
    echo "  - SETUP_GUIDE.md"
    echo "  - orchestration/architecture.md"
else
    echo -e "${YELLOW}⚠️  Only $DOC_COUNT/3 docs found${NC}"
fi

# Summary
echo ""
echo "============================================="
echo -e "${GREEN}✅ System Verification Complete${NC}"
echo ""
echo "Next steps:"
echo "  1. cd orchestration"
echo "  2. pnpm run status"
echo "  3. pnpm run next"
echo "  4. Start with @titane-conductor in GitHub Copilot"
echo ""
echo "First task: P0-1 (Analyse structure complète)"
echo "============================================="
