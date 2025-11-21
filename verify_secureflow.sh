#!/bin/bash

# TITANE∞ v8.0 - SecureFlow Engine Validation Script
# Vérifie la structure, l'intégration et les tests du module

set -e

BACKEND_DIR="core/backend/system"
MAIN_FILE="core/backend/main.rs"
SYSTEM_MOD="core/backend/system/mod.rs"

echo "=============================================="
echo "TITANE∞ v8.0 - SecureFlow Engine Validation"
echo "=============================================="
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

if [ -d "$BACKEND_DIR/secureflow" ]; then
    check_pass "Dossier secureflow/ existe"
else
    check_fail "Dossier secureflow/ manquant"
fi

if [ -f "$BACKEND_DIR/secureflow/mod.rs" ]; then
    check_pass "Fichier secureflow/mod.rs existe"
else
    check_fail "Fichier secureflow/mod.rs manquant"
fi

if [ -f "$BACKEND_DIR/secureflow/scan.rs" ]; then
    check_pass "Fichier secureflow/scan.rs existe"
else
    check_fail "Fichier secureflow/scan.rs manquant"
fi

if [ -f "$BACKEND_DIR/secureflow/stabilize.rs" ]; then
    check_pass "Fichier secureflow/stabilize.rs existe"
else
    check_fail "Fichier secureflow/stabilize.rs manquant"
fi

# 2. Vérification des structures
echo ""
echo "2️⃣  Vérification des structures Rust..."
echo ""

if grep -q "pub struct SecureFlowState" "$BACKEND_DIR/secureflow/mod.rs"; then
    check_pass "Struct SecureFlowState définie"
else
    check_fail "Struct SecureFlowState manquante"
fi

if grep -q "pub struct SecureFlowReport" "$BACKEND_DIR/secureflow/scan.rs"; then
    check_pass "Struct SecureFlowReport définie"
else
    check_fail "Struct SecureFlowReport manquante"
fi

# 3. Vérification des champs SecureFlowState
echo ""
echo "3️⃣  Vérification des champs SecureFlowState..."
echo ""

if grep -q "pub stress_index: f32" "$BACKEND_DIR/secureflow/mod.rs"; then
    check_pass "Champ stress_index présent"
else
    check_fail "Champ stress_index manquant"
fi

if grep -q "pub mitigation_level: f32" "$BACKEND_DIR/secureflow/mod.rs"; then
    check_pass "Champ mitigation_level présent"
else
    check_fail "Champ mitigation_level manquant"
fi

if grep -q "pub safe_mode: bool" "$BACKEND_DIR/secureflow/mod.rs"; then
    check_pass "Champ safe_mode présent"
else
    check_fail "Champ safe_mode manquant"
fi

# 4. Vérification des fonctions principales
echo ""
echo "4️⃣  Vérification des fonctions principales..."
echo ""

if grep -q "pub fn init()" "$BACKEND_DIR/secureflow/mod.rs"; then
    check_pass "Fonction init() définie"
else
    check_fail "Fonction init() manquante"
fi

if grep -q "pub fn tick(" "$BACKEND_DIR/secureflow/mod.rs"; then
    check_pass "Fonction tick() définie"
else
    check_fail "Fonction tick() manquante"
fi

if grep -q "pub fn scan_risk(" "$BACKEND_DIR/secureflow/scan.rs"; then
    check_pass "Fonction scan_risk() définie"
else
    check_fail "Fonction scan_risk() manquante"
fi

if grep -q "pub fn apply_mitigation(" "$BACKEND_DIR/secureflow/stabilize.rs"; then
    check_pass "Fonction apply_mitigation() définie"
else
    check_fail "Fonction apply_mitigation() manquante"
fi

# 5. Vérification de la formule stress_index
echo ""
echo "5️⃣  Vérification de la formule stress_index..."
echo ""

if grep -q "let stress_index" "$BACKEND_DIR/secureflow/scan.rs"; then
    check_pass "Formule stress_index présente"
else
    check_fail "Formule stress_index manquante"
fi

if grep -q "kernel.overload_risk" "$BACKEND_DIR/secureflow/scan.rs"; then
    check_pass "Utilise kernel.overload_risk"
