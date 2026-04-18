#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "→ Verifying frontend HMR circular dependency corridor..."

pnpm exec madge \
  --circular \
  --ts-config tsconfig.json \
  --extensions ts,tsx \
  --exclude '^(src/)?(services|visual-engine|engines|stores|components|ui|pages|apps|features|lib|modules|stories|examples|_deprecated|test|__tests__)/' \
  src/hooks src/contexts src/utils src/config src/types

echo "PASS: frontend HMR circular dependency corridor is clean"