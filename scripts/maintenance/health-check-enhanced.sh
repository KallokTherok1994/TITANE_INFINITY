#!/usr/bin/env bash
#═══════════════════════════════════════════════════════════════════════════════
# TITANE∞ Enhanced Health Check System
# Version: 26.2.0
# Description: Comprehensive health checks with auto-repair capabilities
#═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_DIR="${PROJECT_ROOT}/.titane/health-check-logs"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
LOG_FILE="${LOG_DIR}/health-check-${TIMESTAMP}.log"

# Flags
DRY_RUN=false
VERBOSE=false
AUTO_FIX=true

# Counters
CHECKS_TOTAL=0
CHECKS_PASSED=0
CHECKS_WARNING=0
CHECKS_FAILED=0
FIXES_APPLIED=0

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --no-auto-fix)
            AUTO_FIX=false
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Setup
mkdir -p "$LOG_DIR"
cd "$PROJECT_ROOT"

log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date -Iseconds)
    echo "[${timestamp}] [${level}] ${message}" >> "$LOG_FILE"
    if [[ "$VERBOSE" == "true" ]]; then
        echo -e "${message}"
    fi
}

print_header() {
    echo -e "\n${PURPLE}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${NC}     ${CYAN}🏥 TITANE∞ ENHANCED HEALTH CHECK SYSTEM 🏥${NC}              ${PURPLE}║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════════╝${NC}\n"
    echo -e "${BLUE}📅 Timestamp:${NC} ${TIMESTAMP}"
    echo -e "${BLUE}📁 Project Root:${NC} ${PROJECT_ROOT}"
    echo -e "${BLUE}📝 Log File:${NC} ${LOG_FILE}"
    if [[ "$DRY_RUN" == "true" ]]; then
        echo -e "${YELLOW}⚠️  DRY RUN MODE - No changes will be made${NC}"
    fi
    echo ""
}

check_pass() {
    ((CHECKS_TOTAL++))
    ((CHECKS_PASSED++))
    echo -e "${GREEN}✓ $1${NC}"
    log "PASS" "$1"
}

check_warn() {
    ((CHECKS_TOTAL++))
    ((CHECKS_WARNING++))
    echo -e "${YELLOW}⚠ $1${NC}"
    log "WARN" "$1"
}

check_fail() {
    ((CHECKS_TOTAL++))
    ((CHECKS_FAILED++))
    echo -e "${RED}✗ $1${NC}"
    log "FAIL" "$1"
}

apply_fix() {
    local description=$1
    local fix_command=$2
    
    if [[ "$AUTO_FIX" == "false" ]]; then
        log "INFO" "Auto-fix disabled, skipping: $description"
        return 1
    fi
    
    if [[ "$DRY_RUN" == "true" ]]; then
        echo -e "${CYAN}[DRY RUN] Would apply fix: ${description}${NC}"
        log "DRYRUN" "Fix: $description | Command: $fix_command"
        return 0
    fi
    
    echo -e "${CYAN}🔧 Applying fix: ${description}${NC}"
    log "FIX" "Applying: $description | Command: $fix_command"
    
    if eval "$fix_command" >> "$LOG_FILE" 2>&1; then
        ((FIXES_APPLIED++))
        echo -e "${GREEN}✓ Fix applied successfully${NC}"
        log "FIX" "Success: $description"
        return 0
    else
        echo -e "${RED}✗ Fix failed${NC}"
        log "FIX" "Failed: $description"
        return 1
    fi
}

