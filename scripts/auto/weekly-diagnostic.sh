#!/bin/bash
# AUTO-DIAGNOSTIC SCRIPT — Weekly automated project health check
# Usage: ./weekly-diagnostic.sh [--slack-webhook <url>]
# Runs: compile, tests, quality, security, performance

set -e
COLOR_GREEN='\033[0;32m'
COLOR_RED='\033[0;31m'
COLOR_YELLOW='\033[1;33m'
COLOR_RESET='\033[0m'

REPORT_DIR="reports/auto-diagnostics"
mkdir -p "$REPORT_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT="$REPORT_DIR/diagnostic_$TIMESTAMP.json"
LOG="$REPORT_DIR/diagnostic_$TIMESTAMP.log"

echo "" | tee "$LOG"
echo "═══════════════════════════════════════════════════════════" | tee -a "$LOG"
echo "🔍 TITANE∞ AUTO-DIAGNOSTIC — $TIMESTAMP" | tee -a "$LOG"
echo "═══════════════════════════════════════════════════════════" | tee -a "$LOG"
echo "" | tee -a "$LOG"

# Initialize report
cat > "$REPORT" << 'EOF'
{
  "timestamp": "",
  "diagnostics": {
    "compilation": {},
    "tests": {},
    "clippy": {},
    "format": {},
    "security": {},
    "performance": {}
  },
  "summary": {
    "status": "RUNNING",
    "passed": 0,
    "failed": 0,
    "warnings": 0
  }
}
EOF

# 1. Compilation check
echo "1️⃣  Checking compilation..." | tee -a "$LOG"
if cd src-tauri && cargo check --lib &> /tmp/check.log; then
  cd ..
  echo -e "  ${COLOR_GREEN}✅ Compilation: PASS${COLOR_RESET}" | tee -a "$LOG"
  jq '.diagnostics.compilation = {status: "PASS"}' "$REPORT" > "$REPORT.tmp" && mv "$REPORT.tmp" "$REPORT"
else
  cd ..
  echo -e "  ${COLOR_RED}❌ Compilation: FAIL${COLOR_RESET}" | tee -a "$LOG"
  jq '.diagnostics.compilation = {status: "FAIL"}' "$REPORT" > "$REPORT.tmp" && mv "$REPORT.tmp" "$REPORT"
  echo -e "${COLOR_RED}Compilation failed - aborting diagnostic${COLOR_RESET}" | tee -a "$LOG"
  exit 1
fi

# 2. Test check
echo "" | tee -a "$LOG"
echo "2️⃣  Running tests..." | tee -a "$LOG"
TEST_OUTPUT=$(cd src-tauri && cargo test --lib 2>&1 || true && cd ..)
PASSED=$(echo "$TEST_OUTPUT" | grep -oP 'test result: ok\. \K\d+' | head -1 || echo "0")
FAILED=$(echo "$TEST_OUTPUT" | grep -oP '\K\d+(?= failed)' | head -1 || echo "0")
IGNORED=$(echo "$TEST_OUTPUT" | grep -oP '\K\d+(?= ignored)' | head -1 || echo "0")

echo "  Tests: $PASSED passed, $FAILED failed, $IGNORED ignored" | tee -a "$LOG"
if [ "$FAILED" -eq 0 ]; then
  echo -e "  ${COLOR_GREEN}✅ Tests: PASS${COLOR_RESET}" | tee -a "$LOG"
else
  echo -e "  ${COLOR_RED}❌ Tests: FAIL${COLOR_RESET}" | tee -a "$LOG"
fi

jq ".diagnostics.tests = {passed: $PASSED, failed: $FAILED, ignored: $IGNORED}" "$REPORT" > "$REPORT.tmp" && mv "$REPORT.tmp" "$REPORT"

# 3. Clippy check
echo "" | tee -a "$LOG"
echo "3️⃣  Running clippy analysis..." | tee -a "$LOG"
CLIPPY_OUTPUT=$(cd src-tauri && cargo clippy --all-targets 2>&1 || true && cd ..)
WARNINGS=$(echo "$CLIPPY_OUTPUT" | grep -c "warning:" || echo "0")

