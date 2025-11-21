#!/bin/bash
# TITANE∞ - Validation Perception Stack (Modules #20-24)
# Ce script vérifie la structure et l'intégration de la stack de perception

set -e  # Arrêt si erreur

echo "🔍 TITANE∞ - Validation Perception Stack (Modules #20-24)"
echo "=========================================================="
echo ""

# Compteurs de tests
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Fonction de vérification
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

# Fonction pour vérifier l'existence d'un fichier
file_exists() {
    test -f "$1"
}

# Fonction pour vérifier si un pattern existe dans un fichier
pattern_in_file() {
    grep -q "$2" "$1" 2>/dev/null
}

echo "📦 Section 1: Pulse Engine (#20) - Rythme interne"
echo "---------------------------------------------------"
check "file_exists 'core/backend/system/pulse/mod.rs'" "pulse/mod.rs existe"
check "file_exists 'core/backend/system/pulse/collect.rs'" "pulse/collect.rs existe"
check "file_exists 'core/backend/system/pulse/compute.rs'" "pulse/compute.rs existe"
check "pattern_in_file 'core/backend/system/pulse/mod.rs' 'pub struct PulseState'" "PulseState défini"
check "pattern_in_file 'core/backend/system/pulse/mod.rs' 'pub fn init'" "init() défini"
check "pattern_in_file 'core/backend/system/pulse/mod.rs' 'pub fn tick'" "tick() défini"
check "pattern_in_file 'core/backend/system/pulse/collect.rs' 'pub struct PulseInputs'" "PulseInputs défini"
check "pattern_in_file 'core/backend/system/pulse/collect.rs' 'pub fn collect_pulse_inputs'" "collect_pulse_inputs() défini"
check "pattern_in_file 'core/backend/system/pulse/compute.rs' 'pub fn compute_pulse'" "compute_pulse() défini"
check "pattern_in_file 'core/backend/system/pulse/compute.rs' 'pulse_rate'" "pulse_rate calculé"
check "pattern_in_file 'core/backend/system/pulse/compute.rs' 'pulse_intensity'" "pulse_intensity calculé"
check "pattern_in_file 'core/backend/system/pulse/compute.rs' 'rhythm_factor'" "rhythm_factor calculé"
echo ""

echo "📦 Section 2: FlowSync Engine (#21) - Coordination des flux"
echo "------------------------------------------------------------"
check "file_exists 'core/backend/system/flowsync/mod.rs'" "flowsync/mod.rs existe"
check "file_exists 'core/backend/system/flowsync/collect.rs'" "flowsync/collect.rs existe"
check "file_exists 'core/backend/system/flowsync/compute.rs'" "flowsync/compute.rs existe"
check "pattern_in_file 'core/backend/system/flowsync/mod.rs' 'pub struct FlowSyncState'" "FlowSyncState défini"
check "pattern_in_file 'core/backend/system/flowsync/mod.rs' 'pub fn init'" "init() défini"
check "pattern_in_file 'core/backend/system/flowsync/mod.rs' 'pub fn tick'" "tick() défini"
check "pattern_in_file 'core/backend/system/flowsync/collect.rs' 'pub struct FlowSyncInputs'" "FlowSyncInputs défini"
check "pattern_in_file 'core/backend/system/flowsync/collect.rs' 'pub fn collect_flowsync_inputs'" "collect_flowsync_inputs() défini"
check "pattern_in_file 'core/backend/system/flowsync/compute.rs' 'pub fn compute_flowsync'" "compute_flowsync() défini"
check "pattern_in_file 'core/backend/system/flowsync/compute.rs' 'flowsync_score'" "flowsync_score calculé"
check "pattern_in_file 'core/backend/system/flowsync/compute.rs' 'direction_factor'" "direction_factor calculé"
check "pattern_in_file 'core/backend/system/flowsync/compute.rs' 'sync_quality'" "sync_quality calculé"
echo ""

