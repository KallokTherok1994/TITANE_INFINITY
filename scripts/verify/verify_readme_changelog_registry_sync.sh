#!/usr/bin/env bash
# verify_readme_changelog_registry_sync.sh — F0/D5 gate (post-SEALED)
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

# C01 README mentions E0
if grep -q "E0" README.md; then check "C01_README_MENTIONS_E0" 1; else check "C01_README_MENTIONS_E0" 0; fi

# C02 README reflects AI state honestly (SEALED or PASS_WITH_EXPLICIT_BLOCKERS)
if grep -q "Advanced Intelligence" README.md && grep -q "SEALED\|PASS_WITH_EXPLICIT_BLOCKERS" README.md; then
  check "C02_README_HONEST_SEAL_STATE" 1
else
  check "C02_README_HONEST_SEAL_STATE" 0
fi

# C03 CHANGELOG has E0/AI entry
if grep -q "E0\|Advanced.*Intelligence" CHANGELOG.md; then check "C03_CHANGELOG_HAS_AI_SECTION" 1; else check "C03_CHANGELOG_HAS_AI_SECTION" 0; fi

# C04 RELEASE_SURFACE has seal_state entry
if grep -q "seal_state" RELEASE_SURFACE_INVENTORY.md; then check "C04_RELEASE_SURFACE_SEAL_STATE_PRESENT" 1; else check "C04_RELEASE_SURFACE_SEAL_STATE_PRESENT" 0; fi

# C05 AI registry has E0
if grep -q "REG-AI-E0" docs/registry/TITANE_ADVANCED_INTELLIGENCE_REGISTRY.md; then check "C05_AI_REGISTRY_HAS_E0" 1; else check "C05_AI_REGISTRY_HAS_E0" 0; fi

# C06 Desktop registry distinguishes PASS from SKIPPED
DESKTOP_REG="docs/registry/TITANE_DESKTOP_E2E_REGISTRY.md"
if grep -q "PASS" "$DESKTOP_REG" && grep -q "SKIPPED_WITH_EXPLICIT_BLOCKER" "$DESKTOP_REG"; then
  check "C06_DESKTOP_REG_DISTINGUISHES_PASS_FROM_SKIPPED" 1
else
  check "C06_DESKTOP_REG_DISTINGUISHES_PASS_FROM_SKIPPED" 0
fi

# C07 D5_READINESS_ASSESSMENT exists
if [ -f docs/roadmap/D5_READINESS_ASSESSMENT.md ]; then check "C07_D5_READINESS_EXISTS" 1; else check "C07_D5_READINESS_EXISTS" 0; fi

# C08 Proof pack registry has E0
if grep -q "PREG-E0" docs/registry/TITANE_PROOF_PACK_REGISTRY.md; then check "C08_PROOF_PACK_REGISTRY_HAS_E0" 1; else check "C08_PROOF_PACK_REGISTRY_HAS_E0" 0; fi

# C09 Program status has E0 row
if grep -q "E0.*PASS_WITH_EXPLICIT_BLOCKERS\|PASS_WITH_EXPLICIT_BLOCKERS.*E0" docs/roadmap/TITANE_ADVANCED_INTELLIGENCE_PROGRAM_STATUS.md; then check "C09_PROGRAM_STATUS_HAS_E0" 1; else check "C09_PROGRAM_STATUS_HAS_E0" 0; fi

# C10 D5 has definitive state in program status (SEALED or NOT_STARTED)
if grep -q "D5.*SEALED\|SEALED.*D5\|D5.*NOT_STARTED\|NOT_STARTED.*D5" docs/roadmap/TITANE_ADVANCED_INTELLIGENCE_PROGRAM_STATUS.md; then
  check "C10_D5_STATE_PRESENT" 1
else
  check "C10_D5_STATE_PRESENT" 0
fi

echo ""
echo "SUMMARY: PASS=$PASS FAIL=$FAIL"
[ "$FAIL" -eq 0 ]
