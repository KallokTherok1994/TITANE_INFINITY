#!/usr/bin/env bash
# verify_research_truth_engine.sh — C3 Research Truth Engine validator
# Lock: C3 | Tier: T3 | Rule 10/15/16
set -euo pipefail

PASS=0
FAIL=0
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

check() {
  local label="$1"
  local result="$2"
  if [ "$result" = "0" ]; then
    echo "  PASS  $label"
    PASS=$((PASS + 1))
  else
    echo "  FAIL  $label"
    FAIL=$((FAIL + 1))
  fi
}

echo "=== verify_research_truth_engine.sh (C3) ==="

# 1. Contract file exists
[ -f "$REPO_ROOT/src/services/research_truth/ResearchTruthContract.ts" ]
check "ResearchTruthContract.ts exists" $?

# 2. Test file exists
[ -f "$REPO_ROOT/src/services/research_truth/__tests__/ResearchTruthContract.test.ts" ]
check "ResearchTruthContract.test.ts exists" $?

# 3. RESEARCH_UNAVAILABLE state in contract
grep -q "RESEARCH_UNAVAILABLE" "$REPO_ROOT/src/services/research_truth/ResearchTruthContract.ts"
check "RESEARCH_UNAVAILABLE state defined in contract" $?

# 4. requiresResearchForClaim exported
grep -q "export function requiresResearchForClaim" "$REPO_ROOT/src/services/research_truth/ResearchTruthContract.ts"
check "requiresResearchForClaim exported" $?

# 5. canPresentAsFact exported
grep -q "export function canPresentAsFact" "$REPO_ROOT/src/services/research_truth/ResearchTruthContract.ts"
check "canPresentAsFact exported" $?

# 6. isResearchUnavailable exported
grep -q "export function isResearchUnavailable" "$REPO_ROOT/src/services/research_truth/ResearchTruthContract.ts"
check "isResearchUnavailable exported" $?

# 7. hasContradictions exported
grep -q "export function hasContradictions" "$REPO_ROOT/src/services/research_truth/ResearchTruthContract.ts"
check "hasContradictions exported" $?

# 8. buildCitationSummary exported
grep -q "export function buildCitationSummary" "$REPO_ROOT/src/services/research_truth/ResearchTruthContract.ts"
check "buildCitationSummary exported" $?

# 9. validateResearchUnavailableHonesty exported
grep -q "export function validateResearchUnavailableHonesty" "$REPO_ROOT/src/services/research_truth/ResearchTruthContract.ts"
check "validateResearchUnavailableHonesty exported" $?

# 10. mapC2RequiresWebValidationToResearchState exported
grep -q "export function mapC2RequiresWebValidationToResearchState" "$REPO_ROOT/src/services/research_truth/ResearchTruthContract.ts"
check "mapC2RequiresWebValidationToResearchState exported" $?

# 11. RESEARCH_UNAVAILABLE_IS_TERMINAL exported
grep -q "export const RESEARCH_UNAVAILABLE_IS_TERMINAL" "$REPO_ROOT/src/services/research_truth/ResearchTruthContract.ts"
check "RESEARCH_UNAVAILABLE_IS_TERMINAL exported" $?

# 12. ResearchSourceSchema exported
grep -q "export const ResearchSourceSchema" "$REPO_ROOT/src/services/research_truth/ResearchTruthContract.ts"
check "ResearchSourceSchema exported" $?

# 13. ResearchClaimSchema exported
grep -q "export const ResearchClaimSchema" "$REPO_ROOT/src/services/research_truth/ResearchTruthContract.ts"
check "ResearchClaimSchema exported" $?

# 14. ResearchTruthResultSchema exported
grep -q "export const ResearchTruthResultSchema" "$REPO_ROOT/src/services/research_truth/ResearchTruthContract.ts"
check "ResearchTruthResultSchema exported" $?

# 15. Contract reference doc exists
[ -f "$REPO_ROOT/docs/research/RESEARCH_TRUTH_ENGINE_CONTRACT.md" ]
check "RESEARCH_TRUTH_ENGINE_CONTRACT.md exists" $?

# 16. Policy doc exists
[ -f "$REPO_ROOT/docs/research/RESEARCH_TRUTH_POLICY.md" ]
check "RESEARCH_TRUTH_POLICY.md exists" $?

# 17. AI-DESKTOP-09 in Desktop registry
grep -q "AI-DESKTOP-09" "$REPO_ROOT/docs/registry/TITANE_DESKTOP_E2E_REGISTRY.md" 2>/dev/null
check "AI-DESKTOP-09 in Desktop registry" $?

# 18. AI-DESKTOP-10 in Desktop registry
grep -q "AI-DESKTOP-10" "$REPO_ROOT/docs/registry/TITANE_DESKTOP_E2E_REGISTRY.md" 2>/dev/null
check "AI-DESKTOP-10 in Desktop registry" $?

# 19. REG-AI-C3 in Advanced Intelligence Registry
grep -q "REG-AI-C3" "$REPO_ROOT/docs/registry/TITANE_ADVANCED_INTELLIGENCE_REGISTRY.md" 2>/dev/null
check "REG-AI-C3 in Advanced Intelligence Registry" $?

# 20. Proof pack directory exists
[ -d "$REPO_ROOT/proof_packs/LOCK_C3_RESEARCH_TRUTH_ENGINE_2026-05-06" ]
check "C3 proof pack directory exists" $?

# 21. C3 AutoHeal entry exists
grep -q "LOCK_C3_RESEARCH_TRUTH_ENGINE_2026_05_06" "$REPO_ROOT/scripts/autoheal/autoheal_rules.jsonl"
check "C3 AutoHeal entry in autoheal_rules.jsonl" $?

echo ""
echo "=== RESULT: PASS=$PASS FAIL=$FAIL ==="
if [ "$FAIL" -eq 0 ]; then
  echo "STATUS: PASS"
  exit 0
else
  echo "STATUS: FAIL"
  exit 1
fi
