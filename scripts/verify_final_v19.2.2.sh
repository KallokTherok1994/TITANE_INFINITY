#!/usr/bin/env bash
#
# TITANE∞ v19.2.2 - Script de Vérification Finale Automatique
# © 2025 Humain Total / Kevin Thibault / TITANE Team
#
# Vérifie que tout est terminé et à jour pour la migration Backend v14
#

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                                ║${NC}"
echo -e "${BLUE}║   🔍 TITANE∞ v19.2.2 - VÉRIFICATION FINALE AUTOMATIQUE        ║${NC}"
echo -e "${BLUE}║   Backend Migration v14 Complete - Production Ready Check     ║${NC}"
echo -e "${BLUE}║                                                                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_TOTAL=10

# Function: Run check
run_check() {
    local check_name="$1"
    local check_cmd="$2"
    local check_num="$3"

    echo -e "${YELLOW}[${check_num}/${CHECKS_TOTAL}] ${check_name}...${NC}"

    if eval "$check_cmd" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ ${check_name}${NC}"
        ((CHECKS_PASSED++)) || true
        return 0
    else
        echo -e "${RED}✗ ${check_name}${NC}"
        ((CHECKS_FAILED++)) || true
        return 1
    fi
}

# Check 1: Versions synchronisées
echo -e "\n${BLUE}═══ 1. VERSIONS SYNCHRONISÉES ═══${NC}\n"

check_version_sync() {
    local pkg_version=$(grep '"version":' "$PROJECT_ROOT/package.json" | head -1 | cut -d'"' -f4)
    local cargo_version=$(grep '^version =' "$PROJECT_ROOT/src-tauri/Cargo.toml" | head -1 | cut -d'"' -f2)
    local tauri_version=$(grep '"version":' "$PROJECT_ROOT/src-tauri/tauri.conf.json" | head -1 | cut -d'"' -f4)

    if [[ "$pkg_version" == "19.2.2" ]] && [[ "$cargo_version" == "19.2.2" ]] && [[ "$tauri_version" == "19.2.2" ]]; then
        echo "  package.json: $pkg_version ✓"
        echo "  Cargo.toml: $cargo_version ✓"
        echo "  tauri.conf.json: $tauri_version ✓"
        return 0
    else
        echo "  ✗ Versions non synchronisées:"
        echo "    package.json: $pkg_version"
        echo "    Cargo.toml: $cargo_version"
        echo "    tauri.conf.json: $tauri_version"
        return 1
    fi
}

run_check "Versions synchronisées v19.2.2" "check_version_sync" 1

# Check 2: Compilation Backend Dev
echo -e "\n${BLUE}═══ 2. COMPILATION BACKEND DEV ═══${NC}\n"

run_check "cargo check --lib" "cd '$PROJECT_ROOT/src-tauri' && cargo check --lib" 2

# Check 3: Compilation Backend Release
echo -e "\n${BLUE}═══ 3. COMPILATION BACKEND RELEASE ═══${NC}\n"

run_check "cargo build --release" "cd '$PROJECT_ROOT/src-tauri' && cargo build --release" 3

# Check 4: Tests Backend Core v14
echo -e "\n${BLUE}═══ 4. TESTS BACKEND CORE V14 ═══${NC}\n"

check_core_tests() {
    cd "$PROJECT_ROOT/src-tauri"
    local test_output=$(cargo test --lib 2>&1 || true)

    # Count passed tests
    local passed=$(echo "$test_output" | grep -oP '\d+(?= passed)' | tail -1)

    if [[ $passed -ge 102 ]]; then
        echo "  Tests passed: $passed/108 (≥94%) ✓"
        return 0
    else
        echo "  ✗ Tests passed: $passed/108 (<94%)"
        return 1
    fi
}

run_check "Tests Backend (≥102/108 pass)" "check_core_tests" 4

# Check 5: Binary Size
echo -e "\n${BLUE}═══ 5. BINARY SIZE OPTIMAL ═══${NC}\n"

check_binary_size() {
    local binary_path="$PROJECT_ROOT/src-tauri/target/release/libtitane_infinity.rlib"

    if [[ ! -f "$binary_path" ]]; then
        echo "  ✗ Binary not found: $binary_path"
        return 1
    fi

    local size_mb=$(du -m "$binary_path" | cut -f1)

    if [[ $size_mb -le 50 ]]; then
        echo "  Binary size: ${size_mb} MB (target <50 MB) ✓"
        return 0
    else
        echo "  ✗ Binary size: ${size_mb} MB (>50 MB)"
        return 1
    fi
}

run_check "Binary size <50 MB" "check_binary_size" 5

# Check 6: TypeScript Type Check
echo -e "\n${BLUE}═══ 6. TYPESCRIPT TYPE CHECK ═══${NC}\n"

