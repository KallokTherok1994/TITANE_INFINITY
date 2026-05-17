#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"

FAIL=0
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAIL=1; }

require_file() {
  local id="$1"
  local file="$2"
  [[ -f "$file" ]] && pass "$id" || { fail "$id missing=$file"; return; }
}

require_pattern() {
  local id="$1"
  local file="$2"
  local pattern="$3"
  if [[ ! -f "$file" ]]; then
    fail "$id missing_file=$file"
    return
  fi
  if grep -qiE "$pattern" "$file"; then
    pass "$id"
  else
    fail "$id missing_pattern=$pattern file=$file"
  fi
}

require_file "PRE_BUILD_AGENT_PRESENT" ".github/agents/pre-build-certifier.agent.md"
require_file "PRE_BUILD_PROMPT_PRESENT" ".github/prompts/pre-build-certification.prompt.md"

require_pattern "KERNEL_RULE_14_1" ".github/copilot-instructions.md" "Rule 14\\.1|PRE-BUILD CERTIFIER"
require_pattern "KERNEL_BUILD_ALLOWED" ".github/copilot-instructions.md" "BUILD_ALLOWED=YES"
require_pattern "KERNEL_DEV_TAURI" ".github/copilot-instructions.md" "pnpm run dev:tauri"
require_pattern "KERNEL_DEVTOOLS" ".github/copilot-instructions.md" "DevTools|Console"
require_pattern "KERNEL_HTTP_NETWORK" ".github/copilot-instructions.md" "HTTP|Network"
require_pattern "KERNEL_AUTOHEAL" ".github/copilot-instructions.md" "AutoHeal"
require_pattern "KERNEL_PROOF_PACK" ".github/copilot-instructions.md" "proof pack"
require_pattern "KERNEL_NO_BUILD" ".github/copilot-instructions.md" "No build before proof|BUILD ALL.*forbidden|BUILD ALL.*blocked"

require_pattern "FRONTEND_GATE" ".github/instructions/frontend.instructions.md" "console.error|console.warn|HTTP|Network|visible UI"
require_pattern "TAURI_GATE" ".github/instructions/tauri.instructions.md" "dev:tauri|IPC|Tauri|network"
require_pattern "E2E_GATE" ".github/instructions/tests-e2e.instructions.md" "pageerror|requestfailed|response|console"
require_pattern "TITANE_CROSS_RING" ".github/instructions/titane.instructions.md" "Cross-Ring Pre-BUILD|PATH_HEAVY|BUILD_ALLOWED"

require_pattern "AGENT_NAME" ".github/agents/pre-build-certifier.agent.md" "name: pre-build-certifier"
require_pattern "AGENT_MATRIX" ".github/agents/pre-build-certifier.agent.md" "BUILD_PERMISSION_MATRIX"
require_pattern "AGENT_LIFECYCLE" ".github/agents/pre-build-certifier.agent.md" "DISCOVER.*CERTIFY.*FIX.*RE-CERTIFY.*BUILD_PERMISSION"
require_pattern "AGENT_DEVTOOLS" ".github/agents/pre-build-certifier.agent.md" "DEVTOOLS_CONSOLE"
require_pattern "AGENT_HTTP" ".github/agents/pre-build-certifier.agent.md" "HTTP_NETWORK"
require_pattern "AGENT_BLOCKS_BUILD" ".github/agents/pre-build-certifier.agent.md" "BUILD_ALLOWED=NO|Do not build"

require_pattern "PROMPT_USES_AGENT" ".github/prompts/pre-build-certification.prompt.md" "pre-build-certifier"
require_pattern "PROMPT_BLOCKS_BUILD" ".github/prompts/pre-build-certification.prompt.md" "BUILD_ALLOWED=YES|No build"

if [[ "$FAIL" -ne 0 ]]; then
  echo "G_PRE_BUILD_CERTIFIER_AGENT=FAIL"
  exit 1
fi

echo "G_PRE_BUILD_CERTIFIER_AGENT=PASS"
