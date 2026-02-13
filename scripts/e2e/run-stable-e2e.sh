#!/usr/bin/env bash
# run-stable-e2e.sh — Stable E2E runner with persistent dev servers
# Prevents Playwright from killing servers mid-test
# Usage: bash scripts/e2e/run-stable-e2e.sh

set -euo pipefail

ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cd "$ROOT"

# Bundled node/pnpm
export PATH="$ROOT/.tools/node/current/bin:$PATH"

# Cleanup function
cleanup() {
  echo ""
  echo "🧹 Stopping servers..."
  if [[ -n "${VITE_PID:-}" ]] && kill -0 "$VITE_PID" 2>/dev/null; then
    kill "$VITE_PID" 2>/dev/null || true
    echo "   ✓ Stopped Vite (PID $VITE_PID)"
  fi
  
  # Cleanup any leftover processes on port 5173
  if lsof -ti:5173 >/dev/null 2>&1; then
    echo "   ⚠️  Port 5173 still occupied, killing..."
    lsof -ti:5173 | xargs -r kill -9 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

echo "🚀 [E2E Stable Runner] Starting persistent dev servers..."
echo ""

# Check if servers already running
if curl -fsS http://127.0.0.1:5173 >/dev/null 2>&1; then
  echo "⚠️  Vite already running on :5173 — will reuse"
  VITE_ALREADY_RUNNING=1
else
  VITE_ALREADY_RUNNING=0
fi

# Start Vite (unless already running)
if [[ "$VITE_ALREADY_RUNNING" == "0" ]]; then
  echo "🌐 Starting Vite dev server..."
  mkdir -p runtime/dev/logs
  pnpm exec vite dev --host 127.0.0.1 --port 5173 --strictPort \
    > runtime/dev/logs/e2e-vite.log 2>&1 &
  VITE_PID=$!
  echo "   ↳ Vite started (PID $VITE_PID)"
  
  # Wait for Vite ready
  echo "   ⏳ Waiting for Vite..."
  for i in {1..30}; do
    if curl -fsS http://127.0.0.1:5173 >/dev/null 2>&1; then
      echo "   ✅ Vite ready on :5173"
      break
    fi
    sleep 1
    if [[ "$i" == "30" ]]; then
      echo "   ❌ Vite failed to start"
      exit 1
    fi
  done
else
  echo "   ✅ Vite already running on :5173"
fi

echo ""
echo "✅ Vite dev server running: http://127.0.0.1:5173"
echo "⚠️  Running E2E tests WITHOUT Tauri backend (UI-only tests)"
echo ""

# Run Playwright with manual server mode
echo "🧪 Running Playwright E2E tests (UI-only, no Tauri backend)..."
echo ""
export TITANE_E2E_MANUAL_SERVER=1
unset TITANE_E2E_TAURI  # Disable Tauri-specific tests

if pnpm exec playwright test "$@"; then
  echo ""
  echo "✅ All E2E tests passed!"
  EXIT_CODE=0
else
  echo ""
  echo "❌ Some E2E tests failed"
  EXIT_CODE=1
fi

echo ""
echo "📋 Logs available:"
echo "   • Vite: runtime/dev/logs/e2e-vite.log"
echo "   • Tauri: runtime/dev/logs/e2e-tauri.log"
echo ""

exit $EXIT_CODE
