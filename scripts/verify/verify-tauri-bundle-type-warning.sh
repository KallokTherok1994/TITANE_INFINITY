#!/usr/bin/env bash
set -euo pipefail

LOG_FILE="${1:-}"
if [[ -z "$LOG_FILE" ]]; then
  echo "Usage: $0 <build-log-file>"
  exit 2
fi

if [[ ! -f "$LOG_FILE" ]]; then
  echo "FAIL: log file not found: $LOG_FILE"
  exit 2
fi

WARNING_PATTERN='Failed to add bundler type to the binary: __TAURI_BUNDLE_TYPE variable not found'

if ! grep -Fq "$WARNING_PATTERN" "$LOG_FILE"; then
  echo "PASS: warning absent"
  exit 0
fi

UPDATER_PLUGIN_ENABLED="no"
UPDATER_FEATURE_ENABLED="no"

if grep -Eq '^tauri-plugin-updater\s*=' src-tauri/Cargo.toml; then
  UPDATER_PLUGIN_ENABLED="yes"
fi

if grep -Eq '^tauri\s*=\s*\{[^}]*features\s*=\s*\[[^]]*"updater"' src-tauri/Cargo.toml; then
  UPDATER_FEATURE_ENABLED="yes"
fi

if [[ "$UPDATER_PLUGIN_ENABLED" == "yes" || "$UPDATER_FEATURE_ENABLED" == "yes" ]]; then
  echo "FAIL: warning present while updater capability appears enabled"
  exit 1
fi

echo "PASS_WITH_KNOWN_WARNING: warning present but updater capability is disabled (known upstream behavior)"
exit 0
