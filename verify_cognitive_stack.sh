#!/bin/bash
# TITANE∞ v8.0 - Cognitive Stack Validation
# Modules #31-35: MetaCortex, Governor, Conscience, Adaptive, Evolution

echo "🧠 VALIDATION COGNITIVE STACK (#31-35)"
echo "=========================================="
echo ""

TOTAL_CHECKS=0
PASSED_CHECKS=0

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

check() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if [ $1 -eq 0 ]; then
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
    fi
}

# ============================================
# SECTION 1: METACORTEX ENGINE (#31)
# ============================================
echo "📦 Section 1: MetaCortex Engine"
echo "-------------------------------"

[ -f "core/backend/system/metacortex/mod.rs" ]
check $? "Module metacortex/mod.rs existe"

[ -f "core/backend/system/metacortex/collect.rs" ]
check $? "Module metacortex/collect.rs existe"

[ -f "core/backend/system/metacortex/compute.rs" ]
check $? "Module metacortex/compute.rs existe"

grep -q "pub struct MetaCortexState" core/backend/system/metacortex/mod.rs
check $? "Struct MetaCortexState définie"

grep -q "pub metacortex_clarity: f32" core/backend/system/metacortex/mod.rs
check $? "Champ metacortex_clarity (f32)"

grep -q "pub reasoning_depth: f32" core/backend/system/metacortex/mod.rs
check $? "Champ reasoning_depth (f32)"

grep -q "pub global_coherence: f32" core/backend/system/metacortex/mod.rs
check $? "Champ global_coherence (f32)"

grep -q "pub struct MetaCortexInputs" core/backend/system/metacortex/collect.rs
check $? "Struct MetaCortexInputs définie"

grep -q "pub fn compute_metacortex(" core/backend/system/metacortex/compute.rs
check $? "Fonction compute_metacortex() présente"

grep -q "cortical_coherence \* 0.35" core/backend/system/metacortex/compute.rs
check $? "Formule metacortex_clarity correcte"

grep -q "integration_depth \* 0.40" core/backend/system/metacortex/compute.rs
check $? "Formule reasoning_depth correcte"

grep -q "cortical_coherence \* 0.30" core/backend/system/metacortex/compute.rs
check $? "Formule global_coherence correcte"

echo ""

# ============================================
# SECTION 2: GOVERNOR ENGINE (#32)
# ============================================
echo "📦 Section 2: Governor Engine"
echo "-----------------------------"

[ -f "core/backend/system/governor/mod.rs" ]
check $? "Module governor/mod.rs existe"

[ -f "core/backend/system/governor/collect.rs" ]
check $? "Module governor/collect.rs existe"

[ -f "core/backend/system/governor/compute.rs" ]
check $? "Module governor/compute.rs existe"

grep -q "pub struct GovernorState" core/backend/system/governor/mod.rs
check $? "Struct GovernorState définie"

grep -q "pub regulation_level: f32" core/backend/system/governor/mod.rs
check $? "Champ regulation_level (f32)"

grep -q "pub deviation_index: f32" core/backend/system/governor/mod.rs
check $? "Champ deviation_index (f32)"

grep -q "pub homeostasis_score: f32" core/backend/system/governor/mod.rs
check $? "Champ homeostasis_score (f32)"

grep -q "pub struct GovernorInputs" core/backend/system/governor/collect.rs
check $? "Struct GovernorInputs définie"

grep -q "pub fn compute_governor(" core/backend/system/governor/compute.rs
check $? "Fonction compute_governor() présente"

grep -q "1.0 - inputs.global_coherence" core/backend/system/governor/compute.rs
check $? "Formule regulation_level inverse correcte"

grep -q "1.0 - inputs.stability_score" core/backend/system/governor/compute.rs
check $? "Formule deviation_index inverse correcte"

grep -q "global_coherence \* 0.30" core/backend/system/governor/compute.rs
check $? "Formule homeostasis_score correcte"

echo ""

# ============================================
# SECTION 3: CONSCIENCE ENGINE (#33)
# ============================================
echo "📦 Section 3: Conscience Engine"
echo "-------------------------------"

[ -f "core/backend/system/conscience/mod.rs" ]
check $? "Module conscience/mod.rs existe"

[ -f "core/backend/system/conscience/collect.rs" ]
check $? "Module conscience/collect.rs existe"

[ -f "core/backend/system/conscience/compute.rs" ]
check $? "Module conscience/compute.rs existe"

grep -q "pub struct ConscienceState" core/backend/system/conscience/mod.rs
check $? "Struct ConscienceState définie"

