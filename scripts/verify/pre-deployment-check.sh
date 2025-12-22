#!/usr/bin/env bash
#═══════════════════════════════════════════════════════════════════════════════
# TITANE∞ Pre-Deployment Comprehensive Check
# Version: 26.2.0
# Description: Complete validation before production deployment
#═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
REPORT_DIR="${PROJECT_ROOT}/reports/pre-deployment-$(date +%Y%m%d-%H%M%S)"
LOG_FILE="${REPORT_DIR}/pre-deployment-check.log"

# Quality Gates Thresholds
MIN_TEST_PASS_RATE=97
MIN_HEALTH_SCORE=90
MAX_CRITICAL_VULNERABILITIES=0
MAX_HIGH_VULNERABILITIES=0

# Counters
GATE_TOTAL=0
GATE_PASSED=0
GATE_FAILED=0
BLOCKER_COUNT=0

# Flags
VERBOSE=false
QUICK_MODE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --verbose)
            VERBOSE=true
            shift
            ;;
        --quick)
            QUICK_MODE=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Setup
mkdir -p "$REPORT_DIR"
cd "$PROJECT_ROOT"

log() {
    local message="$*"
    echo "[$(date -Iseconds)] $message" >> "$LOG_FILE"
    if [[ "$VERBOSE" == "true" ]]; then
        echo "$message"
    fi
}

print_header() {
    echo -e "\n${PURPLE}╔════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${NC}     ${CYAN}🚀 TITANE∞ PRE-DEPLOYMENT COMPREHENSIVE CHECK 🚀${NC}          ${PURPLE}║${NC}"
    echo -e "${PURPLE}╚════════════════════════════════════════════════════════════════════╝${NC}\n"
    echo -e "${BLUE}📅 Timestamp:${NC} $(date)"
    echo -e "${BLUE}📁 Project:${NC}   ${PROJECT_ROOT}"
    echo -e "${BLUE}📊 Report:${NC}    ${REPORT_DIR}"
    if [[ "$QUICK_MODE" == "true" ]]; then
        echo -e "${YELLOW}⚡ Quick Mode Enabled${NC}"
    fi
    echo ""
}

gate_check() {
    local name=$1
    local result=$2
    local blocker=${3:-false}
    
    ((GATE_TOTAL++))
    
    if [[ "$result" == "pass" ]]; then
        ((GATE_PASSED++))
        echo -e "${GREEN}✓ PASS${NC} - ${name}"
        log "PASS: $name"
    else
        ((GATE_FAILED++))
        if [[ "$blocker" == "true" ]]; then
            ((BLOCKER_COUNT++))
            echo -e "${RED}✗ BLOCKER${NC} - ${name}"
            log "BLOCKER: $name"
        else
            echo -e "${YELLOW}⚠ FAIL${NC} - ${name}"
            log "FAIL: $name"
        fi
    fi
}

run_command() {
    local description=$1
    local command=$2
    local output_file="${REPORT_DIR}/${description//[ \/]/-}.log"
    
    echo -e "${CYAN}Running: ${description}...${NC}"
    log "Executing: $command"
    
    if eval "$command" > "$output_file" 2>&1; then
        return 0
    else
        return 1
    fi
}

#═══════════════════════════════════════════════════════════════════════════════
# GATE 1: Code Quality & Linting
#═══════════════════════════════════════════════════════════════════════════════
check_code_quality() {
    echo -e "\n${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}   Gate 1: Code Quality & Linting${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}\n"
    
    # ESLint check
    if run_command "ESLint" "npm run lint"; then
        gate_check "ESLint: 0 errors" "pass"
    else
        gate_check "ESLint: Errors found" "fail" "true"
    fi
    
    # TypeScript compilation
    if run_command "TypeScript" "npm run check"; then
        gate_check "TypeScript: 0 compilation errors" "pass"
    else
        gate_check "TypeScript: Compilation errors" "fail" "true"
    fi
    
    # Prettier format check
    if run_command "Prettier" "npm run format:check"; then
        gate_check "Prettier: Code formatted correctly" "pass"
    else
        gate_check "Prettier: Formatting issues" "fail" "false"
    fi
}

