#!/usr/bin/env bash
# Test Complet et Analyse Approfondie - Cline CLI + Hooks
# TITANE∞ Project - Verification Final

set -euo pipefail

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Compteurs
TESTS_TOTAL=0
TESTS_PASSED=0
TESTS_FAILED=0
WARNINGS=0

# Fonction de test
test_section() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
}

test_item() {
    ((TESTS_TOTAL++))
    echo -ne "Testing: $1 ... "
}

test_pass() {
    ((TESTS_PASSED++))
    echo -e "${GREEN}✅ PASS${NC}"
    [ -n "${1:-}" ] && echo "   └─ $1"
}

test_fail() {
    ((TESTS_FAILED++))
    echo -e "${RED}❌ FAIL${NC}"
    [ -n "${1:-}" ] && echo "   └─ $1"
}

test_warn() {
    ((WARNINGS++))
    echo -e "${YELLOW}⚠️  WARN${NC}"
    [ -n "${1:-}" ] && echo "   └─ $1"
}

cd /home/titane-os/Documents/GitHub/TITANE_INFINITY

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  🧪 TEST COMPLET ET ANALYSE APPROFONDIE - CLINE CLI     ║${NC}"
echo -e "${GREEN}║  TITANE∞ v26.2.0+ - Installation Validation             ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Date: $(date -Iseconds)"
echo "Workspace: $PWD"
echo ""

# ═══════════════════════════════════════════════════════════
# SECTION 1: PRÉREQUIS SYSTÈME
# ═══════════════════════════════════════════════════════════
test_section "1️⃣  PRÉREQUIS SYSTÈME"

# Test Node.js
test_item "Node.js version >= 20"
NODE_VERSION=$(node --version | sed 's/v//')
NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)
if [ "$NODE_MAJOR" -ge 20 ]; then
    test_pass "Node.js v$NODE_VERSION (>= 20 requis)"
else
    test_fail "Node.js v$NODE_VERSION insuffisant (>= 20 requis)"
fi

# Test npm
test_item "npm disponible"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    test_pass "npm v$NPM_VERSION"
else
    test_fail "npm non installé"
fi

# Test jq
test_item "jq (JSON processor)"
if command -v jq &> /dev/null; then
    JQ_VERSION=$(jq --version)
    test_pass "$JQ_VERSION"
else
    test_warn "jq non installé (optionnel mais recommandé)"
fi

# Test git
test_item "git disponible"
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version | awk '{print $3}')
    test_pass "git v$GIT_VERSION"
else
    test_fail "git non installé"
fi

# ═══════════════════════════════════════════════════════════
# SECTION 2: INSTALLATION CLINE CLI
# ═══════════════════════════════════════════════════════════
test_section "2️⃣  INSTALLATION CLINE CLI"

# Test Cline CLI installé
test_item "Cline CLI installé"
if command -v cline &> /dev/null; then
    CLINE_VERSION=$(cline version 2>/dev/null | grep "Cline CLI Version" | awk '{print $4}')
    test_pass "Cline CLI v$CLINE_VERSION"
else
    test_fail "Cline CLI non installé"
    exit 1
fi

# Test version Cline Core
test_item "Cline Core version"
CORE_VERSION=$(cline version 2>/dev/null | grep "Cline Core Version" | awk '{print $4}')
if [ -n "$CORE_VERSION" ]; then
    test_pass "Cline Core v$CORE_VERSION"
else
    test_fail "Version Core non détectée"
fi

# Test commande cline help
test_item "Cline CLI commandes disponibles"
if cline --help &> /dev/null; then
    test_pass "Aide Cline accessible"
else
    test_fail "Commande help échouée"
fi

# ═══════════════════════════════════════════════════════════
# SECTION 3: AUTHENTIFICATION
# ═══════════════════════════════════════════════════════════
test_section "3️⃣  AUTHENTIFICATION ET CONFIGURATION"

