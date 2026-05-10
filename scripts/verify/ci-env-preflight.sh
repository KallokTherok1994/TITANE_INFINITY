#!/usr/bin/env bash
# CI Environment Diagnostic Pre-Flight Check
# Runs before verify_instructions to capture environment state for debugging

set -euo pipefail

echo "=== [CI_ENV_DIAG] GitHub Actions Environment Pre-Flight ===" >&2

# Environment info
echo "[CI_ENV_DIAG] Runner OS: $(uname -s)" >&2
echo "[CI_ENV_DIAG] Node version: $(node --version 2>/dev/null || echo 'N/A')" >&2
echo "[CI_ENV_DIAG] Bash version: $BASH_VERSION" >&2

# Tool availability
echo "[CI_ENV_DIAG] ripgrep: $(command -v rg 2>/dev/null || echo 'NOT_FOUND')" >&2
echo "[CI_ENV_DIAG] grep: $(command -v grep 2>/dev/null || echo 'NOT_FOUND')" >&2

# Key files status
echo "[CI_ENV_DIAG] .github/copilot-instructions.md: $(test -f .github/copilot-instructions.md && echo 'OK' || echo 'MISSING')" >&2
echo "[CI_ENV_DIAG] .github/instructions/titane.instructions.md: $(test -f .github/instructions/titane.instructions.md && echo 'OK' || echo 'MISSING')" >&2

# Verify shim status
if source scripts/verify/_rg_compat.sh 2>/dev/null; then
  echo "[CI_ENV_DIAG] _rg_compat.sh: SOURCED_OK" >&2
  if declare -f _rg >/dev/null 2>&1; then
    echo "[CI_ENV_DIAG] _rg function: AVAILABLE" >&2
  else
    echo "[CI_ENV_DIAG] _rg function: NOT_FOUND after source" >&2
  fi
else
  echo "[CI_ENV_DIAG] _rg_compat.sh: SOURCE_FAILED" >&2
fi

# Test validators in isolation with diagnostics
echo "[CI_ENV_DIAG] Testing verify-vscode-agent-workflow.sh..." >&2
if timeout 10 bash scripts/verify/verify-vscode-agent-workflow.sh > /tmp/vscode_workflow.out 2>&1; then
  echo "[CI_ENV_DIAG] verify-vscode-agent-workflow.sh: PASS ($(grep -c '^PASS:' /tmp/vscode_workflow.out || echo '0') checks)" >&2
else
  echo "[CI_ENV_DIAG] verify-vscode-agent-workflow.sh: FAIL (exit $?)" >&2
  echo "[CI_ENV_DIAG] Last 10 lines of output:" >&2
  tail -10 /tmp/vscode_workflow.out | sed 's/^/  [CI_ENV_DIAG] /' >&2
fi

echo "[CI_ENV_DIAG] Testing verify-ollama-copilot-boundary.sh..." >&2
if timeout 10 bash scripts/verify/verify-ollama-copilot-boundary.sh > /tmp/ollama_boundary.out 2>&1; then
  echo "[CI_ENV_DIAG] verify-ollama-copilot-boundary.sh: PASS" >&2
else
  echo "[CI_ENV_DIAG] verify-ollama-copilot-boundary.sh: FAIL (exit $?)" >&2
  echo "[CI_ENV_DIAG] Last 10 lines of output:" >&2
  tail -10 /tmp/ollama_boundary.out | sed 's/^/  [CI_ENV_DIAG] /' >&2
fi

echo "[CI_ENV_DIAG] Pre-flight complete" >&2