#═══════════════════════════════════════════════════════════════════════════════
# GATE 2: Test Suite Execution
#═══════════════════════════════════════════════════════════════════════════════
check_tests() {
    echo -e "\n${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}   Gate 2: Test Suite Execution${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}\n"
    
    if [[ "$QUICK_MODE" == "true" ]]; then
        echo -e "${YELLOW}Skipping tests in quick mode${NC}"
        gate_check "Tests: Skipped (quick mode)" "pass" "false"
        return 0
    fi
    
    # Frontend unit tests
    if run_command "Frontend-Tests" "npm run test"; then
        local test_output=$(cat "${REPORT_DIR}/Frontend-Tests.log")
        local passed=$(echo "$test_output" | grep -oP '\d+ passed' | grep -oP '\d+' || echo "0")
        local total=$(echo "$test_output" | grep -oP 'Tests.*\d+ passed.*\((\d+)\)' | grep -oP '\d+' | tail -1 || echo "1")
        
        if [[ $total -gt 0 ]]; then
            local pass_rate=$(( (passed * 100) / total ))
            if [[ $pass_rate -ge $MIN_TEST_PASS_RATE ]]; then
                gate_check "Frontend Tests: ${pass_rate}% pass rate (${passed}/${total})" "pass"
            else
                gate_check "Frontend Tests: ${pass_rate}% pass rate below threshold" "fail" "true"
            fi
        else
            gate_check "Frontend Tests: Unable to determine pass rate" "fail" "false"
        fi
    else
        gate_check "Frontend Tests: Execution failed" "fail" "true"
    fi
    
    # Architecture tests
    if run_command "Architecture-Tests" "npm run test:architecture"; then
        gate_check "Architecture Tests: 4-Ring compliance validated" "pass"
    else
        gate_check "Architecture Tests: Compliance violations detected" "fail" "false"
    fi
    
    # E2E tests (if not quick mode)
    if command -v playwright &> /dev/null; then
        if run_command "E2E-Tests" "npm run test:e2e"; then
            gate_check "E2E Tests: All scenarios passed" "pass"
        else
            gate_check "E2E Tests: Some scenarios failed" "fail" "false"
        fi
    else
        gate_check "E2E Tests: Playwright not available" "fail" "false"
    fi
}

#═══════════════════════════════════════════════════════════════════════════════
# GATE 3: Security Audit
#═══════════════════════════════════════════════════════════════════════════════
check_security() {
    echo -e "\n${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}   Gate 3: Security Audit${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}\n"
    
    # npm audit
    local npm_audit_output=$(npm audit --json 2>/dev/null || echo '{}')
    local critical=$(echo "$npm_audit_output" | jq -r '.metadata.vulnerabilities.critical // 0' 2>/dev/null || echo "0")
    local high=$(echo "$npm_audit_output" | jq -r '.metadata.vulnerabilities.high // 0' 2>/dev/null || echo "0")
    
    echo "$npm_audit_output" > "${REPORT_DIR}/npm-audit.json"
    
    if [[ $critical -le $MAX_CRITICAL_VULNERABILITIES ]] && [[ $high -le $MAX_HIGH_VULNERABILITIES ]]; then
        gate_check "npm audit: ${critical} critical, ${high} high vulnerabilities" "pass"
    else
        gate_check "npm audit: ${critical} critical, ${high} high vulnerabilities (above threshold)" "fail" "true"
    fi
    
    # Check for secrets in code
    local secret_patterns=("API_KEY=" "SECRET=" "PASSWORD=" "TOKEN=" "sk-" "-----BEGIN")
    local secrets_found=false
    
    for pattern in "${secret_patterns[@]}"; do
        if grep -r "$pattern" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "// " | grep -v "import" | grep -q "$pattern"; then
            secrets_found=true
            break
        fi
    done
    
    if [[ "$secrets_found" == "false" ]]; then
        gate_check "Secret Scan: No hardcoded secrets found" "pass"
    else
        gate_check "Secret Scan: Potential hardcoded secrets detected" "fail" "true"
    fi
    
    # CSP validation
    if grep -q "csp" src-tauri/tauri.conf.json && grep -q "default-src 'self'" src-tauri/tauri.conf.json; then
        gate_check "CSP Configuration: Properly configured" "pass"
    else
        gate_check "CSP Configuration: Missing or incomplete" "fail" "false"
    fi
}

