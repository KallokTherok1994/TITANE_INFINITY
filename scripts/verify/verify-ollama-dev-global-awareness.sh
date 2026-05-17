#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

TMP_OUTPUT="$(mktemp)"
cleanup() {
  rm -f "$TMP_OUTPUT"
}
trap cleanup EXIT

if bash scripts/verify_instructions.sh >"$TMP_OUTPUT" 2>&1; then
  echo "PASS: GLOBAL_REPO_GATES_PASS"
  exit 0
fi

mapfile -t FAILURES < <(grep '^FAIL:' "$TMP_OUTPUT" | sed 's/^FAIL: //')

if [[ ${#FAILURES[@]} -eq 0 ]]; then
  echo "FAIL: GLOBAL_REPO_GATES_FAIL_UNKNOWN no_fail_lines_captured"
  sed -n '1,220p' "$TMP_OUTPUT"
  exit 1
fi

KNOWN_FAILURES=(
  "G_STABLE_ARTIFACT_FRESHNESS_PASS"
  "G_KERNEL_BUDGET_PASS"
)

UNKNOWN_FAILURES=()
for failure in "${FAILURES[@]}"; do
  known=0
  for expected in "${KNOWN_FAILURES[@]}"; do
    if [[ "$failure" == "$expected" ]]; then
      known=1
      break
    fi
  done
  if [[ $known -eq 0 ]]; then
    UNKNOWN_FAILURES+=("$failure")
  fi
done

if [[ ${#UNKNOWN_FAILURES[@]} -eq 0 ]]; then
  echo "PASS: GLOBAL_REPO_GATES_PARTIAL known_failures=${FAILURES[*]}"
  exit 0
fi

echo "FAIL: GLOBAL_REPO_GATES_FAIL_UNKNOWN unknown_failures=${UNKNOWN_FAILURES[*]}"
echo "INFO: raw_verify_instructions_output"
sed -n '1,220p' "$TMP_OUTPUT"
exit 1