#═══════════════════════════════════════════════════════════════════════════════
# CHECK 1: Dependency Health
#═══════════════════════════════════════════════════════════════════════════════
check_dependency_health() {
    echo -e "\n${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}   Check 1: Dependency Health${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}\n"
    
    # Check if node_modules exists
    if [[ -d "node_modules" ]]; then
        check_pass "node_modules directory exists"
        
        # Check for broken symlinks
        local broken_symlinks=$(find node_modules -type l ! -exec test -e {} \; -print 2>/dev/null | wc -l)
        if [[ $broken_symlinks -gt 0 ]]; then
            check_fail "Found $broken_symlinks broken symlinks in node_modules"
            apply_fix "Remove broken symlinks" "find node_modules -type l ! -exec test -e {} \; -delete"
        else
            check_pass "No broken symlinks in node_modules"
        fi
    else
        check_fail "node_modules directory missing"
        apply_fix "Install dependencies" "pnpm install --frozen-lockfile"
    fi
    
    # Check package-lock integrity
    if [[ -f "pnpm-lock.yaml" ]]; then
        check_pass "pnpm-lock.yaml exists"
    else
        check_fail "pnpm-lock.yaml missing"
        apply_fix "Generate lockfile" "pnpm install --lockfile-only"
    fi
    
    # Check Rust toolchain
    if command -v rustc &> /dev/null; then
        local rust_version=$(rustc --version | awk '{print $2}')
        check_pass "Rust toolchain installed (${rust_version})"
    else
        check_fail "Rust toolchain not found"
        echo -e "${YELLOW}  Install via: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh${NC}"
    fi
    
    # Check Cargo.lock exists
    if [[ -f "src-tauri/Cargo.lock" ]]; then
        check_pass "Cargo.lock exists"
    else
        check_warn "Cargo.lock missing - will be generated on first build"
    fi
}

#═══════════════════════════════════════════════════════════════════════════════
# CHECK 2: Build Configuration Validation
#═══════════════════════════════════════════════════════════════════════════════
check_build_configuration() {
    echo -e "\n${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}   Check 2: Build Configuration Validation${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}\n"
    
    # Check version consistency
    local pkg_version=$(grep -oP '"version":\s*"\K[^"]+' package.json | head -1)
    local cargo_version=$(grep -oP '^version\s*=\s*"\K[^"]+' src-tauri/Cargo.toml | head -1)
    local tauri_version=$(grep -oP '"version":\s*"\K[^"]+' src-tauri/tauri.conf.json | head -1)
    
    if [[ "$pkg_version" == "$cargo_version" ]] && [[ "$pkg_version" == "$tauri_version" ]]; then
        check_pass "Version consistency: ${pkg_version}"
    else
        check_fail "Version mismatch: package.json=${pkg_version}, Cargo.toml=${cargo_version}, tauri.conf.json=${tauri_version}"
    fi
    
    # Check Tauri-only mode enforcement
    if grep -q "exit 1" package.json && grep -q "TAURI-ONLY" package.json; then
        check_pass "Tauri-only mode enforced in package.json"
    else
        check_warn "Tauri-only mode enforcement may not be complete"
    fi
    
    # Check dist directory
    if [[ -d "dist" ]]; then
        check_pass "dist directory exists"
    else
        check_warn "dist directory missing - run 'npm run build'"
    fi
    
    # Check tsconfig.json
    if [[ -f "tsconfig.json" ]]; then
        if grep -q '"strict": true' tsconfig.json; then
            check_pass "TypeScript strict mode enabled"
        else
            check_warn "TypeScript strict mode not enabled"
        fi
    else
        check_fail "tsconfig.json missing"
    fi
}

#═══════════════════════════════════════════════════════════════════════════════
# CHECK 3: Test Infrastructure Health
#═══════════════════════════════════════════════════════════════════════════════
check_test_infrastructure() {
    echo -e "\n${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}   Check 3: Test Infrastructure Health${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}\n"
    
    # Check vitest configuration
    if [[ -f "vitest.config.ts" ]]; then
        check_pass "vitest.config.ts exists"
    else
        check_fail "vitest.config.ts missing"
    fi
    
    # Check playwright configuration
    if [[ -f "playwright.config.ts" ]]; then
        check_pass "playwright.config.ts exists"
    else
        check_fail "playwright.config.ts missing"
    fi
    
    # Check test directories
    local test_count=$(find src -name "*.test.ts" -o -name "*.test.tsx" | wc -l)
    if [[ $test_count -gt 0 ]]; then
        check_pass "Found ${test_count} test files"
    else
        check_warn "No test files found in src/"
    fi
    
    # Check E2E tests
    if [[ -d "e2e" ]]; then
        local e2e_count=$(find e2e -name "*.spec.ts" | wc -l)
        check_pass "E2E directory exists with ${e2e_count} test files"
    else
        check_warn "E2E directory missing"
    fi
    
    # Check for test artifacts
    if [[ -d "coverage" ]]; then
        check_pass "Coverage directory exists"
    else
        check_warn "Coverage directory missing - run tests with coverage"
    fi
}

