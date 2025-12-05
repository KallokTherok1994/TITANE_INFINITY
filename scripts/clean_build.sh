#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#   TITANE∞ — CLEAN BUILD v24
#   Nettoyage complet avant build propre
# ═══════════════════════════════════════════════════════════════

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🧹 Cleaning TITANE∞..."

# Kill processes
pkill -9 -f 'tauri|cargo|vite' 2>/dev/null || true

# Remove build artifacts
rm -rf src-tauri/target
rm -rf node_modules
rm -rf .vite
rm -rf dist
rm -f src-tauri/Cargo.lock
rm -f pnpm-lock.yaml

# Remove logs
rm -rf logs/*.log 2>/dev/null || true

echo "✅ Clean complete!"
echo "Run: pnpm install && pnpm dev"
