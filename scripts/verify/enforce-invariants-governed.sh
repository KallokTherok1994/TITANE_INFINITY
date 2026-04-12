#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"
source "$(dirname "${BASH_SOURCE[0]}")/_rg_compat.sh"

echo "🔒 Invariants Governed Check"
echo "============================"

front_hits=$(
  rg -n "fetch\(|axios\(|XMLHttpRequest|new\s+WebSocket\(" -S src \
    --glob '!**/__tests__/**' \
    --glob '!**/__snapshots__/**' \
    --glob '!**/*.stories.*' \
    --glob '!**/*.mdx' \
    --glob '!**/stories/**' || true
)

back_hits=$(
  rg -n "reqwest::|ureq::|hyper::" -S \
    src-tauri/src/conversation_engine \
    src-tauri/src/services \
    src-tauri/src/engines 2>/dev/null || true
)

secr_hits=$(
  rg -n "(API_KEY|SECRET|TOKEN|BRAVE)\s*[:=]\s*['\"]?[A-Za-z0-9_\-]{16,}" -S src src-tauri/src \
    --glob '!**/__tests__/**' \
    --glob '!**/__snapshots__/**' || true
)

front_count=$(printf "%s\n" "$front_hits" | sed '/^$/d' | wc -l | tr -d ' ')
back_count=$(printf "%s\n" "$back_hits" | sed '/^$/d' | wc -l | tr -d ' ')
secr_count=$(printf "%s\n" "$secr_hits" | sed '/^$/d' | wc -l | tr -d ' ')

echo "FRONT_EXEC_WEB_CALLS=$front_count"
echo "BACKEND_HTTP_CLIENT_CALLS_GOV_SCOPE=$back_count"
echo "HARDCODED_SECRET_ASSIGNMENTS=$secr_count"

if [[ "$front_count" -ne 0 || "$back_count" -ne 0 || "$secr_count" -ne 0 ]]; then
  echo "❌ FAIL: governed invariant violations detected"
  echo "-- frontend offenders --"
  printf "%s\n" "$front_hits" | sed '/^$/d' | head -n 40 || true
  echo "-- backend offenders --"
  printf "%s\n" "$back_hits" | sed '/^$/d' | head -n 40 || true
  echo "-- secret offenders --"
  printf "%s\n" "$secr_hits" | sed '/^$/d' | head -n 40 || true
  exit 1
fi

echo "✅ PASS: governed invariants clean"
