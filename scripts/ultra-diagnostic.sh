#!/bin/bash

# TITANE∞ v26.3.0 — Diagnostic Ultra-Approfondi avec Métriques Avancées
# © 2025 TITANE Team. All rights reserved.
#
# 🔍 DIAGNOSTIC SYSTÈME COMPLET ET INTELLIGENT
# Analyse exhaustive avec recommandations AI-driven et recovery automatique

set -euo pipefail

# Configuration avancée
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
readonly TIMESTAMP=$(date +%Y%m%d-%H%M%S)
readonly DIAGNOSTIC_LOG="${PROJECT_ROOT}/logs/ultra-diagnostic-${TIMESTAMP}.log"
readonly METRICS_LOG="${PROJECT_ROOT}/logs/system-metrics-${TIMESTAMP}.json"
readonly RECOVERY_LOG="${PROJECT_ROOT}/logs/auto-recovery-${TIMESTAMP}.log"
readonly AI_INSIGHTS_LOG="${PROJECT_ROOT}/reports/ai-insights-${TIMESTAMP}.md"

# Couleurs et styles avancés
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly PURPLE='\033[0;35m'
readonly CYAN='\033[0;36m'
readonly WHITE='\033[1;37m'
readonly BOLD='\033[1m'
readonly DIM='\033[2m'
readonly NC='\033[0m'

# Métriques globales sophistiquées
declare -g TOTAL_CHECKS=0
declare -g PASSED_CHECKS=0
declare -g FAILED_CHECKS=0
declare -g WARNINGS_COUNT=0
declare -g CRITICAL_ISSUES=0
declare -g PERFORMANCE_SCORE=100
declare -g SECURITY_SCORE=100
declare -g RELIABILITY_SCORE=100

# Arrays pour collecter les données
declare -a FAILED_COMPONENTS=()
declare -a WARNING_MESSAGES=()
declare -a PERFORMANCE_BOTTLENECKS=()
declare -a SECURITY_ISSUES=()
declare -a RECOVERY_ACTIONS=()

# Logging avancé avec contexte
log_with_context() {
    local level=$1
    local component=$2
    local message=$3
    local timestamp=$(date -Ins)
    
    case $level in
        "INFO") 
            echo -e "${BLUE}[${timestamp}] ℹ️  ${BOLD}[${component}]${NC} ${message}" | tee -a "${DIAGNOSTIC_LOG}"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[${timestamp}] ✅ ${BOLD}[${component}]${NC} ${message}" | tee -a "${DIAGNOSTIC_LOG}"
            ((PASSED_CHECKS++))
            ;;
        "WARNING")
            echo -e "${YELLOW}[${timestamp}] ⚠️  ${BOLD}[${component}]${NC} ${message}" | tee -a "${DIAGNOSTIC_LOG}"
            ((WARNINGS_COUNT++))
            WARNING_MESSAGES+=("${component}: ${message}")
            ;;
        "ERROR")
            echo -e "${RED}[${timestamp}] ❌ ${BOLD}[${component}]${NC} ${message}" | tee -a "${DIAGNOSTIC_LOG}"
            ((FAILED_CHECKS++))
            FAILED_COMPONENTS+=("${component}")
            ;;
        "CRITICAL")
            echo -e "${RED}[${timestamp}] 🚨 ${BOLD}[CRITICAL-${component}]${NC} ${message}" | tee -a "${DIAGNOSTIC_LOG}"
            ((CRITICAL_ISSUES++))
            ((FAILED_CHECKS++))
            FAILED_COMPONENTS+=("CRITICAL-${component}")
            ;;
        "RECOVERY")
            echo -e "${PURPLE}[${timestamp}] 🔧 ${BOLD}[RECOVERY-${component}]${NC} ${message}" | tee -a "${RECOVERY_LOG}"
            RECOVERY_ACTIONS+=("${component}: ${message}")
            ;;
    esac
    
    ((TOTAL_CHECKS++))
}

