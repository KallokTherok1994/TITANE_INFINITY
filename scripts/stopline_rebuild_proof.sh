#!/usr/bin/env bash
# stopline_rebuild_proof.sh
# Ring: Governance / Status: STABLE
# Governed rebuild workflow with automated proof pack generation
#
# Usage:
#   TARGET_VERSION=v27.0.6-hotfix.2 CANON_CMD="pnpm run tauri:build" pnpm run stopline:rebuild-proof
#
# Exit codes:
#   0 = READY_FOR_STOPLINE_CLEAR (all gates passed)
#   1 = BLOCKED (invariant violated, proof incomplete, build failure)

set -euo pipefail

###############################################################################
# 0️⃣ Constants & Config
###############################################################################

readonly SCRIPT_NAME="stopline_rebuild_proof.sh"
readonly TS="$(date +%Y%m%d_%H%M%S)"
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

CANON_CMD="${CANON_CMD:-}"
TARGET_VERSION="${TARGET_VERSION:-}"

# Fallback: load from file if env var empty
if [[ -z "$CANON_CMD" && -f "$SCRIPT_DIR/_canon_build_cmd.txt" ]]; then
  CANON_CMD="$(cat "$SCRIPT_DIR/_canon_build_cmd.txt" | head -n1)"
fi

if [[ -z "$TARGET_VERSION" ]]; then
  echo "❌ ERROR: TARGET_VERSION env var required (ex: TARGET_VERSION=v27.0.6-hotfix.2)"
  exit 1
fi

if [[ -z "$CANON_CMD" ]]; then
  echo "❌ ERROR: CANON_CMD env var or scripts/_canon_build_cmd.txt required"
  echo "   Example: CANON_CMD=\"pnpm run tauri:build\""
  exit 1
fi

readonly REPORT_DIR="$REPO_ROOT/reports/FRESH_BUILD_PROOF_${TARGET_VERSION}_${TS}"
mkdir -p "$REPORT_DIR"

###############################################################################
# Utils
###############################################################################

log_info() {
  echo "ℹ️  $*"
}

log_ok() {
  echo "✅ $*"
}

log_fail() {
  echo "❌ $*"
}

gate_fail() {
  log_fail "GATE FAIL: $*"
  echo "BLOCKED: $*" > "$REPORT_DIR/STATUS.md"
  seal_checksums
  exit 1
}

seal_checksums() {
  log_info "Sealing report checksums..."
  cd "$REPORT_DIR"
  find . -type f ! -name "CHECKSUMS.sha256" -print0 | xargs -0 sha256sum > CHECKSUMS.sha256
  log_ok "Sealed: $(wc -l < CHECKSUMS.sha256) files in CHECKSUMS.sha256"
}

###############################################################################
# A️⃣ Pre-flight: HEAD lock & worktree clean
###############################################################################

log_info "Block 0️⃣: Canon Build Command"
{
  echo "# Canonical Build Command"
  echo ""
  echo '```bash'
  echo "$CANON_CMD"
  echo '```'
  echo ""
  echo "Captured at: $(date -Iseconds)"
} > "$REPORT_DIR/0_CANON_CMD.txt"

log_info "Block A: HEAD lock + worktree clean check"
cd "$REPO_ROOT"

HEAD_SHA="$(git rev-parse HEAD)"
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
PORCELAIN="$(git status --porcelain)"

{
  echo "# HEAD Lock"
  echo ""
  echo "commit: $HEAD_SHA"
  echo "branch: $BRANCH"
  echo "timestamp: $(date -Iseconds)"
  echo ""
  echo "## git status --porcelain"
  echo '```'
  if [[ -z "$PORCELAIN" ]]; then
    echo "(clean)"
  else
    echo "$PORCELAIN"
  fi
  echo '```'
} > "$REPORT_DIR/A_HEAD_LOCK.txt"

if [[ -n "$PORCELAIN" ]]; then
  gate_fail "Worktree not clean. Commit or stash changes."
fi
log_ok "HEAD clean: $HEAD_SHA on $BRANCH"

###############################################################################
# B️⃣ Cleanroom Prep
###############################################################################

log_info "Block B: Cleanroom preparation"

CLEANROOM_DIR="$REPO_ROOT/.build_cleanroom/$TS"
mkdir -p "$CLEANROOM_DIR"

BUNDLE_DIR="$REPO_ROOT/src-tauri/target/release/bundle"
ARTIFACTS_BACKUP="$CLEANROOM_DIR/artifacts_before.txt"

