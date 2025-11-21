#!/bin/sh
# TITANE∞ v8.0 - Strategic Direction Layer Verification
# Modules #52 (Self-Alignment), #53 (Taskflow), #54 (Mission)

echo "═══════════════════════════════════════════════════════════════"
echo "🔍 TITANE∞ Strategic Direction Layer Verification"
echo "═══════════════════════════════════════════════════════════════"
echo ""

PASS_COUNT=0
FAIL_COUNT=0
TOTAL_TESTS=20

check_file() {
    if [ -f "$1" ]; then
        echo "✅ $1"
        PASS_COUNT=$((PASS_COUNT + 1))
    else
        echo "❌ MANQUANT: $1"
        FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
}

echo "📦 MODULE #52: Self-Alignment Engine"
check_file "core/backend/system/self_alignment/mod.rs"
check_file "core/backend/system/self_alignment/metrics.rs"
check_file "core/backend/system/self_alignment/compute.rs"
check_file "core/backend/system/self_alignment/directive.rs"
check_file "core/backend/system/self_alignment/analyze.rs"
echo ""

echo "📦 MODULE #53: Taskflow Engine"
check_file "core/backend/system/taskflow/mod.rs"
check_file "core/backend/system/taskflow/metrics.rs"
check_file "core/backend/system/taskflow/compute.rs"
check_file "core/backend/system/taskflow/model.rs"
check_file "core/backend/system/taskflow/planner.rs"
check_file "core/backend/system/taskflow/clarity.rs"
echo ""

echo "📦 MODULE #54: Mission Engine"
check_file "core/backend/system/mission/mod.rs"
check_file "core/backend/system/mission/metrics.rs"
check_file "core/backend/system/mission/compute.rs"
check_file "core/backend/system/mission/vector.rs"
check_file "core/backend/system/mission/coherence.rs"
check_file "core/backend/system/mission/directive.rs"
check_file "core/backend/system/mission/narrative.rs"
echo ""

echo "🔗 INTEGRATION FILES"
check_file "core/backend/system/mod.rs"
check_file "core/backend/main.rs"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "📊 RÉSULTATS: $PASS_COUNT/$TOTAL_TESTS tests passés"
echo "═══════════════════════════════════════════════════════════════"

if [ $FAIL_COUNT -eq 0 ]; then
    echo "✅ SUCCÈS: Tous les fichiers Strategic Direction sont présents"
    exit 0
else
    echo "❌ ÉCHEC: $FAIL_COUNT fichiers manquants"
    exit 1
fi