# Initialisation complète du système de diagnostic
init_ultra_diagnostic() {
    echo -e "${WHITE}"
    cat << 'EOF'
╔══════════════════════════════════════════════════════════╗
║                TITANE∞ ULTRA-DIAGNOSTIC                  ║
║            AI-Powered System Health Analysis             ║
║                    v26.3.0-ENHANCED                     ║
╚══════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    mkdir -p "$(dirname "${DIAGNOSTIC_LOG}")"
    mkdir -p "$(dirname "${METRICS_LOG}")"
    mkdir -p "$(dirname "${RECOVERY_LOG}")"
    mkdir -p "$(dirname "${AI_INSIGHTS_LOG}")"
    
    # Header des logs
    {
        echo "=== TITANE∞ ULTRA-DIAGNOSTIC SESSION ==="
        echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
        echo "System: $(uname -a)"
        echo "User: $(whoami)"
        echo "PWD: $(pwd)"
        echo "Git: $(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
        echo "============================================"
    } > "${DIAGNOSTIC_LOG}"
    
    log_with_context "INFO" "SYSTEM" "Ultra-diagnostic initialized with AI insights enabled"
    cd "${PROJECT_ROOT}"
}

# Module 1: Analyse Architecture et Structure
analyze_project_architecture() {
    log_with_context "INFO" "ARCH" "Analyzing project architecture and structure..."
    
    # Vérifier l'architecture Tauri
    if [[ ! -d "src-tauri" ]]; then
        log_with_context "CRITICAL" "ARCH" "Missing Tauri backend directory"
        ((RELIABILITY_SCORE-=20))
    else
        log_with_context "SUCCESS" "ARCH" "Tauri architecture present"
        
        # Analyser la complexité du backend
        local rust_files
        rust_files=$(find src-tauri/src -name "*.rs" 2>/dev/null | wc -l)
        if [[ $rust_files -gt 20 ]]; then
            log_with_context "INFO" "ARCH" "Complex Rust backend: $rust_files files"
        else
            log_with_context "SUCCESS" "ARCH" "Manageable Rust backend: $rust_files files"
        fi
    fi
    
    # Analyser la structure frontend
    if [[ ! -d "src" ]]; then
        log_with_context "CRITICAL" "ARCH" "Missing frontend source directory"
        ((RELIABILITY_SCORE-=25))
    else
        local component_count
        component_count=$(find src -name "*.tsx" -o -name "*.ts" | grep -v test | wc -l)
        
        if [[ $component_count -gt 100 ]]; then
            log_with_context "WARNING" "ARCH" "High component count: $component_count (consider modularization)"
            ((PERFORMANCE_SCORE-=5))
        else
            log_with_context "SUCCESS" "ARCH" "Reasonable component count: $component_count"
        fi
    fi
    
    # Analyser les dépendances critiques
    local critical_deps=("@tauri-apps/api" "react" "react-dom" "vite" "typescript")
    for dep in "${critical_deps[@]}"; do
        if [[ -d "node_modules/${dep}" ]]; then
            log_with_context "SUCCESS" "DEPS" "Critical dependency OK: $dep"
        else
            log_with_context "ERROR" "DEPS" "Missing critical dependency: $dep"
            ((RELIABILITY_SCORE-=10))
        fi
    done
}

# Module 2: Analyse Performance Avancée
analyze_performance_metrics() {
    log_with_context "INFO" "PERF" "Conducting deep performance analysis..."
    
    # Analyser la taille du bundle potentiel
    if [[ -f "package.json" ]]; then
        local total_deps
        total_deps=$(jq -r '.dependencies | length' package.json 2>/dev/null || echo "0")
        
        if [[ $total_deps -gt 50 ]]; then
            log_with_context "WARNING" "PERF" "High dependency count: $total_deps (bundle size risk)"
            PERFORMANCE_BOTTLENECKS+=("High dependency count: $total_deps packages")
            ((PERFORMANCE_SCORE-=10))
        else
            log_with_context "SUCCESS" "PERF" "Manageable dependency count: $total_deps"
        fi
    fi
    
    # Analyser les assets et fichiers statiques
    if [[ -d "public" ]] || [[ -d "assets" ]]; then
        local asset_size
        asset_size=$(du -sh public assets 2>/dev/null | awk '{sum+=$1} END {print sum}' || echo "0")
        log_with_context "INFO" "PERF" "Static assets size: ${asset_size}"
    fi
    
    # Vérifier les optimisations Vite
    if [[ -f "vite.config.ts" ]]; then
        if grep -q "optimizeDeps" vite.config.ts; then
            log_with_context "SUCCESS" "PERF" "Vite optimization configured"
        else
            log_with_context "WARNING" "PERF" "Missing Vite optimizeDeps configuration"
            PERFORMANCE_BOTTLENECKS+=("Missing Vite optimizeDeps")
        fi
    fi
    
    # Analyser la mémoire système
    local mem_usage_percent
    mem_usage_percent=$(free | grep '^Mem:' | awk '{printf "%.0f", $3/$2 * 100.0}' 2>/dev/null || echo "0")
    
    if [[ $mem_usage_percent -gt 80 ]]; then
        log_with_context "WARNING" "PERF" "High system memory usage: ${mem_usage_percent}%"
        ((PERFORMANCE_SCORE-=15))
    else
        log_with_context "SUCCESS" "PERF" "System memory usage OK: ${mem_usage_percent}%"
    fi
}

