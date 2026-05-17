#!/usr/bin/env bash
# TITANE∞ — Gate: Console Runtime Noise Classification
# Reads captured console logs and classifies acceptable vs unacceptable noise.
# If no log file provided, validates source-level patterns only.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/../.."

PASS=0
FAIL=0
WARN=0

LOG_FILE="${1:-}"

echo "🔍 Console Runtime Noise Gate"
echo ""

# ── Source-level checks (always run) ──────────────────────────────
echo "── Source-level checks ──"

# No raw console.warn/error with stale v30.0.0 in runtime paths
STALE_CONSOLE=$(grep -rn "console\.\(warn\|error\|log\)" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | \
  grep -v "node_modules\|\.test\.\|\.spec\.\|__tests__" | \
  grep "v30\.0\.0" | grep -v "^Binary" || true)

if [[ -z "$STALE_CONSOLE" ]]; then
  echo "PASS: NO_STALE_CONSOLE_WARN_V30"
  ((PASS++)) || true
else
  echo "FAIL: STALE_CONSOLE_WARN_V30"
  echo "$STALE_CONSOLE" | head -5
  ((FAIL++)) || true
fi

# No react-dom.development import in dist
if ls dist/assets/*.js 2>/dev/null | xargs grep -l "react-dom.development\|react.development" 2>/dev/null | grep -q .; then
  echo "FAIL: REACT_DEV_BUILD_IN_DIST"
  ((FAIL++)) || true
else
  echo "PASS: NO_REACT_DEV_BUILD_IN_DIST"
  ((PASS++)) || true
fi

# No hardcoded v30.0.0 in logger calls (should be using __APP_VERSION__)
STALE_LOGGER=$(grep -rn "logger\.\(info\|warn\|error\|debug\)" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | \
  grep -v "node_modules\|\.test\.\|\.spec\.\|__tests__" | \
  grep "v30\.0\.0" | grep -v "^Binary" || true)

if [[ -z "$STALE_LOGGER" ]]; then
  echo "PASS: NO_STALE_LOGGER_V30"
  ((PASS++)) || true
else
  echo "FAIL: STALE_LOGGER_V30"
  echo "$STALE_LOGGER" | head -5
  ((FAIL++)) || true
fi

# ── Runtime log file checks (if provided) ─────────────────────────
if [[ -n "$LOG_FILE" && -f "$LOG_FILE" ]]; then
  echo ""
  echo "── Runtime log checks: $LOG_FILE ──"

  BROWSER_DETECT=$(grep -c "browser runtime detected" "$LOG_FILE" 2>/dev/null || echo "0")
  if [[ "$BROWSER_DETECT" -gt 0 ]]; then
    echo "FAIL: BROWSER_RUNTIME_DETECTED in stable logs ($BROWSER_DETECT occurrences)"
    ((FAIL++)) || true
  else
    echo "PASS: NO_BROWSER_RUNTIME_DETECTED"
    ((PASS++)) || true
  fi

  STALE_V30=$(grep -c "v30\.0\.0" "$LOG_FILE" 2>/dev/null || echo "0")
  if [[ "$STALE_V30" -gt 0 ]]; then
    echo "FAIL: STALE_V30_IN_RUNTIME_LOGS ($STALE_V30 occurrences)"
    ((FAIL++)) || true
  else
    echo "PASS: NO_STALE_V30_IN_RUNTIME_LOGS"
    ((PASS++)) || true
  fi

  FALLBACK_COUNT=$(grep -c "using fallback ID" "$LOG_FILE" 2>/dev/null || echo "0")
  if [[ "$FALLBACK_COUNT" -gt 1 ]]; then
    echo "FAIL: REPEATED_FALLBACK_IDS ($FALLBACK_COUNT occurrences, max 1 on cold start)"
    ((FAIL++)) || true
  else
    echo "PASS: FALLBACK_ID_COUNT_OK ($FALLBACK_COUNT)"
    ((PASS++)) || true
  fi

  REACT_DEV=$(grep -c "react-dom-client.development\|react.development" "$LOG_FILE" 2>/dev/null || echo "0")
  if [[ "$REACT_DEV" -gt 0 ]]; then
    echo "FAIL: REACT_DEV_IN_RUNTIME_LOGS (stable artifact must use production React)"
    ((FAIL++)) || true
  else
    echo "PASS: NO_REACT_DEV_IN_RUNTIME_LOGS"
    ((PASS++)) || true
  fi
else
  echo ""
  echo "── Runtime log file not provided — source checks only ──"
  echo "INFO: Pass a console log file as argument for runtime validation"
fi

echo ""
echo "══════════════════════════════════════"
echo "SUMMARY: PASS=$PASS FAIL=$FAIL WARN=$WARN"
if [[ $FAIL -eq 0 ]]; then
  echo "PASS: gate-console-runtime-noise"
  exit 0
else
  echo "FAIL: gate-console-runtime-noise — $FAIL issue(s)"
  exit 1
fi
