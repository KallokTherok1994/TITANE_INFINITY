#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"

FAIL=0
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAIL=1; }

required=(
  .github/prompts/audit-instructions.prompt.md
  .github/prompts/fix-instructions-drift.prompt.md
  .github/prompts/update-mapping.prompt.md
  .github/prompts/run-proof-pack.prompt.md
  .github/prompts/release-readiness.prompt.md
  .github/prompts/contradiction-resolution.prompt.md
  .github/prompts/simple-fast-session.prompt.md
  .github/prompts/heavy-runtime-session.prompt.md
)

for f in "${required[@]}"; do
  if [[ -f "$f" ]]; then
    pass "PROMPT_PRESENT $f"
  else
    fail "PROMPT_MISSING $f"
  fi
done

echo "SUMMARY: FAIL=$FAIL"
if [[ "$FAIL" -ne 0 ]]; then
  exit 1
fi
