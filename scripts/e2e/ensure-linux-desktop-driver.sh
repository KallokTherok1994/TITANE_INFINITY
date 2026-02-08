#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
REPORTS="$ROOT/reports/e2e-desktop"
STEP2="$REPORTS/UNBLOCK_STEP_2_BINARY_RESOLUTION.md"
STEP3="$REPORTS/UNBLOCK_STEP_3_TAURI_DRIVER_INSTALL.md"
STEP4="$REPORTS/UNBLOCK_STEP_4_NATIVE_DRIVER.md"
MODE_FILE="$REPORTS/DESKTOP_E2E_MODE.json"

mkdir -p "$REPORTS"

append_report() {
  local file="$1"
  local content="$2"
  {
    echo
    echo "---"
    echo
    echo "Run: $(date -Iseconds)"
    echo "$content"
  } >> "$file"
}

resolve_tauri_driver() {
  if command -v tauri-driver >/dev/null 2>&1; then
    command -v tauri-driver
    return 0
  fi
  if [[ -x "$HOME/.cargo/bin/tauri-driver" ]]; then
    echo "$HOME/.cargo/bin/tauri-driver"
    return 0
  fi
  if [[ -x "$ROOT/target/release/tauri-driver" ]]; then
    echo "$ROOT/target/release/tauri-driver"
    return 0
  fi
  return 1
}

write_mode_file() {
  local tauri_status="$1"
  local native_status="$2"
  local mode="$3"
  local tauri_path="$4"
  local native_path="$5"
  local os_name
  os_name="$(uname -s | tr '[:upper:]' '[:lower:]')"
  local ts
  ts="$(date -Iseconds)"

  cat > "$MODE_FILE" <<EOF
{
  "tauri_driver": "${tauri_status}",
  "native_driver": "${native_status}",
  "mode": "${mode}",
  "os": "${os_name}",
  "timestamp": "${ts}",
  "tauri_driver_path": "${tauri_path}",
  "native_driver_path": "${native_path}"
}
EOF
}

TAURI_DRIVER_PATH=""
NATIVE_DRIVER_PATH=""
TAURI_STATUS="MISSING"
NATIVE_STATUS="MISSING"
MODE="BLOCKED"

if TAURI_DRIVER_PATH=$(resolve_tauri_driver); then
  TAURI_STATUS="OK"
  append_report "$STEP2" "Status: FOUND\nPath: $TAURI_DRIVER_PATH"
else
  append_report "$STEP2" "Status: MISSING\nPath: (none)"

  if ! command -v cargo >/dev/null 2>&1; then
    append_report "$STEP3" "Status: INSTALL_FAIL\nReason: cargo introuvable"
    echo "[e2e:desktop] ERROR: cargo introuvable (requis pour installer tauri-driver)"
  else
    if cargo install tauri-driver --locked; then
      append_report "$STEP3" "Status: INSTALL_OK"
    else
      append_report "$STEP3" "Status: INSTALL_FAIL"
      echo "[e2e:desktop] ERROR: échec installation tauri-driver"
    fi
  fi

  if TAURI_DRIVER_PATH=$(resolve_tauri_driver); then
    TAURI_STATUS="OK"
    append_report "$STEP2" "Status: FOUND_AFTER_INSTALL\nPath: $TAURI_DRIVER_PATH"
  else
    append_report "$STEP2" "Status: STILL_MISSING"
    echo "[e2e:desktop] ERROR: tauri-driver toujours introuvable après install"
  fi
fi

if command -v WebKitWebDriver >/dev/null 2>&1; then
  NATIVE_STATUS="OK"
  NATIVE_DRIVER_PATH="$(command -v WebKitWebDriver)"
  append_report "$STEP4" "Status: FOUND\nDriver: $NATIVE_DRIVER_PATH"
else
  append_report "$STEP4" "Status: MISSING\nReason: WebKitWebDriver introuvable"
  echo "[e2e:desktop] WARN: WebKitWebDriver introuvable (requis sur Linux)"
  echo "[e2e:desktop] Installez webkit2gtk >= 2.40 + WebKitWebDriver sur l'hôte."
  echo "[e2e:desktop] Vérifiez aussi GLIBC >= 2.37 (règles permanentes)."
fi

if [[ "$TAURI_STATUS" == "OK" && "$NATIVE_STATUS" == "OK" ]]; then
  MODE="AUTO_UI_FULL"
elif [[ "$TAURI_STATUS" == "OK" ]]; then
  MODE="AUTO_UI_LIMITED"
else
  MODE="BLOCKED"
fi

write_mode_file "$TAURI_STATUS" "$NATIVE_STATUS" "$MODE" "$TAURI_DRIVER_PATH" "$NATIVE_DRIVER_PATH"

if [[ "$MODE" == "AUTO_UI_FULL" ]]; then
  echo "[e2e:desktop] OK: tauri-driver + WebKitWebDriver disponibles"
elif [[ "$MODE" == "AUTO_UI_LIMITED" ]]; then
  echo "[e2e:desktop] OK: tauri-driver disponible, native driver manquant (mode limité)"
else
  echo "[e2e:desktop] ERROR: tauri-driver indisponible (mode bloqué)"
fi
echo "TAURI_DRIVER_PATH=$TAURI_DRIVER_PATH"
