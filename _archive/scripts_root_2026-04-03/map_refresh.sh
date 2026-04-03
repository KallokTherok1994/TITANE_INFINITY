#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_FILE="$ROOT_DIR/reports/MAP_PROOFS.log"

mkdir -p "$ROOT_DIR/reports"

run_cmd() {
  local cmd="$1"
  echo "$ $cmd" >> "$LOG_FILE"
  timeout 120 bash -lc "cd '$ROOT_DIR' && $cmd" >> "$LOG_FILE" 2>&1 || true
  echo >> "$LOG_FILE"
}

{
  echo "============================================================"
  echo "MAP_REFRESH_RUN_UTC=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "ROOT=$ROOT_DIR"
  echo "============================================================"
  echo
} >> "$LOG_FILE"

run_cmd "git status"
run_cmd "git rev-parse --short HEAD"
run_cmd "ls"
run_cmd "ls docs || true"
run_cmd "ls reports || true"
run_cmd "rg -n \"Copilot Instructions|Governed|Stop-the-line\" -S . -g '!**/node_modules/**' -g '!**/dist/**' -g '!**/build/**' -g '!**/target/**' -g '!**/reports/**' -g '!**/proof_packs/**'"
run_cmd "rg -n \"src-tauri|tauri\\.conf|Cargo\\.toml|package\\.json\" -S . -g '!**/node_modules/**' -g '!**/dist/**' -g '!**/build/**' -g '!**/target/**' -g '!**/reports/**' -g '!**/proof_packs/**'"
run_cmd "rg -n \"fetch\\(|axios\\(|XMLHttpRequest|WebSocket|https?://\" -S src -g '!**/stories/**' -g '!**/*.svg' -g '!**/*.mdx' || true"
run_cmd "rg -n \"tauri::command|invoke\\(\" -S src-tauri src -g '!**/node_modules/**' -g '!**/dist/**' -g '!**/build/**' -g '!**/target/**' || true"

run_cmd "test -f docs/MAP_INDEX.md && echo G_MAP_INDEX_PRESENT=PASS || echo G_MAP_INDEX_PRESENT=FAIL"
run_cmd "test -f docs/MAP_ARCHITECTURE_4RING.md && echo G_MAP_ARCHITECTURE_PRESENT=PASS || echo G_MAP_ARCHITECTURE_PRESENT=FAIL"
run_cmd "test -f docs/MAP_SURFACES_NETWORK.md && echo G_MAP_SURFACES_PRESENT=PASS || echo G_MAP_SURFACES_PRESENT=FAIL"
run_cmd "test -f docs/MAP_IPC_COMMANDS.md && echo G_MAP_IPC_COMMANDS_PRESENT=PASS || echo G_MAP_IPC_COMMANDS_PRESENT=FAIL"
run_cmd "test -f docs/MAP_TESTS_GATES.md && echo G_MAP_TESTS_GATES_PRESENT=PASS || echo G_MAP_TESTS_GATES_PRESENT=FAIL"
run_cmd "test -f docs/MAP_MERMAID_OVERVIEW.md && grep -c '^flowchart' docs/MAP_MERMAID_OVERVIEW.md | awk '{exit !(\$1>=4)}' && echo G_MERMAID_PRESENT=PASS || echo G_MERMAID_PRESENT=FAIL"
run_cmd "test -s reports/MAP_PROOFS.log && echo G_MAP_PROOF_LOG_PRESENT=PASS || echo G_MAP_PROOF_LOG_PRESENT=FAIL"
run_cmd "if rg -n \"UNKNOWN critique|\\*\\*Statut\\*\\*: UNKNOWN\" docs/MAP_*.md >/dev/null; then rg -n \"Justification\" docs/MAP_*.md >/dev/null && echo G_MAP_NO_UNKNOWN_CRITICAL=PASS || echo G_MAP_NO_UNKNOWN_CRITICAL=FAIL; else echo G_MAP_NO_UNKNOWN_CRITICAL=PASS; fi"
run_cmd "rg -n \"anti-dérive|anti-drift|sinon FAIL\" .github/copilot-instructions.md docs/MAP_*.md && echo G_MAP_ANTI_DRIFT_RULE_PRESENT=PASS || echo G_MAP_ANTI_DRIFT_RULE_PRESENT=FAIL"

echo "MAP_REFRESH_DONE" >> "$LOG_FILE"
