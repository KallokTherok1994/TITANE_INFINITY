#!/usr/bin/env bash
set -euo pipefail

echo "[STACK] Worktree"
git status --short

echo "[STACK] MCP security"
pnpm run verify:mcp:security

echo "[STACK] Live Ollama Dev"
pnpm run verify:ollama:dev:live

echo "[STACK] Static boundary"
pnpm run verify:ollama:boundary

echo "[STACK] Cross-router unification (VSCode / Cline / Total Dev / Console)"
bash scripts/dev/ollama-dev-verify.sh --router=all

echo "[STACK] Performance smoke"
pnpm run verify:ollama:dev:performance

echo "[STACK] Config tests"
pnpm vitest run tests/unit/scripts/ollamaDevConfig.test.ts

echo "[STACK] Boundary doctrine tests"
pnpm vitest run tests/unit/scripts/ollamaBoundaryDoctrine.test.ts tests/unit/scripts/ollamaDevLiveScript.test.ts

echo "[STACK] Cross-router test suite (6 lanes, 35+ checks)"
pnpm vitest run tests/unit/scripts/ollamaDevAllRouters.test.ts

echo "[STACK] Agent stack"
pnpm run audit:agents:stack

echo "[STACK] AutoHeal"
bash scripts/autoheal/detect_recurrence.sh

echo "[STACK] Global awareness"
if ! bash scripts/verify/verify-ollama-dev-global-awareness.sh; then
  echo "INFO: GLOBAL_REPO_GATES_FAIL_UNKNOWN reported outside scoped seal"
fi

echo "PASS: OLLAMA_DEV_STACK_CERTIFIED"
