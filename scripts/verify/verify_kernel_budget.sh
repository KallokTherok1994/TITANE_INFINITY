#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"
source "$(dirname "${BASH_SOURCE[0]}")/_rg_compat.sh"

KERNEL=.github/copilot-instructions.md
FAIL=0
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAIL=1; }

if [[ ! -f "$KERNEL" ]]; then
  fail "KERNEL_MISSING"
  exit 1
fi

line_count=$(wc -l < "$KERNEL" | tr -d ' ')
if [[ "$line_count" -le 220 ]]; then
  pass "KERNEL_LINE_BUDGET line_count=$line_count"
else
  fail "KERNEL_LINE_BUDGET_EXCEEDED line_count=$line_count"
fi

rule_count=$(_rg -n '^## Rule [0-9]+' -S "$KERNEL" | wc -l | tr -d ' ')
if [[ "$rule_count" -ge 10 && "$rule_count" -le 15 ]]; then
  pass "KERNEL_RULE_BUDGET rule_count=$rule_count"
else
  fail "KERNEL_RULE_BUDGET_OUT_OF_RANGE rule_count=$rule_count"
fi

for token in "GO_FOR_PROD_BUILD__TITANE_INFINITY" "GO_FOR_PROD_DEPLOY__TITANE_INFINITY" "Tauri-only" "4-Ring" "Stop-the-line"; do
  if _rg -n "$token" -S "$KERNEL" >/dev/null 2>&1; then
    pass "KERNEL_TOKEN_PRESENT $token"
  else
    fail "KERNEL_TOKEN_MISSING $token"
  fi
done

echo "SUMMARY: FAIL=$FAIL"
if [[ "$FAIL" -ne 0 ]]; then
  exit 1
fi
