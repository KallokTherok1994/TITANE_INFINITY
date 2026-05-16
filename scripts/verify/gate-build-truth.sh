#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"
source "$(dirname "${BASH_SOURCE[0]}")/_rg_compat.sh"

PASS=0
FAIL=0
pass() { echo "PASS: $1"; PASS=$((PASS+1)); }
fail() { echo "FAIL: $1"; FAIL=$((FAIL+1)); }

if [[ -f dist/build-truth.json ]]; then
  pass "BUILD_TRUTH_JSON_PRESENT"
else
  fail "BUILD_TRUTH_JSON_MISSING"
fi

if [[ -f dist/main-entry.json ]]; then
  pass "MAIN_ENTRY_JSON_PRESENT"
else
  fail "MAIN_ENTRY_JSON_MISSING"
fi

if [[ -f dist/build-truth.json ]]; then
  if node -e "const j=require('./dist/build-truth.json'); if (!j.appVersion || typeof j.appVersion !== 'string') process.exit(1);"; then
    pass "BUILD_TRUTH_APPVERSION_PRESENT"
  else
    fail "BUILD_TRUTH_APPVERSION_MISSING_OR_INVALID"
  fi
  if node -e "const j=require('./dist/build-truth.json'); if (!j.buildTimestamp || typeof j.buildTimestamp !== 'string') process.exit(1);"; then
    pass "BUILD_TRUTH_TIMESTAMP_PRESENT"
  else
    fail "BUILD_TRUTH_TIMESTAMP_MISSING_OR_INVALID"
  fi
  if node -e "const j=require('./dist/build-truth.json'); if (!j.mainEntry || typeof j.mainEntry !== 'string') process.exit(1);"; then
    pass "BUILD_TRUTH_MAINENTRY_PRESENT"
  else
    fail "BUILD_TRUTH_MAINENTRY_MISSING_OR_INVALID"
  fi
  if node -e "const j=require('./dist/build-truth.json'); if (!j.viteBase || typeof j.viteBase !== 'string') process.exit(1);"; then
    pass "BUILD_TRUTH_VITEBASE_PRESENT"
  else
    fail "BUILD_TRUTH_VITEBASE_MISSING_OR_INVALID"
  fi
  if node -e "const j=require('./dist/build-truth.json'); if (!j.buildMode || typeof j.buildMode !== 'string') process.exit(1);"; then
    pass "BUILD_TRUTH_BUILDMODE_PRESENT"
  else
    fail "BUILD_TRUTH_BUILDMODE_MISSING_OR_INVALID"
  fi
fi

if node -e "const pkg=require('./package.json'); const truth=require('./dist/build-truth.json'); if (pkg.version!==truth.appVersion) process.exit(1);"; then
  pass "BUILD_TRUTH_VERSION_MATCHES_PACKAGE"
else
  fail "BUILD_TRUTH_VERSION_MISMATCH"
fi

if [[ $FAIL -ne 0 ]]; then
  echo "SUMMARY: FAIL=$FAIL"
  exit 1
fi

echo "SUMMARY: PASS=$PASS"
