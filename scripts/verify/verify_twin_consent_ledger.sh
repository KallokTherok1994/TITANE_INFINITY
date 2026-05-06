#!/usr/bin/env bash
# verify_twin_consent_ledger.sh — D3 Twin Consent Ledger Validator
# Lock: D3 | Version: v13 sidecar | Gate: 25 checks

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CONTRACT="$REPO_ROOT/src/services/twin_consent/TwinConsentLedgerContract.ts"
TEST_FILE="$REPO_ROOT/src/services/twin_consent/__tests__/TwinConsentLedgerContract.test.ts"
PASS=0
FAIL=0

_pass() { echo "  [PASS] $1"; ((PASS++)) || true; }
_fail() { echo "  [FAIL] $1"; ((FAIL++)) || true; }
_check_text() {
  local file="$1" pattern="$2" label="$3"
  if grep -q "$pattern" "$file" 2>/dev/null; then _pass "$label"; else _fail "$label"; fi
}

echo "=== D3 Twin Consent Ledger Validator ==="

# C01: Contract file exists
[ -f "$CONTRACT" ] && _pass "C01: Contract file exists" || _fail "C01: Contract file exists"

# C02: Test file exists
[ -f "$TEST_FILE" ] && _pass "C02: Test file exists" || _fail "C02: Test file exists"

# C03: TwinObservationTypeSchema exported
_check_text "$CONTRACT" "TwinObservationTypeSchema" "C03: TwinObservationTypeSchema"

# C04: TwinValidationStatusSchema exported
_check_text "$CONTRACT" "TwinValidationStatusSchema" "C04: TwinValidationStatusSchema"

# C05: TwinConsentRiskLevelSchema exported
_check_text "$CONTRACT" "TwinConsentRiskLevelSchema" "C05: TwinConsentRiskLevelSchema"

# C06: TwinIdentityObservationEntrySchema exported
_check_text "$CONTRACT" "TwinIdentityObservationEntrySchema" "C06: TwinIdentityObservationEntrySchema"

# C07: canAffectIdentity policy helper
_check_text "$CONTRACT" "canAffectIdentity" "C07: canAffectIdentity helper"

# C08: canAffectBehavior policy helper
_check_text "$CONTRACT" "canAffectBehavior" "C08: canAffectBehavior helper"

# C09: canAffectMemory policy helper
_check_text "$CONTRACT" "canAffectMemory" "C09: canAffectMemory helper"

# C10: requiresKevinValidation policy helper
_check_text "$CONTRACT" "requiresKevinValidation" "C10: requiresKevinValidation helper"

# C11: normalizeAutoDetectedObservation helper
_check_text "$CONTRACT" "normalizeAutoDetectedObservation" "C11: normalizeAutoDetectedObservation"

# C12: buildTwinConsentSummary helper
_check_text "$CONTRACT" "buildTwinConsentSummary" "C12: buildTwinConsentSummary helper"

# C13: D3_TWIN_IDENTITY_OBSERVATION_CONTRACT constant
_check_text "$CONTRACT" "D3_TWIN_IDENTITY_OBSERVATION_CONTRACT" "C13: D3_TWIN_IDENTITY_OBSERVATION_CONTRACT"

# C14: D3_IDENTITY_OBSERVATION_KNOWN_LIMITS constant
_check_text "$CONTRACT" "D3_IDENTITY_OBSERVATION_KNOWN_LIMITS" "C14: D3_IDENTITY_OBSERVATION_KNOWN_LIMITS"

# C15: Feature flag VITE_TITANE_D3_IDENTITY_OBSERVATION_ACTIVE declared
_check_text "$CONTRACT" "VITE_TITANE_D3_IDENTITY_OBSERVATION_ACTIVE" "C15: Feature flag identity_observation_active"

# C16: confidence-not-consent enforcement present
_check_text "$CONTRACT" "confidence" "C16: confidence field declared in contract"

# C17: D3-UNIT-01 test present
_check_text "$TEST_FILE" "D3-UNIT-01" "C17: D3-UNIT-01 test present"

# C18: D3-UNIT-10 test present
_check_text "$TEST_FILE" "D3-UNIT-10" "C18: D3-UNIT-10 test present"

# C19: docs/twin/TWIN_CONSENT_LEDGER_POLICY.md exists
POLICY="$REPO_ROOT/docs/twin/TWIN_CONSENT_LEDGER_POLICY.md"
[ -f "$POLICY" ] && _pass "C19: TWIN_CONSENT_LEDGER_POLICY.md exists" || _fail "C19: TWIN_CONSENT_LEDGER_POLICY.md exists"

# C20: docs/twin/TWIN_CONSENT_LEDGER_SCHEMA.md exists
SCHEMA="$REPO_ROOT/docs/twin/TWIN_CONSENT_LEDGER_SCHEMA.md"
[ -f "$SCHEMA" ] && _pass "C20: TWIN_CONSENT_LEDGER_SCHEMA.md exists" || _fail "C20: TWIN_CONSENT_LEDGER_SCHEMA.md exists"

# C21: REG-AI-D3 in TITANE_ADVANCED_INTELLIGENCE_REGISTRY
AIREG="$REPO_ROOT/docs/registry/TITANE_ADVANCED_INTELLIGENCE_REGISTRY.md"
_check_text "$AIREG" "REG-AI-D3" "C21: REG-AI-D3 in ADVANCED_INTELLIGENCE_REGISTRY"

# C22: TREG-014 in TITANE_TEST_REGISTRY
TREG="$REPO_ROOT/docs/registry/TITANE_TEST_REGISTRY.md"
_check_text "$TREG" "TREG-014" "C22: TREG-014 in TITANE_TEST_REGISTRY"

# C23: AI-DESKTOP-13 SCAFFOLDED in TITANE_DESKTOP_E2E_REGISTRY
EDEREG="$REPO_ROOT/docs/registry/TITANE_DESKTOP_E2E_REGISTRY.md"
_check_text "$EDEREG" "AI-DESKTOP-13" "C23: AI-DESKTOP-13 in DESKTOP_E2E_REGISTRY"

# C24: AutoHeal entry for D3 present
AUTOHEAL="$REPO_ROOT/scripts/autoheal/autoheal_rules.jsonl"
_check_text "$AUTOHEAL" "LOCK_D3_TWIN_CONSENT_LEDGER" "C24: AutoHeal D3 entry"

# C25: Proof pack VERDICT.md exists
VERDICT="$REPO_ROOT/proof_packs/LOCK_D3_TWIN_CONSENT_2026-05-06/VERDICT.md"
[ -f "$VERDICT" ] && _pass "C25: Proof pack VERDICT.md exists" || _fail "C25: Proof pack VERDICT.md exists"

echo ""
echo "=== Result: PASS=$PASS FAIL=$FAIL ==="
[ "$FAIL" -eq 0 ] && echo "VERDICT: PASS" && exit 0 || echo "VERDICT: FAIL" && exit 1
