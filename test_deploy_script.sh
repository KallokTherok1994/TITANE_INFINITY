#!/usr/bin/env bash

################################################################################
# TEST SCRIPT - Validation du script de déploiement TITANE∞ v15.5
################################################################################

set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly DEPLOY_SCRIPT="${SCRIPT_DIR}/deploy_titane_prod.sh"

# Couleurs
readonly GREEN="\033[32m"
readonly RED="\033[31m"
readonly YELLOW="\033[33m"
readonly BLUE="\033[34m"
readonly RESET="\033[0m"

test_count=0
pass_count=0
fail_count=0

# Fonction de test
test_check() {
    local description="$1"
    local command="$2"
    
    ((test_count++))
    
    echo -ne "${BLUE}[TEST ${test_count}]${RESET} ${description}... "
    
    if eval "$command" &> /dev/null; then
        echo -e "${GREEN}✓ PASS${RESET}"
        ((pass_count++))
        return 0
    else
        echo -e "${RED}✗ FAIL${RESET}"
        ((fail_count++))
        return 1
    fi
}

echo "════════════════════════════════════════════════════════════"
echo "  TEST DE VALIDATION - deploy_titane_prod.sh"
echo "════════════════════════════════════════════════════════════"
echo ""

# Tests de base
test_check "Script existe" "test -f '${DEPLOY_SCRIPT}'"
test_check "Script exécutable" "test -x '${DEPLOY_SCRIPT}'"
test_check "Syntaxe Bash valide" "bash -n '${DEPLOY_SCRIPT}'"
test_check "Shebang correct" "head -1 '${DEPLOY_SCRIPT}' | grep -q '#!/usr/bin/env bash'"
test_check "Set strict mode" "grep -q 'set -euo pipefail' '${DEPLOY_SCRIPT}'"

# Tests des outils requis
test_check "Node.js installé" "command -v node"
test_check "npm installé" "command -v npm"
test_check "Cargo installé" "command -v cargo"
test_check "Rustc installé" "command -v rustc"
test_check "Tauri CLI installé" "cargo tauri --version"

# Tests des versions
test_check "Node >= v20" "[[ \$(node --version | sed 's/v//' | cut -d. -f1) -ge 20 ]]"
test_check "npm >= v10" "[[ \$(npm --version | cut -d. -f1) -ge 10 ]]"

# Tests des fichiers du projet
test_check "package.json existe" "test -f '${SCRIPT_DIR}/package.json'"
test_check "Cargo.toml existe" "test -f '${SCRIPT_DIR}/src-tauri/Cargo.toml'"
test_check "tauri.conf.json existe" "test -f '${SCRIPT_DIR}/src-tauri/tauri.conf.json'"
test_check "src-tauri/ existe" "test -d '${SCRIPT_DIR}/src-tauri'"

# Tests des scripts npm
test_check "npm run build défini" "grep -q '\"build\":' '${SCRIPT_DIR}/package.json'"
test_check "npm run type-check défini" "grep -q '\"type-check\":' '${SCRIPT_DIR}/package.json'"
test_check "npm run tauri:build défini" "grep -q '\"tauri:build\":' '${SCRIPT_DIR}/package.json'"

# Tests de la configuration Tauri
test_check "Version v15.5.0 dans tauri.conf.json" "grep -q '\"version\": \"15.5.0\"' '${SCRIPT_DIR}/src-tauri/tauri.conf.json'"
test_check "ProductName correct" "grep -q '\"productName\": \"TITANE∞ v15.5\"' '${SCRIPT_DIR}/src-tauri/tauri.conf.json'"
test_check "Title correct" "grep -q '\"title\": \"TITANE∞ v15.5\"' '${SCRIPT_DIR}/src-tauri/tauri.conf.json'"

# Tests des fonctions du script
test_check "Fonction initialize présente" "grep -q 'initialize()' '${DEPLOY_SCRIPT}'"
test_check "Fonction check_environment présente" "grep -q 'check_environment()' '${DEPLOY_SCRIPT}'"
test_check "Fonction clean_project présente" "grep -q 'clean_project()' '${DEPLOY_SCRIPT}'"
test_check "Fonction build_frontend présente" "grep -q 'build_frontend()' '${DEPLOY_SCRIPT}'"
test_check "Fonction build_backend présente" "grep -q 'build_backend()' '${DEPLOY_SCRIPT}'"
test_check "Fonction build_tauri présente" "grep -q 'build_tauri()' '${DEPLOY_SCRIPT}'"
test_check "Fonction install_system présente" "grep -q 'install_system()' '${DEPLOY_SCRIPT}'"
test_check "Fonction test_installation présente" "grep -q 'test_installation()' '${DEPLOY_SCRIPT}'"
test_check "Fonction final_validation présente" "grep -q 'final_validation()' '${DEPLOY_SCRIPT}'"
test_check "Fonction generate_report présente" "grep -q 'generate_report()' '${DEPLOY_SCRIPT}'"

# Tests de sécurité
test_check "Gestion d'erreurs avec trap" "grep -q 'trap.*handle_error' '${DEPLOY_SCRIPT}'"
test_check "Logging activé" "grep -q 'LOG_FILE=' '${DEPLOY_SCRIPT}'"
test_check "Vérification sudo" "grep -q 'sudo.*true' '${DEPLOY_SCRIPT}'"

# Tests de permissions
test_check "Droits d'écriture sur projet" "test -w '${SCRIPT_DIR}'"
test_check "Espace disque disponible" "[[ \$(df -m '${SCRIPT_DIR}' | awk 'NR==2 {print \$4}') -gt 2048 ]]"

# Résumé
echo ""
echo "════════════════════════════════════════════════════════════"
echo -e "  RÉSULTATS: ${GREEN}${pass_count} PASS${RESET} / ${RED}${fail_count} FAIL${RESET} / ${test_count} TOTAL"
echo "════════════════════════════════════════════════════════════"
echo ""

if [[ ${fail_count} -eq 0 ]]; then
    echo -e "${GREEN}✓ Tous les tests sont passés !${RESET}"
    echo -e "${GREEN}✓ Le script deploy_titane_prod.sh est prêt à être utilisé.${RESET}"
    exit 0
else
    echo -e "${RED}✗ ${fail_count} test(s) ont échoué.${RESET}"
    echo -e "${YELLOW}⚠ Corrigez les problèmes avant d'exécuter le déploiement.${RESET}"
    exit 1
fi
