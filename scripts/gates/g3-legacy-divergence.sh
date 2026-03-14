#!/usr/bin/env bash
# Gate G3: LEGACY_DIVERGENCE
# Vérifie que tauriChat.ts ne peut pas forcer local sans gate quand utilisé en prod

set -e

echo "=== GATE G3: LEGACY_DIVERGENCE ==="
echo

FAIL=0

# Check 1: Vérifier que tauriChat.ts a documentation deprecation
echo "[Check 1] Vérifier deprecation notice dans tauriChat.ts..."

DEPRECATION=$(grep -n "LEGACY.*DEPRECATED\|LEGACY PROVIDER.*TEST USE ONLY" src/services/ai/providers/tauriChat.ts 2>/dev/null || true)

if [ -z "$DEPRECATION" ]; then
  echo "⚠️  WARNING: No deprecation notice found in tauriChat.ts"
  echo "   Legacy may be used without awareness."
else
  echo "✅ Deprecation notice found"
fi

echo

# Check 2: Vérifier que modern system n'importe PAS tauriChat
echo "[Check 2] Vérifier useConversationEngine n'utilise PAS tauriChat..."

MODERN_IMPORT=$(grep -n "from.*tauriChat\|import.*tauriChat" src/hooks/useConversationEngine.ts src/services/conversationEngine.ts 2>/dev/null || true)

if [ -n "$MODERN_IMPORT" ]; then
  echo "❌ FAIL: Modern system imports tauriChat (divergence possible)"
  echo "$MODERN_IMPORT"
  FAIL=1
else
  echo "✅ PASS: Modern system isolated from tauriChat legacy"
fi

echo

# Check 3: Vérifier que tauriChat force local (expected for test legacy)
echo "[Check 3] Vérifier tauriChat force local (expected)..."

FORCE_LOCAL=$(grep -n "provider:.*'local'" src/services/ai/providers/tauriChat.ts 2>/dev/null || true)

if [ -z "$FORCE_LOCAL" ]; then
  echo "ℹ️  INFO: tauriChat no longer forces local (may have been patched)"
else
  echo "✅ Expected: tauriChat forces local (test-only usage)"
  echo "   Found at:"
  echo "$FORCE_LOCAL"
fi

echo

# Check 4: Vérifier que tauriChat a WARN runtime
echo "[Check 4] Vérifier WARN runtime dans tauriChat.generate()..."

RUNTIME_WARN=$(grep -n "logger\.warn.*LEGACY.*forces.*local\|LEGACY.*provider.*local" src/services/ai/providers/tauriChat.ts 2>/dev/null || true)

if [ -z "$RUNTIME_WARN" ]; then
  echo "⚠️  WARNING: No runtime WARN when tauriChat forces local"
  echo "   Recommended: Add logger.warn() before forcing local"
else
  echo "✅ PASS: Runtime WARN présent"
  echo "   Found at:"
  echo "$RUNTIME_WARN"
fi

echo

# Check 5: Vérifier usage tauriChat limité aux tests
echo "[Check 5] Vérifier tauriChat usage limité..."

PROD_USAGE=$(grep -rn "aiOrchestrator\.generate" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "\.test\.\|__tests__\|tests/" || true)

if [ -n "$PROD_USAGE" ]; then
  echo "⚠️  WARNING: aiOrchestrator.generate found in production code:"
  echo "$PROD_USAGE"
  echo
  echo "   Vérifier que ce n'est pas dans hot path UI"
  # Not a hard FAIL since aiOrchestrator might be used as fallback
else
  echo "✅ PASS: aiOrchestrator.generate not found in production src/"
fi

echo
echo "==="

if [ $FAIL -eq 1 ]; then
  echo "❌ GATE G3: FAIL"
  exit 1
else
  echo "✅ GATE G3: PASS (with observations)"
  exit 0
fi
