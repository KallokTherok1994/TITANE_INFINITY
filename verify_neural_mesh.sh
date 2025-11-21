#!/bin/bash
# TITANE∞ v8.0 - Neural Mesh Stack Validation
# Modules #29-30: NeuroMesh & CoreMesh

echo "🧬 VALIDATION NEURAL MESH STACK (#29-30)"
echo "=========================================="
echo ""

TOTAL_CHECKS=0
PASSED_CHECKS=0

# Couleurs
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
# SECTION 1: NEUROMESH ENGINE (#29)
# ============================================
echo "📦 Section 1: NeuroMesh Engine"
echo "------------------------------"

# Fichiers NeuroMesh
[ -f "core/backend/system/neuromesh/mod.rs" ]
check $? "Module neuromesh/mod.rs existe"

[ -f "core/backend/system/neuromesh/collect.rs" ]
check $? "Module neuromesh/collect.rs existe"

[ -f "core/backend/system/neuromesh/compute.rs" ]
check $? "Module neuromesh/compute.rs existe"

# Struct NeuroMeshState
grep -q "pub struct NeuroMeshState" core/backend/system/neuromesh/mod.rs
check $? "Struct NeuroMeshState définie"

grep -q "pub mesh_density: f32" core/backend/system/neuromesh/mod.rs
check $? "Champ mesh_density (f32)"

grep -q "pub synaptic_flow: f32" core/backend/system/neuromesh/mod.rs
check $? "Champ synaptic_flow (f32)"

grep -q "pub network_coherence: f32" core/backend/system/neuromesh/mod.rs
check $? "Champ network_coherence (f32)"

# Fonctions NeuroMesh
grep -q "pub fn init()" core/backend/system/neuromesh/mod.rs
check $? "Fonction init() présente"

grep -q "pub fn tick(" core/backend/system/neuromesh/mod.rs
check $? "Fonction tick() présente"

# Struct NeuroMeshInputs
grep -q "pub struct NeuroMeshInputs" core/backend/system/neuromesh/collect.rs
check $? "Struct NeuroMeshInputs définie"

# Fonction compute_mesh
grep -q "pub fn compute_mesh(" core/backend/system/neuromesh/compute.rs
check $? "Fonction compute_mesh() présente"

# Formules NeuroMesh
grep -q "neural_density \* 0.45" core/backend/system/neuromesh/compute.rs
check $? "Formule mesh_density correcte"

grep -q "signal_propagation \* 0.50" core/backend/system/neuromesh/compute.rs
check $? "Formule synaptic_flow correcte"

grep -q "alignment_depth \* 0.40" core/backend/system/neuromesh/compute.rs
check $? "Formule network_coherence correcte"

echo ""

# ============================================
# SECTION 2: COREMESH ENGINE (#30)
# ============================================
echo "📦 Section 2: CoreMesh Engine"
echo "-----------------------------"

# Fichiers CoreMesh
[ -f "core/backend/system/coremesh/mod.rs" ]
check $? "Module coremesh/mod.rs existe"

[ -f "core/backend/system/coremesh/collect.rs" ]
check $? "Module coremesh/collect.rs existe"

[ -f "core/backend/system/coremesh/compute.rs" ]
check $? "Module coremesh/compute.rs existe"

# Struct CoreMeshState
grep -q "pub struct CoreMeshState" core/backend/system/coremesh/mod.rs
check $? "Struct CoreMeshState définie"

grep -q "pub core_density: f32" core/backend/system/coremesh/mod.rs
check $? "Champ core_density (f32)"

grep -q "pub integration_depth: f32" core/backend/system/coremesh/mod.rs
check $? "Champ integration_depth (f32)"

grep -q "pub cortical_coherence: f32" core/backend/system/coremesh/mod.rs
check $? "Champ cortical_coherence (f32)"

# Fonctions CoreMesh
grep -q "pub fn init()" core/backend/system/coremesh/mod.rs
check $? "Fonction init() présente"

grep -q "pub fn tick(" core/backend/system/coremesh/mod.rs
check $? "Fonction tick() présente"

# Struct CoreMeshInputs
grep -q "pub struct CoreMeshInputs" core/backend/system/coremesh/collect.rs
check $? "Struct CoreMeshInputs définie"

# Fonction compute_coremesh
grep -q "pub fn compute_coremesh(" core/backend/system/coremesh/compute.rs
check $? "Fonction compute_coremesh() présente"

# Formules CoreMesh
grep -q "mesh_density \* 0.45" core/backend/system/coremesh/compute.rs
check $? "Formule core_density correcte"

grep -q "network_coherence \* 0.40" core/backend/system/coremesh/compute.rs
check $? "Formule integration_depth correcte"

grep -q "alignment_depth \* 0.45" core/backend/system/coremesh/compute.rs
check $? "Formule cortical_coherence correcte"

echo ""

# ============================================
# SECTION 3: INTÉGRATION SYSTÈME
# ============================================
echo "🔗 Section 3: Intégration Système"
echo "----------------------------------"

# Exports dans system/mod.rs
grep -q "pub mod neuromesh;" core/backend/system/mod.rs
check $? "Export neuromesh dans system/mod.rs"

grep -q "pub mod coremesh;" core/backend/system/mod.rs
check $? "Export coremesh dans system/mod.rs"

# Imports dans main.rs
grep -q "neuromesh::NeuroMeshState" core/backend/main.rs
check $? "Import NeuroMeshState dans main.rs"

grep -q "coremesh::CoreMeshState" core/backend/main.rs
check $? "Import CoreMeshState dans main.rs"

