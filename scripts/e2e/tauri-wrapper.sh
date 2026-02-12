#!/bin/bash
# Ω∞.E2E.TAURI.WRAPPER — Memory/Log isolation for WebDriver runs
# Usage: Reads TITANE_MEMORY_DIR, TITANE_LOG_DIR, TAURI_BINARY_PATH from env

set -euo pipefail

# Proof witness file (to detect wrapper execution even if stderr is lost)
WITNESS_FILE="/tmp/e2e-wrapper-executed-$(date +%s).flag"
touch "$WITNESS_FILE"
echo "[E2E_WRAPPER] Witness: $WITNESS_FILE" > "$WITNESS_FILE"

echo "[E2E_WRAPPER] active" >&2

# Find actual Tauri binary (this wrapper acts as drop-in replacement)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Prioritize debug build for E2E tests
BINARY_PATHS=(
  "$REPO_ROOT/src-tauri/target/debug/titane-infinity"
  "$REPO_ROOT/src-tauri/target/release/titane-infinity"
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

echo "[E2E_WRAPPER] Using binary: $TAURI_BINARY" >&2

# E2E mode: activate guard only (let Rust resolver choose memory dir)
export TITANE_E2E=1

# Log activation (memory dir will be decided by Rust guard fallback: /tmp/titane-infinity/memory-e2e)
echo "[E2E_WRAPPER] TITANE_E2E=$TITANE_E2E" >&2
echo "[E2E_WRAPPER] Memory dir: (Rust fallback /tmp/titane-infinity/memory-e2e)" >&2

# Replace current process with Tauri binary (preserve PID for tauri-driver)
exec "$TAURI_BINARY" "$@"
