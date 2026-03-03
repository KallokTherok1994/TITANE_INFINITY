#!/usr/bin/env bash
set -euo pipefail
: "${PROOF_PACK:?missing PROOF_PACK}"

manifest="$PROOF_PACK/05_TRUTH_MANIFEST.md"
[[ -f "$manifest" ]] || { echo "MISSING:$manifest"; exit 1; }

paths=$(awk '/^PATH: /{print $2}' "$manifest" || true)
if [[ -z "$paths" ]]; then
  echo "PASS: drift zero (no tracked manifest paths)"
  exit 0
fi

for p in $paths; do
  if [[ -n "$(git diff --name-only -- "$p")" ]]; then
    echo "DRIFT:$p"
    exit 1
  fi
done

echo "PASS: drift zero"
