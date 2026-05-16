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

# Compare latest stable artifact mtime with dist artifacts
if [[ ! -f dist/index.html || ! -f dist/build-truth.json ]]; then
  exit 1
fi

dist_index_mtime=$(stat -c '%Y' dist/index.html)
dist_build_truth_mtime=$(stat -c '%Y' dist/build-truth.json)

# Stable artifact freshness check: artifact must be newer than both dist/index.html and dist/build-truth.json
if [[ $LATEST_ARTIFACT_MTIME -ge $dist_index_mtime ]]; then
  pass "STABLE_ARTIFACT_NEWER_THAN_DIST_INDEX"
else
  fail "STABLE_ARTIFACT_OLDER_THAN_DIST_INDEX (artifact=$LATEST_ARTIFACT_PATH, mtime=$LATEST_ARTIFACT_MTIME vs dist/index.html=$dist_index_mtime)"
fi

if [[ $LATEST_ARTIFACT_MTIME -ge $dist_build_truth_mtime ]]; then
  pass "STABLE_ARTIFACT_NEWER_THAN_DIST_BUILD_TRUTH"
else
  fail "STABLE_ARTIFACT_OLDER_THAN_DIST_BUILD_TRUTH (artifact=$LATEST_ARTIFACT_PATH, mtime=$LATEST_ARTIFACT_MTIME vs dist/build-truth.json=$dist_build_truth_mtime)"
fi

if [[ $FAIL -ne 0 ]]; then
  echo "SUMMARY: FAIL=$FAIL"
  exit 1
fi

echo "SUMMARY: PASS=$PASS"
