#!/usr/bin/env bash
# TITANE∞ — Gate: No Stale Visible Version in Runtime-Active Files
# Fails if stale version strings appear in console/logger calls in src/
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/../.."

PASS=0
FAIL=0

ALLOWLIST=(
  "# COMMENT_ONLY"
  ".test.ts"
  ".spec.ts"
  ".test.tsx"
  ".spec.tsx"
  "__tests__"
  "node_modules"
  "dist/"
  "docs/"
  "reports/"
  "proof_packs/"
  ".md"
)

is_allowlisted() {
  local file="$1"
  for pat in "${ALLOWLIST[@]}"; do
    if [[ "$file" == *"$pat"* ]]; then
      return 0
    fi
  done
  return 1
}

# Patterns: stale version strings in runtime-visible positions (console./logger. calls)
# We search for v30.0.0 in log call context
echo "🔍 Scanning for stale v30.0.0 runtime log strings..."

while IFS= read -r line; do
  file="${line%%:*}"
  if is_allowlisted "$file"; then
    continue
  fi
  # Only fail if the line contains a logger/console call
  linetext="${line#*:}"
  linetext="${linetext#*:}"
  if echo "$linetext" | grep -qE "console\.(warn|error|log|info)|logger\.(info|warn|error|debug)"; then
    echo "FAIL: STALE_VERSION_LOG $line"
    ((FAIL++)) || true
  fi
done < <(grep -rn "v30\.0\.0" src/ 2>/dev/null | grep -v "^Binary" || true)

# Check for old installed version visible in user-facing text
echo "🔍 Scanning for v35.1.6 or older in visible metadata..."
OLD_VERSIONS=("v35\.1\.6" "v35\.1\.5" "v35\.1\.4" "v35\.1\.3" "v35\.1\.0" "v34\.")

for pattern in "${OLD_VERSIONS[@]}"; do
  while IFS= read -r line; do
    file="${line%%:*}"
    if is_allowlisted "$file"; then
      continue
    fi
    linetext="${line#*:}"
    linetext="${linetext#*:}"
    if echo "$linetext" | grep -qE "console\.|logger\.|data-app-version|data-build|<title>"; then
      echo "FAIL: STALE_OLD_VERSION $line"
      ((FAIL++)) || true
    fi
  done < <(grep -rn "$pattern" src/ index.html 2>/dev/null | grep -v "^Binary" || true)
done

echo ""
echo "══════════════════════════════════════"
if [[ $FAIL -eq 0 ]]; then
  echo "PASS: gate-no-stale-visible-version — no stale runtime version strings"
  echo "SUMMARY: PASS=$PASS FAIL=$FAIL"
  exit 0
else
  echo "FAIL: gate-no-stale-visible-version — $FAIL stale runtime version string(s) found"
  echo "SUMMARY: PASS=$PASS FAIL=$FAIL"
  exit 1
fi
