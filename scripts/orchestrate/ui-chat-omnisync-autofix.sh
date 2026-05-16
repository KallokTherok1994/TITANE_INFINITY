#!/usr/bin/env bash
# TITANE∞ — UI Chat Omnisync Autofix Loop
# Bounded autofix: max 5 passes, no broad rewrites, no validator weakening.
# Usage:
#   bash scripts/orchestrate/ui-chat-omnisync-autofix.sh             # run loop
#   bash scripts/orchestrate/ui-chat-omnisync-autofix.sh --verify-only  # verify only

set -euo pipefail
ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"

VERIFY_ONLY=${1:-}
MAX_PASSES=5
PASS=0
FAIL=0
BLOCKED=0

pass()    { echo "PASS: $1";    PASS=$((PASS+1)); }
fail()    { echo "FAIL: $1";    FAIL=$((FAIL+1)); }
blocked() { echo "BLOCKED: $1"; BLOCKED=$((BLOCKED+1)); }

REPORT_DIR="reports/ui-chat-omnisync-completion-2026-05-16"
mkdir -p "$REPORT_DIR"

echo "════════════════════════════════════════"
echo "TITANE∞ UI Chat Omnisync Autofix"
echo "Mode: ${VERIFY_ONLY:---verify-only}"
echo "Date: $(date -Is)"
echo "════════════════════════════════════════"
echo ""

# ──────────────────────────────────────────
# VERIFY GATES (always run)
# ──────────────────────────────────────────

echo "── Static gates ──"

if pnpm run check >/dev/null 2>&1; then
  pass "TYPE_CHECK"
else
  fail "TYPE_ERROR"
fi

if pnpm run lint >/dev/null 2>&1; then
  pass "LINT"
else
  fail "LINT_ERROR"
fi

echo "── Build truth ──"

if bash scripts/verify/gate-build-truth.sh >/dev/null 2>&1; then
  pass "BUILD_TRUTH"
else
  fail "BUILD_TRUTH_FAIL"
fi

if bash scripts/verify/gate-version-truth.sh >/dev/null 2>&1; then
  pass "VERSION_TRUTH"
else
  fail "BUILD_TRUTH_FAIL"
fi

if bash scripts/verify/gate-surface-root.sh >/dev/null 2>&1; then
  pass "SURFACE_ROOT"
else
  fail "BUILD_TRUTH_FAIL"
fi

echo "── Artifact freshness ──"

if bash scripts/verify/gate-stable-artifact-freshness.sh >/dev/null 2>&1; then
  pass "STABLE_ARTIFACT_FRESH"
else
  fail "STABLE_ARTIFACT_STALE"
fi

echo "── Launcher truth ──"

if bash scripts/verify/gate-stable-launcher-truth.sh >/dev/null 2>&1; then
  pass "LAUNCHER_TRUTH"
else
  LAUNCHER_OUT=$(bash scripts/verify/gate-stable-launcher-truth.sh 2>&1 || true)
  if echo "$LAUNCHER_OUT" | grep -q "USER_LOCAL_LAUNCHER_FRESH"; then
    pass "LAUNCHER_TRUTH (USER_LOCAL_FRESH)"
  else
    fail "USER_LAUNCHER_STALE"
  fi
fi

echo "── Governance ──"

if bash scripts/verify_instructions.sh >/dev/null 2>&1; then
  pass "VERIFY_INSTRUCTIONS"
else
  fail "GOVERNANCE_FAIL"
fi

if bash scripts/autoheal/detect_recurrence.sh >/dev/null 2>&1; then
  pass "AUTOHEAL"
else
  fail "AUTOHEAL_FAIL"
fi

echo "── Audit ──"

AUDIT_OUT=$(node scripts/audit/audit-ui-chat-omnisync.mjs 2>&1)
echo "$AUDIT_OUT" | head -10
if echo "$AUDIT_OUT" | grep -q "PARTIAL: 0"; then
  pass "AUDIT_NO_PARTIAL_SURFACES"
else
  fail "UNLABELLED_STATIC_DATA"
fi

echo ""
echo "── Summary ──"
echo "PASS=$PASS FAIL=$FAIL BLOCKED=$BLOCKED"

if [[ "$VERIFY_ONLY" == "--verify-only" ]]; then
  if [[ $FAIL -eq 0 ]]; then
    echo ""
    echo "VERDICT: PASS_VERIFY_ONLY"
    exit 0
  else
    echo ""
    echo "VERDICT: FAIL — $FAIL failures remain"
    exit 1
  fi
fi

# ──────────────────────────────────────────
# AUTOFIX LOOP (only if not verify-only)
# ──────────────────────────────────────────

if [[ $FAIL -eq 0 ]]; then
  echo "All gates pass. No autofix needed."
  echo "VERDICT: PASS_NO_FIX_NEEDED"
  exit 0
fi

echo ""
echo "Autofix loop would run here (max $MAX_PASSES passes)."
echo "Current implementation: classify only — do not auto-mutate."
echo "Manual intervention required for remaining failures."
echo "VERDICT: FAIL_MANUAL_REQUIRED"
exit 1