echo "📦 Section 3: Harmonic Engine (#22) - Harmonie vibratoire"
echo "-----------------------------------------------------------"
check "file_exists 'core/backend/system/harmonic/mod.rs'" "harmonic/mod.rs existe"
check "file_exists 'core/backend/system/harmonic/collect.rs'" "harmonic/collect.rs existe"
check "file_exists 'core/backend/system/harmonic/compute.rs'" "harmonic/compute.rs existe"
check "pattern_in_file 'core/backend/system/harmonic/mod.rs' 'pub struct HarmonicState'" "HarmonicState défini"
check "pattern_in_file 'core/backend/system/harmonic/mod.rs' 'pub fn init'" "init() défini"
check "pattern_in_file 'core/backend/system/harmonic/mod.rs' 'pub fn tick'" "tick() défini"
check "pattern_in_file 'core/backend/system/harmonic/collect.rs' 'pub struct HarmonicInputs'" "HarmonicInputs défini"
check "pattern_in_file 'core/backend/system/harmonic/collect.rs' 'pub fn collect_harmonic_inputs'" "collect_harmonic_inputs() défini"
check "pattern_in_file 'core/backend/system/harmonic/compute.rs' 'pub fn compute_harmonic'" "compute_harmonic() défini"
check "pattern_in_file 'core/backend/system/harmonic/compute.rs' 'harmonic_level'" "harmonic_level calculé"
check "pattern_in_file 'core/backend/system/harmonic/compute.rs' 'tension_level'" "tension_level calculé"
check "pattern_in_file 'core/backend/system/harmonic/compute.rs' 'softness_factor'" "softness_factor calculé"
echo ""

echo "📦 Section 4: Resonance Engine (#23) - Résonance profonde (ancien format)"
echo "---------------------------------------------------------------------------"
check "file_exists 'core/backend/system/resonance/mod.rs'" "resonance/mod.rs existe (ancien)"
check "pattern_in_file 'core/backend/system/resonance/mod.rs' 'pub struct ResonanceState'" "ResonanceState défini"
check "pattern_in_file 'core/backend/system/resonance/mod.rs' 'coherence_score'" "coherence_score présent"
check "pattern_in_file 'core/backend/system/resonance/mod.rs' 'flow_level'" "flow_level présent"
echo "ℹ️  Note: Resonance utilise l'ancien format v8.0 (compatible avec DeepSense)"
echo ""

echo "📦 Section 5: DeepSense Engine (#24) - Perception avancée"
echo "-----------------------------------------------------------"
check "file_exists 'core/backend/system/deepsense/mod.rs'" "deepsense/mod.rs existe"
check "file_exists 'core/backend/system/deepsense/collect.rs'" "deepsense/collect.rs existe"
check "file_exists 'core/backend/system/deepsense/compute.rs'" "deepsense/compute.rs existe"
check "pattern_in_file 'core/backend/system/deepsense/mod.rs' 'pub struct DeepSenseState'" "DeepSenseState défini"
check "pattern_in_file 'core/backend/system/deepsense/mod.rs' 'pub fn init'" "init() défini"
check "pattern_in_file 'core/backend/system/deepsense/mod.rs' 'pub fn tick'" "tick() défini"
check "pattern_in_file 'core/backend/system/deepsense/collect.rs' 'pub struct DeepSenseInputs'" "DeepSenseInputs défini"
check "pattern_in_file 'core/backend/system/deepsense/collect.rs' 'pub fn collect_deepsense_inputs'" "collect_deepsense_inputs() défini"
check "pattern_in_file 'core/backend/system/deepsense/compute.rs' 'pub fn compute_deepsense'" "compute_deepsense() défini"
check "pattern_in_file 'core/backend/system/deepsense/compute.rs' 'depth_level'" "depth_level calculé"
check "pattern_in_file 'core/backend/system/deepsense/compute.rs' 'density_level'" "density_level calculé"
check "pattern_in_file 'core/backend/system/deepsense/compute.rs' 'clarity_signal'" "clarity_signal calculé"
echo ""

