#!/bin/bash

set -e

echo "🔍 =================================================="
echo "🔍 VALIDATION PRODUCTION FINALE"
echo "🔍 =================================================="
echo ""

ERRORS=0
WARNINGS=0

check() {
    if [ $? -eq 0 ]; then
        echo "✅ $1"
    else
        echo "❌ $1"
        ((ERRORS++))
    fi
}

warn() {
    echo "⚠️  $1"
    ((WARNINGS++))
}

# 1. Tests
echo "🧪 Running all tests..."
pnpm test -- --coverage --silent && check "Frontend tests" || check "Frontend tests"
cd src-tauri && cargo test --quiet && cd .. && check "Backend tests" || check "Backend tests"

# 2. Security
echo "🔐 Security checks..."
pnpm audit --production --audit-level=high && check "Dependency audit" || check "Dependency audit"
cd src-tauri && cargo audit && cd .. && check "Cargo audit" || check "Cargo audit"

# 3. Linting
echo "📝 Code quality..."
pnpm run lint && check "ESLint" || check "ESLint"
cd src-tauri && cargo clippy -- -D warnings && cd .. && check "Clippy" || check "Clippy"

# 4. Type checking
echo "📘 Type checking..."
pnpm run check && check "TypeScript" || check "TypeScript"

# 5. Build
echo "🔨 Production build..."
pnpm run build && check "Build" || check "Build"

# 6. Coverage
echo "📊 Checking coverage..."
if [ -f coverage/coverage-summary.json ]; then
    COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
    if (( $(echo "$COVERAGE >= 80" | bc -l) )); then
        check "Coverage ($COVERAGE%)"
    else
        warn "Coverage below 80% ($COVERAGE%)"
    fi
fi

# 7. Documentation
echo "📚 Checking documentation..."
for doc in README.md docs/PRODUCTION_READY.md docs/SECURITY_HARDENING.md; do
    if [ -f "$doc" ] && [ $(wc -l < "$doc") -gt 10 ]; then
        check "Documentation: $doc"
    else
        warn "Missing or incomplete: $doc"
    fi
done

# 8. Files check
echo "📁 Checking critical files..."
for file in package.json tsconfig.json src-tauri/Cargo.toml .github/workflows/ci.yml; do
    [ -f "$file" ] && check "File: $file" || warn "Missing: $file"
done

echo ""
echo "=================================================="
echo "📊 RÉSULTAT FINAL"
echo "=================================================="
echo "✅ Checks passed: $(($(ls -1 | wc -l) - ERRORS - WARNINGS))"
echo "❌ Errors: $ERRORS"
echo "⚠️  Warnings: $WARNINGS"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo "🎉 ✅ Tech-Ready (Dev) | Production: ⛔ EN ATTENTE (autorisation requise)! 🚀"
    exit 0
else
    echo "❌ FIX ERRORS BEFORE DEPLOYING"
    exit 1
fi
