#!/usr/bin/env bash
# verify_prompt_frontmatter.sh — ensures every .prompt.md in .github/prompts/
# has a valid YAML frontmatter block containing both `description:` and `mode:`.
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"

FAIL=0
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAIL=1; }

PROMPTS_DIR=".github/prompts"

shopt -s nullglob
prompt_files=("$PROMPTS_DIR"/*.prompt.md)

if [[ ${#prompt_files[@]} -eq 0 ]]; then
  fail "NO_PROMPT_FILES_FOUND in $PROMPTS_DIR"
  echo "SUMMARY: FAIL=$FAIL"
  exit 1
fi

for f in "${prompt_files[@]}"; do
  name="${f##*/}"

  # Must start with ---
  first_line=$(head -n 1 "$f")
  if [[ "$first_line" != "---" ]]; then
    fail "PROMPT_FRONTMATTER_MISSING_OPEN $name"
    continue
  fi

  # Extract frontmatter block (between first and second ---)
  frontmatter=$(awk 'NR>1 { if (/^---$/) exit; print }' "$f")

  has_description=0
  has_mode=0
  while IFS= read -r line; do
    [[ "$line" =~ ^description:[[:space:]]*.+ ]] && has_description=1
    [[ "$line" =~ ^mode:[[:space:]]*.+ ]] && has_mode=1
  done <<< "$frontmatter"

  if [[ $has_description -eq 1 && $has_mode -eq 1 ]]; then
    pass "PROMPT_FRONTMATTER_OK $name"
  else
    [[ $has_description -eq 0 ]] && fail "PROMPT_FRONTMATTER_MISSING_DESCRIPTION $name"
    [[ $has_mode -eq 0 ]]        && fail "PROMPT_FRONTMATTER_MISSING_MODE $name"
  fi
done

echo "SUMMARY: FAIL=$FAIL"
if [[ "$FAIL" -ne 0 ]]; then
  exit 1
fi
