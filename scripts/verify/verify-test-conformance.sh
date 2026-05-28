#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
REPORT_DIR="$ROOT_DIR/reports"
REPORT_FILE="$REPORT_DIR/test-conformance-$(date -u +%Y%m%dT%H%M%SZ).txt"
mkdir -p "$REPORT_DIR"

passes=0
failures=0

pass() {
  echo "PASS: $1" | tee -a "$REPORT_FILE"
  passes=$((passes + 1))
}

fail() {
  echo "FAIL: $1" | tee -a "$REPORT_FILE"
  failures=$((failures + 1))
}

check_file() {
  local path="$1"
  if [[ -f "$ROOT_DIR/$path" ]]; then
    pass "FILE_PRESENT $path"
  else
    fail "FILE_MISSING $path"
  fi
}

echo "TEST_CONFORMANCE_REPORT=$REPORT_FILE"

if node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))" >/dev/null 2>&1; then
  pass "PACKAGE_JSON_VALID"
else
  fail "PACKAGE_JSON_INVALID"
fi

for script_name in prebuild prebuild:frontend-runtime verify:frontend-runtime-prebuild; do
  if node -e "const s=require('./package.json').scripts||{}; process.exit(s['$script_name']==='bash scripts/verify/prebuild-frontend-runtime-certifier.sh'?0:1)" >/dev/null 2>&1; then
    pass "PACKAGE_SCRIPT_${script_name}"
  else
    fail "PACKAGE_SCRIPT_${script_name}"
  fi
done

check_file "vitest.config.ts"
check_file "vitest.unit.config.ts"
check_file "vitest.workspace.ts"
check_file "playwright.config.ts"
check_file "tailwind.config.ts"
check_file "e2e/desktop/memory-dashboard-runtime-proof.wdio.test.js"
check_file "e2e/desktop/ui-driver.wdio.js"

if node -e "import('./vitest.config.ts')" >/dev/null 2>&1; then
  pass "VITEST_CONFIG_IMPORT"
else
  fail "VITEST_CONFIG_IMPORT"
fi

if grep -q "mergeConfig(sharedTestConfig" "$ROOT_DIR/vitest.unit.config.ts" &&
  ! grep -q "src/__tests__/hooks/useMediaQuery.test.tsx" "$ROOT_DIR/vitest.unit.config.ts"; then
  pass "VITEST_UNIT_CONFIG_BOUNDARY"
else
  fail "VITEST_UNIT_CONFIG_BOUNDARY"
fi

if grep -q "defineWorkspace" "$ROOT_DIR/vitest.workspace.ts" &&
  grep -q "vitest.unit.config.ts" "$ROOT_DIR/vitest.workspace.ts" &&
  grep -q "vitest.integration.config.ts" "$ROOT_DIR/vitest.workspace.ts"; then
  pass "VITEST_WORKSPACE_BOUNDARY"
else
  fail "VITEST_WORKSPACE_BOUNDARY"
fi

if node -e "import('./playwright.config.ts')" >/dev/null 2>&1; then
  pass "PLAYWRIGHT_CONFIG_IMPORT"
else
  fail "PLAYWRIGHT_CONFIG_IMPORT"
fi

for setup_file in "./src/__tests__/setup.ts"; do
  if grep -q "$setup_file" "$ROOT_DIR/vitest.config.ts"; then
    pass "VITEST_SETUP_REFERENCED $setup_file"
  else
    fail "VITEST_SETUP_MISSING $setup_file"
  fi
done

if grep -q "./src/setupTests.ts\\|./src/test/setup.ts\\|./src/test-utils/setup.ts" "$ROOT_DIR/vitest.config.ts"; then
  fail "VITEST_SETUP_DUPLICATE_LEGACY_REFERENCES"
else
  pass "VITEST_SETUP_SINGLE_CANONICAL_FILE"
fi

if grep -q "vitest.config.ts" "$ROOT_DIR/vitest.workspace.ts"; then
  fail "VITEST_WORKSPACE_INCLUDES_CORE_DUPLICATE"
else
  pass "VITEST_WORKSPACE_NO_CORE_DUPLICATE"
fi

if bash -n "$ROOT_DIR/scripts/verify/prebuild-frontend-runtime-certifier.sh" >/dev/null 2>&1; then
  pass "FRONTEND_PREBUILD_CERTIFIER_BASH_SYNTAX"
else
  fail "FRONTEND_PREBUILD_CERTIFIER_BASH_SYNTAX"
fi

echo "SUMMARY: PASS=$passes FAIL=$failures" | tee -a "$REPORT_FILE"

if [[ "$failures" -eq 0 ]]; then
  echo "PASS: TEST_CONFORMANCE_BOUNDARY" | tee -a "$REPORT_FILE"
  exit 0
fi

echo "FAIL: TEST_CONFORMANCE_BOUNDARY" | tee -a "$REPORT_FILE"
exit 1
