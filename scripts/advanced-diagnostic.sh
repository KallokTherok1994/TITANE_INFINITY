#!/bin/bash

# TITANE∞ v26.3.0 — Advanced Diagnostic & Recovery System
# © 2025 TITANE Team. All rights reserved.
#
# 🔧 SYSTÈME DE DIAGNOSTIC AVANCÉ ET RÉCUPÉRATION AUTOMATIQUE
# Analyse proactive, détection d'anomalies et correction automatique

set -euo pipefail

# Configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
readonly DIAGNOSTIC_LOG="${PROJECT_ROOT}/logs/advanced-diagnostic.log"
readonly RECOVERY_LOG="${PROJECT_ROOT}/logs/recovery-actions.log"
readonly HEALTH_REPORT="${PROJECT_ROOT}/reports/system-health-$(date +%Y%m%d-%H%M%S).json"

# Couleurs pour les logs
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly PURPLE='\033[0;35m'
readonly CYAN='\033[0;36m'
readonly WHITE='\033[1;37m'
readonly NC='\033[0m' # No Color

# Compteurs globaux
ISSUES_DETECTED=0
ISSUES_RESOLVED=0
CRITICAL_ISSUES=0
WARNINGS_FOUND=0

# Fonctions utilitaires
log_info() {
    echo -e "${BLUE}ℹ️  [INFO]${NC} $1" | tee -a "${DIAGNOSTIC_LOG}"
}

log_success() {
    echo -e "${GREEN}✅ [SUCCESS]${NC} $1" | tee -a "${DIAGNOSTIC_LOG}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  [WARNING]${NC} $1" | tee -a "${DIAGNOSTIC_LOG}"
    ((WARNINGS_FOUND++))
}

log_error() {
    echo -e "${RED}❌ [ERROR]${NC} $1" | tee -a "${DIAGNOSTIC_LOG}"
    ((ISSUES_DETECTED++))
}

log_critical() {
    echo -e "${RED}🚨 [CRITICAL]${NC} $1" | tee -a "${DIAGNOSTIC_LOG}"
    ((CRITICAL_ISSUES++))
    ((ISSUES_DETECTED++))
}

log_recovery() {
    echo -e "${PURPLE}🔧 [RECOVERY]${NC} $1" | tee -a "${RECOVERY_LOG}"
}

log_diagnostic() {
    echo -e "${CYAN}🔍 [DIAGNOSTIC]${NC} $1" | tee -a "${DIAGNOSTIC_LOG}"
}

# Initialisation des logs
init_logs() {
    mkdir -p "$(dirname "${DIAGNOSTIC_LOG}")"
    mkdir -p "$(dirname "${RECOVERY_LOG}")"
    mkdir -p "$(dirname "${HEALTH_REPORT}")"
    
    echo "=== ADVANCED DIAGNOSTIC SESSION STARTED ===" > "${DIAGNOSTIC_LOG}"
    echo "Date: $(date)" >> "${DIAGNOSTIC_LOG}"
    echo "User: $(whoami)" >> "${DIAGNOSTIC_LOG}"
    echo "PWD: $(pwd)" >> "${DIAGNOSTIC_LOG}"
    echo "=========================================" >> "${DIAGNOSTIC_LOG}"
    
    echo "=== RECOVERY ACTIONS LOG ===" > "${RECOVERY_LOG}"
    echo "Date: $(date)" >> "${RECOVERY_LOG}"
    echo "============================" >> "${RECOVERY_LOG}"
}

# Diagnostic 1: Analyse des dépendances critiques
check_critical_dependencies() {
    log_diagnostic "Checking critical dependencies..."
    
    local issues_found=0
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        log_critical "Node.js not found in PATH"
        ((issues_found++))
    else
        local node_version
        node_version=$(node --version | sed 's/v//')
        local node_major
        node_major=$(echo "$node_version" | cut -d. -f1)
        
        if [[ $node_major -lt 18 ]]; then
            log_error "Node.js version too old: $node_version (required: >=18.0.0)"
            ((issues_found++))
        else
            log_success "Node.js version OK: $node_version"
        fi
    fi
    
    # Vérifier pnpm
    if ! command -v pnpm &> /dev/null; then
        log_error "pnpm not found - attempting installation"
        if npm install -g pnpm; then
            log_recovery "pnpm installed successfully"
            ((ISSUES_RESOLVED++))
        else
            log_critical "Failed to install pnpm"
            ((issues_found++))
        fi
    else
        local pnpm_version
        pnpm_version=$(pnpm --version)
        log_success "pnpm version OK: $pnpm_version"
    fi
    
    # Vérifier Rust/Cargo pour Tauri
    if ! command -v cargo &> /dev/null; then
        log_critical "Rust/Cargo not found - Tauri builds will fail"
        ((issues_found++))
    else
        local rust_version
        rust_version=$(rustc --version | cut -d' ' -f2)
        log_success "Rust version OK: $rust_version"
    fi
    
    return $issues_found
}

