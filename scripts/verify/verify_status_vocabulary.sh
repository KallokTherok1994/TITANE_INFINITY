#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"
source "$(dirname "${BASH_SOURCE[0]}")/_rg_compat.sh"

FAIL=0
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAIL=1; }

if [[ -f governance/statuses.yaml ]]; then
  pass "STATUS_SCHEMA_PRESENT"
else
  fail "STATUS_SCHEMA_MISSING"
fi

for s in PASS FAIL BLOCKED BLOCKED_APPROVAL DONE SEALED; do
  if _rg -n "^\s*-\s*$s\s*$" -S governance/statuses.yaml >/dev/null 2>&1; then
    pass "STATUS_DECLARED $s"
  else
    fail "STATUS_MISSING $s"
  fi
done

if _rg -n "PASS / FAIL / BLOCKED" -S .github/copilot-instructions.md >/dev/null 2>&1; then
  pass "KERNEL_STATUS_VOCAB_PRESENT"
else
  fail "KERNEL_STATUS_VOCAB_MISSING"
fi

echo "SUMMARY: FAIL=$FAIL"
if [[ "$FAIL" -ne 0 ]]; then
  exit 1
fi
