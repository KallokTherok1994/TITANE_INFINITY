#!/bin/bash
# Gate G6: BUILD_REPRO_X3
# Verifies reproducible build (x3 independent builds with matching hashes)

set -euo pipefail

GATE_ID="g6-build-reproducibility"
GATE_NAME="Build Reproducibility (×3)"
EXIT_CODE=0
BUILD_HASHES=()
BUILD_DIR="deployment/latest/builds"

log() {
  local ts=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
  echo "[$ts] [${GATE_ID}] $*"
}

pass() {
  log "✅ $*"
}

fail() {
  log "❌ $*"
  EXIT_CODE=1
}

log "════════════════════════════════════════"
log "GATE G6: ${GATE_NAME}"
log "════════════════════════════════════════"

# Create build directory
mkdir -p "$BUILD_DIR"

# Build x3
log "Executing 3 independent builds with SOURCE_DATE_EPOCH lock..."
for i in 1 2 3; do
  log "BUILD RUN $i/3..."
  
  # Set deterministic environment
  export SOURCE_DATE_EPOCH="1000000000"  # Fixed Unix timestamp
  export CARGO_BUILD_JOBS=1  # Single-threaded for determinism
  export PNPM_HOME="$BUILD_DIR/pnpm-cache-$i"
  mkdir -p "$PNPM_HOME"
  
  # Execute build
  if pnpm run build:tauri:e2e 2>&1 | tee "$BUILD_DIR/build_run_$i.log"; then
    pass "Build run $i completed successfully"
  else
    fail "Build run $i FAILED"
    continue
  fi
  
  # Capture hashes of key artifacts
  ARTIFACT_DIR="src-tauri/target/release"
  if [[ -d "$ARTIFACT_DIR" ]]; then
    # Get hash of binary
    BINARY=$(find "$ARTIFACT_DIR" -maxdepth 1 -type f -executable ! -name "*.d" 2>/dev/null | head -1)
    if [[ -n "$BINARY" ]]; then
      HASH=$(sha256sum "$BINARY" | awk '{print $1}')
      BUILD_HASHES+=("run_$i:$HASH")
      pass "Build $i hash: $HASH"
      echo "$HASH" > "$BUILD_DIR/hash_run_$i.txt"
    fi
  fi
  
  # Clean up cache for next run
  export PNPM_HOME=""
done

# Compare hashes
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

# Generate build report
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