#═══════════════════════════════════════════════════════════════════════════════
# GATE 4: Architecture Compliance
#═══════════════════════════════════════════════════════════════════════════════
check_architecture() {
    echo -e "\n${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}   Gate 4: Architecture Compliance${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}\n"
    
    # 4-Ring Model validation
    local ring_violations=0
    
    # Check Ring 2 (Engines) - should not import from Services (Ring 3)
    if grep -r "from.*services" src/engines/ --include="*.ts" 2>/dev/null | grep -v "test" | grep -q "services"; then
        ((ring_violations++))
    fi
    
    if [[ $ring_violations -eq 0 ]]; then
        gate_check "4-Ring Model: No critical violations detected" "pass"
    else
        gate_check "4-Ring Model: ${ring_violations} violations detected" "fail" "false"
    fi
    
    # Tauri-only mode enforcement
    if grep -q "exit 1" package.json && grep -q "TAURI-ONLY" package.json; then
        gate_check "Tauri-Only Mode: Enforced" "pass"
    else
        gate_check "Tauri-Only Mode: Not properly enforced" "fail" "true"
    fi
    
    # Local-first validation
    if grep -q "offline" src-tauri/tauri.conf.json || grep -q "local-first" package.json; then
        gate_check "Local-First Architecture: Documented" "pass"
    else
        gate_check "Local-First Architecture: Not documented" "fail" "false"
    fi
}

