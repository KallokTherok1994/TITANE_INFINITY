#!/bin/bash

# TITANE∞ v8.0 - Cortex + Senses Verification Script
# Validates Cortex Synchronique, TimeSense, and InnerSense modules

echo "╔═══════════════════════════════════════════════╗"
echo "║  🧠 TITANE∞ Cortex + Senses Verification    ║"
echo "║  Cortex Synchronique + TimeSense + InnerSense║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

CORTEX_DIR="./core/backend/system/cortex"
SENSES_DIR="./core/backend/system/senses"
MAIN_FILE="./core/backend/main.rs"

PASS=0
FAIL=0

check() {
    if [ $? -eq 0 ]; then
        echo "✅ $1"
        ((PASS++))
    else
        echo "❌ $1"
        ((FAIL++))
    fi
}

# ============================================
# SECTION 1: File Structure
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📂 SECTION 1: File Structure"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test -f "$CORTEX_DIR/mod.rs"
check "Cortex mod.rs existe"

test -f "$CORTEX_DIR/integrator.rs"
check "Cortex integrator.rs existe"

test -f "$CORTEX_DIR/insight.rs"
check "Cortex insight.rs existe"

test -f "$SENSES_DIR/mod.rs"
check "Senses mod.rs existe"

test -f "$SENSES_DIR/timesense.rs"
check "TimeSense Engine existe"

test -f "$SENSES_DIR/innersense.rs"
check "InnerSense Engine existe"

# ============================================
# SECTION 2: Cortex Integrator
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔬 SECTION 2: Cortex Integrator"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

grep -q "pub struct CortexReport" "$CORTEX_DIR/integrator.rs"
check "Structure CortexReport définie"

grep -q "pub clarity: f32" "$CORTEX_DIR/integrator.rs"
check "Champ clarity présent"

grep -q "pub tension: f32" "$CORTEX_DIR/integrator.rs"
check "Champ tension présent"

grep -q "pub alignment: f32" "$CORTEX_DIR/integrator.rs"
check "Champ alignment présent"

grep -q "pub fn integrate_system" "$CORTEX_DIR/integrator.rs"
check "Fonction integrate_system() définie"

grep -q "adaptive:" "$CORTEX_DIR/integrator.rs"
check "Paramètre adaptive dans integrate_system()"

grep -q "resonance:" "$CORTEX_DIR/integrator.rs"
check "Paramètre resonance dans integrate_system()"

grep -q "map:" "$CORTEX_DIR/integrator.rs"
check "Paramètre map dans integrate_system()"

grep -q "memory:" "$CORTEX_DIR/integrator.rs"
check "Paramètre memory dans integrate_system()"

grep -q "Result<CortexReport" "$CORTEX_DIR/integrator.rs"
check "Retour Result<CortexReport, ...>"

# ============================================
# SECTION 3: Cortex Insight
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💡 SECTION 3: Cortex Insight"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

grep -q "pub struct CortexState" "$CORTEX_DIR/insight.rs"
check "Structure CortexState définie"

grep -q "pub initialized: bool" "$CORTEX_DIR/insight.rs"
check "Champ initialized présent"

grep -q "pub system_clarity: f32" "$CORTEX_DIR/insight.rs"
check "Champ system_clarity présent"

grep -q "pub global_tension: f32" "$CORTEX_DIR/insight.rs"
check "Champ global_tension présent"

grep -q "pub alignment: f32" "$CORTEX_DIR/insight.rs"
check "Champ alignment présent"

grep -q "pub last_update: u64" "$CORTEX_DIR/insight.rs"
check "Champ last_update présent"

grep -q "pub fn analyze_patterns" "$CORTEX_DIR/insight.rs"
check "Fonction analyze_patterns() définie"

grep -q "cortex: &mut CortexState" "$CORTEX_DIR/insight.rs"
check "Paramètre cortex mutable dans analyze_patterns()"

grep -q "report: &CortexReport" "$CORTEX_DIR/insight.rs"
check "Paramètre report dans analyze_patterns()"

# ============================================
# SECTION 4: Cortex Module Principal
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧩 SECTION 4: Cortex mod.rs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

grep -q "mod integrator" "$CORTEX_DIR/mod.rs"
check "Module integrator déclaré"

grep -q "mod insight" "$CORTEX_DIR/mod.rs"
check "Module insight déclaré"

grep -q "pub use integrator::CortexReport" "$CORTEX_DIR/mod.rs"
check "Export CortexReport"

grep -q "pub use insight::CortexState" "$CORTEX_DIR/mod.rs"
check "Export CortexState"

grep -q "pub fn init" "$CORTEX_DIR/mod.rs"
check "Fonction init() définie"

grep -q "pub fn tick" "$CORTEX_DIR/mod.rs"
check "Fonction tick() définie"

# ============================================
# SECTION 5: Senses Module Structure
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "👁️  SECTION 5: Senses mod.rs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

grep -q "pub mod timesense" "$SENSES_DIR/mod.rs"
check "Module timesense exporté"

