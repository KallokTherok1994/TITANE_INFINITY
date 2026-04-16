#!/usr/bin/env bash
# verify-agent-tooling.sh
# Guard: .github/agents/*.agent.md must not instruct npm or npx commands.
# Repo enforces pnpm-only (engine-strict=true, packageManager field).
# Any npm/npx reference in agent runbooks causes tooling drift.
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"
source "$(dirname "${BASH_SOURCE[0]}")/_rg_compat.sh"

FAIL=0
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAIL=1; }

AGENTS_DIR=".github/agents"

# Forbidden commands in agent runbooks: bare npm/npx (not part of a URL or comment).
# Pattern: word-boundary npm or npx followed by space or end-of-line.
forbidden_hits=$(_rg -n '\bnpm\s|\bnpx\s' -S "$AGENTS_DIR" 2>/dev/null || true)

if [[ -n "$forbidden_hits" ]]; then
  fail "AGENT_USES_FORBIDDEN_NPM_NPX (use pnpm/corepack instead)"
  printf '%s\n' "$forbidden_hits"
else
  pass "AGENT_NO_FORBIDDEN_NPM_NPX"
fi

# Guard: .github/copilot-agents/ is LEGACY and must not be referenced as authority
# in any governed instruction files.
legacy_hits=$(_rg -n "copilot-agents/" -S \
  .github/copilot-instructions.md \
  .github/instructions \
  .github/agents \
  .github/prompts \
  governance 2>/dev/null || true)

if [[ -n "$legacy_hits" ]]; then
  fail "LEGACY_COPILOT_AGENTS_REFERENCED_AS_AUTHORITY"
  printf '%s\n' "$legacy_hits"
else
  pass "LEGACY_COPILOT_AGENTS_NOT_REFERENCED_AS_AUTHORITY"
fi

echo "SUMMARY: FAIL=$FAIL"
if [[ "$FAIL" -ne 0 ]]; then
  exit 1
fi
