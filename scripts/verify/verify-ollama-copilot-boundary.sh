#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT_DIR"

pass() {
  printf 'PASS %s\n' "$1"
}

fail() {
  printf 'FAIL %s\n' "$1" >&2
  exit 1
}

rg -q 'gemma2:2b' src/config/ollamaDefaults.ts || fail 'frontend product default model drift (expected gemma2:2b)'
rg -q 'gemma2:2b' config/championChallenger.json || fail 'champion registry not aligned on gemma2:2b'
rg -q 'gemma2:2b' src-tauri/src/config/update.rs src-tauri/src/runtime_config.rs src-tauri/src/ollama.rs src-tauri/src/ai/ollama.rs || fail 'active runtime fallbacks not aligned on gemma2:2b'
rg -q 'model: "gemma2:2b"' src-tauri/src/ollama_provider_refactor.rs || fail 'ollama provider default model drift'
rg -q 'num_ctx: 8192' src-tauri/src/ollama_provider_refactor.rs || fail 'ollama provider default context window drift'
rg -q 'http://127.0.0.1:11434' verify-ollama.sh scripts/ollama/run-ollama.sh OLLAMA_RUNTIME_MAP.md || fail 'ollama base url drift'
rg -q 'qwen3\.5:9b' .github/copilot-instructions.md .github/instructions/titane.instructions.md AGENTS.md .github/agents/ollama-dev-chat-boundary.agent.md || fail 'development doctrine not aligned on qwen3.5:9b'
rg -q 'gemma2:2b' .github/copilot-instructions.md .github/instructions/titane.instructions.md AGENTS.md .github/agents/ollama-dev-chat-boundary.agent.md || fail 'product boundary baseline missing from doctrine surfaces'
rg -q 'verify:ollama:boundary' package.json || fail 'package.json missing verify:ollama:boundary script'
[ -f .vscode/mcp.json ] || fail '.vscode/mcp.json missing (Ollama Dev MCP config not present)'
rg -q 'ollama-dev' .vscode/mcp.json || fail '.vscode/mcp.json missing ollama-dev server entry'
rg -q 'qwen3\.5:9b' .vscode/mcp.json || fail '.vscode/mcp.json missing qwen3.5:9b model reference'
legacy_script_prefix='"c'
legacy_script_prefix+='line:'
legacy_verify='verify:ollama:'
legacy_verify+='cline'
legacy_doctrine='Ollama/'
legacy_doctrine+='Cline'
! rg -q "$legacy_script_prefix" package.json || fail 'package.json still exposes retired legacy scripts'
! rg -q "${legacy_verify}|${legacy_doctrine}" .github/copilot-instructions.md .github/instructions/titane.instructions.md AGENTS.md package.json scripts/verify/verify-vscode-agent-workflow.sh || fail 'active governance still references the retired legacy doctrine'

pass 'product ollama runtime baseline aligned'
pass 'development ollama doctrine aligned'
pass 'boundary validator wired in package'
pass 'MCP Ollama Dev config present and aligned'
pass 'active cline workflow references removed'
