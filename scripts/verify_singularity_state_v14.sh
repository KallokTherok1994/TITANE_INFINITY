#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# TITANE∞ v14 — VERIFY SINGULARITY STATE
# ═══════════════════════════════════════════════════════════════════════════
# Vérifie le hook useEngineState et intégration SingularityEngine
# ═══════════════════════════════════════════════════════════════════════════

set -e

echo "════════════════════════════════════════════════════════════════════════"
echo "  TITANE∞ v14 — SINGULARITY STATE VERIFICATION"
echo "════════════════════════════════════════════════════════════════════════"

ERRORS=0

# ─────────────────────────────────────────────────────────────────────────────
# 1. Hook useEngineState existe
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "🔍 [1/4] Vérification hook useEngineState..."

if [ ! -f "src/hooks/useEngineState.ts" ]; then
    echo "❌ FAIL: useEngineState.ts manquant"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ PASS: useEngineState.ts existe"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 2. Types SingularityState complets
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "🔍 [2/4] Vérification types SingularityState..."

REQUIRED_TYPES=(
    "SingularityState"
    "PhysicalState"
    "CognitiveState"
    "SymbolicState"
    "AdaptiveState"
    "MetaState"
)

for type in "${REQUIRED_TYPES[@]}"; do
    if ! grep -q "interface $type" src/hooks/useEngineState.ts; then
        echo "❌ FAIL: Type $type manquant"
        ERRORS=$((ERRORS + 1))
    fi
done

if [ "$ERRORS" -eq 0 ]; then
    echo "✅ PASS: Tous les types SingularityState définis"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 3. Hook utilise tauriClient.getSingularityState()
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "🔍 [3/4] Vérification intégration tauriClient..."

if ! grep -q "getSingularityState" src/hooks/useEngineState.ts; then
    echo "❌ FAIL: useEngineState n'utilise pas getSingularityState"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ PASS: useEngineState utilise tauriClient"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 4. Hook exporté
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "🔍 [4/4] Vérification export useEngineState..."

if ! grep -q "export { useEngineState }" src/hooks/index.ts; then
    echo "❌ FAIL: useEngineState non exporté"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ PASS: useEngineState correctement exporté"
fi

# ─────────────────────────────────────────────────────────────────────────────
# RÉSULTAT FINAL
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "════════════════════════════════════════════════════════════════════════"

if [ "$ERRORS" -eq 0 ]; then
    echo "✅ PASS: Singularity State System 100% OK"
    echo "════════════════════════════════════════════════════════════════════════"
    exit 0
else
    echo "❌ FAIL: $ERRORS erreurs détectées"
    echo "════════════════════════════════════════════════════════════════════════"
    exit 1
fi