# Test configuration API
test_item "Configuration API provider"
if cline config list 2>/dev/null | grep -q "api-configuration"; then
    PROVIDER=$(cline config list 2>/dev/null | grep "plan-mode-api-provider" | awk '{print $2}')
    test_pass "Provider: $PROVIDER"
else
    test_fail "Configuration API manquante"
fi

# Test plan-mode provider
test_item "Plan mode provider"
PLAN_PROVIDER=$(cline config list 2>/dev/null | grep "plan-mode-api-provider" | awk '{print $2}')
if [ -n "$PLAN_PROVIDER" ]; then
    test_pass "Plan mode: $PLAN_PROVIDER"
else
    test_fail "Plan mode non configuré"
fi

# Test act-mode provider
test_item "Act mode provider"
ACT_PROVIDER=$(cline config list 2>/dev/null | grep "act-mode-api-provider" | awk '{print $2}')
if [ -n "$ACT_PROVIDER" ]; then
    test_pass "Act mode: $ACT_PROVIDER"
else
    test_fail "Act mode non configuré"
fi

# ═══════════════════════════════════════════════════════════
# SECTION 4: STRUCTURE HOOKS
# ═══════════════════════════════════════════════════════════
test_section "4️⃣  STRUCTURE DES HOOKS"

# Test répertoire .clinerules
test_item "Répertoire .clinerules existe"
if [ -d ".clinerules" ]; then
    test_pass "Répertoire présent"
else
    test_fail "Répertoire .clinerules manquant"
fi

# Test répertoire hooks
test_item "Répertoire .clinerules/hooks existe"
if [ -d ".clinerules/hooks" ]; then
    HOOK_COUNT=$(ls -1 .clinerules/hooks/ 2>/dev/null | grep -v README | wc -l)
    test_pass "$HOOK_COUNT hooks trouvés"
else
    test_fail "Répertoire hooks manquant"
fi

# Test répertoire logs
test_item "Répertoire .clinerules/logs existe"
if [ -d ".clinerules/logs" ]; then
    test_pass "Répertoire logs présent"
else
    test_warn "Répertoire logs absent (sera créé automatiquement)"
    mkdir -p .clinerules/logs
fi

# ═══════════════════════════════════════════════════════════
# SECTION 5: HOOKS INDIVIDUELS
# ═══════════════════════════════════════════════════════════
test_section "5️⃣  VALIDATION DES HOOKS"

# Test TaskStart
test_item "Hook TaskStart existe et exécutable"
if [ -f ".clinerules/hooks/TaskStart" ] && [ -x ".clinerules/hooks/TaskStart" ]; then
    test_pass "TaskStart OK"
else
    test_fail "TaskStart manquant ou non exécutable"
fi

# Test PreToolUse
test_item "Hook PreToolUse existe et exécutable"
if [ -f ".clinerules/hooks/PreToolUse" ] && [ -x ".clinerules/hooks/PreToolUse" ]; then
    test_pass "PreToolUse OK"
else
    test_fail "PreToolUse manquant ou non exécutable"
fi

# Test PostToolUse
test_item "Hook PostToolUse existe et exécutable"
if [ -f ".clinerules/hooks/PostToolUse" ] && [ -x ".clinerules/hooks/PostToolUse" ]; then
    test_pass "PostToolUse OK"
else
    test_fail "PostToolUse manquant ou non exécutable"
fi

# Test UserPromptSubmit
test_item "Hook UserPromptSubmit existe et exécutable"
if [ -f ".clinerules/hooks/UserPromptSubmit" ] && [ -x ".clinerules/hooks/UserPromptSubmit" ]; then
    test_pass "UserPromptSubmit OK"
else
    test_fail "UserPromptSubmit manquant ou non exécutable"
fi

# ═══════════════════════════════════════════════════════════
# SECTION 6: TESTS FONCTIONNELS DES HOOKS
# ═══════════════════════════════════════════════════════════
test_section "6️⃣  TESTS FONCTIONNELS DES HOOKS"

