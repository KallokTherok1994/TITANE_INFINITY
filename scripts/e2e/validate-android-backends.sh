#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
#   TITANE∞ — Android S25 Backend Validation Script
#   Android-specific backend validation
#   Requires: connected Android device (adb), built APK installed
#   Usage: bash scripts/e2e/validate-android-backends.sh
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

APP_PACKAGE="com.titane.infinity"
RUNTIME_CONFIG_PATH="/data/user/0/$APP_PACKAGE/files/titane-infinity/config/runtime_settings_v1.json"

# ── Result tracking ───────────────────────────────────────────────
PASS=0
FAIL=0

pass() { echo "  ✅ $1"; PASS=$((PASS + 1)); }
fail() { echo "  ❌ $1"; FAIL=$((FAIL + 1)); }

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  TITANE∞ — Android S25 Backend Validation"
echo "  App package: $APP_PACKAGE"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# ─────────────────────────────────────────────────────────────────
# 1. Check adb device connected
# ─────────────────────────────────────────────────────────────────
echo "── Check 1: ADB Device Connected ───────────────────────────────"
if ! command -v adb &>/dev/null; then
  fail "ANDROID_ADB_FAIL — adb command not found. Install Android SDK platform-tools."
  echo ""
  echo "═══════════════════════════════════════════════════════════════"
  echo "  SUMMARY: ANDROID_BACKEND_FAIL — adb not available"
  echo "═══════════════════════════════════════════════════════════════"
  exit 1
fi

DEVICE_COUNT=$(adb devices | grep -v "^$" | grep -v "List" | wc -l | tr -d ' ')
if [[ "$DEVICE_COUNT" -gt 0 ]]; then
  pass "ADB_CONNECTED — $DEVICE_COUNT device(s) found"
  adb devices | grep -v "^$" | grep -v "List" | while read -r line; do
    echo "     Device: $line"
  done
else
  fail "ANDROID_ADB_FAIL — no Android device connected (run 'adb devices' to check)"
fi
echo ""

# ─────────────────────────────────────────────────────────────────
# 2. Check app installed
# ─────────────────────────────────────────────────────────────────
echo "── Check 2: App Installed ───────────────────────────────────────"
if adb shell pm list packages 2>/dev/null | grep -q "$APP_PACKAGE"; then
  pass "APP_INSTALLED_OK — $APP_PACKAGE found on device"
else
  fail "APP_INSTALLED_FAIL — $APP_PACKAGE not found on device. Install the APK first."
fi
echo ""

# ─────────────────────────────────────────────────────────────────
# 3. Check runtime config on device
# ─────────────────────────────────────────────────────────────────
echo "── Check 3: Runtime Config on Device ───────────────────────────"
RUNTIME_CONFIG=$(adb shell run-as "$APP_PACKAGE" cat "$RUNTIME_CONFIG_PATH" 2>/dev/null || echo "RUNTIME_CONFIG_NOT_FOUND")

if [[ "$RUNTIME_CONFIG" == "RUNTIME_CONFIG_NOT_FOUND" ]]; then
  fail "RUNTIME_CONFIG_FAIL — runtime config not found at $RUNTIME_CONFIG_PATH"
else
  if echo "$RUNTIME_CONFIG" | jq . >/dev/null 2>&1; then
    pass "RUNTIME_CONFIG_OK — valid JSON config found on device"
  else
    fail "RUNTIME_CONFIG_FAIL — config file exists but is not valid JSON"
  fi
fi
echo ""

# ─────────────────────────────────────────────────────────────────
# 4. Check Ollama LAN reachable from device perspective
# ─────────────────────────────────────────────────────────────────
echo "── Check 4: Ollama LAN URL Configuration ───────────────────────"
if [[ "$RUNTIME_CONFIG" == "RUNTIME_CONFIG_NOT_FOUND" ]]; then
  fail "OLLAMA_LAN_FAIL — cannot check Ollama URL (runtime config unavailable)"
else
  OLLAMA_URL=$(echo "$RUNTIME_CONFIG" | jq -r '.ollamaUrl // .ollama_url // .ollama_base_url // empty' 2>/dev/null || echo "")

  if [[ -z "$OLLAMA_URL" ]]; then
    fail "OLLAMA_LAN_FAIL — ollamaUrl not found in runtime config"
  elif [[ "$OLLAMA_URL" == "127.0.0.1"* ]] || [[ "$OLLAMA_URL" == "http://127.0.0.1"* ]]; then
    fail "OLLAMA_LAN_FAIL — ollamaUrl is $OLLAMA_URL (127.0.0.1 is loopback — use LAN IP e.g. 192.168.x.x for Android)"
  elif [[ "$OLLAMA_URL" == "localhost"* ]] || [[ "$OLLAMA_URL" == "http://localhost"* ]]; then
    fail "OLLAMA_LAN_FAIL — ollamaUrl is $OLLAMA_URL (localhost won't work from Android — use LAN IP)"
  else
    pass "OLLAMA_LAN_OK — ollamaUrl=$OLLAMA_URL (non-loopback LAN address)"
  fi
fi
echo ""

# ─────────────────────────────────────────────────────────────────
# 5. Summary
# ─────────────────────────────────────────────────────────────────
echo "═══════════════════════════════════════════════════════════════"
echo "  SUMMARY"
echo "  PASS=$PASS  FAIL=$FAIL"
echo "═══════════════════════════════════════════════════════════════"

if [[ $FAIL -gt 0 ]]; then
  echo "  STATUS: ANDROID_BACKEND_FAIL — $FAIL check(s) failed"
  exit 1
else
  echo "  STATUS: ANDROID_BACKEND_OK — all checks passed"
  exit 0
fi
