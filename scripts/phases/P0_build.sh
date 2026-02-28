#!/usr/bin/env bash
# scripts/phases/P0_build.sh — Build vite x3 (frontend uniquement, hors PROD Tauri)
# Usage: bash scripts/phases/P0_build.sh [logfile]
# NOTE: tauri build nécessite GO_FOR_PROD_BUILD__TITANE_INFINITY — NON exécuté ici.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/../lib/common.sh"

LOGFILE="${1:-${TITANE_REPO_ROOT}/proof_packs/P0_build_x3_$(date -u +%Y%m%dT%H%M%S).log}"
mkdir -p "$(dirname "$LOGFILE")"
cd "${TITANE_REPO_ROOT}"

run_build() {
  echo "--- vite build ---"
  node node_modules/.bin/vite build 2>&1 | tail -20
}

{
  echo "=== P0_BUILD_X3 START: $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
  echo "NOTE: tauri build NON exécuté (gate PROD requise)"
  for RUN in 1 2 3; do
    echo ""
    echo "=== RUN ${RUN}/3: $(date -u +%H:%M:%SZ) ==="
    if run_build 2>&1 | redact_secrets; then
      echo "=== RUN ${RUN}/3: PASS ==="
    else
      echo "=== RUN ${RUN}/3: FAIL ==="
    fi
  done
  echo ""
  echo "=== P0_BUILD_X3 COMPLETE: $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
} 2>&1 | tee "$LOGFILE"

echo "Logged to: $LOGFILE"