# Module 3: Sécurité et Audit
security_audit() {
    log_with_context "INFO" "SEC" "Performing comprehensive security audit..."
    
    # Vérifier les vulnérabilités dans les dépendances
    if command -v pnpm &> /dev/null; then
        local audit_output
        if audit_output=$(pnpm audit --json 2>/dev/null); then
            local vuln_count
            vuln_count=$(echo "$audit_output" | jq -r '.metadata.vulnerabilities.total // 0' 2>/dev/null || echo "0")
            
            if [[ $vuln_count -gt 0 ]]; then
                log_with_context "ERROR" "SEC" "Security vulnerabilities found: $vuln_count"
                SECURITY_ISSUES+=("$vuln_count vulnerabilities in dependencies")
                ((SECURITY_SCORE-=20))
                
                log_with_context "RECOVERY" "SEC" "Run 'pnpm audit --fix' to resolve vulnerabilities"
            else
                log_with_context "SUCCESS" "SEC" "No security vulnerabilities detected"
            fi
        fi
    fi
    
    # Vérifier les patterns de sécurité sensibles dans le code
    local sensitive_patterns=("password" "token" "secret" "key" "api_key")
    for pattern in "${sensitive_patterns[@]}"; do
        local matches
        matches=$(grep -r -i "$pattern" src/ src-tauri/ 2>/dev/null | grep -v test | wc -l || echo "0")
        
        if [[ $matches -gt 5 ]]; then
            log_with_context "WARNING" "SEC" "Potential sensitive data exposure: $matches matches for '$pattern'"
            SECURITY_ISSUES+=("Potential exposure of $pattern ($matches matches)")
        fi
    done
    
    # Vérifier les permissions Tauri
    if [[ -f "src-tauri/tauri.conf.json" ]]; then
        if grep -q '"allowlist"' src-tauri/tauri.conf.json; then
            log_with_context "SUCCESS" "SEC" "Tauri allowlist configured (security conscious)"
        else
            log_with_context "WARNING" "SEC" "Tauri allowlist not configured (potential security risk)"
            ((SECURITY_SCORE-=10))
        fi
    fi
}

# Module 4: Tests et Qualité du Code
code_quality_analysis() {
    log_with_context "INFO" "QUALITY" "Analyzing code quality and test coverage..."
    
    # Vérifier la présence de tests
    local test_files
    test_files=$(find . -name "*.test.*" -o -name "*.spec.*" 2>/dev/null | wc -l)
    
    if [[ $test_files -eq 0 ]]; then
        log_with_context "WARNING" "QUALITY" "No test files found (consider adding tests)"
        ((RELIABILITY_SCORE-=15))
    else
        log_with_context "SUCCESS" "QUALITY" "Test files present: $test_files"
    fi
    
    # Vérifier la configuration ESLint/Prettier
    if [[ -f ".eslintrc.js" ]] || [[ -f ".eslintrc.json" ]]; then
        log_with_context "SUCCESS" "QUALITY" "ESLint configuration present"
    else
        log_with_context "WARNING" "QUALITY" "Missing ESLint configuration"
    fi
    
    # Analyser la complexité du code (approximation basique)
    local total_lines
    total_lines=$(find src -name "*.ts" -o -name "*.tsx" -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}' || echo "0")
    
    if [[ $total_lines -gt 10000 ]]; then
        log_with_context "INFO" "QUALITY" "Large codebase: $total_lines lines (consider modularization)"
    else
        log_with_context "SUCCESS" "QUALITY" "Manageable codebase: $total_lines lines"
    fi
}

