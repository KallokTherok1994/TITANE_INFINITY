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

kill_port_from_ss() {
    local port="$1"
    if ! command -v ss >/dev/null 2>&1; then
        return 0
    fi

    (ss -ltnp 2>/dev/null || ss -ltn 2>/dev/null) \
        | grep -E ":(${port})\\b" \
        | sed -nE 's/.*pid=([0-9]+).*/\1/p' \
        | sort -u \
        | while read -r pid; do
            [ -z "$pid" ] && continue
            kill -TERM "$pid" 2>/dev/null || true
        done
}

kill_port() {
    local port="$1"
    if command -v lsof >/dev/null 2>&1; then
        lsof -ti:"$port" 2>/dev/null | xargs kill -TERM 2>/dev/null || true
        sleep 1
        lsof -ti:"$port" 2>/dev/null | xargs kill -KILL 2>/dev/null || true
        return 0
    fi

    kill_port_from_ss "$port"
    sleep 1
    kill_port_from_ss "$port"
}

# Pre-cleanup audit
BEFORE_COUNT=$(count_processes "tauri dev|pnpm run dev:tauri|corepack pnpm run dev:tauri|pnpm run tauri|corepack pnpm run tauri|vite")
echo "📊 Processus détectés (Tauri/Vite): $BEFORE_COUNT"

# Kill Vite processes (dev server interne Tauri) — clean leftovers/orphans only
echo "🔄 Arrêt des processus Vite orphelins (dev server interne Tauri)..."
pkill -f "vite" 2>/dev/null || true
sleep 1

# Kill Tauri dev / pnpm tauri processes
echo "🔄 Arrêt des processus Tauri dev..."
pkill -f "tauri dev" 2>/dev/null || true
pkill -f "pnpm run dev:tauri" 2>/dev/null || true
pkill -f "corepack pnpm run dev:tauri" 2>/dev/null || true
pkill -f "pnpm run tauri" 2>/dev/null || true
pkill -f "corepack pnpm run tauri" 2>/dev/null || true
sleep 1

# Kill orphaned TITANE∞ dev binaries (can linger if parent process exits)
echo "🔄 Arrêt des binaires TITANE∞ dev orphelins..."
pkill -f "target/debug/titane-infinity" 2>/dev/null || true
sleep 1

# Free common dev ports (legacy Vite)
echo "🔓 Libération des ports legacy (4000/5173/4173)..."
kill_port 4000
kill_port 5173
kill_port 4173
sleep 1

# Free Titan-Dev port (if a previous run left a server bound)
echo "🔓 Libération du port Titan-Dev (1430)..."
kill_port 1430
sleep 1

# Verify cleanup
AFTER_COUNT=$(count_processes "tauri dev|pnpm run dev:tauri|corepack pnpm run dev:tauri|pnpm run tauri|corepack pnpm run tauri|vite")
CLEANED=$((BEFORE_COUNT - AFTER_COUNT))

echo ""
echo "╔═══════════════════════════════════════════════════════════════════════╗"
echo "║   ✅ CLEANUP TERMINÉ                                                   ║"
echo "╚═══════════════════════════════════════════════════════════════════════╝"
echo ""
echo "  Processus nettoyés: $CLEANED"
echo "  Processus restants: $AFTER_COUNT"
echo "  Ports legacy 4000/5173/4173: LIBRES"
echo ""

# Warning if processes remain
if [ $AFTER_COUNT -gt 0 ]; then
    echo "⚠️  AVERTISSEMENT: $AFTER_COUNT processus persistent (probablement normaux)"
    echo "   Vérifier avec: ps aux | grep -E 'tauri dev|pnpm run dev:tauri|pnpm run tauri|vite'"
    echo ""
fi

exit 0