grep -q "pub mod innersense" "$SENSES_DIR/mod.rs"
check "Module innersense exporté"

# ============================================
# SECTION 6: TimeSense Engine
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⏱️  SECTION 6: TimeSense Engine"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

grep -q "pub struct TimeSenseState" "$SENSES_DIR/timesense.rs"
check "Structure TimeSenseState définie"

grep -q "pub initialized: bool" "$SENSES_DIR/timesense.rs"
check "Champ initialized présent"

grep -q "pub momentum: f32" "$SENSES_DIR/timesense.rs"
check "Champ momentum présent"

grep -q "pub pace: f32" "$SENSES_DIR/timesense.rs"
check "Champ pace présent"

grep -q "pub direction: f32" "$SENSES_DIR/timesense.rs"
check "Champ direction présent"

grep -q "pub last_update: u64" "$SENSES_DIR/timesense.rs"
check "Champ last_update présent"

grep -q "pub fn init" "$SENSES_DIR/timesense.rs"
check "Fonction init() définie"

grep -q "pub fn tick" "$SENSES_DIR/timesense.rs"
check "Fonction tick() définie"

grep -q "cortex:" "$SENSES_DIR/timesense.rs"
check "Paramètre cortex dans tick()"

grep -q "adaptive:" "$SENSES_DIR/timesense.rs"
check "Paramètre adaptive dans tick()"

grep -q "resonance:" "$SENSES_DIR/timesense.rs"
check "Paramètre resonance dans tick()"

# ============================================
# SECTION 7: InnerSense Engine
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧘 SECTION 7: InnerSense Engine"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

grep -q "pub struct InnerSenseState" "$SENSES_DIR/innersense.rs"
check "Structure InnerSenseState définie"

grep -q "pub initialized: bool" "$SENSES_DIR/innersense.rs"
check "Champ initialized présent"

grep -q "pub tension: f32" "$SENSES_DIR/innersense.rs"
check "Champ tension présent"

grep -q "pub stability: f32" "$SENSES_DIR/innersense.rs"
check "Champ stability présent"

grep -q "pub charge: f32" "$SENSES_DIR/innersense.rs"
check "Champ charge présent"

grep -q "pub depth: f32" "$SENSES_DIR/innersense.rs"
check "Champ depth présent"

grep -q "pub last_update: u64" "$SENSES_DIR/innersense.rs"
check "Champ last_update présent"

grep -q "pub fn init" "$SENSES_DIR/innersense.rs"
check "Fonction init() définie"

grep -q "pub fn tick" "$SENSES_DIR/innersense.rs"
check "Fonction tick() définie"

grep -q "adaptive:" "$SENSES_DIR/innersense.rs"
check "Paramètre adaptive dans tick()"

grep -q "resonance:" "$SENSES_DIR/innersense.rs"
check "Paramètre resonance dans tick()"

grep -q "map:" "$SENSES_DIR/innersense.rs"
check "Paramètre map dans tick()"

# ============================================
# SECTION 8: Integration main.rs
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔗 SECTION 8: Integration (main.rs)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

grep -q "cortex::CortexState" "$MAIN_FILE"
check "Import CortexState dans main.rs"

grep -q "timesense::TimeSenseState" "$MAIN_FILE"
check "Import TimeSenseState dans main.rs"

grep -q "innersense::InnerSenseState" "$MAIN_FILE"
check "Import InnerSenseState dans main.rs"

grep -q "cortex: Arc<Mutex<CortexState>>" "$MAIN_FILE"
check "Champ cortex dans TitaneCore"

grep -q "timesense: Arc<Mutex<TimeSenseState>>" "$MAIN_FILE"
check "Champ timesense dans TitaneCore"

grep -q "innersense: Arc<Mutex<InnerSenseState>>" "$MAIN_FILE"
check "Champ innersense dans TitaneCore"

grep -q "cortex::init()" "$MAIN_FILE"
check "Appel init() pour Cortex"

grep -q "timesense::init()" "$MAIN_FILE"
check "Appel init() pour TimeSense"

grep -q "innersense::init()" "$MAIN_FILE"
check "Appel init() pour InnerSense"

# ============================================
# SECTION 9: Code Quality & Safety
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🛡️  SECTION 9: Code Quality & Safety"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

