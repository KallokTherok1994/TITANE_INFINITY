#!/usr/bin/env bash
# TITANE∞ — Runtime Visibility Root Cause Autofix Orchestrator
# Usage: bash scripts/orchestrate/runtime-visibility-root-cause-autofix.sh [--verify-only]
#
# --verify-only  Run gate suite and report; do not attempt any automated fixes.
#               Exit 0 when all gates pass, exit 1 on any failure.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../.."

VERIFY_ONLY=0
[[ "${1:-}" == "--verify-only" ]] && VERIFY_ONLY=1

PASS=0; FAIL=0; BLOCKED=0
FAILED_LABELS=()

run_gate() {
  local label="$1"; shift
  if "$@" 2>&1; then
    echo "PASS: $label"; ((PASS++)) || true
  else
    echo "FAIL: $label"; ((FAIL++)) || true
    FAILED_LABELS+=("$label")
  fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TITANE∞ Runtime Visibility Root Cause Orchestrator"
[[ "$VERIFY_ONLY" == "1" ]] && echo "MODE: --verify-only (no autofix)" || echo "MODE: full"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ── Gate suite ─────────────────────────────────────────────────────────────
run_gate "BUILD_TRUTH"      bash scripts/verify/gate-build-truth.sh
run_gate "VERSION_TRUTH"    bash scripts/verify/gate-version-truth.sh
run_gate "SURFACE_ROOT"     bash scripts/verify/gate-surface-root.sh
run_gate "NO_STALE_VERSION" bash scripts/verify/gate-no-stale-visible-version.sh
run_gate "RUNTIME_IDENTITY" bash scripts/verify/gate-runtime-identity-truth.sh
run_gate "LAUNCHER_TRUTH"   bash scripts/verify/gate-stable-launcher-truth.sh
run_gate "CONSOLE_NOISE"    bash scripts/verify/gate-console-runtime-noise.sh
run_gate "AUDIT_OMNISYNC"   node scripts/audit/audit-ui-chat-omnisync.mjs

# ── Autoheal recurrence detection (always runs, even in verify-only mode) ──
run_gate "AUTOHEAL"         bash scripts/autoheal/detect_recurrence.sh

# ── Summary ───────────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "SUMMARY: PASS=$PASS  FAIL=$FAIL  BLOCKED=$BLOCKED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [[ "$VERIFY_ONLY" == "1" ]] && (( FAIL == 0 )); then
  echo "VERDICT: PASS_VERIFY_ONLY — all $PASS gate(s) passed"
  exit 0
fi

if (( FAIL > 0 )); then
  echo "VERDICT: FAIL — $FAIL gate(s) did not pass:"
  for label in "${FAILED_LABELS[@]}"; do
    echo "  - $label"
  done
  exit 1
fi

echo "VERDICT: PASS — all $PASS gate(s) passed"
exit 0
