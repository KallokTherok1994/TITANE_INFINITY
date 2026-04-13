#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"
source "$(dirname "${BASH_SOURCE[0]}")/_rg_compat.sh"

FAIL=0
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAIL=1; }

check_rule() {
  local id="$1"
  local pattern="$2"
  local canonical="$3"

  local hits
  hits=$(_rg -n "$pattern" -S .github/copilot-instructions.md .github/instructions .github/agents .github/prompts 2>/dev/null || true)
  if [[ -z "$hits" ]]; then
    fail "$id missing from instruction layers"
    return
  fi

  local outside
  outside=$(printf '%s\n' "$hits" | grep -v "^$canonical:" || true)
  if [[ -n "$outside" ]]; then
    fail "$id duplicated outside canonical home ($canonical)"
    printf '%s\n' "$outside"
  else
    pass "$id canonical-only"
  fi
}

check_rule "status-vocabulary" "PASS / FAIL / BLOCKED" ".github/copilot-instructions.md"
check_rule "autoheal-canonical-path" "scripts/autoheal/autoheal_rules.jsonl" ".github/copilot-instructions.md"

echo "SUMMARY: FAIL=$FAIL"
if [[ "$FAIL" -ne 0 ]]; then
  exit 1
fi
