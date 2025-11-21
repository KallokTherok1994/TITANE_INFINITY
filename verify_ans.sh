#!/bin/bash
# TITANE∞ v8.0 - ANS Verification Script
# Validates ANS (Autonomic Nervous System) implementation

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

check() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}✗${NC} $2"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
}

echo "🔍 ANS (AUTONOMIC NERVOUS SYSTEM) - Verification Script"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Get base directory
BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$BASE_DIR"

# ============================================
# Phase 1: Structure Verification
# ============================================
echo "📦 Phase 1: Structure Verification"
echo "───────────────────────────────────────────────────────────"

[ -d "core/backend/system/ans" ]
check $? "ans/ directory exists"

[ -f "core/backend/system/ans/mod.rs" ]
check $? "ans/mod.rs exists"

[ -f "docs/ANS_README.md" ]
check $? "docs/ANS_README.md exists"

echo ""

# ============================================
# Phase 2: Code Content Verification
# ============================================
echo "📄 Phase 2: Code Content Verification"
echo "───────────────────────────────────────────────────────────"

# Check ANSState struct
grep -q "pub struct ANSState" core/backend/system/ans/mod.rs
check $? "mod.rs contains ANSState struct"

grep -q "pub regulation_mode: RegulationMode" core/backend/system/ans/mod.rs
check $? "mod.rs contains regulation_mode field"

grep -q "pub homeostasis: f64" core/backend/system/ans/mod.rs
check $? "mod.rs contains homeostasis field"

grep -q "pub sympathetic_activation: f64" core/backend/system/ans/mod.rs
check $? "mod.rs contains sympathetic_activation field"

grep -q "pub parasympathetic_activation: f64" core/backend/system/ans/mod.rs
check $? "mod.rs contains parasympathetic_activation field"

grep -q "pub autonomic_balance: f64" core/backend/system/ans/mod.rs
check $? "mod.rs contains autonomic_balance field"

grep -q "pub system_variability: f64" core/backend/system/ans/mod.rs
check $? "mod.rs contains system_variability field"

grep -q "pub adaptive_capacity: f64" core/backend/system/ans/mod.rs
check $? "mod.rs contains adaptive_capacity field"

grep -q "pub autonomous_decisions: Vec<AutonomousDecision>" core/backend/system/ans/mod.rs
check $? "mod.rs contains autonomous_decisions field"

# Check RegulationMode enum
grep -q "pub enum RegulationMode" core/backend/system/ans/mod.rs
check $? "mod.rs contains RegulationMode enum"

grep -q "Rest" core/backend/system/ans/mod.rs
check $? "RegulationMode has Rest variant"

grep -q "Balanced" core/backend/system/ans/mod.rs
check $? "RegulationMode has Balanced variant"

grep -q "Alert" core/backend/system/ans/mod.rs
check $? "RegulationMode has Alert variant"

grep -q "Stress" core/backend/system/ans/mod.rs
check $? "RegulationMode has Stress variant"

grep -q "Recovery" core/backend/system/ans/mod.rs
check $? "RegulationMode has Recovery variant"

# Check AutonomousDecision struct
grep -q "pub struct AutonomousDecision" core/backend/system/ans/mod.rs
check $? "mod.rs contains AutonomousDecision struct"

grep -q "pub decision_type: DecisionType" core/backend/system/ans/mod.rs
check $? "AutonomousDecision has decision_type field"

grep -q "pub rationale: String" core/backend/system/ans/mod.rs
check $? "AutonomousDecision has rationale field"

grep -q "pub confidence: f64" core/backend/system/ans/mod.rs
check $? "AutonomousDecision has confidence field"

grep -q "pub expected_impact: ImpactLevel" core/backend/system/ans/mod.rs
check $? "AutonomousDecision has expected_impact field"

# Check DecisionType enum
grep -q "pub enum DecisionType" core/backend/system/ans/mod.rs
check $? "mod.rs contains DecisionType enum"

grep -q "IncreaseResources" core/backend/system/ans/mod.rs
check $? "DecisionType has IncreaseResources variant"

grep -q "ReduceLoad" core/backend/system/ans/mod.rs
check $? "DecisionType has ReduceLoad variant"

grep -q "ActivateRest" core/backend/system/ans/mod.rs
check $? "DecisionType has ActivateRest variant"

grep -q "ActivateAlert" core/backend/system/ans/mod.rs
check $? "DecisionType has ActivateAlert variant"

