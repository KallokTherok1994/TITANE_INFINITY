#!/bin/bash
# Test deploy minimal sans tee

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== DEPLOY MINIMAL TEST ==="
echo "Project: $PROJECT_ROOT"
echo ""

echo "Phase 0: Cleanup..."
pkill -9 -f vite 2>/dev/null || echo "✓ No vite"
pkill -9 -f "tauri dev" 2>/dev/null || echo "✓ No tauri dev"
echo "✓ Cleanup done"

echo ""
echo "Phase 1: Environment..."
if command -v ldd &>/dev/null; then
    GLIBC_OUTPUT=$(ldd --version 2>&1 || true)
    GLIBC_VERSION=$(echo "$GLIBC_OUTPUT" | sed -n '1p' | awk '{print $NF}')
    echo "✓ GLIBC: $GLIBC_VERSION"
fi

if command -v node &>/dev/null; then
    echo "✓ Node: $(node --version)"
fi

if command -v npm &>/dev/null; then
    echo "✓ npm: $(npm --version)"
fi

echo ""
echo "Phase 2: Dependencies..."
if [[ -f "package.json" ]]; then
    echo "✓ package.json found"
fi

echo ""
echo "Phase 3: Backup..."
BACKUP_DIR="${HOME}/titane/backup"
mkdir -p "$BACKUP_DIR" 2>/dev/null || true
echo "✓ Backup dir: $BACKUP_DIR"

echo ""
echo "Phase 4: Build frontend..."
npm run build && echo "✓ Build succeeded" || echo "✗ Build failed"

echo ""
echo "=== TEST COMPLETED ==="
