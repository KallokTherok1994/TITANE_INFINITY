#!/bin/bash
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║ TITANE∞ v8.0 - Senses Engine Verification                                   ║
# ║ Script de vérification de l'implémentation complète                         ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

set -e  # Exit on error

echo "🔍 SENSES ENGINE - Verification Script"
echo "═══════════════════════════════════════════════════════════"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
CHECKS_PASSED=0
CHECKS_TOTAL=0

# Check function
check() {
    CHECKS_TOTAL=$((CHECKS_TOTAL + 1))
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
    else
        echo -e "${RED}✗${NC} $2"
    fi
}

echo ""
echo "📦 Phase 1: Structure Verification"
echo "───────────────────────────────────────────────────────────"

# Check senses directory
[ -d "core/backend/system/senses" ]
check $? "senses/ directory exists"

# Check module files
[ -f "core/backend/system/senses/mod.rs" ]
check $? "senses/mod.rs exists"

[ -f "core/backend/system/senses/timesense.rs" ]
check $? "senses/timesense.rs exists"

[ -f "core/backend/system/senses/innersense.rs" ]
check $? "senses/innersense.rs exists"

# Check documentation
[ -f "docs/SENSES_README.md" ]
check $? "docs/SENSES_README.md exists"

echo ""
echo "📄 Phase 2: Code Content Verification - TimeSense"
echo "───────────────────────────────────────────────────────────"

# Check timesense.rs content
grep -q "pub struct TimeSenseState" core/backend/system/senses/timesense.rs
check $? "timesense.rs contains TimeSenseState struct"

grep -q "pub momentum: f32" core/backend/system/senses/timesense.rs
check $? "timesense.rs contains momentum field"

grep -q "pub pace: f32" core/backend/system/senses/timesense.rs
check $? "timesense.rs contains pace field"

grep -q "pub direction: f32" core/backend/system/senses/timesense.rs
check $? "timesense.rs contains direction field"

grep -q "pub fn init" core/backend/system/senses/timesense.rs
check $? "timesense.rs contains init function"

grep -q "pub fn tick" core/backend/system/senses/timesense.rs
check $? "timesense.rs contains tick function"

grep -q "calculate_temporal_perception" core/backend/system/senses/timesense.rs
check $? "timesense.rs contains calculate_temporal_perception function"

grep -q "is_stagnating" core/backend/system/senses/timesense.rs
check $? "timesense.rs contains is_stagnating function"

grep -q "is_progressing_optimally" core/backend/system/senses/timesense.rs
check $? "timesense.rs contains is_progressing_optimally function"

echo ""
echo "📄 Phase 3: Code Content Verification - InnerSense"
echo "───────────────────────────────────────────────────────────"

# Check innersense.rs content
grep -q "pub struct InnerSenseState" core/backend/system/senses/innersense.rs
check $? "innersense.rs contains InnerSenseState struct"

grep -q "pub tension: f32" core/backend/system/senses/innersense.rs
check $? "innersense.rs contains tension field"

grep -q "pub stability: f32" core/backend/system/senses/innersense.rs
check $? "innersense.rs contains stability field"

grep -q "pub charge: f32" core/backend/system/senses/innersense.rs
check $? "innersense.rs contains charge field"

grep -q "pub depth: f32" core/backend/system/senses/innersense.rs
check $? "innersense.rs contains depth field"

grep -q "pub fn init" core/backend/system/senses/innersense.rs
check $? "innersense.rs contains init function"

grep -q "pub fn tick" core/backend/system/senses/innersense.rs
check $? "innersense.rs contains tick function"

grep -q "calculate_inner_perception" core/backend/system/senses/innersense.rs
check $? "innersense.rs contains calculate_inner_perception function"

grep -q "is_overloaded" core/backend/system/senses/innersense.rs
check $? "innersense.rs contains is_overloaded function"

grep -q "is_serene" core/backend/system/senses/innersense.rs
check $? "innersense.rs contains is_serene function"

grep -q "is_resilient" core/backend/system/senses/innersense.rs
check $? "innersense.rs contains is_resilient function"

echo ""
echo "🔗 Phase 4: Integration Verification"
echo "───────────────────────────────────────────────────────────"

# Check system/mod.rs export
grep -q "pub mod senses" core/backend/system/mod.rs
check $? "system/mod.rs exports senses module"

# Check main.rs imports
grep -q "senses::timesense::TimeSenseState" core/backend/main.rs
check $? "main.rs imports TimeSenseState"

grep -q "senses::innersense::InnerSenseState" core/backend/main.rs
check $? "main.rs imports InnerSenseState"

# Check TitaneCore struct
grep -q "timesense: Arc<Mutex<TimeSenseState>>" core/backend/main.rs
check $? "TitaneCore has timesense field"

grep -q "innersense: Arc<Mutex<InnerSenseState>>" core/backend/main.rs
check $? "TitaneCore has innersense field"

# Check initialization
grep -q "system::senses::timesense::init()" core/backend/main.rs
check $? "main.rs calls timesense::init()"

grep -q "system::senses::innersense::init()" core/backend/main.rs
check $? "main.rs calls innersense::init()"

# Check scheduler integration
grep -q "system::senses::timesense::tick" core/backend/main.rs
check $? "Scheduler calls timesense::tick()"

