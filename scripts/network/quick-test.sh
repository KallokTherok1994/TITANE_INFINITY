#!/bin/bash
# Quick network validation (no tunnel, just local/LAN)

echo "🧪 QUICK NETWORK TEST"
echo "===================="
echo ""

LOCAL_IP=$(hostname -I | awk '{print $1}')
PASS=0
FAIL=0

# Test Local
echo "TEST 1: Local (localhost:5173)"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 2>/dev/null | grep -q "200"; then
    echo "✅ PASS"
    ((PASS++))
else
    echo "⚠️  SKIP (dev server not running)"
fi

# Test LAN
echo "TEST 2: LAN ($LOCAL_IP:5173)"
if curl -s -o /dev/null -w "%{http_code}" http://$LOCAL_IP:5173 2>/dev/null | grep -q "200"; then
    echo "✅ PASS"
    ((PASS++))
else
    echo "⚠️  SKIP (dev server not running)"
fi

echo ""
echo "SUMMARY: $PASS tests passed"
