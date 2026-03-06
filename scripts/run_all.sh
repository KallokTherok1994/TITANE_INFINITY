#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PACK_DIR="${1:-$ROOT_DIR/proof_packs/OPTION1_LIBSQL_TESTS_2026-03-05_1253_f0ec87ead}"

mkdir -p "$PACK_DIR"

echo "[$(date -Iseconds)] run_all.sh start" | tee -a "$PACK_DIR/05_COMMANDS_USED.md"

bash "$SCRIPT_DIR/lib/scan_invariants.sh" "$PACK_DIR"

bash "$SCRIPT_DIR/lib/run_x3.sh" "$PACK_DIR/06_TESTS_X3.log" pnpm run test:rust
bash "$SCRIPT_DIR/lib/run_x3.sh" "$PACK_DIR/06_TESTS_X3.log" pnpm run test -- src/hooks/__tests__/useTitaneDb.test.ts
bash "$SCRIPT_DIR/lib/run_x3.sh" "$PACK_DIR/07_BUILD_X3.log" pnpm tauri build

if pnpm run test:e2e -- --list >/dev/null 2>&1; then
	bash "$SCRIPT_DIR/lib/run_x3.sh" "$PACK_DIR/08_E2E_X3.log" pnpm run test:e2e
else
	echo "BLOCKED_E2E: runner unavailable or not executable in current context" | tee -a "$PACK_DIR/08_E2E_X3.log"
fi

echo "[$(date -Iseconds)] run_all.sh end" | tee -a "$PACK_DIR/05_COMMANDS_USED.md"
