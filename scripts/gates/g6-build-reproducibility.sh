#!/bin/bash
# Gate G6: BUILD_REPRO_X3
# Verifies reproducible build (x3 independent builds with matching hashes)
#
# Environment variables:
#   G6_SKIP_ENV_CHECK=1  — Bypass the build-deps pre-check and attempt the
#                          reproducibility builds regardless of environment.
#                          Use only in fully provisioned CI environments with
#                          all Tauri system libraries installed.
#   G6_LOCK_FILE=<path>  — Override the concurrency lock file location.
#   G6_STEP_TIMEOUT_SEC  — Per-step timeout in seconds (default: 2400).

set -euo pipefail

G6_LOCK_FILE="${G6_LOCK_FILE:-/tmp/g6-build-reproducibility.lock}"
exec 8>"$G6_LOCK_FILE"
if ! flock -n 8; then
  echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [g6-build-reproducibility] STOP: run G6 déjà actif (lock=$G6_LOCK_FILE)" >&2
  exit 98
fi

GATE_ID="g6-build-reproducibility"
GATE_NAME="Build Reproducibility (×3)"
EXIT_CODE=0
BUILD_HASHES=()
REPORT_DIR="deployment/latest/builds"
RUN_ID="$(date -u +%Y%m%dT%H%M%SZ)-$$"
G6_WORK_ROOT="${G6_WORK_ROOT:-/tmp/g6-build-reproducibility}"
WORK_DIR="${G6_WORK_ROOT}/${RUN_ID}"
BUILD_DIR="$WORK_DIR"
G6_STEP_TIMEOUT_SEC="${G6_STEP_TIMEOUT_SEC:-2400}"

# ── Environment pre-check ──────────────────────────────────────────────────
# G6 requires Tauri system libraries and the full Rust toolchain.
# When running in a sandboxed/CI environment without these, report BLOCKED_ENV
# instead of a false FAIL. Set G6_SKIP_ENV_CHECK=1 to bypass.
if [[ "${G6_SKIP_ENV_CHECK:-0}" != "1" ]]; then
  _g6_env_ok=1
  if ! pkg-config --exists glib-2.0 2>/dev/null; then
    echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [g6-build-reproducibility] ⚠️  BLOCKED_ENV: glib-2.0 not found (Tauri build deps absent)" >&2
    _g6_env_ok=0
  fi
  if ! command -v cargo >/dev/null 2>&1; then
    echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [g6-build-reproducibility] ⚠️  BLOCKED_ENV: cargo not in PATH" >&2
    _g6_env_ok=0
  fi
  if [[ "$_g6_env_ok" == "0" ]]; then
    mkdir -p "$REPORT_DIR"
    echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [g6-build-reproducibility] ════════════════════════════════════════" >&2
    echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [g6-build-reproducibility] ⚠️  GATE G6 BLOCKED_ENV: build environment not provisioned" >&2
    echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [g6-build-reproducibility] ⚠️  To provision: sudo apt-get install -y libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev libssl-dev libasound2-dev" >&2
    echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [g6-build-reproducibility] ⚠️  Tauri setup guide: https://tauri.app/start/prerequisites/" >&2
    echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [g6-build-reproducibility] ════════════════════════════════════════" >&2
    # Write a blocked report so g9 can record state
    cat > "$REPORT_DIR/BUILD_REPRODUCIBILITY.md" << BLOCKED_EOF
# G6: Build Reproducibility — BLOCKED_ENV

**Status:** BLOCKED_ENV  
**Reason:** Tauri build system dependencies not available in this environment.  
**Required packages:** libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev libssl-dev libasound2-dev

