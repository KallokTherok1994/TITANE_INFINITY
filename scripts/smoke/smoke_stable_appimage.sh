#!/usr/bin/env bash
#
# smoke_stable_appimage.sh
# RELEASE_PRODUCTION — Smoke test AppImage stable (90s keepalive)
#
# Exit 0: PASS (app stayed alive, no ERROR logs)
# Exit 1: FAIL (app exited early or ERROR logs detected)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$REPO_ROOT"

# =============================================
# Configuration
# =============================================

TIMEOUT_SEC=90
LOGS_DIR="runtime/stable/logs"
mkdir -p "$LOGS_DIR"

TS=$(date +%Y%m%d-%H%M%S)
LOG="$LOGS_DIR/smoke-appimage-${TS}.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

say() {
  echo -e "${1}"
}

fail() {
  say "${RED}[FAIL]${NC} $*"
  exit 1
}

pass() {
  say "${GREEN}[PASS]${NC} $*"
}

# =============================================
# Find AppImage
# =============================================

APP=$(ls -1 runtime/stable/*.AppImage 2>/dev/null | head -n 1 || true)

if [ -z "$APP" ]; then
  fail "No AppImage found in runtime/stable/"
fi

if [ ! -f "$APP" ]; then
  fail "AppImage not found: $APP"
fi

if [ ! -x "$APP" ]; then
  chmod +x "$APP" || fail "Cannot make AppImage executable: $APP"
fi

say "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
say "🧪 SMOKE TEST: Stable AppImage"
say "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
say "AppImage: $APP"
say "Timeout: ${TIMEOUT_SEC}s"
say "Log: $LOG"
say "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"

# =============================================
# Run AppImage with timeout
# =============================================

{
  echo "[SMOKE] Timestamp: $(date -Is)"
  echo "[SMOKE] AppImage: $APP"
  echo "[SMOKE] Timeout: ${TIMEOUT_SEC}s"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
} | tee "$LOG"

set +e
timeout "${TIMEOUT_SEC}s" "$APP" >>"$LOG" 2>&1
EXIT_CODE=$?
set -e

{
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "[SMOKE] Finished: $(date -Is)"
  echo "[SMOKE] Exit code: $EXIT_CODE"
} | tee -a "$LOG"

# =============================================
# Analyze results
# =============================================

say "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
say "📊 Results Analysis"
say "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"

# Check keepalive (timeout = 124)
if [ "$EXIT_CODE" -eq 124 ]; then
  pass "Keepalive: App stayed alive for ${TIMEOUT_SEC}s (killed by timeout)"
  KEEPALIVE_OK=1
else
  fail "Keepalive: App exited early (exit=$EXIT_CODE, expected 124)"
fi

# Scan for ERROR markers
ERROR_COUNT=$(grep -icE 'ERROR|panic|panicked|segfault|SIGSEGV' "$LOG" || echo "0")

if [ "$ERROR_COUNT" -gt 0 ]; then
  say "${YELLOW}[WARN]${NC} Detected $ERROR_COUNT ERROR markers in logs:"
  grep -nE 'ERROR|panic|panicked|segfault|SIGSEGV' "$LOG" | head -n 20 || true
  say "\n${YELLOW}⚠️  Review log: $LOG${NC}"
else
  pass "Error scan: No ERROR markers detected"
fi

# Scan for UI initialization markers (optional)
UI_MARKERS=$(grep -icE 'Main window shown|page_load|label=main' "$LOG" || echo "0")

if [ "$UI_MARKERS" -gt 0 ]; then
  pass "UI init: Detected $UI_MARKERS UI initialization markers"
else
  say "${YELLOW}[INFO]${NC} UI init: No explicit UI markers (may be OK if headless)"
fi

# =============================================
# Final verdict
# =============================================

say "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
say "🎯 Final Verdict"
say "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"

if [ "${KEEPALIVE_OK:-0}" -eq 1 ] && [ "$ERROR_COUNT" -eq 0 ]; then
  pass "✅ SMOKE TEST PASSED"
  say "Log: $LOG\n"
  exit 0
else
  fail "❌ SMOKE TEST FAILED (keepalive or errors detected)"
fi
