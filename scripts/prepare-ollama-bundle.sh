#!/bin/bash
# Prepare Ollama binary for Tauri bundle resources
# Usage: bash scripts/prepare-ollama-bundle.sh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RESOURCE_DIR="$ROOT_DIR/src-tauri/resources/ollama"
TARGET_BIN="$RESOURCE_DIR/ollama"

if ! command -v ollama >/dev/null 2>&1; then
  echo "✗ Ollama not found in PATH. Install Ollama first." >&2
  exit 1
fi

mkdir -p "$RESOURCE_DIR"

OLLAMA_BIN="$(command -v ollama)"

cp "$OLLAMA_BIN" "$TARGET_BIN"
chmod +x "$TARGET_BIN"

sha256sum "$TARGET_BIN" | awk '{print "✓ Bundled Ollama SHA256: " $1}'

echo "✓ Ollama bundled at: $TARGET_BIN"
