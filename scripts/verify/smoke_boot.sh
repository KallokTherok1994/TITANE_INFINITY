#!/usr/bin/env bash

# Smoke Test Script for TITANE∞ Boot Verification
# Purpose: Quick verification that system boots cleanly
# Usage: ./scripts/verify/smoke_boot.sh
# Exit: 0 (PASS), 1 (FAIL)

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Log file
LOG_FILE="${LOG_FILE:-/tmp/smoke_boot_$(date +%s).log}"

# Markers to verify
MARKER_VITE_READY="VITE.*ready"
MARKER_UI_BOOT="frontend.boot.*boot handlers registered"
MARKER_OMEGA="OMEGA Conversation Engine.*initialized"

echo "🚀 SMOKE TEST: TITANE∞ Boot Verification"
echo "📝 Log: $LOG_FILE"
echo ""

# Cleanup any stray processes
echo "🧹 Cleaning up stray processes..."
pkill -9 -f "vite|tauri|titane-infinity|pnpm.*dev" 2>/dev/null || true
sleep 2

# Start boot with timeout
echo "⏳ Starting pnpm run dev:tauri (timeout 25s)..."
if ! timeout 25 pnpm run dev:tauri > "$LOG_FILE" 2>&1; then
  EXIT_CODE=$?
  if [ $EXIT_CODE -eq 124 ]; then
    echo "⏱️ Timeout reached (expected for smoke test)"
  else
    echo -e "${RED}❌ Boot failed with exit code $EXIT_CODE${NC}"
    tail -20 "$LOG_FILE"
    exit 1
  fi
fi

# Verify markers
echo ""
echo "🔍 Verifying boot markers..."

MARKERS_FOUND=0
MARKERS_TOTAL=3

# Check Vite ready
if grep -qi "$MARKER_VITE_READY" "$LOG_FILE"; then
  echo -e "${GREEN}✓ Vite ready${NC}"
  ((MARKERS_FOUND++))
else
  echo -e "${RED}✗ Vite ready${NC}"
fi

# Check UI boot
if grep -qi "$MARKER_UI_BOOT" "$LOG_FILE"; then
  echo -e "${GREEN}✓ UI boot handlers registered${NC}"
  ((MARKERS_FOUND++))
else
  echo -e "${RED}✗ UI boot handlers registered${NC}"
fi

# Check OMEGA
if grep -qi "$MARKER_OMEGA" "$LOG_FILE"; then
  echo -e "${GREEN}✓ OMEGA Engine initialized${NC}"
  ((MARKERS_FOUND++))
else
  echo -e "${RED}✗ OMEGA Engine initialized${NC}"
fi

echo ""
echo "📊 Markers: $MARKERS_FOUND/$MARKERS_TOTAL verified"

# Decide pass/fail
if [ $MARKERS_FOUND -eq 3 ]; then
  echo -e "${GREEN}✅ SMOKE TEST PASSED${NC}"
  exit 0
else
  echo -e "${RED}❌ SMOKE TEST FAILED${NC}"
  echo "Last 30 lines of log:"
  echo "---"
  tail -30 "$LOG_FILE"
  exit 1
fi
