#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
#   TITANE∞ Remote Access — Build Remote Frontend
#   Builds the Vite frontend in "remote" mode for dist/remote/
#   The resulting bundle is served by the axum static server.
#   Usage: bash scripts/remote/build-remote-frontend.sh
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DIST_REMOTE="${REPO_ROOT}/dist/remote"

echo "[build-remote] Building TITANE remote frontend..."
echo "[build-remote] Output: ${DIST_REMOTE}"

cd "$REPO_ROOT"

# Build with VITE_REMOTE_MODE flag
VITE_REMOTE_MODE=1 \
VITE_BUILD_TARGET=remote \
  pnpm run build 2>&1

# Move or ensure output is in dist/remote/
if [[ -d "${REPO_ROOT}/dist" && ! -d "${DIST_REMOTE}" ]]; then
    mv "${REPO_ROOT}/dist" "${DIST_REMOTE}"
    echo "[build-remote] ✅ Moved dist/ → dist/remote/"
elif [[ -d "${DIST_REMOTE}" ]]; then
    echo "[build-remote] ✅ dist/remote/ already exists"
fi

# Inject remote-mode flag into index.html (for transport detection)
INDEX_HTML="${DIST_REMOTE}/index.html"
if [[ -f "$INDEX_HTML" ]]; then
    if ! grep -q "__TITANE_REMOTE__" "$INDEX_HTML"; then
        sed -i 's|</head>|<script>window.__TITANE_REMOTE__=true;</script></head>|' "$INDEX_HTML"
        echo "[build-remote] ✅ Injected window.__TITANE_REMOTE__=true into index.html"
    else
        echo "[build-remote] ℹ️  Remote flag already present in index.html"
    fi
fi

echo ""
echo "══════════════════════════════════════════════════════════"
echo "  Remote frontend build complete: ${DIST_REMOTE}"
echo ""
echo "  Start TITANE with:"
echo "    export TITANE_REMOTE_ENABLED=1"
echo "    export TITANE_REMOTE_SECRET=your-strong-secret"
echo "    export TITANE_REMOTE_DIST=${DIST_REMOTE}"
echo "    titane-infinity"
echo ""
echo "  Then start the tunnel:"
echo "    bash scripts/remote/start-tunnel.sh"
echo "══════════════════════════════════════════════════════════"
