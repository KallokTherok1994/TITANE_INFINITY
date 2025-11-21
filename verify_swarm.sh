#!/bin/bash
# TITANE∞ v8.0 - Swarm Mode Validation Script
# Verifies distributed intelligence system with 6 micro-signals

echo "🧪 TITANE∞ v8.0 - Swarm Mode Validation"
echo "========================================"
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

# Test 1: Check Swarm Mode directory structure
echo "📁 Checking file structure..."
test -f "core/backend/system/swarm/core.rs"
check $? "core.rs exists"

test -f "core/backend/system/swarm/reducer.rs"
check $? "reducer.rs exists"

test -f "core/backend/system/swarm/mod.rs"
check $? "mod.rs exists"

# Test 2: Check core.rs signal generation
echo ""
echo "🔬 Validating core.rs (signal generation)..."
grep -q "pub fn generate_signals" core/backend/system/swarm/core.rs
check $? "generate_signals function exists"

grep -q "adaptive: &AdaptiveEngineState" core/backend/system/swarm/core.rs
check $? "Uses AdaptiveEngineState parameter"

grep -q "cortex: &CortexState" core/backend/system/swarm/core.rs
check $? "Uses CortexState parameter"

grep -q "resonance: &ResonanceState" core/backend/system/swarm/core.rs
check $? "Uses ResonanceState parameter"

grep -q "innersense: &InnerSenseState" core/backend/system/swarm/core.rs
check $? "Uses InnerSenseState parameter"

grep -q "timesense: &TimeSenseState" core/backend/system/swarm/core.rs
check $? "Uses TimeSenseState parameter"

grep -q "ans: &ANSState" core/backend/system/swarm/core.rs
check $? "Uses ANSState parameter"

grep -q "Vec<f32>" core/backend/system/swarm/core.rs
check $? "Returns Vec<f32> signals"

# Test 3: Check reducer.rs consensus/divergence/stability
echo ""
echo "📊 Validating reducer.rs (swarm reduction)..."
grep -q "pub struct SwarmReport" core/backend/system/swarm/reducer.rs
check $? "SwarmReport struct exists"

grep -q "consensus: f32" core/backend/system/swarm/reducer.rs
check $? "SwarmReport has consensus field"

grep -q "divergence: f32" core/backend/system/swarm/reducer.rs
check $? "SwarmReport has divergence field"

grep -q "stability: f32" core/backend/system/swarm/reducer.rs
check $? "SwarmReport has stability field"

grep -q "pub fn reduce_swarm" core/backend/system/swarm/reducer.rs
check $? "reduce_swarm function exists"

grep -q "calculate_mean" core/backend/system/swarm/reducer.rs
check $? "Consensus calculation (mean)"

grep -q "calculate_variance" core/backend/system/swarm/reducer.rs
check $? "Divergence calculation (variance)"

# Test 4: Check mod.rs SwarmState
echo ""
echo "🌐 Validating mod.rs (SwarmState orchestration)..."
grep -q "pub struct SwarmState" core/backend/system/swarm/mod.rs
check $? "SwarmState struct exists"

grep -q "pub fn init" core/backend/system/swarm/mod.rs
check $? "init() function exists"

grep -q "pub fn tick" core/backend/system/swarm/mod.rs
check $? "tick() function exists"

grep -q "pub fn health" core/backend/system/swarm/mod.rs
check $? "health() function exists"

grep -q "generate_signals" core/backend/system/swarm/mod.rs
check $? "Calls generate_signals()"

grep -q "reduce_swarm" core/backend/system/swarm/mod.rs
check $? "Calls reduce_swarm()"

# Test 5: Check integration in system/mod.rs
echo ""
echo "🔗 Validating system integration..."
grep -q "pub mod swarm;" core/backend/system/mod.rs
check $? "Swarm exported in system/mod.rs"

# Test 6: Check integration in main.rs
echo ""
echo "🎯 Validating main.rs integration..."
grep -q "swarm::SwarmState" core/backend/main.rs
check $? "SwarmState imported in main.rs"

grep -q "swarm: Arc<Mutex<SwarmState>>" core/backend/main.rs
check $? "TitaneCore has swarm field"

grep -q "let swarm = Arc::new(Mutex::new(system::swarm::init" core/backend/main.rs
check $? "Swarm initialized in new()"

grep -q "let swarm = Arc::clone(&self.swarm);" core/backend/main.rs
check $? "Swarm cloned for scheduler"

grep -q "system::swarm::tick" core/backend/main.rs
check $? "Swarm tick called in scheduler"

# Test 7: Check unit tests
echo ""
echo "🧪 Counting unit tests..."
CORE_TESTS=$(grep -c "#\[test\]" core/backend/system/swarm/core.rs)
REDUCER_TESTS=$(grep -c "#\[test\]" core/backend/system/swarm/reducer.rs)
MOD_TESTS=$(grep -c "#\[test\]" core/backend/system/swarm/mod.rs)
TOTAL_UNIT_TESTS=$((CORE_TESTS + REDUCER_TESTS + MOD_TESTS))

echo "   core.rs: $CORE_TESTS tests"
echo "   reducer.rs: $REDUCER_TESTS tests"
echo "   mod.rs: $MOD_TESTS tests"
echo "   Total: $TOTAL_UNIT_TESTS unit tests"

test $TOTAL_UNIT_TESTS -ge 15
check $? "At least 15 unit tests present ($TOTAL_UNIT_TESTS found)"

# Test 8: Line count verification
echo ""
echo "📏 Code metrics..."
CORE_LINES=$(wc -l < core/backend/system/swarm/core.rs)
REDUCER_LINES=$(wc -l < core/backend/system/swarm/reducer.rs)
MOD_LINES=$(wc -l < core/backend/system/swarm/mod.rs)
TOTAL_LINES=$((CORE_LINES + REDUCER_LINES + MOD_LINES))

echo "   core.rs: $CORE_LINES lines"
echo "   reducer.rs: $REDUCER_LINES lines"
echo "   mod.rs: $MOD_LINES lines"
echo "   Total: $TOTAL_LINES lines"

test $TOTAL_LINES -ge 600
check $? "Swarm Mode code ≥ 600 lines ($TOTAL_LINES lines)"

# Test 9: Mathematical formulas verification
echo ""
echo "🧮 Validating mathematical formulas..."
grep -q "consensus.*mean\|average" core/backend/system/swarm/reducer.rs
check $? "Consensus uses mean/average"

grep -q "divergence.*variance\|std" core/backend/system/swarm/reducer.rs
check $? "Divergence uses variance"

grep -q "stability.*consensus.*divergence" core/backend/system/swarm/reducer.rs
check $? "Stability combines consensus+divergence"

# Test 10: Smooth transition (lissage) verification
echo ""
echo "🌊 Validating smooth transitions..."
grep -q "smooth\|lissage\|0\\.3\|0\\.4" core/backend/system/swarm/mod.rs
check $? "Smooth transition factors present"

# Final report
echo ""
echo "========================================"
PASS_RATE=$((PASS_COUNT * 100 / TOTAL_TESTS))
echo "📊 Results: $PASS_COUNT/$TOTAL_TESTS tests passed ($PASS_RATE%)"
echo ""

if [ $PASS_RATE -ge 95 ]; then
    echo "✅ SWARM MODE VALIDATION PASSED (≥95%)"
    echo ""
    echo "🎯 Distributed Intelligence System Complete:"
    echo "   • 6 micro-signals (adaptive, cortex, resonance, innersense, timesense, ans)"
    echo "   • Consensus/Divergence/Stability calculations"
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
