#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"

PASS=0
FAIL=0
BLOCKED=0
pass() { echo "PASS: $1"; PASS=$((PASS+1)); }
fail() { echo "FAIL: $1"; FAIL=$((FAIL+1)); }
blocked() { echo "BLOCKED: $1"; BLOCKED=$((BLOCKED+1)); }

REPORTS_DIR="reports/runtime-proof"
mkdir -p "$REPORTS_DIR"

# Step 1: Find latest stable AppImage
LATEST_APPIMAGE=$(find runtime/stable -maxdepth 1 -name "*.AppImage" -type f -executable 2>/dev/null | sort | tail -1)
if [[ -z "$LATEST_APPIMAGE" ]]; then
  LATEST_APPIMAGE=$(find runtime/stable -maxdepth 1 -name "*.AppImage" -type f 2>/dev/null | sort | tail -1)
fi

if [[ -z "$LATEST_APPIMAGE" ]]; then
  fail "STABLE_APPIMAGE_MISSING"
  echo "SUMMARY: FAIL=$FAIL"; exit 1
fi
pass "STABLE_APPIMAGE_PRESENT ($LATEST_APPIMAGE)"

chmod +x "$LATEST_APPIMAGE"

# Step 2: Check display availability
if [[ -z "${DISPLAY:-}" && -z "${WAYLAND_DISPLAY:-}" ]]; then
  blocked "DISPLAY_UNAVAILABLE"
  echo "SUMMARY: BLOCKED=$BLOCKED"; exit 0
fi
pass "DISPLAY_AVAILABLE (${DISPLAY:-}${WAYLAND_DISPLAY:-})"

# Step 3: Bounded launch
LOG="$REPORTS_DIR/stable-window-launch-$(date +%Y%m%d-%H%M%S).log"
PID_FILE="$REPORTS_DIR/stable-window.pid"

(
  DISPLAY="${DISPLAY:-:0}" \
  "$LATEST_APPIMAGE" --appimage-extract-and-run --no-sandbox >"$LOG" 2>&1 &
  echo $! > "$PID_FILE"
)

LAUNCH_WAIT=12
sleep "$LAUNCH_WAIT"

if [[ ! -f "$PID_FILE" ]]; then
  fail "STABLE_PROCESS_PID_MISSING"
  echo "SUMMARY: FAIL=$FAIL"; exit 1
fi

PID=$(cat "$PID_FILE")
if ps -p "$PID" >/dev/null 2>&1; then
  pass "STABLE_PROCESS_STARTED (pid=$PID)"
else
  fail "STABLE_PROCESS_EXITED_EARLY"
  echo "--- LOG TAIL ---"
  tail -20 "$LOG" 2>/dev/null || true
  echo "SUMMARY: FAIL=$FAIL"; exit 1
fi

# Step 4: Window observation
WINDOW_OBSERVED=0
if command -v wmctrl >/dev/null 2>&1; then
  WMCTRL_OUT=$(wmctrl -l 2>/dev/null || true)
  echo "$WMCTRL_OUT" > "$REPORTS_DIR/wmctrl-windows.txt"
  # wmctrl -l format: windowID desktop host window-title (fields 1-3 + rest)
  # Match only on window title (field 4+), not host column
  MATCHING_WINDOW=$(echo "$WMCTRL_OUT" | awk '{title=""; for(i=4;i<=NF;i++) title=title" "$i; if (tolower(title) ~ /titan-stable/) print $0}' | head -1)
  if [[ -n "$MATCHING_WINDOW" ]]; then
    pass "STABLE_WINDOW_OBSERVED"
    WINDOW_TITLE=$(echo "$MATCHING_WINDOW" | awk '{for(i=4;i<=NF;i++) printf $i" "; print ""}')
    echo "INFO: WINDOW_TITLE=$WINDOW_TITLE"
    WINDOW_OBSERVED=1
  else
    fail "STABLE_WINDOW_NOT_FOUND_IN_WMCTRL"
  fi
else
  blocked "WMCTRL_UNAVAILABLE"
fi

# Step 5: SurfaceTruth DOM proof
# Requires E2E harness (tauri-driver + WebKitWebDriver + Ollama) — classify as blocked if unavailable
if command -v tauri-driver >/dev/null 2>&1 && command -v WebKitWebDriver >/dev/null 2>&1; then
  blocked "SURFACE_TRUTH_HARNESS_REQUIRES_OLLAMA (harness present but E2E gate not invoked in this script)"
else
  blocked "SURFACE_TRUTH_HARNESS_MISSING (tauri-driver or WebKitWebDriver unavailable)"
fi

# Step 6: Cleanup
kill "$PID" 2>/dev/null || true
sleep 2
kill -9 "$PID" 2>/dev/null || true

echo ""
if [[ $FAIL -gt 0 ]]; then
  echo "SUMMARY: PASS=$PASS FAIL=$FAIL BLOCKED=$BLOCKED"
  exit 1
fi
echo "SUMMARY: PASS=$PASS BLOCKED=$BLOCKED"
