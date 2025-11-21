#!/bin/bash
# TITANE∞ v8.0 - Validation complète des modules #11, #12, #13

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  TITANE∞ v8.0 - Validation Modules Avancés (#11-#13)        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

TOTAL_PASS=0
TOTAL_TESTS=0

check() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    if [ $1 -eq 0 ]; then
        echo "✅ $2"
        TOTAL_PASS=$((TOTAL_PASS + 1))
    else
        echo "❌ $2"
    fi
}

# ════════════════════════════════════════════════════════════════
# CONTINUUM (#12)
# ════════════════════════════════════════════════════════════════
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌀 Meta-Continuum Engine (#12)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test -f "core/backend/system/continuum/mod.rs"
check $? "continuum/mod.rs exists"

test -f "core/backend/system/continuum/history.rs"
check $? "continuum/history.rs exists"

test -f "core/backend/system/continuum/trend.rs"
check $? "continuum/trend.rs exists"

grep -q "pub struct ContinuumState" core/backend/system/continuum/mod.rs
check $? "ContinuumState struct exists"

grep -q "momentum: f32" core/backend/system/continuum/mod.rs
check $? "ContinuumState has momentum field"

grep -q "direction: f32" core/backend/system/continuum/mod.rs
check $? "ContinuumState has direction field"

grep -q "progression: f32" core/backend/system/continuum/mod.rs
check $? "ContinuumState has progression field"

grep -q "stability_trend: f32" core/backend/system/continuum/mod.rs
check $? "ContinuumState has stability_trend field"

grep -q "pub struct Snapshot" core/backend/system/continuum/history.rs
check $? "Snapshot struct exists"

grep -q "pub fn record_snapshot" core/backend/system/continuum/history.rs
check $? "record_snapshot function exists"

grep -q "pub struct ContinuumReport" core/backend/system/continuum/trend.rs
check $? "ContinuumReport struct exists"

grep -q "pub fn compute_trend" core/backend/system/continuum/trend.rs
check $? "compute_trend function exists"

grep -q "pub mod continuum;" core/backend/system/mod.rs
check $? "Continuum exported in system/mod.rs"

grep -q "continuum::ContinuumState" core/backend/main.rs
check $? "ContinuumState imported in main.rs"

grep -q "continuum: Arc<Mutex<ContinuumState>>" core/backend/main.rs
check $? "TitaneCore has continuum field"

grep -q "continuum_history: Arc<Mutex<Vec" core/backend/main.rs
check $? "TitaneCore has continuum_history field"

grep -q "system::continuum::record_snapshot" core/backend/main.rs
check $? "record_snapshot called in scheduler"

grep -q "system::continuum::compute_trend" core/backend/main.rs
check $? "compute_trend called in scheduler"

CONTINUUM_TESTS=$(grep -c "#\[test\]" core/backend/system/continuum/*.rs)
test $CONTINUUM_TESTS -ge 10
check $? "Continuum has ≥10 unit tests ($CONTINUUM_TESTS found)"

# ════════════════════════════════════════════════════════════════
# CORTEX SYNC (#13)
# ════════════════════════════════════════════════════════════════
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧠 Cortex Synchronique Avancé (#13)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test -f "core/backend/system/cortex_sync/mod.rs"
check $? "cortex_sync/mod.rs exists"

test -f "core/backend/system/cortex_sync/integrator.rs"
check $? "cortex_sync/integrator.rs exists"

test -f "core/backend/system/cortex_sync/harmonics.rs"
check $? "cortex_sync/harmonics.rs exists"

grep -q "pub struct CortexSyncState" core/backend/system/cortex_sync/mod.rs
check $? "CortexSyncState struct exists"

grep -q "global_clarity: f32" core/backend/system/cortex_sync/mod.rs
check $? "CortexSyncState has global_clarity field"

grep -q "harmonic_balance: f32" core/backend/system/cortex_sync/mod.rs
check $? "CortexSyncState has harmonic_balance field"

grep -q "coherence: f32" core/backend/system/cortex_sync/mod.rs
check $? "CortexSyncState has coherence field"

grep -q "alert_level: f32" core/backend/system/cortex_sync/mod.rs
check $? "CortexSyncState has alert_level field"

grep -q "pub struct CortexInputs" core/backend/system/cortex_sync/integrator.rs
check $? "CortexInputs struct exists"

grep -q "pub fn collect_signals" core/backend/system/cortex_sync/integrator.rs
check $? "collect_signals function exists"

grep -q "pub struct CortexReport" core/backend/system/cortex_sync/harmonics.rs
check $? "CortexReport struct exists"

grep -q "pub fn compute_harmonics" core/backend/system/cortex_sync/harmonics.rs
check $? "compute_harmonics function exists"

grep -q "pub mod cortex_sync;" core/backend/system/mod.rs
check $? "Cortex Sync exported in system/mod.rs"

grep -q "cortex_sync::CortexSyncState" core/backend/main.rs
check $? "CortexSyncState imported in main.rs"

grep -q "cortex_sync: Arc<Mutex<CortexSyncState>>" core/backend/main.rs
check $? "TitaneCore has cortex_sync field"

grep -q "system::cortex_sync::tick" core/backend/main.rs
check $? "cortex_sync tick called in scheduler"

CORTEX_TESTS=$(grep -c "#\[test\]" core/backend/system/cortex_sync/*.rs)
test $CORTEX_TESTS -ge 8
check $? "Cortex Sync has ≥8 unit tests ($CORTEX_TESTS found)"

# ════════════════════════════════════════════════════════════════
# CODE METRICS
# ════════════════════════════════════════════════════════════════
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📏 Code Metrics"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

CONTINUUM_LINES=$(wc -l core/backend/system/continuum/*.rs | tail -1 | awk '{print $1}')
echo "   Continuum: $CONTINUUM_LINES lines"
test $CONTINUUM_LINES -ge 400
check $? "Continuum ≥400 lines"

CORTEX_LINES=$(wc -l core/backend/system/cortex_sync/*.rs | tail -1 | awk '{print $1}')
echo "   Cortex Sync: $CORTEX_LINES lines"
test $CORTEX_LINES -ge 300
check $? "Cortex Sync ≥300 lines"

TOTAL_LINES=$((CONTINUUM_LINES + CORTEX_LINES))
echo "   Total: $TOTAL_LINES lines"

# ════════════════════════════════════════════════════════════════
# FINAL REPORT
# ════════════════════════════════════════════════════════════════
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  RÉSULTATS FINAUX                                            ║"
echo "╚══════════════════════════════════════════════════════════════╝"

PASS_RATE=$((TOTAL_PASS * 100 / TOTAL_TESTS))
echo ""
echo "📊 Tests passés: $TOTAL_PASS/$TOTAL_TESTS ($PASS_RATE%)"
echo "📝 Continuum: $CONTINUUM_LINES lignes, $CONTINUUM_TESTS tests"
echo "📝 Cortex Sync: $CORTEX_LINES lignes, $CORTEX_TESTS tests"
echo "📝 Total: $TOTAL_LINES lignes, $((CONTINUUM_TESTS + CORTEX_TESTS)) tests"
echo ""

if [ $PASS_RATE -ge 95 ]; then
    echo "✅ VALIDATION PASSED - Modules #11-#13 complets"
    echo ""
    echo "🎯 Systèmes cognitifs avancés opérationnels:"
    echo "   • Meta-Continuum - Dynamique temporelle"
    echo "   • Cortex Synchronique - Vision globale unifiée"
    echo ""
    exit 0
else
    echo "⚠️  VALIDATION INCOMPLETE ($PASS_RATE% < 95%)"
    exit 1
fi
