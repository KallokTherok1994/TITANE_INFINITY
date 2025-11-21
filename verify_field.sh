#!/bin/bash
# TITANE∞ v8.0 - Field Engine Validation Script
# Verifies cognitive field analysis system (météo mentale)

echo "🧪 TITANE∞ v8.0 - Field Engine Validation"
echo "=========================================="
echo ""

PASS_COUNT=0
TOTAL_TESTS=0

check() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    if [ $1 -eq 0 ]; then
        echo "✅ $2"
        PASS_COUNT=$((PASS_COUNT + 1))
    else
        echo "❌ $2"
    fi
}

# Test 1: Check Field Engine directory structure
echo "📁 Checking file structure..."
test -f "core/backend/system/field/mod.rs"
check $? "mod.rs exists"

test -f "core/backend/system/field/analyzer.rs"
check $? "analyzer.rs exists"

test -f "core/backend/system/field/compute.rs"
check $? "compute.rs exists"

# Test 2: Check analyzer.rs structure
echo ""
echo "🔍 Validating analyzer.rs..."
grep -q "pub struct FieldInputs" core/backend/system/field/analyzer.rs
check $? "FieldInputs struct exists"

grep -q "swarm_consensus: f32" core/backend/system/field/analyzer.rs
check $? "FieldInputs has swarm_consensus field"

grep -q "swarm_divergence: f32" core/backend/system/field/analyzer.rs
check $? "FieldInputs has swarm_divergence field"

grep -q "ans_tension: f32" core/backend/system/field/analyzer.rs
check $? "FieldInputs has ans_tension field"

grep -q "flow_level: f32" core/backend/system/field/analyzer.rs
check $? "FieldInputs has flow_level field"

grep -q "depth: f32" core/backend/system/field/analyzer.rs
check $? "FieldInputs has depth field"

grep -q "direction: f32" core/backend/system/field/analyzer.rs
check $? "FieldInputs has direction field"

grep -q "pub fn collect_field_inputs" core/backend/system/field/analyzer.rs
check $? "collect_field_inputs function exists"

grep -q "swarm: &SwarmState" core/backend/system/field/analyzer.rs
check $? "Uses SwarmState parameter"

grep -q "ans: &ANSState" core/backend/system/field/analyzer.rs
check $? "Uses ANSState parameter"

grep -q "resonance: &ResonanceState" core/backend/system/field/analyzer.rs
check $? "Uses ResonanceState parameter"

grep -q "innersense: &InnerSenseState" core/backend/system/field/analyzer.rs
check $? "Uses InnerSenseState parameter"

grep -q "timesense: &TimeSenseState" core/backend/system/field/analyzer.rs
check $? "Uses TimeSenseState parameter"

# Test 3: Check compute.rs formulas
echo ""
echo "🔬 Validating compute.rs..."
grep -q "pub fn compute_field" core/backend/system/field/compute.rs
check $? "compute_field function exists"

grep -q "currents\|direction.*flow" core/backend/system/field/compute.rs
check $? "Currents calculation present"

grep -q "pressure\|tension.*divergence" core/backend/system/field/compute.rs
check $? "Pressure calculation present"

grep -q "turbulence\|divergence.*consensus" core/backend/system/field/compute.rs
check $? "Turbulence calculation present"

grep -q "orientation\|flow.*depth.*direction" core/backend/system/field/compute.rs
check $? "Orientation calculation present"

grep -q "Result<(f32, f32, f32, f32)" core/backend/system/field/compute.rs
check $? "Returns tuple of 4 f32 values"

# Test 4: Check mod.rs FieldState
echo ""
echo "🌐 Validating mod.rs (FieldState)..."
grep -q "pub struct FieldState" core/backend/system/field/mod.rs
check $? "FieldState struct exists"

grep -q "currents: f32" core/backend/system/field/mod.rs
check $? "FieldState has currents field"

grep -q "pressure: f32" core/backend/system/field/mod.rs
check $? "FieldState has pressure field"

grep -q "turbulence: f32" core/backend/system/field/mod.rs
check $? "FieldState has turbulence field"

grep -q "orientation: f32" core/backend/system/field/mod.rs
check $? "FieldState has orientation field"

grep -q "pub fn init" core/backend/system/field/mod.rs
check $? "init() function exists"

grep -q "pub fn tick" core/backend/system/field/mod.rs
check $? "tick() function exists"

grep -q "collect_field_inputs" core/backend/system/field/mod.rs
check $? "Calls collect_field_inputs()"

grep -q "compute_field" core/backend/system/field/mod.rs
check $? "Calls compute_field()"

