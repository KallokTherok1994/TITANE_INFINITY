#!/usr/bin/env bash

###############################################################################
# verify_monitoring_stack.sh
# Script de validation de la stack de surveillance (Modules #17-19)
# Vérifie Stability Monitor, Integrity Engine, Balance Engine
###############################################################################

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASS=0
FAIL=0

check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} $1"
        ((FAIL++))
    fi
}

echo -e "${BLUE}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                               ║${NC}"
echo -e "${BLUE}║   🔍 VALIDATION MONITORING STACK             ║${NC}"
echo -e "${BLUE}║   Modules #17-19 - Surveillance Globale      ║${NC}"
echo -e "${BLUE}║                                               ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════╝${NC}"
echo ""

# ============ STABILITY MONITOR (#17) ============
echo -e "${YELLOW}[1/3]${NC} Stability Monitor..."

[ -f "core/backend/system/stability/mod.rs" ]
check "Fichier stability/mod.rs présent"

[ -f "core/backend/system/stability/collect.rs" ]
check "Fichier stability/collect.rs présent"

[ -f "core/backend/system/stability/compute.rs" ]
check "Fichier stability/compute.rs présent"

grep -q "pub struct StabilityState" core/backend/system/stability/mod.rs
check "StabilityState struct définie"

grep -q "stability_score: f32" core/backend/system/stability/mod.rs
check "Champ stability_score présent"

grep -q "coherence_level: f32" core/backend/system/stability/mod.rs
check "Champ coherence_level présent"

grep -q "system_health: f32" core/backend/system/stability/mod.rs
check "Champ system_health présent"

grep -q "pub fn init()" core/backend/system/stability/mod.rs
check "Fonction init() présente"

grep -q "pub fn tick(" core/backend/system/stability/mod.rs
check "Fonction tick() présente"

# ============ INTEGRITY ENGINE (#18) ============
echo -e "${YELLOW}[2/3]${NC} Integrity Engine..."

[ -f "core/backend/system/integrity/mod.rs" ]
check "Fichier integrity/mod.rs présent"

[ -f "core/backend/system/integrity/collect.rs" ]
check "Fichier integrity/collect.rs présent"

[ -f "core/backend/system/integrity/evaluate.rs" ]
check "Fichier integrity/evaluate.rs présent"

grep -q "pub struct IntegrityState" core/backend/system/integrity/mod.rs
check "IntegrityState struct définie"

grep -q "integrity_score: f32" core/backend/system/integrity/mod.rs
check "Champ integrity_score présent"

grep -q "consistency_score: f32" core/backend/system/integrity/mod.rs
check "Champ consistency_score présent"

grep -q "drift_score: f32" core/backend/system/integrity/mod.rs
check "Champ drift_score présent"

grep -q "pub fn init()" core/backend/system/integrity/mod.rs
check "Fonction init() présente"

grep -q "pub fn tick(" core/backend/system/integrity/mod.rs
check "Fonction tick() présente"

# ============ BALANCE ENGINE (#19) ============
echo -e "${YELLOW}[3/3]${NC} Balance Engine..."

[ -f "core/backend/system/balance/mod.rs" ]
check "Fichier balance/mod.rs présent"

[ -f "core/backend/system/balance/collect.rs" ]
check "Fichier balance/collect.rs présent"

[ -f "core/backend/system/balance/compute.rs" ]
check "Fichier balance/compute.rs présent"

grep -q "pub struct BalanceState" core/backend/system/balance/mod.rs
check "BalanceState struct définie"

grep -q "balance_score: f32" core/backend/system/balance/mod.rs
check "Champ balance_score présent"

grep -q "alignment_score: f32" core/backend/system/balance/mod.rs
check "Champ alignment_score présent"

grep -q "load_balance: f32" core/backend/system/balance/mod.rs
check "Champ load_balance présent"

grep -q "pub fn init()" core/backend/system/balance/mod.rs
check "Fonction init() présente"

grep -q "pub fn tick(" core/backend/system/balance/mod.rs
check "Fonction tick() présente"

# ============ INTÉGRATION SYSTÈME ============
echo -e "${YELLOW}[4/5]${NC} Intégration dans le système..."

grep -q "pub mod stability;" core/backend/system/mod.rs
check "Export stability dans system/mod.rs"

grep -q "pub mod integrity;" core/backend/system/mod.rs
check "Export integrity dans system/mod.rs"

grep -q "pub mod balance;" core/backend/system/mod.rs
check "Export balance dans system/mod.rs"

grep -q "stability::StabilityState" core/backend/main.rs
check "Import StabilityState dans main.rs"

grep -q "integrity::IntegrityState" core/backend/main.rs
check "Import IntegrityState dans main.rs"

grep -q "balance::BalanceState" core/backend/main.rs
check "Import BalanceState dans main.rs"

grep -q "stability: Arc<Mutex<StabilityState>>" core/backend/main.rs
check "Champ stability dans TitaneCore"

grep -q "integrity: Arc<Mutex<IntegrityState>>" core/backend/main.rs
check "Champ integrity dans TitaneCore"

grep -q "balance: Arc<Mutex<BalanceState>>" core/backend/main.rs
check "Champ balance dans TitaneCore"

