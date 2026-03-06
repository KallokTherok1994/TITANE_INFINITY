#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"

FAIL=0

pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAIL=1; }

# Required layer anchors
for p in \
  .github/copilot-instructions.md \
  .github/instructions \
  .github/agents \
  .github/prompts \
  governance/layer_priority.yaml; do
  if [[ -e "$p" ]]; then
    pass "LAYER_ANCHOR_PRESENT $p"
  else
    fail "LAYER_ANCHOR_MISSING $p"
  fi
done

# Local AGENTS required for L3
for p in src/AGENTS.md src-tauri/AGENTS.md e2e/AGENTS.md docs/AGENTS.md scripts/AGENTS.md; do
  if [[ -f "$p" ]]; then
    pass "L3_LOCAL_AGENTS_PRESENT $p"
  else
    fail "L3_LOCAL_AGENTS_MISSING $p"
  fi
done

# Lower layers must not redefine exact PROD tokens
if rg -n "GO_FOR_PROD_BUILD__TITANE_INFINITY|GO_FOR_PROD_DEPLOY__TITANE_INFINITY" -S .github/instructions .github/agents .github/prompts >/dev/null 2>&1; then
  fail "LOWER_LAYER_REDEFINES_PROD_TOKEN"
else
  pass "LOWER_LAYER_NO_PROD_TOKEN_REDEFINITION"
fi

# Lower layers must not redefine status vocabulary canonical phrase
if rg -n "PASS / FAIL / BLOCKED" -S .github/instructions .github/agents .github/prompts >/dev/null 2>&1; then
  fail "LOWER_LAYER_REDEFINES_STATUS_VOCAB"
else
  pass "LOWER_LAYER_NO_STATUS_REDEFINITION"
fi

# Layer policy must declare unresolved conflict behavior
if rg -n "unresolved_conflict_status:\s*BLOCKED_DOCTRINE" -S governance/layer_priority.yaml >/dev/null 2>&1; then
  pass "LAYER_POLICY_BLOCKED_DOCTRINE"
else
  fail "LAYER_POLICY_MISSING_BLOCKED_DOCTRINE"
fi

echo "SUMMARY: FAIL=$FAIL"
if [[ "$FAIL" -ne 0 ]]; then
  exit 1
fi
