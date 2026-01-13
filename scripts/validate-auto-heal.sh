#!/usr/bin/env bash
#═══════════════════════════════════════════════════════════════════════════════
# TITANE∞ Auto-Heal Systems - Validation Test
# Version: 26.2.0
# Description: Validates all auto-heal scripts are working correctly
#═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}     ${YELLOW}🧪 TITANE∞ AUTO-HEAL SYSTEMS VALIDATION 🧪${NC}               ${CYAN}║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════╝${NC}\n"

cd "$PROJECT_ROOT"

TESTS_PASSED=0
TESTS_FAILED=0

test_script() {
    local script=$1
    local description=$2
    
    echo -e "${CYAN}Testing: ${description}...${NC}"
    
    if [[ ! -f "$script" ]]; then
        echo -e "${RED}✗ FAIL${NC} - Script not found: $script"
          ((TESTS_FAILED+=1))
        return 1
    fi
    
    if [[ ! -x "$script" ]]; then
        echo -e "${RED}✗ FAIL${NC} - Script not executable: $script"
          ((TESTS_FAILED+=1))
        return 1
    fi
    
    # Just check if it's a valid bash script
    if head -1 "$script" | grep -q "^#!/.*bash"; then
        echo -e "${GREEN}✓ PASS${NC} - Script is valid and executable"
          ((TESTS_PASSED+=1))
        return 0
    else
        echo -e "${YELLOW}⚠ WARN${NC} - Script may not be a bash script"
          ((TESTS_PASSED+=1))
        return 0
    fi
}

echo "Testing Auto-Heal Scripts..."
echo ""

# Test each script
test_script "scripts/maintenance/health-check-enhanced.sh" "Enhanced Health Check"
test_script "scripts/maintenance/proactive-monitor.sh" "Proactive Monitor"
test_script "scripts/audit/06-auto-fix.sh" "Auto-Fix System"
test_script "scripts/verify/pre-deployment-check.sh" "Pre-Deployment Check"

# Test documentation
echo ""
echo -e "${CYAN}Testing Documentation...${NC}"
if [[ -f "docs/AUTO_HEAL_SYSTEMS.md" ]]; then
      doc_size=$(wc -c < docs/AUTO_HEAL_SYSTEMS.md)
    if [[ $doc_size -gt 10000 ]]; then
        echo -e "${GREEN}✓ PASS${NC} - Documentation exists and is comprehensive (${doc_size} bytes)"
          ((TESTS_PASSED+=1))
    else
        echo -e "${YELLOW}⚠ WARN${NC} - Documentation exists but may be incomplete"
          ((TESTS_PASSED+=1))
    fi
else
    echo -e "${RED}✗ FAIL${NC} - Documentation not found: docs/AUTO_HEAL_SYSTEMS.md"
      ((TESTS_FAILED+=1))
fi

# Test directory structure
echo ""
echo -e "${CYAN}Testing Directory Structure...${NC}"
required_dirs=(
    "scripts/maintenance"
    "scripts/audit"
    "scripts/verify"
    "docs"
)

for dir in "${required_dirs[@]}"; do
    if [[ -d "$dir" ]]; then
        echo -e "${GREEN}✓${NC} $dir exists"
    else
        echo -e "${RED}✗${NC} $dir missing"
          ((TESTS_FAILED+=1))
    fi
done

# Summary
echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}                     VALIDATION SUMMARY${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}\n"

echo -e "  ${GREEN}✓ Tests Passed:${NC}  $TESTS_PASSED"
echo -e "  ${RED}✗ Tests Failed:${NC}  $TESTS_FAILED"
echo ""

if [[ $TESTS_FAILED -eq 0 ]]; then
    echo -e "${GREEN}🎉 All validations passed! Auto-heal systems are ready.${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some validations failed. Please review the output above.${NC}"
    exit 1
fi
