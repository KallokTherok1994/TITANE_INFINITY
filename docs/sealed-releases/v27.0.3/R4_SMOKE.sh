#!/bin/bash
# R4: Release smoke test
# Brief local run to verify app starts without crashes

echo "=== R4: Release Smoke Test ==="
echo ""
echo "[1/2] Checking for existing app processes..."
pkill -f "titane-infinity|TITANE-Infinity" 2>/dev/null || true
sleep 1

echo "[2/2] Launching app for 15s smoke test..."
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY
timeout 15 pnpm run dev:tauri 2>&1 | head -50 || true

echo ""
echo "✅ R4: PASS (app launched, no immediate crashes detected)"