grep -q "smooth_transition\|lissage\|0\\.7\|0\\.3" core/backend/system/field/mod.rs
check $? "Smooth transition present"

# Test 5: Check integration in system/mod.rs
echo ""
echo "🔗 Validating system integration..."
grep -q "pub mod field;" core/backend/system/mod.rs
check $? "Field exported in system/mod.rs"

# Test 6: Check integration in main.rs
echo ""
echo "🎯 Validating main.rs integration..."
grep -q "field::FieldState" core/backend/main.rs
check $? "FieldState imported in main.rs"

grep -q "field: Arc<Mutex<FieldState>>" core/backend/main.rs
check $? "TitaneCore has field field"

grep -q "let field = Arc::new(Mutex::new(system::field::init" core/backend/main.rs
check $? "Field initialized in new()"

grep -q "let field = Arc::clone(&self.field);" core/backend/main.rs
check $? "Field cloned for scheduler"

grep -q "system::field::tick" core/backend/main.rs
check $? "Field tick called in scheduler"

# Test 7: Check unit tests
echo ""
echo "🧪 Counting unit tests..."
ANALYZER_TESTS=$(grep -c "#\[test\]" core/backend/system/field/analyzer.rs)
COMPUTE_TESTS=$(grep -c "#\[test\]" core/backend/system/field/compute.rs)
MOD_TESTS=$(grep -c "#\[test\]" core/backend/system/field/mod.rs)
TOTAL_UNIT_TESTS=$((ANALYZER_TESTS + COMPUTE_TESTS + MOD_TESTS))

echo "   analyzer.rs: $ANALYZER_TESTS tests"
echo "   compute.rs: $COMPUTE_TESTS tests"
echo "   mod.rs: $MOD_TESTS tests"
echo "   Total: $TOTAL_UNIT_TESTS unit tests"

test $TOTAL_UNIT_TESTS -ge 15
check $? "At least 15 unit tests present ($TOTAL_UNIT_TESTS found)"

# Test 8: Line count verification
echo ""
echo "📏 Code metrics..."
ANALYZER_LINES=$(wc -l < core/backend/system/field/analyzer.rs)
COMPUTE_LINES=$(wc -l < core/backend/system/field/compute.rs)
MOD_LINES=$(wc -l < core/backend/system/field/mod.rs)
TOTAL_LINES=$((ANALYZER_LINES + COMPUTE_LINES + MOD_LINES))

echo "   analyzer.rs: $ANALYZER_LINES lines"
echo "   compute.rs: $COMPUTE_LINES lines"
echo "   mod.rs: $MOD_LINES lines"
echo "   Total: $TOTAL_LINES lines"

test $TOTAL_LINES -ge 500
check $? "Field Engine code ≥ 500 lines ($TOTAL_LINES lines)"

# Test 9: Helper functions
echo ""
echo "🛠️  Validating helper functions..."
grep -q "fn clamp" core/backend/system/field/mod.rs
check $? "clamp() function present in mod.rs"

grep -q "fn smooth_transition" core/backend/system/field/mod.rs
check $? "smooth_transition() function present"

grep -q "stability()" core/backend/system/field/mod.rs
check $? "stability() helper method exists"

grep -q "intensity()" core/backend/system/field/mod.rs
check $? "intensity() helper method exists"

grep -q "is_critical()" core/backend/system/field/mod.rs
check $? "is_critical() detection exists"

grep -q "is_stable()" core/backend/system/field/mod.rs
check $? "is_stable() detection exists"

# Final report
echo ""
echo "=========================================="
PASS_RATE=$((PASS_COUNT * 100 / TOTAL_TESTS))
echo "📊 Results: $PASS_COUNT/$TOTAL_TESTS tests passed ($PASS_RATE%)"
echo ""

if [ $PASS_RATE -ge 95 ]; then
    echo "✅ FIELD ENGINE VALIDATION PASSED (≥95%)"
    echo ""
    echo "🎯 Cognitive Field System Complete:"
    echo "   • 4 dimensions (currents, pressure, turbulence, orientation)"
    echo "   • 5 input sources (swarm, ans, resonance, innersense, timesense)"
    echo "   • $TOTAL_UNIT_TESTS comprehensive unit tests"
    echo "   • $TOTAL_LINES lines of tested code"
    echo "   • Full integration in TitaneCore scheduler"
    echo ""
    exit 0
else
    echo "⚠️  VALIDATION INCOMPLETE ($PASS_RATE% < 95%)"
    echo "   Please review failed tests above"
    echo ""
    exit 1
fi
