#!/bin/bash
# TITANE∞ v∞.19.2.3Ω - Launcher Script
# © 2025 Kevin Thibault / TITANE Team

echo "╔══════════════════════════════════════════════════════════╗"
echo "║   TITANE∞ v∞.19.2.3Ω - Singularity Architecture          ║"
echo "╚══════════════════════════════════════════════════════════╝"

# Set required environment variables if not already set
export TITANE_SECRETS_PASSPHRASE="${TITANE_SECRETS_PASSPHRASE:-TitaneSecure2025}"

# Determine the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Path to the binary
BINARY_PATH="$SCRIPT_DIR/src-tauri/target/release/titane-infinity"

# Check if binary exists
if [ ! -f "$BINARY_PATH" ]; then
    echo "❌ Binary not found at: $BINARY_PATH"
    echo "   Please run: pnpm run tauri:build"
    exit 1
fi

echo "🚀 Launching TITANE∞..."
exec "$BINARY_PATH" "$@"