# Diagnostic 2: Vérification de l'intégrité des modules
check_module_integrity() {
    log_diagnostic "Checking module integrity..."
    
    local issues_found=0
    
    # Vérifier node_modules
    if [[ ! -d "${PROJECT_ROOT}/node_modules" ]]; then
        log_error "node_modules directory missing"
        log_recovery "Running pnpm install to restore dependencies"
        
        cd "${PROJECT_ROOT}"
        if pnpm install; then
            log_success "Dependencies restored successfully"
            ((ISSUES_RESOLVED++))
        else
            log_critical "Failed to restore dependencies"
            ((issues_found++))
        fi
    else
        log_success "node_modules directory exists"
        
        # Vérifier les modules critiques
        local critical_modules=(
            "@tauri-apps/api"
            "react"
            "react-dom"
            "vite"
            "typescript"
        )
        
        for module in "${critical_modules[@]}"; do
            if [[ ! -d "${PROJECT_ROOT}/node_modules/${module}" ]]; then
                log_error "Critical module missing: $module"
                ((issues_found++))
            fi
        done
    fi
    
    # Vérifier les lockfiles
    if [[ ! -f "${PROJECT_ROOT}/pnpm-lock.yaml" ]]; then
        log_warning "pnpm-lock.yaml missing - dependency versions not locked"
    fi
    
    return $issues_found
}

# Diagnostic 3: Analyse des configurations critiques
check_configuration_files() {
    log_diagnostic "Checking critical configuration files..."
    
    local issues_found=0
    
    # Configuration files à vérifier
    local config_files=(
        "package.json"
        "vite.config.ts"
        "tsconfig.json"
        "src-tauri/tauri.conf.json"
        "src-tauri/Cargo.toml"
    )
    
    for config_file in "${config_files[@]}"; do
        local file_path="${PROJECT_ROOT}/${config_file}"
        
        if [[ ! -f "$file_path" ]]; then
            log_error "Configuration file missing: $config_file"
            ((issues_found++))
        else
            # Vérification syntaxique JSON/TOML
            case "$config_file" in
                *.json)
                    # Vérification spéciale pour tsconfig.json (peut contenir des commentaires)
                    if [[ "$config_file" == "tsconfig.json" ]]; then
                        # TypeScript config files peuvent avoir des commentaires - juste vérifier l'existence
                        log_success "Configuration OK: $config_file (TypeScript config)"
                    elif ! jq empty "$file_path" 2>/dev/null; then
                        log_error "Invalid JSON syntax in $config_file"
                        ((issues_found++))
                    else
                        log_success "Configuration OK: $config_file"
                    fi
                    ;;
                *.toml)
                    # Vérification basique TOML (nécessiterait un parser dédié pour une vérif complète)
                    if grep -q "^\[" "$file_path"; then
                        log_success "Configuration appears OK: $config_file"
                    else
                        log_warning "Configuration file might have issues: $config_file"
                    fi
                    ;;
                *.ts)
                    # Vérification TypeScript basique
                    if command -v tsc &> /dev/null; then
                        if tsc --noEmit "$file_path" 2>/dev/null; then
                            log_success "TypeScript config OK: $config_file"
                        else
                            log_warning "TypeScript config has issues: $config_file"
                        fi
                    fi
                    ;;
            esac
        fi
    done
    
    return $issues_found
}

