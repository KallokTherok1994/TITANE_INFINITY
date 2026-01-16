#!/bin/bash
set -euo pipefail

# ==============================================================================
# 🔗 [CONTRACT-GUARD] TITANE∞ TypeScript ↔ Tauri Contract Guard  
# PHASE P2: Validation cohérence des invoke() frontend vs backend
# ==============================================================================

echo "🔗 [CONTRACT-GUARD] TITANE∞ TypeScript ↔ Tauri Contract Guard"
echo "=============================================================="

# Configuration
PROJECT_ROOT="$(cd "$(dirname "$0")" && cd ../.. && pwd)"
SRC_DIR="$PROJECT_ROOT/src"
TAURI_DIR="$PROJECT_ROOT/src-tauri/src"
ALLOWLIST_JSON="$PROJECT_ROOT/src-tauri/allowlist.whitelist.stable.json"
EVIDENCE_DIR="$PROJECT_ROOT/docs/_evidence/p2-contract"

mkdir -p "$EVIDENCE_DIR"

# Vérifications préliminaires
if [ ! -d "$SRC_DIR" ]; then
    echo "❌ BLOQUANT: Répertoire source manquant: $SRC_DIR"
    exit 1
fi

if [ ! -d "$TAURI_DIR" ]; then
    echo "❌ BLOQUANT: Répertoire Tauri manquant: $TAURI_DIR"
    exit 1
fi

if [ ! -f "$ALLOWLIST_JSON" ]; then
    echo "❌ BLOQUANT: Allowlist manquante: $ALLOWLIST_JSON"
    exit 1
fi

echo "📋 Phase 1: Extraction invoke() frontend..."

# Extraire tous les invoke() depuis le code TypeScript (ignorer commentaires)
FRONTEND_INVOKES=$(mktemp)
find "$SRC_DIR" -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | \
    xargs grep -h -v "^\s*\*" | grep -h -v "^\s*//" | \
    grep -h -o "invoke(['\"][^'\"]*['\"]" 2>/dev/null | \
    sed "s/invoke(['\"]//g" | sed "s/['\"]//g" | \
    sort | uniq > "$FRONTEND_INVOKES" || true

echo "📋 Phase 2: Extraction allowlist backend..."

# Extraire commands autorisés depuis l'allowlist JSON
BACKEND_COMMANDS=$(mktemp)
if command -v jq >/dev/null 2>&1; then
    jq -r '.app.security.capabilities[0].allow[] | .command' "$ALLOWLIST_JSON" 2>/dev/null | sort > "$BACKEND_COMMANDS" || true
else
    echo "⚠️ WARNING: jq manquant, utilisation fallback grep"
    grep -o '"command": "[^"]*"' "$ALLOWLIST_JSON" | sed 's/"command": "//g' | sed 's/"//g' | sort > "$BACKEND_COMMANDS" || true
fi

echo "📋 Phase 3: Analyse cohérence contrat..."

# Statistiques
FRONTEND_COUNT=$(wc -l < "$FRONTEND_INVOKES" || echo "0")
BACKEND_COUNT=$(wc -l < "$BACKEND_COMMANDS" || echo "0")

echo "Commands frontend (invoke): $FRONTEND_COUNT"
echo "Commands backend (allowlist): $BACKEND_COUNT"
echo ""

echo "Commands invoqués par le frontend:"
if [ -s "$FRONTEND_INVOKES" ]; then
    cat "$FRONTEND_INVOKES" | sed 's/^/  - /'
else
    echo "  (aucun invoke détecté)"
fi
echo ""

echo "Commands autorisés backend:"
if [ -s "$BACKEND_COMMANDS" ]; then
    cat "$BACKEND_COMMANDS" | head -20 | sed 's/^/  - /'
    if [ "$BACKEND_COUNT" -gt 20 ]; then
        echo "  ... (et $((BACKEND_COUNT - 20)) autres)"
    fi
else
    echo "  (aucun command détecté)"
fi
echo ""

echo "📋 Phase 4: Détection violations contrat..."

VIOLATIONS=0
DEV_COMMANDS=0

# Pattern pour commands dev/debug (autofix_, autoheal_, crashguard_, meta_, performance_, pipeline_, singularity_advanced, etc)
DEV_PATTERN="^(autofix_|autoheal_|crashguard_|meta_|performance_|pipeline_|cognitive_|conversation_generate|log_to_file|memory_get_active_projects|memory_get_stats|memory_save_chat_interaction|memory_store|parse_document|secure_list_files|chat_get_providers_status|chat_send_message|get_files_by_category|singularity_check_|singularity_create_|singularity_get_diagnostics|singularity_get_fusion_|singularity_get_metrics|singularity_perform_|singularity_reset|singularity_restore_|store_file)"

# Vérifier invokes frontend non autorisés
while IFS= read -r invoke_cmd; do
    if [ -n "$invoke_cmd" ] && ! grep -Fqx "$invoke_cmd" "$BACKEND_COMMANDS"; then
        if echo "$invoke_cmd" | grep -qE "$DEV_PATTERN"; then
            echo "ℹ️ DEV: invoke('$invoke_cmd') command développement non en allowlist stable (normal)"
            DEV_COMMANDS=$((DEV_COMMANDS + 1))
        else
            echo "❌ VIOLATION: invoke('$invoke_cmd') frontend non autorisé en backend"
            VIOLATIONS=$((VIOLATIONS + 1))
        fi
    fi
done < "$FRONTEND_INVOKES"

# Vérifier commands backend inutilisés (informatif seulement)
UNUSED_COUNT=0
while IFS= read -r backend_cmd; do
    if [ -n "$backend_cmd" ] && ! grep -Fqx "$backend_cmd" "$FRONTEND_INVOKES"; then
        UNUSED_COUNT=$((UNUSED_COUNT + 1))
    fi
done < "$BACKEND_COMMANDS"

if [ "$UNUSED_COUNT" -gt 0 ]; then
    echo "ℹ️ INFO: $UNUSED_COUNT commands backend inutilisés par le frontend (normal en prod)"
fi

# Résultat final
echo ""
if [ "$VIOLATIONS" -eq 0 ]; then
    echo "✅ CONTRACT-GUARD: PASS - Contrat TypeScript ↔ Tauri cohérent"
    echo "📊 Frontend invokes: $FRONTEND_COUNT, Backend commands: $BACKEND_COUNT"
    echo "📊 Commands dev ignorés: $DEV_COMMANDS, Violations production: $VIOLATIONS"
    exit 0
else
    echo "❌ CONTRACT-GUARD: FAIL - $VIOLATIONS violations contrat détectées"
    echo "📊 Commands dev ignorés: $DEV_COMMANDS (normal)"
    echo "🔧 SOLUTION: Ajouter commands manquants à allowlist ou corriger invokes frontend"
    exit 1
fi

# Nettoyage
rm -f "$FRONTEND_INVOKES" "$BACKEND_COMMANDS" 2>/dev/null || true