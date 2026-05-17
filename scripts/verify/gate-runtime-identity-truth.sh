#!/usr/bin/env bash
# TITANE∞ — Gate: Runtime Identity Truth
# Verifies runtime identity files exist and are well-formed.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/../.."

PASS=0
FAIL=0

check() {
  local label="$1"
  local file="$2"
  if [[ -f "$file" ]]; then
    echo "PASS: $label ($file)"
    ((PASS++)) || true
  else
    echo "FAIL: $label — missing $file"
    ((FAIL++)) || true
  fi
}

check "RUNTIME_IDENTITY_UTIL" "src/utils/runtimeIdentity.ts"
check "RUNTIME_IDENTITY_PROBE" "src/components/dev/RuntimeIdentityProbe.tsx"
check "BUILD_TRUTH_JSON" "dist/build-truth.json"

# Validate build-truth.json is parseable and has expected fields
if [[ -f "dist/build-truth.json" ]]; then
  if node -e "
    const bt = require('./dist/build-truth.json');
    if (!bt.appVersion) throw new Error('missing appVersion');
    if (!bt.buildTimestamp) throw new Error('missing buildTimestamp');
    const pkg = require('./package.json');
    if (bt.appVersion !== pkg.version) {
      throw new Error('version mismatch: bt=' + bt.appVersion + ' pkg=' + pkg.version);
    }
    console.log('buildTruth.appVersion=' + bt.appVersion);
    console.log('buildTruth.buildTimestamp=' + bt.buildTimestamp);
  " 2>/dev/null; then
    echo "PASS: BUILD_TRUTH_VERSION_MATCHES_PACKAGE"
    ((PASS++)) || true
  else
    echo "FAIL: BUILD_TRUTH_VERSION_MISMATCH"
    ((FAIL++)) || true
  fi
fi

# Check runtimeIdentity.ts exports expected interface
if grep -q "RuntimeKind\|RuntimeIdentity\|resolveRuntimeIdentity" src/utils/runtimeIdentity.ts 2>/dev/null; then
  echo "PASS: RUNTIME_IDENTITY_EXPORTS_PRESENT"
  ((PASS++)) || true
else
  echo "FAIL: RUNTIME_IDENTITY_EXPORTS_MISSING"
  ((FAIL++)) || true
fi

echo ""
echo "══════════════════════════════════════"
echo "SUMMARY: PASS=$PASS FAIL=$FAIL"
if [[ $FAIL -eq 0 ]]; then
  echo "PASS: gate-runtime-identity-truth"
  exit 0
else
  echo "FAIL: gate-runtime-identity-truth"
  exit 1
fi