grep -q "TriggerRecovery" core/backend/system/ans/mod.rs
check $? "DecisionType has TriggerRecovery variant"

grep -q "MaintainBalance" core/backend/system/ans/mod.rs
check $? "DecisionType has MaintainBalance variant"

grep -q "EmergencyIntervention" core/backend/system/ans/mod.rs
check $? "DecisionType has EmergencyIntervention variant"

# Check core functions
grep -q "fn calculate_homeostasis" core/backend/system/ans/mod.rs
check $? "mod.rs contains calculate_homeostasis function"

grep -q "fn calculate_autonomic_balance" core/backend/system/ans/mod.rs
check $? "mod.rs contains calculate_autonomic_balance function"

grep -q "fn calculate_activations" core/backend/system/ans/mod.rs
check $? "mod.rs contains calculate_activations function"

grep -q "fn determine_regulation_mode" core/backend/system/ans/mod.rs
check $? "mod.rs contains determine_regulation_mode function"

grep -q "fn calculate_variability" core/backend/system/ans/mod.rs
check $? "mod.rs contains calculate_variability function"

grep -q "fn calculate_adaptive_capacity" core/backend/system/ans/mod.rs
check $? "mod.rs contains calculate_adaptive_capacity function"

grep -q "fn make_autonomous_decisions" core/backend/system/ans/mod.rs
check $? "mod.rs contains make_autonomous_decisions function"

# Check public API
grep -q "pub fn init()" core/backend/system/ans/mod.rs
check $? "mod.rs contains init function"

grep -q "pub fn tick(" core/backend/system/ans/mod.rs
check $? "mod.rs contains tick function"

grep -q "pub fn health(" core/backend/system/ans/mod.rs
check $? "mod.rs contains health function"

echo ""

# ============================================
# Phase 3: Integration Verification
# ============================================
echo "🔗 Phase 3: Integration Verification"
echo "───────────────────────────────────────────────────────────"

grep -q "pub mod ans;" core/backend/system/mod.rs
check $? "system/mod.rs exports ans module"

grep -q "use system::.*ans::ANSState" core/backend/main.rs
check $? "main.rs imports ANSState"

grep -q "ans: Arc<Mutex<ANSState>>" core/backend/main.rs
check $? "TitaneCore has ans field"

grep -q "let ans = system::ans::init();" core/backend/main.rs
check $? "main.rs calls ans::init()"

grep -q "system::ans::tick" core/backend/main.rs
check $? "Scheduler calls ans::tick()"

echo ""

# ============================================
# Phase 4: Test Coverage Verification
# ============================================
echo "🧪 Phase 4: Test Coverage Verification"
echo "───────────────────────────────────────────────────────────"

TEST_COUNT=$(grep -c "fn test_" core/backend/system/ans/mod.rs || echo "0")
if [ "$TEST_COUNT" -ge 15 ]; then
    check 0 "mod.rs has $TEST_COUNT tests (≥15)"
else
    check 1 "mod.rs has $TEST_COUNT tests (expected: ≥15)"
fi

# Check specific tests
grep -q "fn test_ans_initialization" core/backend/system/ans/mod.rs
check $? "test_ans_initialization exists"

grep -q "fn test_homeostasis_calculation" core/backend/system/ans/mod.rs
check $? "test_homeostasis_calculation exists"

grep -q "fn test_autonomic_balance" core/backend/system/ans/mod.rs
check $? "test_autonomic_balance exists"

grep -q "fn test_activations" core/backend/system/ans/mod.rs
check $? "test_activations exists"

grep -q "fn test_regulation_modes" core/backend/system/ans/mod.rs
check $? "test_regulation_modes exists"

grep -q "fn test_variability_calculation" core/backend/system/ans/mod.rs
check $? "test_variability_calculation exists"

grep -q "fn test_adaptive_capacity" core/backend/system/ans/mod.rs
check $? "test_adaptive_capacity exists"

grep -q "fn test_autonomous_decisions" core/backend/system/ans/mod.rs
check $? "test_autonomous_decisions exists"

grep -q "fn test_decision_expiration" core/backend/system/ans/mod.rs
check $? "test_decision_expiration exists"

grep -q "fn test_tick_integration" core/backend/system/ans/mod.rs
check $? "test_tick_integration exists"

echo ""

# ============================================
# Phase 5: Code Quality Checks
# ============================================
echo "🔍 Phase 5: Code Quality Checks"
echo "───────────────────────────────────────────────────────────"

