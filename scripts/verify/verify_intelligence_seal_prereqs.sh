#!/usr/bin/env bash
# verify_intelligence_seal_prereqs.sh — F0 gate
set -e
PASS=0
FAIL=0

check() {
  local label="$1"
  local result="$2"
  if [ "$result" = "1" ]; then
    echo "PASS: $label"
    PASS=$((PASS + 1))
  else
    echo "FAIL: $label"
    FAIL=$((FAIL + 1))
  fi
}

# C01 E0 proof pack directory exists
if [ -d proof_packs/LOCK_E0_DESKTOP_ADVANCED_E2E_2026-05-06 ]; then check "C01_E0_PROOF_PACK_EXISTS" 1; else check "C01_E0_PROOF_PACK_EXISTS" 0; fi

# C02 E0 Desktop matrix exists
if [ -f reports/desktop_advanced_intelligence_e2e_matrix.md ]; then check "C02_DESKTOP_E2E_MATRIX_EXISTS" 1; else check "C02_DESKTOP_E2E_MATRIX_EXISTS" 0; fi

# C03 D5 pack does NOT claim SEALED verdict
if [ -d proof_packs/LOCK_D5_INTELLIGENCE_SEAL_2026-05-06 ]; then
  if grep -q "^.*VERDICT:.*SEALED" proof_packs/LOCK_D5_INTELLIGENCE_SEAL_2026-05-06/VERDICT.md 2>/dev/null; then
    check "C03_D5_NOT_SEALED" 0
  else
    check "C03_D5_NOT_SEALED" 1
  fi
else
  check "C03_D5_NOT_SEALED" 1
fi

# C04 seal_state NOT_SEALED in RELEASE_SURFACE
if grep -q "NOT_SEALED" RELEASE_SURFACE_INVENTORY.md; then check "C04_SEAL_STATE_NOT_SEALED" 1; else check "C04_SEAL_STATE_NOT_SEALED" 0; fi

# C05 D5 readiness classification exists
if grep -q "D5_READY_FOR_PARTIAL_SEAL\|D5_BLOCKED\|D5_READY" docs/roadmap/D5_READINESS_ASSESSMENT.md; then check "C05_D5_READINESS_CLASSIFIED" 1; else check "C05_D5_READINESS_CLASSIFIED" 0; fi

# C06 README honest AI state
if grep -q "Advanced Intelligence" README.md && grep -q "NOT_SEALED\|not yet sealed\|partial Desktop\|PASS_WITH_EXPLICIT_BLOCKERS" README.md; then
  check "C06_README_HONEST_AI_STATE" 1
else
  check "C06_README_HONEST_AI_STATE" 0
fi

# C07 CHANGELOG has Advanced Intelligence section
if grep -q "Advanced Intelligence" CHANGELOG.md; then check "C07_CHANGELOG_HAS_AI" 1; else check "C07_CHANGELOG_HAS_AI" 0; fi

# C08 F0 ingress audit exists
if [ -f docs/roadmap/F0_INGRESS_AUDIT.md ]; then check "C08_F0_INGRESS_AUDIT_EXISTS" 1; else check "C08_F0_INGRESS_AUDIT_EXISTS" 0; fi

# C09 Desktop E2E registry has post-E0 status
if grep -q "SKIPPED_WITH_EXPLICIT_BLOCKER" docs/registry/TITANE_DESKTOP_E2E_REGISTRY.md; then check "C09_DESKTOP_REG_POST_E0" 1; else check "C09_DESKTOP_REG_POST_E0" 0; fi

# C10 AI registry has E0 and F0 entries
if grep -q "REG-AI-E0" docs/registry/TITANE_ADVANCED_INTELLIGENCE_REGISTRY.md && grep -q "REG-AI-F0" docs/registry/TITANE_ADVANCED_INTELLIGENCE_REGISTRY.md; then
  check "C10_AI_REGISTRY_HAS_E0_AND_F0" 1
else
  check "C10_AI_REGISTRY_HAS_E0_AND_F0" 0
fi

echo ""
echo "SUMMARY: PASS=$PASS FAIL=$FAIL"
[ "$FAIL" -eq 0 ]
