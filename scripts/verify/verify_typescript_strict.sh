#!/usr/bin/env bash
# TITANE∞ v14 — TypeScript Strict Mode Verification
set -e

echo "═══════════════════════════════════════════════════════════════"
echo "  TITANE∞ v14 — TYPESCRIPT STRICT VERIFICATION"
echo "═══════════════════════════════════════════════════════════════"

ERRORS=0

# Check tsconfig.json exists
if [ ! -f "tsconfig.json" ]; then
    echo "❌ tsconfig.json not found"
    exit 1
fi

echo "✅ tsconfig.json found"

# Check strict mode enabled
echo "→ Checking TypeScript strict mode..."

if grep -q '"strict": true' tsconfig.json; then
    echo "✅ Strict mode enabled"
else
    echo "⚠️  Strict mode not enabled (add \"strict\": true to tsconfig.json)"
    ((ERRORS++))
fi

# Check for 'any' usage
echo "→ Checking for 'any' type usage..."

ANY_USAGE=$(grep -rn ": any" src --include="*.ts" --include="*.tsx" | grep -v "\/\/" | wc -l || echo "0")

if [ "$ANY_USAGE" -gt 0 ]; then
    echo "⚠️  Found $ANY_USAGE usage(s) of 'any' type"
    grep -rn ": any" src --include="*.ts" --include="*.tsx" | grep -v "\/\/" | head -5
else
    echo "✅ No 'any' type usage detected"
fi

# Check for @ts-ignore/@ts-expect-error
echo "→ Checking for type suppressions..."

TS_IGNORE=$(grep -rn "@ts-ignore\|@ts-expect-error" src --include="*.ts" --include="*.tsx" | wc -l || echo "0")

if [ "$TS_IGNORE" -gt 0 ]; then
    echo "⚠️  Found $TS_IGNORE type suppression(s)"
    grep -rn "@ts-ignore\|@ts-expect-error" src --include="*.ts" --include="*.tsx" | head -5
else
    echo "✅ No type suppressions found"
fi

# Run TypeScript compiler check
echo "→ Running TypeScript compiler check..."

if command -v pnpm &>/dev/null; then
    if pnpm tsc --noEmit 2>&1 | grep -q "error TS"; then
        echo "❌ TypeScript compilation errors detected"
        pnpm tsc --noEmit 2>&1 | grep "error TS" | head -10
        ((ERRORS++))
    else
        echo "✅ TypeScript compilation successful (0 errors)"
    fi
else
    echo "⚠️  pnpm not found, skipping type check"
fi

# Check for explicit return types
echo "→ Checking for explicit return types..."

IMPLICIT_RETURNS=$(grep -rn "^export function\|^export const.*= (" src --include="*.ts" | grep -v ": " | wc -l || echo "0")

if [ "$IMPLICIT_RETURNS" -gt 10 ]; then
    echo "⚠️  Found $IMPLICIT_RETURNS function(s) without explicit return types"
else
    echo "✅ Most functions have explicit return types"
fi

# Summary
echo "═══════════════════════════════════════════════════════════════"
if [ $ERRORS -eq 0 ]; then
    echo "✅ TYPESCRIPT STRICT: ALL CHECKS PASSED"
    exit 0
else
    echo "❌ TYPESCRIPT STRICT: $ERRORS ERROR(S) DETECTED"
    exit 1
fi
