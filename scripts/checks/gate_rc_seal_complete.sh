#!/usr/bin/env bash
set -euo pipefail
: "${PROOF_PACK:?missing PROOF_PACK}"

[[ -f "$PROOF_PACK/23_RC_SEAL.md" ]] || { echo "MISSING:23_RC_SEAL.md"; exit 1; }
[[ -f "$PROOF_PACK/sha256_manifest.txt" ]] || { echo "MISSING:sha256_manifest.txt"; exit 1; }

if ! grep -q 'RC_SEAL: COMPLETE' "$PROOF_PACK/23_RC_SEAL.md"; then
  echo "FAIL: RC seal not complete"
  exit 1
fi

echo "PASS: RC seal complete"
