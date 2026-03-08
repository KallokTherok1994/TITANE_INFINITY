#!/bin/bash
# Gate G6: BUILD_REPRO_X3
# Verifies reproducible build (x3 independent builds with matching hashes)

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
BUILD_DIR="deployment/latest/builds"
G6_STEP_TIMEOUT_SEC="${G6_STEP_TIMEOUT_SEC:-2400}"

normalize_binary_for_hash() {
  local src_bin="$1"
  local out_bin="$2"

  cp "$src_bin" "$out_bin"

  if command -v llvm-strip >/dev/null 2>&1; then
    llvm-strip --strip-all "$out_bin" >/dev/null 2>&1 || true
  elif command -v strip >/dev/null 2>&1; then
    strip --strip-all "$out_bin" >/dev/null 2>&1 || true
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

mkdir -p "$BUILD_DIR"

log "Executing 3 independent builds with SOURCE_DATE_EPOCH lock..."
for i in 1 2 3; do
  log "BUILD RUN $i/3..."

  export SOURCE_DATE_EPOCH="1000000000"
  export CARGO_BUILD_JOBS=1
  # Deterministic profile overrides for reproducibility gate.
  export CARGO_INCREMENTAL=0
  export CARGO_PROFILE_RELEASE_INCREMENTAL=false
  export CARGO_PROFILE_RELEASE_CODEGEN_UNITS=1
  export CARGO_PROFILE_RELEASE_LTO=off
  export CARGO_TARGET_DIR="$BUILD_DIR/target-run-$i"
  export PNPM_HOME="$BUILD_DIR/pnpm-cache-$i"
  mkdir -p "$PNPM_HOME" "$CARGO_TARGET_DIR"

  RUN_LOG="$BUILD_DIR/build_run_$i.log"
  : > "$RUN_LOG"

  if run_step "$i" "guard:ollama-proxy" "$RUN_LOG" pnpm run guard:ollama-proxy && \
     run_step "$i" "require-e2e-build-authorization" "$RUN_LOG" bash scripts/e2e/require-e2e-build-authorization.sh && \
     run_step "$i" "vite build" "$RUN_LOG" pnpm -s exec vite build && \
     run_step "$i" "cargo build --release --locked" "$RUN_LOG" cargo build --manifest-path src-tauri/Cargo.toml --release --locked; then
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
      NORM_BINARY="$BUILD_DIR/titane-infinity.run${i}.normalized"
      normalize_binary_for_hash "$BINARY" "$NORM_BINARY"
      HASH=$(sha256sum "$NORM_BINARY" | awk '{print $1}')
      BUILD_HASHES+=("run_$i:$HASH")
      pass "Build $i raw hash: $RAW_HASH"
      pass "Build $i normalized hash: $HASH"
      echo "$HASH" > "$BUILD_DIR/hash_run_$i.txt"
    else
      fail "Build $i binary not found: $BINARY"
    fi
  else
    fail "Build $i artifact directory missing: $ARTIFACT_DIR"
  fi

  unset CARGO_TARGET_DIR
  export PNPM_HOME=""
done

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

cat > "$BUILD_DIR/BUILD_REPRODUCIBILITY.md" << EOF
# Build Reproducibility Report

## Summary
- **Gate**: G6 (Build Reproducibility ×3)
- **Status**: $([ $EXIT_CODE -eq 0 ] && echo "PASS" || echo "FAIL")
- **Timestamp**: $(date -u +'%Y-%m-%dT%H:%M:%SZ')

## Build Runs
EOF

for i in 1 2 3; do
  if [[ -f "$BUILD_DIR/hash_run_$i.txt" ]]; then
    HASH=$(cat "$BUILD_DIR/hash_run_$i.txt")
    echo "- **Run $i**: \`$HASH\`" >> "$BUILD_DIR/BUILD_REPRODUCIBILITY.md"
  fi
done

cat >> "$BUILD_DIR/BUILD_REPRODUCIBILITY.md" << EOF

## Environment
- SOURCE_DATE_EPOCH: 1000000000
- CARGO_BUILD_JOBS: 1
- CARGO_INCREMENTAL: 0
- CARGO_PROFILE_RELEASE_INCREMENTAL: false
- CARGO_PROFILE_RELEASE_CODEGEN_UNITS: 1
- CARGO_PROFILE_RELEASE_LTO: off
- Timestamp: Locked

## Verification
Builds are reproducible if all 3 hashes match.
EOF

pass "Build report generated: $BUILD_DIR/BUILD_REPRODUCIBILITY.md"

log "════════════════════════════════════════"
if [[ $EXIT_CODE -eq 0 ]]; then
  log "✅ GATE G6 PASS: Build reproducible ×3"
else
  log "❌ GATE G6 FAIL: Build reproducibility not verified"
fi
log "════════════════════════════════════════"

exit $EXIT_CODE
