#!/usr/bin/env bash
# TITANE∞ v14 — React Hooks Verification
set -e

echo "═══════════════════════════════════════════════════════════════"
echo "  TITANE∞ v14 — REACT HOOKS VERIFICATION"
echo "═══════════════════════════════════════════════════════════════"

WARNINGS=0

# Check for useEffect without dependencies
echo "→ Checking for useEffect without dependency arrays..."

MISSING_DEPS=$(grep -rn "useEffect(" src --include="*.tsx" --include="*.ts" | grep -v "\[\]" | grep -v "\/\/" || true)

if [ -n "$MISSING_DEPS" ]; then
    COUNT=$(echo "$MISSING_DEPS" | wc -l)
    echo "⚠️  Found $COUNT useEffect without explicit dependencies:"
    echo "$MISSING_DEPS" | head -5
    ((WARNINGS++))
else
    echo "✅ All useEffect hooks have dependency arrays"
fi

# Check for useState without type annotations
echo "→ Checking for useState without types..."

UNTYPED_STATE=$(grep -rn "useState(" src --include="*.tsx" --include="*.ts" | grep -v "<" | grep -v "\/\/" || true)

if [ -n "$UNTYPED_STATE" ]; then
    COUNT=$(echo "$UNTYPED_STATE" | wc -l)
    echo "⚠️  Found $COUNT useState without type annotations:"
    echo "$UNTYPED_STATE" | head -5
    ((WARNINGS++))
else
    echo "✅ All useState hooks have type annotations"
fi

# Check for useCallback/useMemo usage
echo "→ Checking for optimization hooks..."

CALLBACKS=$(grep -r "useCallback\|useMemo" src --include="*.tsx" --include="*.ts" | wc -l || echo "0")
echo "  → Found $CALLBACKS optimization hooks (useCallback/useMemo)"

# Check for custom hooks naming
echo "→ Checking custom hooks naming..."

CUSTOM_HOOKS=$(find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "^export.*function use[A-Z]" {} \; || true)

if [ -n "$CUSTOM_HOOKS" ]; then
    COUNT=$(echo "$CUSTOM_HOOKS" | wc -l)
    echo "✅ Found $COUNT custom hook(s)"
else
    echo "  → No custom hooks detected"
fi

# Check for hooks called conditionally (basic check)
echo "→ Checking for conditional hook calls..."

CONDITIONAL_HOOKS=$(grep -rn "if.*use[A-Z]" src --include="*.tsx" --include="*.ts" | grep -v "\/\/" || true)

if [ -n "$CONDITIONAL_HOOKS" ]; then
    echo "❌ Found conditional hook calls (violates Rules of Hooks):"
    echo "$CONDITIONAL_HOOKS"
    ((WARNINGS++))
else
    echo "✅ No conditional hook calls detected"
fi

# Summary
echo "═══════════════════════════════════════════════════════════════"
if [ $WARNINGS -eq 0 ]; then
    echo "✅ REACT HOOKS: ALL CHECKS PASSED"
else
    echo "⚠️  REACT HOOKS: $WARNINGS WARNING(S) DETECTED"
fi
exit 0
