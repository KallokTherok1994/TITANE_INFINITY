#!/bin/sh
# TITANE∞ v8.0 - Advanced Cognitive Layer Verification
# Modules #55 (Governor), #56 (Conscience), #57 (Adaptive Intelligence), #59 (Autonomic Evolution)

echo "═══════════════════════════════════════════════════════════════"
echo "🔍 TITANE∞ Advanced Cognitive Layer Verification"
echo "═══════════════════════════════════════════════════════════════"
echo ""

PASS_COUNT=0
FAIL_COUNT=0
TOTAL_TESTS=21

check_file() {
    if [ -f "$1" ]; then
        echo "✅ $1"
        PASS_COUNT=$((PASS_COUNT + 1))
    else
        echo "❌ MANQUANT: $1"
        FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
}

echo "📦 MODULE #55: Governor Engine (Enhanced)"
check_file "core/backend/system/governor/metrics.rs"
check_file "core/backend/system/governor/compute_v2.rs"
check_file "core/backend/system/governor/deviation.rs"
check_file "core/backend/system/governor/homeostasis.rs"
check_file "core/backend/system/governor/directive.rs"
echo ""

echo "📦 MODULE #56: Conscience Engine (Enhanced)"
check_file "core/backend/system/conscience/metrics.rs"
check_file "core/backend/system/conscience/compute_v2.rs"
check_file "core/backend/system/conscience/clarity.rs"
check_file "core/backend/system/conscience/insight.rs"
check_file "core/backend/system/conscience/narrative.rs"
echo ""

echo "📦 MODULE #57: Adaptive Intelligence Engine"
check_file "core/backend/system/adaptive_intelligence/mod.rs"
check_file "core/backend/system/adaptive_intelligence/metrics.rs"
check_file "core/backend/system/adaptive_intelligence/compute.rs"
check_file "core/backend/system/adaptive_intelligence/plasticity.rs"
check_file "core/backend/system/adaptive_intelligence/flexibility.rs"
check_file "core/backend/system/adaptive_intelligence/directive.rs"
echo ""

echo "📦 MODULE #59: Autonomic Evolution Supervisor"
check_file "core/backend/system/autonomic_evolution/mod.rs"
check_file "core/backend/system/autonomic_evolution/metrics.rs"
check_file "core/backend/system/autonomic_evolution/compute.rs"
check_file "core/backend/system/autonomic_evolution/directive.rs"
echo ""

echo "🔗 INTEGRATION FILES"
check_file "core/backend/system/mod.rs"
check_file "core/backend/main.rs"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "📊 RÉSULTATS: $PASS_COUNT/$TOTAL_TESTS tests passés"
echo "═══════════════════════════════════════════════════════════════"

if [ $FAIL_COUNT -eq 0 ]; then
    echo "✅ SUCCÈS: Tous les fichiers Advanced Cognitive Layer sont présents"
    exit 0
else
    echo "❌ ÉCHEC: $FAIL_COUNT fichiers manquants"
    exit 1
fi
