#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# TITANE∞ v14 — VERIFY PROVIDER STATUS
# ═══════════════════════════════════════════════════════════════════════════
# Vérifie le système de monitoring providers IA temps réel
# ═══════════════════════════════════════════════════════════════════════════

set -e

echo "════════════════════════════════════════════════════════════════════════"
echo "  TITANE∞ v14 — PROVIDER STATUS VERIFICATION"
echo "════════════════════════════════════════════════════════════════════════"

ERRORS=0

# ─────────────────────────────────────────────────────────────────────────────
# 1. Backend Rust - chat_check_providers existe
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "🔍 [1/4] Vérification command Rust chat_check_providers..."

if ! grep -q "pub async fn chat_check_providers" src-tauri/src/overdrive/chat_orchestrator.rs; then
    echo "❌ FAIL: chat_check_providers manquant dans chat_orchestrator.rs"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ PASS: Command chat_check_providers existe"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 2. Frontend - ProviderStatus type existe
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "🔍 [2/4] Vérification type ProviderStatus TypeScript..."

if ! grep -q "export interface ProviderStatus" src/services/tauriClient.ts; then
    echo "❌ FAIL: Type ProviderStatus manquant dans tauriClient.ts"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ PASS: Type ProviderStatus défini"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 3. Hook useConnection utilise chatCheckProviders
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "🔍 [3/4] Vérification useConnection hook..."

if ! grep -q "chatCheckProviders" src/hooks/useConnection.ts; then
    echo "❌ FAIL: useConnection n'utilise pas chatCheckProviders"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ PASS: useConnection utilise chatCheckProviders"
fi

# Vérifier cascade gemini → ollama → local
if ! grep -q "gemini\|ollama\|local" src/hooks/useConnection.ts; then
    echo "⚠️  WARNING: Cascade providers peut-être manquante"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 4. Hook exporté dans index.ts
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "🔍 [4/4] Vérification export useConnection..."

if ! grep -q "export { useConnection }" src/hooks/index.ts; then
    echo "❌ FAIL: useConnection non exporté dans hooks/index.ts"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ PASS: useConnection correctement exporté"
fi

# ─────────────────────────────────────────────────────────────────────────────
# RÉSULTAT FINAL
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "════════════════════════════════════════════════════════════════════════"

if [ "$ERRORS" -eq 0 ]; then
    echo "✅ PASS: Provider Status System 100% OK"
    echo "════════════════════════════════════════════════════════════════════════"
    exit 0
else
    echo "❌ FAIL: $ERRORS erreurs détectées"
    echo "════════════════════════════════════════════════════════════════════════"
    exit 1
fi
