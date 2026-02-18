#!/bin/bash
# P10.4 Headless Wrapper for Tauri Binary (FIXED)
# Uses dynamic Xvfb display or falls back to GDK headless

set -e

BINARY="${1:-/usr/bin/titane-infinity}"
TIMEOUT="${2:-30}"
LOG_FILE="${3:-/tmp/titane-headless.log}"

echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] Starting headless wrapper (timeout: ${TIMEOUT}s)" | tee -a "$LOG_FILE"

# ===== Clean Home/Config =====
export HOME="/tmp/titane_p10_4_home_$$"
mkdir -p "$HOME/.config/titane" "$HOME/.local/share/titane"

# ===== Setup Dummy Display (with fallback) =====
XVFB_PID=""

if command -v Xvfb &> /dev/null; then
  # Find free display
  DISPLAY_NUM=99
  while [[ -f "/tmp/.X${DISPLAY_NUM}-lock" ]]; do
    ((DISPLAY_NUM++))
  done
  
  echo "✅ Using Xvfb :$DISPLAY_NUM for dummy display" | tee -a "$LOG_FILE"
  DISPLAY=":${DISPLAY_NUM}"
  export DISPLAY
  
  Xvfb "$DISPLAY" -screen 0 1024x768x24 > /dev/null 2>&1 &
  XVFB_PID=$!
  sleep 1
else
  echo "⚠️ Xvfb not available, using GDK headless mode" | tee -a "$LOG_FILE"
  export GDK_BACKEND=headless
  export WAYLAND_DISPLAY=""
  export DISPLAY=""
fi

# ===== Launch Binary =====
echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] Launching $BINARY" | tee -a "$LOG_FILE"

LAUNCH_START=$(date +%s)
timeout "$TIMEOUT" "$BINARY" --no-sandbox 2>&1 | tee -a "$LOG_FILE" &
BINARY_PID=$!

echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] Binary PID: $BINARY_PID" | tee -a "$LOG_FILE"

# ===== Wait for Backend Ready =====
READY_MARKER="(✅|Initialized|Main window|IPC|backend ready)"
WAIT_TIMEOUT=15
ELAPSED=0
EXIT_CODE=1

while [[ $ELAPSED -lt $WAIT_TIMEOUT ]]; do
  if ps -p $BINARY_PID >/dev/null 2>&1; then
    if [[ -f "$LOG_FILE" ]] && grep -qE "$READY_MARKER" "$LOG_FILE" 2>/dev/null; then
      echo "✅ Backend ready detected" | tee -a "$LOG_FILE"
      EXIT_CODE=0
      break
    fi
  else
    echo "❌ Binary exited (PID $BINARY_PID)" | tee -a "$LOG_FILE"
    EXIT_CODE=1
    break
  fi
  
  sleep 1
  ((ELAPSED++))
done

# Cleanup
[[ -n "$XVFB_PID" ]] && kill $XVFB_PID 2>/dev/null || true
kill $BINARY_PID 2>/dev/null || true
wait $BINARY_PID 2>/dev/null || true

LAUNCH_END=$(date +%s)
DURATION=$((LAUNCH_END - LAUNCH_START))
echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] Wrapper complete (duration: ${DURATION}s, exit: $EXIT_CODE)" | tee -a "$LOG_FILE"

exit $EXIT_CODE
