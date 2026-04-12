#!/usr/bin/env bash
set -euo pipefail

PORT="${TITANE_ANDROID_DEV_PORT:-1420}"
DEVICE_ID="${TITANE_ANDROID_DEVICE_ID:-}"

wait_for_exit() {
  local pid="$1"
  local tries=20

  for ((i=1; i<=tries; i++)); do
    if ! kill -0 "$pid" >/dev/null 2>&1; then
      return 0
    fi
    sleep 0.25
  done

  return 1
}

pick_device() {
  if [[ -n "$DEVICE_ID" ]]; then
    echo "$DEVICE_ID"
    return 0
  fi

  adb devices | awk '/\tdevice$/ {print $1; exit}'
}

PID="$(ss -ltnp 2>/dev/null | awk -v p=":${PORT}" '$4 ~ (p "$") {print}' | grep -o 'pid=[0-9]*' | head -1 | cut -d= -f2 || true)"

if [[ -n "$PID" ]]; then
  echo "[android:dev:stable:stop] Stopping server PID ${PID} on port ${PORT}"
  kill "$PID" >/dev/null 2>&1 || true
  if ! wait_for_exit "$PID"; then
    echo "[android:dev:stable:stop] PID ${PID} did not exit on TERM, forcing KILL"
    kill -9 "$PID" >/dev/null 2>&1 || true
  fi
else
  echo "[android:dev:stable:stop] No server found on port ${PORT}"
fi

TARGET_DEVICE="$(pick_device || true)"
if [[ -n "$TARGET_DEVICE" ]]; then
  adb -s "$TARGET_DEVICE" reverse --remove "tcp:${PORT}" >/dev/null 2>&1 || true
  echo "[android:dev:stable:stop] Removed adb reverse on ${TARGET_DEVICE} tcp:${PORT}"
else
  echo "[android:dev:stable:stop] No Android device detected for reverse removal"
fi

echo "[android:dev:stable:stop] Done"
