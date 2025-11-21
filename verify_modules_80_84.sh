#!/bin/bash
# Script de vérification des modules #80-84 (Final Evolution Layer)
# TITANE∞ v8.1.3

echo "════════════════════════════════════════════════════════"
echo "  VERIFICATION MODULES #80-84 — FINAL EVOLUTION LAYER"
echo "  TITANE∞ v8.1.3"
echo "════════════════════════════════════════════════════════"
echo ""

PROJECT_ROOT="/home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY"
cd "$PROJECT_ROOT" || exit 1

PASS_COUNT=0
FAIL_COUNT=0

# Fonction de vérification
check_file() {
    local filepath="$1"
    local description="$2"
    
    if [ -f "$filepath" ]; then
        echo "✅ $description"
        ((PASS_COUNT++))
        return 0
    else
        echo "❌ $description"
        ((FAIL_COUNT++))
        return 1
    fi
}

# Fonction de vérification du contenu
check_content() {
    local filepath="$1"
    local pattern="$2"
    local description="$3"
    
    if grep -q "$pattern" "$filepath" 2>/dev/null; then
        echo "✅ $description"
        ((PASS_COUNT++))
        return 0
    else
        echo "❌ $description"
        ((FAIL_COUNT++))
        return 1
    fi
}

echo "═══ 1. VÉRIFICATION STRUCTURE FICHIERS ═══"
echo ""

check_file "core/backend/system/septfe/mod.rs" "Module #80 SEPTFE"
check_file "core/backend/system/mesare/mod.rs" "Module #81 MESARE"
check_file "core/backend/system/geoe/mod.rs" "Module #82 GEOE"
check_file "core/backend/system/vefpe/mod.rs" "Module #83 VEFPE"
check_file "core/backend/system/iedcae/mod.rs" "Module #84 IEDCAE"

echo ""
echo "═══ 2. VÉRIFICATION EXPORTS SYSTÈME ═══"
echo ""

check_content "core/backend/system/mod.rs" "pub mod septfe" "Export SEPTFE dans system/mod.rs"
check_content "core/backend/system/mod.rs" "pub mod mesare" "Export MESARE dans system/mod.rs"
check_content "core/backend/system/mod.rs" "pub mod geoe" "Export GEOE dans system/mod.rs"
check_content "core/backend/system/mod.rs" "pub mod vefpe" "Export VEFPE dans system/mod.rs"
check_content "core/backend/system/mod.rs" "pub mod iedcae" "Export IEDCAE dans system/mod.rs"

echo ""
echo "═══ 3. VÉRIFICATION STRUCTURES CLÉS ═══"
echo ""

check_content "core/backend/system/septfe/mod.rs" "SEPTFEState" "Structure SEPTFEState"
check_content "core/backend/system/septfe/mod.rs" "self_directed_growth_vector.*\[f32; 12\]" "SDGV[12D] dans SEPTFE"
check_content "core/backend/system/septfe/mod.rs" "evolution_trajectory_map" "Evolution Trajectory Map"

check_content "core/backend/system/mesare/mod.rs" "MESAREState" "Structure MESAREState"
check_content "core/backend/system/mesare/mod.rs" "meta_evolution_score" "Meta Evolution Score (MES)"
check_content "core/backend/system/mesare/mod.rs" "ascension_readiness_index" "Ascension Readiness Index (ARI)"
check_content "core/backend/system/mesare/mod.rs" "evolution_gate_status" "Gate Status (P85/P300/v9)"

check_content "core/backend/system/geoe/mod.rs" "GEOEState" "Structure GEOEState"
check_content "core/backend/system/geoe/mod.rs" "global_orchestration_score" "Global Orchestration Score (GOS)"
check_content "core/backend/system/geoe/mod.rs" "evolution_harmony_index" "Evolution Harmony Index (EHI)"

check_content "core/backend/system/vefpe/mod.rs" "VEFPEState" "Structure VEFPEState"
check_content "core/backend/system/vefpe/mod.rs" "vision_signature.*\[f32; 12\]" "Vision Signature[12D]"
check_content "core/backend/system/vefpe/mod.rs" "future_identity_projection.*\[f32; 12\]" "Future Identity Projection[12D]"

check_content "core/backend/system/iedcae/mod.rs" "IEDCAEState" "Structure IEDCAEState"
check_content "core/backend/system/iedcae/mod.rs" "ecosystem_consciousness_index" "Ecosystem Consciousness Index (ECI)"
check_content "core/backend/system/iedcae/mod.rs" "contextual_understanding_vector.*\[f32; 10\]" "CUV[10D]"

