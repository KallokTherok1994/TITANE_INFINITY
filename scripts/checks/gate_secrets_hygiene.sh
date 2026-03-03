#!/usr/bin/env bash
set -euo pipefail
: "${PROOF_PACK:?missing PROOF_PACK}"

pattern='sk-[A-Za-z0-9_\-]{20,}|Authorization:[[:space:]]*Bearer[[:space:]]+[A-Za-z0-9._\-]{12,}|api[_-]?key[[:space:]]*[:=][[:space:]]*[A-Za-z0-9._\-]{12,}'
if rg -n -e "$pattern" "$PROOF_PACK" >/dev/null 2>&1; then
  echo "FAIL: secret-like token detected in proof pack"
  exit 1
fi

echo "PASS: no secret-like tokens detected"