if [[ -d "$BUNDLE_DIR" ]]; then
  find "$BUNDLE_DIR" -type f \( -name "*.AppImage" -o -name "*.deb" -o -name "*.rpm" \) -exec ls -l --time-style=full-iso {} \; > "$ARTIFACTS_BACKUP" || true
fi

{
  echo "# Cleanroom Preparation"
  echo ""
  echo "Cleanroom timestamp: $TS"
  echo "Cleanroom path: $CLEANROOM_DIR"
  echo ""
  echo "## Artifacts before build"
  echo '```'
  if [[ -f "$ARTIFACTS_BACKUP" ]]; then
    cat "$ARTIFACTS_BACKUP"
  else
    echo "(no previous artifacts found)"
  fi
  echo '```'
} > "$REPORT_DIR/B_CLEANROOM.txt"

log_ok "Cleanroom prepared: $CLEANROOM_DIR"

###############################################################################
# C️⃣ Build Execution
###############################################################################

log_info "Block C: Build execution"
BUILD_LOG="$CLEANROOM_DIR/build.log"
BUILD_EXIT=0

{
  echo "# Build Execution"
  echo ""
  echo "Canon command: $CANON_CMD"
  echo "Started: $(date -Iseconds)"
  echo ""
} > "$REPORT_DIR/C_BUILD.txt"

log_info "Running: $CANON_CMD"
log_info "Log: $BUILD_LOG"

# Execute build with full environment, redirecting output
if eval "$CANON_CMD" &> "$BUILD_LOG"; then
  BUILD_EXIT=0
  log_ok "Build succeeded (exit 0)"
else
  BUILD_EXIT=$?
  log_fail "Build failed (exit $BUILD_EXIT)"
fi

{
  echo "Finished: $(date -Iseconds)"
  echo "Exit code: $BUILD_EXIT"
  echo ""
  echo "## Build log (tail -100)"
  echo '```'
  tail -n 100 "$BUILD_LOG"
  echo '```'
  echo ""
  echo "Full log: $BUILD_LOG"
} >> "$REPORT_DIR/C_BUILD.txt"

if [[ $BUILD_EXIT -ne 0 ]]; then
  gate_fail "Build failed with exit $BUILD_EXIT. Check log: $BUILD_LOG"
fi

###############################################################################
# D️⃣ Artifacts Inventory
###############################################################################

log_info "Block D: Artifacts inventory + mtime validation"

ARTIFACTS_LIST="$CLEANROOM_DIR/artifacts_after.txt"

if [[ ! -d "$BUNDLE_DIR" ]]; then
  gate_fail "Bundle directory not found: $BUNDLE_DIR"
fi

find "$BUNDLE_DIR" -type f \( -name "*.AppImage" -o -name "*.deb" -o -name "*.rpm" \) -exec ls -l --time-style=full-iso {} \; > "$ARTIFACTS_LIST"

BUILD_START_TS="$(stat -c %Y "$REPORT_DIR/C_BUILD.txt")"

{
  echo "# Artifacts Inventory"
  echo ""
  echo "Bundle directory: $BUNDLE_DIR"
  echo "Build started at epoch: $BUILD_START_TS"
  echo ""
  echo "## Artifacts found"
  echo '```'
  cat "$ARTIFACTS_LIST"
  echo '```'
  echo ""
  echo "## Freshness validation"
} > "$REPORT_DIR/D_ARTEFACTS_MTIMES.txt"

FRESH_COUNT=0
STALE_COUNT=0

while IFS= read -r line; do
  # Extract filename and mtime epoch
  ARTIFACT_PATH="$(echo "$line" | awk '{print $NF}')"
  ARTIFACT_MTIME="$(stat -c %Y "$ARTIFACT_PATH")"
  ARTIFACT_NAME="$(basename "$ARTIFACT_PATH")"
  
  if [[ $ARTIFACT_MTIME -ge $BUILD_START_TS ]]; then
    echo "✅ FRESH: $ARTIFACT_NAME (mtime $ARTIFACT_MTIME >= build $BUILD_START_TS)" >> "$REPORT_DIR/D_ARTEFACTS_MTIMES.txt"
    FRESH_COUNT=$((FRESH_COUNT + 1))
  else
    echo "❌ STALE: $ARTIFACT_NAME (mtime $ARTIFACT_MTIME < build $BUILD_START_TS)" >> "$REPORT_DIR/D_ARTEFACTS_MTIMES.txt"
    STALE_COUNT=$((STALE_COUNT + 1))
  fi
