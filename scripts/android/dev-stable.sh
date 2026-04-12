#!/usr/bin/env bash
set -euo pipefail

HOST="${TITANE_ANDROID_DEV_HOST:-0.0.0.0}"
PORT="${TITANE_ANDROID_DEV_PORT:-1420}"
PACKAGE_NAME="${TITANE_ANDROID_PACKAGE:-com.titane.infinity}"
ACTIVITY_NAME="${TITANE_ANDROID_ACTIVITY:-.MainActivity}"
DEVICE_ID="${TITANE_ANDROID_DEVICE_ID:-}"

port_pid() {
  ss -ltnp 2>/dev/null \
    | awk -v p=":${PORT}" '$4 ~ p {print}' \
    | grep -o 'pid=[0-9]*' \
    | head -1 \
    | cut -d= -f2 || true
}

is_vite_pid() {
  local pid="$1"
  [[ -n "$pid" ]] || return 1
  ps -p "$pid" -o args= 2>/dev/null | grep -q 'vite'
}

pick_device() {
  if [[ -n "$DEVICE_ID" ]]; then
    echo "$DEVICE_ID"
    return 0
  fi

  adb devices | awk '/\tdevice$/ {print $1; exit}'
}

wait_http_ready() {
  local tries=90
  local url="http://127.0.0.1:${PORT}"

  for ((i=1; i<=tries; i++)); do
    if curl -fsS -m 2 "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done

  return 1
}

echo "[android:dev:stable] Starting Vite on ${HOST}:${PORT}"
EXISTING_PID="$(port_pid)"
STARTED_VITE=0

if [[ -n "$EXISTING_PID" ]]; then
  if is_vite_pid "$EXISTING_PID"; then
    echo "[android:dev:stable] Reusing existing Vite PID ${EXISTING_PID} on port ${PORT}"
    VITE_PID="$EXISTING_PID"
  else
    echo "[android:dev:stable] ERROR: Port ${PORT} already used by PID ${EXISTING_PID} (not Vite)." >&2
    echo "[android:dev:stable] Stop conflicting process or change TITANE_ANDROID_DEV_PORT." >&2
    exit 1
  fi
else
  corepack pnpm exec vite dev --host "$HOST" --port "$PORT" --strictPort &
  VITE_PID=$!
  STARTED_VITE=1
fi

cleanup() {
  if [[ "$STARTED_VITE" -eq 1 ]] && kill -0 "$VITE_PID" >/dev/null 2>&1; then
    kill "$VITE_PID" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT INT TERM

if ! wait_http_ready; then
  echo "[android:dev:stable] ERROR: Vite server did not become ready on port ${PORT}" >&2
  exit 1
fi

if [[ "$STARTED_VITE" -eq 1 ]] && ! kill -0 "$VITE_PID" >/dev/null 2>&1; then
  echo "[android:dev:stable] ERROR: Started Vite process exited unexpectedly." >&2
  exit 1
fi

echo "[android:dev:stable] Vite is ready"

TARGET_DEVICE="$(pick_device || true)"
if [[ -z "$TARGET_DEVICE" ]]; then
  echo "[android:dev:stable] WARN: no Android device detected. Keeping server alive."
  wait "$VITE_PID"
  exit $?
fi

echo "[android:dev:stable] Device: ${TARGET_DEVICE}"
adb -s "$TARGET_DEVICE" reverse "tcp:${PORT}" "tcp:${PORT}" || \
  echo "[android:dev:stable] WARN: adb reverse failed"
adb -s "$TARGET_DEVICE" shell am start -n "${PACKAGE_NAME}/${ACTIVITY_NAME}" || \
  echo "[android:dev:stable] WARN: app launch command failed"

echo "[android:dev:stable] Ready"

if [[ "$STARTED_VITE" -eq 1 ]]; then
  wait "$VITE_PID"
else
  # Reused process may not be a child of this shell: monitor liveness instead.
  while kill -0 "$VITE_PID" >/dev/null 2>&1; do
    sleep 2
  done
fi