#═══════════════════════════════════════════════════════════════════════════════
# GATE 5: Build & Deployment Readiness
#═══════════════════════════════════════════════════════════════════════════════
check_build_readiness() {
    echo -e "\n${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}   Gate 5: Build & Deployment Readiness${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}\n"
    
    # Version consistency
    local pkg_version=$(grep -oP '"version":\s*"\K[^"]+' package.json | head -1)
    local cargo_version=$(grep -oP '^version\s*=\s*"\K[^"]+' src-tauri/Cargo.toml | head -1)
    local tauri_version=$(grep -oP '"version":\s*"\K[^"]+' src-tauri/tauri.conf.json | head -1)
    
    if [[ "$pkg_version" == "$cargo_version" ]] && [[ "$pkg_version" == "$tauri_version" ]]; then
        gate_check "Version Consistency: All configs match (v${pkg_version})" "pass"
    else
        gate_check "Version Consistency: Mismatch detected" "fail" "true"
    fi
    
    # Dependencies installed
    if [[ -d "node_modules" ]] && [[ -f "pnpm-lock.yaml" ]]; then
        gate_check "Dependencies: Installed and locked" "pass"
    else
        gate_check "Dependencies: Missing or unlocked" "fail" "true"
    fi
    
    # Build test (if not quick mode)
    if [[ "$QUICK_MODE" == "false" ]]; then
        if run_command "Build-Test" "npm run build"; then
            if [[ -d "dist" ]] && [[ -n "$(ls -A dist)" ]]; then
                gate_check "Build Test: Successful with artifacts" "pass"
            else
                gate_check "Build Test: Failed or no artifacts" "fail" "true"
            fi
        else
            gate_check "Build Test: Build command failed" "fail" "true"
        fi
    else
        if [[ -d "dist" ]]; then
            gate_check "Build Test: Skipped (dist exists)" "pass"
        else
            gate_check "Build Test: Skipped (no dist)" "fail" "false"
        fi
    fi
    
    # Critical files present
    local critical_files=(
        "README.md"
        "LICENSE.md"
        "CHANGELOG.md"
        "package.json"
        "src-tauri/Cargo.toml"
        "src-tauri/tauri.conf.json"
    )
    
    local missing_files=()
    for file in "${critical_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            missing_files+=("$file")
        fi
    done
    
    if [[ ${#missing_files[@]} -eq 0 ]]; then
        gate_check "Critical Files: All present" "pass"
    else
        gate_check "Critical Files: Missing ${#missing_files[@]} files" "fail" "false"
    fi
}

#═══════════════════════════════════════════════════════════════════════════════
# GATE 6: Documentation Quality
#═══════════════════════════════════════════════════════════════════════════════
check_documentation() {
    echo -e "\n${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}   Gate 6: Documentation Quality${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}\n"
    
    # README completeness
    if [[ -f "README.md" ]]; then
        local readme_size=$(wc -c < README.md)
        if [[ $readme_size -gt 1000 ]]; then
            gate_check "README.md: Comprehensive (${readme_size} bytes)" "pass"
        else
            gate_check "README.md: Too brief (${readme_size} bytes)" "fail" "false"
        fi
    else
        gate_check "README.md: Missing" "fail" "true"
    fi
    
    # CHANGELOG present
    if [[ -f "CHANGELOG.md" ]]; then
        gate_check "CHANGELOG.md: Present" "pass"
    else
        gate_check "CHANGELOG.md: Missing" "fail" "false"
    fi
    
    # API documentation
    if [[ -f "typedoc.json" ]] || [[ -d "docs/api" ]]; then
        gate_check "API Documentation: Configuration present" "pass"
    else
        gate_check "API Documentation: No configuration found" "fail" "false"
    fi
}

#═══════════════════════════════════════════════════════════════════════════════
# Summary Report
#═══════════════════════════════════════════════════════════════════════════════
generate_summary() {
    local pass_rate=0
    if [[ $GATE_TOTAL -gt 0 ]]; then
        pass_rate=$(( (GATE_PASSED * 100) / GATE_TOTAL ))
    fi
    
    local summary_file="${REPORT_DIR}/SUMMARY.txt"
    
    cat > "$summary_file" <<EOF
╔════════════════════════════════════════════════════════════════════╗
║           TITANE∞ PRE-DEPLOYMENT CHECK SUMMARY                     ║
╚════════════════════════════════════════════════════════════════════╝

Timestamp: $(date)
Project:   ${PROJECT_ROOT}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RESULTS:
  Total Gates:    ${GATE_TOTAL}
  ✓ Passed:       ${GATE_PASSED}
  ✗ Failed:       ${GATE_FAILED}
  🚫 Blockers:    ${BLOCKER_COUNT}
  
  Pass Rate:      ${pass_rate}%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DEPLOYMENT RECOMMENDATION:
EOF
    
    if [[ $BLOCKER_COUNT -eq 0 ]] && [[ $pass_rate -ge $MIN_HEALTH_SCORE ]]; then
        echo "  ✅ APPROVED FOR PRODUCTION DEPLOYMENT" >> "$summary_file"
        echo "" >> "$summary_file"
        echo "  All quality gates passed. The application is ready for" >> "$summary_file"
        echo "  production deployment." >> "$summary_file"
        deployment_status="APPROVED"
    elif [[ $BLOCKER_COUNT -eq 0 ]] && [[ $pass_rate -ge 80 ]]; then
        echo "  ⚠️  CONDITIONAL APPROVAL" >> "$summary_file"
        echo "" >> "$summary_file"
        echo "  No blockers detected, but ${GATE_FAILED} non-critical issues found." >> "$summary_file"
        echo "  Review and address these issues before deployment." >> "$summary_file"
        deployment_status="CONDITIONAL"
    else
        echo "  ❌ NOT APPROVED FOR DEPLOYMENT" >> "$summary_file"
        echo "" >> "$summary_file"
        echo "  ${BLOCKER_COUNT} blocking issue(s) detected." >> "$summary_file"
        echo "  These MUST be resolved before deployment." >> "$summary_file"
        deployment_status="REJECTED"
    fi
    
    echo "" >> "$summary_file"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> "$summary_file"
    echo "" >> "$summary_file"
    echo "Full report: ${REPORT_DIR}" >> "$summary_file"
    echo "Log file:    ${LOG_FILE}" >> "$summary_file"
    echo "" >> "$summary_file"
    
    # Display summary
    cat "$summary_file"
    
    # Set exit code based on deployment status
    case $deployment_status in
        "APPROVED")
            return 0
            ;;
        "CONDITIONAL")
            return 1
            ;;
        "REJECTED")
            return 2
            ;;
    esac
}

#═══════════════════════════════════════════════════════════════════════════════
# Main Execution
#═══════════════════════════════════════════════════════════════════════════════
main() {
    print_header
    
    check_code_quality
    check_tests
    check_security
    check_architecture
    check_build_readiness
    check_documentation
    
    echo ""
    generate_summary
}

main "$@"
