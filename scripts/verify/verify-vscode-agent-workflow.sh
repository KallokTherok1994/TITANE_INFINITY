#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"
source "$(dirname "${BASH_SOURCE[0]}")/_rg_compat.sh"

FAIL=0
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAIL=1; }

require_pattern() {
  local id="$1"
  local pattern="$2"
  shift 2
  if _rg -n -- "$pattern" "$@" >/dev/null 2>&1; then
    pass "$id"
  else
    fail "$id"
  fi
}

require_all_patterns() {
  local id="$1"
  local file="$2"
  shift 2
  local pattern
  for pattern in "$@"; do
    if ! _rg -n -- "$pattern" "$file" >/dev/null 2>&1; then
      fail "$id file=$file missing=$pattern"
      return
    fi
  done
  pass "$id"
}

require_file() {
  local id="$1"
  local file="$2"
  if [[ -f "$file" ]]; then
    pass "$id"
  else
    fail "$id"
  fi
}

require_file "VSCODE_TASKS_PRESENT" ".vscode/tasks.json"
require_file "VSCODE_EXTENSIONS_PRESENT" ".vscode/extensions.json"
require_file "PACKAGE_JSON_PRESENT" "package.json"
require_file "DOCS_DEV_FR_PRESENT" "docs/dev/fr/README.md"

require_pattern "VSCODE_RECOMMENDS_COPILOT_CHAT" 'github\.copilot-chat' .vscode/extensions.json
require_pattern "VSCODE_RECOMMENDS_GITHUB_PR" 'github\.vscode-pull-request-github' .vscode/extensions.json
require_pattern "VSCODE_RECOMMENDS_RUST_ANALYZER" 'rust-lang\.rust-analyzer' .vscode/extensions.json
require_pattern "VSCODE_RECOMMENDS_TAURI" 'tauri-apps\.tauri-vscode' .vscode/extensions.json
require_pattern "VSCODE_RECOMMENDS_PLAYWRIGHT" 'ms-playwright\.playwright' .vscode/extensions.json

require_pattern "VSCODE_BLOCKS_CLAUDE_DEV" 'saoudrizwan\.claude-dev' .vscode/extensions.json
require_pattern "VSCODE_BLOCKS_OPENAI_CHATGPT" 'openai\.chatgpt' .vscode/extensions.json
require_pattern "VSCODE_BLOCKS_ANTHROPIC" 'anthropic\.claude-code' .vscode/extensions.json

require_pattern "TASK_COPILOT_XS_VALIDATE_PRESENT" '🧩 COPILOT-XS: Validate' .vscode/tasks.json
require_pattern "TASK_AGENT_AUDIT_PRESENT" '🤖 Audit: Advanced Agents' .vscode/tasks.json
require_pattern "TASK_AGENT_WORKFLOW_PRESENT" '🤖 Audit: Agent Workflow' .vscode/tasks.json
require_pattern "TASK_AGENT_STACK_PRESENT" '🤖 Audit: Agent Stack' .vscode/tasks.json
require_pattern "TASK_BUNDLED_PNPM_PRESENT" '\./\.tools/node/current/bin/pnpm' .vscode/tasks.json

require_pattern "PKG_VERIFY_INSTRUCTIONS_PRESENT" '"verify:instructions"' package.json
require_pattern "PKG_CLINE_VERIFY_PRESENT" '"cline:verify"' package.json
require_pattern "PKG_COPILOT_VALIDATE_PRESENT" '"copilot-xs:validate"' package.json
require_pattern "PKG_SYNC_MAPPING_PRESENT" '"sync:mapping"' package.json
require_pattern "PKG_TEST_ARCH_PRESENT" '"test:architecture"' package.json
require_pattern "PKG_VERIFY_ADVANCED_AGENTS_PRESENT" '"verify:agents:advanced"' package.json
require_pattern "PKG_VERIFY_AGENT_WORKFLOW_PRESENT" '"verify:agents:workflow"' package.json
require_pattern "PKG_AUDIT_AGENT_STACK_PRESENT" '"audit:agents:stack"' package.json

require_all_patterns \
  "TITANE_SCOPED_DELEGATION_FALLBACK_PRESENT" \
  ".github/instructions/titane.instructions.md" \
  "custom agent, specialist delegation, or exploration-oriented handoff" \
  "canonical local discovery or evidence collection" \
  "classify the delegation gap honestly"

require_all_patterns \
  "HYBRID_MEMORY_DISPATCH_EXPLORE_QUOTA_FALLBACK_PRESENT" \
  ".github/instructions/hybrid-memory-dispatch.instructions.md" \
  "Explore weekly quota failures" \
  "canonical local discovery" \
  "search_subagent"

require_all_patterns \
  "SIMPLE_SESSION_EXPLORE_QUOTA_FALLBACK_PRESENT" \
  ".github/prompts/simple-fast-session.prompt.md" \
  "Explore is unavailable because of quota" \
  "canonical local discovery" \
  "search_subagent"

require_all_patterns \
  "HEAVY_SESSION_EXPLORE_QUOTA_FALLBACK_PRESENT" \
  ".github/prompts/heavy-runtime-session.prompt.md" \
  "Explore is unavailable because of quota" \
  "external platform limit" \
  "search_subagent"

require_all_patterns \
  "HYBRID_MEMORY_PROMPT_EXPLORE_QUOTA_FALLBACK_PRESENT" \
  ".github/prompts/start-hybrid-memory-dispatch.prompt.md" \
  "Explore quota" \
  "canonical local discovery" \
  "search_subagent"

require_all_patterns \
  "RELEASE_READINESS_SPECIALIST_FALLBACK_PRESENT" \
  ".github/prompts/release-readiness.prompt.md" \
  "release-proof" \
  "canonical local release evidence checks" \
  "external truth"

require_all_patterns \
  "TITANE_CONDUCTOR_EXPLORE_QUOTA_FALLBACK_PRESENT" \
  ".github/agents/titane-conductor.agent.md" \
  "quota Explore" \
  "discovery locale canonique" \
  "search_subagent"

require_all_patterns \
  "MEMORY_ROOT_COMMANDER_SPECIALIST_FALLBACK_PRESENT" \
  ".github/agents/memory-root-commander.agent.md" \
  "delegated specialist handoff is unavailable" \
  "canonical local truth collection" \
  "declaring BLOCKED"

require_all_patterns \
  "MEMORY_ORCHESTRATOR_SPECIALIST_FALLBACK_PRESENT" \
  ".github/agents/memory-orchestrator.agent.md" \
  "delegated master is unavailable" \
  "canonical local truth collection" \
  "before escalating"

echo "SUMMARY: FAIL=$FAIL"
if [[ "$FAIL" -ne 0 ]]; then
  exit 1
fi