grep -q "pub clarity_index: f32" core/backend/system/conscience/mod.rs
check $? "Champ clarity_index (f32)"

grep -q "pub self_coherence: f32" core/backend/system/conscience/mod.rs
check $? "Champ self_coherence (f32)"

grep -q "pub insight_potential: f32" core/backend/system/conscience/mod.rs
check $? "Champ insight_potential (f32)"

grep -q "pub struct ConscienceInputs" core/backend/system/conscience/collect.rs
check $? "Struct ConscienceInputs définie"

grep -q "pub fn compute_conscience(" core/backend/system/conscience/compute.rs
check $? "Fonction compute_conscience() présente"

echo ""

# ============================================
# SECTION 4: ADAPTIVE INTELLIGENCE ENGINE (#34)
# ============================================
echo "📦 Section 4: Adaptive Intelligence Engine"
echo "------------------------------------------"

[ -f "core/backend/system/adaptive/mod.rs" ]
check $? "Module adaptive/mod.rs existe"

[ -f "core/backend/system/adaptive/collect.rs" ]
check $? "Module adaptive/collect.rs existe"

[ -f "core/backend/system/adaptive/compute.rs" ]
check $? "Module adaptive/compute.rs existe"

grep -q "pub struct AdaptiveIntelligenceState" core/backend/system/adaptive/mod.rs
check $? "Struct AdaptiveIntelligenceState définie"

grep -q "pub adaptation_score: f32" core/backend/system/adaptive/mod.rs
check $? "Champ adaptation_score (f32)"

grep -q "pub plasticity_level: f32" core/backend/system/adaptive/mod.rs
check $? "Champ plasticity_level (f32)"

grep -q "pub cognitive_flexibility: f32" core/backend/system/adaptive/mod.rs
check $? "Champ cognitive_flexibility (f32)"

grep -q "pub struct AdaptiveInputs" core/backend/system/adaptive/collect.rs
check $? "Struct AdaptiveInputs définie"

grep -q "pub fn compute_adaptive(" core/backend/system/adaptive/compute.rs
check $? "Fonction compute_adaptive() présente"

echo ""

# ============================================
# SECTION 5: EVOLUTION ENGINE (#35)
# ============================================
echo "📦 Section 5: Evolution Engine"
echo "------------------------------"

[ -f "core/backend/system/evolution/mod.rs" ]
check $? "Module evolution/mod.rs existe"

[ -f "core/backend/system/evolution/collect.rs" ]
check $? "Module evolution/collect.rs existe"

[ -f "core/backend/system/evolution/compute.rs" ]
check $? "Module evolution/compute.rs existe"

[ -f "core/backend/system/evolution/history.rs" ]
check $? "Module evolution/history.rs existe"

grep -q "pub struct EvolutionState" core/backend/system/evolution/mod.rs
check $? "Struct EvolutionState définie"

grep -q "pub evolution_momentum: f32" core/backend/system/evolution/mod.rs
check $? "Champ evolution_momentum (f32)"

grep -q "pub growth_potential: f32" core/backend/system/evolution/mod.rs
check $? "Champ growth_potential (f32)"

grep -q "pub trajectory_stability: f32" core/backend/system/evolution/mod.rs
check $? "Champ trajectory_stability (f32)"

grep -q "pub struct EvolutionHistory" core/backend/system/evolution/history.rs
check $? "Struct EvolutionHistory définie"

grep -q "pub fn trend(&self)" core/backend/system/evolution/history.rs
check $? "Fonction trend() présente"

grep -q "pub struct EvolutionInputs" core/backend/system/evolution/collect.rs
check $? "Struct EvolutionInputs définie"

grep -q "pub fn compute_evolution(" core/backend/system/evolution/compute.rs
check $? "Fonction compute_evolution() présente"

echo ""

# ============================================
# SECTION 6: INTÉGRATION SYSTÈME
# ============================================
echo "🔗 Section 6: Intégration Système"
echo "----------------------------------"

# Exports dans system/mod.rs
grep -q "pub mod metacortex;" core/backend/system/mod.rs
check $? "Export metacortex dans system/mod.rs"

grep -q "pub mod governor;" core/backend/system/mod.rs
check $? "Export governor dans system/mod.rs"

grep -q "pub mod conscience;" core/backend/system/mod.rs
check $? "Export conscience dans system/mod.rs"

grep -q "pub mod adaptive;" core/backend/system/mod.rs
check $? "Export adaptive dans system/mod.rs"

grep -q "pub mod evolution;" core/backend/system/mod.rs
check $? "Export evolution dans system/mod.rs"

