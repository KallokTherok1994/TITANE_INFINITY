#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"
source "$(dirname "${BASH_SOURCE[0]}")/_rg_compat.sh"

FAIL=0
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAIL=$((FAIL+1)); }

if [[ -f src/components/system/SurfaceRoot.tsx ]]; then
  pass "SURFACE_ROOT_COMPONENT_EXISTS"
else
  fail "SURFACE_ROOT_COMPONENT_MISSING"
fi

if [[ -f docs/governance/FRONTEND_UI_TRUTH.md ]]; then
  pass "FRONTEND_UI_TRUTH_DOC_EXISTS"
else
  fail "FRONTEND_UI_TRUTH_DOC_MISSING"
fi

if _rg -n "SurfaceRoot" docs/governance/FRONTEND_UI_TRUTH.md >/dev/null 2>&1; then
  pass "FRONTEND_UI_TRUTH_DOC_MENTIONS_SURFACEROOT"
else
  fail "FRONTEND_UI_TRUTH_DOC_MISSING_SURFACEROOT_REFERENCE"
fi

if _rg -n "data-surface-truth" src/hooks/useSurfaceTruth.ts >/dev/null 2>&1; then
  pass "USE_SURFACE_TRUTH_PRESENT"
else
  fail "USE_SURFACE_TRUTH_MISSING"
fi

if _rg -n "SurfaceRoot" src/App.tsx >/dev/null 2>&1; then
  pass "SURFACEROOT_INTEGRATED_IN_APP"
else
  fail "SURFACEROOT_NOT_INTEGRATED_IN_APP"
fi

if [[ "$FAIL" -ne 0 ]]; then
  echo "SUMMARY: FAIL=$FAIL"
  exit 1
fi

echo "SUMMARY: PASS=ALL"