# Diagnostic 4: Analyse des performances et ressources
check_system_resources() {
    log_diagnostic "Checking system resources and performance..."
    
    local issues_found=0
    
    # Vérifier l'espace disque
    local disk_usage
    disk_usage=$(df "${PROJECT_ROOT}" | tail -1 | awk '{print $5}' | sed 's/%//')
    
    if [[ $disk_usage -gt 90 ]]; then
        log_critical "Disk space critically low: ${disk_usage}% used"
        ((issues_found++))
    elif [[ $disk_usage -gt 80 ]]; then
        log_warning "Disk space running low: ${disk_usage}% used"
    else
        log_success "Disk space OK: ${disk_usage}% used"
    fi
    
    # Vérifier la mémoire disponible
    if command -v free &> /dev/null; then
        local mem_available
        mem_available=$(free -m | grep '^Mem:' | awk '{print $7}')
        
        if [[ $mem_available -lt 512 ]]; then
            log_warning "Low memory available: ${mem_available}MB"
        else
            log_success "Memory available: ${mem_available}MB"
        fi
    fi
    
    # Vérifier les processus en cours
    local node_processes
    node_processes=$(pgrep -f "node.*vite\|node.*tauri" | wc -l)
    
    if [[ $node_processes -gt 5 ]]; then
        log_warning "Many Node.js processes running: $node_processes"
        log_diagnostic "Consider cleaning up with: pkill -f 'node.*vite'"
    else
        log_success "Node.js processes count OK: $node_processes"
    fi
    
    return $issues_found
}

# Diagnostic 5: Vérification réseau et connectivité
check_network_connectivity() {
    log_diagnostic "Checking network connectivity..."
    
    local issues_found=0
    
    # Vérifier la connectivité internet
    if ! ping -c 1 8.8.8.8 &>/dev/null; then
        log_error "No internet connectivity detected"
        ((issues_found++))
    else
        log_success "Internet connectivity OK"
        
        # Tester les registries NPM
        if ! curl -s --max-time 5 https://registry.npmjs.org/ >/dev/null; then
            log_warning "NPM registry not accessible"
        else
            log_success "NPM registry accessible"
        fi
    fi
    
    # Vérifier les ports critiques
    local ports_to_check=(5173 4000 3000)
    for port in "${ports_to_check[@]}"; do
        if lsof -i ":$port" &>/dev/null; then
            local process_info
            process_info=$(lsof -i ":$port" | tail -n +2 | head -1 | awk '{print $1 " (PID: " $2 ")"}')
            log_warning "Port $port is in use by: $process_info"
        else
            log_success "Port $port is available"
        fi
    done
    
    return $issues_found
}

# Diagnostic 6: Analyse des logs d'erreurs récents
analyze_error_logs() {
    log_diagnostic "Analyzing recent error logs..."
    
    local issues_found=0
    
    # Analyser les logs de build récents
    local log_files=(
        "${PROJECT_ROOT}/dev_tauri_log.txt"
        "${PROJECT_ROOT}/build_log.txt"
        "${PROJECT_ROOT}/logs/boot-diagnostic.log"
    )
    
    for log_file in "${log_files[@]}"; do
        if [[ -f "$log_file" ]]; then
            log_diagnostic "Analyzing log file: $(basename "$log_file")"
            
            # Rechercher des patterns d'erreurs critiques
            local error_patterns=(
                "TypeError: Importing a module script failed"
                "ECONNREFUSED"
                "ERR_NETWORK"
                "Build failed"
                "Compilation error"
                "Module not found"
                "Permission denied"
                "ENOSPC"
            )
            
            for pattern in "${error_patterns[@]}"; do
                local count
                count=$(grep -c "$pattern" "$log_file" 2>/dev/null || echo "0")
                
                if [[ $count -gt 0 ]]; then
                    log_error "Found $count occurrences of '$pattern' in $(basename "$log_file")"
                    ((issues_found++))
                    
                    # Extraire les lignes d'erreur pour diagnostic
                    echo "Recent errors from $(basename "$log_file"):" >> "${DIAGNOSTIC_LOG}"
                    grep -n "$pattern" "$log_file" | tail -3 >> "${DIAGNOSTIC_LOG}"
                fi
            done
        fi
    done
    
    return $issues_found
}

