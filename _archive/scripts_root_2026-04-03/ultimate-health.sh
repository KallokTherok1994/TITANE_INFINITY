#!/bin/bash

# TITANE∞ v26.3.0 — Ultimate System Health Check
# © 2025 TITANE Team. All rights reserved.

set -euo pipefail

readonly PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
readonly TIMESTAMP=$(date +%Y%m%d-%H%M%S)
readonly REPORT_FILE="${PROJECT_ROOT}/reports/ultimate-health-${TIMESTAMP}.md"

# Compteurs
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
WARNINGS=0

# Arrays
declare -a ISSUES=()
declare -a RECOMMENDATIONS=()

# Logging functions
info() { echo "🔍 [INFO] $1"; }
success() { echo "✅ [PASS] $1"; ((PASSED_TESTS++)); }
warning() { echo "⚠️  [WARN] $1"; ((WARNINGS++)); ISSUES+=("WARNING: $1"); }
error() { echo "❌ [FAIL] $1"; ((FAILED_TESTS++)); ISSUES+=("ERROR: $1"); }

# Initialize
init() {
    echo "╔══════════════════════════════════════════════════╗"
    echo "║        TITANE∞ Ultimate Health Check             ║"
    echo "║               v26.3.0-Final                      ║" 
    echo "╚══════════════════════════════════════════════════╝"
    echo
    
    mkdir -p "$(dirname "$REPORT_FILE")"
    cd "$PROJECT_ROOT"
    
    info "Starting ultimate system health check..."
    ((TOTAL_TESTS++))
}

# Test 1: Dependencies
test_dependencies() {
    info "Testing critical dependencies..."
    ((TOTAL_TESTS+=3))
    
    if command -v node &>/dev/null; then
        local version=$(node --version)
        success "Node.js installed: $version"
    else
        error "Node.js not found"
    fi
    
    if command -v pnpm &>/dev/null; then
        local version=$(pnpm --version)
        success "pnpm installed: $version"
    else
        error "pnpm not found"
    fi
    
    if command -v cargo &>/dev/null; then
        local version=$(rustc --version | cut -d' ' -f2)
        success "Rust installed: $version"
    else
        warning "Rust not found (Tauri builds may fail)"
    fi
}

# Test 2: Project Structure
test_structure() {
    info "Validating project structure..."
    ((TOTAL_TESTS+=5))
    
    if [[ -f "package.json" ]]; then
        success "package.json exists"
    else
        error "package.json missing"
    fi
    
    if [[ -d "src" ]]; then
        success "src directory exists"
    else
        error "src directory missing"
    fi
    
    if [[ -d "src-tauri" ]]; then
        success "src-tauri directory exists"
    else
        error "src-tauri directory missing"
    fi
    
    if [[ -f "vite.config.ts" ]]; then
        success "vite.config.ts exists"
    else
        warning "vite.config.ts missing"
    fi
    
    if [[ -d "node_modules" ]]; then
        success "node_modules installed"
    else
        error "node_modules missing - run pnpm install"
    fi
}

# Test 3: System Resources
test_resources() {
    info "Checking system resources..."
    ((TOTAL_TESTS+=3))
    
    # Disk space
    local disk_usage=$(df "$PROJECT_ROOT" | tail -1 | awk '{print $5}' | sed 's/%//')
    if [[ $disk_usage -lt 80 ]]; then
        success "Disk space OK: ${disk_usage}% used"
    elif [[ $disk_usage -lt 90 ]]; then
        warning "Disk space running low: ${disk_usage}% used"
    else
        error "Disk space critically low: ${disk_usage}% used"
    fi
    
    # Memory
    if command -v free &>/dev/null; then
        local mem_available=$(free -m | grep '^Mem:' | awk '{print $7}')
        if [[ $mem_available -gt 1000 ]]; then
            success "Memory available: ${mem_available}MB"
        else
            warning "Low memory available: ${mem_available}MB"
        fi
    else
        info "Memory check skipped (free not available)"
    fi
    
    # Port availability
    if lsof -i :5173 &>/dev/null; then
        warning "Port 5173 is occupied"
    else
        success "Port 5173 available"
    fi
}

# Test 4: Performance & Security
test_performance_security() {
    info "Analyzing performance and security..."
    ((TOTAL_TESTS+=4))
    
    # Bundle size estimation
    if [[ -f "package.json" ]]; then
        local deps=$(jq -r '.dependencies | length' package.json 2>/dev/null || echo "0")
        if [[ $deps -lt 30 ]]; then
            success "Dependency count reasonable: $deps"
        elif [[ $deps -lt 50 ]]; then
            warning "High dependency count: $deps"
        else
            error "Very high dependency count: $deps"
        fi
    fi
    
    # Security check
    if command -v pnpm &>/dev/null && [[ -f "package.json" ]]; then
        if pnpm audit --json &>/dev/null; then
            local vulns=$(pnpm audit --json 2>/dev/null | jq -r '.metadata.vulnerabilities.total // 0' || echo "0")
            if [[ $vulns -eq 0 ]]; then
                success "No security vulnerabilities"
            else
                error "Security vulnerabilities found: $vulns"
                RECOMMENDATIONS+=("Run 'pnpm audit --fix' to resolve vulnerabilities")
            fi
        else
            info "Security audit skipped"
        fi
    fi
    
    # Cache check
    local cache_size=0
    if [[ -d "node_modules/.vite" ]]; then
        cache_size=$(du -sm node_modules/.vite 2>/dev/null | cut -f1 || echo "0")
    fi
    
    if [[ $cache_size -gt 100 ]]; then
        warning "Large Vite cache: ${cache_size}MB"
        RECOMMENDATIONS+=("Consider cleaning cache with: rm -rf node_modules/.vite")
    else
        success "Cache size reasonable: ${cache_size}MB"
    fi
    
    # Test files
    local test_count=$(find . -name "*.test.*" -o -name "*.spec.*" 2>/dev/null | wc -l)
    if [[ $test_count -gt 0 ]]; then
        success "Test files present: $test_count"
    else
        warning "No test files found"
        RECOMMENDATIONS+=("Consider adding unit tests for better reliability")
    fi
}

