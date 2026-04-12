#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
#   TITANE∞ — SearXNG Local Setup Helper
#   Sets up SearXNG via Docker for TITANE∞ web search backend.
#   One Door governance: TITANE web search → IPC → Rust → SearXNG
#
#   Usage: bash scripts/setup-searxng.sh
#   Requirements: Docker installed and running
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

CONTAINER_NAME="titane-searxng"
HOST_PORT="${SEARXNG_PORT:-8888}"
IMAGE="searxng/searxng:latest"
SECRET=$(openssl rand -hex 32)

echo "[SETUP-SEARXNG] Checking Docker availability..."
if ! command -v docker &>/dev/null; then
  echo "[SETUP-SEARXNG] ERROR: Docker is not installed or not in PATH."
  echo "  Install Docker: https://docs.docker.com/get-docker/"
  exit 1
fi

if ! docker info &>/dev/null; then
  echo "[SETUP-SEARXNG] ERROR: Docker daemon is not running."
  echo "  Start Docker and retry."
  exit 1
fi

# Remove existing container if present
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "[SETUP-SEARXNG] Removing existing container '${CONTAINER_NAME}'..."
  docker rm -f "${CONTAINER_NAME}"
fi

echo "[SETUP-SEARXNG] Pulling SearXNG image..."
docker pull "${IMAGE}"

echo "[SETUP-SEARXNG] Starting SearXNG container..."
docker run -d \
  --name "${CONTAINER_NAME}" \
  -p "${HOST_PORT}:8080" \
  -e SEARXNG_SECRET="${SECRET}" \
  --restart unless-stopped \
  "${IMAGE}"

echo ""
echo "✅ SearXNG is running at http://127.0.0.1:${HOST_PORT}"
echo ""
echo "Test with:"
echo "  curl 'http://127.0.0.1:${HOST_PORT}/search?q=test&format=json' | head -c 500"
echo ""
echo "Configure TITANE∞ to use it:"
echo "  export TITANE_SEARCH_API_URL='http://127.0.0.1:${HOST_PORT}/search'"
echo "  # or set SEARXNG_URL in your .env file"
echo ""
echo "Stop with:"
echo "  docker stop ${CONTAINER_NAME}"
echo ""
echo "Generated secret (stored in container env, not needed externally):"
echo "  ${SECRET}"
