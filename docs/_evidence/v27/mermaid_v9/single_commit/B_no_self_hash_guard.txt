#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"

FAIL=0

if rg -n "FINAL_SHA" docs/_evidence/v27/mermaid_v9 -S --glob '*.md' --glob '*.json' >/dev/null 2>&1; then
  echo "FAIL: FINAL_SHA detected in V9 evidence (no-self-hash)"
  rg -n "FINAL_SHA" docs/_evidence/v27/mermaid_v9 -S --glob '*.md' --glob '*.json' || true
  FAIL=1
fi

if [[ -z "$(git status --porcelain=v1)" ]]; then
  last_commit_msg=$(git log -1 --pretty=%B)
  if printf "%s" "$last_commit_msg" | rg -qi "final sha record|evidence finalize"; then
    echo "FAIL: commit message contains forbidden self-hash pattern"
    FAIL=1
  fi
fi

if [[ "$FAIL" -ne 0 ]]; then
  exit 1
fi

echo "PASS: MERMAID_NO_SELF_HASH_GUARD"
