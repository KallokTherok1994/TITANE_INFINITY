#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 4 ]; then
  echo "Usage: $0 <proof_pack_dir> <aggregate_log_file> <command_id> <command_string>" >&2
  exit 2
fi

PACK_DIR="$1"
AGG_LOG="$2"
CMD_ID="$3"
CMD_STR="$4"

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
if [ -d "$REPO_ROOT/.tools/node/current/bin" ]; then
  export PATH="$REPO_ROOT/.tools/node/current/bin:$PATH"
fi

mkdir -p "$PACK_DIR/logs"
AGG_PATH="$PACK_DIR/$AGG_LOG"
TS="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
SAFE_ID="$(printf '%s' "$CMD_ID" | tr ' /:' '___')"
LOG_FILE="$PACK_DIR/logs/${SAFE_ID}_run1.log"

{
  echo "RUN|ts=$TS|id=$CMD_ID|run=1|cmd=$CMD_STR|log=$LOG_FILE"
} >> "$AGG_PATH"

set +e
bash -c "$CMD_STR" > "$LOG_FILE" 2>&1
EC=$?
set -e

{
  echo "RESULT|ts=$TS|id=$CMD_ID|run=1|exit=$EC|cmd=$CMD_STR|log=$LOG_FILE"
} >> "$AGG_PATH"

if [ "$EC" -ne 0 ]; then
  echo "FAIL: $CMD_ID run 1 (exit=$EC)" >&2
  exit "$EC"
fi

echo "PASS: $CMD_ID x1"