# Test TaskStart - Injection contexte
test_item "TaskStart injecte contexte TITANE∞"
TEST_INPUT='{"clineVersion":"3.39.2","hookName":"TaskStart","timestamp":"2026-01-02T23:00:00Z","taskId":"test","workspaceRoots":["/test"],"userId":"test","taskStart":{"taskMetadata":{"taskId":"test","ulid":"test","initialTask":"test"}}}'
RESULT=$(echo "$TEST_INPUT" | .clinerules/hooks/TaskStart 2>/dev/null)
if echo "$RESULT" | jq -e '.cancel == false' &>/dev/null && echo "$RESULT" | jq -e '.contextModification' | grep -q "TITANE"; then
    test_pass "Contexte TITANE∞ injecté correctement"
else
    test_fail "Injection contexte échouée"
fi

# Test PreToolUse - Blocage build
test_item "PreToolUse bloque npm run build"
TEST_INPUT='{"clineVersion":"3.39.2","hookName":"PreToolUse","timestamp":"2026-01-02T23:00:00Z","taskId":"test","workspaceRoots":["/test"],"userId":"test","preToolUse":{"toolName":"execute_command","parameters":{"command":"npm run build"}}}'
RESULT=$(echo "$TEST_INPUT" | .clinerules/hooks/PreToolUse 2>/dev/null)
if echo "$RESULT" | jq -e '.cancel == true' &>/dev/null && echo "$RESULT" | jq -e '.errorMessage' | grep -q "VIOLATION"; then
    test_pass "Build bloqué avec message approprié"
else
    test_fail "Blocage build échoué"
fi

# Test PreToolUse - Autorisation dev
test_item "PreToolUse autorise npm run dev"
TEST_INPUT='{"clineVersion":"3.39.2","hookName":"PreToolUse","timestamp":"2026-01-02T23:00:00Z","taskId":"test","workspaceRoots":["/test"],"userId":"test","preToolUse":{"toolName":"execute_command","parameters":{"command":"npm run dev"}}}'
RESULT=$(echo "$TEST_INPUT" | .clinerules/hooks/PreToolUse 2>/dev/null)
if echo "$RESULT" | jq -e '.cancel == false' &>/dev/null; then
    test_pass "npm run dev autorisé"
else
    test_fail "npm run dev bloqué à tort"
fi

# Test PreToolUse - Blocage dpkg
test_item "PreToolUse bloque installations système"
TEST_INPUT='{"clineVersion":"3.39.2","hookName":"PreToolUse","timestamp":"2026-01-02T23:00:00Z","taskId":"test","workspaceRoots":["/test"],"userId":"test","preToolUse":{"toolName":"execute_command","parameters":{"command":"sudo dpkg -i test.deb"}}}'
RESULT=$(echo "$TEST_INPUT" | .clinerules/hooks/PreToolUse 2>/dev/null)
if echo "$RESULT" | jq -e '.cancel == true' &>/dev/null; then
    test_pass "Installation système bloquée"
else
    test_fail "Installation système non bloquée"
fi

# Test PreToolUse - Blocage fichiers .js
test_item "PreToolUse bloque fichiers .js en projet TypeScript"
TEST_INPUT='{"clineVersion":"3.39.2","hookName":"PreToolUse","timestamp":"2026-01-02T23:00:00Z","taskId":"test","workspaceRoots":["/test"],"userId":"test","preToolUse":{"toolName":"write_to_file","parameters":{"path":"test.js"}}}'
RESULT=$(echo "$TEST_INPUT" | .clinerules/hooks/PreToolUse 2>/dev/null)
if echo "$RESULT" | jq -e '.cancel == true' &>/dev/null; then
    test_pass "Fichier .js bloqué"
else
    test_fail "Fichier .js non bloqué"
fi

