#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"

BASE_REF=""
CI_MODE=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --base-ref)
      BASE_REF="${2:-}"
      shift 2
      ;;
    --ci)
      CI_MODE=1
      shift
      ;;
    *)
      echo "FAIL: unknown argument: $1"
      exit 2
      ;;
  esac
done

if [[ "${GITHUB_ACTIONS:-}" == "true" ]]; then
  CI_MODE=1
fi

if [[ -z "$BASE_REF" && -n "${GITHUB_BASE_REF:-}" ]]; then
  BASE_REF="origin/${GITHUB_BASE_REF}"
  if [[ "$CI_MODE" -eq 1 ]]; then
    git fetch origin "${GITHUB_BASE_REF}:refs/remotes/origin/${GITHUB_BASE_REF}" >/dev/null 2>&1 || true
  fi
fi

if [[ -z "$BASE_REF" ]]; then
  BASE_REF="${MERMAID_DIFF_BASE:-origin/MAIN}"
fi

if ! git rev-parse --verify "$BASE_REF" >/dev/null 2>&1; then
  if [[ "$CI_MODE" -eq 1 ]]; then
    echo "FAIL: base ref not found in CI: $BASE_REF"
    exit 1
  fi
  BASE_REF="HEAD~1"
fi

if ! git rev-parse --verify "$BASE_REF" >/dev/null 2>&1; then
  echo "WARN: no valid base ref for diff intelligence"
  echo "PASS: MERMAID_DIFF_INTEL"
  exit 0
fi

mapfile -t changed_files < <(git diff --name-only "$BASE_REF"...HEAD -- 'docs/diagrams/sources/*.mmd' | sort)
if [[ ${#changed_files[@]} -eq 0 ]]; then
  echo "PASS: MERMAID_DIFF_INTEL (no Mermaid changes)"
  exit 0
fi

EDGE_REGEX='(-->|==>|---|\.\.>|=>)'
CRITICAL_REGEX='/api/'

FAIL=0
WARN=0

count_edges() {
  local ref="$1"
  local file="$2"
  python3 - "$ref" "$file" <<'PY'
import re
import subprocess
import sys

ref = sys.argv[1]
path = sys.argv[2]
edge_re = re.compile(r"(-->|==>|---|\.\.>|=>)")

def read_text(ref_value, file_path):
  if ref_value == "WORKTREE":
    try:
      with open(file_path, "r", encoding="utf-8") as handle:
        return handle.read()
    except FileNotFoundError:
      return ""
  proc = subprocess.run(["git", "show", f"{ref_value}:{file_path}"], capture_output=True, text=True)
  if proc.returncode != 0:
    return ""
  return proc.stdout

text = read_text(ref, path)
count = 0
for line in text.splitlines():
  count += len(edge_re.findall(line))
print(count)
PY
}

for file in "${changed_files[@]}"; do
  echo "DIFF: $file"
  diff_output=$(git diff "$BASE_REF"...HEAD -- "$file")

  added_edges=$(printf "%s" "$diff_output" | awk -v re="$EDGE_REGEX" '/^\+[^+]/ && $0 ~ re {sub(/^\+/, ""); print}' | sort -u)
  removed_edges=$(printf "%s" "$diff_output" | awk -v re="$EDGE_REGEX" '/^-[^-]/ && $0 ~ re {sub(/^-/, ""); print}' | sort -u)

  if [[ -n "$added_edges" ]]; then
    echo "ADD EDGES:"
    printf '%s\n' "$added_edges"
  fi

  if [[ -n "$removed_edges" ]]; then
    echo "REMOVE EDGES:"
    printf '%s\n' "$removed_edges"
  fi

  removed_critical=$(printf "%s" "$diff_output" | awk '/^-[^-]/ {sub(/^-/, ""); print}' | rg -n "$CRITICAL_REGEX" || true)
  if [[ -n "$removed_critical" ]]; then
    echo "FAIL: critical node removed (/api/)"
    printf '%s\n' "$removed_critical"
    FAIL=1
  fi

  base_edges=$(count_edges "$BASE_REF" "$file")
  head_edges=$(count_edges "WORKTREE" "$file")
  delta=$((head_edges - base_edges))
  if [[ "$delta" -lt 0 ]]; then
    echo "DELTA COMPLEXITY: $delta (links removed)"
  else
    echo "DELTA COMPLEXITY: +$delta (links added)"
  fi

  if [[ "$delta" -gt 5 || "$delta" -lt -5 ]]; then
    WARN=1
  fi

done

if [[ "$FAIL" -ne 0 ]]; then
  echo "FAIL: MERMAID_DIFF_INTEL"
  exit 1
fi

if [[ "$WARN" -ne 0 ]]; then
  echo "WARN: MERMAID_DIFF_INTEL"
  exit 0
fi

echo "PASS: MERMAID_DIFF_INTEL"
