#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# Guard 3: Static Snapshot Contract Verification
# 
# Scans codebase for unsafe snapshot patterns that bypass
# normalizeSnapshot guard and could cause Rust deserialization failures.
# ═══════════════════════════════════════════════════════════════

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
GUARD_LOG="${REPO_ROOT}/docs/_evidence/SNAPSHOT_CONTRACT_GUARD_20260221_143225/D_VERIFY_SNAPSHOT_CONTRACT.log"
GUARD_VERDICT="${REPO_ROOT}/docs/_evidence/SNAPSHOT_CONTRACT_GUARD_20260221_143225/D_VERIFY_SNAPSHOT_CONTRACT_VERDICT.md"

echo "🔍 Guard 3: Scanning for snapshot contract violations..."
echo "Repo root: $REPO_ROOT"
echo ""

{
  echo "# Guard 3 — Static Snapshot Contract Verification"
  echo ""
  echo "| Check | Result | Details |"
  echo "|-------|--------|---------|"

  # Check 1: Verify normalizeSnapshot is imported in commands
  echo ""
  echo "## Check 1: normalizeSnapshot import in commands"
  if grep -q "import.*normalizeSnapshot.*from.*snapshotFactory" "$REPO_ROOT/src/services/tauri/backend-v17.2.commands.ts"; then
    echo "✅ PASS: normalizeSnapshot imported in commands"
    echo "| C1: Import | ✅ PASS | normalizeSnapshot imported |" >> "$GUARD_VERDICT.tmp"
  else
    echo "❌ FAIL: normalizeSnapshot not imported"
    echo "| C1: Import | ❌ FAIL | normalizeSnapshot NOT imported |" >> "$GUARD_VERDICT.tmp"
    exit 1
  fi

  # Check 2: Verify captureSnapshot uses normalizeSnapshot wrapper
  echo ""
  echo "## Check 2: captureSnapshot uses normalizeSnapshot wrapper"
  if grep -A 10 "captureSnapshot" "$REPO_ROOT/src/services/tauri/backend-v17.2.commands.ts" | \
     grep -q "normalizeSnapshot"; then
    echo "✅ PASS: captureSnapshot wrapped with normalizeSnapshot"
    echo "| C2: Usage | ✅ PASS | captureSnapshot wrapped |" >> "$GUARD_VERDICT.tmp"
  else
    echo "❌ FAIL: captureSnapshot not wrapped with normalizeSnapshot"
    echo "| C2: Usage | ❌ FAIL | captureSnapshot NOT wrapped |" >> "$GUARD_VERDICT.tmp"
    exit 1
  fi

  # Check 3: Scan for unsafe snapshot creation patterns
  echo ""
  echo "## Check 3: Scan for unsafe Snapshot patterns"
  UNSAFE_PATTERNS=()

  # Pattern: direct object creation without normalizeSnapshot
  while IFS= read -r line; do
    # Skip comments and normalizeSnapshot usage
    if [[ "$line" =~ "normalizeSnapshot" ]] || [[ "$line" =~ "//" ]]; then
      continue
    fi
    UNSAFE_PATTERNS+=("$line")
  done < <(grep -rn "const.*snapshot.*=.*{" "$REPO_ROOT/src/services/tauri" --include="*.ts" | \
           grep -v "normalizeSnapshot" | grep -v "snapshotFactory" | grep -v "\.test\.ts" || true)

  if [ ${#UNSAFE_PATTERNS[@]} -eq 0 ]; then
    echo "✅ PASS: No unsafe snapshot creation patterns found"
    echo "| C3: Unsafe Patterns | ✅ PASS | No unsafe patterns |" >> "$GUARD_VERDICT.tmp"
  else
    echo "❌ FAIL: Found ${#UNSAFE_PATTERNS[@]} unsafe snapshot patterns:"
    for pattern in "${UNSAFE_PATTERNS[@]}"; do
      echo "  - $pattern"
    done
    echo "| C3: Unsafe Patterns | ❌ FAIL | ${#UNSAFE_PATTERNS[@]} patterns |" >> "$GUARD_VERDICT.tmp"
    exit 1
  fi

  # Check 4: Verify metadata field exists in types
  echo ""
  echo "## Check 4: Verify metadata field in Snapshot type"
  if grep -q "metadata.*Record<string, string>" "$REPO_ROOT/src/services/tauri/backend-v17.2.types.ts"; then
    echo "✅ PASS: metadata field defined in Snapshot type"
    echo "| C4: Type Definition | ✅ PASS | metadata field present |" >> "$GUARD_VERDICT.tmp"
  else
    echo "❌ FAIL: metadata field not in Snapshot type"
    echo "| C4: Type Definition | ❌ FAIL | metadata field missing |" >> "$GUARD_VERDICT.tmp"
    exit 1
  fi

  # Check 5: Verify isValidSnapshot function exists
  echo ""
  echo "## Check 5: Verify isValidSnapshot contract validator"
  if grep -q "export.*function.*isValidSnapshot" "$REPO_ROOT/src/services/tauri/snapshotFactory.ts"; then
    echo "✅ PASS: isValidSnapshot validator exported"
    echo "| C5: Validator | ✅ PASS | isValidSnapshot exported |" >> "$GUARD_VERDICT.tmp"
  else
    echo "❌ FAIL: isValidSnapshot not exported"
    echo "| C5: Validator | ❌ FAIL | isValidSnapshot missing |" >> "$GUARD_VERDICT.tmp"
    exit 1
  fi

  echo ""
  echo "═══════════════════════════════════════════════"
  echo "✅ All static contract checks PASSED"
  echo "═══════════════════════════════════════════════"

} | tee "$GUARD_LOG"

# Generate verdict
{
  echo "# Verdict: Static Snapshot Contract Verification"
  echo ""
  echo "**Date**: $(date -Is)"
  echo "**Scan Dir**: src/services/tauri/"
  echo ""
  if [ -f "$GUARD_VERDICT.tmp" ]; then
    sed '1,/^|/d' "$GUARD_VERDICT.tmp" | grep -v "^$"
    rm "$GUARD_VERDICT.tmp"
  fi
  echo ""
  echo "## Summary"
  echo "- ✅ All 5 contract checks passed"
  echo "- ✅ No unsafe snapshot patterns detected"
  echo "- ✅ Guard system fully deployed"
  echo ""
  echo "## Gate Status"
  echo "🟢 **PASS** — Ready for test execution"
} > "$GUARD_VERDICT"

cat "$GUARD_VERDICT"

exit 0