# Test PostToolUse - Opération normale
test_item "PostToolUse traite opérations normales"
TEST_INPUT='{"clineVersion":"3.39.2","hookName":"PostToolUse","timestamp":"2026-01-02T23:00:00Z","taskId":"test","workspaceRoots":["/test"],"userId":"test","postToolUse":{"toolName":"read_file","parameters":{},"result":"success","success":true,"executionTimeMs":100}}'
RESULT=$(echo "$TEST_INPUT" | .clinerules/hooks/PostToolUse 2>/dev/null)
if echo "$RESULT" | jq -e '.cancel == false' &>/dev/null; then
    test_pass "Opération normale traitée"
else
    test_fail "PostToolUse échoué"
fi

# Test UserPromptSubmit - Détection React
test_item "UserPromptSubmit détecte mots-clés React"
TEST_INPUT='{"clineVersion":"3.39.2","hookName":"UserPromptSubmit","timestamp":"2026-01-02T23:00:00Z","taskId":"test","workspaceRoots":["/test"],"userId":"test","userPromptSubmit":{"prompt":"Créer un composant React"}}'
RESULT=$(echo "$TEST_INPUT" | .clinerules/hooks/UserPromptSubmit 2>/dev/null)
if echo "$RESULT" | jq -e '.contextModification' 2>/dev/null | grep -qi "react"; then
    test_pass "Contexte React injecté"
else
    test_warn "Contexte React non détecté (optionnel)"
fi

# Test UserPromptSubmit - Détection déploiement
test_item "UserPromptSubmit détecte demandes déploiement"
TEST_INPUT='{"clineVersion":"3.39.2","hookName":"UserPromptSubmit","timestamp":"2026-01-02T23:00:00Z","taskId":"test","workspaceRoots":["/test"],"userId":"test","userPromptSubmit":{"prompt":"Deploy to production"}}'
RESULT=$(echo "$TEST_INPUT" | .clinerules/hooks/UserPromptSubmit 2>/dev/null)
if echo "$RESULT" | jq -e '.contextModification' 2>/dev/null | grep -qi "DEPLOYMENT"; then
    test_pass "Avertissement déploiement injecté"
else
    test_warn "Avertissement déploiement non détecté"
fi

# ═══════════════════════════════════════════════════════════
# SECTION 7: DOCUMENTATION
# ═══════════════════════════════════════════════════════════
test_section "7️⃣  DOCUMENTATION"

# Test fichiers documentation
for doc in "CLINE_QUICKSTART.md" "CLINE_CLI_INSTALLATION.md" "CLINE_EXAMPLES.md" "CLINE_INSTALLATION_SUCCESS.md" ".clinerules/hooks/README.md"; do
    test_item "Documentation: $doc"
    if [ -f "$doc" ]; then
        SIZE=$(stat -f%z "$doc" 2>/dev/null || stat -c%s "$doc" 2>/dev/null)
        test_pass "Présent (${SIZE} bytes)"
    else
        test_fail "Manquant"
    fi
done

# Test contenu documentation
test_item "Documentation contient exemples"
if grep -q "cline.*hooks_enabled" CLINE_QUICKSTART.md 2>/dev/null; then
    test_pass "Exemples présents"
else
    test_warn "Exemples manquants"
fi

# ═══════════════════════════════════════════════════════════
# SECTION 8: SCRIPTS NPM
# ═══════════════════════════════════════════════════════════
test_section "8️⃣  SCRIPTS NPM"

# Test scripts cline dans package.json
test_item "Scripts cline:* dans package.json"
if grep -q "cline:verify" package.json; then
    SCRIPT_COUNT=$(grep -c "\"cline:" package.json || true)
    test_pass "$SCRIPT_COUNT scripts cline:* trouvés"
else
    test_fail "Scripts cline:* manquants"
fi

# Test exécution npm run cline:verify
test_item "npm run cline:verify exécutable"
if npm run cline:verify &>/dev/null; then
    test_pass "cline:verify fonctionne"
else
    test_fail "cline:verify échoue"
fi

# ═══════════════════════════════════════════════════════════
# SECTION 9: INTÉGRATION GIT
# ═══════════════════════════════════════════════════════════
test_section "9️⃣  INTÉGRATION GIT"

