#!/bin/bash
# TITANE∞ - Local pnpm wrapper
# Usage: ./pnpm-local.sh <command>

set -euo pipefail

cd "$(dirname "$0")"
export PATH="$PWD/.tools/node/current/bin:$PATH"

exec node .tools/node/current/lib/node_modules/corepack/dist/pnpm.js "$@"
