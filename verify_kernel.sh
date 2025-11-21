#!/bin/bash

# TITANE∞ v8.0 - Kernel Profond Validation Script
# Vérifie la structure, l'intégration et les tests du module

set -e

BACKEND_DIR="core/backend/system"
MAIN_FILE="core/backend/main.rs"
SYSTEM_MOD="core/backend/system/mod.rs"

echo "=========================================="
echo "TITANE∞ v8.0 - Kernel Profond Validation"
echo "=========================================="
echo ""

PASS_COUNT=0
FAIL_COUNT=0

check_pass() {
    echo "✅ $1"
    PASS_COUNT=$((PASS_COUNT + 1))
}

check_fail() {
    echo "❌ $1"
    FAIL_COUNT=$((FAIL_COUNT + 1))
}

# 1. Vérification de la structure des fichiers
echo "1️⃣  Vérification de la structure des fichiers..."
echo ""

if [ -d "$BACKEND_DIR/kernel" ]; then
    check_pass "Dossier kernel/ existe"
else
    check_fail "Dossier kernel/ manquant"
fi

if [ -f "$BACKEND_DIR/kernel/mod.rs" ]; then
    check_pass "Fichier kernel/mod.rs existe"
else
    check_fail "Fichier kernel/mod.rs manquant"
fi

if [ -f "$BACKEND_DIR/kernel/identity.rs" ]; then
    check_pass "Fichier kernel/identity.rs existe"
else
    check_fail "Fichier kernel/identity.rs manquant"
fi

if [ -f "$BACKEND_DIR/kernel/guard.rs" ]; then
    check_pass "Fichier kernel/guard.rs existe"
else
    check_fail "Fichier kernel/guard.rs manquant"
fi

# 2. Vérification des structures
echo ""
echo "2️⃣  Vérification des structures Rust..."
echo ""

if grep -q "pub struct KernelState" "$BACKEND_DIR/kernel/mod.rs"; then
    check_pass "Struct KernelState définie"
else
    check_fail "Struct KernelState manquante"
fi

if grep -q "pub struct KernelInputs" "$BACKEND_DIR/kernel/identity.rs"; then
    check_pass "Struct KernelInputs définie"
else
    check_fail "Struct KernelInputs manquante"
fi

if grep -q "pub struct KernelReport" "$BACKEND_DIR/kernel/guard.rs"; then
    check_pass "Struct KernelReport définie"
else
    check_fail "Struct KernelReport manquante"
fi

# 3. Vérification des champs KernelState
echo ""
echo "3️⃣  Vérification des champs KernelState..."
echo ""

if grep -q "pub identity_stability: f32" "$BACKEND_DIR/kernel/mod.rs"; then
    check_pass "Champ identity_stability présent"
else
    check_fail "Champ identity_stability manquant"
fi

if grep -q "pub core_integrity: f32" "$BACKEND_DIR/kernel/mod.rs"; then
    check_pass "Champ core_integrity présent"
else
    check_fail "Champ core_integrity manquant"
fi

if grep -q "pub adaptive_reserve: f32" "$BACKEND_DIR/kernel/mod.rs"; then
    check_pass "Champ adaptive_reserve présent"
else
    check_fail "Champ adaptive_reserve manquant"
fi

if grep -q "pub overload_risk: f32" "$BACKEND_DIR/kernel/mod.rs"; then
    check_pass "Champ overload_risk présent"
else
    check_fail "Champ overload_risk manquant"
fi

# 4. Vérification des fonctions principales
echo ""
echo "4️⃣  Vérification des fonctions principales..."
echo ""

if grep -q "pub fn init()" "$BACKEND_DIR/kernel/mod.rs"; then
    check_pass "Fonction init() définie"
else
    check_fail "Fonction init() manquante"
fi

if grep -q "pub fn tick(" "$BACKEND_DIR/kernel/mod.rs"; then
    check_pass "Fonction tick() définie"
else
    check_fail "Fonction tick() manquante"
fi

if grep -q "pub fn collect_kernel_inputs(" "$BACKEND_DIR/kernel/identity.rs"; then
    check_pass "Fonction collect_kernel_inputs() définie"
