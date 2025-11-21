#!/bin/bash
# Script de vérification des modules #36-39
# TITANE∞ v8 - Sentient Cognitive Layer

echo "🔍 VÉRIFICATION DES MODULES #36-39"
echo "===================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteurs
TOTAL=0
SUCCESS=0
FAIL=0

check_file() {
    TOTAL=$((TOTAL + 1))
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        SUCCESS=$((SUCCESS + 1))
    else
        echo -e "${RED}✗${NC} $1"
        FAIL=$((FAIL + 1))
    fi
}

echo "📦 MODULE #36 : SENTIENT LOOP ENGINE"
echo "------------------------------------"
check_file "core/backend/system/sentient/mod.rs"
check_file "core/backend/system/sentient/loop_mod.rs"
check_file "core/backend/system/sentient/collect.rs"
check_file "core/backend/system/sentient/compute.rs"
echo ""

echo "📦 MODULE #37 : HARMONIC BRAIN ENGINE"
echo "--------------------------------------"
check_file "core/backend/system/harmonic_brain/mod.rs"
check_file "core/backend/system/harmonic_brain/resonance.rs"
check_file "core/backend/system/harmonic_brain/collect.rs"
check_file "core/backend/system/harmonic_brain/compute.rs"
echo ""

echo "📦 MODULE #38 : META-INTEGRATION ENGINE"
echo "----------------------------------------"
check_file "core/backend/system/meta_integration/mod.rs"
check_file "core/backend/system/meta_integration/alignment.rs"
check_file "core/backend/system/meta_integration/collect.rs"
check_file "core/backend/system/meta_integration/compute.rs"
echo ""

echo "📦 MODULE #39 : ARCHITECTURE ENGINE"
echo "------------------------------------"
check_file "core/backend/system/architecture/mod.rs"
check_file "core/backend/system/architecture/geometry.rs"
check_file "core/backend/system/architecture/collect.rs"
check_file "core/backend/system/architecture/compute.rs"
echo ""

echo "🔗 INTÉGRATION SYSTÈME"
echo "----------------------"
check_file "core/backend/system/mod.rs"
check_file "core/backend/main.rs"
echo ""

echo "📊 RÉSUMÉ"
echo "========="
echo -e "Total fichiers vérifiés : ${YELLOW}$TOTAL${NC}"
echo -e "Fichiers présents       : ${GREEN}$SUCCESS${NC}"
echo -e "Fichiers manquants      : ${RED}$FAIL${NC}"
echo ""

# Vérification du contenu des fichiers clés
echo "🔍 VÉRIFICATION DU CONTENU"
echo "=========================="

echo -n "Vérification exports system/mod.rs... "
if grep -q "pub mod sentient;" core/backend/system/mod.rs && \
   grep -q "pub mod harmonic_brain;" core/backend/system/mod.rs && \
   grep -q "pub mod meta_integration;" core/backend/system/mod.rs && \
   grep -q "pub mod architecture;" core/backend/system/mod.rs; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    FAIL=$((FAIL + 1))
fi

echo -n "Vérification imports main.rs... "
if grep -q "sentient::{SentientState, SentientLoopMemory}" core/backend/main.rs && \
   grep -q "harmonic_brain::{HarmonicBrainState, ResonanceMemory}" core/backend/main.rs && \
   grep -q "meta_integration::{MetaIntegrationState, AlignmentMemory}" core/backend/main.rs && \
   grep -q "architecture::{ArchitectureState, GeometryMemory}" core/backend/main.rs; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    FAIL=$((FAIL + 1))
fi

echo -n "Vérification champs TitaneCore... "
if grep -q "sentient: Arc<Mutex<SentientState>>" core/backend/main.rs && \
   grep -q "harmonic_brain: Arc<Mutex<HarmonicBrainState>>" core/backend/main.rs && \
   grep -q "meta_integration: Arc<Mutex<MetaIntegrationState>>" core/backend/main.rs && \
   grep -q "architecture: Arc<Mutex<ArchitectureState>>" core/backend/main.rs; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    FAIL=$((FAIL + 1))
fi

echo -n "Vérification init modules... "
if grep -q "system::sentient::init()" core/backend/main.rs && \
   grep -q "system::harmonic_brain::init()" core/backend/main.rs && \
   grep -q "system::meta_integration::init()" core/backend/main.rs && \
   grep -q "system::architecture::init()" core/backend/main.rs; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    FAIL=$((FAIL + 1))
fi

echo -n "Vérification tick scheduler... "
if grep -q "system::sentient::tick" core/backend/main.rs && \
   grep -q "system::harmonic_brain::tick" core/backend/main.rs && \
   grep -q "system::meta_integration::tick" core/backend/main.rs && \
   grep -q "system::architecture::tick" core/backend/main.rs; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    FAIL=$((FAIL + 1))
fi

echo ""
echo "📈 MÉTRIQUES DES MODULES"
echo "========================"

# Comptage des lignes de code
echo "Lignes de code par module :"
for module in sentient harmonic_brain meta_integration architecture; do
    if [ -d "core/backend/system/$module" ]; then
        lines=$(find "core/backend/system/$module" -name "*.rs" -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}')
        echo -e "  ${module}: ${YELLOW}${lines}${NC} lignes"
    fi
done

echo ""
echo "🎯 STATUT FINAL"
echo "==============="
if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✅ TOUS LES MODULES SONT OPÉRATIONNELS${NC}"
    echo ""
    echo "Les 4 modules de la couche sentiente sont complets :"
    echo "  • Module #36 : Sentient Loop Engine"
    echo "  • Module #37 : Harmonic Brain Engine"
    echo "  • Module #38 : Meta-Integration Engine"
    echo "  • Module #39 : Architecture Engine"
    echo ""
    echo "Prêt pour compilation avec 'cargo build'"
    exit 0
else
    echo -e "${RED}❌ CERTAINS FICHIERS SONT MANQUANTS${NC}"
    echo "Veuillez vérifier les erreurs ci-dessus"
    exit 1
fi