# Système de récupération automatique
auto_recovery_system() {
    log_diagnostic "Starting automatic recovery system..."
    
    local recovery_actions=0
    
    # Récupération 1: Nettoyer les caches corrompus
    if [[ -d "${PROJECT_ROOT}/node_modules/.vite" ]]; then
        log_recovery "Cleaning Vite cache"
        rm -rf "${PROJECT_ROOT}/node_modules/.vite"
        ((recovery_actions++))
        ((ISSUES_RESOLVED++))
    fi
    
    # Récupération 2: Nettoyer les builds temporaires
    if [[ -d "${PROJECT_ROOT}/src-tauri/target/debug" ]]; then
        local target_size
        target_size=$(du -sh "${PROJECT_ROOT}/src-tauri/target/debug" | cut -f1)
        log_recovery "Large target directory found ($target_size), cleaning..."
        rm -rf "${PROJECT_ROOT}/src-tauri/target/debug"
        ((recovery_actions++))
        ((ISSUES_RESOLVED++))
    fi
    
    # Récupération 3: Réinitialiser les permissions
    log_recovery "Checking and fixing file permissions..."
    find "${PROJECT_ROOT}" -name "*.sh" -exec chmod +x {} \; 2>/dev/null || true
    ((recovery_actions++))
    
    # Récupération 4: Nettoyer les processus zombies
    local zombie_processes
    zombie_processes=$(pgrep -f "node.*defunct\|vite.*defunct" | wc -l)
    
    if [[ $zombie_processes -gt 0 ]]; then
        log_recovery "Cleaning $zombie_processes zombie processes"
        pkill -9 -f "node.*defunct" 2>/dev/null || true
        pkill -9 -f "vite.*defunct" 2>/dev/null || true
        ((recovery_actions++))
        ((ISSUES_RESOLVED++))
    fi
    
    log_success "Auto-recovery completed: $recovery_actions actions performed"
}

