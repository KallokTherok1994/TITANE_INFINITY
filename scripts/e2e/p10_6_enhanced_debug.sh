#!/bin/bash
# P10.6 Enhanced E2E Runner with Verbose Debug Logging
# Fixes: Xvfb setup, WebDriver connection debugging, graceful error handling

set -e

REPO_ROOT="/home/titane-os/Documents/GitHub/TITANE_INFINITY"
PACK_DIR="${1:-.}"
TEST_NUM="${2:-1}"

cd "$REPO_ROOT"

LOG_FILE="$PACK_DIR/P10_6_DEBUG_RUN_${TEST_NUM}.txt"
WRAPPER_LOG="$PACK_DIR/P10_6_WRAPPER_${TEST_NUM}.txt"

exec 1> >(tee -a "$LOG_FILE")
exec 2>&1

echo "════════════════════════════════════════════════════════════"
echo "P10.6 ENHANCED E2E TEST — Run $TEST_NUM (Debug Mode)"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Timestamp: $(date -u +'%Y-%m-%dT%H:%M:%SZ')"
echo "Pack: $PACK_DIR"
echo "Log: $LOG_FILE"
echo ""

# ===== Display Setup =====
echo "=== DISPLAY SETUP ==="

# Kill any existing Xvfb
pkill -f "Xvfb :" 2>/dev/null || true
sleep 1

# Find free display
DISPLAY_NUM=100
while [[ -f "/tmp/.X${DISPLAY_NUM}-lock" ]]; do
  ((DISPLAY_NUM++))
done

export DISPLAY=":${DISPLAY_NUM}"
echo "[DISPLAY] Starting Xvfb $DISPLAY"
Xvfb "$DISPLAY" -screen 0 1024x768x24 > /dev/null 2>&1 &
XVFB_PID=$!
echo "[DISPLAY] Xvfb PID: $XVFB_PID"
sleep 2

# ===== Environment Setup =====
echo ""
echo "=== ENVIRONMENT ==="
export TITANE_E2E=1
export HOME="/tmp/titane_e2e_$$"
mkdir -p "$HOME/.config" "$HOME/.local/share"

echo "[ENV] DISPLAY=$DISPLAY"
echo "[ENV] HOME=$HOME"
echo "[ENV] TITANE_E2E=$TITANE_E2E"

# ===== Binary Selection =====
echo ""
echo "=== BINARY SELECTION ==="

BINARY=""
for path in \
  "$REPO_ROOT/src-tauri/target/release/titane-infinity" \
  "/usr/bin/titane-infinity"
do
  if [ -f "$path" ] && [ -x "$path" ]; then
    BINARY="$path"
    SIZE=$(ls -lh "$path" | awk '{print $5}')
    DATE=$(stat -c "%y" "$path" | cut -d' ' -f1-2)
    echo "[BINARY] Using: $path"
    echo "[BINARY] Size: $SIZE | Date: $DATE"
    break
  fi
done

if [ -z "$BINARY" ]; then
  echo "[ERROR] ❌ No Tauri binary found!"
  exit 1
fi

# ===== Start Binary with Wrapper =====
echo ""
echo "=== BINARY LAUNCH ==="
echo "[LAUNCH] Starting binary: $BINARY"

# Launch with environment variables visible
export TAURI_BINARY_PATH="$BINARY"

timeout 10 bash -c "
  export DISPLAY=$DISPLAY
  export HOME=$HOME
  $BINARY --no-sandbox 2>&1
" > "$WRAPPER_LOG" 2>&1 &
BINARY_PID=$!

echo "[LAUNCH] Binary PID: $BINARY_PID"
sleep 3

if ps -p $BINARY_PID > /dev/null 2>&1; then
  echo "[LAUNCH] ✅ Binary is running"
else
  echo "[LAUNCH] ❌ Binary exited or crashed"
  cat "$WRAPPER_LOG" | head -20
fi

# ===== WebDriver Test =====
echo ""
echo "=== WEBDRIVER CONNECTION TEST ==="
echo "[WDIO] Running E2E suite..."

timeout 300 bash -c "
  export DISPLAY=$DISPLAY
  export HOME=$HOME
  cd $REPO_ROOT
  pnpm exec wdio run wdio.desktop.conf.cjs
" 2>&1 | tee -a "$LOG_FILE"

WDI_EXIT=$?
echo "[WDIO] Exit code: $WDI_EXIT"

# ===== Cleanup =====
echo ""
echo "=== CLEANUP ==="
kill $BINARY_PID 2>/dev/null || true
kill $XVFB_PID 2>/dev/null || true

sleep 1

echo "[CLEANUP] ✅ Complete"
echo ""
echo "════════════════════════════════════════════════════════════"
echo "Result: $([ $WDI_EXIT -eq 0 ] && echo '✅ PASS' || echo '❌ FAIL')"
echo "════════════════════════════════════════════════════════════"

exit $WDI_EXIT