# Champs dans TitaneCore struct
grep -q "neuromesh: Arc<Mutex<NeuroMeshState>>" core/backend/main.rs
check $? "Champ neuromesh dans TitaneCore"

grep -q "coremesh: Arc<Mutex<CoreMeshState>>" core/backend/main.rs
check $? "Champ coremesh dans TitaneCore"

# Initialisation
grep -q "system::neuromesh::init()" core/backend/main.rs
check $? "Init neuromesh dans TitaneCore::new()"

grep -q "system::coremesh::init()" core/backend/main.rs
check $? "Init coremesh dans TitaneCore::new()"

# Arc::clone pour scheduler
grep -q "Arc::clone(&self.neuromesh)" core/backend/main.rs
check $? "Arc::clone neuromesh pour scheduler"

grep -q "Arc::clone(&self.coremesh)" core/backend/main.rs
check $? "Arc::clone coremesh pour scheduler"

# Ticks scheduler
grep -q "system::neuromesh::tick(" core/backend/main.rs
check $? "Tick neuromesh dans scheduler"

grep -q "system::coremesh::tick(" core/backend/main.rs
check $? "Tick coremesh dans scheduler"

echo ""

# ============================================
# SECTION 4: DÉPENDANCES & COHÉRENCE
# ============================================
echo "🔍 Section 4: Dépendances & Cohérence"
echo "--------------------------------------"

# NeuroMesh lit NeuroField
grep -q "neurofield: &NeuroFieldState" core/backend/system/neuromesh/mod.rs
check $? "NeuroMesh dépend de NeuroField"

# NeuroMesh lit VitalCore
grep -q "vitalcore: &VitalCoreState" core/backend/system/neuromesh/mod.rs
check $? "NeuroMesh dépend de VitalCore"

# CoreMesh lit NeuroMesh
grep -q "neuromesh: &NeuroMeshState" core/backend/system/coremesh/mod.rs
check $? "CoreMesh dépend de NeuroMesh"

# CoreMesh lit NeuroField
grep -q "neurofield: &NeuroFieldState" core/backend/system/coremesh/mod.rs
check $? "CoreMesh dépend de NeuroField"

# Clamp présent
grep -q "clamp(0.0, 1.0)" core/backend/system/neuromesh/compute.rs
check $? "NeuroMesh utilise clamp [0.0, 1.0]"

grep -q "clamp(0.0, 1.0)" core/backend/system/coremesh/compute.rs
check $? "CoreMesh utilise clamp [0.0, 1.0]"

# Smooth transition
grep -q "0.7.*0.3" core/backend/system/neuromesh/mod.rs
check $? "NeuroMesh utilise lissage 70/30"

grep -q "0.7.*0.3" core/backend/system/coremesh/mod.rs
check $? "CoreMesh utilise lissage 70/30"

# Tests présents
grep -q "#\[test\]" core/backend/system/neuromesh/mod.rs
check $? "Tests présents dans neuromesh/mod.rs"

grep -q "#\[test\]" core/backend/system/coremesh/mod.rs
check $? "Tests présents dans coremesh/mod.rs"

echo ""

# ============================================
# SECTION 5: MÉTRIQUES FINALES
# ============================================
echo "📊 Section 5: Métriques Finales"
echo "--------------------------------"

# Compter lignes NeuroMesh
NEUROMESH_LINES=$(cat core/backend/system/neuromesh/*.rs 2>/dev/null | wc -l)
echo "NeuroMesh Engine: ${NEUROMESH_LINES} lignes"

# Compter tests NeuroMesh
NEUROMESH_TESTS=$(grep -r "#\[test\]" core/backend/system/neuromesh/ 2>/dev/null | wc -l)
echo "NeuroMesh Engine: ${NEUROMESH_TESTS} tests"

# Compter lignes CoreMesh
COREMESH_LINES=$(cat core/backend/system/coremesh/*.rs 2>/dev/null | wc -l)
echo "CoreMesh Engine: ${COREMESH_LINES} lignes"

# Compter tests CoreMesh
COREMESH_TESTS=$(grep -r "#\[test\]" core/backend/system/coremesh/ 2>/dev/null | wc -l)
echo "CoreMesh Engine: ${COREMESH_TESTS} tests"

TOTAL_LINES=$((NEUROMESH_LINES + COREMESH_LINES))
TOTAL_TESTS=$((NEUROMESH_TESTS + COREMESH_TESTS))

echo ""
echo "Total Neural Mesh Stack: ${TOTAL_LINES} lignes, ${TOTAL_TESTS} tests"

[ $NEUROMESH_LINES -gt 500 ]
check $? "NeuroMesh > 500 lignes"

[ $COREMESH_LINES -gt 500 ]
check $? "CoreMesh > 500 lignes"

[ $NEUROMESH_TESTS -ge 15 ]
check $? "NeuroMesh >= 15 tests"

[ $COREMESH_TESTS -ge 15 ]
check $? "CoreMesh >= 15 tests"

echo ""
echo "=========================================="
echo "RÉSULTAT: ${PASSED_CHECKS}/${TOTAL_CHECKS} checks passed"
echo "=========================================="

if [ $PASSED_CHECKS -eq $TOTAL_CHECKS ]; then
    echo -e "${GREEN}✅ Validation EXCELLENTE - Neural Mesh Stack complètement intégrée${NC}"
    exit 0
else
    FAILED=$((TOTAL_CHECKS - PASSED_CHECKS))
    echo -e "${RED}❌ Validation ÉCHOUÉE - ${FAILED} checks en échec${NC}"
    exit 1
fi
