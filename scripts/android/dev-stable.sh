#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOST="${TITANE_ANDROID_DEV_HOST:-0.0.0.0}"
PORT="${TITANE_ANDROID_DEV_PORT:-1420}"
PACKAGE_NAME="${TITANE_ANDROID_PACKAGE:-com.titane.infinity}"
ACTIVITY_NAME="${TITANE_ANDROID_ACTIVITY:-.MainActivity}"
DEVICE_ID="${TITANE_ANDROID_DEVICE_ID:-}"

require_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "[android:dev:stable] ERROR: missing required command '$cmd'" >&2
    exit 1
  fi
}

port_pid() {
  ss -ltnp 2>/dev/null \
    | awk -v p=":${PORT}" '$4 ~ (p "$") {print}' \
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

start_canonical_server() {
  bash "${SCRIPT_DIR}/vite-network-server.sh"
}

require_cmd adb
require_cmd curl
require_cmd ss

echo "[android:dev:stable] Ensuring canonical Android Vite server on ${HOST}:${PORT}"
start_canonical_server
VITE_PID="$(port_pid)"

if ! wait_http_ready; then
  echo "[android:dev:stable] ERROR: Vite server did not become ready on port ${PORT}" >&2
  exit 1
fi

if [[ -z "$VITE_PID" ]] || ! is_vite_pid "$VITE_PID"; then
  echo "[android:dev:stable] ERROR: canonical Android Vite server is not owned by a Vite process." >&2
  exit 1
fi

echo "[android:dev:stable] Canonical Vite is ready (PID ${VITE_PID})"

TARGET_DEVICE="$(pick_device || true)"
if [[ -z "$TARGET_DEVICE" ]]; then
  echo "[android:dev:stable] WARN: no Android device detected. Server remains available at http://127.0.0.1:${PORT}."
  exit 0
fi

echo "[android:dev:stable] Device: ${TARGET_DEVICE}"
adb -s "$TARGET_DEVICE" reverse "tcp:${PORT}" "tcp:${PORT}" || \
  echo "[android:dev:stable] WARN: adb reverse failed"
adb -s "$TARGET_DEVICE" shell am start -n "${PACKAGE_NAME}/${ACTIVITY_NAME}" || \
  echo "[android:dev:stable] WARN: app launch command failed"

echo "[android:dev:stable] Ready"
