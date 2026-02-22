#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"

BASE_REF="origin/MAIN"
if ! git rev-parse --verify "$BASE_REF" >/dev/null 2>&1; then
  BASE_REF=""
fi

if [[ -n "$BASE_REF" ]]; then
  mapfile -t mmd_changed < <(git diff --name-only "$BASE_REF"...HEAD -- 'docs/diagrams/sources/*.mmd' | sort)
else
  mapfile -t mmd_changed < <(git diff --name-only -- 'docs/diagrams/sources/*.mmd' | sort)
fi

if [[ ${#mmd_changed[@]} -eq 0 ]]; then
  echo "PASS: MERMAID_CHANGE_REQUEST_GUARD (no Mermaid changes)"
  exit 0
fi

CHANGE_REQUEST="docs/diagrams/CHANGE_REQUEST.md"
if [[ ! -f "$CHANGE_REQUEST" ]]; then
  echo "FAIL: change request missing: $CHANGE_REQUEST"
  exit 1
fi

missing=0
for file in "${mmd_changed[@]}"; do
  base_name=$(basename "$file")
  if ! rg -q "${base_name}" "$CHANGE_REQUEST"; then
    echo "FAIL: change request does not list modified canon: $base_name"
    missing=1
  fi
 done

if ! rg -q "^\- Rollback:" "$CHANGE_REQUEST"; then
  echo "FAIL: change request missing Rollback field"
  missing=1
fi

if [[ "$missing" -ne 0 ]]; then
  exit 1
fi

echo "PASS: MERMAID_CHANGE_REQUEST_GUARD"
