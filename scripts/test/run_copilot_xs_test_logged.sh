#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

mkdir -p runtime/stable/logs
TS="$(date +%Y%m%d-%H%M%S)"
LOG_FILE="runtime/stable/logs/copilot-xs-test-$TS.log"

DETACH=0
if [[ "${1:-}" == "--detach" ]]; then
  DETACH=1
fi

{
  echo "Timestamp: $TS"
  echo "Root: $ROOT_DIR"
  echo "Command: npm run copilot-xs:test"
  echo "Mode: $([[ $DETACH -eq 1 ]] && echo 'detach' || echo 'foreground')"
  echo "----------------------------------------"
} | tee "$LOG_FILE"

if [[ $DETACH -eq 1 ]]; then
  # Detached mode: continue even if terminal closes / receives SIGINT.
  # We avoid tee here to keep the process independent.
  nohup bash -lc "cd '$ROOT_DIR' && npm run copilot-xs:test" >>"$LOG_FILE" 2>&1 &
  PID=$!
  {
    echo "✅ Started detached. PID: $PID"
    echo "Log: $LOG_FILE"
  } | tee -a "$LOG_FILE"
  exit 0
fi

# Foreground mode: live output + persistent log.
if command -v stdbuf >/dev/null 2>&1; then
  stdbuf -oL -eL npm run copilot-xs:test 2>&1 | tee -a "$LOG_FILE"
else
  npm run copilot-xs:test 2>&1 | tee -a "$LOG_FILE"
fi

echo "✅ Done. Log: $LOG_FILE" | tee -a "$LOG_FILE"
