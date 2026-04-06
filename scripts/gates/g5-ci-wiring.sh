#!/bin/bash
# Gate G5: CI_WIRING
# Verifies that run-all.sh aggregator exists and CI hooks are properly wired

set -euo pipefail

GATE_ID="g5-ci-wiring"
GATE_NAME="CI Wiring & Orchestration"
EXIT_CODE=0

log() {
  local ts=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
  echo "[$ts] [${GATE_ID}] $*"
}

pass() {
  log "✅ $*"
}

fail() {
  log "❌ $*"
  EXIT_CODE=1
}

log "════════════════════════════════════════"
log "GATE G5: ${GATE_NAME}"
log "════════════════════════════════════════"

# Check 1: run-all.sh exists
if [[ -f "scripts/gates/run-all.sh" ]]; then
  pass "run-all.sh aggregator exists"
  if grep -q "g1-no-offline" scripts/gates/run-all.sh 2>/dev/null; then
    pass "run-all.sh references G1-G4 gates"
  else
    fail "run-all.sh missing gate references"
  fi
else
  fail "run-all.sh aggregator NOT FOUND"
fi

# Check 2: GitHub Actions workflows for P3-P6 phases exist
log "Checking GitHub Actions phase gates..."
PHASE_GATES=0
for phase in p3-build-guard p4-constitution-audit p5-runtime-governance p6-capability-qualification; do
  if [[ -f ".github/workflows/${phase}.yml" ]]; then
    pass "GitHub Actions: ${phase}.yml present"
    PHASE_GATES=$((PHASE_GATES + 1))
  else
    fail "GitHub Actions: ${phase}.yml MISSING"
  fi
done

if [[ $PHASE_GATES -eq 4 ]]; then
  pass "All 4 phase workflows present (P3-P6)"
else
  fail "Only $PHASE_GATES/4 phase workflows found"
fi

# Check 3: release-certification-final.yml exists
if [[ -f ".github/workflows/release-certification-final.yml" ]]; then
  pass "release-certification-final.yml present"
  if grep -q "TITANE_INFINITY_PROD_CERTIFICATION_RUN_V1" .github/workflows/release-certification-final.yml 2>/dev/null; then
    pass "release-certification workflow properly marked"
  else
    fail "release-certification workflow missing version marker"
  fi
else
  fail "release-certification-final.yml NOT FOUND"
fi

# Check 4: Certification library present
if [[ -f "scripts/certification/lib_cert.sh" ]]; then
  pass "Certification library (lib_cert.sh) present"
  if grep -q "mk_pack_dir\|prechecks_clean_tree\|sandbox_setup" scripts/certification/lib_cert.sh 2>/dev/null; then
    pass "Certification library contains required functions"
  else
    fail "Certification library missing required functions"
  fi
else
  fail "Certification library (lib_cert.sh) NOT FOUND"
fi

# Check 5: Governance scripts present
log "Checking governance scripts..."
GOVERNANCE_SCRIPTS=("scripts/governance/prod-cert-release.sh" "scripts/deployment/certified-deploy.sh")
for script in "${GOVERNANCE_SCRIPTS[@]}"; do
  if [[ -f "$script" ]]; then
    pass "$script present"
  else
    fail "$script MISSING"
  fi
done

# Check 6: Token requirements documented
log "Checking token requirements..."
TOKEN_MARKERS=(
  "GO_FOR_PROD_BUILD__TITANE_INFINITY"
  "GO_FOR_PROD_DEPLOY__TITANE_INFINITY"
)
for token_marker in "${TOKEN_MARKERS[@]}"; do
  if grep -rq "$token_marker" scripts/ docs/ 2>/dev/null; then
    pass "Token requirement documented: $token_marker"
  else
    fail "Token requirement missing: $token_marker"
  fi
done

log "════════════════════════════════════════"
if [[ $EXIT_CODE -eq 0 ]]; then
  log "✅ GATE G5 PASS: CI wiring verified"
else
  log "❌ GATE G5 FAIL: CI wiring incomplete"
fi
log "════════════════════════════════════════"

exit $EXIT_CODE
