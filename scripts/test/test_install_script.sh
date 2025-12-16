#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# 🧪 TITANE∞ — TEST DU SCRIPT D'INSTALLATION
# ═══════════════════════════════════════════════════════════════════════════════
# Teste la syntaxe et la structure du script d'installation sans l'exécuter
# ═══════════════════════════════════════════════════════════════════════════════

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${CYAN}${BOLD}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║          TITANE∞ — TEST SCRIPT D'INSTALLATION                 ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INSTALL_SCRIPT="$SCRIPT_DIR/TITANE_POST_INSTALL_UBUNTU.sh"
VALIDATE_SCRIPT="$SCRIPT_DIR/validate_environment.sh"

TESTS_PASSED=0
TESTS_FAILED=0

# Fonction de test
test_check() {
    local test_name=$1
    local test_command=$2
    
    echo -n "  Testing: $test_name... "
    
    if eval "$test_command" &> /dev/null; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

echo -e "${CYAN}1. Vérification de l'existence des fichiers${NC}"
test_check "TITANE_POST_INSTALL_UBUNTU.sh existe" "[ -f '$INSTALL_SCRIPT' ]"
test_check "validate_environment.sh existe" "[ -f '$VALIDATE_SCRIPT' ]"
test_check "POST_INSTALL_README.md existe" "[ -f '$SCRIPT_DIR/POST_INSTALL_README.md' ]"
test_check "QUICKSTART_UBUNTU_24.04.md existe" "[ -f '$SCRIPT_DIR/QUICKSTART_UBUNTU_24.04.md' ]"
test_check "MANIFEST_INSTALLATION.md existe" "[ -f '$SCRIPT_DIR/MANIFEST_INSTALLATION.md' ]"
echo ""

echo -e "${CYAN}2. Vérification des permissions${NC}"
test_check "TITANE_POST_INSTALL_UBUNTU.sh est exécutable" "[ -x '$INSTALL_SCRIPT' ]"
test_check "validate_environment.sh est exécutable" "[ -x '$VALIDATE_SCRIPT' ]"
echo ""

echo -e "${CYAN}3. Vérification de la syntaxe Bash${NC}"
test_check "Syntaxe de TITANE_POST_INSTALL_UBUNTU.sh" "bash -n '$INSTALL_SCRIPT'"
test_check "Syntaxe de validate_environment.sh" "bash -n '$VALIDATE_SCRIPT'"
echo ""

echo -e "${CYAN}4. Vérification du contenu${NC}"
test_check "Shebang présent dans install script" "head -1 '$INSTALL_SCRIPT' | grep -q '#!/usr/bin/env bash'"
test_check "Shebang présent dans validate script" "head -1 '$VALIDATE_SCRIPT' | grep -q '#!/usr/bin/env bash'"
test_check "set -e présent dans install script" "grep -q 'set -e' '$INSTALL_SCRIPT'"
test_check "Fonctions log_* définies" "grep -q 'log_header()' '$INSTALL_SCRIPT'"
test_check "Phase 1 présente" "grep -q 'PHASE 1' '$INSTALL_SCRIPT'"
test_check "Phase 2 présente (Tauri)" "grep -q 'PHASE 2' '$INSTALL_SCRIPT'"
test_check "Phase 3 présente (Rust)" "grep -q 'PHASE 3' '$INSTALL_SCRIPT'"
test_check "Phase 4 présente (Node.js)" "grep -q 'PHASE 4' '$INSTALL_SCRIPT'"
test_check "Phase 5 présente (VSCode)" "grep -q 'PHASE 5' '$INSTALL_SCRIPT'"
test_check "Phase 6 présente (Configs)" "grep -q 'PHASE 6' '$INSTALL_SCRIPT'"
test_check "Phase 7 présente (Clone)" "grep -q 'PHASE 7' '$INSTALL_SCRIPT'"
test_check "Phase 8 présente (Dépendances)" "grep -q 'PHASE 8' '$INSTALL_SCRIPT'"
test_check "Phase 9 présente (Validation)" "grep -q 'PHASE 9' '$INSTALL_SCRIPT'"
echo ""

echo -e "${CYAN}5. Vérification des dépendances Tauri v2${NC}"
test_check "libwebkit2gtk-4.1-dev mentionné" "grep -q 'libwebkit2gtk-4.1-dev' '$INSTALL_SCRIPT'"
test_check "libgtk-3-dev mentionné" "grep -q 'libgtk-3-dev' '$INSTALL_SCRIPT'"
test_check "libsoup-3.0-dev mentionné" "grep -q 'libsoup-3.0-dev' '$INSTALL_SCRIPT'"
test_check "patchelf mentionné" "grep -q 'patchelf' '$INSTALL_SCRIPT'"
echo ""

echo -e "${CYAN}6. Vérification de la configuration Rust${NC}"
test_check "rustup mentionné" "grep -q 'rustup' '$INSTALL_SCRIPT'"
test_check "rustfmt installé" "grep -q 'rustfmt' '$INSTALL_SCRIPT'"
test_check "clippy installé" "grep -q 'clippy' '$INSTALL_SCRIPT'"
test_check "wasm32 target mentionné" "grep -q 'wasm32-unknown-unknown' '$INSTALL_SCRIPT'"
echo ""

echo -e "${CYAN}7. Vérification de la configuration Node.js${NC}"
test_check "NVM mentionné" "grep -q 'nvm' '$INSTALL_SCRIPT'"
test_check "Node.js LTS mentionné" "grep -q 'lts' '$INSTALL_SCRIPT'"
echo ""

echo -e "${CYAN}8. Vérification des extensions VSCode${NC}"
test_check "rust-analyzer mentionné" "grep -q 'rust-analyzer' '$INSTALL_SCRIPT'"
test_check "tauri-vscode mentionné" "grep -q 'tauri-vscode' '$INSTALL_SCRIPT'"
test_check "eslint mentionné" "grep -q 'eslint' '$INSTALL_SCRIPT'"
echo ""

echo -e "${CYAN}9. Vérification de la gestion des erreurs${NC}"
test_check "Vérification connexion internet" "grep -q 'ping.*google.com' '$INSTALL_SCRIPT'"
test_check "Logging configuré" "grep -q 'LOG_FILE' '$INSTALL_SCRIPT'"
test_check "Timestamps dans les logs" "grep -q 'TIMESTAMP' '$INSTALL_SCRIPT'"
echo ""

echo -e "${CYAN}10. Vérification du script de validation${NC}"
test_check "check_tool() fonction présente" "grep -q 'check_tool()' '$VALIDATE_SCRIPT'"
test_check "Vérification Rust" "grep -q 'rustc' '$VALIDATE_SCRIPT'"
test_check "Vérification Node.js" "grep -q 'node' '$VALIDATE_SCRIPT'"
test_check "Vérification WebKit" "grep -q 'webkit2gtk' '$VALIDATE_SCRIPT'"
test_check "Vérification SSH GitHub" "grep -q 'ssh.*git@github.com' '$VALIDATE_SCRIPT'"
echo ""

# Résumé
echo "═══════════════════════════════════════════════════════════════"
TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}${BOLD}✅ TOUS LES TESTS RÉUSSIS!${NC}"
    echo -e "${GREEN}$TESTS_PASSED/$TOTAL_TESTS tests passés${NC}"
    exit 0
else
    echo -e "${YELLOW}${BOLD}⚠️  CERTAINS TESTS ONT ÉCHOUÉ${NC}"
    echo -e "${GREEN}✅ Réussis: $TESTS_PASSED${NC}"
    echo -e "${RED}❌ Échecs:  $TESTS_FAILED${NC}"
    echo -e "${CYAN}Total:     $TOTAL_TESTS${NC}"
    exit 1
fi