#═══════════════════════════════════════════════════════════════════════════════
# CHECK 4: Security Posture
#═══════════════════════════════════════════════════════════════════════════════
check_security_posture() {
    echo -e "\n${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}   Check 4: Security Posture${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}\n"
    
    # Check for .env file (should NOT be committed)
    if [[ -f ".env" ]]; then
        if git ls-files --error-unmatch .env &> /dev/null; then
            check_fail ".env file is tracked by git (SECURITY RISK)"
            echo -e "${RED}  ACTION REQUIRED: Remove .env from git immediately${NC}"
        else
            check_pass ".env exists but not tracked by git"
        fi
    else
        check_warn ".env file not found (expected for local development)"
    fi
    
    # Check .env.example
    if [[ -f ".env.example" ]]; then
        check_pass ".env.example exists"
    else
        check_warn ".env.example missing"
    fi
    
    # Check for hardcoded secrets (basic pattern matching)
    local secret_patterns=("API_KEY=" "SECRET=" "PASSWORD=" "TOKEN=")
    local found_secrets=false
    
    for pattern in "${secret_patterns[@]}"; do
        if grep -r "$pattern" src/ --include="*.ts" --include="*.tsx" --exclude-dir=node_modules 2>/dev/null | grep -v "// " | grep -v "import" | grep -q "$pattern"; then
            check_warn "Potential hardcoded secret pattern found: $pattern"
            found_secrets=true
        fi
    done
    
    if [[ "$found_secrets" == "false" ]]; then
        check_pass "No obvious hardcoded secret patterns found"
    fi
    
    # Check CSP in tauri.conf.json
    if grep -q "csp" src-tauri/tauri.conf.json; then
        check_pass "Content Security Policy (CSP) configured"
    else
        check_warn "CSP not found in tauri.conf.json"
    fi
    
    # Run npm audit (if not in dry-run mode)
    if [[ "$DRY_RUN" == "false" ]] && command -v npm &> /dev/null; then
        echo -e "${CYAN}Running npm audit...${NC}"
        if npm audit --production --audit-level=high &> /dev/null; then
            check_pass "npm audit: No high/critical vulnerabilities"
        else
            check_warn "npm audit found vulnerabilities - run 'npm audit' for details"
        fi
    fi
}

#═══════════════════════════════════════════════════════════════════════════════
# SUMMARY REPORT
#═══════════════════════════════════════════════════════════════════════════════
print_summary() {
    echo -e "\n${PURPLE}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${NC}     ${BOLD}HEALTH CHECK SUMMARY${NC}                                        ${PURPLE}║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════════╝${NC}\n"
    
    echo -e "${BLUE}Total Checks:${NC}     ${CHECKS_TOTAL}"
    echo -e "${GREEN}✓ Passed:${NC}         ${CHECKS_PASSED}"
    echo -e "${YELLOW}⚠ Warnings:${NC}       ${CHECKS_WARNING}"
    echo -e "${RED}✗ Failed:${NC}         ${CHECKS_FAILED}"
    
    if [[ "$AUTO_FIX" == "true" ]]; then
        echo -e "${CYAN}🔧 Fixes Applied:${NC}  ${FIXES_APPLIED}"
    fi
    
    echo ""
    echo -e "${BLUE}📝 Full log:${NC} ${LOG_FILE}"
    echo ""
    
    # Calculate health score
    local health_score=0
    if [[ $CHECKS_TOTAL -gt 0 ]]; then
        health_score=$(( (CHECKS_PASSED * 100) / CHECKS_TOTAL ))
    fi
    
    echo -e "${BOLD}Health Score: ${health_score}/100${NC}"
    
    if [[ $health_score -ge 95 ]]; then
        echo -e "${GREEN}Status: EXCELLENT 🏆${NC}"
        exit_code=0
    elif [[ $health_score -ge 85 ]]; then
        echo -e "${GREEN}Status: GOOD ✓${NC}"
        exit_code=0
    elif [[ $health_score -ge 70 ]]; then
        echo -e "${YELLOW}Status: FAIR ⚠${NC}"
        exit_code=1
    else
        echo -e "${RED}Status: POOR ✗${NC}"
        exit_code=2
    fi
    
    echo ""
    exit $exit_code
}

#═══════════════════════════════════════════════════════════════════════════════
# MAIN EXECUTION
#═══════════════════════════════════════════════════════════════════════════════
main() {
    print_header
    
    check_dependency_health
    check_build_configuration
    check_test_infrastructure
    check_security_posture
    
    print_summary
}

main "$@"
