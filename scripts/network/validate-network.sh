#!/bin/bash
# TITANE∞ Network Dev Tunnel - Validation Script
# Test local, LAN, and tunnel access

set -e

echo "🧪 TITANE∞ NETWORK VALIDATION"
echo "=============================="
echo ""

PASS=0
FAIL=0
LOCAL_IP=$(hostname -I | awk '{print $1}')
DEV_PORT=5173

# Test 1: Local access
echo "TEST 1: Local Access (http://localhost:$DEV_PORT)"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:$DEV_PORT | grep -q "200"; then
    echo "✅ PASS: Local access OK"
    ((PASS++))
else
    echo "❌ FAIL: Local access failed"
    ((FAIL++))
fi
echo ""

# Test 2: LAN access
echo "TEST 2: LAN Access (http://$LOCAL_IP:$DEV_PORT)"
if curl -s -o /dev/null -w "%{http_code}" http://$LOCAL_IP:$DEV_PORT | grep -q "200"; then
    echo "✅ PASS: LAN access OK"
    ((PASS++))
else
    echo "❌ FAIL: LAN access failed"
    ((FAIL++))
fi
echo ""

# Test 3: Tunnel access (if active)
if [ -f logs/network/tunnel.url ]; then
    TUNNEL_URL=$(cat logs/network/tunnel.url)
    echo "TEST 3: Tunnel Access ($TUNNEL_URL)"
    
    if curl -s -o /dev/null -w "%{http_code}" "$TUNNEL_URL" | grep -q "200"; then
        echo "✅ PASS: Tunnel access OK"
        ((PASS++))
    else
        echo "❌ FAIL: Tunnel access failed"
        ((FAIL++))
    fi
    echo ""
    
    # Test 4: HTTPS enforcement
    echo "TEST 4: HTTPS Tunnel"
    if echo "$TUNNEL_URL" | grep -q "https://"; then
        echo "✅ PASS: HTTPS enforced"
        ((PASS++))
    else
        echo "❌ FAIL: Not HTTPS"
        ((FAIL++))
    fi
    echo ""
else
    echo "⏭️  SKIP: No active tunnel (tests 3-4)"
    echo ""
fi

# Test 5: Vite HMR
echo "TEST 5: Vite HMR WebSocket"
if curl -s http://localhost:$DEV_PORT | grep -q "vite"; then
    echo "✅ PASS: Vite detected"
    ((PASS++))
else
    echo "❌ FAIL: Vite not responding"
    ((FAIL++))
fi
echo ""

# Test 6: No secrets exposed
echo "TEST 6: Security Check (no API keys in HTML)"
HTML_CONTENT=$(curl -s http://localhost:$DEV_PORT)
if echo "$HTML_CONTENT" | grep -qiE "(sk-|api[_-]?key|secret)"; then
    echo "❌ FAIL: Potential secrets detected in HTML"
    ((FAIL++))
else
    echo "✅ PASS: No secrets in HTML"
    ((PASS++))
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
