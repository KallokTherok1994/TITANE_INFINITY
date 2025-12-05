#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# TITANE∞ v14 — VERIFY TAURI INVOKE
# ═══════════════════════════════════════════════════════════════════════════
# Vérifie que tous les invoke() utilisent tauriClient centralisé
# ═══════════════════════════════════════════════════════════════════════════

set -e

echo "════════════════════════════════════════════════════════════════════════"
echo "  TITANE∞ v14 — TAURI INVOKE VERIFICATION"
echo "════════════════════════════════════════════════════════════════════════"

ERRORS=0

# ─────────────────────────────────────────────────────────────────────────────
# 1. Détecter invoke() directs dans Components
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "🔍 [1/4] Détection invoke() direct dans Components..."

COMPONENT_INVOKE=$(find src/components -name "*.tsx" -o -name "*.ts" | xargs grep -l "from '@tauri-apps/api'" | xargs grep "invoke(" | grep -v "// " | wc -l || true)

if [ "$COMPONENT_INVOKE" -gt 0 ]; then
    echo "❌ FAIL: Components utilisent invoke() direct (devrait utiliser hooks)"
    find src/components -name "*.tsx" -o -name "*.ts" | xargs grep -l "from '@tauri-apps/api'" | xargs grep "invoke(" | grep -v "// "
    ERRORS=$((ERRORS + 1))
else
    echo "✅ PASS: Components n'utilisent pas invoke() direct"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 2. Vérifier Services utilisent tauriClient
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "🔍 [2/4] Vérification Services utilisent tauriClient..."

SERVICE_FILES=$(find src/services -name "*.ts" ! -name "tauriClient.ts")

for file in $SERVICE_FILES; do
    if grep -q "invoke(" "$file"; then
        if ! grep -q "tauriClient" "$file"; then
            echo "❌ FAIL: $file utilise invoke() sans tauriClient"
            ERRORS=$((ERRORS + 1))
        fi
    fi
done

if [ "$ERRORS" -eq 0 ]; then
    echo "✅ PASS: Services utilisent tauriClient"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 3. Vérifier toutes les commandes Rust sont enregistrées
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "🔍 [3/4] Vérification commands Rust enregistrées..."

# Extraire commandes définies
RUST_COMMANDS=$(grep -h "#\[tauri::command\]" src-tauri/src/**/*.rs -A 1 | grep "^pub async fn\|^pub fn" | awk '{print $3}' | cut -d'(' -f1 | sort)

# Extraire commandes enregistrées dans main.rs
REGISTERED_COMMANDS=$(grep -A 200 "invoke_handler" src-tauri/src/main.rs | grep -E "^\s+[a-z_]+" | sed 's/[^a-z_]//g' | sort)

MISSING_COMMANDS=$(comm -23 <(echo "$RUST_COMMANDS") <(echo "$REGISTERED_COMMANDS") | wc -l)

if [ "$MISSING_COMMANDS" -gt 0 ]; then
    echo "⚠️  WARNING: Certaines commandes ne sont peut-être pas enregistrées"
    comm -23 <(echo "$RUST_COMMANDS") <(echo "$REGISTERED_COMMANDS")
    # Pas d'erreur bloquante
else
    echo "✅ PASS: Toutes les commandes semblent enregistrées"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 4. Vérifier tauriClient a toutes les méthodes critiques
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "🔍 [4/4] Vérification méthodes critiques tauriClient..."

CRITICAL_METHODS=(
    "chatSendMessage"
    "chatStreamMessage"
    "chatCheckProviders"
    "getSystemVitals"
    "getSingularityState"
)

for method in "${CRITICAL_METHODS[@]}"; do
    if ! grep -q "$method" src/services/tauriClient.ts; then
        echo "❌ FAIL: Méthode critique '$method' manquante dans tauriClient"
        ERRORS=$((ERRORS + 1))
    fi
done

if [ "$ERRORS" -eq 0 ]; then
    echo "✅ PASS: Toutes les méthodes critiques présentes"
fi

# ─────────────────────────────────────────────────────────────────────────────
# RÉSULTAT FINAL
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "════════════════════════════════════════════════════════════════════════"

if [ "$ERRORS" -eq 0 ]; then
    echo "✅ PASS: Tauri Invoke 100% OK"
    echo "════════════════════════════════════════════════════════════════════════"
    exit 0
else
    echo "❌ FAIL: $ERRORS erreurs détectées"
    echo "════════════════════════════════════════════════════════════════════════"
    exit 1
fi
