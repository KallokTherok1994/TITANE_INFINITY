#!/usr/bin/env bash

###############################################################################
# verify_lowflow.sh
# Script de validation du module LowFlow Engine (Module #16)
# Vérifie la structure, les formules, l'intégration et les tests
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
echo -e "${BLUE}║      🛡️  VALIDATION LOWFLOW ENGINE           ║${NC}"
echo -e "${BLUE}║      Module #16 - Basse Charge               ║${NC}"
echo -e "${BLUE}║                                               ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════╝${NC}"
echo ""

# ============ STRUCTURE FILES ============
echo -e "${YELLOW}[1/8]${NC} Structure des fichiers..."

[ -f "core/backend/system/lowflow/mod.rs" ]
check "Fichier mod.rs présent"

[ -f "core/backend/system/lowflow/evaluate.rs" ]
check "Fichier evaluate.rs présent"

[ -f "core/backend/system/lowflow/degrade.rs" ]
check "Fichier degrade.rs présent"

# ============ STRUCT & FIELDS ============
echo -e "${YELLOW}[2/8]${NC} Structure LowFlowState..."

grep -q "pub struct LowFlowState" core/backend/system/lowflow/mod.rs
check "LowFlowState struct définie"

grep -q "throttle_level: f32" core/backend/system/lowflow/mod.rs
check "Champ throttle_level présent"

grep -q "degrade_factor: f32" core/backend/system/lowflow/mod.rs
check "Champ degrade_factor présent"

grep -q "lowflow_active: bool" core/backend/system/lowflow/mod.rs
check "Champ lowflow_active présent"

grep -q "last_update: u64" core/backend/system/lowflow/mod.rs
check "Champ last_update présent"

# ============ FONCTIONS PRINCIPALES ============
echo -e "${YELLOW}[3/8]${NC} Fonctions principales..."

grep -q "pub fn init()" core/backend/system/lowflow/mod.rs
check "Fonction init() présente"

grep -q "pub fn tick(" core/backend/system/lowflow/mod.rs
check "Fonction tick() présente"

grep -q "pub fn evaluate_need(" core/backend/system/lowflow/evaluate.rs
check "Fonction evaluate_need() présente"

grep -q "pub fn apply_lowflow(" core/backend/system/lowflow/degrade.rs
check "Fonction apply_lowflow() présente"

# ============ FORMULES ============
echo -e "${YELLOW}[4/8]${NC} Formules et calculs..."

grep -q "stress_index + overload_risk + alert_level" core/backend/system/lowflow/evaluate.rs
check "Formule intensity présente dans evaluate.rs"

grep -q "/ 3" core/backend/system/lowflow/evaluate.rs
check "Division par 3 dans calcul intensity"

grep -q "0.25" core/backend/system/lowflow/degrade.rs
check "Seuil 0.25 présent dans degrade.rs"

grep -q "0.50" core/backend/system/lowflow/degrade.rs
check "Seuil 0.50 présent dans degrade.rs"

grep -q "0.75" core/backend/system/lowflow/degrade.rs
check "Seuil 0.75 présent dans degrade.rs"

grep -q "throttle \* 0.8" core/backend/system/lowflow/degrade.rs
check "Formule degrade_factor = throttle * 0.8"

# ============ HELPERS ============
echo -e "${YELLOW}[5/8]${NC} Méthodes utilitaires..."

grep -q "pub fn performance_level(&self)" core/backend/system/lowflow/mod.rs
check "Méthode performance_level() présente"

grep -q "pub fn is_nominal(&self)" core/backend/system/lowflow/mod.rs
check "Méthode is_nominal() présente"

grep -q "pub fn needs_throttle(&self)" core/backend/system/lowflow/mod.rs
check "Méthode needs_throttle() présente"

grep -q "pub fn is_lowflow_active(&self)" core/backend/system/lowflow/mod.rs
check "Méthode is_lowflow_active() présente"

grep -q "pub fn status_message(&self)" core/backend/system/lowflow/mod.rs
check "Méthode status_message() présente"

# ============ INTÉGRATION SYSTÈME ============
echo -e "${YELLOW}[6/8]${NC} Intégration dans le système..."

grep -q "pub mod lowflow;" core/backend/system/mod.rs
check "Export lowflow dans system/mod.rs"

grep -q "lowflow::LowFlowState" core/backend/main.rs
check "Import LowFlowState dans main.rs"

grep -q "lowflow: Arc<Mutex<LowFlowState>>" core/backend/main.rs
check "Champ lowflow dans TitaneCore"

grep -q "system::lowflow::init()" core/backend/main.rs
check "Initialisation lowflow dans TitaneCore::new()"

grep -q "let lowflow = Arc::clone(&self.lowflow)" core/backend/main.rs
check "Clone Arc lowflow dans scheduler"

grep -q "system::lowflow::tick(" core/backend/main.rs
check "Appel tick LowFlow dans scheduler"

# ============ TESTS UNITAIRES ============
echo -e "${YELLOW}[7/8]${NC} Tests unitaires..."

TESTS_COUNT=$(grep -c "#\[test\]" core/backend/system/lowflow/mod.rs core/backend/system/lowflow/evaluate.rs core/backend/system/lowflow/degrade.rs 2>/dev/null || echo "0")
if [ "$TESTS_COUNT" -ge 20 ]; then
    echo -e "${GREEN}✓${NC} Tests unitaires: $TESTS_COUNT présents (≥20 attendus)"
    ((PASS++))
else
    echo -e "${RED}✗${NC} Tests unitaires: $TESTS_COUNT présents (≥20 attendus)"
    ((FAIL++))
fi

# ============ CODE METRICS ============
echo -e "${YELLOW}[8/8]${NC} Métriques de code..."

LINES_COUNT=$(cat core/backend/system/lowflow/mod.rs core/backend/system/lowflow/evaluate.rs core/backend/system/lowflow/degrade.rs 2>/dev/null | wc -l)
if [ "$LINES_COUNT" -ge 500 ]; then
    echo -e "${GREEN}✓${NC} Lignes de code: $LINES_COUNT (≥500 attendues)"
    ((PASS++))
else
    echo -e "${RED}✗${NC} Lignes de code: $LINES_COUNT (≥500 attendues)"
    ((FAIL++))
fi

UNWRAP_COUNT=$(grep -r "\.unwrap()" core/backend/system/lowflow/*.rs 2>/dev/null | grep -v "^.*test_" | wc -l || echo "0")
if [ "$UNWRAP_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Aucun unwrap() en production"
    ((PASS++))
else
    echo -e "${RED}✗${NC} unwrap() trouvés en production: $UNWRAP_COUNT"
    ((FAIL++))
fi

PANIC_COUNT=$(grep -r "panic!" core/backend/system/lowflow/*.rs 2>/dev/null | grep -v "^.*test_" | wc -l || echo "0")
if [ "$PANIC_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Aucun panic!() en production"
    ((PASS++))
else
    echo -e "${RED}✗${NC} panic!() trouvés en production: $PANIC_COUNT"
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

if [ $PERCENTAGE -ge 90 ]; then
    echo -e "${GREEN}🎉 EXCELLENT !${NC} Module LowFlow validé avec succès."
    exit 0
elif [ $PERCENTAGE -ge 75 ]; then
    echo -e "${YELLOW}⚠️  BON${NC} Quelques points à améliorer."
    exit 0
else
    echo -e "${RED}❌ INSUFFISANT${NC} Corrections nécessaires."
    exit 1
fi