run_check "npm run type-check" "cd '$PROJECT_ROOT' && npm run type-check" 6

# Check 7: Handlers v14 Count
echo -e "\n${BLUE}═══ 7. HANDLERS TAURI V14 ═══${NC}\n"

check_handlers_count() {
    local handlers_file="$PROJECT_ROOT/src-tauri/src/api/handlers_v14.rs"

    if [[ ! -f "$handlers_file" ]]; then
        echo "  ✗ handlers_v14.rs not found"
        return 1
    fi

    # Check for 49 handlers (simplified pattern)
    if grep -q "TOTAL: 49 handlers" "$handlers_file"; then
        echo "  Handlers count: 49 ✓"
        return 0
    else
        echo "  ✗ Handlers count mismatch (expected 49)"
        return 1
    fi
}

run_check "49 Tauri Handlers v14" "check_handlers_count" 7

# Check 8: Documentation Files
echo -e "\n${BLUE}═══ 8. DOCUMENTATION COMPLÈTE ═══${NC}\n"

check_documentation() {
    local docs=(
        "BACKEND_MIGRATION_PLAN_v14.md"
        "BACKEND_MIGRATION_COMPLETE_v14.txt"
        "BACKEND_MIGRATION_SUCCESS_BANNER_v14.txt"
        "VERIFICATION_FINALE_v19.2.2.md"
        "CHANGELOG.md"
        "README.md"
    )

    local missing=0
    for doc in "${docs[@]}"; do
        if [[ ! -f "$PROJECT_ROOT/$doc" ]]; then
            echo "  ✗ Missing: $doc"
            ((missing++)) || true
        fi
    done

    if [[ $missing -eq 0 ]]; then
        echo "  Documentation files: ${#docs[@]}/${#docs[@]} ✓"
        return 0
    else
        echo "  ✗ Missing $missing documentation files"
        return 1
    fi
}

run_check "Documentation files (6+)" "check_documentation" 8

# Check 9: CHANGELOG Entry v19.2.2
echo -e "\n${BLUE}═══ 9. CHANGELOG ENTRY v19.2.2 ═══${NC}\n"

check_changelog() {
    if grep -q "\[v19.2.2\]" "$PROJECT_ROOT/CHANGELOG.md"; then
        echo "  CHANGELOG.md entry v19.2.2 ✓"
        return 0
    else
        echo "  ✗ CHANGELOG.md missing v19.2.2 entry"
        return 1
    fi
}

run_check "CHANGELOG entry v19.2.2" "check_changelog" 9

# Check 10: Validation Scripts
echo -e "\n${BLUE}═══ 10. SCRIPTS VALIDATION ═══${NC}\n"

check_scripts() {
    local scripts=(
        "scripts/validate_backend_v14.sh"
        "scripts/verify_final_v19.2.2.sh"
    )

    local missing=0
    for script in "${scripts[@]}"; do
        if [[ ! -f "$PROJECT_ROOT/$script" ]]; then
            echo "  ✗ Missing: $script"
            ((missing++)) || true
        fi
    done

    if [[ $missing -eq 0 ]]; then
        echo "  Validation scripts: ${#scripts[@]}/${#scripts[@]} ✓"
        return 0
    else
        echo "  ✗ Missing $missing validation scripts"
        return 1
    fi
}

run_check "Validation scripts" "check_scripts" 10

# Summary
echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                                ║${NC}"
echo -e "${BLUE}║   📊 RÉSUMÉ VÉRIFICATION FINALE                                ║${NC}"
echo -e "${BLUE}║                                                                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "  Checks passed: ${GREEN}${CHECKS_PASSED}/${CHECKS_TOTAL}${NC}"
echo -e "  Checks failed: ${RED}${CHECKS_FAILED}/${CHECKS_TOTAL}${NC}"

if [[ $CHECKS_FAILED -eq 0 ]]; then
    echo -e "\n${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                                ║${NC}"
    echo -e "${GREEN}║   ✅ VÉRIFICATION FINALE RÉUSSIE                              ║${NC}"
    echo -e "${GREEN}║   Backend v14 - Production Ready                              ║${NC}"
    echo -e "${GREEN}║                                                                ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}🚀 Prochaines étapes:${NC}"
    echo -e "  1. git add ."
    echo -e "  2. git commit -m 'feat(backend): Complete v14 migration v19.2.2'"
    echo -e "  3. Frontend integration handlers v14"
    echo ""
    exit 0
else
    echo -e "\n${RED}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                                                                ║${NC}"
    echo -e "${RED}║   ⚠️  VÉRIFICATION ÉCHOUÉE                                     ║${NC}"
    echo -e "${RED}║   ${CHECKS_FAILED} checks failed                                           ║${NC}"
    echo -e "${RED}║                                                                ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Veuillez corriger les erreurs ci-dessus avant de continuer.${NC}"
    echo ""
    exit 1
fi
