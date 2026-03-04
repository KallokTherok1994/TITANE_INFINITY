#!/usr/bin/env bash
# scripts/phases/P0_baseline.sh — Baseline: versions + git state
# Usage: bash scripts/phases/P0_baseline.sh [logfile]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/../lib/common.sh"

LOGFILE="${1:-${TITANE_REPO_ROOT}/proof_packs/P0_baseline_$(date -u +%Y%m%dT%H%M%S).log}"
mkdir -p "$(dirname "$LOGFILE")"

{
  echo "=== P0_BASELINE: $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
  echo ""
  echo "--- tool versions ---"
  node -v 2>&1 || echo "node: NOT FOUND"
  npm -v 2>&1 || echo "npm: NOT FOUND"
  cargo -V 2>&1 || echo "cargo: NOT FOUND"
  rustc -V 2>&1 || echo "rustc: NOT FOUND"
  echo ""
  echo "--- git state ---"
  cd "${TITANE_REPO_ROOT}"
  git rev-parse --short HEAD
  git status --porcelain=v1 | head -20
  echo ""
  echo "--- version coherence ---"
  node -e "const p=require('./package.json'); console.log('package.json:', p.version)"
  grep '^version' src-tauri/Cargo.toml | head -1
  node -e "const t=require('./src-tauri/tauri.conf.json'); console.log('tauri.conf.json:', t.version)"
  echo ""
  echo "=== P0_BASELINE COMPLETE ==="
} | tee "$LOGFILE"

echo "Logged to: $LOGFILE"
