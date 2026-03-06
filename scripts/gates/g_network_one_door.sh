#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ALLOW_FILES='src-tauri/src/services/network_gateway.rs|src-tauri/src/core/http_types.rs'
PATTERN='\breqwest\b|\bureq\b'

MATCHES=$(grep -RInE "$PATTERN" "$ROOT_DIR/src-tauri/src" --exclude-dir=target --exclude='*.md' || true)
VIOLATIONS=$(echo "$MATCHES" | grep -Ev "$ALLOW_FILES" || true)

if [[ -n "${VIOLATIONS// /}" ]]; then
  echo "G_NETWORK_ONE_DOOR: FAIL"
  echo "$VIOLATIONS"
  exit 1
fi

echo "G_NETWORK_ONE_DOOR: PASS"
