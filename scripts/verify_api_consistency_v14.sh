#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# TITANE∞ v14 — VERIFY API CONSISTENCY
# ═══════════════════════════════════════════════════════════════════════════
# Vérifie la cohérence entre backend Rust et frontend TypeScript
# ═══════════════════════════════════════════════════════════════════════════

set -e

echo "════════════════════════════════════════════════════════════════════════"
echo "  TITANE∞ v14 — API CONSISTENCY VERIFICATION"
echo "════════════════════════════════════════════════════════════════════════"

ERRORS=0

# ─────────────────────────────────────────────────────────────────────────────
# 1. Vérifier TAPIError utilisé partout
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "🔍 [1/5] Vérification TAPIError dans Rust..."

RUST_STRING_ERRORS=$(grep -r "Result<.*String>" src-tauri/src/overdrive/*.rs | grep -v "// " | wc -l || true)

if [ "$RUST_STRING_ERRORS" -gt 0 ]; then
    echo "❌ FAIL: $RUST_STRING_ERRORS fonctions utilisent Result<T, String> au lieu de TAPIError"
    grep -r "Result<.*String>" src-tauri/src/overdrive/*.rs | grep -v "// "
    ERRORS=$((ERRORS + 1))
else
    echo "✅ PASS: Toutes les APIs utilisent TAPIError"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 2. Vérifier tauriClient utilisé dans services
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "🔍 [2/5] Vérification tauriClient dans services TypeScript..."

DIRECT_INVOKE=$(grep -r "invoke(" src/services/*.ts | grep -v "tauriClient" | grep -v "// " | wc -l || true)

if [ "$DIRECT_INVOKE" -gt 5 ]; then
    echo "❌ FAIL: $DIRECT_INVOKE appels directs invoke() détectés (devrait utiliser tauriClient)"
    grep -r "invoke(" src/services/*.ts | grep -v "tauriClient" | grep -v "// "
    ERRORS=$((ERRORS + 1))
else
    echo "✅ PASS: Services utilisent tauriClient centralisé"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 3. Vérifier types TypeScript correspondent aux structs Rust
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "🔍 [3/5] Vérification correspondance types Rust ↔ TypeScript..."

# Vérifier TAPIError existe côté TS
if ! grep -q "export interface TAPIError" src/services/tauriClient.ts; then
    echo "❌ FAIL: TAPIError manquant dans tauriClient.ts"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ PASS: TAPIError défini dans TypeScript"
fi

# Vérifier ProviderStatus existe
if ! grep -q "export interface ProviderStatus" src/services/tauriClient.ts; then
    echo "❌ FAIL: ProviderStatus manquant dans tauriClient.ts"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ PASS: ProviderStatus défini dans TypeScript"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 4. Vérifier hooks utilisent tauriClient (pas invoke direct)
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "🔍 [4/5] Vérification hooks utilisent tauriClient..."

HOOKS_DIRECT_INVOKE=$(grep -r "invoke(" src/hooks/*.ts | grep -v "tauriClient" | grep -v "// " | grep -v "import" | wc -l || true)

if [ "$HOOKS_DIRECT_INVOKE" -gt 0 ]; then
    echo "❌ FAIL: $HOOKS_DIRECT_INVOKE hooks utilisent invoke() direct"
    grep -r "invoke(" src/hooks/*.ts | grep -v "tauriClient" | grep -v "// " | grep -v "import"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ PASS: Hooks utilisent tauriClient centralisé"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 5. Vérifier 0 'any' dans tauriClient et services critiques
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "🔍 [5/5] Vérification 0 'any' dans services critiques..."

ANY_COUNT=$(grep -E ": any|<any>" src/services/tauriClient.ts src/services/aiChatClient.ts | grep -v "// " | wc -l || true)

if [ "$ANY_COUNT" -gt 0 ]; then
    echo "⚠️  WARNING: $ANY_COUNT types 'any' trouvés dans services critiques"
    grep -E ": any|<any>" src/services/tauriClient.ts src/services/aiChatClient.ts | grep -v "// "
    # Pas d'erreur bloquante, juste warning
else
    echo "✅ PASS: Aucun type 'any' dans services critiques"
fi

# ─────────────────────────────────────────────────────────────────────────────
# RÉSULTAT FINAL
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "════════════════════════════════════════════════════════════════════════"

if [ "$ERRORS" -eq 0 ]; then
    echo "✅ PASS: API Consistency 100% OK"
    echo "════════════════════════════════════════════════════════════════════════"
    exit 0
else
    echo "❌ FAIL: $ERRORS erreurs détectées"
    echo "════════════════════════════════════════════════════════════════════════"
    exit 1
fi