# Imports dans main.rs
grep -q "metacortex::MetaCortexState" core/backend/main.rs
check $? "Import MetaCortexState dans main.rs"

grep -q "governor::GovernorState" core/backend/main.rs
check $? "Import GovernorState dans main.rs"

grep -q "conscience::ConscienceState" core/backend/main.rs
check $? "Import ConscienceState dans main.rs"

grep -q "adaptive::AdaptiveIntelligenceState" core/backend/main.rs
check $? "Import AdaptiveIntelligenceState dans main.rs"

grep -q "evolution::EvolutionState" core/backend/main.rs
check $? "Import EvolutionState dans main.rs"

# Champs dans TitaneCore struct
grep -q "metacortex: Arc<Mutex<MetaCortexState>>" core/backend/main.rs
check $? "Champ metacortex dans TitaneCore"

grep -q "governor: Arc<Mutex<GovernorState>>" core/backend/main.rs
check $? "Champ governor dans TitaneCore"

grep -q "conscience: Arc<Mutex<ConscienceState>>" core/backend/main.rs
check $? "Champ conscience dans TitaneCore"

grep -q "adaptive: Arc<Mutex<AdaptiveIntelligenceState>>" core/backend/main.rs
check $? "Champ adaptive dans TitaneCore"

grep -q "evolution: Arc<Mutex<EvolutionState>>" core/backend/main.rs
check $? "Champ evolution dans TitaneCore"

grep -q "evolution_history: Arc<Mutex<system::evolution::EvolutionHistory>>" core/backend/main.rs
check $? "Champ evolution_history dans TitaneCore"

# Initialisation
grep -q "system::metacortex::init()" core/backend/main.rs
check $? "Init metacortex dans TitaneCore::new()"

grep -q "system::governor::init()" core/backend/main.rs
check $? "Init governor dans TitaneCore::new()"

grep -q "system::conscience::init()" core/backend/main.rs
check $? "Init conscience dans TitaneCore::new()"

grep -q "system::adaptive::init()" core/backend/main.rs
check $? "Init adaptive dans TitaneCore::new()"

grep -q "system::evolution::init()" core/backend/main.rs
check $? "Init evolution dans TitaneCore::new()"

# Ticks scheduler
grep -q "system::metacortex::tick(" core/backend/main.rs
check $? "Tick metacortex dans scheduler"

grep -q "system::governor::tick(" core/backend/main.rs
check $? "Tick governor dans scheduler"

grep -q "system::conscience::tick(" core/backend/main.rs
check $? "Tick conscience dans scheduler"

grep -q "system::adaptive::tick(" core/backend/main.rs
check $? "Tick adaptive dans scheduler"

grep -q "system::evolution::tick(" core/backend/main.rs
check $? "Tick evolution dans scheduler"

echo ""

# ============================================
# SECTION 7: QUALITÉ & COHÉRENCE
# ============================================
echo "🔍 Section 7: Qualité & Cohérence"
echo "----------------------------------"

# Clamp présent dans tous les modules
grep -q "clamp(0.0, 1.0)" core/backend/system/metacortex/compute.rs
check $? "MetaCortex utilise clamp [0.0, 1.0]"

grep -q "clamp(0.0, 1.0)" core/backend/system/governor/compute.rs
check $? "Governor utilise clamp [0.0, 1.0]"

grep -q "clamp(0.0, 1.0)" core/backend/system/conscience/compute.rs
check $? "Conscience utilise clamp [0.0, 1.0]"

grep -q "clamp(0.0, 1.0)" core/backend/system/adaptive/compute.rs
check $? "Adaptive utilise clamp [0.0, 1.0]"

grep -q "clamp(0.0, 1.0)" core/backend/system/evolution/compute.rs
check $? "Evolution utilise clamp [0.0, 1.0]"

# Smooth transition 70/30
grep -q "0.7.*0.3" core/backend/system/metacortex/mod.rs
check $? "MetaCortex utilise lissage 70/30"

grep -q "0.7.*0.3" core/backend/system/governor/mod.rs
check $? "Governor utilise lissage 70/30"

grep -q "0.7.*0.3" core/backend/system/conscience/mod.rs
check $? "Conscience utilise lissage 70/30"

grep -q "0.7.*0.3" core/backend/system/adaptive/mod.rs
check $? "Adaptive utilise lissage 70/30"

grep -q "0.7.*0.3" core/backend/system/evolution/mod.rs
check $? "Evolution utilise lissage 70/30"

# Tests présents
grep -q "#\[test\]" core/backend/system/metacortex/mod.rs
check $? "Tests présents dans metacortex/mod.rs"

