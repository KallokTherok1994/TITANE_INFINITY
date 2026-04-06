#!/usr/bin/env bash
# Gate: RING_INTEGRITY
# Enforce 4-Ring architecture: no inverse imports (Ring4 UI directly accessing Ring1 types/services)
# Ring1 = src-tauri/ (Rust backend — no frontend imports possible by nature)
# Ring2 = src/lib/, src/core/ (core services, IPC boundary)
# Ring3 = src/services/, src/hooks/ (business logic)
# Ring4 = src/components/, src/pages/, src/modules/ (UI layer)
#
# Rule: Ring4 must NOT import directly from Ring2 internals (bypass Ring3)
# Rule: Ring4 must NOT import from src-tauri/ paths
# One Door: all backend communication via tauriClient.ts only

set -e

GATE_ID="ring-integrity-gate"
GATE_NAME="Ring Architecture Integrity"
FAIL=0

echo "=== GATE: ${GATE_NAME} ==="
echo

# Check 1: Ring4 must not call invoke() directly (must go through tauriClient One Door)
echo "[Check 1] Ring4 must not call invoke() directly (bypass One Door tauriClient)..."
DIRECT_INVOKE=$(grep -rn "invoke(" \
  src/components/ src/pages/ src/modules/ \
  --include="*.ts" --include="*.tsx" \
  2>/dev/null | grep -v "__tests__\|\.test\.\|\.spec\.\|stories\|//.*invoke\|tauriClient\|secureInvoke\|# invoke" || true)

if [ -n "$DIRECT_INVOKE" ]; then
  echo "❌ FAIL: Ring4 calls invoke() directly (One Door violation):"
  echo "$DIRECT_INVOKE"
  FAIL=1
else
  echo "✅ Ring4 does not call invoke() directly"
fi
echo

# Check 2: Ring4 must not import from src/core/ security modules (bypass Ring3)
echo "[Check 2] Ring4 must not import core security modules directly..."
DIRECT_SECURITY=$(grep -rn "from.*core/security\|from.*lib/security" \
  src/components/ src/pages/ src/modules/ \
  --include="*.ts" --include="*.tsx" \
  2>/dev/null | grep -v "__tests__\|\.test\.\|\.spec\.\|stories" || true)

if [ -n "$DIRECT_SECURITY" ]; then
  echo "⚠️  WARNING: Ring4 directly imports security modules (Ring2 bypass):"
  echo "$DIRECT_SECURITY"
  # Warning only — not enforced as FAIL until fully triaged
else
  echo "✅ Ring4 does not directly import security modules"
fi
echo

# Check 3: No window.__TAURI__ direct calls in Ring4 (must go through tauriClient)
# Excludes comments (lines starting with //) and devSudo (which contains DevTools help strings)
# devSudo uses window.__TAURI__ only in documentation string literals, not in executable code
echo "[Check 3] Ring4 must not call window.__TAURI__ directly..."
DIRECT_TAURI_WIN=$(grep -rn "window\.__TAURI__\|window\.__TAURI_INTERNALS__" \
  src/components/ src/pages/ src/modules/ \
  --include="*.ts" --include="*.tsx" \
  2>/dev/null | grep -v "__tests__\|\.test\.\|\.spec\.\|stories" \
  | grep -v "^\s*//" \
  | grep -v "// " \
  | grep -v "modules/devSudo" || true)

if [ -n "$DIRECT_TAURI_WIN" ]; then
  echo "❌ FAIL: Ring4 calls window.__TAURI__ directly (One Door violation):"
  echo "$DIRECT_TAURI_WIN"
  FAIL=1
else
  echo "✅ Ring4 does not call window.__TAURI__ directly"
fi

# Sub-check: warn on devSudo window.__TAURI__ refs (expected: doc strings only)
DEVSUDO_TAURI_WIN=$(grep -rn "window\.__TAURI__" \
  src/modules/devSudo/ \
  --include="*.ts" --include="*.tsx" \
  2>/dev/null | grep -v "^\s*//" | grep -v "// " || true)
if [ -n "$DEVSUDO_TAURI_WIN" ]; then
  echo "⚠️  WARNING (devSudo doc strings): window.__TAURI__ appears in devSudo — verify these are string literals only:"
  echo "$DEVSUDO_TAURI_WIN"
fi
echo

echo "=== GATE ${GATE_ID}: $([ $FAIL -eq 0 ] && echo PASS || echo FAIL) ==="
exit $FAIL
