#!/bin/bash
# TITANE∞ - Local pnpm wrapper
# Usage: ./pnpm-local.sh <command>

set -euo pipefail

cd "$(dirname "$0")"

# Use system pnpm if local one is broken
if command -v pnpm >/dev/null 2>&1; then
  exec pnpm "$@"
else
  echo "Error: pnpm not found in system PATH" >&2
  exit 1
fi
