#!/bin/bash
# TITANE∞ v8.0 - Verification Script for Modules #44-48 (Monitoring Layer)
# Validates Action Potential, Dashboard, Self-Healing, and Energetic Flow engines

echo "🔍 TITANE∞ v8.0 - Verification Modules #44-48: Monitoring Layer"
echo "=================================================================="
echo ""

BACKEND_DIR="core/backend/system"
TOTAL=0
PRESENT=0

echo "📋 Module #44: Action Potential Engine"
echo "---------------------------------------"
FILES_44=(
    "$BACKEND_DIR/action_potential/mod.rs"
    "$BACKEND_DIR/action_potential/threshold.rs"
    "$BACKEND_DIR/action_potential/collect.rs"
    "$BACKEND_DIR/action_potential/compute.rs"
)

for file in "${FILES_44[@]}"; do
    TOTAL=$((TOTAL + 1))
    if [ -f "$file" ]; then
        PRESENT=$((PRESENT + 1))
        echo "  ✅ $file"
    else
        echo "  ❌ MANQUANT: $file"
    fi
done

echo ""
echo "📋 Module #45: Dashboard Engine"
echo "--------------------------------"
FILES_45=(
    "$BACKEND_DIR/dashboard/mod.rs"
    "$BACKEND_DIR/dashboard/types.rs"
    "$BACKEND_DIR/dashboard/collect.rs"
    "$BACKEND_DIR/dashboard/format.rs"
    "$BACKEND_DIR/dashboard/snapshot.rs"
)

for file in "${FILES_45[@]}"; do
    TOTAL=$((TOTAL + 1))
    if [ -f "$file" ]; then
        PRESENT=$((PRESENT + 1))
        echo "  ✅ $file"
    else
        echo "  ❌ MANQUANT: $file"
    fi
done

echo ""
echo "📋 Module #47: Self-Healing Engine"
echo "-----------------------------------"
FILES_47=(
    "$BACKEND_DIR/self_healing_v2/mod.rs"
    "$BACKEND_DIR/self_healing_v2/guardian.rs"
    "$BACKEND_DIR/self_healing_v2/repair.rs"
    "$BACKEND_DIR/self_healing_v2/stabilizer.rs"
    "$BACKEND_DIR/self_healing_v2/scoring.rs"
)

for file in "${FILES_47[@]}"; do
    TOTAL=$((TOTAL + 1))
    if [ -f "$file" ]; then
        PRESENT=$((PRESENT + 1))
        echo "  ✅ $file"
    else
        echo "  ❌ MANQUANT: $file"
    fi
done

echo ""
echo "📋 Module #48: Energetic Flow Engine"
echo "-------------------------------------"
FILES_48=(
    "$BACKEND_DIR/energetic/mod.rs"
    "$BACKEND_DIR/energetic/flow.rs"
    "$BACKEND_DIR/energetic/pulse.rs"
    "$BACKEND_DIR/energetic/rhythm.rs"
    "$BACKEND_DIR/energetic/metrics.rs"
)

for file in "${FILES_48[@]}"; do
    TOTAL=$((TOTAL + 1))
    if [ -f "$file" ]; then
        PRESENT=$((PRESENT + 1))
        echo "  ✅ $file"
    else
        echo "  ❌ MANQUANT: $file"
    fi
done

echo ""
echo "📋 Intégration système"
echo "----------------------"
INTEGRATION_FILES=(
    "$BACKEND_DIR/mod.rs"
    "core/backend/main.rs"
)

for file in "${INTEGRATION_FILES[@]}"; do
    TOTAL=$((TOTAL + 1))
    if [ -f "$file" ]; then
        PRESENT=$((PRESENT + 1))
        echo "  ✅ $file"
    else
        echo "  ❌ MANQUANT: $file"
    fi
done

echo ""
echo "=================================================================="
echo "✅ Résumé: $PRESENT/$TOTAL fichiers présents"
echo "=================================================================="

if [ "$PRESENT" -eq "$TOTAL" ]; then
    echo "✅ SUCCÈS: Tous les fichiers de la Monitoring Layer sont présents"
    exit 0
else
    MISSING=$((TOTAL - PRESENT))
    echo "❌ ÉCHEC: $MISSING fichiers manquants"
    exit 1
fi