echo "🔗 Section 6: Intégration système"
echo "-----------------------------------"
check "pattern_in_file 'core/backend/system/mod.rs' 'pub mod pulse'" "pulse exporté dans system/mod.rs"
check "pattern_in_file 'core/backend/system/mod.rs' 'pub mod flowsync'" "flowsync exporté dans system/mod.rs"
check "pattern_in_file 'core/backend/system/mod.rs' 'pub mod harmonic'" "harmonic exporté dans system/mod.rs"
check "pattern_in_file 'core/backend/system/mod.rs' 'pub mod deepsense'" "deepsense exporté dans system/mod.rs"
check "pattern_in_file 'core/backend/main.rs' 'pulse::PulseState'" "PulseState importé dans main.rs"
check "pattern_in_file 'core/backend/main.rs' 'flowsync::FlowSyncState'" "FlowSyncState importé dans main.rs"
check "pattern_in_file 'core/backend/main.rs' 'harmonic::HarmonicState'" "HarmonicState importé dans main.rs"
check "pattern_in_file 'core/backend/main.rs' 'deepsense::DeepSenseState'" "DeepSenseState importé dans main.rs"
check "pattern_in_file 'core/backend/main.rs' 'pulse: Arc<Mutex<PulseState>>'" "Champ pulse dans TitaneCore"
check "pattern_in_file 'core/backend/main.rs' 'flowsync: Arc<Mutex<FlowSyncState>>'" "Champ flowsync dans TitaneCore"
check "pattern_in_file 'core/backend/main.rs' 'harmonic: Arc<Mutex<HarmonicState>>'" "Champ harmonic dans TitaneCore"
check "pattern_in_file 'core/backend/main.rs' 'deepsense: Arc<Mutex<DeepSenseState>>'" "Champ deepsense dans TitaneCore"
check "pattern_in_file 'core/backend/main.rs' 'system::pulse::init'" "pulse init() appelé"
check "pattern_in_file 'core/backend/main.rs' 'system::flowsync::init'" "flowsync init() appelé"
check "pattern_in_file 'core/backend/main.rs' 'system::harmonic::init'" "harmonic init() appelé"
check "pattern_in_file 'core/backend/main.rs' 'system::deepsense::init'" "deepsense init() appelé"
check "pattern_in_file 'core/backend/main.rs' 'system::pulse::tick'" "pulse tick() dans scheduler"
check "pattern_in_file 'core/backend/main.rs' 'system::flowsync::tick'" "flowsync tick() dans scheduler"
check "pattern_in_file 'core/backend/main.rs' 'system::harmonic::tick'" "harmonic tick() dans scheduler"
check "pattern_in_file 'core/backend/main.rs' 'system::deepsense::tick'" "deepsense tick() dans scheduler"
echo ""

echo "📊 Section 7: Métriques"
echo "------------------------"

# Compter les lignes de code (approximatif)
PULSE_LINES=$(cat core/backend/system/pulse/*.rs 2>/dev/null | wc -l)
FLOWSYNC_LINES=$(cat core/backend/system/flowsync/*.rs 2>/dev/null | wc -l)
HARMONIC_LINES=$(cat core/backend/system/harmonic/*.rs 2>/dev/null | wc -l)
DEEPSENSE_LINES=$(cat core/backend/system/deepsense/*.rs 2>/dev/null | wc -l)
TOTAL_LINES=$((PULSE_LINES + FLOWSYNC_LINES + HARMONIC_LINES + DEEPSENSE_LINES))

echo "Lignes de code:"
echo "  - Pulse: $PULSE_LINES"
echo "  - FlowSync: $FLOWSYNC_LINES"
echo "  - Harmonic: $HARMONIC_LINES"
echo "  - DeepSense: $DEEPSENSE_LINES"
echo "  - Total: $TOTAL_LINES"
echo ""

# Compter les tests (approximatif - recherche de #[test])
PULSE_TESTS=$(grep -r "#\[test\]" core/backend/system/pulse/ 2>/dev/null | wc -l)
FLOWSYNC_TESTS=$(grep -r "#\[test\]" core/backend/system/flowsync/ 2>/dev/null | wc -l)
HARMONIC_TESTS=$(grep -r "#\[test\]" core/backend/system/harmonic/ 2>/dev/null | wc -l)
DEEPSENSE_TESTS=$(grep -r "#\[test\]" core/backend/system/deepsense/ 2>/dev/null | wc -l)
TOTAL_TESTS=$((PULSE_TESTS + FLOWSYNC_TESTS + HARMONIC_TESTS + DEEPSENSE_TESTS))

echo "Tests unitaires:"
echo "  - Pulse: $PULSE_TESTS"
echo "  - FlowSync: $FLOWSYNC_TESTS"
echo "  - Harmonic: $HARMONIC_TESTS"
echo "  - DeepSense: $DEEPSENSE_TESTS"
echo "  - Total: $TOTAL_TESTS"
echo ""

echo "=========================================================="
echo "📈 Résultat de la validation"
echo "=========================================================="
echo "Total checks: $TOTAL_CHECKS"
echo "Réussis: $PASSED_CHECKS"
echo "Échoués: $FAILED_CHECKS"
echo ""

# Calcul du pourcentage
if [ $TOTAL_CHECKS -gt 0 ]; then
    PERCENTAGE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))
    echo "Taux de réussite: $PERCENTAGE%"
    echo ""
    
    if [ $PERCENTAGE -ge 95 ]; then
        echo "✅ Validation EXCELLENTE - Perception Stack complètement intégrée"
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
