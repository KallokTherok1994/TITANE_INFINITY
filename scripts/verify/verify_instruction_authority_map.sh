#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"
source "$(dirname "${BASH_SOURCE[0]}")/_rg_compat.sh"

FAIL=0
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAIL=1; }

# Required artifacts and anchors
for p in \
  docs/governance/INSTRUCTION_AUTHORITY_MAP.md \
  governance/layer_priority.yaml \
  .github/copilot-instructions.md \
  .github/instructions \
  .github/agents \
  .github/prompts \
  scripts/verify; do
  if [[ -e "$p" ]]; then
    pass "AUTHORITY_ANCHOR_PRESENT $p"
  else
    fail "AUTHORITY_ANCHOR_MISSING $p"
  fi
done

# Local AGENTS required for layer map completeness
for p in src/AGENTS.md src-tauri/AGENTS.md e2e/AGENTS.md docs/AGENTS.md scripts/AGENTS.md; do
  if [[ -f "$p" ]]; then
    pass "LOCAL_AGENT_FILE_PRESENT $p"
  else
    fail "LOCAL_AGENT_FILE_MISSING $p"
  fi
done

# Content checks for the instruction authority map
for token in L1 L2 L3 L4 L5 L6 BLOCKED_DOCTRINE; do
  if _rg -n "$token" docs/governance/INSTRUCTION_AUTHORITY_MAP.md >/dev/null 2>&1; then
    pass "INSTRUCTION_AUTHORITY_MAP_INCLUDES_$token"
  else
    fail "INSTRUCTION_AUTHORITY_MAP_MISSING_$token"
  fi
done

if _rg -n "governance/layer_priority.yaml" docs/governance/INSTRUCTION_AUTHORITY_MAP.md >/dev/null 2>&1; then
  pass "INSTRUCTION_AUTHORITY_MAP_REFERENCES_LAYER_PRIORITY"
else
  fail "INSTRUCTION_AUTHORITY_MAP_MISSING_LAYER_PRIORITY_REFERENCE"
fi

if _rg -i -n "token gate|GO_FOR_PROD|PROD_BUILD|PROD_DEPLOY" .github/instructions .github/agents .github/prompts >/dev/null 2>&1; then
  fail "LEGACY_PROD_TOKEN_GATE_REFERENCED_IN_LOWER_LAYERS"
else
  pass "NO_LEGACY_PROD_TOKEN_GATE_IN_LOWER_LAYERS"
fi

if _rg -i -n "archived.*proof|proof.*archived|proof_packs|proof packs" docs/governance/INSTRUCTION_AUTHORITY_MAP.md >/dev/null 2>&1; then
  fail "INSTRUCTION_AUTHORITY_MAP_REFERENCES_ARCHIVED_PROOF_PACKS"
else
  pass "INSTRUCTION_AUTHORITY_MAP_NO_ARCHIVED_PROOF_PACKS"
fi

if bash scripts/verify/verify_instruction_layers.sh >/dev/null 2>&1; then
  pass "EXISTING_LAYER_VALIDATOR_REUSE"
else
  fail "EXISTING_LAYER_VALIDATOR_FAILED_OR_MISSING"
fi

if [[ "$FAIL" -ne 0 ]]; then
  echo "SUMMARY: FAIL=$FAIL"
  exit 1
fi

echo "SUMMARY: PASS=ALL"
