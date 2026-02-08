#!/usr/bin/env bash
# TITANE∞ — E2E Tauri Build Authorization Gate (GATE_2)
#
# Purpose: Enforce "NO BUILD WITHOUT EXPLICIT AUTHORIZATION" rule
# Scope: E2E desktop tests requiring Tauri build
# Protocol: Ω.E2E.DESKTOP.CSP.UNBLOCK+GATED_BUILD+PROOF v1.0

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
AUTH_FILE="$REPO_ROOT/runtime/ALLOW_E2E_TAURI_BUILD.ok"
EXPECTED_CONTENT="I_AUTHORIZE_E2E_TAURI_BUILD"

echo "🔒 [E2E Build Gate] Checking authorization..."

# Check file existence
if [[ ! -f "$AUTH_FILE" ]]; then
    cat >&2 <<EOF

❌ E2E TAURI BUILD BLOCKED — NO AUTHORIZATION

═══════════════════════════════════════════════════════════════
 CRITICAL RULE VIOLATION DETECTED
═══════════════════════════════════════════════════════════════

The E2E desktop tests require a Tauri build, which compiles
the CSP configuration. This is BLOCKED by the critical rule:

  "NE JAMAIS déployer via AppImage ou DEB sans autorisation
   explicite de Kevin Thibault."

To authorize E2E build (LOCAL TEST ONLY, NO DEPLOYMENT):

  mkdir -p runtime
  printf "I_AUTHORIZE_E2E_TAURI_BUILD\n" > runtime/ALLOW_E2E_TAURI_BUILD.ok
  pnpm run e2e:desktop

This file is:
  ✅ Local only (gitignored)
  ✅ Explicit authorization signal
  ✅ Auditable (clear content check)
  ❌ NOT for production deployment

═══════════════════════════════════════════════════════════════

Missing file: $AUTH_FILE

EOF
    exit 1
fi

# Check file content
ACTUAL_CONTENT="$(cat "$AUTH_FILE" | tr -d '\n\r')"

if [[ "$ACTUAL_CONTENT" != "$EXPECTED_CONTENT" ]]; then
    cat >&2 <<EOF

❌ E2E TAURI BUILD BLOCKED — INVALID AUTHORIZATION

═══════════════════════════════════════════════════════════════

Authorization file exists but content is invalid.

Expected: $EXPECTED_CONTENT
Actual:   $ACTUAL_CONTENT

To fix:

  printf "I_AUTHORIZE_E2E_TAURI_BUILD\n" > runtime/ALLOW_E2E_TAURI_BUILD.ok

═══════════════════════════════════════════════════════════════

EOF
    exit 1
fi

echo "✅ [E2E Build Gate] Authorization verified: $AUTH_FILE"
echo "📋 [E2E Build Gate] Content: $EXPECTED_CONTENT"
echo "🔓 [E2E Build Gate] GATE_2 PASS — Build authorized for E2E"
exit 0
