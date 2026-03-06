#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"

FAIL=0
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAIL=1; }

if rg -n "Local-first \(compatibility marker; doctrine active = Online-first governed with mandatory local fallback\)" -S .github/copilot-instructions.md >/dev/null 2>&1; then
  pass "LOCAL_FIRST_COMPAT_MARKER_OK"
else
  fail "LOCAL_FIRST_COMPAT_MARKER_MISSING_OR_DRIFTED"
fi

if rg -n "online-first governed" -i -S .github/copilot-instructions.md .github/instructions/titane.instructions.md >/dev/null 2>&1; then
  pass "ONLINE_FIRST_GOVERNED_PRESENT"
else
  fail "ONLINE_FIRST_GOVERNED_MISSING"
fi

if rg -n "local-first only" -i -S .github/copilot-instructions.md .github/instructions >/dev/null 2>&1; then
  fail "LEGACY_LOCAL_FIRST_ONLY_PRESENT"
else
  pass "NO_LEGACY_LOCAL_FIRST_ONLY"
fi

echo "SUMMARY: FAIL=$FAIL"
if [[ "$FAIL" -ne 0 ]]; then
  exit 1
fi