grep -q "#\[test\]" core/backend/system/governor/mod.rs
check $? "Tests présents dans governor/mod.rs"

grep -q "#\[test\]" core/backend/system/conscience/mod.rs
check $? "Tests présents dans conscience/mod.rs"

grep -q "#\[test\]" core/backend/system/adaptive/mod.rs
check $? "Tests présents dans adaptive/mod.rs"

grep -q "#\[test\]" core/backend/system/evolution/mod.rs
check $? "Tests présents dans evolution/mod.rs"

echo ""

# ============================================
# SECTION 8: MÉTRIQUES FINALES
# ============================================
echo "📊 Section 8: Métriques Finales"
echo "--------------------------------"

# Compter lignes par module
METACORTEX_LINES=$(cat core/backend/system/metacortex/*.rs 2>/dev/null | wc -l)
echo "MetaCortex Engine: ${METACORTEX_LINES} lignes"

GOVERNOR_LINES=$(cat core/backend/system/governor/*.rs 2>/dev/null | wc -l)
echo "Governor Engine: ${GOVERNOR_LINES} lignes"

CONSCIENCE_LINES=$(cat core/backend/system/conscience/*.rs 2>/dev/null | wc -l)
echo "Conscience Engine: ${CONSCIENCE_LINES} lignes"

ADAPTIVE_LINES=$(cat core/backend/system/adaptive/*.rs 2>/dev/null | wc -l)
echo "Adaptive Intelligence Engine: ${ADAPTIVE_LINES} lignes"

EVOLUTION_LINES=$(cat core/backend/system/evolution/*.rs 2>/dev/null | wc -l)
echo "Evolution Engine: ${EVOLUTION_LINES} lignes"

# Compter tests par module
METACORTEX_TESTS=$(grep -r "#\[test\]" core/backend/system/metacortex/ 2>/dev/null | wc -l)
echo "MetaCortex Engine: ${METACORTEX_TESTS} tests"

GOVERNOR_TESTS=$(grep -r "#\[test\]" core/backend/system/governor/ 2>/dev/null | wc -l)
echo "Governor Engine: ${GOVERNOR_TESTS} tests"

CONSCIENCE_TESTS=$(grep -r "#\[test\]" core/backend/system/conscience/ 2>/dev/null | wc -l)
echo "Conscience Engine: ${CONSCIENCE_TESTS} tests"

ADAPTIVE_TESTS=$(grep -r "#\[test\]" core/backend/system/adaptive/ 2>/dev/null | wc -l)
echo "Adaptive Intelligence Engine: ${ADAPTIVE_TESTS} tests"

EVOLUTION_TESTS=$(grep -r "#\[test\]" core/backend/system/evolution/ 2>/dev/null | wc -l)
echo "Evolution Engine: ${EVOLUTION_TESTS} tests"

TOTAL_LINES=$((METACORTEX_LINES + GOVERNOR_LINES + CONSCIENCE_LINES + ADAPTIVE_LINES + EVOLUTION_LINES))
TOTAL_TESTS=$((METACORTEX_TESTS + GOVERNOR_TESTS + CONSCIENCE_TESTS + ADAPTIVE_TESTS + EVOLUTION_TESTS))

echo ""
echo "Total Cognitive Stack: ${TOTAL_LINES} lignes, ${TOTAL_TESTS} tests"

[ $METACORTEX_LINES -gt 500 ]
check $? "MetaCortex > 500 lignes"

[ $GOVERNOR_LINES -gt 300 ]
check $? "Governor > 300 lignes"

[ $CONSCIENCE_LINES -gt 400 ]
check $? "Conscience > 400 lignes"

[ $ADAPTIVE_LINES -gt 400 ]
check $? "Adaptive > 400 lignes"

[ $EVOLUTION_LINES -gt 600 ]
check $? "Evolution > 600 lignes"

[ $TOTAL_TESTS -ge 80 ]
check $? "Total >= 80 tests"

echo ""
echo "=========================================="
echo "RÉSULTAT: ${PASSED_CHECKS}/${TOTAL_CHECKS} checks passed"
echo "=========================================="

if [ $PASSED_CHECKS -eq $TOTAL_CHECKS ]; then
    echo -e "${GREEN}✅ Validation EXCELLENTE - Cognitive Stack complètement intégrée${NC}"
    exit 0
else
    FAILED=$((TOTAL_CHECKS - PASSED_CHECKS))
    echo -e "${RED}❌ Validation ÉCHOUÉE - ${FAILED} checks en échec${NC}"
    exit 1
fi
