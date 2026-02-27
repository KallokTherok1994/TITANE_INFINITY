#!/usr/bin/env bash
set -euo pipefail

REPORT_DIR="reports/chaos-lab"
SCORECARD_FILE="$REPORT_DIR/scorecard-v2.json"
mkdir -p "$REPORT_DIR"

total=0
passed=0
failed=0
details_lines=""

run_case() {
  local name="$1"
  local cmd="$2"

  total=$((total + 1))
  if eval "$cmd" >/dev/null 2>&1; then
    passed=$((passed + 1))
    details_lines+="${name}|pass"$'\n'
  else
    failed=$((failed + 1))
    details_lines+="${name}|fail"$'\n'
  fi
}

run_case "SCN-CHAOS-ONLINE-FIRST-GATE" "pnpm run verify:online-first"
run_case "SCN-ATTACK-AUTOPR-POLICY" "node scripts/gates/autopr-v2-policy-gate.js"
run_case "SCN-ATTACK-PROOF-REQUIREMENTS" "bash scripts/verify/proof-requirements-v2.sh"

score=0
if [[ "$total" -gt 0 ]]; then
  score=$(( (passed * 100) / total ))
fi

DETAILS_LINES="$details_lines" node -e '
const fs = require("fs");
const path = process.argv[1];
const total = Number(process.argv[2]);
const passed = Number(process.argv[3]);
const failed = Number(process.argv[4]);
const score = Number(process.argv[5]);
const lines = (process.env.DETAILS_LINES || "").trim().split("\n").filter(Boolean);
const details = lines.map((line) => {
  const [name, status] = line.split("|");
  return { name, status };
});
const payload = {
  timestamp: new Date().toISOString(),
  total,
  passed,
  failed,
  score,
  details,
};
fs.writeFileSync(path, JSON.stringify(payload, null, 2));
' "$SCORECARD_FILE" "$total" "$passed" "$failed" "$score"

echo "Lab runner v2 complete: $SCORECARD_FILE (score=${score})"
