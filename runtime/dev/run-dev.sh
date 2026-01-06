#!/bin/bash
# TITANE∞ — Run DEV RUNTIME (Development)
# Usage: ./runtime/dev/run-dev.sh

set -euo pipefail

# Navigate to project root
cd "$(dirname "$0")/../.."

# Ensure repo-bundled Node/PNPM tools are available
export PATH="$PWD/.tools/node/current/bin:$PATH"

# Run cleanup script first
echo "🧹 Pre-launch cleanup..."
./runtime/dev/cleanup.sh
echo ""

echo "🟢 TITANE∞ — Starting DEV RUNTIME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Safety: block running dev runtime on stable-runtime branch
CURRENT_BRANCH=$(git branch --show-current)
if [[ $CURRENT_BRANCH == "stable-runtime" ]]; then
    echo "❌ ERROR: You are on stable-runtime branch"
    echo "Dev runtime must NOT be launched from 'stable-runtime'"
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
# Note: TAURI-ONLY: build.beforeDevCommand génère dist (aucun serveur HTTP).
# You can pass extra flags to tauri dev via this script, e.g.:
#   ./runtime/dev/run-dev.sh --features full ollama
if command -v corepack &> /dev/null; then
    set +e
    corepack pnpm run dev:tauri -- "$@" 2>&1 | tee runtime/dev/logs/tauri.log
    cmd_ec=${PIPESTATUS[0]}
    set -e
elif command -v pnpm &> /dev/null; then
    set +e
    pnpm run dev:tauri -- "$@" 2>&1 | tee runtime/dev/logs/tauri.log
    cmd_ec=${PIPESTATUS[0]}
    set -e
elif [ -x "$PWD/.tools/node/current/bin/pnpm" ]; then
    "$PWD/.tools/node/current/bin/pnpm" run dev:tauri -- "$@" 2>&1 | tee runtime/dev/logs/tauri.log
else
    echo "❌ ERROR: pnpm introuvable (corepack/pnpm/.tools/node/current/bin/pnpm)"
    exit 1
fi

# 130: SIGINT (Ctrl+C) / 143: SIGTERM — consider normal shutdown for dev runtime.
if [ "${cmd_ec:-0}" -eq 0 ] || [ "${cmd_ec:-0}" -eq 130 ] || [ "${cmd_ec:-0}" -eq 143 ]; then
    exit 0
fi

exit "$cmd_ec"
