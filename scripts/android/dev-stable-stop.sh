#!/usr/bin/env bash
set -euo pipefail

PORT="${TITANE_ANDROID_DEV_PORT:-1420}"
DEVICE_ID="${TITANE_ANDROID_DEVICE_ID:-}"

pick_device() {
  if [[ -n "$DEVICE_ID" ]]; then
    echo "$DEVICE_ID"
    return 0
  fi

  adb devices | awk '/\tdevice$/ {print $1; exit}'
}

PID="$(ss -ltnp 2>/dev/null | awk -v p=":${PORT}" '$4 ~ p {print}' | grep -o 'pid=[0-9]*' | head -1 | cut -d= -f2 || true)"

if [[ -n "$PID" ]]; then
  echo "[android:dev:stable:stop] Stopping server PID ${PID} on port ${PORT}"
  kill "$PID" >/dev/null 2>&1 || true
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
