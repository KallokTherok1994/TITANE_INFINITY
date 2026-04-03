#!/bin/bash

# TITANE∞ - Automated unwrap/expect Fix Script
# This script helps identify and suggest fixes for unwrap/expect patterns
# DO NOT run automatically - manual review required for each fix

set -e

echo "🔧 TITANE∞ Unwrap/Expect Analysis Tool"
echo "======================================"
echo ""

if [ "$#" -lt 1 ]; then
    echo "Usage: $0 <rust-file>"
    echo ""
    echo "This tool analyzes a Rust file for unwrap/expect patterns"
    echo "and generates suggested fixes."
    echo ""
    echo "Example: $0 src-tauri/src/avatar/appearance_commands.rs"
    exit 1
fi

FILE="$1"

if [ ! -f "$FILE" ]; then
    echo "❌ Error: File not found: $FILE"
    exit 1
fi

echo "📁 Analyzing: $FILE"
echo ""

# Count unwrap and expect
UNWRAP_COUNT=$(grep -c "\.unwrap()" "$FILE" 2>/dev/null || echo "0")
EXPECT_COUNT=$(grep -c "\.expect(" "$FILE" 2>/dev/null || echo "0")
TOTAL=$((UNWRAP_COUNT + EXPECT_COUNT))

echo "📊 Statistics:"
echo "  - .unwrap() calls: $UNWRAP_COUNT"
echo "  - .expect() calls: $EXPECT_COUNT"
echo "  - Total to fix:    $TOTAL"
echo ""

if [ "$TOTAL" -eq 0 ]; then
    echo "✅ No unwrap/expect found in this file!"
    exit 0
fi

echo "🔍 Pattern Analysis:"
echo ""

# Show unwrap patterns with context
echo "=== .unwrap() Patterns ==="
grep -n "\.unwrap()" "$FILE" 2>/dev/null | head -10 || echo "None found"
echo ""

echo "=== .expect() Patterns ==="
grep -n "\.expect(" "$FILE" 2>/dev/null | head -10 || echo "None found"
echo ""

echo "💡 Suggested Fix Patterns:"
echo ""
echo "1. Option<T> unwrap → ok_or_else"
echo "   Before: let value = some_option.unwrap();"
echo "   After:  let value = some_option.ok_or_else(|| TitaneError::NoneError(\"Expected value\".into()))?;"
echo ""
echo "2. Result<T, E> unwrap → ? operator"
echo "   Before: let value = some_result.unwrap();"
echo "   After:  let value = some_result?;"
echo ""
echo "3. expect with good message → map_err"
echo "   Before: let value = some_result.expect(\"Failed to load\");"
echo "   After:  let value = some_result.map_err(|e| TitaneError::LoadFailed(e.to_string()))?;"
echo ""
echo "4. Test code → Keep unwrap() but document"
echo "   Before: let value = some_option.unwrap();"
echo "   After:  let value = some_option.unwrap(); // OK in tests"
echo ""

echo "📝 Next Steps:"
echo "1. Review each unwrap/expect call in context"
echo "2. Determine if it's in test code (can keep some)"
echo "3. For production code, replace with proper error handling"
echo "4. Run 'cargo check' after changes"
echo "5. Run tests to ensure no regressions"
echo ""

echo "⚠️  IMPORTANT:"
echo "- DO NOT blindly replace all unwrap() calls"
echo "- Some unwrap() in tests are acceptable"
echo "- Ensure function signature returns Result<T, TitaneError>"
echo "- Add proper error types to TitaneError enum if needed"
echo ""

echo "✅ Analysis complete. Manual review required."