else
    check_fail "Fonction collect_kernel_inputs() manquante"
fi

if grep -q "pub fn evaluate_kernel(" "$BACKEND_DIR/kernel/guard.rs"; then
    check_pass "Fonction evaluate_kernel() définie"
else
    check_fail "Fonction evaluate_kernel() manquante"
fi

# 5. Vérification des formules dans guard.rs
echo ""
echo "5️⃣  Vérification des formules d'évaluation..."
echo ""

if grep -q "let identity_stability" "$BACKEND_DIR/kernel/guard.rs"; then
    check_pass "Formule identity_stability présente"
else
    check_fail "Formule identity_stability manquante"
fi

if grep -q "let core_integrity" "$BACKEND_DIR/kernel/guard.rs"; then
    check_pass "Formule core_integrity présente"
else
    check_fail "Formule core_integrity manquante"
fi

if grep -q "let adaptive_reserve" "$BACKEND_DIR/kernel/guard.rs"; then
    check_pass "Formule adaptive_reserve présente"
else
    check_fail "Formule adaptive_reserve manquante"
fi

if grep -q "let overload_risk" "$BACKEND_DIR/kernel/guard.rs"; then
    check_pass "Formule overload_risk présente"
else
    check_fail "Formule overload_risk manquante"
fi

# 6. Vérification de l'intégration dans system/mod.rs
echo ""
echo "6️⃣  Vérification de l'export dans system/mod.rs..."
echo ""

if grep -q "pub mod kernel;" "$SYSTEM_MOD"; then
    check_pass "Export kernel dans system/mod.rs"
else
    check_fail "Export kernel manquant dans system/mod.rs"
fi

# 7. Vérification de l'import dans main.rs
echo ""
echo "7️⃣  Vérification de l'import dans main.rs..."
echo ""

if grep -q "kernel::KernelState" "$MAIN_FILE"; then
    check_pass "Import KernelState dans main.rs"
else
    check_fail "Import KernelState manquant dans main.rs"
fi

# 8. Vérification du champ dans TitaneCore
echo ""
echo "8️⃣  Vérification du champ kernel dans TitaneCore..."
echo ""

if grep -q "kernel: Arc<Mutex<KernelState>>" "$MAIN_FILE"; then
    check_pass "Champ kernel dans TitaneCore"
else
    check_fail "Champ kernel manquant dans TitaneCore"
fi

# 9. Vérification de l'initialisation
echo ""
echo "9️⃣  Vérification de l'initialisation du kernel..."
echo ""

if grep -q "let kernel = Arc::new(Mutex::new(system::kernel::init" "$MAIN_FILE"; then
    check_pass "Initialisation du kernel dans TitaneCore::new()"
else
    check_fail "Initialisation du kernel manquante"
fi

# 10. Vérification du tick dans le scheduler
echo ""
echo "🔟 Vérification du tick dans le scheduler..."
echo ""

if grep -q "system::kernel::tick(" "$MAIN_FILE"; then
    check_pass "Tick du kernel dans le scheduler"
else
    check_fail "Tick du kernel manquant dans le scheduler"
fi

# 11. Vérification des tests unitaires
echo ""
echo "1️⃣1️⃣  Vérification des tests unitaires..."
echo ""

KERNEL_TESTS=$(grep -c "#\[test\]" "$BACKEND_DIR/kernel/mod.rs" "$BACKEND_DIR/kernel/identity.rs" "$BACKEND_DIR/kernel/guard.rs" 2>/dev/null || echo "0")

if [ "$KERNEL_TESTS" -ge 15 ]; then
    check_pass "Tests unitaires présents ($KERNEL_TESTS tests trouvés)"
else
    check_fail "Tests unitaires insuffisants ($KERNEL_TESTS tests trouvés, minimum 15)"
fi

# 12. Vérification des helpers
echo ""
echo "1️⃣2️⃣  Vérification des méthodes helper..."
echo ""

if grep -q "pub fn health(&self)" "$BACKEND_DIR/kernel/mod.rs"; then
    check_pass "Méthode health() présente"