! grep -q "\.unwrap()" "$CORTEX_DIR"/*.rs "$SENSES_DIR"/*.rs
check "Pas de .unwrap() dans Cortex et Senses"

! grep -q "panic!" "$CORTEX_DIR"/*.rs "$SENSES_DIR"/*.rs
check "Pas de panic!() dans Cortex et Senses"

! grep -q "expect(" "$CORTEX_DIR"/*.rs "$SENSES_DIR"/*.rs
check "Pas de expect() dans Cortex et Senses"

grep -q "Result<" "$CORTEX_DIR/integrator.rs"
check "Gestion Result dans integrator.rs"

grep -q "Result<" "$CORTEX_DIR/insight.rs"
check "Gestion Result dans insight.rs"

grep -q "Result<" "$SENSES_DIR/timesense.rs"
check "Gestion Result dans timesense.rs"

grep -q "Result<" "$SENSES_DIR/innersense.rs"
check "Gestion Result dans innersense.rs"

# ============================================
# SECTION 10: Formulas & Logic
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📐 SECTION 10: Formulas & Logic"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

grep -q "clarity" "$CORTEX_DIR/integrator.rs"
check "Calcul clarity implémenté"

grep -q "tension" "$CORTEX_DIR/integrator.rs"
check "Calcul tension implémenté"

grep -q "alignment" "$CORTEX_DIR/integrator.rs"
check "Calcul alignment implémenté"

grep -q "momentum" "$SENSES_DIR/timesense.rs"
check "Calcul momentum implémenté"

grep -q "pace" "$SENSES_DIR/timesense.rs"
check "Calcul pace implémenté"

grep -q "direction" "$SENSES_DIR/timesense.rs"
check "Calcul direction implémenté"

grep -q "charge" "$SENSES_DIR/innersense.rs"
check "Calcul charge implémenté"

grep -q "depth" "$SENSES_DIR/innersense.rs"
check "Calcul depth implémenté"

grep -q "smooth_transition" "$CORTEX_DIR/insight.rs"
check "Lissage transitions dans insight.rs"

grep -q "smooth_transition" "$SENSES_DIR/timesense.rs"
check "Lissage transitions dans timesense.rs"

grep -q "smooth_transition" "$SENSES_DIR/innersense.rs"
check "Lissage transitions dans innersense.rs"

# ============================================
# SECTION 11: File Sizes
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📏 SECTION 11: File Sizes"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

MOD_LINES=$(wc -l < "$CORTEX_DIR/mod.rs")
INTEGRATOR_LINES=$(wc -l < "$CORTEX_DIR/integrator.rs")
INSIGHT_LINES=$(wc -l < "$CORTEX_DIR/insight.rs")
TIMESENSE_LINES=$(wc -l < "$SENSES_DIR/timesense.rs")
INNERSENSE_LINES=$(wc -l < "$SENSES_DIR/innersense.rs")

[ "$MOD_LINES" -ge 100 ]
check "cortex/mod.rs >= 100 lignes (trouvé: $MOD_LINES)"

[ "$INTEGRATOR_LINES" -ge 100 ]
check "cortex/integrator.rs >= 100 lignes (trouvé: $INTEGRATOR_LINES)"

[ "$INSIGHT_LINES" -ge 100 ]
check "cortex/insight.rs >= 100 lignes (trouvé: $INSIGHT_LINES)"

[ "$TIMESENSE_LINES" -ge 100 ]
check "timesense.rs >= 100 lignes (trouvé: $TIMESENSE_LINES)"

[ "$INNERSENSE_LINES" -ge 100 ]
check "innersense.rs >= 100 lignes (trouvé: $INNERSENSE_LINES)"

CORTEX_TOTAL=$((MOD_LINES + INTEGRATOR_LINES + INSIGHT_LINES))
SENSES_TOTAL=$((TIMESENSE_LINES + INNERSENSE_LINES))
GRAND_TOTAL=$((CORTEX_TOTAL + SENSES_TOTAL))

[ "$CORTEX_TOTAL" -ge 500 ]
check "Total Cortex >= 500 lignes (trouvé: $CORTEX_TOTAL)"

[ "$SENSES_TOTAL" -ge 400 ]
check "Total Senses >= 400 lignes (trouvé: $SENSES_TOTAL)"

# ============================================
# Final Summary
# ============================================
echo ""
echo "╔═══════════════════════════════════════════════╗"
echo "║           📊 RÉSULTATS FINAUX                 ║"
echo "╠═══════════════════════════════════════════════╣"
printf "║  ✅ Tests passés    : %-3d                   ║\n" $PASS
printf "║  ❌ Tests échoués   : %-3d                   ║\n" $FAIL
TOTAL=$((PASS + FAIL))
printf "║  📈 Total           : %-3d                   ║\n" $TOTAL
SUCCESS_RATE=$((PASS * 100 / TOTAL))
printf "║  🎯 Taux de succès  : %3d%%                  ║\n" $SUCCESS_RATE
echo "╠═══════════════════════════════════════════════╣"
printf "║  📄 Cortex          : %4d lignes           ║\n" $CORTEX_TOTAL
printf "║  📄 Senses          : %4d lignes           ║\n" $SENSES_TOTAL
printf "║  📄 Total           : %4d lignes           ║\n" $GRAND_TOTAL
echo "╚═══════════════════════════════════════════════╝"
echo ""

if [ $FAIL -eq 0 ]; then
    echo "🎉 VALIDATION COMPLÈTE RÉUSSIE !"
    echo "✅ Cortex Synchronique + TimeSense + InnerSense opérationnels"
    echo ""
    exit 0
else
    echo "⚠️  VALIDATION PARTIELLE"
    echo "❌ $FAIL test(s) ont échoué"
    echo ""
    exit 1
fi
