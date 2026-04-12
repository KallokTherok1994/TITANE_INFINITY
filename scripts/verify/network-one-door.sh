#!/usr/bin/env bash
set -euo pipefail

ROOT="src-tauri/src"
PATTERN="HttpClient::new\\(|use[[:space:]]+http_client|reqwest::Client|use[[:space:]]+reqwest|ureq::|hyper::"
source "$(dirname "${BASH_SOURCE[0]}")/_rg_compat.sh"

ALLOWLIST=(
  "src-tauri/src/services/network_gateway.rs"
  "src-tauri/src/core/http_types.rs"
)

echo "OneDoor guard: scanning for direct HTTP client usage..."

RAW_HITS="$(rg -n "$PATTERN" "$ROOT" -S || true)"
if [[ -z "$RAW_HITS" ]]; then
  echo "PASS: no direct HTTP client usage detected"
  exit 0
fi

FILTERED="$(printf '%s\n' "$RAW_HITS" | awk -F: '$3 !~ /^[[:space:]]*\/\// {print}')"
if [[ -z "$FILTERED" ]]; then
  echo "PASS: only comment examples detected"
  exit 0
fi

VIOLATIONS="$(
  printf '%s\n' "$FILTERED" |
    while IFS= read -r line; do
      file="${line%%:*}"
      allowed=0
      for ok in "${ALLOWLIST[@]}"; do
        if [[ "$file" == "$ok" ]]; then
          allowed=1
          break
        fi
      done
      if [[ $allowed -eq 0 ]]; then
        printf '%s\n' "$line"
      fi
    done
)"

if [[ -n "$VIOLATIONS" ]]; then
  echo "FAIL: HTTP client usage outside OneDoor allowlist"
  printf '%s\n' "$VIOLATIONS"
  exit 1
fi

echo "PASS: OneDoor guard satisfied"
