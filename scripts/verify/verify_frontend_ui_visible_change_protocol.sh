#!/usr/bin/env bash
# TITANE∞ — Verify Frontend UI Visible Change Protocol exists
# Checks that every piece of Runtime Visibility Protocol infrastructure is in place.
# Exit 0 when all checks pass, exit 1 on any failure.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../.."

PASS=0; FAIL=0

check_file() {
  local label="$1"; local file="$2"
  if [[ -f "$file" ]]; then
    echo "PASS: $label"; ((PASS++)) || true
  else
    echo "FAIL: $label — missing $file"; ((FAIL++)) || true
  fi
}

check_contains() {
  local label="$1"; local file="$2"; local pattern="$3"
  if [[ -f "$file" ]] && grep -q "$pattern" "$file" 2>/dev/null; then
    echo "PASS: $label"; ((PASS++)) || true
  else
    echo "FAIL: $label — pattern '$pattern' not in $file"; ((FAIL++)) || true
  fi
}

# ── Runtime identity utilities ─────────────────────────────────────────────
check_file "RUNTIME_IDENTITY_UTIL"   "src/utils/runtimeIdentity.ts"
check_file "RUNTIME_IDENTITY_PROBE"  "src/components/dev/RuntimeIdentityProbe.tsx"

# ── Gate scripts ───────────────────────────────────────────────────────────
check_file "GATE_RUNTIME_IDENTITY"   "scripts/verify/gate-runtime-identity-truth.sh"
check_file "GATE_NO_STALE_VERSION"   "scripts/verify/gate-no-stale-visible-version.sh"
check_file "GATE_CONSOLE_NOISE"      "scripts/verify/gate-console-runtime-noise.sh"
check_file "GATE_ARTIFACT_FRESHNESS" "scripts/verify/gate-stable-artifact-freshness.sh"
check_file "GATE_LAUNCHER_TRUTH"     "scripts/verify/gate-stable-launcher-truth.sh"

# ── E2E surface truth ──────────────────────────────────────────────────────
check_file "WDIO_SURFACE_TRUTH"      "e2e/desktop/stable-surface-truth.wdio.test.js"

# ── Protocol documented in Copilot instructions ────────────────────────────
check_contains "PROTOCOL_IN_COPILOT" ".github/copilot-instructions.md" "Runtime Visibility"

# ── Summary ───────────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "SUMMARY: PASS=$PASS  FAIL=$FAIL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if (( FAIL > 0 )); then
  echo "VERDICT: FAIL — $FAIL check(s) did not pass"
  exit 1
else
  echo "VERDICT: PASS — all $PASS check(s) passed"
  exit 0
fi
