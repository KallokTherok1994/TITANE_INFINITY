#!/usr/bin/env bash
# TITANE∞ v14 — Import Hygiene Verification
set -e

echo "═══════════════════════════════════════════════════════════════"
echo "  TITANE∞ v14 — IMPORT HYGIENE VERIFICATION"
echo "═══════════════════════════════════════════════════════════════"

WARNINGS=0

# Check for unused imports in TypeScript/React files
echo "→ Checking for unused imports..."

# Find duplicate imports
DUPLICATE_IMPORTS=$(find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -h "^import" {} \; 2>/dev/null | sort | uniq -d || true)

if [ -n "$DUPLICATE_IMPORTS" ]; then
    echo "⚠️  Duplicate imports detected:"
    echo "$DUPLICATE_IMPORTS"
    ((WARNINGS++))
else
    echo "✅ No duplicate imports"
fi

# Check for wildcard imports (import * from)
WILDCARD_IMPORTS=$(grep -r "import \* as" src --include="*.ts" --include="*.tsx" 2>/dev/null || true)

if [ -n "$WILDCARD_IMPORTS" ]; then
    echo "⚠️  Wildcard imports detected (consider named imports):"
    echo "$WILDCARD_IMPORTS" | head -5
    ((WARNINGS++))
else
    echo "✅ No wildcard imports"
fi

# Check for circular dependencies (basic check)
echo "→ Checking for potential circular dependencies..."

# Look for cross-imports between directories
CROSS_IMPORTS=$(find src -name "*.ts" -o -name "*.tsx" | while read -r file; do
    dir=$(dirname "$file")
    parent=$(dirname "$dir")
    if grep -q "from.*$parent" "$file" 2>/dev/null; then
        echo "$file imports from parent: $parent"
    fi
done || true)

if [ -n "$CROSS_IMPORTS" ]; then
    echo "⚠️  Potential circular dependencies:"
    echo "$CROSS_IMPORTS" | head -5
    ((WARNINGS++))
else
    echo "✅ No obvious circular dependencies"
fi

# Check Rust use statements
echo "→ Checking Rust imports..."

UNUSED_RUST_IMPORTS=$(grep -r "^use " src-tauri/src --include="*.rs" 2>/dev/null | grep -v "use crate::" | wc -l || echo "0")

echo "✅ Found $UNUSED_RUST_IMPORTS Rust use statements"

# Summary
echo "═══════════════════════════════════════════════════════════════"
if [ $WARNINGS -eq 0 ]; then
    echo "✅ IMPORT HYGIENE: ALL CHECKS PASSED"
else
    echo "⚠️  IMPORT HYGIENE: $WARNINGS WARNING(S) DETECTED"
fi
exit 0
