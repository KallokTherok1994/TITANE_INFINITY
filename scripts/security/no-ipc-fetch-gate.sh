#!/usr/bin/env bash
set -euo pipefail

# TITANE∞ - Gate: No IPC Fetch
# Interdit l'usage de fetch("ipc://...") dans le frontend
# Doit être utilisé dans les pipelines CI/CD

ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cd "$ROOT"

echo "🔍 TITANE∞ - Gate: No IPC Fetch"
echo "================================="

# Recherche de fetch("ipc://
IPC_FETCH_COUNT=$(grep -r "fetch(\"ipc://" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | wc -l || true)

# Recherche de fetch('ipc://
IPC_FETCH_SINGLE_COUNT=$(grep -r "fetch('ipc://" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | wc -l || true)

TOTAL_IPC_FETCH=$((IPC_FETCH_COUNT + IPC_FETCH_SINGLE_COUNT))

if [ "$TOTAL_IPC_FETCH" -gt 0 ]; then
    echo "❌ FAIL: Found $TOTAL_IPC_FETCH ipc:// fetch calls in frontend code"
    echo ""
    echo "🚨 SECURITY VIOLATION: Direct IPC fetch calls detected!"
    echo ""
    echo "All IPC communication must use the secure tauriClient wrapper."
    echo "Replace fetch(\"ipc://...\") with tauriClient.invokeName(...)"
    echo ""
    echo "Found calls:"
    grep -r "fetch.*ipc://" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" || true
    echo ""
    exit 1
fi

echo "✅ PASS: No ipc:// fetch calls found in frontend code"
echo "   All IPC communication uses secure tauriClient wrapper"
exit 0
