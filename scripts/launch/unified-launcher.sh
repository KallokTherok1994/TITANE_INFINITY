#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
#   TITANE∞ Unified Launcher — Linux / macOS
#   Usage: bash scripts/launch/unified-launcher.sh [--no-ollama] [--dev]
#   Env: TITANE_FB_APP_ID — Facebook App ID (optional)
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

log() { echo "[TITANE Launcher] $*"; }
warn() { echo "[TITANE Launcher] ⚠  $*" >&2; }
die()  { echo "[TITANE Launcher] ✗  $*" >&2; exit 1; }

# ─── Parse args ─────────────────────────────────────────────────
NO_OLLAMA=0
DEV_MODE=0
for arg in "$@"; do
  case $arg in
    --no-ollama) NO_OLLAMA=1 ;;
    --dev)       DEV_MODE=1 ;;
  esac
done

# ─── Step 1: Detect OS ──────────────────────────────────────────
OS="$(uname -s)"
log "Platform: $OS"

# ─── Step 2: Check Ollama ───────────────────────────────────────
OLLAMA_OK=0
if [[ $NO_OLLAMA -eq 0 ]]; then
  if command -v ollama &>/dev/null && curl -sf http://127.0.0.1:11434/api/tags &>/dev/null; then
    log "Ollama: reachable ✓"
    OLLAMA_OK=1
  else
    warn "Ollama not reachable — starting in degraded mode"
    # Attempt to start ollama in background
    if command -v ollama &>/dev/null; then
      nohup ollama serve < /dev/null >> /tmp/titane-ollama.log 2>&1 &
      sleep 2
      if curl -sf http://127.0.0.1:11434/api/tags &>/dev/null; then
        log "Ollama: started ✓"
        OLLAMA_OK=1
      fi
    fi
  fi
fi

# ─── Step 3: Facebook App ID info ───────────────────────────────
if [[ -n "${TITANE_FB_APP_ID:-}" ]]; then
  log "Facebook OAuth: TITANE_FB_APP_ID is set (${#TITANE_FB_APP_ID} chars)"
else
  warn "Facebook OAuth: TITANE_FB_APP_ID not set — Facebook login will be unavailable"
fi

# ─── Step 4: Launch TITANE∞ ─────────────────────────────────────
if [[ $DEV_MODE -eq 1 ]]; then
  log "Starting in DEV mode (pnpm tauri dev)..."
  cd "$REPO_ROOT"
  exec corepack pnpm run dev:tauri
else
  # Production: find AppImage or installed binary
  APPIMAGE=$(ls -1t "$REPO_ROOT"/src-tauri/target/release/bundle/appimage/*.AppImage 2>/dev/null | head -n1 || true)
  INSTALLED_BIN="/usr/bin/titane-infinity"
  LOCAL_BIN="/usr/local/bin/titane-infinity"

  if [[ -f "$APPIMAGE" ]]; then
    log "Launching AppImage: $APPIMAGE"
    exec env TITANE_FB_APP_ID="${TITANE_FB_APP_ID:-}" "$APPIMAGE"
  elif [[ -x "$INSTALLED_BIN" ]]; then
    log "Launching installed binary: $INSTALLED_BIN"
    exec env TITANE_FB_APP_ID="${TITANE_FB_APP_ID:-}" "$INSTALLED_BIN"
  elif [[ -x "$LOCAL_BIN" ]]; then
    log "Launching: $LOCAL_BIN"
    exec env TITANE_FB_APP_ID="${TITANE_FB_APP_ID:-}" "$LOCAL_BIN"
  else
    die "TITANE∞ binary not found. Run 'pnpm tauri build' first or use --dev flag."
  fi
fi
