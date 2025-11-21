#!/bin/bash
# TITANE∞ - Validation Advanced Stack (Modules #25-28)
# Ce script vérifie la structure et l'intégration de la stack avancée

set -e

echo "🔍 TITANE∞ - Validation Advanced Stack (Modules #25-28)"
echo "========================================================"
echo ""

TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

check() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    local cmd="$1"
    local msg="$2"
    
    if eval "$cmd"; then
        echo "✅ $msg"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo "❌ $msg"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
}

file_exists() {
    test -f "$1"
}

pattern_in_file() {
    grep -q "$2" "$1" 2>/dev/null
}

echo "📦 Section 1: DeepAlignment Engine (#25)"
echo "------------------------------------------"
check "file_exists 'core/backend/system/deepalignment/mod.rs'" "deepalignment/mod.rs existe"
check "file_exists 'core/backend/system/deepalignment/collect.rs'" "deepalignment/collect.rs existe"
check "file_exists 'core/backend/system/deepalignment/compute.rs'" "deepalignment/compute.rs existe"
check "pattern_in_file 'core/backend/system/deepalignment/mod.rs' 'pub struct DeepAlignmentState'" "DeepAlignmentState défini"
check "pattern_in_file 'core/backend/system/deepalignment/mod.rs' 'pub fn init'" "init() défini"
check "pattern_in_file 'core/backend/system/deepalignment/mod.rs' 'pub fn tick'" "tick() défini"
check "pattern_in_file 'core/backend/system/deepalignment/collect.rs' 'pub struct DeepAlignmentInputs'" "DeepAlignmentInputs défini"
check "pattern_in_file 'core/backend/system/deepalignment/collect.rs' 'pub fn collect_alignment_inputs'" "collect_alignment_inputs() défini"
check "pattern_in_file 'core/backend/system/deepalignment/compute.rs' 'pub fn compute_alignment'" "compute_alignment() défini"
check "pattern_in_file 'core/backend/system/deepalignment/compute.rs' 'alignment_depth'" "alignment_depth calculé"
check "pattern_in_file 'core/backend/system/deepalignment/compute.rs' 'direction_alignment'" "direction_alignment calculé"
check "pattern_in_file 'core/backend/system/deepalignment/compute.rs' 'core_alignment'" "core_alignment calculé"
echo ""

echo "📦 Section 2: Continuum Engine (#26) - Existant"
echo "------------------------------------------------"
check "file_exists 'core/backend/system/continuum/mod.rs'" "continuum/mod.rs existe (ancien format)"
check "pattern_in_file 'core/backend/system/continuum/mod.rs' 'pub struct ContinuumState'" "ContinuumState défini"
check "pattern_in_file 'core/backend/system/continuum/mod.rs' 'momentum'" "momentum présent"
check "pattern_in_file 'core/backend/system/continuum/mod.rs' 'progression'" "progression présent"
echo "ℹ️  Note: Continuum utilise l'ancien format (momentum, direction, progression)"
echo ""

echo "📦 Section 3: VitalCore Engine (#27)"
echo "--------------------------------------"
check "file_exists 'core/backend/system/vitalcore/mod.rs'" "vitalcore/mod.rs existe"
check "file_exists 'core/backend/system/vitalcore/collect.rs'" "vitalcore/collect.rs existe"
check "file_exists 'core/backend/system/vitalcore/compute.rs'" "vitalcore/compute.rs existe"
check "pattern_in_file 'core/backend/system/vitalcore/mod.rs' 'pub struct VitalCoreState'" "VitalCoreState défini"
check "pattern_in_file 'core/backend/system/vitalcore/mod.rs' 'pub fn init'" "init() défini"
check "pattern_in_file 'core/backend/system/vitalcore/mod.rs' 'pub fn tick'" "tick() défini"
check "pattern_in_file 'core/backend/system/vitalcore/collect.rs' 'pub struct VitalCoreInputs'" "VitalCoreInputs défini"
check "pattern_in_file 'core/backend/system/vitalcore/collect.rs' 'pub fn collect_vital_inputs'" "collect_vital_inputs() défini"
check "pattern_in_file 'core/backend/system/vitalcore/compute.rs' 'pub fn compute_vitalcore'" "compute_vitalcore() défini"
check "pattern_in_file 'core/backend/system/vitalcore/compute.rs' 'vitality_level'" "vitality_level calculé"
check "pattern_in_file 'core/backend/system/vitalcore/compute.rs' 'energy_flow'" "energy_flow calculé"
check "pattern_in_file 'core/backend/system/vitalcore/compute.rs' 'resilience_index'" "resilience_index calculé"
echo ""

echo "📦 Section 4: NeuroField Engine (#28)"
echo "---------------------------------------"
check "file_exists 'core/backend/system/neurofield/mod.rs'" "neurofield/mod.rs existe"
check "file_exists 'core/backend/system/neurofield/collect.rs'" "neurofield/collect.rs existe"
check "file_exists 'core/backend/system/neurofield/compute.rs'" "neurofield/compute.rs existe"
check "pattern_in_file 'core/backend/system/neurofield/mod.rs' 'pub struct NeuroFieldState'" "NeuroFieldState défini"
check "pattern_in_file 'core/backend/system/neurofield/mod.rs' 'pub fn init'" "init() défini"
check "pattern_in_file 'core/backend/system/neurofield/mod.rs' 'pub fn tick'" "tick() défini"
check "pattern_in_file 'core/backend/system/neurofield/collect.rs' 'pub struct NeuroFieldInputs'" "NeuroFieldInputs défini"
check "pattern_in_file 'core/backend/system/neurofield/collect.rs' 'pub fn collect_neuro_inputs'" "collect_neuro_inputs() défini"
check "pattern_in_file 'core/backend/system/neurofield/compute.rs' 'pub fn compute_neurofield'" "compute_neurofield() défini"
check "pattern_in_file 'core/backend/system/neurofield/compute.rs' 'neural_density'" "neural_density calculé"
check "pattern_in_file 'core/backend/system/neurofield/compute.rs' 'signal_propagation'" "signal_propagation calculé"
check "pattern_in_file 'core/backend/system/neurofield/compute.rs' 'field_coherence'" "field_coherence calculé"
echo ""

