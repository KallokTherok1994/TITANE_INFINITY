#!/usr/bin/env bash
# TITANE∞ v26.2.0 - Phase 3 Perfection
# Coverage Thresholds Verification Script
# Vérifie que les seuils de couverture sont respectés

set -e

echo "═══════════════════════════════════════════════════════════════════════════"
echo "🧪 TITANE∞ - Coverage Thresholds Verification"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Seuils (Phase 3 Perfection)
UNIT_THRESHOLD=80
INTEGRATION_THRESHOLD=70
E2E_THRESHOLD=65

# Compteurs
FAILURES=0

# Fonction de vérification
check_coverage() {
  local category=$1
  local file=$2
  local threshold=$3
  
  if [ ! -f "$file" ]; then
    echo -e "${YELLOW}⚠️  Warning: Coverage file not found: $file${NC}"
    echo "   Run 'npm run test:coverage:${category}' first"
    return 0
  fi
  
  echo "📊 Checking $category coverage..."
  
  # Parse JSON (compatible avec jq et sans jq)
  if command -v jq &> /dev/null; then
    # Avec jq (plus précis)
    local statements=$(jq -r '.total.statements.pct' "$file" 2>/dev/null || echo "0")
    local branches=$(jq -r '.total.branches.pct' "$file" 2>/dev/null || echo "0")
    local functions=$(jq -r '.total.functions.pct' "$file" 2>/dev/null || echo "0")
    local lines=$(jq -r '.total.lines.pct' "$file" 2>/dev/null || echo "0")
  else
    # Sans jq (fallback grep/sed)
    local statements=$(grep -o '"statements":{"pct":[0-9.]*' "$file" | grep -o '[0-9.]*$' || echo "0")
    local branches=$(grep -o '"branches":{"pct":[0-9.]*' "$file" | grep -o '[0-9.]*$' || echo "0")
    local functions=$(grep -o '"functions":{"pct":[0-9.]*' "$file" | grep -o '[0-9.]*$' || echo "0")
    local lines=$(grep -o '"lines":{"pct":[0-9.]*' "$file" | grep -o '[0-9.]*$' || echo "0")
  fi
  
  # Convertir en entiers pour comparaison (bash n'aime pas les floats)
  local statements_int=${statements%.*}
  local branches_int=${branches%.*}
  local functions_int=${functions%.*}
  local lines_int=${lines%.*}
  
  echo "   Statements: ${statements}%"
  echo "   Branches:   ${branches}%"
  echo "   Functions:  ${functions}%"
  echo "   Lines:      ${lines}%"
  
  # Vérification seuils
  local category_failed=0
  
  if (( statements_int < threshold )); then
    echo -e "${RED}   ❌ Statements below threshold (${statements}% < ${threshold}%)${NC}"
    category_failed=1
  fi
  
  if (( branches_int < threshold )); then
    echo -e "${RED}   ❌ Branches below threshold (${branches}% < ${threshold}%)${NC}"
    category_failed=1
  fi
  
  if (( functions_int < threshold )); then
    echo -e "${RED}   ❌ Functions below threshold (${functions}% < ${threshold}%)${NC}"
    category_failed=1
  fi
  
  if (( lines_int < threshold )); then
    echo -e "${RED}   ❌ Lines below threshold (${lines}% < ${threshold}%)${NC}"
    category_failed=1
  fi
  
  if (( category_failed == 0 )); then
    echo -e "${GREEN}   ✅ All thresholds passed (>= ${threshold}%)${NC}"
  else
    FAILURES=$((FAILURES + 1))
  fi
  
  echo ""
}

# Vérification Unit Tests
check_coverage "unit" "coverage/unit/coverage-summary.json" "$UNIT_THRESHOLD"

# Vérification Integration Tests
check_coverage "integration" "coverage/integration/coverage-summary.json" "$INTEGRATION_THRESHOLD"

# E2E Coverage (info only, pas de blocage)
if [ -f "coverage/e2e/coverage-summary.json" ]; then
  echo "📊 E2E Coverage (info only, no blocking):"
  if command -v jq &> /dev/null; then
    local e2e_coverage=$(jq -r '.total.statements.pct' "coverage/e2e/coverage-summary.json" 2>/dev/null || echo "N/A")
    echo "   Coverage: ${e2e_coverage}% (target: ${E2E_THRESHOLD}%)"
  fi
  echo ""
fi

# Résultat final
echo "═══════════════════════════════════════════════════════════════════════════"

if (( FAILURES == 0 )); then
  echo -e "${GREEN}✅ All coverage thresholds passed!${NC}"
  echo ""
  exit 0
else
  echo -e "${RED}❌ Coverage verification failed: ${FAILURES} categor(y|ies) below threshold${NC}"
  echo ""
  echo "💡 To fix:"
  echo "   1. Run 'npm run test:coverage' to see detailed report"
  echo "   2. Add tests to increase coverage"
  echo "   3. Verify test quality (not just quantity)"
  echo ""
  exit 1
fi
