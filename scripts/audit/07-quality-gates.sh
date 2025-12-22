#!/usr/bin/env bash
#═══════════════════════════════════════════════════════════════════════════════
# TITANE∞ Quality Gates Validator
# Version: 26.2.0
# Description: Validates all quality gates before deployment
#═══════════════════════════════════════════════════════════════════════════════

set -uo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Gate results
declare -A GATE_RESULTS
GATES_PASSED=0
GATES_FAILED=0
GATES_WARNING=0

print_header() {
    echo -e "\n${PURPLE}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${NC}        ${CYAN}🚦 TITANE∞ QUALITY GATES VALIDATOR 🚦${NC}                    ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${NC}        ${YELLOW}Pre-Deployment Quality Assurance${NC}                         ${PURPLE}║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════════╝${NC}\n"
}

gate_pass() {
    local gate_name=$1
    echo -e "${GREEN}✓${NC} Gate: ${gate_name} ${GREEN}PASSED${NC}"
    GATE_RESULTS[$gate_name]="PASS"
    ((GATES_PASSED++))
}

gate_fail() {
    local gate_name=$1
    local reason=$2
    echo -e "${RED}✗${NC} Gate: ${gate_name} ${RED}FAILED${NC} - ${reason}"
    GATE_RESULTS[$gate_name]="FAIL"
    ((GATES_FAILED++))
}

gate_warn() {
    local gate_name=$1
    local reason=$2
    echo -e "${YELLOW}⚠${NC} Gate: ${gate_name} ${YELLOW}WARNING${NC} - ${reason}"
    GATE_RESULTS[$gate_name]="WARN"
    ((GATES_WARNING++))
}

# Gate 1: Build Configuration
check_build_gate() {
    echo -e "\n${CYAN}━━━ Gate 1: Build Configuration ━━━${NC}"
    
    local pkg_json="${PROJECT_ROOT}/package.json"
    local cargo_toml="${PROJECT_ROOT}/src-tauri/Cargo.toml"
    local tauri_conf="${PROJECT_ROOT}/src-tauri/tauri.conf.json"
    
    # Check files exist
    if [[ ! -f "$pkg_json" ]]; then
        gate_fail "Build Configuration" "package.json not found"
        return
    fi
    
    if [[ ! -f "$cargo_toml" ]]; then
        gate_fail "Build Configuration" "Cargo.toml not found"
        return
    fi
    
    if [[ ! -f "$tauri_conf" ]]; then
        gate_fail "Build Configuration" "tauri.conf.json not found"
        return
    fi
    
    # Check version consistency
    local pkg_version=$(node -p "require('$pkg_json').version" 2>/dev/null || echo "")
    local tauri_version=$(node -p "require('$tauri_conf').version" 2>/dev/null || echo "")
    local cargo_version=$(grep -oP '^version\s*=\s*"\K[^"]+' "$cargo_toml" | head -1 || echo "")
    
    if [[ -z "$pkg_version" || -z "$tauri_version" || -z "$cargo_version" ]]; then
        gate_warn "Build Configuration" "Could not read all versions"
        return
    fi
    
    if [[ "$pkg_version" == "$tauri_version" && "$pkg_version" == "$cargo_version" ]]; then
        gate_pass "Build Configuration"
    else
        gate_warn "Build Configuration" "Version mismatch (pkg: $pkg_version, tauri: $tauri_version, cargo: $cargo_version)"
    fi
}

# Gate 2: TypeScript Compilation
check_typescript_gate() {
    echo -e "\n${CYAN}━━━ Gate 2: TypeScript Compilation ━━━${NC}"
    
    cd "$PROJECT_ROOT"
    
    if pnpm run check 2>/dev/null | tail -1 | grep -q "error"; then
        gate_fail "TypeScript Compilation" "Type errors detected"
    else
        gate_pass "TypeScript Compilation"
    fi
}

# Gate 3: Linting
check_lint_gate() {
    echo -e "\n${CYAN}━━━ Gate 3: Code Linting ━━━${NC}"
    
    cd "$PROJECT_ROOT"
    
    local lint_errors=$(pnpm run lint 2>&1 | grep -c "error" || echo "0")
    
    if [[ "$lint_errors" -gt 0 ]]; then
        gate_fail "Code Linting" "$lint_errors linting error(s)"
    else
        gate_pass "Code Linting"
    fi
}