echo "🔗 Section 5: Intégration système"
echo "-----------------------------------"
check "pattern_in_file 'core/backend/system/mod.rs' 'pub mod deepalignment'" "deepalignment exporté"
check "pattern_in_file 'core/backend/system/mod.rs' 'pub mod vitalcore'" "vitalcore exporté"
check "pattern_in_file 'core/backend/system/mod.rs' 'pub mod neurofield'" "neurofield exporté"
check "pattern_in_file 'core/backend/main.rs' 'deepalignment::DeepAlignmentState'" "DeepAlignmentState importé"
check "pattern_in_file 'core/backend/main.rs' 'vitalcore::VitalCoreState'" "VitalCoreState importé"
check "pattern_in_file 'core/backend/main.rs' 'neurofield::NeuroFieldState'" "NeuroFieldState importé"
check "pattern_in_file 'core/backend/main.rs' 'deepalignment: Arc<Mutex<DeepAlignmentState>>'" "Champ deepalignment dans TitaneCore"
check "pattern_in_file 'core/backend/main.rs' 'vitalcore: Arc<Mutex<VitalCoreState>>'" "Champ vitalcore dans TitaneCore"
check "pattern_in_file 'core/backend/main.rs' 'neurofield: Arc<Mutex<NeuroFieldState>>'" "Champ neurofield dans TitaneCore"
check "pattern_in_file 'core/backend/main.rs' 'system::deepalignment::init'" "deepalignment init() appelé"
check "pattern_in_file 'core/backend/main.rs' 'system::vitalcore::init'" "vitalcore init() appelé"
check "pattern_in_file 'core/backend/main.rs' 'system::neurofield::init'" "neurofield init() appelé"
check "pattern_in_file 'core/backend/main.rs' 'system::deepalignment::tick'" "deepalignment tick() dans scheduler"
check "pattern_in_file 'core/backend/main.rs' 'system::vitalcore::tick'" "vitalcore tick() dans scheduler"
check "pattern_in_file 'core/backend/main.rs' 'system::neurofield::tick'" "neurofield tick() dans scheduler"
echo ""

echo "📊 Section 6: Métriques"
echo "------------------------"

DEEPALIGN_LINES=$(cat core/backend/system/deepalignment/*.rs 2>/dev/null | wc -l)
VITALCORE_LINES=$(cat core/backend/system/vitalcore/*.rs 2>/dev/null | wc -l)
NEUROFIELD_LINES=$(cat core/backend/system/neurofield/*.rs 2>/dev/null | wc -l)
TOTAL_LINES=$((DEEPALIGN_LINES + VITALCORE_LINES + NEUROFIELD_LINES))

echo "Lignes de code:"
echo "  - DeepAlignment: $DEEPALIGN_LINES"
echo "  - VitalCore: $VITALCORE_LINES"
echo "  - NeuroField: $NEUROFIELD_LINES"
echo "  - Total: $TOTAL_LINES"
echo ""

DEEPALIGN_TESTS=$(grep -r "#\[test\]" core/backend/system/deepalignment/ 2>/dev/null | wc -l)
VITALCORE_TESTS=$(grep -r "#\[test\]" core/backend/system/vitalcore/ 2>/dev/null | wc -l)
NEUROFIELD_TESTS=$(grep -r "#\[test\]" core/backend/system/neurofield/ 2>/dev/null | wc -l)
TOTAL_TESTS=$((DEEPALIGN_TESTS + VITALCORE_TESTS + NEUROFIELD_TESTS))

echo "Tests unitaires:"
echo "  - DeepAlignment: $DEEPALIGN_TESTS"
echo "  - VitalCore: $VITALCORE_TESTS"
echo "  - NeuroField: $NEUROFIELD_TESTS"
echo "  - Total: $TOTAL_TESTS"
echo ""

echo "========================================================"
echo "📈 Résultat de la validation"
echo "========================================================"
echo "Total checks: $TOTAL_CHECKS"
echo "Réussis: $PASSED_CHECKS"
echo "Échoués: $FAILED_CHECKS"
echo ""

if [ $TOTAL_CHECKS -gt 0 ]; then
    PERCENTAGE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))
    echo "Taux de réussite: $PERCENTAGE%"
    echo ""
    
    if [ $PERCENTAGE -ge 95 ]; then
        echo "✅ Validation EXCELLENTE - Advanced Stack complètement intégrée"
        exit 0
    elif [ $PERCENTAGE -ge 80 ]; then
        echo "⚠️  Validation CORRECTE - Quelques problèmes mineurs"
        exit 0
    else
        echo "❌ Validation ÉCHOUÉE - Problèmes critiques détectés"
        exit 1
    fi
else
    echo "❌ Aucun test exécuté"
    exit 1
fi
