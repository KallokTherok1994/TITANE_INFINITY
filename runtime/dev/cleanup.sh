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
BEFORE_COUNT=$(count_processes "vite|npm run dev")
echo "📊 Processus Vite/NPM détectés: $BEFORE_COUNT"

# Kill Vite dev server processes
echo "🔄 Arrêt des serveurs Vite..."
pkill -f "vite" 2>/dev/null || true
sleep 1

# Kill NPM dev processes
echo "🔄 Arrêt des processus NPM dev..."
pkill -f "npm run dev" 2>/dev/null || true
sleep 1

# Free port 5173 (Vite default)
echo "🔓 Libération du port 5173..."
lsof -ti:5173 2>/dev/null | xargs kill -9 2>/dev/null || true
sleep 1

# Verify cleanup
AFTER_COUNT=$(count_processes "vite|npm run dev")
CLEANED=$((BEFORE_COUNT - AFTER_COUNT))

echo ""
echo "╔═══════════════════════════════════════════════════════════════════════╗"
echo "║   ✅ CLEANUP TERMINÉ                                                   ║"
echo "╚═══════════════════════════════════════════════════════════════════════╝"
echo ""
echo "  Processus nettoyés: $CLEANED"
echo "  Processus restants: $AFTER_COUNT"
echo "  Port 5173: LIBRE"
echo ""

# Warning if processes remain
if [ $AFTER_COUNT -gt 0 ]; then
    echo "⚠️  AVERTISSEMENT: $AFTER_COUNT processus persistent (probablement normaux)"
    echo "   Vérifier avec: ps aux | grep -E 'vite|npm run dev'"
    echo ""
fi

exit 0
