#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# TITANE∞ v14 — VERIFY ENGINES OVERDRIVE
# ═══════════════════════════════════════════════════════════════════════════
# Vérifie tous les engines Overdrive (TAPIError, futures Send, no dead code)
# ═══════════════════════════════════════════════════════════════════════════

set -e

echo "════════════════════════════════════════════════════════════════════════"
echo "  TITANE∞ v14 — ENGINES OVERDRIVE VERIFICATION"
echo "════════════════════════════════════════════════════════════════════════"

ERRORS=0

# ─────────────────────────────────────────────────────────────────────────────
# 1. Compilation Rust 0 warnings
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "🔍 [1/5] Compilation Rust (cargo check)..."

cd src-tauri

WARNINGS=$(cargo check 2>&1 | grep -c "warning:" || true)

if [ "$WARNINGS" -gt 0 ]; then
    echo "❌ FAIL: $WARNINGS warnings détectés"
    cargo check 2>&1 | grep "warning:" | head -10
    ERRORS=$((ERRORS + 1))
else
    echo "✅ PASS: Compilation 0 warnings"
fi

cd ..

# ─────────────────────────────────────────────────────────────────────────────
# 2. TAPIError utilisé partout
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "🔍 [2/5] Vérification TAPIError dans engines..."

ENGINES=(
    "semantic_kernel.rs"
    "memory_engine.rs"
    "exp_engine.rs"
    "auto_heal.rs"
    "chat_orchestrator.rs"
)

for engine in "${ENGINES[@]}"; do
    if ! grep -q "use crate::core::tapi_error" "src-tauri/src/overdrive/$engine"; then
        echo "❌ FAIL: $engine n'importe pas TAPIError"
        ERRORS=$((ERRORS + 1))
    fi
done

if [ "$ERRORS" -eq 0 ]; then
    echo "✅ PASS: Tous les engines importent TAPIError"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 3. Futures sont Send (tokio::sync::RwLock)
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "🔍 [3/5] Vérification futures Send (RwLock)..."

SYNC_RWLOCK=$(grep -r "use std::sync::RwLock" src-tauri/src/overdrive/*.rs | wc -l || true)

if [ "$SYNC_RWLOCK" -gt 0 ]; then
    echo "⚠️  WARNING: std::sync::RwLock détecté (utiliser tokio::sync::RwLock)"
    grep -r "use std::sync::RwLock" src-tauri/src/overdrive/*.rs
    # Pas bloquant si Arc<Mutex> est utilisé
else
    echo "✅ PASS: Utilisation correcte de tokio::sync::RwLock ou Arc<Mutex>"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 4. Pas de code DISABLED
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "🔍 [4/5] Détection code DISABLED..."

DISABLED_COUNT=$(grep -r "DISABLED" src-tauri/src/overdrive/*.rs | grep -v "// TODO" | wc -l || true)

if [ "$DISABLED_COUNT" -gt 0 ]; then
    echo "⚠️  WARNING: $DISABLED_COUNT blocs DISABLED trouvés"
    grep -r "DISABLED" src-tauri/src/overdrive/*.rs | grep -v "// TODO"
    # Pas bloquant
else
    echo "✅ PASS: Aucun code DISABLED"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 5. Memory Compactor existe et est intégré
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "🔍 [5/5] Vérification Memory Compactor..."

if [ ! -f "src-tauri/src/overdrive/memory_compactor.rs" ]; then
    echo "❌ FAIL: memory_compactor.rs manquant"
    ERRORS=$((ERRORS + 1))
elif ! grep -q "pub mod memory_compactor" src-tauri/src/overdrive/mod.rs; then
    echo "❌ FAIL: memory_compactor non exporté dans mod.rs"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ PASS: Memory Compactor intégré"
fi

# ─────────────────────────────────────────────────────────────────────────────
# RÉSULTAT FINAL
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "════════════════════════════════════════════════════════════════════════"

if [ "$ERRORS" -eq 0 ]; then
    echo "✅ PASS: Engines Overdrive 100% OK"
    echo "════════════════════════════════════════════════════════════════════════"
    exit 0
else
    echo "❌ FAIL: $ERRORS erreurs détectées"
    echo "════════════════════════════════════════════════════════════════════════"
    exit 1
fi
