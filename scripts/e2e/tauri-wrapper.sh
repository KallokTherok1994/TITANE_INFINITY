#!/bin/bash
# Ω∞.E2E.TAURI.WRAPPER — Memory/Log isolation for WebDriver runs
# Usage: Reads TITANE_MEMORY_DIR, TITANE_LOG_DIR, TAURI_BINARY_PATH from env

set -euo pipefail

ARTIFACTS_DIR="${TITANE_E2E_ARTIFACTS_DIR:-}"
WRAPPER_LOG=""
if [[ -n "$ARTIFACTS_DIR" ]]; then
  mkdir -p "$ARTIFACTS_DIR"
  WRAPPER_LOG="$ARTIFACTS_DIR/tauri-wrapper.log"
fi

log_line() {
  local msg="$1"
  echo "$msg" >&2
  if [[ -n "$WRAPPER_LOG" ]]; then
    echo "$msg" >> "$WRAPPER_LOG"
  fi
}

log_line "[E2E_WRAPPER] start"
log_line "[E2E_WRAPPER] env TITANE_E2E=${TITANE_E2E:-}"
log_line "[E2E_WRAPPER] env HOME=${HOME}"
log_line "[E2E_WRAPPER] env XDG_CACHE_HOME=${XDG_CACHE_HOME:-<unset>}"
log_line "[E2E_WRAPPER] env XDG_CONFIG_HOME=${XDG_CONFIG_HOME:-<unset>}"
log_line "[E2E_WRAPPER] env XDG_DATA_HOME=${XDG_DATA_HOME:-<unset>}"
log_line "[E2E_WRAPPER] env TMPDIR=${TMPDIR:-<unset>}"
log_line "[E2E_WRAPPER] env TITANE_MEMORY_DIR=${TITANE_MEMORY_DIR:-<unset>}"
log_line "[E2E_WRAPPER] env TITANE_LOG_DIR=${TITANE_LOG_DIR:-<unset>}"
log_line "[E2E_WRAPPER] artifacts=${ARTIFACTS_DIR:-<unset>}"

# Proof witness file (to detect wrapper execution even if stderr is lost)
WITNESS_FILE="/tmp/e2e-wrapper-executed-$(date +%s).flag"
touch "$WITNESS_FILE"
echo "[E2E_WRAPPER] Witness: $WITNESS_FILE" > "$WITNESS_FILE"

log_line "[E2E_WRAPPER] active"

# Find actual Tauri binary (this wrapper acts as drop-in replacement)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Prioritize debug build for E2E tests
BINARY_PATHS=(
  "${TAURI_BINARY_PATH:-}"
  "$REPO_ROOT/src-tauri/target/debug/titane-infinity"
  "$REPO_ROOT/src-tauri/target/release/titane-infinity"
  "$HOME/.local/bin/titane-infinity"
  "/usr/bin/titane-infinity"
)

TAURI_BINARY=""
for path in "${BINARY_PATHS[@]}"; do
  if [ -f "$path" ] && [ -x "$path" ]; then
    TAURI_BINARY="$path"
    break
  fi
done

if [ -z "$TAURI_BINARY" ]; then
  echo "❌ No Tauri binary found in:" >&2
  printf "  - %s\n" "${BINARY_PATHS[@]}" >&2
  exit 1
fi

export TAURI_BINARY_PATH="$TAURI_BINARY"
log_line "[E2E_WRAPPER] Using binary: $TAURI_BINARY"
log_line "[E2E_WRAPPER] binary=$TAURI_BINARY"
log_line "[E2E_WRAPPER] TAURI_BINARY_PATH=$TAURI_BINARY_PATH"

# E2E mode: activate guard only (let Rust resolver choose memory dir)
export TITANE_E2E=1

# Use TAURI_DEV_SERVER_URL only if explicitly provided (avoid implicit dev server)
if [[ -n "${TAURI_DEV_SERVER_URL:-}" ]]; then
  export TAURI_DEV_SERVER_URL
  log_line "[E2E_WRAPPER] TAURI_DEV_SERVER_URL=$TAURI_DEV_SERVER_URL"
else
  log_line "[E2E_WRAPPER] TAURI_DEV_SERVER_URL=<unset>"
fi

# Pass Ollama model configuration to Tauri binary
export OLLAMA_DEFAULT_MODEL="${OLLAMA_DEFAULT_MODEL:-gemma2:2b}"
log_line "[E2E_WRAPPER] OLLAMA_DEFAULT_MODEL=$OLLAMA_DEFAULT_MODEL"

# Log activation (memory dir will be decided by Rust guard fallback: /tmp/titane-infinity/memory-e2e)
log_line "[E2E_WRAPPER] TITANE_E2E=$TITANE_E2E"
log_line "[E2E_WRAPPER] Memory dir: (Rust fallback /tmp/titane-infinity/memory-e2e)"

# Replace current process with Tauri binary (preserve PID for tauri-driver)
exec "$TAURI_BINARY" "$@"
