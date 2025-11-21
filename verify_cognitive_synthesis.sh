#!/bin/bash
# TITANE∞ v8.0 - Verification Script for Modules #49-51
# Validates Resonance v2, Meaning, and Identity engines

echo "🔍 TITANE∞ v8.0 - Verification Modules #49-51: Cognitive Synthesis Layer"
echo "=========================================================================="
echo ""

BACKEND_DIR="core/backend/system"
TOTAL=0
PRESENT=0

echo "📋 Module #49: Resonance Engine v2"
echo "-----------------------------------"
FILES_49=(
    "$BACKEND_DIR/resonance_v2/mod.rs"
    "$BACKEND_DIR/resonance_v2/metrics.rs"
    "$BACKEND_DIR/resonance_v2/oscillation.rs"
    "$BACKEND_DIR/resonance_v2/harmonic.rs"
    "$BACKEND_DIR/resonance_v2/compute.rs"
)

for file in "${FILES_49[@]}"; do
    TOTAL=$((TOTAL + 1))
    if [ -f "$file" ]; then
        PRESENT=$((PRESENT + 1))
        echo "  ✅ $file"
    else
        echo "  ❌ MANQUANT: $file"
    fi
done

echo ""
echo "📋 Module #50: Meaning Engine"
echo "------------------------------"
FILES_50=(
    "$BACKEND_DIR/meaning/mod.rs"
    "$BACKEND_DIR/meaning/metrics.rs"
    "$BACKEND_DIR/meaning/analyze.rs"
    "$BACKEND_DIR/meaning/depth.rs"
    "$BACKEND_DIR/meaning/orientation.rs"
    "$BACKEND_DIR/meaning/narrative.rs"
)

for file in "${FILES_50[@]}"; do
    TOTAL=$((TOTAL + 1))
    if [ -f "$file" ]; then
        PRESENT=$((PRESENT + 1))
        echo "  ✅ $file"
    else
        echo "  ❌ MANQUANT: $file"
    fi
done

echo ""
echo "📋 Module #51: Identity Engine"
echo "-------------------------------"
FILES_51=(
    "$BACKEND_DIR/identity/mod.rs"
    "$BACKEND_DIR/identity/metrics.rs"
    "$BACKEND_DIR/identity/compute.rs"
    "$BACKEND_DIR/identity/continuity.rs"
    "$BACKEND_DIR/identity/alignment.rs"
    "$BACKEND_DIR/identity/narrative.rs"
)

for file in "${FILES_51[@]}"; do
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
echo "=========================================================================="
echo "✅ Résumé: $PRESENT/$TOTAL fichiers présents"
echo "=========================================================================="

if [ "$PRESENT" -eq "$TOTAL" ]; then
    echo "✅ SUCCÈS: Tous les fichiers de la Cognitive Synthesis Layer sont présents"
    exit 0
else
    MISSING=$((TOTAL - PRESENT))
    echo "❌ ÉCHEC: $MISSING fichiers manquants"
    exit 1
fi