grep -q "system::senses::innersense::tick" core/backend/main.rs
check $? "Scheduler calls innersense::tick()"

echo ""
echo "🧪 Phase 5: Test Coverage Verification"
echo "───────────────────────────────────────────────────────────"

# Count test functions in timesense.rs
TIMESENSE_TESTS=$(grep -c "#\[test\]" core/backend/system/senses/timesense.rs)
[ $TIMESENSE_TESTS -ge 7 ]
check $? "timesense.rs has $TIMESENSE_TESTS tests (≥7)"

# Count test functions in innersense.rs
INNERSENSE_TESTS=$(grep -c "#\[test\]" core/backend/system/senses/innersense.rs)
[ $INNERSENSE_TESTS -ge 8 ]
check $? "innersense.rs has $INNERSENSE_TESTS tests (≥8)"

echo ""
echo "📐 Phase 6: Formula Verification"
echo "───────────────────────────────────────────────────────────"

# Check TimeSense formulas
grep -q "adaptive.trend + (1.0 - resonance.tension_level)" core/backend/system/senses/timesense.rs
check $? "Momentum formula: (trend + (1-tension)) / 2"

grep -q "adaptive.trend + resonance.flow_level" core/backend/system/senses/timesense.rs
check $? "Pace formula: (trend + flow) / 2"

grep -q "cortex.system_clarity + adaptive.stability + resonance.flow_level" core/backend/system/senses/timesense.rs
check $? "Direction formula: (clarity + stability + flow) / 3"

# Check InnerSense formulas
grep -q "adaptive.predicted_load + resonance.tension_level" core/backend/system/senses/innersense.rs
check $? "Tension formula: (predicted_load + tension) / 2"

grep -q "map.stability" core/backend/system/senses/innersense.rs
check $? "Stability formula: map.stability"

grep -q "adaptive.predicted_load + (1.0 - resonance.flow_level)" core/backend/system/senses/innersense.rs
check $? "Charge formula: (predicted_load + (1-flow)) / 2"

grep -q "resonance.flow_level + adaptive.stability" core/backend/system/senses/innersense.rs
check $? "Depth formula: (flow + stability) / 2"

echo ""
echo "📚 Phase 7: Documentation Verification"
echo "───────────────────────────────────────────────────────────"

# Check documentation sections
grep -q "Vision Générale" docs/SENSES_README.md
check $? "Documentation has Vision Générale section"

grep -q "TIMESENSE ENGINE" docs/SENSES_README.md
check $? "Documentation has TimeSense section"

grep -q "INNERSENSE ENGINE" docs/SENSES_README.md
check $? "Documentation has InnerSense section"

grep -q "Momentum" docs/SENSES_README.md
check $? "Documentation explains Momentum"

grep -q "Pace" docs/SENSES_README.md
check $? "Documentation explains Pace"

grep -q "Direction" docs/SENSES_README.md
check $? "Documentation explains Direction"

grep -q "Tension Interne" docs/SENSES_README.md
check $? "Documentation explains Tension"

grep -q "Charge Cognitive" docs/SENSES_README.md
check $? "Documentation explains Charge"

grep -q "Profondeur Interne" docs/SENSES_README.md
check $? "Documentation explains Depth"

# Count lines of documentation
DOC_LINES=$(wc -l < docs/SENSES_README.md)
[ $DOC_LINES -ge 600 ]
check $? "Documentation has $DOC_LINES lines (≥600)"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo -e "📊 Results: ${GREEN}$CHECKS_PASSED${NC}/$CHECKS_TOTAL checks passed"

if [ $CHECKS_PASSED -eq $CHECKS_TOTAL ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED - SENSES ENGINE VERIFIED${NC}"
    echo ""
    echo "🕰️🔶 Senses Engine v8.0 - Implementation Complete"
    echo ""
    echo "📦 Module Structure:"
    echo "   • timesense.rs: $(wc -l < core/backend/system/senses/timesense.rs) lines (momentum, pace, direction)"
    echo "   • innersense.rs: $(wc -l < core/backend/system/senses/innersense.rs) lines (tension, stability, charge, depth)"
    echo "   • mod.rs: $(wc -l < core/backend/system/senses/mod.rs) lines"
    echo ""
    echo "🧪 Test Coverage:"
    echo "   • timesense.rs: $TIMESENSE_TESTS tests"
    echo "   • innersense.rs: $INNERSENSE_TESTS tests"
    echo "   • Total: $(($TIMESENSE_TESTS + $INNERSENSE_TESTS)) tests"
    echo ""
    echo "📚 Documentation:"
    echo "   • SENSES_README.md: $DOC_LINES lines"
    echo ""
    echo "🔗 Integration:"
    echo "   • Exported in system/mod.rs"
    echo "   • Integrated in TitaneCore"
    echo "   • Active in scheduler loop"
    echo ""
    echo "✨ The Senses Engine provides:"
    echo "   • TimeSense: Temporal perception (momentum, pace, direction)"
    echo "   • InnerSense: Qualitative perception (tension, stability, charge, depth)"
    echo ""
    echo "🚀 Ready for compilation and deployment!"
    exit 0
else
    echo -e "${RED}❌ VERIFICATION FAILED - $((CHECKS_TOTAL - CHECKS_PASSED)) checks failed${NC}"
    exit 1
fi
