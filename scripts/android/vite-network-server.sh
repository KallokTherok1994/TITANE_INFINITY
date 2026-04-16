#!/usr/bin/env bash
# TITANE∞ — Android dev Vite network server launcher
# Runs Vite in its own session (setsid) so Tauri process-group management
# cannot kill it when tauri android dev exits. Acts as beforeDevCommand:
# starts Vite detached, waits for port to be ready, exits 0.
set -euo pipefail

HOST="${TITANE_ANDROID_DEV_HOST:-0.0.0.0}"
PORT="${TITANE_ANDROID_DEV_PORT:-1420}"
LOGFILE="${TITANE_VITE_LOG:-/tmp/titane-vite-dev.log}"
PIDFILE="${TITANE_VITE_PID:-/tmp/titane-vite-dev.pid}"

port_alive() {
  ss -ltnp 2>/dev/null | awk -v p=":${PORT}" '$4 ~ (p "$"){found=1} END{exit !found}'
}

listener_pid() {
  ss -ltnp 2>/dev/null | awk -v p=":${PORT}" '$4 ~ (p "$"){print}' \
    | grep -o 'pid=[0-9]*' | head -1 | cut -d= -f2 || true
}

# Walk up to 12 levels of /proc parents; return 0 if $2 is ancestor-or-equal of $1
is_descendant_of() {
  local current="$1" managed="$2" depth=0
  while [[ -n "$current" && "$current" -gt 1 && $depth -lt 12 ]]; do
    [[ "$current" == "$managed" ]] && return 0
    current=$(awk '/PPid:/{print $2}' "/proc/${current}/status" 2>/dev/null || echo "")
    ((depth++))
  done
  return 1
}

wait_ready() {
  local tries=90
  for ((i=1; i<=tries; i++)); do
    if curl -fsS -m 2 "http://127.0.0.1:${PORT}" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  return 1
}

# Guard: if our managed Vite is still running, reuse it
if port_alive; then
  L_PID="$(listener_pid)"
  if [[ -f "$PIDFILE" ]]; then
    MANAGED_PID="$(cat "$PIDFILE")"
    if [[ -n "$L_PID" ]] && is_descendant_of "$L_PID" "$MANAGED_PID"; then
      echo "[vite-network-server] Reusing managed Vite (listener=$L_PID, root=$MANAGED_PID) on port ${PORT}"
      echo "[vite-network-server] Vite READY (reused) — Network: http://$(hostname -I | awk '{print $1}'):${PORT}"
      exit 0
    fi
  fi
  # Stale process on our port — kill it
  if [[ -n "$L_PID" ]] && ps -p "$L_PID" -o args= 2>/dev/null | grep -q vite; then
    echo "[vite-network-server] Stopping stale Vite PID ${L_PID}"
    kill "$L_PID" 2>/dev/null || true
    sleep 1
  fi
fi

echo "[vite-network-server] Starting Vite on ${HOST}:${PORT} (detached, log: ${LOGFILE})"

# Use nohup so the Vite process survives when the calling shell/terminal exits.
nohup pnpm exec vite dev \
  --host "$HOST" \
  --port "$PORT" \
  --strictPort \
  >> "$LOGFILE" 2>&1 < /dev/null &
VITE_PID=$!
echo "$VITE_PID" > "$PIDFILE"

echo "[vite-network-server] Vite PID=${VITE_PID} — waiting for http://127.0.0.1:${PORT}"
if ! wait_ready; then
  echo "[vite-network-server] ERROR: Vite did not become ready within 90s" >&2
  exit 1
fi

echo "[vite-network-server] Vite READY — Network: http://$(hostname -I | awk '{print $1}'):${PORT}"
exit 0