done < "$ARTIFACTS_LIST"

{
  echo ""
  echo "## Summary"
  echo "Fresh: $FRESH_COUNT"
  echo "Stale: $STALE_COUNT"
} >> "$REPORT_DIR/D_ARTEFACTS_MTIMES.txt"

if [[ $STALE_COUNT -gt 0 ]]; then
  gate_fail "Found $STALE_COUNT stale artifacts. Build may not have regenerated all files."
fi

if [[ $FRESH_COUNT -eq 0 ]]; then
  gate_fail "No fresh artifacts found. Build did not produce expected outputs."
fi

log_ok "All $FRESH_COUNT artifacts are fresh"

###############################################################################
# E️⃣ SHA256 Provenance
###############################################################################

log_info "Block E: SHA256 provenance"

{
  echo "# SHA256 Provenance"
  echo ""
  echo "HEAD commit: $HEAD_SHA"
  echo "Build timestamp: $TS"
  echo ""
  echo "## Checksums"
  echo '```'
} > "$REPORT_DIR/E_SHA256.txt"

cd "$BUNDLE_DIR"
find . -type f \( -name "*.AppImage" -o -name "*.deb" -o -name "*.rpm" \) -exec sha256sum {} \; >> "$REPORT_DIR/E_SHA256.txt"

{
  echo '```'
} >> "$REPORT_DIR/E_SHA256.txt"

log_ok "SHA256 provenance recorded"

###############################################################################
# F️⃣ Stopline Clear Request
###############################################################################

log_info "Block F: Stopline clear request"

{
  echo "# Stopline Clear Request"
  echo ""
  echo "Version: $TARGET_VERSION"
  echo "HEAD commit: $HEAD_SHA"
  echo "Branch: $BRANCH"
  echo "Build timestamp: $TS"
  echo ""
  echo "## Validation Summary"
  echo ""
  echo "- [x] HEAD clean (no uncommitted changes)"
  echo "- [x] Build succeeded (exit 0)"
  echo "- [x] All artifacts fresh (mtime >= build start)"
  echo "- [x] SHA256 provenance complete"
  echo ""
  echo "## Artifacts Ready"
  echo ""
  while IFS= read -r line; do
    ARTIFACT_PATH="$(echo "$line" | awk '{print $NF}')"
    ARTIFACT_NAME="$(basename "$ARTIFACT_PATH")"
    ARTIFACT_SIZE="$(du -h "$ARTIFACT_PATH" | cut -f1)"
    echo "- $ARTIFACT_NAME ($ARTIFACT_SIZE)"
  done < "$ARTIFACTS_LIST"
  echo ""
  echo "---"
  echo ""
  echo "**VERDICT: READY FOR STOPLINE CLEAR**"
} > "$REPORT_DIR/F_STOPLINE_CLEAR_REQUEST.txt"

log_ok "Stopline clear request generated"

###############################################################################
# G️⃣ Status & Seal
###############################################################################

log_info "Generating STATUS.md"

{
  echo "# Build Proof Status"
  echo ""
  echo "**READY_FOR_STOPLINE_CLEAR**"
  echo ""
  echo "Version: $TARGET_VERSION"
  echo "HEAD: $HEAD_SHA"
  echo "Timestamp: $TS"
  echo ""
  echo "All validation gates passed."
} > "$REPORT_DIR/STATUS.md"

seal_checksums

###############################################################################
# ✅ Success Summary
###############################################################################

log_ok "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_ok "Stopline Rebuild Proof Complete"
log_ok "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_ok ""
log_ok "Version:      $TARGET_VERSION"
log_ok "HEAD:         $HEAD_SHA"
log_ok "Fresh count:  $FRESH_COUNT artifacts"
log_ok ""
log_ok "Report directory:"
log_ok "  $REPORT_DIR"
log_ok ""
log_ok "Files generated:"
log_ok "  - 0_CANON_CMD.txt"
log_ok "  - A_HEAD_LOCK.txt"
log_ok "  - B_CLEANROOM.txt"
log_ok "  - C_BUILD.txt"
log_ok "  - D_ARTEFACTS_MTIMES.txt"
log_ok "  - E_SHA256.txt"
log_ok "  - F_STOPLINE_CLEAR_REQUEST.txt"
log_ok "  - STATUS.md"
log_ok "  - CHECKSUMS.sha256"
log_ok ""
log_ok "Verdict: READY_FOR_STOPLINE_CLEAR ✅"
log_ok "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

exit 0