# Test commits récents
test_item "Commits Cline présents"
if git log --oneline -5 | grep -q "Cline"; then
    COMMIT_COUNT=$(git log --oneline --all | grep -c "Cline" || true)
    test_pass "$COMMIT_COUNT commits Cline trouvés"
else
    test_warn "Commits Cline non trouvés"
fi

# Test fichiers staged
test_item "Pas de modifications non committées"
if [ -z "$(git status --porcelain)" ]; then
    test_pass "Working directory propre"
else
    test_warn "Modifications non committées présentes"
fi

# ═══════════════════════════════════════════════════════════
# SECTION 10: SÉCURITÉ
# ═══════════════════════════════════════════════════════════
test_section "🔒 SÉCURITÉ ET PROTECTION"

# Test permissions hooks
test_item "Permissions hooks correctes"
PERM_ISSUES=0
for hook in .clinerules/hooks/TaskStart .clinerules/hooks/PreToolUse .clinerules/hooks/PostToolUse .clinerules/hooks/UserPromptSubmit; do
    if [ -f "$hook" ] && [ ! -x "$hook" ]; then
        ((PERM_ISSUES++))
    fi
done
if [ "$PERM_ISSUES" -eq 0 ]; then
    test_pass "Tous les hooks sont exécutables"
else
    test_fail "$PERM_ISSUES hooks non exécutables"
fi

# Test absence de secrets
test_item "Pas de secrets dans hooks"
if grep -rE '(API_KEY|SECRET|PASSWORD|TOKEN).*=.*[a-zA-Z0-9]{20,}' .clinerules/hooks/ 2>/dev/null; then
    test_warn "Secrets potentiels détectés"
else
    test_pass "Aucun secret détecté"
fi

# ═══════════════════════════════════════════════════════════
# RAPPORT FINAL
# ═══════════════════════════════════════════════════════════
echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}📊 RAPPORT FINAL${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

echo "Tests Totaux:  $TESTS_TOTAL"
echo -e "Tests Passés:  ${GREEN}$TESTS_PASSED ✅${NC}"
[ "$TESTS_FAILED" -gt 0 ] && echo -e "Tests Échoués: ${RED}$TESTS_FAILED ❌${NC}" || echo -e "Tests Échoués: ${GREEN}0 ✅${NC}"
[ "$WARNINGS" -gt 0 ] && echo -e "Avertissements: ${YELLOW}$WARNINGS ⚠️${NC}" || echo -e "Avertissements: ${GREEN}0 ✅${NC}"

echo ""

# Calcul pourcentage réussite
if [ "$TESTS_TOTAL" -gt 0 ]; then
    SUCCESS_RATE=$((TESTS_PASSED * 100 / TESTS_TOTAL))
    echo -e "Taux de Réussite: ${GREEN}${SUCCESS_RATE}%${NC}"
else
    SUCCESS_RATE=0
fi

echo ""

# Verdict final
if [ "$TESTS_FAILED" -eq 0 ]; then
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║          ✨ INSTALLATION 100% VALIDÉE ✨                ║${NC}"
    echo -e "${GREEN}║  Cline CLI + Hooks prêts pour utilisation production    ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
    EXIT_CODE=0
elif [ "$SUCCESS_RATE" -ge 90 ]; then
    echo -e "${YELLOW}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║     ⚠️  INSTALLATION VALIDE AVEC AVERTISSEMENTS        ║${NC}"
    echo -e "${YELLOW}║  Quelques optimisations recommandées                    ║${NC}"
    echo -e "${YELLOW}╚═══════════════════════════════════════════════════════════╝${NC}"
    EXIT_CODE=0
else
    echo -e "${RED}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║          ❌ ÉCHECS CRITIQUES DÉTECTÉS                   ║${NC}"
    echo -e "${RED}║  Corriger les erreurs avant utilisation                  ║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════════════════════════╝${NC}"
    EXIT_CODE=1
fi

echo ""
echo "Date: $(date -Iseconds)"
echo "Workspace: $PWD"
echo ""

exit $EXIT_CODE