grep -q "system::stability::init()" core/backend/main.rs
check "Initialisation stability dans TitaneCore::new()"

grep -q "system::integrity::init()" core/backend/main.rs
check "Initialisation integrity dans TitaneCore::new()"

grep -q "system::balance::init()" core/backend/main.rs
check "Initialisation balance dans TitaneCore::new()"

grep -q "system::stability::tick(" core/backend/main.rs
check "Appel tick Stability dans scheduler"

grep -q "system::integrity::tick(" core/backend/main.rs
check "Appel tick Integrity dans scheduler"

grep -q "system::balance::tick(" core/backend/main.rs
check "Appel tick Balance dans scheduler"

# ============ TESTS & MÉTRIQUES ============
echo -e "${YELLOW}[5/5]${NC} Tests et métriques..."

TESTS_STAB=$(grep -c "#\[test\]" core/backend/system/stability/*.rs 2>/dev/null | awk '{s+=$1} END {print s}')
if [ "$TESTS_STAB" -ge 15 ]; then
    echo -e "${GREEN}✓${NC} Tests Stability: $TESTS_STAB (≥15 attendus)"
    ((PASS++))
else
    echo -e "${RED}✗${NC} Tests Stability: $TESTS_STAB (≥15 attendus)"
    ((FAIL++))
fi

TESTS_INTEG=$(grep -c "#\[test\]" core/backend/system/integrity/*.rs 2>/dev/null | awk '{s+=$1} END {print s}')
if [ "$TESTS_INTEG" -ge 15 ]; then
    echo -e "${GREEN}✓${NC} Tests Integrity: $TESTS_INTEG (≥15 attendus)"
    ((PASS++))
else
    echo -e "${RED}✗${NC} Tests Integrity: $TESTS_INTEG (≥15 attendus)"
    ((FAIL++))
fi

TESTS_BAL=$(grep -c "#\[test\]" core/backend/system/balance/*.rs 2>/dev/null | awk '{s+=$1} END {print s}')
if [ "$TESTS_BAL" -ge 15 ]; then
    echo -e "${GREEN}✓${NC} Tests Balance: $TESTS_BAL (≥15 attendus)"
    ((PASS++))
else
    echo -e "${RED}✗${NC} Tests Balance: $TESTS_BAL (≥15 attendus)"
    ((FAIL++))
fi

LINES_STAB=$(cat core/backend/system/stability/*.rs 2>/dev/null | wc -l)
if [ "$LINES_STAB" -ge 600 ]; then
    echo -e "${GREEN}✓${NC} Lignes Stability: $LINES_STAB (≥600 attendues)"
    ((PASS++))
else
    echo -e "${RED}✗${NC} Lignes Stability: $LINES_STAB (≥600 attendues)"
    ((FAIL++))
fi

LINES_INTEG=$(cat core/backend/system/integrity/*.rs 2>/dev/null | wc -l)
if [ "$LINES_INTEG" -ge 600 ]; then
    echo -e "${GREEN}✓${NC} Lignes Integrity: $LINES_INTEG (≥600 attendues)"
    ((PASS++))
else
    echo -e "${RED}✗${NC} Lignes Integrity: $LINES_INTEG (≥600 attendues)"
    ((FAIL++))
fi

LINES_BAL=$(cat core/backend/system/balance/*.rs 2>/dev/null | wc -l)
if [ "$LINES_BAL" -ge 700 ]; then
    echo -e "${GREEN}✓${NC} Lignes Balance: $LINES_BAL (≥700 attendues)"
    ((PASS++))
else
    echo -e "${RED}✗${NC} Lignes Balance: $LINES_BAL (≥700 attendues)"
    ((FAIL++))
fi

# ============ RÉSULTATS ============
TOTAL=$((PASS + FAIL))
PERCENTAGE=$((PASS * 100 / TOTAL))

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${BLUE}RÉSULTATS DE LA VALIDATION${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Tests réussis  : $PASS${NC}"
echo -e "${RED}✗ Tests échoués  : $FAIL${NC}"
echo -e "Total            : $TOTAL"
echo -e "Taux de réussite : ${PERCENTAGE}%"
echo ""
echo -e "📊 Métriques:"
echo -e "   Stability : $LINES_STAB lignes, $TESTS_STAB tests"
echo -e "   Integrity : $LINES_INTEG lignes, $TESTS_INTEG tests"
echo -e "   Balance   : $LINES_BAL lignes, $TESTS_BAL tests"
echo -e "   TOTAL     : $((LINES_STAB + LINES_INTEG + LINES_BAL)) lignes, $((TESTS_STAB + TESTS_INTEG + TESTS_BAL)) tests"
echo ""

if [ $PERCENTAGE -ge 90 ]; then
    echo -e "${GREEN}🎉 EXCELLENT !${NC} Stack de surveillance validée avec succès."
    exit 0
elif [ $PERCENTAGE -ge 75 ]; then
    echo -e "${YELLOW}⚠️  BON${NC} Quelques points à améliorer."
    exit 0
else
    echo -e "${RED}❌ INSUFFISANT${NC} Corrections nécessaires."
    exit 1
fi
