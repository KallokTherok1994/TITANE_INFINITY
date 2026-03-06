#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PACK_DIR="${1:-$ROOT_DIR/proof_packs/OPTION1_LIBSQL_TESTS_2026-03-05_1253_f0ec87ead}"
OUT_FILE="$PACK_DIR/04_INVARIANTS_CHECK.md"

mkdir -p "$PACK_DIR"

{
  echo "# 04_INVARIANTS_CHECK"
  date -Iseconds
  echo

  echo "## g_frontend_no_web"
  bash "$ROOT_DIR/scripts/gates/g_frontend_no_web.sh"
  echo

  echo "## g_network_one_door"
  bash "$ROOT_DIR/scripts/gates/g_network_one_door.sh"
  echo

  echo "## g_no_test_skips"
  bash "$ROOT_DIR/scripts/gates/g_no_test_skips.sh"
  echo
} | tee -a "$OUT_FILE"