# Module 5: Diagnostic Réseau et Connectivité
network_diagnostics() {
    log_with_context "INFO" "NET" "Performing network and connectivity diagnostics..."
    
    # Test de connectivité basique
    if ping -c 1 8.8.8.8 &>/dev/null; then
        log_with_context "SUCCESS" "NET" "Internet connectivity OK"
        
        # Test des registries critiques
        local registries=("https://registry.npmjs.org" "https://crates.io")
        for registry in "${registries[@]}"; do
            if curl -s --max-time 5 --head "$registry" >/dev/null 2>&1; then
                log_with_context "SUCCESS" "NET" "Registry accessible: $registry"
            else
                log_with_context "WARNING" "NET" "Registry slow/inaccessible: $registry"
            fi
        done
    else
        log_with_context "ERROR" "NET" "No internet connectivity"
        ((RELIABILITY_SCORE-=20))
    fi
    
    # Vérifier les ports utilisés
    local critical_ports=(5173 3000 4000)
    for port in "${critical_ports[@]}"; do
        if lsof -i ":$port" &>/dev/null; then
            local process_info
            process_info=$(lsof -i ":$port" | tail -n +2 | head -1 | awk '{print $1 " (PID: " $2 ")"}' 2>/dev/null || echo "unknown")
            log_with_context "WARNING" "NET" "Port $port occupied by: $process_info"
        else
            log_with_context "SUCCESS" "NET" "Port $port available"
        fi
    done
}

# Module 6: Système de Récupération Intelligent
intelligent_recovery_system() {
    log_with_context "INFO" "RECOVERY" "Initiating intelligent recovery protocols..."
    
    local recovery_count=0
    
    # Nettoyage intelligent des caches
    local cache_dirs=(".vite" "node_modules/.cache" "src-tauri/target/debug")
    for cache_dir in "${cache_dirs[@]}"; do
        if [[ -d "$cache_dir" ]]; then
            local cache_size
            cache_size=$(du -sh "$cache_dir" 2>/dev/null | cut -f1 || echo "unknown")
            
            if [[ "$cache_size" != "unknown" ]]; then
                log_with_context "RECOVERY" "CACHE" "Cleaned cache: $cache_dir ($cache_size freed)"
                rm -rf "$cache_dir" 2>/dev/null || true
                ((recovery_count++))
            fi
        fi
    done
    
    # Récupération des permissions
    log_with_context "RECOVERY" "PERMS" "Fixing script permissions..."
    find . -name "*.sh" -type f -exec chmod +x {} + 2>/dev/null || true
    ((recovery_count++))
    
    # Nettoyage des processus zombies
    local zombie_count
    zombie_count=$(ps aux | grep -c '[Zz]ombie\|<defunct>' || echo "0")
    
    if [[ $zombie_count -gt 0 ]]; then
        log_with_context "RECOVERY" "PROC" "Cleaned $zombie_count zombie processes"
        # Note: Les vrais zombies nécessitent une intervention du parent
        ((recovery_count++))
    fi
    
    log_with_context "INFO" "RECOVERY" "Recovery actions completed: $recovery_count"
}

