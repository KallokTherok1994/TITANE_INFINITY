#!/usr/bin/env bash
set -euo pipefail

echo "🔎 Staged Patch v2 Workflow"

staged_files="$(git diff --cached --name-only)"
if [[ -z "$staged_files" ]]; then
  echo "FAIL: no staged files for staged-patch v2 workflow"
  exit 2
fi

violations=0
while IFS= read -r file; do
  [[ -z "$file" ]] && continue

  if [[ "$file" =~ ^(docs/|src/|src-tauri/|scripts/|registry/) ]]; then
    continue
  fi

  echo "FAIL: staged file out of governed scope: $file"
  violations=$((violations + 1))
done <<< "$staged_files"

if [[ $violations -gt 0 ]]; then
  exit 2
fi

echo "PASS: staged patch v2 workflow checks passed"
