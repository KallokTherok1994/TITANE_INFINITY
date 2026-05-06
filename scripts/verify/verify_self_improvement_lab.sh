#!/usr/bin/env bash
# verify_self_improvement_lab.sh — D4 Self-Improvement Lab Validator
# Lock: D4 | Version: v15 sidecar | Gate: 25 checks

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CONTRACT="$REPO_ROOT/src/services/self_improvement_lab/SelfImprovementLabContract.ts"
TEST_FILE="$REPO_ROOT/src/services/self_improvement_lab/__tests__/SelfImprovementLabContract.test.ts"
PASS=0
FAIL=0

_pass() { echo "  [PASS] $1"; ((PASS++)) || true; }
_fail() { echo "  [FAIL] $1"; ((FAIL++)) || true; }
_check_text() {
  local file="$1" pattern="$2" label="$3"
  if grep -q "$pattern" "$file" 2>/dev/null; then _pass "$label"; else _fail "$label"; fi
}

echo "=== D4 Self-Improvement Lab Validator ==="

# C01: Contract file exists
[ -f "$CONTRACT" ] && _pass "C01: Contract file exists" || _fail "C01: Contract file exists"

# C02: Test file exists
[ -f "$TEST_FILE" ] && _pass "C02: Test file exists" || _fail "C02: Test file exists"

# C03: ImprovementStateSchema exported (12 states)
_check_text "$CONTRACT" "ImprovementStateSchema" "C03: ImprovementStateSchema"

# C04: PromotionStatusSchema exported (5 statuses)
_check_text "$CONTRACT" "PromotionStatusSchema" "C04: PromotionStatusSchema"

# C05: ImprovementRiskLevelSchema exported (7 levels)
_check_text "$CONTRACT" "ImprovementRiskLevelSchema" "C05: ImprovementRiskLevelSchema"

# C06: SelfImprovementLabRecordSchema exported
_check_text "$CONTRACT" "SelfImprovementLabRecordSchema" "C06: SelfImprovementLabRecordSchema"

# C07: canPromote policy helper
_check_text "$CONTRACT" "canPromote" "C07: canPromote helper"

# C08: blocksAutoMerge always true
_check_text "$CONTRACT" "blocksAutoMerge" "C08: blocksAutoMerge helper"

# C09: blocksSelfDeploy always true
_check_text "$CONTRACT" "blocksSelfDeploy" "C09: blocksSelfDeploy helper"

# C10: canGenerateProposal helper
_check_text "$CONTRACT" "canGenerateProposal" "C10: canGenerateProposal helper"

# C11: canRunSandbox helper
_check_text "$CONTRACT" "canRunSandbox" "C11: canRunSandbox helper"

# C12: canCompareEvals helper
_check_text "$CONTRACT" "canCompareEvals" "C12: canCompareEvals helper"

# C13: buildSelfImprovementSummary helper
_check_text "$CONTRACT" "buildSelfImprovementSummary" "C13: buildSelfImprovementSummary helper"

# C14: D4_SELF_IMPROVEMENT_LAB_CONTRACT constant
_check_text "$CONTRACT" "D4_SELF_IMPROVEMENT_LAB_CONTRACT" "C14: D4_SELF_IMPROVEMENT_LAB_CONTRACT"

# C15: D4_SELF_IMPROVEMENT_KNOWN_LIMITS constant (≥5 entries)
_check_text "$CONTRACT" "D4_SELF_IMPROVEMENT_KNOWN_LIMITS" "C15: D4_SELF_IMPROVEMENT_KNOWN_LIMITS"

# C16: Feature flag VITE_TITANE_D4_SELF_IMPROVEMENT_LAB declared
_check_text "$CONTRACT" "VITE_TITANE_D4_SELF_IMPROVEMENT_LAB" "C16: Feature flag D4_SELF_IMPROVEMENT_LAB"

# C17: D4-UNIT-01 test present
_check_text "$TEST_FILE" "D4-UNIT-01" "C17: D4-UNIT-01 test present"

# C18: D4-UNIT-10 test present
_check_text "$TEST_FILE" "D4-UNIT-10" "C18: D4-UNIT-10 test present"

# C19: docs/intelligence/SELF_IMPROVEMENT_LAB_POLICY.md exists
POLICY="$REPO_ROOT/docs/intelligence/SELF_IMPROVEMENT_LAB_POLICY.md"
[ -f "$POLICY" ] && _pass "C19: SELF_IMPROVEMENT_LAB_POLICY.md exists" || _fail "C19: SELF_IMPROVEMENT_LAB_POLICY.md exists"

# C20: docs/intelligence/SELF_IMPROVEMENT_LAB_SCHEMA.md exists
SCHEMA="$REPO_ROOT/docs/intelligence/SELF_IMPROVEMENT_LAB_SCHEMA.md"
[ -f "$SCHEMA" ] && _pass "C20: SELF_IMPROVEMENT_LAB_SCHEMA.md exists" || _fail "C20: SELF_IMPROVEMENT_LAB_SCHEMA.md exists"

# C21: REG-AI-D4 in TITANE_ADVANCED_INTELLIGENCE_REGISTRY
AIREG="$REPO_ROOT/docs/registry/TITANE_ADVANCED_INTELLIGENCE_REGISTRY.md"
_check_text "$AIREG" "REG-AI-D4" "C21: REG-AI-D4 in ADVANCED_INTELLIGENCE_REGISTRY"

# C22: TREG-015 in TITANE_TEST_REGISTRY
TREG="$REPO_ROOT/docs/registry/TITANE_TEST_REGISTRY.md"
_check_text "$TREG" "TREG-015" "C22: TREG-015 in TITANE_TEST_REGISTRY"

# C23: AI-DESKTOP-16 in TITANE_DESKTOP_E2E_REGISTRY
EDEREG="$REPO_ROOT/docs/registry/TITANE_DESKTOP_E2E_REGISTRY.md"
_check_text "$EDEREG" "AI-DESKTOP-16" "C23: AI-DESKTOP-16 in DESKTOP_E2E_REGISTRY"

# C24: AutoHeal entry for D4 present
AUTOHEAL="$REPO_ROOT/scripts/autoheal/autoheal_rules.jsonl"
_check_text "$AUTOHEAL" "LOCK_D4_SELF_IMPROVEMENT_LAB" "C24: AutoHeal D4 entry"

# C25: Proof pack VERDICT.md exists
VERDICT="$REPO_ROOT/proof_packs/LOCK_D4_SELF_IMPROVEMENT_LAB_2026-05-06/VERDICT.md"
[ -f "$VERDICT" ] && _pass "C25: Proof pack VERDICT.md exists" || _fail "C25: Proof pack VERDICT.md exists"

echo ""
echo "=== Result: PASS=$PASS FAIL=$FAIL ==="
[ "$FAIL" -eq 0 ] && echo "VERDICT: PASS" && exit 0 || echo "VERDICT: FAIL" && exit 1
