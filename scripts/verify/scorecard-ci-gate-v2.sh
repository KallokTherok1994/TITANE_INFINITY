#!/usr/bin/env bash
set -euo pipefail

SCORECARD_FILE="reports/chaos-lab/scorecard-v2.json"
MIN_SCORE="${MIN_SCORE:-90}"

if [[ ! -f "$SCORECARD_FILE" ]]; then
  echo "FAIL: scorecard missing: $SCORECARD_FILE"
  exit 1
fi

score="$(node -e 'const fs=require("fs");const p=process.argv[1];const j=JSON.parse(fs.readFileSync(p,"utf8"));process.stdout.write(String(j.score ?? 0));' "$SCORECARD_FILE")"
failed="$(node -e 'const fs=require("fs");const p=process.argv[1];const j=JSON.parse(fs.readFileSync(p,"utf8"));process.stdout.write(String(j.failed ?? 999));' "$SCORECARD_FILE")"

if [[ "$score" -lt "$MIN_SCORE" ]]; then
  echo "FAIL: scorecard score too low ($score < $MIN_SCORE)"
  exit 1
fi

if [[ "$failed" -gt 0 ]]; then
  echo "FAIL: scorecard has failures ($failed)"
  exit 1
fi

echo "PASS: scorecard CI gate satisfied (score=$score, failed=$failed)"
