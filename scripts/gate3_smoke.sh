#!/usr/bin/env bash
# Gate-3 Smoke Test: dev:tauri UI verification
set -e

LOG_FILE="/tmp/ipc_verify_g3_smoke.log"
PID_FILE="/tmp/ipc_verify_g3.pid"
TIMEOUT=30

echo "=== Gate-3: dev:tauri Smoke Test ===" | tee "$LOG_FILE"
echo "Timestamp: $(date -Iseconds)" | tee -a "$LOG_FILE"

# Cleanup function
cleanup() {
  if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if kill -0 "$PID" 2>/dev/null; then
      echo "Stopping dev:tauri PID $PID..." | tee -a "$LOG_FILE"
      kill -TERM "$PID" 2>/dev/null || true
      sleep 2
      kill -KILL "$PID" 2>/dev/null || true
    fi
    rm -f "$PID_FILE"
  fi
  
  # Stop any lingering Vite/Tauri processes
  pkill -f "vite.*4000" 2>/dev/null || true
  pkill -f "tauri dev" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

# Launch dev:tauri in background
echo "Launching pnpm run dev:tauri..." | tee -a "$LOG_FILE"
pnpm run dev:tauri > /tmp/ipc_g3_full_log.txt 2>&1 &
DEV_PID=$!
echo "$DEV_PID" > "$PID_FILE"
echo "Started with PID $DEV_PID" | tee -a "$LOG_FILE"

# Wait for startup (max 30s)
ELAPSED=0
READY=false
while [ $ELAPSED -lt $TIMEOUT ]; do
  if grep -q "VITE.*ready" /tmp/ipc_g3_full_log.txt 2>/dev/null || \
     lsof -i :4000 -t >/dev/null 2>&1; then
    READY=true
    break
  fi
  sleep 1
  ELAPSED=$((ELAPSED + 1))
done

if [ "$READY" = "false" ]; then
  echo "❌ FAIL: Unable to start dev:tauri within ${TIMEOUT}s" | tee -a "$LOG_FILE"
  tail -50 /tmp/ipc_g3_full_log.txt | tee -a "$LOG_FILE"
  exit 1
fi

echo "✅ dev:tauri started successfully (${ELAPSED}s)" | tee -a "$LOG_FILE"

# Wait 10s for runtime stabilization
echo "Waiting 10s for stabilization..." | tee -a "$LOG_FILE"
sleep 10

# Scan logs for IPC errors
echo "Scanning logs for IPC errors..." | tee -a "$LOG_FILE"
if grep -Ei "(missing required key args|invalid field args|conversation_generate.*error)" /tmp/ipc_g3_full_log.txt; then
  echo "❌ FAIL: IPC errors detected in logs" | tee -a "$LOG_FILE"
  exit 1
else
  echo "✅ No IPC errors detected" | tee -a "$LOG_FILE"
fi

# Check for critical errors
if grep -Ei "(panic|fatal|uncaught exception)" /tmp/ipc_g3_full_log.txt; then
  echo "⚠️  WARN: Critical errors detected (may not be related to IPC)" | tee -a "$LOG_FILE"
fi

echo "=== Gate-3 PASS ===" | tee -a "$LOG_FILE"
echo "Status: ✅ QUALIFIED" | tee -a "$LOG_FILE"