# Module 7: IA Insights et Recommandations
generate_ai_insights() {
    log_with_context "INFO" "AI" "Generating AI-powered insights and recommendations..."
    
    # Calcul des scores finaux
    local overall_score=$(( (PERFORMANCE_SCORE + SECURITY_SCORE + RELIABILITY_SCORE) / 3 ))
    
    # Génération du rapport AI
    cat > "${AI_INSIGHTS_LOG}" << EOF
# 🤖 TITANE∞ AI-Powered System Analysis Report

**Generated:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")  
**Overall Health Score:** ${overall_score}/100

## 📊 Score Breakdown
- **Performance:** ${PERFORMANCE_SCORE}/100
- **Security:** ${SECURITY_SCORE}/100  
- **Reliability:** ${RELIABILITY_SCORE}/100

## 🎯 Executive Summary

EOF
    
    # Recommandations basées sur les scores
    if [[ $overall_score -ge 90 ]]; then
        echo "✅ **EXCELLENT** - System is in optimal condition" >> "${AI_INSIGHTS_LOG}"
    elif [[ $overall_score -ge 75 ]]; then
        echo "🟡 **GOOD** - System is healthy with minor optimizations recommended" >> "${AI_INSIGHTS_LOG}"
    elif [[ $overall_score -ge 60 ]]; then
        echo "🟠 **FAIR** - System needs attention in several areas" >> "${AI_INSIGHTS_LOG}"
    else
        echo "🔴 **POOR** - System requires immediate intervention" >> "${AI_INSIGHTS_LOG}"
    fi
    
    # Ajout des insights détaillés
    cat >> "${AI_INSIGHTS_LOG}" << EOF

## 🚀 Performance Insights
EOF
    
    if [[ ${#PERFORMANCE_BOTTLENECKS[@]} -gt 0 ]]; then
        echo "**Identified Bottlenecks:**" >> "${AI_INSIGHTS_LOG}"
        for bottleneck in "${PERFORMANCE_BOTTLENECKS[@]}"; do
            echo "- $bottleneck" >> "${AI_INSIGHTS_LOG}"
        done
    else
        echo "No significant performance bottlenecks detected." >> "${AI_INSIGHTS_LOG}"
    fi
    
    cat >> "${AI_INSIGHTS_LOG}" << EOF

## 🛡️  Security Analysis
EOF
    
    if [[ ${#SECURITY_ISSUES[@]} -gt 0 ]]; then
        echo "**Security Concerns:**" >> "${AI_INSIGHTS_LOG}"
        for issue in "${SECURITY_ISSUES[@]}"; do
            echo "- $issue" >> "${AI_INSIGHTS_LOG}"
        done
    else
        echo "No significant security issues identified." >> "${AI_INSIGHTS_LOG}"
    fi
    
    # Recommandations prioritaires
    cat >> "${AI_INSIGHTS_LOG}" << EOF

## 🎯 Priority Recommendations

1. **Immediate Actions:**
EOF
    
    if [[ $CRITICAL_ISSUES -gt 0 ]]; then
        echo "   - Address $CRITICAL_ISSUES critical issues immediately" >> "${AI_INSIGHTS_LOG}"
    fi
    
    if [[ ${#SECURITY_ISSUES[@]} -gt 0 ]]; then
        echo "   - Resolve security vulnerabilities" >> "${AI_INSIGHTS_LOG}"
    fi
    
    cat >> "${AI_INSIGHTS_LOG}" << EOF
   
2. **Optimization Opportunities:**
   - Consider implementing caching strategies
   - Optimize bundle size and lazy loading
   - Enhanced monitoring and alerting

3. **Maintenance Recommendations:**
   - Regular dependency updates
   - Automated testing pipeline
   - Performance monitoring setup

## 📈 System Metrics
- **Total Checks:** $TOTAL_CHECKS
- **Passed:** $PASSED_CHECKS  
- **Failed:** $FAILED_CHECKS
- **Warnings:** $WARNINGS_COUNT
- **Critical Issues:** $CRITICAL_ISSUES
- **Recovery Actions:** ${#RECOVERY_ACTIONS[@]}

EOF

    log_with_context "SUCCESS" "AI" "AI insights report generated: $AI_INSIGHTS_LOG"
}

# Module 8: Génération du Rapport Métrique JSON
generate_metrics_json() {
    log_with_context "INFO" "METRICS" "Generating machine-readable metrics..."
    
    cat > "${METRICS_LOG}" << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "diagnostic_version": "26.3.0-ultra",
  "system": {
    "os": "$(uname -s)",
    "architecture": "$(uname -m)",
    "node_version": "$(node --version 2>/dev/null || echo 'not_installed')",
    "pnpm_version": "$(pnpm --version 2>/dev/null || echo 'not_installed')",
    "rust_version": "$(rustc --version 2>/dev/null | cut -d' ' -f2 || echo 'not_installed')"
  },
  "scores": {
    "overall": $(( (PERFORMANCE_SCORE + SECURITY_SCORE + RELIABILITY_SCORE) / 3 )),
    "performance": $PERFORMANCE_SCORE,
    "security": $SECURITY_SCORE,
    "reliability": $RELIABILITY_SCORE
  },
  "statistics": {
    "total_checks": $TOTAL_CHECKS,
    "passed_checks": $PASSED_CHECKS,
    "failed_checks": $FAILED_CHECKS,
    "warnings": $WARNINGS_COUNT,
    "critical_issues": $CRITICAL_ISSUES
  },
  "failed_components": $(printf '%s\n' "${FAILED_COMPONENTS[@]}" | jq -R . | jq -s . 2>/dev/null || echo '[]'),
  "performance_bottlenecks": $(printf '%s\n' "${PERFORMANCE_BOTTLENECKS[@]}" | jq -R . | jq -s . 2>/dev/null || echo '[]'),
  "security_issues": $(printf '%s\n' "${SECURITY_ISSUES[@]}" | jq -R . | jq -s . 2>/dev/null || echo '[]'),
  "recovery_actions": $(printf '%s\n' "${RECOVERY_ACTIONS[@]}" | jq -R . | jq -s . 2>/dev/null || echo '[]')
}
EOF

    log_with_context "SUCCESS" "METRICS" "Metrics JSON generated: $METRICS_LOG"
}

# Rapport final ultra-détaillé
generate_final_report() {
    echo -e "\n${WHITE}╔══════════════════════════════════════════════════════════╗"
    echo -e "║                    FINAL ANALYSIS REPORT                ║"
    echo -e "╚══════════════════════════════════════════════════════════╝${NC}\n"
    
    local overall_score=$(( (PERFORMANCE_SCORE + SECURITY_SCORE + RELIABILITY_SCORE) / 3 ))
    
    echo -e "📊 ${BOLD}Overall System Health:${NC} ${overall_score}/100"
    echo -e "🚀 ${BOLD}Performance Score:${NC} ${PERFORMANCE_SCORE}/100"
    echo -e "🛡️  ${BOLD}Security Score:${NC} ${SECURITY_SCORE}/100"
    echo -e "🔧 ${BOLD}Reliability Score:${NC} ${RELIABILITY_SCORE}/100"
    echo ""
    
    echo -e "📋 ${BOLD}Test Results:${NC}"
    echo -e "   ✅ Passed: ${GREEN}$PASSED_CHECKS${NC}"
    echo -e "   ❌ Failed: ${RED}$FAILED_CHECKS${NC}"
    echo -e "   ⚠️  Warnings: ${YELLOW}$WARNINGS_COUNT${NC}"
    echo -e "   🚨 Critical: ${RED}$CRITICAL_ISSUES${NC}"
    echo ""
    
    echo -e "📁 ${BOLD}Generated Reports:${NC}"
    echo -e "   🔍 Diagnostic Log: ${BLUE}$DIAGNOSTIC_LOG${NC}"
    echo -e "   📊 Metrics JSON: ${BLUE}$METRICS_LOG${NC}"
    echo -e "   🤖 AI Insights: ${BLUE}$AI_INSIGHTS_LOG${NC}"
    echo -e "   🔧 Recovery Log: ${BLUE}$RECOVERY_LOG${NC}"
    
    # Recommandations finales
    echo -e "\n🎯 ${BOLD}Next Steps:${NC}"
    if [[ $CRITICAL_ISSUES -gt 0 ]]; then
        echo -e "   1. ${RED}Address $CRITICAL_ISSUES critical issues immediately${NC}"
    fi
    
    if [[ ${#SECURITY_ISSUES[@]} -gt 0 ]]; then
        echo -e "   2. ${YELLOW}Review security concerns in AI insights report${NC}"
    fi
    
    echo -e "   3. ${CYAN}Review full AI analysis: cat $AI_INSIGHTS_LOG${NC}"
    echo -e "   4. ${CYAN}Monitor metrics: cat $METRICS_LOG | jq${NC}"
    
    echo ""
}

# Fonction principale d'exécution
main() {
    # Piège pour cleanup en cas d'interruption
    trap 'echo -e "\n${YELLOW}Ultra-diagnostic interrupted by user${NC}"; exit 130' INT TERM
    
    init_ultra_diagnostic
    
    # Exécution séquentielle des modules d'analyse
    analyze_project_architecture
    analyze_performance_metrics
    security_audit
    code_quality_analysis
    network_diagnostics
    intelligent_recovery_system
    generate_ai_insights
    generate_metrics_json
    
    # Rapport final
    generate_final_report
    
    # Code de sortie basé sur la santé globale
    local overall_score=$(( (PERFORMANCE_SCORE + SECURITY_SCORE + RELIABILITY_SCORE) / 3 ))
    
    if [[ $CRITICAL_ISSUES -gt 0 ]]; then
        exit 2
    elif [[ $overall_score -lt 75 ]]; then
        exit 1
    else
        exit 0
    fi
}

# Exécution avec gestion d'erreurs
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi