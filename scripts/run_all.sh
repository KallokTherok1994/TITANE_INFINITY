#!/usr/bin/env bash
# scripts/run_all.sh — Orchestrateur principal TITANE∞ background prep
# Usage: bash scripts/run_all.sh [--pack-dir <dir>]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib/common.sh"

PACK_DIR="${1:-${TITANE_REPO_ROOT}/proof_packs/RUN_$(date -u +%Y%m%dT%H%M%S)}"
mkdir -p "$PACK_DIR"

log_info "=== run_all.sh START ==="
log_info "Pack dir: $PACK_DIR"
log_info "Repo: $TITANE_REPO_ROOT"

cd "${TITANE_REPO_ROOT}"

# P0: Baseline
log_info "P0: Baseline..."
bash "${SCRIPT_DIR}/phases/P0_baseline.sh" "${PACK_DIR}/P0_baseline.log" && log_pass "P0 baseline" || log_warn "P0 baseline WARN"

# Tests x3
log_info "Tests x3..."
bash "${SCRIPT_DIR}/phases/P0_tests.sh" "${PACK_DIR}/08_TESTS_X3.log" && log_pass "Tests x3" || { log_error "Tests x3 FAIL — stop-the-line"; exit 1; }

# Build x3 (vite only)
log_info "Build x3 (vite)..."
bash "${SCRIPT_DIR}/phases/P0_build.sh" "${PACK_DIR}/09_BUILD_X3.log" && log_pass "Build x3" || log_warn "Build x3 WARN"

log_pass "=== run_all.sh COMPLETE ==="
log_info "Outputs in: $PACK_DIR"