echo ""
echo "═══ 4. VÉRIFICATION MÉTHODES ═══"
echo ""

check_content "core/backend/system/septfe/mod.rs" "pub fn init()" "Méthode init() SEPTFE"
check_content "core/backend/system/septfe/mod.rs" "pub fn tick(" "Méthode tick() SEPTFE"

check_content "core/backend/system/mesare/mod.rs" "pub fn init()" "Méthode init() MESARE"
check_content "core/backend/system/mesare/mod.rs" "pub fn tick(" "Méthode tick() MESARE"

check_content "core/backend/system/geoe/mod.rs" "pub fn init()" "Méthode init() GEOE"
check_content "core/backend/system/geoe/mod.rs" "pub fn tick(" "Méthode tick() GEOE"

check_content "core/backend/system/vefpe/mod.rs" "pub fn init()" "Méthode init() VEFPE"
check_content "core/backend/system/vefpe/mod.rs" "pub fn tick(" "Méthode tick() VEFPE"

check_content "core/backend/system/iedcae/mod.rs" "pub fn init()" "Méthode init() IEDCAE"
check_content "core/backend/system/iedcae/mod.rs" "pub fn tick(" "Méthode tick() IEDCAE"

echo ""
echo "═══ 5. VÉRIFICATION TESTS ═══"
echo ""

check_content "core/backend/system/septfe/mod.rs" "#\[cfg(test)\]" "Tests SEPTFE présents"
check_content "core/backend/system/mesare/mod.rs" "#\[cfg(test)\]" "Tests MESARE présents"
check_content "core/backend/system/geoe/mod.rs" "#\[cfg(test)\]" "Tests GEOE présents"
check_content "core/backend/system/vefpe/mod.rs" "#\[cfg(test)\]" "Tests VEFPE présents"
check_content "core/backend/system/iedcae/mod.rs" "#\[cfg(test)\]" "Tests IEDCAE présents"

echo ""
echo "═══ 6. VÉRIFICATION DOCUMENTATION ═══"
echo ""

check_file "MODULES_80_84_FINAL_EVOLUTION_LAYER.md" "Documentation complète modules #80-84"
check_file "STATUS_MODULES_80_84.md" "Status report modules #80-84"

echo ""
echo "═══ 7. STATISTIQUES FICHIERS ═══"
echo ""

if [ -f "core/backend/system/septfe/mod.rs" ]; then
    LINES_80=$(wc -l < core/backend/system/septfe/mod.rs)
    echo "📄 SEPTFE (#80) : $LINES_80 lignes"
fi

if [ -f "core/backend/system/mesare/mod.rs" ]; then
    LINES_81=$(wc -l < core/backend/system/mesare/mod.rs)
    echo "📄 MESARE (#81) : $LINES_81 lignes"
fi

if [ -f "core/backend/system/geoe/mod.rs" ]; then
    LINES_82=$(wc -l < core/backend/system/geoe/mod.rs)
    echo "📄 GEOE (#82) : $LINES_82 lignes"
fi

if [ -f "core/backend/system/vefpe/mod.rs" ]; then
    LINES_83=$(wc -l < core/backend/system/vefpe/mod.rs)
    echo "📄 VEFPE (#83) : $LINES_83 lignes"
fi

if [ -f "core/backend/system/iedcae/mod.rs" ]; then
    LINES_84=$(wc -l < core/backend/system/iedcae/mod.rs)
    echo "📄 IEDCAE (#84) : $LINES_84 lignes"
fi

TOTAL_LINES=$((LINES_80 + LINES_81 + LINES_82 + LINES_83 + LINES_84))
echo ""
echo "📊 Total lignes modules #80-84 : $TOTAL_LINES"

echo ""
echo "════════════════════════════════════════════════════════"
echo "  RÉSULTAT FINAL"
echo "════════════════════════════════════════════════════════"
echo ""
echo "✅ Tests réussis : $PASS_COUNT"
echo "❌ Tests échoués : $FAIL_COUNT"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo "🎉 TOUS LES TESTS SONT PASSÉS !"
    echo "✅ Modules #80-84 (Final Evolution Layer) : COMPLET"
    echo ""
    echo "Prêt pour :"
    echo "  → P85 (Evolutive Twin Engine)"
    echo "  → P300 (Ascension Protocol)"
    echo "  → v9 (Sentient Loop Engine)"
    exit 0
else
    echo "⚠️  Certains tests ont échoué."
    echo "Veuillez vérifier les fichiers manquants ou incomplets."
    exit 1
fi