# Generate recommendations
generate_recommendations() {
    # Performance recommendations
    if [[ $WARNINGS -gt 0 ]] || [[ $FAILED_TESTS -gt 0 ]]; then
        RECOMMENDATIONS+=("Review issues above and take corrective actions")
    fi
    
    # Always useful recommendations
    RECOMMENDATIONS+=("Run './scripts/validate-boot.sh' for boot-specific checks")
    RECOMMENDATIONS+=("Use 'pnpm run dev:clean' for clean development startup")
    RECOMMENDATIONS+=("Monitor system with built-in health dashboard")
    
    if [[ $FAILED_TESTS -gt 0 ]]; then
        RECOMMENDATIONS+=("Address failed tests before production deployment")
    fi
}

# Generate report
generate_report() {
    local overall_score=$(( (PASSED_TESTS * 100) / TOTAL_TESTS ))
    
    cat > "$REPORT_FILE" << EOF
# TITANE∞ Ultimate Health Report

**Generated:** $(date)  
**Overall Score:** ${overall_score}/100

## Summary
- **Total Tests:** $TOTAL_TESTS
- **Passed:** $PASSED_TESTS ✅
- **Failed:** $FAILED_TESTS ❌  
- **Warnings:** $WARNINGS ⚠️

## Health Status
EOF
    
    if [[ $overall_score -ge 90 ]]; then
        echo "🟢 **EXCELLENT** - System is in optimal condition" >> "$REPORT_FILE"
    elif [[ $overall_score -ge 75 ]]; then
        echo "🟡 **GOOD** - System is healthy with minor issues" >> "$REPORT_FILE"
    elif [[ $overall_score -ge 60 ]]; then
        echo "🟠 **FAIR** - System needs attention" >> "$REPORT_FILE"
    else
        echo "🔴 **POOR** - System requires immediate action" >> "$REPORT_FILE"
    fi
    
    if [[ ${#ISSUES[@]} -gt 0 ]]; then
        echo -e "\n## Issues Found" >> "$REPORT_FILE"
        for issue in "${ISSUES[@]}"; do
            echo "- $issue" >> "$REPORT_FILE"
        done
    fi
    
    if [[ ${#RECOMMENDATIONS[@]} -gt 0 ]]; then
        echo -e "\n## Recommendations" >> "$REPORT_FILE"
        for rec in "${RECOMMENDATIONS[@]}"; do
            echo "- $rec" >> "$REPORT_FILE"
        done
    fi
    
    echo -e "\n## Quick Commands" >> "$REPORT_FILE"
    echo "- Health check: \`./scripts/ultimate-health.sh\`" >> "$REPORT_FILE"
    echo "- Boot validation: \`./scripts/validate-boot.sh\`" >> "$REPORT_FILE"
    echo "- Clean development: \`pnpm run dev:clean\`" >> "$REPORT_FILE"
    echo "- Security audit: \`pnpm audit\`" >> "$REPORT_FILE"
}

# Final report
final_report() {
    local overall_score=$(( (PASSED_TESTS * 100) / TOTAL_TESTS ))
    
    echo
    echo "╔══════════════════════════════════════════════════╗"
    echo "║                 FINAL REPORT                     ║"
    echo "╚══════════════════════════════════════════════════╝"
    echo
    echo "📊 Overall Score: ${overall_score}/100"
    echo "✅ Passed: $PASSED_TESTS/$TOTAL_TESTS"
    echo "❌ Failed: $FAILED_TESTS"  
    echo "⚠️  Warnings: $WARNINGS"
    echo
    echo "📄 Detailed report: $REPORT_FILE"
    echo
    
    if [[ $FAILED_TESTS -gt 0 ]]; then
        echo "🔴 System needs attention - $FAILED_TESTS critical issues"
        return 1
    elif [[ $WARNINGS -gt 3 ]]; then
        echo "🟡 System has warnings - consider improvements"
        return 1
    else
        echo "🟢 System is healthy!"
        return 0
    fi
}

# Main execution
main() {
    trap 'echo -e "\n⚠️  Health check interrupted"; exit 130' INT TERM
    
    init
    test_dependencies
    test_structure  
    test_resources
    test_performance_security
    generate_recommendations
    generate_report
    final_report
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi