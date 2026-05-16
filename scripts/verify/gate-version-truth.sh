#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"
source "$(dirname "${BASH_SOURCE[0]}")/_rg_compat.sh"

FAIL=0
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAIL=$((FAIL+1)); }

PACKAGE_VERSION=$(node -p "require('./package.json').version")
PACKAGE_DESC=$(node -p "require('./package.json').description")

if [[ "$PACKAGE_DESC" == *"v$PACKAGE_VERSION"* ]]; then
  pass "PACKAGE_DESCRIPTION_MATCHES_VERSION"
else
  fail "PACKAGE_DESCRIPTION_MISSING_CURRENT_VERSION"
fi

check_json_version() {
  local path="$1"
  if [[ ! -f "$path" ]]; then
    fail "VERSION_TRUTH_MISSING_FILE $path"
    return
  fi
  local version
  version=$(node -p "require('./$path').version")
  if [[ "$version" == "$PACKAGE_VERSION" ]]; then
    pass "VERSION_TRUTH_FILE_MATCHES_PACKAGE $path"
  else
    fail "VERSION_TRUTH_FILE_MISMATCH $path (found $version)"
  fi
}

check_json_version "src-tauri/tauri.conf.json"
check_json_version "runtime/stable/manifest.json"
check_json_version "runtime/stable/tauri.conf.json"

# Detect stale version labels inside active stable runtime files
for path in runtime/stable/tauri.conf.json runtime/stable/manifest.json; do
  if [[ -f "$path" ]]; then
    if node -e "const fs=require('fs'); const content=fs.readFileSync('$path','utf8'); const pkg=JSON.parse(fs.readFileSync('package.json','utf8')).version; const regex=/v(\d+\.\d+\.\d+)/g; let m; while ((m=regex.exec(content)) !== null) { if (m[1] !== pkg) process.exit(1); }"; then
      pass "VERSION_TRUTH_NO_STALE_LABELS $path"
    else
      fail "VERSION_TRUTH_STALE_LABELS $path"
    fi
  fi
done

if [[ "$FAIL" -ne 0 ]]; then
  echo "SUMMARY: FAIL=$FAIL"
  exit 1
fi

echo "SUMMARY: PASS=ALL"