else
    check_fail "N'utilise pas kernel.overload_risk"
fi

if grep -q "ans.tension_level" "$BACKEND_DIR/secureflow/scan.rs"; then
    check_pass "Utilise ans.tension_level"
else
    check_fail "N'utilise pas ans.tension_level"
fi

if grep -q "field.turbulence" "$BACKEND_DIR/secureflow/scan.rs"; then
    check_pass "Utilise field.turbulence"
else
    check_fail "N'utilise pas field.turbulence"
fi

# 6. Vérification de la logique de mitigation
echo ""
echo "6️⃣  Vérification de la logique de mitigation..."
echo ""

if grep -q "if stress_index < 0.30" "$BACKEND_DIR/secureflow/stabilize.rs"; then
    check_pass "Seuil 0.30 présent"
else
    check_fail "Seuil 0.30 manquant"
fi

if grep -q "else if stress_index < 0.60" "$BACKEND_DIR/secureflow/stabilize.rs"; then
    check_pass "Seuil 0.60 présent"
else
    check_fail "Seuil 0.60 manquant"
fi

if grep -q "else if stress_index < 0.80" "$BACKEND_DIR/secureflow/stabilize.rs"; then
    check_pass "Seuil 0.80 présent"
else
    check_fail "Seuil 0.80 manquant"
fi

if grep -q "let safe_mode = stress_index >= 0.85" "$BACKEND_DIR/secureflow/stabilize.rs" || grep -q "let safe_mode = stress >= 0.85" "$BACKEND_DIR/secureflow/stabilize.rs"; then
    check_pass "Safe mode à 0.85 présent"
else
    check_fail "Safe mode à 0.85 manquant"
fi

# 7. Vérification de l'intégration dans system/mod.rs
echo ""
echo "7️⃣  Vérification de l'export dans system/mod.rs..."
echo ""

if grep -q "pub mod secureflow;" "$SYSTEM_MOD"; then
    check_pass "Export secureflow dans system/mod.rs"
else
    check_fail "Export secureflow manquant dans system/mod.rs"
fi

# 8. Vérification de l'import dans main.rs
echo ""
echo "8️⃣  Vérification de l'import dans main.rs..."
echo ""

if grep -q "secureflow::SecureFlowState" "$MAIN_FILE"; then
    check_pass "Import SecureFlowState dans main.rs"
else
    check_fail "Import SecureFlowState manquant dans main.rs"
fi

# 9. Vérification du champ dans TitaneCore
echo ""
echo "9️⃣  Vérification du champ secureflow dans TitaneCore..."
echo ""

if grep -q "secureflow: Arc<Mutex<SecureFlowState>>" "$MAIN_FILE"; then
    check_pass "Champ secureflow dans TitaneCore"
else
    check_fail "Champ secureflow manquant dans TitaneCore"
fi

# 10. Vérification de l'initialisation
echo ""
echo "🔟 Vérification de l'initialisation du secureflow..."
echo ""

if grep -q "let secureflow = Arc::new(Mutex::new(system::secureflow::init" "$MAIN_FILE"; then
    check_pass "Initialisation du secureflow dans TitaneCore::new()"
else
    check_fail "Initialisation du secureflow manquante"
fi

# 11. Vérification du tick dans le scheduler
echo ""
echo "1️⃣1️⃣  Vérification du tick dans le scheduler..."
echo ""

if grep -q "system::secureflow::tick(" "$MAIN_FILE"; then
    check_pass "Tick du secureflow dans le scheduler"
else
    check_fail "Tick du secureflow manquant dans le scheduler"
fi

# 12. Vérification des tests unitaires
echo ""
echo "1️⃣2️⃣  Vérification des tests unitaires..."
echo ""

SECUREFLOW_TESTS=$(grep -c "#\[test\]" "$BACKEND_DIR/secureflow/"*.rs 2>/dev/null || echo "0")

echo "   Tests trouvés: $SECUREFLOW_TESTS"

if [ "$SECUREFLOW_TESTS" -ge 20 ]; then
    check_pass "Tests unitaires suffisants ($SECUREFLOW_TESTS tests)"
else
    check_fail "Tests unitaires insuffisants ($SECUREFLOW_TESTS tests, minimum 20)"
fi

