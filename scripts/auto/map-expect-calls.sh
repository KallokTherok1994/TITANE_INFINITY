#!/bin/bash
# 🔍 EXPECT() MAPPING SCRIPT
# Maps all expect() calls in the codebase for systematic refactoring

set -e

REPORT_DIR="reports/expect-mapping"
mkdir -p "$REPORT_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT="$REPORT_DIR/expect_map_${TIMESTAMP}.txt"

echo "🔍 Scanning for expect() calls..."
echo "📊 Report: $REPORT"
echo ""

{
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║  EXPECT() CALL MAPPING — TITANE∞ v26.4.1                 ║"
    echo "║  $(date '+%Y-%m-%d %H:%M:%S')                                  ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "TOTAL expect() CALLS:"
    grep -rn "\.expect(" src-tauri/src --include="*.rs" | wc -l
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "BREAKDOWN BY MODULE:"
    echo "─────────────────────────────────────────────────────────────"
    grep -rn "\.expect(" src-tauri/src --include="*.rs" | cut -d: -f1 | sort | uniq -c | sort -rn | while read count file; do
        echo "  [$count] $file"
    done
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "CRITICAL MODULES (>50 expect() calls):"
    echo "─────────────────────────────────────────────────────────────"
    grep -rn "\.expect(" src-tauri/src --include="*.rs" | cut -d: -f1 | sort | uniq -c | sort -rn | awk '$1 > 50 {print "  [$1] " $2 " — HIGH PRIORITY"}' 
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "HIGH-IMPACT LOCATIONS (with context):"
    echo "─────────────────────────────────────────────────────────────"
    echo ""
    grep -rn "\.expect(" src-tauri/src --include="*.rs" | grep -E "(chat_orchestrator|streaming|unified_memory|providers)" | head -20 | while IFS=: read file line content; do
        echo "  📍 $file:$line"
        echo "     → $content"
        echo ""
    done
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "PATTERN ANALYSIS:"
    echo "─────────────────────────────────────────────────────────────"
    echo ""
    echo "Most common expect() patterns:"
    grep -rn "\.expect(" src-tauri/src --include="*.rs" | sed 's/.*\.expect(//' | sort | uniq -c | sort -rn | head -10
    echo ""
    
} | tee "$REPORT"

echo ""
echo "✅ Report saved to: $REPORT"
echo ""
echo "📈 NEXT STEPS:"
echo "  1. Review critical modules in detail"
echo "  2. Create GitHub issues for each module"
echo "  3. Start with chat_orchestrator (80+ calls)"
echo "  4. Use this mapping to track progress"
echo ""
echo "📊 Usage:"
echo "  tail -f $REPORT          # View report"
echo "  grep chat_orchestrator $REPORT  # Filter module"
