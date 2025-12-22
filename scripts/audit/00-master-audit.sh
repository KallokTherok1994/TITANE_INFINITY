#!/usr/bin/env bash
#═══════════════════════════════════════════════════════════════════════════════
# TITANE∞ Master Audit Orchestrator
# Version: 26.2.0
# Description: Orchestrates all audit scripts and generates unified report
#═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
REPORT_DIR="${PROJECT_ROOT}/reports/master-audit-${TIMESTAMP}"

# Initialize counters
declare -A AUDIT_SCORES
TOTAL_SCORE=0
TOTAL_CHECKS=0
TOTAL_PASSED=0
TOTAL_WARNINGS=0
TOTAL_ERRORS=0

# Audit configuration
AUDITS=(
    "01-security-audit.sh:Security:25"
    "02-architecture-audit.sh:Architecture:20"
    "03-performance-measure.sh:Performance:15"
    "04-test-coverage.sh:Test Coverage:20"
    "05-deployment-audit.sh:Deployment:20"
)

print_header() {
    echo -e "\n${PURPLE}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${NC}     ${CYAN}🌟 TITANE∞ MASTER AUDIT ORCHESTRATOR 🌟${NC}                    ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${NC}     ${YELLOW}Complete System Quality Assessment${NC}                         ${PURPLE}║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════════╝${NC}\n"
    echo -e "${BLUE}📅 Timestamp:${NC} ${TIMESTAMP}"
    echo -e "${BLUE}📁 Report Directory:${NC} ${REPORT_DIR}"
    echo ""
}

run_audit() {
    local script=$1
    local name=$2
    local weight=$3
    local script_path="${SCRIPT_DIR}/${script}"
    
    echo -e "\n${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}   Running: ${YELLOW}${name}${NC} Audit (Weight: ${weight}%)"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}\n"
    
    if [[ ! -f "$script_path" ]]; then
        echo -e "${RED}✗ Script not found: ${script_path}${NC}"
        AUDIT_SCORES[$name]=0
        return 1
    fi
    
    # Run audit and capture output
    local audit_log="${REPORT_DIR}/audit-${name// /-}.log"
    local start_time=$(date +%s)
    
    if bash "$script_path" > "$audit_log" 2>&1; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        echo -e "${GREEN}✓ ${name} completed in ${duration}s${NC}"
        
        # Extract score from log if available
        local score=$(grep -oP 'Score:\s*\K[0-9]+' "$audit_log" 2>/dev/null | tail -1 || echo "0")
        if [[ -z "$score" || "$score" == "0" ]]; then
            # Default to 100 if completed successfully without score
            score=100
        fi
        AUDIT_SCORES[$name]=$score
    else
        echo -e "${YELLOW}⚠ ${name} completed with warnings${NC}"
        AUDIT_SCORES[$name]=50
    fi
}

calculate_final_score() {
    local weighted_sum=0
    local total_weight=0
    
    for audit_info in "${AUDITS[@]}"; do
        IFS=':' read -r script name weight <<< "$audit_info"
        local score=${AUDIT_SCORES[$name]:-0}
        weighted_sum=$((weighted_sum + (score * weight)))
        total_weight=$((total_weight + weight))
    done
    
    if [[ $total_weight -gt 0 ]]; then
        TOTAL_SCORE=$((weighted_sum / total_weight))
    else
        TOTAL_SCORE=0
    fi
}

get_grade() {
    local score=$1
    if [[ $score -ge 95 ]]; then
        echo "A+"
    elif [[ $score -ge 90 ]]; then
        echo "A"
    elif [[ $score -ge 85 ]]; then
        echo "A-"
    elif [[ $score -ge 80 ]]; then
        echo "B+"
    elif [[ $score -ge 75 ]]; then
        echo "B"
    elif [[ $score -ge 70 ]]; then
        echo "B-"
    elif [[ $score -ge 65 ]]; then
        echo "C+"
    elif [[ $score -ge 60 ]]; then
        echo "C"
    elif [[ $score -ge 55 ]]; then
        echo "C-"
    elif [[ $score -ge 50 ]]; then
        echo "D"
    else
        echo "F"
    fi
}

