#!/bin/bash

# GitGuardian Integration Verification Script
# TITANE∞ v26.3.0
# This script verifies that GitGuardian is properly integrated and configured

set -e

echo "🔐 GitGuardian Integration Verification"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check functions
check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✅${NC} $1 exists"
    return 0
  else
    echo -e "${RED}❌${NC} $1 missing"
    return 1
  fi
}

check_yaml_syntax() {
  if python3 -c "import yaml; yaml.safe_load(open('$1'))" 2>/dev/null; then
    echo -e "${GREEN}✅${NC} $1 has valid YAML syntax"
    return 0
  else
    echo -e "${RED}❌${NC} $1 has invalid YAML syntax"
    return 1
  fi
}

check_node_syntax() {
  if node --check "$1" 2>/dev/null; then
    echo -e "${GREEN}✅${NC} $1 has valid JavaScript syntax"
    return 0
  else
    echo -e "${RED}❌${NC} $1 has invalid JavaScript syntax"
    return 1
  fi
}

check_command() {
  if command -v "$1" &> /dev/null; then
    echo -e "${GREEN}✅${NC} $1 is installed"
    return 0
  else
    echo -e "${YELLOW}⚠️${NC}  $1 is not installed"
    return 1
  fi
}

# Track failures
FAILURES=0

echo "1️⃣ Checking Required Files"
echo "----------------------------"
check_file ".gitguardian.yml" || ((FAILURES++))
check_file ".github/workflows/gitguardian.yml" || ((FAILURES++))
check_file ".github/copilot-xs/scripts/gitguardian-precommit.js" || ((FAILURES++))
check_file "docs/security/GITGUARDIAN.md" || ((FAILURES++))
check_file "docs/security/GITGUARDIAN_IMPLEMENTATION.md" || ((FAILURES++))
echo ""

echo "2️⃣ Checking File Syntax"
echo "------------------------"
check_yaml_syntax ".gitguardian.yml" || ((FAILURES++))
check_yaml_syntax ".github/workflows/gitguardian.yml" || ((FAILURES++))
check_node_syntax ".github/copilot-xs/scripts/gitguardian-precommit.js" || ((FAILURES++))
check_node_syntax ".github/copilot-xs/scripts/precommit.js" || ((FAILURES++))
echo ""

echo "3️⃣ Checking Dependencies"
echo "-------------------------"
check_command "node"
check_command "python3"
check_command "git"

# Optional but recommended
if check_command "ggshield"; then
  echo -e "   ${GREEN}ℹ️${NC}  GitGuardian CLI (ggshield) version: $(ggshield --version 2>&1 | head -1)"
else
  echo -e "   ${YELLOW}ℹ️${NC}  ggshield will be auto-installed on first commit"
fi
echo ""

echo "4️⃣ Checking package.json Scripts"
echo "----------------------------------"
if grep -q '"copilot-xs:gitguardian"' package.json; then
  echo -e "${GREEN}✅${NC} copilot-xs:gitguardian script is defined"
else
  echo -e "${RED}❌${NC} copilot-xs:gitguardian script is missing"
  ((FAILURES++))
fi
echo ""

echo "5️⃣ Checking Documentation Updates"
echo "-----------------------------------"
if grep -q "GitGuardian" README.md; then
  echo -e "${GREEN}✅${NC} README.md mentions GitGuardian"
else
  echo -e "${RED}❌${NC} README.md doesn't mention GitGuardian"
  ((FAILURES++))
fi

if grep -q "GitGuardian" CONTRIBUTING.md; then
  echo -e "${GREEN}✅${NC} CONTRIBUTING.md mentions GitGuardian"
else
  echo -e "${RED}❌${NC} CONTRIBUTING.md doesn't mention GitGuardian"
  ((FAILURES++))
fi
echo ""

echo "6️⃣ Testing Pre-commit Script"
echo "------------------------------"
if COPILOT_XS_SKIP_GITGUARDIAN=1 node .github/copilot-xs/scripts/gitguardian-precommit.js 2>&1 | grep -q "skipped"; then
  echo -e "${GREEN}✅${NC} Pre-commit script runs with skip flag"
else
  echo -e "${RED}❌${NC} Pre-commit script fails with skip flag"
  ((FAILURES++))
fi
echo ""

echo "7️⃣ GitHub Actions Workflow Validation"
echo "---------------------------------------"
if [ -n "$GITHUB_ACTIONS" ]; then
  echo -e "${GREEN}ℹ️${NC}  Running in GitHub Actions environment"
  if [ -n "$GITGUARDIAN_API_KEY" ]; then
    echo -e "${GREEN}✅${NC} GITGUARDIAN_API_KEY is set"
  else
    echo -e "${YELLOW}⚠️${NC}  GITGUARDIAN_API_KEY is not set (required for CI/CD)"
  fi
else
  echo -e "${YELLOW}ℹ️${NC}  Not running in GitHub Actions"
  echo -e "   ${YELLOW}ℹ️${NC}  For CI/CD, ensure GITGUARDIAN_API_KEY secret is configured"
fi
echo ""

echo "========================================"
if [ $FAILURES -eq 0 ]; then
  echo -e "${GREEN}✅ All checks passed!${NC}"
  echo ""
  echo "GitGuardian integration is properly configured."
  echo ""
  echo "Next steps:"
  echo "1. Add GITGUARDIAN_API_KEY to GitHub repository secrets"
  echo "2. Install ggshield locally: pip install ggshield"
  echo "3. Read docs/security/GITGUARDIAN.md for usage guide"
  echo ""
  exit 0
else
  echo -e "${RED}❌ $FAILURES check(s) failed${NC}"
  echo ""
  echo "Please review the failures above and fix them."
  echo "See docs/security/GITGUARDIAN_IMPLEMENTATION.md for details."
  echo ""
  exit 1
fi
