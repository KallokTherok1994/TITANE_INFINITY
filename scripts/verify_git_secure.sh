#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# TITANE∞ — Git Security Verification
# ═══════════════════════════════════════════════════════════════════════════
# Ensures no sensitive data is committed, .gitignore is proper

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ISSUES=0

echo "🔐 Verifying Git Security..."

# Check 1: .gitignore exists
if [ -f ".gitignore" ]; then
    echo -e "${GREEN}✅${NC} .gitignore present"
else
    echo -e "${RED}❌${NC} .gitignore missing"
    ((ISSUES++))
fi

# Check 2: No .env files committed
if git ls-files 2>/dev/null | grep -q "\.env$"; then
    echo -e "${RED}❌${NC} .env files tracked by git"
    ((ISSUES++))
else
    echo -e "${GREEN}✅${NC} No .env files in git"
fi

# Check 3: No API keys in code
if grep -r "API_KEY.*=.*[\"'][a-zA-Z0-9]\{20,\}" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "YOUR_API_KEY\|DEMO_KEY\|TEST_KEY"; then
    echo -e "${RED}❌${NC} Potential API keys found in code"
    ((ISSUES++))
else
    echo -e "${GREEN}✅${NC} No hardcoded API keys detected"
fi

# Check 4: No private keys
if git ls-files 2>/dev/null | grep -qE "\.key$|\.pem$|id_rsa"; then
    echo -e "${RED}❌${NC} Private key files tracked by git"
    ((ISSUES++))
else
    echo -e "${GREEN}✅${NC} No private keys in git"
fi

# Check 5: Large files check (> 50MB)
if command -v git &> /dev/null; then
    LARGE_FILES=$(git ls-files | xargs -I {} sh -c 'test -f "{}" && du -k "{}" | awk "\$1 > 51200 {print}"' 2>/dev/null | wc -l)
    if [ "$LARGE_FILES" -eq 0 ]; then
        echo -e "${GREEN}✅${NC} No large files (> 50MB) in git"
    else
        echo -e "${YELLOW}⚠️${NC}  $LARGE_FILES large files in git"
    fi
fi

# Summary
if [ $ISSUES -eq 0 ]; then
    echo -e "\n${GREEN}✅ GIT SECURITY: CLEAN${NC}"
    exit 0
else
    echo -e "\n${RED}❌ GIT SECURITY: $ISSUES ISSUES${NC}"
    exit 1
fi