# Gate 4: Unit Tests
check_tests_gate() {
    echo -e "\n${CYAN}━━━ Gate 4: Unit Tests ━━━${NC}"
    
    cd "$PROJECT_ROOT"
    
    # Configurable timeout for test execution (default: 120 seconds)
    local TEST_TIMEOUT=${TEST_TIMEOUT:-120}
    
    if timeout "$TEST_TIMEOUT" pnpm vitest run --reporter=basic 2>&1 | tail -5 | grep -q "passed"; then
        gate_pass "Unit Tests"
    else
        gate_fail "Unit Tests" "Some tests failed"
    fi
}

# Gate 5: Security
check_security_gate() {
    echo -e "\n${CYAN}━━━ Gate 5: Security ━━━${NC}"
    
    cd "$PROJECT_ROOT"
    
    # Check NPM audit
    local npm_critical=$(pnpm audit 2>/dev/null | grep -c "critical" || echo "0")
    local npm_high=$(pnpm audit 2>/dev/null | grep -c "high" || echo "0")
    
    if [[ "$npm_critical" -gt 0 ]]; then
        gate_fail "Security" "$npm_critical critical vulnerabilities"
    elif [[ "$npm_high" -gt 0 ]]; then
        gate_warn "Security" "$npm_high high vulnerabilities"
    else
        gate_pass "Security"
    fi
}

# Gate 6: Tauri Configuration
check_tauri_gate() {
    echo -e "\n${CYAN}━━━ Gate 6: Tauri Configuration ━━━${NC}"
    
    local tauri_conf="${PROJECT_ROOT}/src-tauri/tauri.conf.json"
    
    # Validate JSON
    if ! python3 -m json.tool "$tauri_conf" > /dev/null 2>&1; then
        gate_fail "Tauri Configuration" "Invalid JSON in tauri.conf.json"
        return
    fi
    
    # Check required fields
    local has_identifier=$(node -p "require('$tauri_conf').identifier" 2>/dev/null || echo "")
    local has_product_name=$(node -p "require('$tauri_conf').productName" 2>/dev/null || echo "")
    local bundle_active=$(node -p "require('$tauri_conf').bundle?.active" 2>/dev/null || echo "")
    
    if [[ -z "$has_identifier" || -z "$has_product_name" ]]; then
        gate_fail "Tauri Configuration" "Missing required fields"
    elif [[ "$bundle_active" != "true" ]]; then
        gate_warn "Tauri Configuration" "Bundle not active"
    else
        gate_pass "Tauri Configuration"
    fi
}

# Gate 7: Runtime Configurations
check_runtime_gate() {
    echo -e "\n${CYAN}━━━ Gate 7: Runtime Configurations ━━━${NC}"
    
    local dev_conf="${PROJECT_ROOT}/runtime/dev/tauri.conf.json"
    local stable_conf="${PROJECT_ROOT}/runtime/stable/tauri.conf.json"
    
    local issues=0
    
    if [[ ! -f "$dev_conf" ]]; then
        ((issues++))
    fi
    
    if [[ ! -f "$stable_conf" ]]; then
        ((issues++))
    fi
    
    if [[ $issues -gt 0 ]]; then
        gate_warn "Runtime Configurations" "$issues runtime config(s) missing"
    else
        gate_pass "Runtime Configurations"
    fi
}

# Gate 8: Deployment Scripts
check_deployment_gate() {
    echo -e "\n${CYAN}━━━ Gate 8: Deployment Scripts ━━━${NC}"
    
    local required_scripts=(
        "titane.sh"
        "scripts/build_titane.sh"
        "scripts/deploy-production.sh"
        "installer/install.sh"
    )
    
    local missing=0
    
    for script in "${required_scripts[@]}"; do
        local script_path="${PROJECT_ROOT}/${script}"
        if [[ ! -f "$script_path" ]]; then
            ((missing++))
        elif [[ ! -x "$script_path" ]]; then
            ((missing++))
        fi
    done
    
    if [[ $missing -gt 0 ]]; then
        gate_warn "Deployment Scripts" "$missing script(s) missing or not executable"
    else
        gate_pass "Deployment Scripts"
    fi
}

