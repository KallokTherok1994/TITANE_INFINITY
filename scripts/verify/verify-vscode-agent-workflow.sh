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

echo "SUMMARY: FAIL=$FAIL"
if [[ "$FAIL" -ne 0 ]]; then
  exit 1
fi