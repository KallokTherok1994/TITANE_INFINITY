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

rg -q 'gemma2:2b' src/services/ai/providers/ollama.ts || fail 'frontend ollama default model drift'
rg -q 'gemma2:2b' config/championChallenger.json || fail 'champion registry not aligned on gemma2:2b'
rg -q 'gemma2:2b' src/pages/ConfigurationHub.tsx src/main.tsx src-tauri/src/config/update.rs || fail 'active ollama fallbacks not aligned on gemma2:2b'
rg -q 'http://127.0.0.1:11434' verify-ollama.sh scripts/ollama/run-ollama.sh OLLAMA_RUNTIME_MAP.md || fail 'ollama base url drift'
rg -q 'http://127.0.0.1:11434' src/pages/ConfigurationHub.tsx src/main.tsx src-tauri/src/config/update.rs || fail 'active ollama loopback fallbacks drift'
rg -q 'token_gate_disabled' .cline/deployment-safeguards.json || fail 'cline safeguards still imply token gate'
rg -q 'approval_keywords": \[\]' .cline/deployment-safeguards.json || fail 'cline safeguards still require approval keywords'
! rg -q 'GO_FOR_PROD_BUILD__TITANE_INFINITY|GO_FOR_PROD_DEPLOY__TITANE_INFINITY' .clinerules/hooks/PreToolUse .clinerules/hooks/UserPromptSubmit || fail 'cline hooks still enforce token gate strings'
rg -q 'verify:ollama:cline' package.json || fail 'package.json missing verify:ollama:cline script'
rg -q '\.github/agents/' README.md || fail 'README agent surface not aligned to .github/agents/'

pass 'ollama frontend/runtime model aligned'
pass 'ollama loopback base url aligned'
pass 'cline safeguard token gate removed'
pass 'active hooks and fallbacks aligned'
pass 'agent documentation aligned'