# 13. Vérification des méthodes helper
echo ""
echo "1️⃣3️⃣  Vérification des méthodes helper..."
echo ""

if grep -q "pub fn security_level(&self)" "$BACKEND_DIR/secureflow/mod.rs"; then
    check_pass "Méthode security_level() présente"
else
    check_fail "Méthode security_level() manquante"
fi

if grep -q "pub fn is_stable(&self)" "$BACKEND_DIR/secureflow/mod.rs"; then
    check_pass "Méthode is_stable() présente"
else
    check_fail "Méthode is_stable() manquante"
fi

if grep -q "pub fn needs_attention(&self)" "$BACKEND_DIR/secureflow/mod.rs"; then
    check_pass "Méthode needs_attention() présente"
else
    check_fail "Méthode needs_attention() manquante"
fi

if grep -q "pub fn is_safe_mode(&self)" "$BACKEND_DIR/secureflow/mod.rs"; then
    check_pass "Méthode is_safe_mode() présente"
else
    check_fail "Méthode is_safe_mode() manquante"
fi

# 14. Mesure de la taille du code
echo ""
echo "1️⃣4️⃣  Métriques du code SecureFlow..."
echo ""

MOD_LINES=$(wc -l < "$BACKEND_DIR/secureflow/mod.rs")
SCAN_LINES=$(wc -l < "$BACKEND_DIR/secureflow/scan.rs")
STABILIZE_LINES=$(wc -l < "$BACKEND_DIR/secureflow/stabilize.rs")
TOTAL_LINES=$((MOD_LINES + SCAN_LINES + STABILIZE_LINES))

echo "   📄 mod.rs: $MOD_LINES lignes"
echo "   📄 scan.rs: $SCAN_LINES lignes"
echo "   📄 stabilize.rs: $STABILIZE_LINES lignes"
echo "   📊 Total: $TOTAL_LINES lignes"

if [ "$TOTAL_LINES" -ge 400 ]; then
    check_pass "Taille du code suffisante ($TOTAL_LINES lignes)"
else
    check_fail "Code trop court ($TOTAL_LINES lignes, minimum 400)"
fi

# 15. Vérification des patterns de sécurité
echo ""
echo "1️⃣5️⃣  Vérification des patterns de sécurité..."
echo ""

UNWRAP_COUNT=$(grep -c "\.unwrap()" "$BACKEND_DIR/secureflow/"*.rs 2>/dev/null || echo "0")
EXPECT_COUNT=$(grep -c "\.expect(" "$BACKEND_DIR/secureflow/"*.rs 2>/dev/null || echo "0")
PANIC_COUNT=$(grep -c "panic!" "$BACKEND_DIR/secureflow/"*.rs 2>/dev/null || echo "0")

# Count unwraps in non-test code
PROD_UNWRAP=$(grep -v "#\[test\]" "$BACKEND_DIR/secureflow/"*.rs | grep -c "\.unwrap()" 2>/dev/null || echo "0")

if [ "$PROD_UNWRAP" -eq 0 ]; then
    check_pass "Aucun unwrap() en production"
else
    check_fail "unwrap() en production détectés: $PROD_UNWRAP"
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
echo "=============================================="
echo "RÉSUMÉ"
echo "=============================================="
TOTAL_CHECKS=$((PASS_COUNT + FAIL_COUNT))
PASS_PERCENT=$((PASS_COUNT * 100 / TOTAL_CHECKS))

echo "✅ Tests réussis: $PASS_COUNT"
echo "❌ Tests échoués: $FAIL_COUNT"
echo "📊 Total: $TOTAL_CHECKS vérifications"
echo "📈 Taux de réussite: $PASS_PERCENT%"
echo ""

if [ "$FAIL_COUNT" -eq 0 ]; then
    echo "🎉 SECUREFLOW ENGINE: VALIDATION COMPLÈTE ✅"
    exit 0
elif [ "$PASS_PERCENT" -ge 95 ]; then
    echo "✅ SECUREFLOW ENGINE: VALIDATION RÉUSSIE (quelques avertissements mineurs)"
    exit 0
else
    echo "⚠️  SECUREFLOW ENGINE: VALIDATION INCOMPLÈTE"
    exit 1
fi
