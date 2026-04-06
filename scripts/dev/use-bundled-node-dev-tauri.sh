#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
NODE_BIN_DIR="$ROOT_DIR/.tools/node/current/bin"

if [[ ! -d "$NODE_BIN_DIR" ]]; then
  echo "ERROR: bundled node path not found: $NODE_BIN_DIR" >&2
  exit 1
fi

export PATH="$NODE_BIN_DIR:$PATH"

echo "Using node: $(command -v node)"
node -v

exec "$NODE_BIN_DIR/pnpm" run dev:tauri
