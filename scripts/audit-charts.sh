#!/usr/bin/env bash
# TITANE∞ Charting Libraries Audit Script
# Analyzes usage of different charting libraries to identify consolidation opportunities

set -euo pipefail

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║        TITANE∞ Charting Libraries Usage Audit                   ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Define charting libraries to audit
LIBS=(
  "chart.js"
  "react-chartjs-2"
  "recharts"
  "react-d3-tree"
  "react-chrono"
)

TOTAL_MATCHES=0
TOTAL_FILES=0

# Function to search for library usage
audit_library() {
  local lib=$1
  echo "─────────────────────────────────────────────────────────────────"
  echo "📊 Auditing: $lib"
  echo "─────────────────────────────────────────────────────────────────"
  
  # Search for imports
  local import_pattern="import.*from.*['\"]$lib"
  local matches=$(grep -r -E "$import_pattern" src/ 2>/dev/null || true)
  local file_count=$(echo "$matches" | grep -v "^$" | wc -l)
  
  if [ "$file_count" -gt 0 ]; then
    echo "✓ Found $file_count import(s)"
    echo ""
    echo "Files:"
    echo "$matches" | grep -v "^$" | sed 's/:.*//g' | sort -u | sed 's/^/  • /'
    echo ""
    
    # Show example imports
    echo "Example imports:"
    echo "$matches" | grep -v "^$" | head -3 | sed 's/^/  /'
    
    TOTAL_MATCHES=$((TOTAL_MATCHES + file_count))
    TOTAL_FILES=$((TOTAL_FILES + $(echo "$matches" | grep -v "^$" | sed 's/:.*//g' | sort -u | wc -l)))
  else
    echo "✗ No imports found (UNUSED)"
  fi
  
  echo ""
}

# Audit each library
for lib in "${LIBS[@]}"; do
  audit_library "$lib"
done

# Summary
echo "═══════════════════════════════════════════════════════════════════"
echo "📈 SUMMARY"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "Total libraries audited: ${#LIBS[@]}"
echo "Total import statements: $TOTAL_MATCHES"
echo "Total files using charts: $TOTAL_FILES"
echo ""

# Recommendations
echo "═══════════════════════════════════════════════════════════════════"
echo "💡 RECOMMENDATIONS"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

if [ "$TOTAL_FILES" -eq 0 ]; then
  echo "✅ No charting libraries in use (can remove from package.json)"
elif [ "${#LIBS[@]}" -eq "$TOTAL_MATCHES" ] && [ "$TOTAL_MATCHES" -gt 2 ]; then
  echo "⚠️  Multiple charting libraries detected"
  echo "   Consider consolidating to 1-2 primary libraries"
  echo ""
  echo "   Suggested approach:"
  echo "   1. Identify most-used library (above)"
  echo "   2. Migrate less-used charts to primary library"
  echo "   3. Remove redundant dependencies"
  echo ""
  echo "   Potential savings: 50-100 KB"
else
  echo "✅ Charting library usage is reasonable"
  echo "   No consolidation needed at this time"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "🎯 Next Steps"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "1. Review the files listed above"
echo "2. Identify common chart types (bar, line, pie, etc.)"
echo "3. Check if one library can handle all use cases"
echo "4. Plan migration if consolidation is beneficial"
echo ""
echo "For detailed bundle analysis:"
echo "  pnpm run build"
echo "  open dist/stats.html"
echo ""

exit 0
