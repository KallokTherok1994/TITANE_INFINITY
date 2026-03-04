#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR"

RUNS="${1:-1}"
PACK_DIR="${2:-reports/e2e_tauri_runtime}"

exec "$ROOT_DIR/scripts/e2e/run_e2e_tauri.sh" "$RUNS" "$PACK_DIR"
