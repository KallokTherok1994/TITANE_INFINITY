#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"

FAIL=0
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAIL=1; }

required=(
  .github/prompts/audit-instructions.prompt.md
  .github/prompts/fix-instructions-drift.prompt.md
  .github/prompts/update-mapping.prompt.md
  .github/prompts/run-proof-pack.prompt.md
  .github/prompts/release-readiness.prompt.md
  .github/prompts/contradiction-resolution.prompt.md
  .github/prompts/temporal-modules.prompt.md
  .github/prompts/simple-fast-session.prompt.md
  .github/prompts/heavy-runtime-session.prompt.md
  .github/prompts/ollama-dev-session.prompt.md
  .github/prompts/session-router.prompt.md
  .github/prompts/start-hybrid-memory-dispatch.prompt.md
  .github/prompts/autopilot-lock-runner.prompt.md
)

for f in "${required[@]}"; do
  if [[ -f "$f" ]]; then
    pass "PROMPT_PRESENT $f"
  else
    fail "PROMPT_MISSING $f"
  fi
done

# Frontmatter field validation: every required prompt must declare mode: and description:
for f in "${required[@]}"; do
  if [[ ! -f "$f" ]]; then continue; fi
  if grep -q '^description:[[:space:]]' "$f" 2>/dev/null; then
    pass "PROMPT_FRONTMATTER_DESCRIPTION ${f##*/}"
  else
    fail "PROMPT_FRONTMATTER_DESCRIPTION_MISSING ${f##*/}"
  fi
  if grep -q '^mode:[[:space:]]' "$f" 2>/dev/null; then
    pass "PROMPT_FRONTMATTER_MODE ${f##*/}"
  else
    fail "PROMPT_FRONTMATTER_MODE_MISSING ${f##*/}"
  fi
done

# Prompt-agent delegation marker guard.
# Prompts that drive a specialist agent must declare it explicitly with the
# canonical marker: > **Agent**: invoke <agent-name> for this session.
# Add entries here when a new agent-driven prompt is identified and fixed.
# Scaling note: marker + validator array sufficient while agent-driven prompts <= 4 and no multi-agent collisions.
# At 5+ entries or any multi-agent collision, add a human-visible mapping table to .github/prompts/OWNERSHIP.md.
declare -A AGENT_DRIVEN_PROMPTS=(
  [".github/prompts/release-readiness.prompt.md"]="release-proof"
  [".github/prompts/temporal-modules.prompt.md"]="temporal-modules"
  [".github/prompts/start-hybrid-memory-dispatch.prompt.md"]="memory-root-commander"
)
for f in "${!AGENT_DRIVEN_PROMPTS[@]}"; do
  if grep -q '> \*\*Agent\*\*:' "$f" 2>/dev/null; then
    pass "PROMPT_AGENT_MARKER_PRESENT ${f##*/}"
  else
    fail "PROMPT_AGENT_MARKER_MISSING ${f##*/} (must declare agent: ${AGENT_DRIVEN_PROMPTS[$f]})"
  fi
done

echo "SUMMARY: FAIL=$FAIL"
if [[ "$FAIL" -ne 0 ]]; then
  exit 1
fi
