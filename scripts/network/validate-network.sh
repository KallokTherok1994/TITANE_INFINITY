#!/bin/bash
# TITANE∞ Network Dev Tunnel - Validation Script
# Test local, LAN, and tunnel access

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "🧪 TITANE∞ NETWORK VALIDATION"
echo "=============================="
echo ""

PASS=0
FAIL=0
LOCAL_IP="$(hostname -I 2>/dev/null | awk '{print $1}' || true)"
DEV_PORT=5173

http_code() {
    local url="$1"
    # 000 = no response / connection refused / etc.
    curl -sS -o /dev/null -w "%{http_code}" --max-time 3 "$url" 2>/dev/null || echo "000"
}

# Test 1: Local access
echo "TEST 1: Local Access (http://localhost:$DEV_PORT)"
CODE_LOCAL="$(http_code "http://localhost:$DEV_PORT")"
if [[ "$CODE_LOCAL" == "200" ]]; then
    echo "✅ PASS: Local access OK"
    ((PASS++)) || true
else
    echo "❌ FAIL: Local access failed (http=$CODE_LOCAL)"
    ((FAIL++)) || true
fi
echo ""

# Test 2: LAN access
echo "TEST 2: LAN Access (http://$LOCAL_IP:$DEV_PORT)"
if [[ -z "$LOCAL_IP" ]]; then
    echo "⏭️  SKIP: No LAN IP detected"
    ((FAIL++)) || true
else
    CODE_LAN="$(http_code "http://$LOCAL_IP:$DEV_PORT")"
    if [[ "$CODE_LAN" == "200" ]]; then
    echo "✅ PASS: LAN access OK"
    ((PASS++)) || true
    else
        echo "❌ FAIL: LAN access failed (http=$CODE_LAN)"
        ((FAIL++)) || true
    fi
fi
echo ""

# Test 3: Tunnel access (if active)
TUNNEL_URL_FILE="$ROOT_DIR/logs/network/tunnel.url"
if [[ -f "$TUNNEL_URL_FILE" ]]; then
    TUNNEL_URL="$(cat "$TUNNEL_URL_FILE" 2>/dev/null || true)"
    echo "TEST 3: Tunnel Access ($TUNNEL_URL)"

    CODE_TUNNEL="$(http_code "$TUNNEL_URL")"
    if [[ "$CODE_TUNNEL" == "200" ]]; then
        echo "✅ PASS: Tunnel access OK"
        ((PASS++)) || true
    else
        echo "❌ FAIL: Tunnel access failed (http=$CODE_TUNNEL)"
        ((FAIL++)) || true
    fi
    echo ""
    
    # Test 4: HTTPS enforcement
    echo "TEST 4: HTTPS Tunnel"
    if echo "$TUNNEL_URL" | grep -q "https://"; then
        echo "✅ PASS: HTTPS enforced"
        ((PASS++)) || true
    else
        echo "❌ FAIL: Not HTTPS"
        ((FAIL++)) || true
    fi
    echo ""
else
    echo "⏭️  SKIP: No active tunnel (tests 3-4)"
    echo ""
fi

# Test 5: Vite HMR
echo "TEST 5: Vite HMR WebSocket"
HTML_LOCAL="$(curl -sS --max-time 3 http://localhost:$DEV_PORT 2>/dev/null || true)"
if echo "$HTML_LOCAL" | grep -q "vite"; then
    echo "✅ PASS: Vite detected"
    ((PASS++)) || true
else
    echo "❌ FAIL: Vite not responding"
    ((FAIL++)) || true
fi
echo ""

# Test 6: No secrets exposed
echo "TEST 6: Security Check (no API keys in HTML)"
HTML_CONTENT="$HTML_LOCAL"
if [[ -z "$HTML_CONTENT" ]]; then
    echo "⏭️  SKIP: No HTML fetched (dev server down?)"
    ((FAIL++)) || true
else
    if echo "$HTML_CONTENT" | grep -qiE "(sk-|api[_-]?key|secret)"; then
        echo "❌ FAIL: Potential secrets detected in HTML"
        ((FAIL++)) || true
    else
        echo "✅ PASS: No secrets in HTML"
        ((PASS++)) || true
    fi
fi
echo ""

# Summary
echo "=============================="
echo "VALIDATION SUMMARY"
echo "=============================="
echo "✅ PASS: $PASS"
echo "❌ FAIL: $FAIL"
echo ""

if [ $FAIL -eq 0 ]; then
    echo "🎉 ALL TESTS PASSED"
    exit 0
else
    echo "⚠️  SOME TESTS FAILED"
    exit 1
fi
