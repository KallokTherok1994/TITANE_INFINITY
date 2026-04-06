#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

PROFILE="${1:-}"
LOGFILE="${2:-}"

if [[ -z "$PROFILE" ]]; then
  echo "Usage: $0 <tests|build|network> [logfile]" >&2
  exit 2
fi

timestamp="$(date -u +%Y%m%dT%H%M%SZ)"

case "$PROFILE" in
  tests)
    logfile_default="reports/run_x3/tests_${timestamp}.log"
    LOGFILE="${LOGFILE:-$logfile_default}"
    timeout_sec="${RUN_X3_TIMEOUT_TESTS:-240}"
    CMD=(timeout "$timeout_sec" pnpm run test:architecture)
    ;;
  build)
    logfile_default="reports/run_x3/build_${timestamp}.log"
    LOGFILE="${LOGFILE:-$logfile_default}"
    timeout_sec="${RUN_X3_TIMEOUT_BUILD:-420}"
    CMD=(timeout "$timeout_sec" pnpm run build:tauri:e2e)
    ;;
  network)
    logfile_default="reports/run_x3/network_${timestamp}.log"
    LOGFILE="${LOGFILE:-$logfile_default}"
    timeout_sec="${RUN_X3_TIMEOUT_NETWORK:-120}"
    CMD=(timeout "$timeout_sec" bash scripts/gates/rc-network-surface-gate.sh)
    ;;
  *)
    echo "Unknown profile: $PROFILE (expected: tests|build|network)" >&2
    exit 2
    ;;
esac

echo "[run_x3_profile] profile=$PROFILE logfile=$LOGFILE"
bash scripts/lib/run_x3.sh "$LOGFILE" "${CMD[@]}"
