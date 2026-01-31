#!/bin/bash
# TITANE∞ Feedback Loop Monitoring Dashboard
# Real-time issue/discussion tracking and analytics

REPO="KallokTherok1994/TITANE_INFINITY"
TODAY=$(date +%Y-%m-%d)
REPORT_DIR="docs/feedback/reports"

mkdir -p "$REPORT_DIR"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  TITANE∞ FEEDBACK MONITORING DASHBOARD                        ║"
echo "║  $(date '+%d %B %Y — %H:%M:%S UTC')                    ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# ═════════════════════════════════════════════════════════════════════
# 1. ISSUE STATISTICS
# ═════════════════════════════════════════════════════════════════════

echo "📊 1. ISSUE STATISTICS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

TOTAL_OPEN=$(gh issue list --repo "$REPO" --state open --json title | jq length)
TOTAL_CLOSED=$(gh issue list --repo "$REPO" --state closed --json title | jq length)
TOTAL_ALL=$((TOTAL_OPEN + TOTAL_CLOSED))
CLOSURE_RATE=$((TOTAL_CLOSED * 100 / TOTAL_ALL))

echo "Total Issues: $TOTAL_ALL"
echo "  • Open: $TOTAL_OPEN"
echo "  • Closed: $TOTAL_CLOSED"
echo "  • Closure Rate: ${CLOSURE_RATE}%"
echo ""

# ═════════════════════════════════════════════════════════════════════
# 2. ISSUES BY CATEGORY
# ═════════════════════════════════════════════════════════════════════

echo "🏷️  2. ISSUES BY CATEGORY (OPEN)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

DOC_GAP=$(gh issue list --repo "$REPO" --state open --label "documentation,gap" --json title | jq length)
API_ISSUES=$(gh issue list --repo "$REPO" --state open --label "api" --json title | jq length)
HELP=$(gh issue list --repo "$REPO" --state open --label "help" --json title | jq length)
ENHANCEMENT=$(gh issue list --repo "$REPO" --state open --label "enhancement" --json title | jq length)
TRIAGE=$(gh issue list --repo "$REPO" --state open --label "triage" --json title | jq length)

echo "Documentation Gap:  $DOC_GAP issues"
echo "API Issues:         $API_ISSUES issues"
echo "Help Questions:     $HELP issues"
echo "Enhancements:       $ENHANCEMENT issues"
echo "Needs Triage:       $TRIAGE issues"
echo ""

# ═════════════════════════════════════════════════════════════════════
# 3. PRIORITY BREAKDOWN
# ═════════════════════════════════════════════════════════════════════

echo "🚨 3. PRIORITY BREAKDOWN (OPEN)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

CRITICAL=$(gh issue list --repo "$REPO" --state open --json labels,title | \
  jq '[.[] | select(.labels[].name == "critical")] | length')
HIGH=$(gh issue list --repo "$REPO" --state open --json labels,title | \
  jq '[.[] | select(.labels[].name == "high")] | length')
MEDIUM=$(gh issue list --repo "$REPO" --state open --json labels,title | \
  jq '[.[] | select(.labels[].name == "medium")] | length')
LOW=$(gh issue list --repo "$REPO" --state open --json labels,title | \
  jq '[.[] | select(.labels[].name == "low")] | length')

echo "🔴 Critical: $CRITICAL"
echo "🟠 High:     $HIGH"
echo "🟡 Medium:   $MEDIUM"
echo "🟢 Low:      $LOW"
echo ""

# ═════════════════════════════════════════════════════════════════════
# 4. AGE ANALYSIS (STALE ISSUES)
# ═════════════════════════════════════════════════════════════════════

echo "⏱️  4. ISSUE AGE ANALYSIS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Issues created in last 7 days
LAST_7D=$(gh issue list --repo "$REPO" --state open --json createdAt | \
  jq "[.[] | select(.createdAt > (now - 7*86400))] | length")

# Issues > 7 days old (stale)
STALE_7D=$(gh issue list --repo "$REPO" --state open --json createdAt | \
  jq "[.[] | select(.createdAt < (now - 7*86400))] | length")

# Issues > 30 days old (very stale)
STALE_30D=$(gh issue list --repo "$REPO" --state open --json createdAt | \
  jq "[.[] | select(.createdAt < (now - 30*86400))] | length")

echo "New (< 7 days):     $LAST_7D issues"
echo "Stale (7-30 days):  $((STALE_7D - STALE_30D)) issues"
echo "Very Stale (30d+):  $STALE_30D issues ⚠️"
echo ""

# ═════════════════════════════════════════════════════════════════════
# 5. TOP OPEN ISSUES (HOTTEST)
# ═════════════════════════════════════════════════════════════════════

echo "🔥 5. TOP 5 ISSUES (OLDEST OPEN)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
gh issue list --repo "$REPO" --state open --limit 5 --json number,title,createdAt | \
  jq -r '.[] | "#\(.number): \(.title) (age: \((now - (.createdAt | fromdate)) / 86400 | floor) days)"'
echo ""

