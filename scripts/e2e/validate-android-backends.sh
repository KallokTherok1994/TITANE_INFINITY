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

if ! command -v jq &>/dev/null; then
  fail "ANDROID_JQ_FAIL — jq command not found. Install jq for runtime config validation."
  echo ""
  echo "═══════════════════════════════════════════════════════════════"
  echo "  SUMMARY: ANDROID_BACKEND_FAIL — jq not available"
  echo "═══════════════════════════════════════════════════════════════"
  exit 1
fi

if ! command -v curl &>/dev/null; then
  fail "ANDROID_CURL_FAIL — curl command not found. Install curl for Ollama reachability validation."
  echo ""
  echo "═══════════════════════════════════════════════════════════════"
  echo "  SUMMARY: ANDROID_BACKEND_FAIL — curl not available"
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
OLLAMA_URL=""
OLLAMA_MODEL=""
if [[ "$RUNTIME_CONFIG" == "RUNTIME_CONFIG_NOT_FOUND" ]]; then
  fail "OLLAMA_LAN_FAIL — cannot check Ollama URL (runtime config unavailable)"
else
  OLLAMA_URL=$(echo "$RUNTIME_CONFIG" | jq -r '.ollamaUrl // .ollama_url // .ollama_base_url // empty' 2>/dev/null || echo "")
  OLLAMA_MODEL=$(echo "$RUNTIME_CONFIG" | jq -r '.ollamaModel // .ollama_model // empty' 2>/dev/null || echo "")

  if [[ -z "$OLLAMA_URL" ]]; then
    fail "OLLAMA_LAN_FAIL — ollamaUrl not found in runtime config"
  elif echo "$OLLAMA_URL" | grep -qE '(^|://)(127\.0\.0\.1|localhost)(:|/|$)'; then
    fail "OLLAMA_LAN_FAIL — ollamaUrl is $OLLAMA_URL (loopback address won't work from Android — use LAN IP e.g. 192.168.x.x)"
  else
    pass "OLLAMA_LAN_OK — ollamaUrl=$OLLAMA_URL (non-loopback LAN address)"
  fi

  if [[ -z "$OLLAMA_MODEL" ]]; then
    fail "OLLAMA_MODEL_FAIL — ollamaModel not found in runtime config"
  else
    pass "OLLAMA_MODEL_OK — ollamaModel=$OLLAMA_MODEL"
  fi
fi
echo ""

# ─────────────────────────────────────────────────────────────────
# 5. Check configured Ollama endpoint is reachable and model is present
# ─────────────────────────────────────────────────────────────────
echo "── Check 5: Ollama Endpoint Reachability ───────────────────────"
if [[ -z "$OLLAMA_URL" ]]; then
  fail "OLLAMA_ENDPOINT_FAIL — cannot probe endpoint without ollamaUrl"
elif [[ -z "$OLLAMA_MODEL" ]]; then
  fail "OLLAMA_ENDPOINT_FAIL — cannot verify model inventory without ollamaModel"
else
  OLLAMA_TAGS_URL="${OLLAMA_URL%/}/api/tags"
  OLLAMA_TAGS_RESPONSE=$(curl -fsS --max-time 10 "$OLLAMA_TAGS_URL" 2>/dev/null || echo "")

  if [[ -z "$OLLAMA_TAGS_RESPONSE" ]]; then
    fail "OLLAMA_ENDPOINT_FAIL — unable to reach $OLLAMA_TAGS_URL"
  elif ! echo "$OLLAMA_TAGS_RESPONSE" | jq . >/dev/null 2>&1; then
    fail "OLLAMA_ENDPOINT_FAIL — invalid JSON returned by $OLLAMA_TAGS_URL"
  else
    pass "OLLAMA_ENDPOINT_OK — endpoint reachable at $OLLAMA_TAGS_URL"
    if echo "$OLLAMA_TAGS_RESPONSE" | jq -r '.models[]?.name' | grep -Fxq "$OLLAMA_MODEL"; then
      pass "OLLAMA_MODEL_PRESENT_OK — model $OLLAMA_MODEL advertised by endpoint"
    else
      fail "OLLAMA_MODEL_PRESENT_FAIL — model $OLLAMA_MODEL missing from $OLLAMA_TAGS_URL inventory"
    fi
  fi
fi
echo ""

# ─────────────────────────────────────────────────────────────────
# 6. Summary
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