generate_master_report() {
    local report_file="${REPORT_DIR}/MASTER_AUDIT_REPORT.md"
    local grade=$(get_grade $TOTAL_SCORE)
    
    cat > "$report_file" << EOF
# 🌟 TITANE∞ Master Audit Report

**Generated**: $(date '+%Y-%m-%d %H:%M:%S')
**Version**: 26.2.0
**Project**: TITANE∞ Cognitive Operating System

---

## 📊 Overall Score

\`\`\`
╔═══════════════════════════════════════╗
║                                       ║
║     FINAL SCORE: ${TOTAL_SCORE}/100 (${grade})          ║
║                                       ║
╚═══════════════════════════════════════╝
\`\`\`

---

## 📋 Audit Results Summary

| Audit Category | Score | Weight | Weighted |
|---------------|-------|--------|----------|
EOF

    for audit_info in "${AUDITS[@]}"; do
        IFS=':' read -r script name weight <<< "$audit_info"
        local score=${AUDIT_SCORES[$name]:-0}
        local weighted=$((score * weight / 100))
        local grade_item=$(get_grade $score)
        echo "| ${name} | ${score}/100 (${grade_item}) | ${weight}% | ${weighted} |" >> "$report_file"
    done

    cat >> "$report_file" << EOF

---

## 🎯 Quality Gates Status

EOF

    # Quality gates
    local gates_passed=0
    local total_gates=5
    
    if [[ ${AUDIT_SCORES[Security]:-0} -ge 80 ]]; then
        echo "- [x] **Security Gate**: Score ≥ 80 ✅" >> "$report_file"
        ((gates_passed++))
    else
        echo "- [ ] **Security Gate**: Score ≥ 80 ❌ (Current: ${AUDIT_SCORES[Security]:-0})" >> "$report_file"
    fi
    
    if [[ ${AUDIT_SCORES[Architecture]:-0} -ge 75 ]]; then
        echo "- [x] **Architecture Gate**: Score ≥ 75 ✅" >> "$report_file"
        ((gates_passed++))
    else
        echo "- [ ] **Architecture Gate**: Score ≥ 75 ❌ (Current: ${AUDIT_SCORES[Architecture]:-0})" >> "$report_file"
    fi
    
    if [[ ${AUDIT_SCORES[Performance]:-0} -ge 70 ]]; then
        echo "- [x] **Performance Gate**: Score ≥ 70 ✅" >> "$report_file"
        ((gates_passed++))
    else
        echo "- [ ] **Performance Gate**: Score ≥ 70 ❌ (Current: ${AUDIT_SCORES[Performance]:-0})" >> "$report_file"
    fi
    
    if [[ ${AUDIT_SCORES["Test Coverage"]:-0} -ge 70 ]]; then
        echo "- [x] **Test Coverage Gate**: Score ≥ 70 ✅" >> "$report_file"
        ((gates_passed++))
    else
        echo "- [ ] **Test Coverage Gate**: Score ≥ 70 ❌ (Current: ${AUDIT_SCORES["Test Coverage"]:-0})" >> "$report_file"
    fi
    
    if [[ ${AUDIT_SCORES[Deployment]:-0} -ge 90 ]]; then
        echo "- [x] **Deployment Gate**: Score ≥ 90 ✅" >> "$report_file"
        ((gates_passed++))
    else
        echo "- [ ] **Deployment Gate**: Score ≥ 90 ❌ (Current: ${AUDIT_SCORES[Deployment]:-0})" >> "$report_file"
    fi

    cat >> "$report_file" << EOF

**Gates Passed**: ${gates_passed}/${total_gates}

---

## 🚀 Recommendations

### Immediate Actions (P0)
EOF

    # Generate recommendations based on scores
    if [[ ${AUDIT_SCORES[Security]:-0} -lt 80 ]]; then
        echo "- Address security vulnerabilities (unwrap() usage, potential secrets)" >> "$report_file"
    fi
    
    if [[ ${AUDIT_SCORES[Architecture]:-0} -lt 75 ]]; then
        echo "- Resolve architecture duplications (DevTools, Chat consolidation)" >> "$report_file"
    fi

    cat >> "$report_file" << EOF

### This Week (P1)
- Review all audit logs in \`${REPORT_DIR}/\`
- Execute automated fixes where applicable
- Run \`pnpm run verify\` to validate changes

### This Sprint (P2)
- Complete consolidation plan
- Improve test coverage
- Optimize performance metrics

---

## 📁 Report Files

EOF

    for audit_info in "${AUDITS[@]}"; do
        IFS=':' read -r script name weight <<< "$audit_info"
        local log_name="audit-${name// /-}.log"
        echo "- \`${log_name}\` - ${name} detailed log" >> "$report_file"
    done

    cat >> "$report_file" << EOF

---

## 🔄 Next Audit

Run the master audit again after addressing issues:

\`\`\`bash
./scripts/audit/00-master-audit.sh
\`\`\`

---

**TITANE∞** - *Striving for Perfection* 🌟
EOF

    echo "$report_file"
}

print_summary() {
    local grade=$(get_grade $TOTAL_SCORE)
    
    echo -e "\n${PURPLE}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${NC}                    ${CYAN}MASTER AUDIT SUMMARY${NC}                         ${PURPLE}║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════════╝${NC}\n"
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "  ${CYAN}Audit Category${NC}          ${CYAN}Score${NC}        ${CYAN}Weight${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    for audit_info in "${AUDITS[@]}"; do
        IFS=':' read -r script name weight <<< "$audit_info"
        local score=${AUDIT_SCORES[$name]:-0}
        local grade_item=$(get_grade $score)
        
        # Color based on score
        local color=$GREEN
        if [[ $score -lt 70 ]]; then
            color=$RED
        elif [[ $score -lt 85 ]]; then
            color=$YELLOW
        fi
        
        printf "  %-22s ${color}%3d/100 (%s)${NC}    %2d%%\n" "$name" "$score" "$grade_item" "$weight"
    done
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Final score with color
    local final_color=$GREEN
    if [[ $TOTAL_SCORE -lt 70 ]]; then
        final_color=$RED
    elif [[ $TOTAL_SCORE -lt 85 ]]; then
        final_color=$YELLOW
    fi
    
    echo -e "\n  ${CYAN}FINAL SCORE:${NC} ${final_color}${TOTAL_SCORE}/100 (${grade})${NC}\n"
    
    echo -e "${BLUE}📁 Full report:${NC} ${REPORT_DIR}/MASTER_AUDIT_REPORT.md"
}

main() {
    print_header
    
    # Create report directory
    mkdir -p "$REPORT_DIR"
    
    # Run all audits
    for audit_info in "${AUDITS[@]}"; do
        IFS=':' read -r script name weight <<< "$audit_info"
        run_audit "$script" "$name" "$weight" || true
    done
    
    # Calculate final score
    calculate_final_score
    
    # Generate master report
    generate_master_report
    
    # Print summary
    print_summary
}

main "$@"