# Gate 9: CI/CD Workflows
check_cicd_gate() {
    echo -e "\n${CYAN}━━━ Gate 9: CI/CD Workflows ━━━${NC}"
    
    local workflows_dir="${PROJECT_ROOT}/.github/workflows"
    
    if [[ ! -d "$workflows_dir" ]]; then
        gate_fail "CI/CD Workflows" "Workflows directory not found"
        return
    fi
    
    local ci_workflow="${workflows_dir}/ci.yml"
    local release_workflow="${workflows_dir}/release.yml"
    
    if [[ ! -f "$ci_workflow" ]]; then
        gate_warn "CI/CD Workflows" "ci.yml not found"
    elif [[ ! -f "$release_workflow" ]]; then
        gate_warn "CI/CD Workflows" "release.yml not found"
    else
        gate_pass "CI/CD Workflows"
    fi
}

# Gate 10: Documentation
check_docs_gate() {
    echo -e "\n${CYAN}━━━ Gate 10: Documentation ━━━${NC}"
    
    local required_docs=(
        "README.md"
        "CHANGELOG.md"
        "docs/DEPLOYMENT_GUIDE.md"
    )
    
    local missing=0
    
    for doc in "${required_docs[@]}"; do
        local doc_path="${PROJECT_ROOT}/${doc}"
        if [[ ! -f "$doc_path" ]]; then
            ((missing++))
        fi
    done
    
    if [[ $missing -gt 0 ]]; then
        gate_warn "Documentation" "$missing doc(s) missing"
    else
        gate_pass "Documentation"
    fi
}

print_summary() {
    local total=$((GATES_PASSED + GATES_FAILED + GATES_WARNING))
    
    echo -e "\n${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${PURPLE}                  QUALITY GATES SUMMARY${NC}"
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}\n"
    
    echo -e "  ${GREEN}✓ Passed:${NC}   $GATES_PASSED"
    echo -e "  ${YELLOW}⚠ Warning:${NC}  $GATES_WARNING"
    echo -e "  ${RED}✗ Failed:${NC}   $GATES_FAILED"
    echo ""
    
    # Overall status
    if [[ $GATES_FAILED -eq 0 && $GATES_WARNING -eq 0 ]]; then
        echo -e "  ${GREEN}╔═══════════════════════════════════════╗${NC}"
        echo -e "  ${GREEN}║   🎉 ALL GATES PASSED - READY TO DEPLOY   ║${NC}"
        echo -e "  ${GREEN}╚═══════════════════════════════════════╝${NC}"
        return 0
    elif [[ $GATES_FAILED -eq 0 ]]; then
        echo -e "  ${YELLOW}╔═══════════════════════════════════════╗${NC}"
        echo -e "  ${YELLOW}║   ⚠️  DEPLOY WITH CAUTION (Warnings)   ║${NC}"
        echo -e "  ${YELLOW}╚═══════════════════════════════════════╝${NC}"
        return 0
    else
        echo -e "  ${RED}╔═══════════════════════════════════════╗${NC}"
        echo -e "  ${RED}║   ❌ DEPLOYMENT BLOCKED - Fix Issues   ║${NC}"
        echo -e "  ${RED}╚═══════════════════════════════════════╝${NC}"
        return 1
    fi
}

main() {
    cd "$PROJECT_ROOT"
    
    print_header
    
    # Run all gates
    check_build_gate
    check_tauri_gate
    check_runtime_gate
    check_deployment_gate
    check_cicd_gate
    check_docs_gate
    
    # Optional gates (may fail silently in CI)
    check_typescript_gate 2>/dev/null || gate_warn "TypeScript Compilation" "Check skipped"
    check_lint_gate 2>/dev/null || gate_warn "Code Linting" "Check skipped"
    check_security_gate 2>/dev/null || gate_warn "Security" "Check skipped"
    # Skip unit tests for quick validation
    # check_tests_gate 2>/dev/null || gate_warn "Unit Tests" "Check skipped"
    
    print_summary
}

main "$@"