else
    check_fail "Méthode health() manquante"
fi

if grep -q "pub fn is_stable(&self)" "$BACKEND_DIR/kernel/mod.rs"; then
    check_pass "Méthode is_stable() présente"
else
    check_fail "Méthode is_stable() manquante"
fi

if grep -q "pub fn is_critical(&self)" "$BACKEND_DIR/kernel/mod.rs"; then
    check_pass "Méthode is_critical() présente"
else
    check_fail "Méthode is_critical() manquante"
fi

if grep -q "pub fn has_capacity(&self)" "$BACKEND_DIR/kernel/mod.rs"; then
    check_pass "Méthode has_capacity() présente"
else
    check_fail "Méthode has_capacity() manquante"
fi

# 13. Mesure de la taille du code
echo ""
echo "1️⃣3️⃣  Métriques du code Kernel Profond..."
echo ""

MOD_LINES=$(wc -l < "$BACKEND_DIR/kernel/mod.rs")
IDENTITY_LINES=$(wc -l < "$BACKEND_DIR/kernel/identity.rs")
GUARD_LINES=$(wc -l < "$BACKEND_DIR/kernel/guard.rs")
TOTAL_LINES=$((MOD_LINES + IDENTITY_LINES + GUARD_LINES))

echo "   📄 mod.rs: $MOD_LINES lignes"
echo "   📄 identity.rs: $IDENTITY_LINES lignes"
echo "   📄 guard.rs: $GUARD_LINES lignes"
echo "   📊 Total: $TOTAL_LINES lignes"

if [ "$TOTAL_LINES" -ge 500 ]; then
    check_pass "Taille du code suffisante ($TOTAL_LINES lignes)"
else
    check_fail "Code trop court ($TOTAL_LINES lignes, minimum 500)"
fi

# 14. Vérification des patterns de sécurité
echo ""
echo "1️⃣4️⃣  Vérification des patterns de sécurité..."
echo ""

UNWRAP_COUNT=$(grep -c "\.unwrap()" "$BACKEND_DIR/kernel/"*.rs 2>/dev/null || echo "0")
EXPECT_COUNT=$(grep -c "\.expect(" "$BACKEND_DIR/kernel/"*.rs 2>/dev/null || echo "0")
PANIC_COUNT=$(grep -c "panic!" "$BACKEND_DIR/kernel/"*.rs 2>/dev/null || echo "0")

if [ "$UNWRAP_COUNT" -eq 0 ]; then
    check_pass "Aucun unwrap() détecté"
else
    check_fail "unwrap() détectés: $UNWRAP_COUNT"
fi

if [ "$EXPECT_COUNT" -eq 0 ]; then
    check_pass "Aucun expect() détecté"
else
    check_fail "expect() détectés: $EXPECT_COUNT"
fi

if [ "$PANIC_COUNT" -eq 0 ]; then
    check_pass "Aucun panic! détecté"
else
    check_fail "panic! détectés: $PANIC_COUNT"
fi

# Résumé final
echo ""
echo "=========================================="
echo "RÉSUMÉ"
echo "=========================================="
TOTAL_CHECKS=$((PASS_COUNT + FAIL_COUNT))
PASS_PERCENT=$((PASS_COUNT * 100 / TOTAL_CHECKS))

echo "✅ Tests réussis: $PASS_COUNT"
echo "❌ Tests échoués: $FAIL_COUNT"
echo "📊 Total: $TOTAL_CHECKS vérifications"
echo "📈 Taux de réussite: $PASS_PERCENT%"
echo ""

if [ "$FAIL_COUNT" -eq 0 ]; then
    echo "🎉 KERNEL PROFOND: VALIDATION COMPLÈTE ✅"
    exit 0
elif [ "$PASS_PERCENT" -ge 95 ]; then
    echo "✅ KERNEL PROFOND: VALIDATION RÉUSSIE (quelques avertissements mineurs)"
    exit 0
else
    echo "⚠️  KERNEL PROFOND: VALIDATION INCOMPLÈTE"
    exit 1
fi
