#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"
source "$(dirname "${BASH_SOURCE[0]}")/_rg_compat.sh"

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
  BASE_REF="origin/MAIN"
fi

if ! git rev-parse --verify "$BASE_REF" >/dev/null 2>&1; then
  if [[ "$CI_MODE" -eq 1 ]]; then
    echo "FAIL: base ref not found in CI: $BASE_REF"
    exit 1
  fi
  echo "WARN: base ref not found, falling back to local diff"
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
