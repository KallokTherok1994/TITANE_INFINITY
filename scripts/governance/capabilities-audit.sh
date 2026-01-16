#!/bin/bash
# TITANE∞ P6 Capabilities Feature Validation  
# Audit des capacités et fonctionnalités critiques pour certification production

set -euo pipefail

PROJECT_ROOT="/home/titane-os/Documents/GitHub/TITANE_INFINITY"
EVIDENCE_DIR="$PROJECT_ROOT/docs/_evidence"
PHASE="P6"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

VIOLATIONS=0
WARNINGS=0

echo "⚡ [CAPABILITIES-AUDIT] TITANE∞ Feature Capabilities Validation"
echo "=============================================================="
echo "📋 Audit des capacités critiques et fonctionnalités core..."
echo ""

cd "$PROJECT_ROOT"

# CAP1: Core Architecture - Services fondamentaux
echo "📋 CAP1: CORE ARCHITECTURE - Services fondamentaux..."

CORE_SERVICES=$(find src/services -name "*.ts" | wc -l)
if [ "$CORE_SERVICES" -ge 10 ]; then
    echo "✅ CAP1 PASS: Services core présents ($CORE_SERVICES services)"
else
    echo "❌ CAP1 VIOLATION: Services core insuffisants ($CORE_SERVICES < 10)"
    VIOLATIONS=$((VIOLATIONS + 1))
fi

# Vérifier services critiques
CRITICAL_SERVICES=("tauriClient" "memory" "governance" "selfHealing")
for service in "${CRITICAL_SERVICES[@]}"; do
    if find src/services -name "*$service*" | grep -q .; then
        echo "✅ CAP1 PASS: Service critique '$service' présent"
    else
        echo "❌ CAP1 VIOLATION: Service critique '$service' manquant"
        VIOLATIONS=$((VIOLATIONS + 1))
    fi
done

# CAP2: UI/UX Components - Interface utilisateur
echo ""
echo "📋 CAP2: UI/UX COMPONENTS - Interface utilisateur..."

UI_COMPONENTS=$(find src/components -name "*.tsx" 2>/dev/null | wc -l || echo "0")
if [ "$UI_COMPONENTS" -ge 15 ]; then
    echo "✅ CAP2 PASS: Composants UI présents ($UI_COMPONENTS composants)"
else
    echo "⚠️ CAP2 WARNING: Composants UI limités ($UI_COMPONENTS composants)"
    WARNINGS=$((WARNINGS + 1))
fi

# Vérifier layouts critiques
if [ -d "src/layouts" ]; then
    echo "✅ CAP2 PASS: Layouts structure présente"
else
    echo "⚠️ CAP2 WARNING: Layouts structure manquante"
    WARNINGS=$((WARNINGS + 1))
fi

# CAP3: Backend Integration - Tauri + Rust
echo ""
echo "📋 CAP3: BACKEND INTEGRATION - Tauri + Rust..."

RUST_MODULES=$(find src-tauri/src -name "*.rs" | wc -l)
if [ "$RUST_MODULES" -ge 20 ]; then
    echo "✅ CAP3 PASS: Modules Rust présents ($RUST_MODULES modules)"
else
    echo "❌ CAP3 VIOLATION: Modules Rust insuffisants ($RUST_MODULES < 20)"
    VIOLATIONS=$((VIOLATIONS + 1))
fi

# Vérifier modules critiques Tauri
TAURI_MODULES=("omega" "overdrive" "memory" "singularity")
for module in "${TAURI_MODULES[@]}"; do
    if find src-tauri/src -name "*$module*" | grep -q .; then
        echo "✅ CAP3 PASS: Module Tauri '$module' présent"
    else
        echo "❌ CAP3 VIOLATION: Module Tauri '$module' manquant"
        VIOLATIONS=$((VIOLATIONS + 1))
    fi
done

# CAP4: State Management - Gestion d'état
echo ""
echo "📋 CAP4: STATE MANAGEMENT - Gestion d'état..."

STATE_FILES=$(find src -name "*state*" -o -name "*store*" -o -name "*context*" | wc -l)
if [ "$STATE_FILES" -ge 5 ]; then
    echo "✅ CAP4 PASS: Gestion d'état présente ($STATE_FILES fichiers)"
