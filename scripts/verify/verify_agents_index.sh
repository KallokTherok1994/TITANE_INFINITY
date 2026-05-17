#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"
source "$(dirname "${BASH_SOURCE[0]}")/_rg_compat.sh"

FAIL=0
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAIL=1; }

required=(
  .github/agents/anti-regression-guardian.agent.md
  .github/agents/architect-guardian.agent.md
  .github/agents/audit-subagent.agent.md
  .github/agents/dependency-guardian.agent.md
  .github/agents/docs-registry.agent.md
  .github/agents/e2e-authority.agent.md
  .github/agents/implement-subagent.agent.md
  .github/agents/memory-architecture-master.agent.md
  .github/agents/memory-backend-master.agent.md
  .github/agents/memory-explainability-analyst.agent.md
  .github/agents/memory-frontend-master.agent.md
  .github/agents/memory-graph-relations.agent.md
  .github/agents/memory-migration-analyst.agent.md
  .github/agents/memory-orchestrator.agent.md
  .github/agents/memory-qa-ops-master.agent.md
  .github/agents/memory-regression-authority.agent.md
  .github/agents/memory-release-validator.agent.md
  .github/agents/memory-root-commander.agent.md
  .github/agents/memory-schema-analyst.agent.md
  .github/agents/ollama-dev-chat-boundary.agent.md
  .github/agents/pre-build-certifier.agent.md
  .github/agents/temporal-modules.agent.md
  .github/agents/release-proof.agent.md
  .github/agents/review-subagent.agent.md
  .github/agents/tauri-safety.agent.md
  .github/agents/test-autofix.agent.md
  .github/agents/titane-conductor.agent.md
  .github/agents/tool-selector-panel.agent.md
)

for f in "${required[@]}"; do
  if [[ -f "$f" ]]; then
    pass "AGENT_PRESENT $f"
  else
    fail "AGENT_MISSING $f"
  fi
done

if _rg -n "^name:" -S .github/agents/*.agent.md >/dev/null 2>&1; then
  pass "AGENT_FRONTMATTER_NAMES_PRESENT"
else
  fail "AGENT_FRONTMATTER_NAMES_MISSING"
fi

echo "SUMMARY: FAIL=$FAIL"
if [[ "$FAIL" -ne 0 ]]; then
  exit 1
fi