# Count unwrap() - should be minimal (only in tests)
UNWRAP_COUNT=$(grep -c "\.unwrap()" core/backend/system/ans/mod.rs || echo "0")
if [ "$UNWRAP_COUNT" -le 20 ]; then
    check 0 "Found $UNWRAP_COUNT unwrap() calls (≤20, mostly tests)"
else
    check 1 "Found $UNWRAP_COUNT unwrap() calls (expected: ≤20)"
fi

# Count panic!() - should be zero
PANIC_COUNT=$(grep -c "panic!" core/backend/system/ans/mod.rs || echo "0")
if [ "$PANIC_COUNT" -eq 0 ]; then
    check 0 "No panic!() found (expected: 0)"
else
    check 1 "Found $PANIC_COUNT panic!() calls (expected: 0)"
fi

# Check for proper error handling
grep -q "Result<" core/backend/system/ans/mod.rs
check $? "Uses Result<> for error handling"

grep -q "map_err" core/backend/system/ans/mod.rs
check $? "Uses map_err for error propagation"

echo ""

# ============================================
# Phase 6: Documentation Verification
# ============================================
echo "📚 Phase 6: Documentation Verification"
echo "───────────────────────────────────────────────────────────"

DOC_LINES=$(wc -l < docs/ANS_README.md)
if [ "$DOC_LINES" -ge 500 ]; then
    check 0 "ANS_README.md has $DOC_LINES lines (≥500)"
else
    check 1 "ANS_README.md has $DOC_LINES lines (expected: ≥500)"
fi

grep -q "Autonomic Nervous System" docs/ANS_README.md
check $? "Documentation mentions Autonomic Nervous System"

grep -q "Homeostasis" docs/ANS_README.md
check $? "Documentation covers Homeostasis"

grep -q "RegulationMode" docs/ANS_README.md
check $? "Documentation covers RegulationMode"

grep -q "AutonomousDecision" docs/ANS_README.md
check $? "Documentation covers AutonomousDecision"

grep -q "sympathetic" docs/ANS_README.md
check $? "Documentation covers sympathetic activation"

grep -q "parasympathetic" docs/ANS_README.md
check $? "Documentation covers parasympathetic activation"

echo ""

# ============================================
# Statistics
# ============================================
echo "📊 Statistics"
echo "───────────────────────────────────────────────────────────"

# Count lines of code
RUST_LINES=$(wc -l < core/backend/system/ans/mod.rs)
echo "📝 Backend lines of code: $RUST_LINES"

# Count lines of documentation
echo "📝 Documentation lines: $DOC_LINES"

# File sizes
BACKEND_SIZE=$(du -h core/backend/system/ans/mod.rs | cut -f1)
echo "💾 Backend size: $BACKEND_SIZE"

echo ""

# ============================================
# Summary
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "Total checks:  ${BLUE}$TOTAL_CHECKS${NC}"
echo -e "Passed:        ${GREEN}$PASSED_CHECKS${NC}"
echo -e "Failed:        ${RED}$FAILED_CHECKS${NC}"
echo ""

if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "📈 Key Features:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "  🧠 Homeostasis tracking (0.0-1.0)"
    echo "  ⚖️  Autonomic balance (-1.0 → +1.0)"
    echo "  🔄 5 regulation modes (Rest/Balanced/Alert/Stress/Recovery)"
    echo "  🤖 7 decision types (autonomous actions)"
    echo "  📊 System variability & adaptive capacity"
    echo "  ⚡ Sympathetic/Parasympathetic activations"
    echo "  🧪 $TEST_COUNT unit tests"
    echo ""
    echo "📚 Documentation:"
    echo "   • ANS_README.md: $DOC_LINES lines"
    echo ""
    echo "🔗 Integration:"
    echo "   • Exported in system/mod.rs"
    echo "   • Integrated in TitaneCore"
    echo "   • Active in scheduler loop"
    echo ""
    echo "✨ The ANS provides autonomous regulation and homeostasis:"
    echo "   • Monitors system clarity, tension, alignment, stability"
    echo "   • Maintains balance between sympathetic/parasympathetic"
    echo "   • Makes autonomous decisions (7 types)"
    echo "   • Tracks system variability and adaptive capacity"
    echo ""
    echo "🚀 Ready for compilation and deployment!"
    exit 0
else
    echo -e "${RED}✗ Some checks failed!${NC}"
    echo ""
    echo "Please review the failed checks above."
    exit 1
fi