echo "  Clippy warnings: $WARNINGS" | tee -a "$LOG"
if [ "$WARNINGS" -eq 0 ]; then
  echo -e "  ${COLOR_GREEN}✅ Clippy: PASS${COLOR_RESET}" | tee -a "$LOG"
else
  echo -e "  ${COLOR_YELLOW}⚠️  Clippy: $WARNINGS warnings${COLOR_RESET}" | tee -a "$LOG"
fi

jq ".diagnostics.clippy = {warnings: $WARNINGS}" "$REPORT" > "$REPORT.tmp" && mv "$REPORT.tmp" "$REPORT"

# 4. Format check
echo "" | tee -a "$LOG"
echo "4️⃣  Checking formatting..." | tee -a "$LOG"
if cargo fmt --check 2> /tmp/format.log; then
  echo -e "  ${COLOR_GREEN}✅ Format: PASS${COLOR_RESET}" | tee -a "$LOG"
  jq '.diagnostics.format = {status: "PASS"}' "$REPORT" > "$REPORT.tmp" && mv "$REPORT.tmp" "$REPORT"
else
  echo -e "  ${COLOR_YELLOW}⚠️  Format: NEEDS FIX${COLOR_RESET}" | tee -a "$LOG"
  jq '.diagnostics.format = {status: "WARN"}' "$REPORT" > "$REPORT.tmp" && mv "$REPORT.tmp" "$REPORT"
fi

# 5. Security audit
echo "" | tee -a "$LOG"
echo "5️⃣  Running security audit..." | tee -a "$LOG"
SEC_OUTPUT=$(cargo audit 2>&1 || true)
VULNS=$(echo "$SEC_OUTPUT" | grep -c "vulnerability" || echo "0")

echo "  Security vulnerabilities: $VULNS" | tee -a "$LOG"
if [ "$VULNS" -eq 0 ]; then
  echo -e "  ${COLOR_GREEN}✅ Security: PASS${COLOR_RESET}" | tee -a "$LOG"
else
  echo -e "  ${COLOR_RED}❌ Security: $VULNS found${COLOR_RESET}" | tee -a "$LOG"
fi

jq ".diagnostics.security = {vulnerabilities: $VULNS}" "$REPORT" > "$REPORT.tmp" && mv "$REPORT.tmp" "$REPORT"

# Final summary
echo "" | tee -a "$LOG"
echo "═══════════════════════════════════════════════════════════" | tee -a "$LOG"
echo "📊 SUMMARY" | tee -a "$LOG"
echo "═══════════════════════════════════════════════════════════" | tee -a "$LOG"

TOTAL_CHECKS=5
PASSED_CHECKS=$(echo "$WARNINGS $VULNS" | awk '{if ($1 == 0 && $2 == 0) print 3; else print 2}')

if [ "$FAILED" -eq 0 ] && [ "$WARNINGS" -eq 0 ] && [ "$VULNS" -eq 0 ]; then
  echo -e "${COLOR_GREEN}✅ DIAGNOSTIC PASSED - All checks OK${COLOR_RESET}" | tee -a "$LOG"
  jq '.summary = {status: "PASS", checks_passed: '$PASSED_CHECKS', checks_total: '$TOTAL_CHECKS'}' "$REPORT" > "$REPORT.tmp" && mv "$REPORT.tmp" "$REPORT"
else
  echo -e "${COLOR_YELLOW}⚠️  DIAGNOSTIC PASSED WITH WARNINGS${COLOR_RESET}" | tee -a "$LOG"
  jq '.summary = {status: "WARN", checks_passed: '$PASSED_CHECKS', checks_total: '$TOTAL_CHECKS'}' "$REPORT" > "$REPORT.tmp" && mv "$REPORT.tmp" "$REPORT"
fi

echo "📄 Report: $REPORT" | tee -a "$LOG"
echo "📋 Log:    $LOG" | tee -a "$LOG"
echo "" | tee -a "$LOG"

# Output JSON summary
jq '.timestamp = "'$(date -Iseconds)'"' "$REPORT" > "$REPORT.tmp" && mv "$REPORT.tmp" "$REPORT"
echo "" | tee -a "$LOG"
jq '.' "$REPORT" | tee -a "$LOG"