**To provision (Debian/Ubuntu):**
\`\`\`bash
sudo apt-get install -y libwebkit2gtk-4.1-dev libgtk-3-dev \\
  libayatana-appindicator3-dev librsvg2-dev libssl-dev libasound2-dev
\`\`\`

**Reference:** https://tauri.app/start/prerequisites/

**Unblock:** After installing deps, re-run \`G6_SKIP_ENV_CHECK=1 bash scripts/gates/g6-build-reproducibility.sh\` or in a fully provisioned CI environment.

G6 does not register as a blocking FAIL in environments where build deps are intentionally absent.
BLOCKED_EOF
    exit 0
  fi
fi
# ─────────────────────────────────────────────────────────────────────────

normalize_binary_for_hash() {
  local src_bin="$1"
  local out_bin="$2"

  cp "$src_bin" "$out_bin"

  # Strip debug sections first (removes DWARF, line tables, etc.)
  if command -v llvm-strip >/dev/null 2>&1; then
    llvm-strip --strip-debug --strip-unneeded "$out_bin" >/dev/null 2>&1 || true
  elif command -v strip >/dev/null 2>&1; then
    strip --strip-debug --strip-unneeded "$out_bin" >/dev/null 2>&1 || true
  fi

  # Zero out build-id section (varies per build even with SOURCE_DATE_EPOCH)
  if command -v objcopy >/dev/null 2>&1; then
    objcopy --remove-section=.note.gnu.build-id "$out_bin" >/dev/null 2>&1 || true
    objcopy --remove-section=.note.ABI-tag "$out_bin" >/dev/null 2>&1 || true
  fi

  # Remove build-id section via llvm-objcopy as fallback
  if command -v llvm-objcopy >/dev/null 2>&1; then
    llvm-objcopy --remove-section=.note.gnu.build-id "$out_bin" >/dev/null 2>&1 || true
  fi
}

log() {
  local ts
  ts=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
  echo "[$ts] [${GATE_ID}] $*"
}

pass() {
  log "✅ $*"
}

fail() {
  log "❌ $*"
  EXIT_CODE=1
}

run_step() {
  local run_id="$1"
  local step_name="$2"
  local step_log="$3"
  shift 3

  log "[run ${run_id}] ▶ ${step_name} (timeout=${G6_STEP_TIMEOUT_SEC}s)"
  if timeout "${G6_STEP_TIMEOUT_SEC}" "$@" 2>&1 | tee -a "$step_log"; then
    pass "[run ${run_id}] ${step_name} completed"
    return 0
  fi

  local rc=$?
  fail "[run ${run_id}] ${step_name} failed (exit=${rc})"
  return "$rc"
}

log "════════════════════════════════════════"
log "GATE G6: ${GATE_NAME}"
log "════════════════════════════════════════"

mkdir -p "$REPORT_DIR" "$WORK_DIR"

# Run frontend/auth steps once to freeze UI assets for the 3 Rust reproducibility runs.
PREBUILD_LOG="$WORK_DIR/prebuild.log"
: > "$PREBUILD_LOG"
export PNPM_HOME="$WORK_DIR/pnpm-home"
mkdir -p "$PNPM_HOME"
if run_step "0" "guard:ollama-proxy" "$PREBUILD_LOG" pnpm run guard:ollama-proxy && \
   run_step "0" "require-e2e-build-authorization" "$PREBUILD_LOG" bash scripts/e2e/require-e2e-build-authorization.sh && \
   run_step "0" "vite build" "$PREBUILD_LOG" pnpm -s exec vite build; then
  pass "Prebuild completed (shared assets frozen for runs 1..3)"
else
  fail "Prebuild FAILED"
  EXIT_CODE=1
fi

log "Executing 3 independent Rust builds with SOURCE_DATE_EPOCH lock..."
for i in 1 2 3; do
  log "BUILD RUN $i/3..."

  export SOURCE_DATE_EPOCH="1000000000"
  export CARGO_BUILD_JOBS=1
  export CARGO_INCREMENTAL=0
  export CARGO_TARGET_DIR="$WORK_DIR/target-run-$i"
  mkdir -p "$CARGO_TARGET_DIR"

  RUN_LOG="$WORK_DIR/build_run_$i.log"
  : > "$RUN_LOG"

  if [[ $EXIT_CODE -eq 0 ]] && run_step "$i" "cargo build --release --locked" "$RUN_LOG" cargo build --manifest-path src-tauri/Cargo.toml --release --locked; then
    pass "Build run $i completed successfully"
  else
    fail "Build run $i FAILED"
    continue
  fi

  ARTIFACT_DIR="$CARGO_TARGET_DIR/release"
  if [[ -d "$ARTIFACT_DIR" ]]; then
    BINARY="$ARTIFACT_DIR/titane-infinity"
    if [[ -f "$BINARY" ]]; then
      RAW_HASH=$(sha256sum "$BINARY" | awk '{print $1}')
      NORM_BINARY="$WORK_DIR/titane-infinity.run${i}.normalized"
      normalize_binary_for_hash "$BINARY" "$NORM_BINARY"
      HASH=$(sha256sum "$NORM_BINARY" | awk '{print $1}')
      BUILD_HASHES+=("run_$i:$HASH")
      pass "Build $i raw hash: $RAW_HASH"
      pass "Build $i normalized hash: $HASH"
      echo "$HASH" > "$WORK_DIR/hash_run_$i.txt"
    else
      fail "Build $i binary not found: $BINARY"
    fi
  else
    fail "Build $i artifact directory missing: $ARTIFACT_DIR"
  fi

  unset CARGO_TARGET_DIR
  unset CARGO_INCREMENTAL
done

unset PNPM_HOME

log "Comparing hashes across 3 runs..."
if [[ ${#BUILD_HASHES[@]} -ge 3 ]]; then
  HASH_1=$(echo "${BUILD_HASHES[0]}" | cut -d: -f2)
  HASH_2=$(echo "${BUILD_HASHES[1]}" | cut -d: -f2)
  HASH_3=$(echo "${BUILD_HASHES[2]}" | cut -d: -f2)

  if [[ "$HASH_1" == "$HASH_2" ]] && [[ "$HASH_2" == "$HASH_3" ]]; then
    pass "✅ REPRODUCIBLE: All 3 builds match ($HASH_1)"
  else
    fail "❌ NON-REPRODUCIBLE: Hashes diverged"
    fail "  Run 1: $HASH_1"
    fail "  Run 2: $HASH_2"
    fail "  Run 3: $HASH_3"
  fi
else
  fail "Insufficient successful builds to compare ($((${#BUILD_HASHES[@]})) < 3)"
fi

cat > "$REPORT_DIR/BUILD_REPRODUCIBILITY.md" << EOF
# Build Reproducibility Report

## Summary
- **Gate**: G6 (Build Reproducibility ×3)
- **Status**: $([ $EXIT_CODE -eq 0 ] && echo "PASS" || echo "FAIL")
- **Timestamp**: $(date -u +'%Y-%m-%dT%H:%M:%SZ')
- **WorkDir**: 
  - $WORK_DIR

## Build Runs
EOF

for i in 1 2 3; do
  if [[ -f "$WORK_DIR/hash_run_$i.txt" ]]; then
    HASH=$(cat "$WORK_DIR/hash_run_$i.txt")
    echo "- **Run $i**: \`$HASH\`" >> "$REPORT_DIR/BUILD_REPRODUCIBILITY.md"
  fi
done

cat >> "$REPORT_DIR/BUILD_REPRODUCIBILITY.md" << EOF

## Environment
- SOURCE_DATE_EPOCH: 1000000000
- CARGO_BUILD_JOBS: 1
- Timestamp: Locked

## Verification
Builds are reproducible if all 3 hashes match.
EOF

pass "Build report generated: $REPORT_DIR/BUILD_REPRODUCIBILITY.md"

# Keep temporary per-run artifacts out of git-tracked directories.
rm -rf "$WORK_DIR/pnpm-home" "$WORK_DIR/target-run-1" "$WORK_DIR/target-run-2" "$WORK_DIR/target-run-3" || true

log "════════════════════════════════════════"
if [[ $EXIT_CODE -eq 0 ]]; then
  log "✅ GATE G6 PASS: Build reproducible ×3"
else
  log "❌ GATE G6 FAIL: Build reproducibility not verified"
fi
log "════════════════════════════════════════"

exit $EXIT_CODE