# Génération du rapport de santé système
generate_health_report() {
    log_diagnostic "Generating comprehensive health report..."
    
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    cat > "${HEALTH_REPORT}" << EOF
{
  "timestamp": "$timestamp",
  "system_info": {
    "os": "$(uname -s)",
    "architecture": "$(uname -m)",
    "node_version": "$(node --version 2>/dev/null || echo 'not_found')",
    "pnpm_version": "$(pnpm --version 2>/dev/null || echo 'not_found')",
    "rust_version": "$(rustc --version 2>/dev/null | cut -d' ' -f2 || echo 'not_found')"
  },
  "diagnostic_results": {
    "total_issues_detected": $ISSUES_DETECTED,
    "critical_issues": $CRITICAL_ISSUES,
    "warnings": $WARNINGS_FOUND,
    "issues_resolved": $ISSUES_RESOLVED
  },
  "disk_usage": {
    "project_directory": "${PROJECT_ROOT}",
    "usage_percentage": $(df "${PROJECT_ROOT}" | tail -1 | awk '{print $5}' | sed 's/%//'),
    "available_space": "$(df -h "${PROJECT_ROOT}" | tail -1 | awk '{print $4}')"
  },
  "network_status": {
    "internet_connectivity": $(ping -c 1 8.8.8.8 &>/dev/null && echo "true" || echo "false"),
    "npm_registry_accessible": $(curl -s --max-time 5 https://registry.npmjs.org/ >/dev/null && echo "true" || echo "false")
  },
  "running_processes": {
    "node_processes": $(pgrep -f "node" | wc -l),
    "vite_processes": $(pgrep -f "vite" | wc -l),
    "tauri_processes": $(pgrep -f "tauri" | wc -l)
  },
  "project_structure": {
    "has_node_modules": $(test -d "${PROJECT_ROOT}/node_modules" && echo "true" || echo "false"),
    "has_src_directory": $(test -d "${PROJECT_ROOT}/src" && echo "true" || echo "false"),
    "has_tauri_config": $(test -f "${PROJECT_ROOT}/src-tauri/tauri.conf.json" && echo "true" || echo "false"),
    "has_vite_config": $(test -f "${PROJECT_ROOT}/vite.config.ts" && echo "true" || echo "false")
  }
}
EOF
    
    log_success "Health report generated: $HEALTH_REPORT"
}

# Diagnostic approfondi avec recommandations
deep_analysis_and_recommendations() {
    log_diagnostic "Performing deep analysis and generating recommendations..."
    
    echo -e "\n${WHITE}=== RECOMMENDATIONS ===${NC}" | tee -a "${DIAGNOSTIC_LOG}"
    
    # Recommandation 1: Performance
    if [[ $WARNINGS_FOUND -gt 5 ]]; then
        echo -e "${YELLOW}🎯 PERFORMANCE:${NC} Consider running 'pnpm run dev:clean' to improve startup performance" | tee -a "${DIAGNOSTIC_LOG}"
    fi
    
    # Recommandation 2: Maintenance
    local last_install
    if [[ -f "${PROJECT_ROOT}/node_modules/.package-lock.json" ]]; then
        last_install=$(stat -c %Y "${PROJECT_ROOT}/node_modules/.package-lock.json" 2>/dev/null || echo "0")
        local days_since_install=$(( ($(date +%s) - last_install) / 86400 ))
        
        if [[ $days_since_install -gt 7 ]]; then
            echo -e "${YELLOW}🔄 MAINTENANCE:${NC} Dependencies haven't been updated in $days_since_install days. Consider running 'pnpm install'" | tee -a "${DIAGNOSTIC_LOG}"
        fi
    fi
    
    # Recommandation 3: Sécurité
    if command -v pnpm &> /dev/null; then
        local audit_output
        if audit_output=$(pnpm audit --json 2>/dev/null); then
            local vulnerabilities
            vulnerabilities=$(echo "$audit_output" | jq -r '.metadata.vulnerabilities.total // 0' 2>/dev/null || echo "0")
            
            if [[ $vulnerabilities -gt 0 ]]; then
                echo -e "${RED}🛡️  SECURITY:${NC} Found $vulnerabilities vulnerabilities. Run 'pnpm audit --fix'" | tee -a "${DIAGNOSTIC_LOG}"
            fi
        fi
    fi
    
    # Recommandation 4: Optimisation
    echo -e "${CYAN}⚡ OPTIMIZATION:${NC} Use 'pnpm run boot:test' for quick health checks" | tee -a "${DIAGNOSTIC_LOG}"
    echo -e "${CYAN}⚡ OPTIMIZATION:${NC} Use './scripts/dev-clean.sh --full' for deep system cleanup" | tee -a "${DIAGNOSTIC_LOG}"
    
    echo -e "${WHITE}========================${NC}\n" | tee -a "${DIAGNOSTIC_LOG}"
}

# Fonction principale d'exécution
main() {
    echo -e "${WHITE}"
    echo "╔════════════════════════════════════════╗"
    echo "║    TITANE∞ Advanced Diagnostic Tool    ║"
    echo "║           v26.3.0 - Deep Scan          ║"
    echo "╚════════════════════════════════════════╝"
    echo -e "${NC}"
    
    # Initialisation
    init_logs
    cd "${PROJECT_ROOT}"
    
    # Suite complète de diagnostics
    log_info "Starting comprehensive system diagnostic..."
    
    check_critical_dependencies
    check_module_integrity
    check_configuration_files
    check_system_resources
    check_network_connectivity
    analyze_error_logs
    
    # Système de récupération automatique
    auto_recovery_system
    
    # Analyse approfondie
    deep_analysis_and_recommendations
    
    # Génération du rapport
    generate_health_report
    
    # Résumé final
    echo -e "\n${WHITE}=== DIAGNOSTIC SUMMARY ===${NC}"
    echo -e "🔍 Issues Detected: ${RED}$ISSUES_DETECTED${NC}"
    echo -e "🚨 Critical Issues: ${RED}$CRITICAL_ISSUES${NC}"  
    echo -e "⚠️  Warnings: ${YELLOW}$WARNINGS_FOUND${NC}"
    echo -e "🔧 Issues Resolved: ${GREEN}$ISSUES_RESOLVED${NC}"
    echo -e "📊 Health Report: ${BLUE}$HEALTH_REPORT${NC}"
    echo -e "📝 Diagnostic Log: ${BLUE}$DIAGNOSTIC_LOG${NC}"
    
    # Code de sortie basé sur les problèmes critiques
    if [[ $CRITICAL_ISSUES -gt 0 ]]; then
        echo -e "\n${RED}❌ CRITICAL ISSUES FOUND - System needs attention${NC}"
        exit 2
    elif [[ $ISSUES_DETECTED -gt 0 ]]; then
        echo -e "\n${YELLOW}⚠️  ISSUES DETECTED - See diagnostic log for details${NC}"
        exit 1
    else
        echo -e "\n${GREEN}✅ SYSTEM HEALTHY - All diagnostics passed${NC}"
        exit 0
    fi
}

# Gestion des signaux pour cleanup propre
trap 'echo -e "\n${YELLOW}Diagnostic interrupted${NC}"; exit 130' INT TERM

# Exécution avec gestion d'erreurs
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi