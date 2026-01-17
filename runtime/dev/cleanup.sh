#!/bin/bash

###############################################################################
# TITANE∞ Development Environment Cleanup Script
# Version: 1.0.0
# Purpose: Clean stale Node/Vite processes before launching dev server
###############################################################################

set -e

echo "╔═══════════════════════════════════════════════════════════════════════╗"
echo "║                                                                       ║"
echo "║   🧹 TITANE∞ DEV CLEANUP - Nettoyage Processus                        ║"
echo "║                                                                       ║"
echo "╚═══════════════════════════════════════════════════════════════════════╝"
echo ""

# Function to count processes
count_processes() {
    local pattern="$1"
    ps aux | grep -E "$pattern" | grep -v grep | wc -l
}

# Pre-cleanup audit
BEFORE_COUNT=$(count_processes "tauri dev|pnpm run dev:tauri|corepack pnpm run dev:tauri|pnpm run tauri|corepack pnpm run tauri|vite|run-dev.sh")
echo "📊 Processus détectés (Tauri/Vite): $BEFORE_COUNT"

# Kill Vite process (prefer pidfile to avoid killing unrelated Vite sessions)
echo "🔄 Arrêt des processus Vite (interdit en TAURI-only)..."
VITE_PIDFILE="runtime/dev/logs/vite.pid"
if [ -f "$VITE_PIDFILE" ]; then
    VITE_PID=$(cat "$VITE_PIDFILE" 2>/dev/null || true)
    if [ -n "${VITE_PID:-}" ] && ps -p "$VITE_PID" >/dev/null 2>&1; then
        echo "   • Vite pidfile détecté: $VITE_PID"
        kill "$VITE_PID" 2>/dev/null || true
        sleep 1
        if ps -p "$VITE_PID" >/dev/null 2>&1; then
            kill -9 "$VITE_PID" 2>/dev/null || true
        fi
    fi
    rm -f "$VITE_PIDFILE" 2>/dev/null || true
fi

# Fallback: narrower match on the dev port to avoid collateral kills
pkill -f "vite dev --host 127\.0\.0\.1 --port 5173" 2>/dev/null || true
sleep 1

# Backward-compatible cleanup: remove legacy FIFO/filter artifacts if present
echo "🧹 Nettoyage des artefacts Vite (legacy)..."
rm -f runtime/dev/logs/vite.filter.pid runtime/dev/logs/vite.pipe 2>/dev/null || true

# Kill Tauri dev / pnpm tauri processes
echo "🔄 Arrêt des processus Tauri dev..."
pkill -f "tauri dev" 2>/dev/null || true
pkill -f "pnpm run dev:tauri" 2>/dev/null || true
pkill -f "corepack pnpm run dev:tauri" 2>/dev/null || true
pkill -f "pnpm run tauri" 2>/dev/null || true
pkill -f "corepack pnpm run tauri" 2>/dev/null || true
sleep 1

# Kill run-dev.sh processes (launcher script)
echo "🔄 Arrêt des processus run-dev.sh..."
pkill -f "run-dev.sh" 2>/dev/null || true
sleep 1

# Kill orphaned TITANE∞ dev binaries (can linger if parent process exits)
echo "🔄 Arrêt des binaires TITANE∞ dev orphelins..."
pkill -f "target/debug/titane-infinity" 2>/dev/null || true
sleep 1

# Free common dev ports (legacy Vite)
echo "🔓 Libération des ports legacy (5173/4173)..."
lsof -ti:5173 2>/dev/null | xargs kill -9 2>/dev/null || true
lsof -ti:4173 2>/dev/null | xargs kill -9 2>/dev/null || true
sleep 1

# Free Titan-Dev port (if a previous run left a server bound)
echo "🔓 Libération du port Titan-Dev (1430)..."
lsof -ti:1430 2>/dev/null | xargs kill -9 2>/dev/null || true
sleep 1

# Verify cleanup
AFTER_COUNT=$(count_processes "tauri dev|pnpm run dev:tauri|corepack pnpm run dev:tauri|pnpm run tauri|corepack pnpm run tauri|vite|run-dev.sh")
CLEANED=$((BEFORE_COUNT - AFTER_COUNT))

echo ""
echo "╔═══════════════════════════════════════════════════════════════════════╗"
echo "║   ✅ CLEANUP TERMINÉ                                                   ║"
echo "╚═══════════════════════════════════════════════════════════════════════╝"
echo ""
echo "  Processus nettoyés: $CLEANED"
echo "  Processus restants: $AFTER_COUNT"
echo "  Ports legacy 5173/4173: LIBRES"
echo ""

# Warning if processes remain
if [ $AFTER_COUNT -gt 0 ]; then
    echo "⚠️  AVERTISSEMENT: $AFTER_COUNT processus persistent (probablement normaux)"
    echo "   Vérifier avec: ps aux | grep -E 'tauri dev|pnpm run dev:tauri|pnpm run tauri|vite|run-dev.sh'"
    echo ""
fi

exit 0