else
    echo "⚠️ CAP4 WARNING: Gestion d'état limitée ($STATE_FILES fichiers)"
    WARNINGS=$((WARNINGS + 1))
fi

# CAP5: Routing & Navigation - Navigation
echo ""
echo "📋 CAP5: ROUTING & NAVIGATION - Navigation..."

if [ -f "src/App.tsx" ]; then
    ROUTES=$(grep -c "route\|path\|navigate" src/App.tsx 2>/dev/null || echo "0")
    if [ "$ROUTES" -ge 3 ]; then
        echo "✅ CAP5 PASS: Système routing présent ($ROUTES routes)"
    else
        echo "⚠️ CAP5 WARNING: Système routing limité ($ROUTES routes)"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "❌ CAP5 VIOLATION: App.tsx manquant"
    VIOLATIONS=$((VIOLATIONS + 1))
fi

# CAP6: Testing Coverage - Couverture tests
echo ""
echo "📋 CAP6: TESTING COVERAGE - Couverture tests..."

TEST_FILES=$(find . -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" | grep -v node_modules | wc -l)
if [ "$TEST_FILES" -ge 10 ]; then
    echo "✅ CAP6 PASS: Tests présents ($TEST_FILES fichiers)"
else
    echo "⚠️ CAP6 WARNING: Couverture tests limitée ($TEST_FILES fichiers)"
    WARNINGS=$((WARNINGS + 1))
fi

# CAP7: Performance & Optimization - Performance
echo ""
echo "📋 CAP7: PERFORMANCE & OPTIMIZATION - Performance..."

# Vérifier lazy loading et optimisations
LAZY_IMPORTS=$(grep -r "lazy\|Suspense" src/ 2>/dev/null | wc -l || echo "0")
if [ "$LAZY_IMPORTS" -ge 3 ]; then
    echo "✅ CAP7 PASS: Optimisations présentes ($LAZY_IMPORTS lazy imports)"
else
    echo "⚠️ CAP7 WARNING: Optimisations limitées ($LAZY_IMPORTS lazy imports)"
    WARNINGS=$((WARNINGS + 1))
fi

# CAP8: Security Features - Fonctionnalités sécurité
echo ""
echo "📋 CAP8: SECURITY FEATURES - Fonctionnalités sécurité..."

SECURITY_FEATURES=$(find src -name "*security*" -o -name "*auth*" -o -name "*crypto*" | wc -l)
if [ "$SECURITY_FEATURES" -ge 3 ]; then
    echo "✅ CAP8 PASS: Fonctionnalités sécurité présentes ($SECURITY_FEATURES fichiers)"
else
    echo "⚠️ CAP8 WARNING: Fonctionnalités sécurité limitées ($SECURITY_FEATURES fichiers)"
    WARNINGS=$((WARNINGS + 1))
fi

# CAP9: Documentation Features - Documentation intégrée
echo ""
echo "📋 CAP9: DOCUMENTATION FEATURES - Documentation intégrée..."

INLINE_DOCS=$(grep -r "TODO\|FIXME\|@param\|@returns" src/ 2>/dev/null | wc -l || echo "0")
if [ "$INLINE_DOCS" -ge 50 ]; then
    echo "✅ CAP9 PASS: Documentation inline présente ($INLINE_DOCS occurrences)"
else
    echo "⚠️ CAP9 WARNING: Documentation inline limitée ($INLINE_DOCS occurrences)"
    WARNINGS=$((WARNINGS + 1))
fi

# CAP10: Build & Distribution - Capacités déploiement
echo ""
echo "📋 CAP10: BUILD & DISTRIBUTION - Capacités déploiement..."

BUILD_TARGETS=$(grep -E "(appimage|deb|dmg|msi|\"targets\": \"all\")" src-tauri/Cargo.toml runtime/stable/tauri.conf.json 2>/dev/null | wc -l || echo "0")
if [ "$BUILD_TARGETS" -ge 2 ]; then
    echo "✅ CAP10 PASS: Cibles déploiement présentes ($BUILD_TARGETS cibles)"
else
    echo "❌ CAP10 VIOLATION: Cibles déploiement insuffisantes ($BUILD_TARGETS < 2)"
    VIOLATIONS=$((VIOLATIONS + 1))
fi

# Evidence collection
echo ""
echo "📋 Génération evidence P6..."
mkdir -p "$EVIDENCE_DIR/p6"

cat > "$EVIDENCE_DIR/p6/${PHASE}_capabilities_audit_${TIMESTAMP}.txt" << EOF
TITANE∞ P6 Capabilities Feature Validation Report
=================================================
Timestamp: $(date -Iseconds)
Repository: $(pwd)
Branch: $(git rev-parse --abbrev-ref HEAD)
Commit: $(git rev-parse HEAD)

RESULTS SUMMARY:
- Violations: $VIOLATIONS
- Warnings: $WARNINGS
- Status: $([ $VIOLATIONS -eq 0 ] && echo "PASS" || echo "FAIL")

CAPABILITIES FEATURE AUDIT:
CAP1 CORE ARCHITECTURE: $([[ $CORE_SERVICES -ge 10 ]] && echo "PASS" || echo "FAIL")
CAP2 UI/UX COMPONENTS: $([[ $UI_COMPONENTS -ge 15 ]] && echo "PASS" || echo "WARNING")
CAP3 BACKEND INTEGRATION: $([[ $RUST_MODULES -ge 20 ]] && echo "PASS" || echo "FAIL")
CAP4 STATE MANAGEMENT: $([[ $STATE_FILES -ge 5 ]] && echo "PASS" || echo "WARNING")
CAP5 ROUTING & NAVIGATION: $([ -f "src/App.tsx" ] && echo "PASS" || echo "FAIL")
CAP6 TESTING COVERAGE: $([[ $TEST_FILES -ge 10 ]] && echo "PASS" || echo "WARNING")
CAP7 PERFORMANCE & OPTIMIZATION: $([[ $LAZY_IMPORTS -ge 3 ]] && echo "PASS" || echo "WARNING")
CAP8 SECURITY FEATURES: $([[ $SECURITY_FEATURES -ge 3 ]] && echo "PASS" || echo "WARNING")
CAP9 DOCUMENTATION FEATURES: $([[ $INLINE_DOCS -ge 50 ]] && echo "PASS" || echo "WARNING")
CAP10 BUILD & DISTRIBUTION: $([[ $BUILD_TARGETS -ge 2 ]] && echo "PASS" || echo "FAIL")

DETAILED METRICS:
- Core services: $CORE_SERVICES
- UI components: $UI_COMPONENTS  
- Rust modules: $RUST_MODULES
- State management files: $STATE_FILES
- Test files: $TEST_FILES
- Lazy imports: $LAZY_IMPORTS
- Security features: $SECURITY_FEATURES
- Inline documentation: $INLINE_DOCS
- Build targets: $BUILD_TARGETS

CRITICAL SERVICES STATUS:
$(for service in "${CRITICAL_SERVICES[@]}"; do
    if find src/services -name "*$service*" | grep -q .; then
        echo "- $service: PRESENT"
    else
        echo "- $service: MISSING"
    fi
done)

TAURI MODULES STATUS:
$(for module in "${TAURI_MODULES[@]}"; do
    if find src-tauri/src -name "*$module*" | grep -q .; then
        echo "- $module: PRESENT"
    else
        echo "- $module: MISSING"
    fi
done)

RECOMMENDATIONS:
$([ $VIOLATIONS -gt 0 ] && echo "- Corriger $VIOLATIONS violation(s) critique(s)" || echo "- Capacités fonctionnelles validées")
$([ $WARNINGS -gt 0 ] && echo "- Améliorer $WARNINGS warning(s) fonctionnalités" || echo "- Qualité fonctionnelle optimale")
EOF

# Result
echo ""
if [ $VIOLATIONS -eq 0 ]; then
    echo "✅ CAPABILITIES-AUDIT: PASS - Capacités fonctionnelles validées"
    echo "📊 Violations: $VIOLATIONS, Warnings: $WARNINGS"
    echo "📄 Evidence: ${PHASE}_capabilities_audit_${TIMESTAMP}.txt"
    exit 0
else
    echo "❌ CAPABILITIES-AUDIT: FAIL - $VIOLATIONS violations critiques"
    echo "📊 Warnings: $WARNINGS"
    echo "🔧 SOLUTION: Corriger capacités avant certification"
    echo "📄 Audit: ${PHASE}_capabilities_audit_${TIMESTAMP}.txt"
    exit 1
fi