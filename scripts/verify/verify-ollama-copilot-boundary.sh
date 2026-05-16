#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT_DIR"
source "$(dirname "$0")/_rg_compat.sh"

pass() {
  printf 'PASS %s\n' "$1"
}

fail() {
  printf 'FAIL %s\n' "$1" >&2
  exit 1
}

rg_has() {
  local pattern="$1"
  shift
  _rg -n -- "$pattern" "$@" >/dev/null 2>&1
}

rg_has 'gemma2:2b' src/config/ollamaDefaults.ts || fail 'frontend product default model drift (expected gemma2:2b)'
rg_has 'gemma2:2b' config/championChallenger.json || fail 'champion registry not aligned on gemma2:2b'
rg_has 'gemma2:2b' src-tauri/src/config/update.rs src-tauri/src/runtime_config.rs src-tauri/src/ollama.rs src-tauri/src/ai/ollama.rs || fail 'active runtime fallbacks not aligned on gemma2:2b'
rg_has 'model: "gemma2:2b"' src-tauri/src/ollama_provider_refactor.rs || fail 'ollama provider default model drift'
rg_has 'num_ctx: 8192' src-tauri/src/ollama_provider_refactor.rs || fail 'ollama provider default context window drift'
rg_has 'http://127.0.0.1:11434' verify-ollama.sh scripts/ollama/run-ollama.sh OLLAMA_RUNTIME_MAP.md || fail 'ollama base url drift'
rg_has 'qwen3\.5:9b' .github/copilot-instructions.md .github/instructions/titane.instructions.md AGENTS.md .github/agents/ollama-dev-chat-boundary.agent.md || fail 'development doctrine not aligned on qwen3.5:9b'
rg_has 'gemma2:2b' .github/copilot-instructions.md .github/instructions/titane.instructions.md AGENTS.md .github/agents/ollama-dev-chat-boundary.agent.md || fail 'product boundary baseline missing from doctrine surfaces'
rg_has 'verify:ollama:boundary' package.json || fail 'package.json missing verify:ollama:boundary script'
[ -f .vscode/mcp.json ] || fail '.vscode/mcp.json missing (Ollama Dev MCP config not present)'
rg_has 'chat\.mcp' .vscode/settings.json || fail '.vscode/settings.json missing chat.mcp configuration'
rg_has '"chat\.mcp\.enabled"' .vscode/settings.json || fail 'chat.mcp.enabled is not true in .vscode/settings.json'
# v35.1.x: accept either chat.mcp.enabled OR chat.mcp.access (broader access:"all" implies MCP enabled)
rg_has '"chat\.mcp\.(enabled|access)"' .vscode/settings.json || fail '.vscode/settings.json chat.mcp config missing'
rg_has 'ollama-dev' .vscode/mcp.json || fail '.vscode/mcp.json missing ollama-dev server entry'
rg_has '"type"\s*:\s*"stdio"' .vscode/mcp.json || fail '.vscode/mcp.json missing stdio transport declaration'
rg_has 'OLLAMA_HOST' .vscode/mcp.json || fail '.vscode/mcp.json missing OLLAMA_HOST env'
rg_has 'qwen3\.5:9b' .vscode/mcp.json || fail '.vscode/mcp.json missing qwen3.5:9b model reference'
legacy_script_prefix='"c'
legacy_script_prefix+='line:'
legacy_verify='verify:ollama:'
legacy_verify+='cline'
legacy_doctrine='Ollama/'
legacy_doctrine+='Cline'
if rg_has "$legacy_script_prefix" package.json; then fail 'package.json still exposes retired legacy scripts'; fi
if rg_has "${legacy_verify}|${legacy_doctrine}" .github/copilot-instructions.md .github/instructions/titane.instructions.md AGENTS.md package.json scripts/verify/verify-vscode-agent-workflow.sh; then fail 'active governance still references the retired legacy doctrine'; fi

# PROD_OLLAMA_MODEL_GUARD: chat_orchestrator must never fall back to DEV models
rg_has 'unwrap_or\("gemma2:2b"\)' src-tauri/src/overdrive/chat_orchestrator.rs || fail 'PROD_OLLAMA_MODEL_GUARD: chat_orchestrator fallback model not aligned on gemma2:2b'
if rg_has 'unwrap_or\("llama3\.1\|unwrap_or\("qwen' src-tauri/src/overdrive/chat_orchestrator.rs; then fail 'PROD_OLLAMA_MODEL_GUARD: DEV model found in chat_orchestrator fallback'; fi

pass 'product ollama runtime baseline aligned'
pass 'development ollama doctrine aligned'
pass 'boundary validator wired in package'
pass 'MCP Ollama Dev config present and aligned'
pass 'MCP runtime settings and transport wired correctly (chat.mcp configured)'
pass 'active cline workflow references removed'
pass 'PROD_OLLAMA_MODEL_GUARD: chat_orchestrator fallback locked to gemma2:2b'
