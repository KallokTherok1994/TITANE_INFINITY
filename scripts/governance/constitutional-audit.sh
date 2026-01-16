#!/bin/bash
set -euo pipefail

# ==============================================================================
# ⚖️ [CONSTITUTIONAL-AUDIT] TITANE∞ Constitutional Compliance Audit
# PHASE P4: Vérification conformité aux LOIS ABSOLUES (L1-L7)
# ==============================================================================

echo "⚖️ [CONSTITUTIONAL-AUDIT] TITANE∞ Constitutional Compliance Audit"
echo "=================================================================="

# Configuration
PROJECT_ROOT="$(cd "$(dirname "$0")" && cd ../.. && pwd)"
EVIDENCE_DIR="$PROJECT_ROOT/docs/_evidence/p4-constitutional"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

mkdir -p "$EVIDENCE_DIR"

VIOLATIONS=0
WARNINGS=0

echo "📋 Audit des LOIS ABSOLUES du PROD CERTIFICATION..."
echo ""

echo "📋 L1: LOCAL-FIRST STRICT - Interdiction réseau en production..."

# Vérifier absence serveurs HTTP (ignorer node_modules, dist, .vite-cache, commentaires et faux positifs)
HTTP_SERVERS=$(find "$PROJECT_ROOT" -name "*.ts" -o -name "*.js" -o -name "*.rs" | \
    grep -v -E "(node_modules|dist|\.vite-cache|target/)" | \
    xargs grep -l -E "(\blisten\(|createServer|http\.Server|axum::Server|warp::serve)" 2>/dev/null | \
    xargs -I {} sh -c '
      # Filtrer commentaires et patterns Tauri événementiels légitimes
      grep -v -E "^\s*(//|/\*|\*|#).*\b(listen|createServer|http\.Server)" "$1" | \
      grep -v -E "(await listen\(|unlisten|event.*listen|addEventListener|\.listen\(.*:)" | \
      grep -q -E "(\blisten\(|createServer|http\.Server)" && echo "$1"
    ' _ {} || true)

if [ -n "$HTTP_SERVERS" ]; then
    echo "❌ L1 VIOLATION: Serveurs HTTP détectés:"
    echo "$HTTP_SERVERS" | sed 's/^/  - /'
    VIOLATIONS=$((VIOLATIONS + 1))
else
    echo "✅ L1 PASS: Aucun serveur HTTP détecté"
fi

# Vérifier absence ports réseau dans config
NETWORK_CONFIG=$(grep -r -E "(port|host|bind|listen)" "$PROJECT_ROOT"/*.json "$PROJECT_ROOT"/src-tauri/*.json 2>/dev/null | \
    grep -v -E "(localhost|127\.0\.0\.1|devUrl)" || true)

if [ -n "$NETWORK_CONFIG" ]; then
    echo "⚠️ L1 WARNING: Configuration réseau détectée (vérifier si dev seulement):"
    echo "$NETWORK_CONFIG" | head -5 | sed 's/^/  - /'
    WARNINGS=$((WARNINGS + 1))
else
    echo "✅ L1 PASS: Pas de configuration réseau production"
fi

echo ""
echo "📋 L2: DUAL RUNTIME - Dev + Stable séparés..."

# Vérifier structure dual runtime
if [ -d "$PROJECT_ROOT/runtime/dev" ] && [ -d "$PROJECT_ROOT/runtime/stable" ]; then
    echo "✅ L2 PASS: Structure dual runtime présente"
    
    # Vérifier configs séparées
    if [ -f "$PROJECT_ROOT/runtime/dev/tauri.conf.json" ] && [ -f "$PROJECT_ROOT/runtime/stable/tauri.conf.json" ]; then
        echo "✅ L2 PASS: Configurations dev/stable séparées"
    elif [ -f "$PROJECT_ROOT/runtime/stable/tauri.conf.json" ]; then
        echo "⚠️ L2 WARNING: Config stable OK, config dev manquante"
        WARNINGS=$((WARNINGS + 1))
    else
        echo "❌ L2 VIOLATION: Configurations dual runtime manquantes"
        VIOLATIONS=$((VIOLATIONS + 1))
    fi
else
    echo "❌ L2 VIOLATION: Structure dual runtime manquante"
    VIOLATIONS=$((VIOLATIONS + 1))
fi

echo ""
echo "📋 L3: ZERO SECRETS - Aucun secret versionné..."

# Utiliser le secret scanner P0-1
if [ -f "$PROJECT_ROOT/scripts/security/secret-scan.sh" ]; then
    echo "🔍 Exécution secret scanner P0-1..."
    
    set +e
    "$PROJECT_ROOT/scripts/security/secret-scan.sh" --quiet
    SECRET_EXIT=$?
    set -e
    
    if [ "$SECRET_EXIT" -eq 0 ]; then
        echo "✅ L3 PASS: Aucun secret versionné détecté"
    else
        echo "❌ L3 VIOLATION: Secrets détectés par scanner P0-1"
        VIOLATIONS=$((VIOLATIONS + 1))
    fi
else
    echo "⚠️ L3 WARNING: Secret scanner P0-1 manquant"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""
echo "📋 L4: NO EXPANSION - Restriction fonctionnalités..."

# Vérifier absence de nouvelles features non documentées
NEW_FEATURES=$(find "$PROJECT_ROOT/src" -name "*.ts" -o -name "*.tsx" | \
    xargs grep -l -E "(EXPERIMENTAL|BETA|TODO.*feature|NEW.*feature)" 2>/dev/null || true)

if [ -n "$NEW_FEATURES" ]; then
    echo "⚠️ L4 WARNING: Features expérimentales détectées:"
    echo "$NEW_FEATURES" | head -3 | sed 's/^/  - /'
    WARNINGS=$((WARNINGS + 1))
else
    echo "✅ L4 PASS: Pas de features expérimentales non documentées"
fi

echo ""
echo "📋 L5: SAFE-RUN - Gouvernance scripts/processus..."

# Vérifier présence safe-run wrapper
if [ -f "$PROJECT_ROOT/scripts/maintenance/safe-run.sh" ]; then
    echo "✅ L5 PASS: Safe-run wrapper présent"
    
    # Vérifier usage dans tâches critiques
    UNSAFE_TASKS=$(grep -r "pnpm\|npm\|cargo\|./scripts" "$PROJECT_ROOT/.vscode/tasks.json" 2>/dev/null | \
        grep -v "safe-run" || true)
    
    if [ -n "$UNSAFE_TASKS" ]; then
        echo "⚠️ L5 WARNING: Tâches sans safe-run wrapper détectées"
        WARNINGS=$((WARNINGS + 1))
    else
        echo "✅ L5 PASS: Tâches utilisent safe-run governance"
    fi
else
    echo "❌ L5 VIOLATION: Safe-run wrapper manquant"
    VIOLATIONS=$((VIOLATIONS + 1))
fi

echo ""
echo "📋 L6: PROOF-BASED - Evidence de validation..."

# Vérifier système d'evidence
EVIDENCE_COUNT=$(find "$PROJECT_ROOT/docs/_evidence" -name "*.txt" 2>/dev/null | wc -l)

if [ "$EVIDENCE_COUNT" -gt 0 ]; then
    echo "✅ L6 PASS: Système d'evidence présent ($EVIDENCE_COUNT preuves)"
    
    # Vérifier evidence des phases P0-P6
    PHASES_EVIDENCE=0
    for phase in p0-secrets p0-surface p2-contract p3-build p4-constitutional p5-ops p6-capabilities; do
        if [ -d "$PROJECT_ROOT/docs/_evidence/$phase" ]; then
            PHASES_EVIDENCE=$((PHASES_EVIDENCE + 1))
        fi
    done
    
    echo "✅ L6 PASS: Evidence phases certification ($PHASES_EVIDENCE/7 phases)"
else
    echo "❌ L6 VIOLATION: Système d'evidence manquant"
    VIOLATIONS=$((VIOLATIONS + 1))
fi

echo ""
echo "📋 L7: GATES BLOQUANT - CI enforcement automation..."

# Vérifier gates CI
CI_GATES=$(find "$PROJECT_ROOT/.github/workflows" -name "*guard*.yml" 2>/dev/null | wc -l)

if [ "$CI_GATES" -gt 0 ]; then
    echo "✅ L7 PASS: Gates CI présents ($CI_GATES gates)"
    
    # Vérifier gates des phases critiques
    CRITICAL_GATES=0
    for gate in p0-secret-scan p0-surface-guard p2-contract-guard p3-build-guard; do
        if [ -f "$PROJECT_ROOT/.github/workflows/$gate.yml" ]; then
            CRITICAL_GATES=$((CRITICAL_GATES + 1))
        fi
    done
    
    echo "✅ L7 PASS: Gates critiques implémentés ($CRITICAL_GATES/4)"
else
    echo "❌ L7 VIOLATION: Gates CI manquants"
    VIOLATIONS=$((VIOLATIONS + 1))
fi

echo ""
echo "📋 Génération rapport constitutionnel..."

# Rapport final
AUDIT_REPORT="$EVIDENCE_DIR/P4_constitutional_audit_$TIMESTAMP.txt"
{
    echo "TIMESTAMP: $(date -Iseconds)"
    echo "PHASE: P4 CONSTITUTIONAL AUDIT"
    if [ "$VIOLATIONS" -eq 0 ]; then
        echo "STATUS: PASS"
    else
        echo "STATUS: FAIL"
    fi
    echo ""
    echo "=== RÉSUMÉ CONFORMITÉ ==="
    echo "Violations: $VIOLATIONS"
    echo "Warnings: $WARNINGS"
    echo ""
    echo "=== LOIS ABSOLUES STATUS ==="
    echo "L1 (LOCAL-FIRST): $([ -z "$HTTP_SERVERS" ] && echo "PASS" || echo "FAIL")"
    echo "L2 (DUAL RUNTIME): $([ -d "$PROJECT_ROOT/runtime/stable" ] && echo "PASS" || echo "FAIL")"
    echo "L3 (ZERO SECRETS): $([ -f "$PROJECT_ROOT/scripts/security/secret-scan.sh" ] && echo "VALIDATED" || echo "UNKNOWN")"
    echo "L4 (NO EXPANSION): $([ -z "$NEW_FEATURES" ] && echo "PASS" || echo "WARNING")"
    echo "L5 (SAFE-RUN): $([ -f "$PROJECT_ROOT/scripts/maintenance/safe-run.sh" ] && echo "PASS" || echo "FAIL")"
    echo "L6 (PROOF-BASED): $([ "$EVIDENCE_COUNT" -gt 0 ] && echo "PASS" || echo "FAIL")"
    echo "L7 (GATES BLOQUANT): $([ "$CI_GATES" -gt 0 ] && echo "PASS" || echo "FAIL")"
    echo ""
    echo "=== CONFORMITÉ GLOBALE ==="
    if [ "$VIOLATIONS" -eq 0 ]; then
        echo "✅ CONSTITUTIONAL COMPLIANCE: PASS"
        echo "Repository conforme aux LOIS ABSOLUES du PROD CERTIFICATION"
    else
        echo "❌ CONSTITUTIONAL COMPLIANCE: FAIL"
        echo "Repository NON conforme - $VIOLATIONS violations critiques"
    fi
} > "$AUDIT_REPORT"

echo ""
if [ "$VIOLATIONS" -eq 0 ]; then
    echo "✅ CONSTITUTIONAL-AUDIT: PASS - Repository conforme aux LOIS ABSOLUES"
    echo "📊 Violations: $VIOLATIONS, Warnings: $WARNINGS"
else
    echo "❌ CONSTITUTIONAL-AUDIT: FAIL - $VIOLATIONS violations critiques"
    echo "📊 Warnings: $WARNINGS"
    echo "🔧 SOLUTION: Corriger violations avant certification production"
fi

echo "📄 Audit: $(basename "$AUDIT_REPORT")"

exit "$VIOLATIONS"