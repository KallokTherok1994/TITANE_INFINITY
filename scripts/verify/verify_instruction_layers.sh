#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"
source "$(dirname "${BASH_SOURCE[0]}")/_rg_compat.sh"

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

# Lower layers must not redefine BUILD ALL command rule
if _rg -n "BUILD ALL.*command|command.*BUILD ALL" -S .github/instructions .github/agents .github/prompts >/dev/null 2>&1; then
  fail "LOWER_LAYER_REDEFINES_BUILD_ALL_RULE"
else
  pass "LOWER_LAYER_NO_BUILD_ALL_REDEFINITION"
fi

# Lower layers must not redefine status vocabulary canonical phrase
if _rg -n "PASS / FAIL / BLOCKED" -S .github/instructions .github/agents .github/prompts >/dev/null 2>&1; then
  fail "LOWER_LAYER_REDEFINES_STATUS_VOCAB"
else
  pass "LOWER_LAYER_NO_STATUS_REDEFINITION"
fi

# Layer policy must declare unresolved conflict behavior
if _rg -n "unresolved_conflict_status:\s*BLOCKED_DOCTRINE" -S governance/layer_priority.yaml >/dev/null 2>&1; then
  pass "LAYER_POLICY_BLOCKED_DOCTRINE"
else
  fail "LAYER_POLICY_MISSING_BLOCKED_DOCTRINE"
fi

# Rule 11 anti-contradiction: no prompt/agent must require a token gate for PROD
if _rg -n "exact token requirements" -S .github/prompts .github/agents >/dev/null 2>&1; then
  fail "RULE11_TOKEN_GATE_LANGUAGE_IN_PROMPTS_OR_AGENTS"
else
  pass "RULE11_NO_TOKEN_GATE_CONTRADICTION"
fi

# Legacy isolation: .github/copilot-agents/ must not be referenced as authority
# in any governed instruction/agent/prompt file.
if _rg -n "copilot-agents/" -S \
   .github/copilot-instructions.md \
   .github/instructions \
   .github/agents \
   .github/prompts \
   governance >/dev/null 2>&1; then
  fail "LEGACY_COPILOT_AGENTS_REFERENCED_AS_AUTHORITY"
else
  pass "LEGACY_COPILOT_AGENTS_ISOLATED"
fi

echo "SUMMARY: FAIL=$FAIL"
if [[ "$FAIL" -ne 0 ]]; then
  exit 1
fi