# ═════════════════════════════════════════════════════════════════════
# 6. RECENT CLOSURES
# ═════════════════════════════════════════════════════════════════════

echo "✅ 6. RECENTLY CLOSED (LAST 7 DAYS)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

CLOSED_WEEK=$(gh issue list --repo "$REPO" --state closed --json number,title,closedAt | \
  jq "[.[] | select(.closedAt > (now - 7*86400))] | length")

echo "Closed this week: $CLOSED_WEEK issues"
echo ""

# ═════════════════════════════════════════════════════════════════════
# 7. KEYWORD ANALYSIS (TOP TOPICS)
# ═════════════════════════════════════════════════════════════════════

echo "💬 7. TOP KEYWORDS IN ISSUES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

KEYWORDS=$(gh issue list --repo "$REPO" --state open --json title,body | \
  jq -r '.[].title + " " + (.body // "")' | \
  tr ' ' '\n' | \
  grep -E '^[a-z]{4,}$' | \
  sort | uniq -c | sort -rn | head -15)

echo "$KEYWORDS"
echo ""

# ═════════════════════════════════════════════════════════════════════
# 8. RESPONSE TIME ANALYSIS
# ═════════════════════════════════════════════════════════════════════

echo "⏱️  8. AVERAGE RESPONSE TIME (CLOSED ISSUES)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Note: This is a simplified version; actual calculation depends on comments
AVG_TIME=$(gh issue list --repo "$REPO" --state closed --limit 30 --json closedAt,createdAt | \
  jq '[.[] | ((.closedAt | fromdate) - (.createdAt | fromdate)) / 3600] | add / length | floor' 2>/dev/null || echo "?")

echo "Average: ~${AVG_TIME}h (from creation to closure)"
echo ""

# ═════════════════════════════════════════════════════════════════════
# 9. RECOMMENDATIONS
# ═════════════════════════════════════════════════════════════════════

echo "💡 9. RECOMMENDATIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$STALE_30D" -gt 3 ]; then
  echo "⚠️  Review $STALE_30D very stale issues (>30 days)"
  echo "   Action: Prioritize or close if not actionable"
fi

if [ "$CRITICAL" -gt 0 ]; then
  echo "🔴 $CRITICAL critical issues open"
  echo "   Action: Assign resources immediately"
fi

if [ "$TRIAGE" -gt 5 ]; then
  echo "🏷️  $TRIAGE issues need triage"
  echo "   Action: Categorize and prioritize"
fi

if [ "$CLOSURE_RATE" -lt 70 ]; then
  echo "📉 Closure rate is ${CLOSURE_RATE}% (target: 80%+)"
  echo "   Action: Accelerate resolution process"
fi

echo ""

# ═════════════════════════════════════════════════════════════════════
# 10. ACTION ITEMS
# ═════════════════════════════════════════════════════════════════════

echo "✅ 10. ACTION ITEMS FOR TODAY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "- [ ] Review $STALE_7D stale issues"
echo "- [ ] Respond to $LAST_7D new issues"
if [ "$CRITICAL" -gt 0 ]; then
  echo "- [ ] ⚠️  Handle $CRITICAL critical issues"
fi
echo "- [ ] Update feedback tracking spreadsheet"
echo "- [ ] Close resolved issues without follow-up"
echo ""

# ═════════════════════════════════════════════════════════════════════
# SAVE REPORT
# ═════════════════════════════════════════════════════════════════════

# Save to file for archival
REPORT_FILE="$REPORT_DIR/feedback_dashboard_$TODAY.txt"

{
  echo "╔════════════════════════════════════════════════════════════════╗"
  echo "║  TITANE∞ FEEDBACK MONITORING DASHBOARD                        ║"
  echo "║  $(date '+%d %B %Y — %H:%M:%S UTC')                    ║"
  echo "╚════════════════════════════════════════════════════════════════╝"
  echo ""
  echo "SUMMARY METRICS"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Total Open:         $TOTAL_OPEN"
  echo "Total Closed:       $TOTAL_CLOSED"
  echo "Closure Rate:       ${CLOSURE_RATE}%"
  echo ""
  echo "BY CATEGORY"
  echo "  Doc Gap:          $DOC_GAP"
  echo "  API Issues:       $API_ISSUES"
  echo "  Help:             $HELP"
  echo "  Enhancements:     $ENHANCEMENT"
  echo ""
  echo "BY PRIORITY"
  echo "  Critical:         $CRITICAL"
  echo "  High:             $HIGH"
  echo "  Medium:           $MEDIUM"
  echo "  Low:              $LOW"
  echo ""
  echo "BY AGE"
  echo "  New (<7d):        $LAST_7D"
  echo "  Stale (7-30d):    $((STALE_7D - STALE_30D))"
  echo "  Very Stale (30+): $STALE_30D"
  echo ""
  echo "Generated: $TODAY at $(date +%H:%M:%S UTC)"
} > "$REPORT_FILE"

echo "📁 Report saved to: $REPORT_FILE"
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  END OF DASHBOARD                                             ║"
echo "╚════════════════════════════════════════════════════════════════╝"
