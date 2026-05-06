#!/usr/bin/env bash
# verify_readme_changelog_registry_sync.sh
# F0 gate: verify documentation surfaces are synced with Advanced Intelligence lock chain C0-E0
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

# C02 README does NOT claim SEALED for Advanced Intelligence
if grep -q "Advanced Intelligence" README.md && grep -q "NOT_SEALED\|not yet sealed\|partial Desktop\|PASS_WITH_EXPLICIT_BLOCKERS" README.md; then
  check "C02_README_HONEST_SEAL_STATE" 1
else
  check "C02_README_HONEST_SEAL_STATE" 0
fi

# C03 CHANGELOG has E0 entry
if grep -q "E0\|Advanced.*Intelligence" CHANGELOG.md; then check "C03_CHANGELOG_HAS_AI_SECTION" 1; else check "C03_CHANGELOG_HAS_AI_SECTION" 0; fi

# C04 RELEASE_SURFACE says NOT_SEALED
if grep -q "NOT_SEALED" RELEASE_SURFACE_INVENTORY.md; then check "C04_RELEASE_SURFACE_NOT_SEALED" 1; else check "C04_RELEASE_SURFACE_NOT_SEALED" 0; fi

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

# C08 Proof pack registry has C0-E0
if grep -q "PREG-E0" docs/registry/TITANE_PROOF_PACK_REGISTRY.md; then check "C08_PROOF_PACK_REGISTRY_HAS_E0" 1; else check "C08_PROOF_PACK_REGISTRY_HAS_E0" 0; fi

# C09 Program status has E0 (not just PLANNED/DONE for D5)
if grep -q "E0.*PASS_WITH_EXPLICIT_BLOCKERS\|PASS_WITH_EXPLICIT_BLOCKERS.*E0" docs/roadmap/TITANE_ADVANCED_INTELLIGENCE_PROGRAM_STATUS.md; then check "C09_PROGRAM_STATUS_HAS_E0" 1; else check "C09_PROGRAM_STATUS_HAS_E0" 0; fi

# C10 D5 NOT_STARTED in program status (not CLEAN or DONE)
if grep -q "D5.*NOT_STARTED\|NOT_STARTED.*D5" docs/roadmap/TITANE_ADVANCED_INTELLIGENCE_PROGRAM_STATUS.md; then
  check "C10_D5_NOT_STARTED" 1
else
  check "C10_D5_NOT_STARTED" 0
fi

echo ""
echo "SUMMARY: PASS=$PASS FAIL=$FAIL"
[ "$FAIL" -eq 0 ]

# C02 README does NOT claim SEALED for Advanced Intelligence
if grep -q "Advanced Intelligence" README.md; then
  if grep -q "NOT_SEALED\|not yet sealed\|partial Desktop\|PASS_WITH_EXPLICIT_BLOCKERS" README.md; then
    check "C02_README_HONEST_SEAL_STATE" 1
  else
    check "C02_README_HONEST_SEAL_STATE" 0
  fi
else
  check "C02_README_HONEST_SEAL_STATE" 0
fi

# C03 CHANGELOG has E0 entry
grep -q "E0\|Advanced.*Intelligence" CHANGELOG.md && check "C03_CHANGELOG_HAS_AI_SECTION" 1 || check "C03_CHANGELOG_HAS_AI_SECTION" 0

# C04 RELEASE_SURFACE says NOT_SEALED
grep -q "NOT_SEALED" RELEASE_SURFACE_INVENTORY.md && check "C04_RELEASE_SURFACE_NOT_SEALED" 1 || check "C04_RELEASE_SURFACE_NOT_SEALED" 0

# C05 AI registry has E0
grep -q "REG-AI-E0" docs/registry/TITANE_ADVANCED_INTELLIGENCE_REGISTRY.md && check "C05_AI_REGISTRY_HAS_E0" 1 || check "C05_AI_REGISTRY_HAS_E0" 0

# C06 Desktop registry distinguishes PASS from SKIPPED
DESKTOP_REG="docs/registry/TITANE_DESKTOP_E2E_REGISTRY.md"
if grep -q "PASS" "$DESKTOP_REG" && grep -q "SKIPPED_WITH_EXPLICIT_BLOCKER" "$DESKTOP_REG"; then
  check "C06_DESKTOP_REG_DISTINGUISHES_PASS_FROM_SKIPPED" 1
else
  check "C06_DESKTOP_REG_DISTINGUISHES_PASS_FROM_SKIPPED" 0
fi

# C07 D5_READINESS_ASSESSMENT exists
[ -f docs/roadmap/D5_READINESS_ASSESSMENT.md ] && check "C07_D5_READINESS_EXISTS" 1 || check "C07_D5_READINESS_EXISTS" 0

# C08 Proof pack registry has C0-E0
grep -q "PREG-E0" docs/registry/TITANE_PROOF_PACK_REGISTRY.md && check "C08_PROOF_PACK_REGISTRY_HAS_E0" 1 || check "C08_PROOF_PACK_REGISTRY_HAS_E0" 0

# C09 Program status has E0 (not just PLANNED/DONE for D5)
grep -q "E0.*PASS_WITH_EXPLICIT_BLOCKERS\|PASS_WITH_EXPLICIT_BLOCKERS.*E0" docs/roadmap/TITANE_ADVANCED_INTELLIGENCE_PROGRAM_STATUS.md && check "C09_PROGRAM_STATUS_HAS_E0" 1 || check "C09_PROGRAM_STATUS_HAS_E0" 0

# C10 D5 NOT_STARTED in program status (not CLEAN or DONE)
if grep -q "D5.*NOT_STARTED\|NOT_STARTED.*D5" docs/roadmap/TITANE_ADVANCED_INTELLIGENCE_PROGRAM_STATUS.md; then
  check "C10_D5_NOT_STARTED" 1
else
  check "C10_D5_NOT_STARTED" 0
fi

echo ""
echo "SUMMARY: PASS=$PASS FAIL=$FAIL"
[ "$FAIL" -eq 0 ]
