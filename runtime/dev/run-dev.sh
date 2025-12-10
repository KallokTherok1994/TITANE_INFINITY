#!/bin/bash
# TITANE∞ — Run DEV RUNTIME (Development)
# Usage: ./runtime/dev/run-dev.sh

set -e

# Navigate to project root
cd "$(dirname "$0")/../.."

# Run cleanup script first
echo "🧹 Pre-launch cleanup..."
./runtime/dev/cleanup.sh
echo ""

echo "🟢 TITANE∞ — Starting DEV RUNTIME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check we're on dev or feature/* branch
CURRENT_BRANCH=$(git branch --show-current)
if [[ $CURRENT_BRANCH == "stable-runtime" ]]; then
    echo "❌ ERROR: You are on stable-runtime branch"
    echo "Development must be done on 'dev' or 'feature/*' branches"
    echo ""
    echo "Run: ./scripts/git/switch-dev.sh"
    exit 1
fi

echo "📋 Dev Configuration:"
echo "  • Mode: DEVELOPMENT"
echo "  • Branch: $CURRENT_BRANCH"
echo "  • Target: Titan-Dev (dev runtime)"
echo "  • Hot Reload: MANUAL (Ctrl+R for React)"
echo "  • Tauri Watch: DISABLED (prevents crashes)"
echo "  • DevTools: ENABLED"
echo "  • Logging: FULL DEBUG"
echo "  • Monitoring: ACTIVE"
echo ""

# Load dev environment (filter out comments and empty lines)
export $(grep -v '^#' runtime/dev/.env.development | grep -v '^$' | xargs)

# Clean previous dev builds (optional)
echo "🧹 Cleaning dev cache..."
rm -rf runtime/dev/logs/
mkdir -p runtime/dev/logs/

# Start Vite dev server in background
echo ""
echo "⚛️  Starting Vite dev server..."
npm run vite:dev > runtime/dev/logs/vite.log 2>&1 &
VITE_PID=$!
echo "Vite PID: $VITE_PID"

# Wait for Vite to be ready
sleep 3

# Start Tauri dev (without watch to prevent crashes)
echo ""
echo "🦀 Starting Tauri dev (watch disabled)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 DEV RUNTIME CONTROLS:"
echo "  • Ctrl+R: Reload React (soft reload)"
echo "  • F5: Full window reload"
echo "  • F12: Toggle DevTools"
echo "  • Ctrl+C: Stop dev server"
echo ""
echo "📁 Logs: runtime/dev/logs/"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Run Tauri dev without auto-reload
npm run tauri dev -- --no-watch 2>&1 | tee runtime/dev/logs/tauri.log

# Cleanup on exit
trap "kill $VITE_PID 2>/dev/null" EXIT
