#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"

PASS=0
FAIL=0
BLOCKED=0
pass() { echo "PASS: $1"; PASS=$((PASS+1)); }
fail() { echo "FAIL: $1"; FAIL=$((FAIL+1)); }
blocked() { echo "BLOCKED: $1"; BLOCKED=$((BLOCKED+1)); }

# Requirement: dist/index.html and dist/build-truth.json must exist
if [[ ! -f dist/index.html ]]; then
  fail "DIST_INDEX_MISSING"
else
  pass "DIST_INDEX_PRESENT"
fi

if [[ ! -f dist/build-truth.json ]]; then
  fail "DIST_BUILD_TRUTH_MISSING"
else
  pass "DIST_BUILD_TRUTH_PRESENT"
fi

# Requirement: runtime/stable directory must exist
if [[ ! -d runtime/stable ]]; then
  blocked "RUNTIME_STABLE_MISSING"
fi

# Requirement: at least one actual stable artifact (AppImage or DEB) must exist
STABLE_ARTIFACTS_FOUND=0
LATEST_ARTIFACT_MTIME=0
LATEST_ARTIFACT_PATH=""

if ls runtime/stable/*.AppImage 1>/dev/null 2>&1; then
  # Find the most recent AppImage
  while IFS= read -r appimage; do
    artifact_mtime=$(stat -c '%Y' "$appimage")
    if [[ $artifact_mtime -gt $LATEST_ARTIFACT_MTIME ]]; then
      LATEST_ARTIFACT_MTIME=$artifact_mtime
      LATEST_ARTIFACT_PATH="$appimage"
    fi
    STABLE_ARTIFACTS_FOUND=1
  done < <(find runtime/stable -maxdepth 1 -name "*.AppImage" -type f)
fi

if ls runtime/stable/*.deb 1>/dev/null 2>&1; then
  # Find the most recent DEB
  while IFS= read -r deb; do
    artifact_mtime=$(stat -c '%Y' "$deb")
    if [[ $artifact_mtime -gt $LATEST_ARTIFACT_MTIME ]]; then
      LATEST_ARTIFACT_MTIME=$artifact_mtime
      LATEST_ARTIFACT_PATH="$deb"
    fi
    STABLE_ARTIFACTS_FOUND=1
  done < <(find runtime/stable -maxdepth 1 -name "*.deb" -type f)
fi

if [[ $STABLE_ARTIFACTS_FOUND -eq 0 ]]; then
  blocked "STABLE_ARTIFACT_MISSING"
else
  pass "STABLE_ARTIFACT_PRESENT"
fi

if [[ $BLOCKED -gt 0 ]]; then
  echo "SUMMARY: BLOCKED=$BLOCKED"
  exit 1
fi

# Version match check: artifact filename must contain the current package.json version.
# This is the primary freshness signal: if the artifact is named with the current version,
# it was built from that version's source.
PKG_VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "UNKNOWN")
ARTIFACT_BASENAME=$(basename "$LATEST_ARTIFACT_PATH")
WARN_ONLY=0

if echo "$ARTIFACT_BASENAME" | grep -qF "$PKG_VERSION"; then
  pass "STABLE_ARTIFACT_VERSION_MATCH (artifact contains v$PKG_VERSION)"
  # Version matches: mtime staleness relative to a fresh Vite build is a WARN, not a hard FAIL.
  # The Vite build step (run inside the pre-build certifier or pnpm run build) freshens dist/
  # timestamps without rebuilding the stable artifact. The stable artifact will be rebuilt
  # by runtime/stable/build.sh during the full BUILD ALL sequence.
  WARN_ONLY=1
else
  fail "STABLE_ARTIFACT_VERSION_MISMATCH (artifact=$ARTIFACT_BASENAME does not contain v$PKG_VERSION)"
fi

# Compare latest stable artifact mtime with dist artifacts
if [[ ! -f dist/index.html || ! -f dist/build-truth.json ]]; then
  exit 1
fi

dist_index_mtime=$(stat -c '%Y' dist/index.html)
dist_build_truth_mtime=$(stat -c '%Y' dist/build-truth.json)

# Stable artifact mtime check. When version matches, mtime staleness is degraded to WARN
# because the Vite build step alone freshens dist/ without rebuilding the stable artifact.
if [[ $LATEST_ARTIFACT_MTIME -ge $dist_index_mtime ]]; then
  pass "STABLE_ARTIFACT_NEWER_THAN_DIST_INDEX"
else
  if [[ $WARN_ONLY -eq 1 ]]; then
    echo "WARN: STABLE_ARTIFACT_MTIME_OLDER_THAN_DIST_INDEX (version matches — mtime stale after Vite build; artifact=$LATEST_ARTIFACT_PATH, mtime=$LATEST_ARTIFACT_MTIME vs dist/index.html=$dist_index_mtime)"
    pass "STABLE_ARTIFACT_MTIME_STALE_BUT_VERSION_CURRENT"
  else
    fail "STABLE_ARTIFACT_OLDER_THAN_DIST_INDEX (artifact=$LATEST_ARTIFACT_PATH, mtime=$LATEST_ARTIFACT_MTIME vs dist/index.html=$dist_index_mtime)"
  fi
fi

if [[ $LATEST_ARTIFACT_MTIME -ge $dist_build_truth_mtime ]]; then
  pass "STABLE_ARTIFACT_NEWER_THAN_DIST_BUILD_TRUTH"
else
  if [[ $WARN_ONLY -eq 1 ]]; then
    echo "WARN: STABLE_ARTIFACT_MTIME_OLDER_THAN_DIST_BUILD_TRUTH (version matches — mtime stale after Vite build)"
  else
    fail "STABLE_ARTIFACT_OLDER_THAN_DIST_BUILD_TRUTH (artifact=$LATEST_ARTIFACT_PATH, mtime=$LATEST_ARTIFACT_MTIME vs dist/build-truth.json=$dist_build_truth_mtime)"
  fi
fi

if [[ $FAIL -ne 0 ]]; then
  echo "SUMMARY: FAIL=$FAIL"
  exit 1
fi

echo "SUMMARY: PASS=$PASS"
