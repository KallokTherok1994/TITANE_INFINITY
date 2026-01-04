#!/usr/bin/env bash
#═══════════════════════════════════════════════════════════════════════════════
# TITANE∞ Proactive Issue Detection & Monitoring
# Version: 26.2.0
# Description: Continuous monitoring for configuration drift and performance degradation
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
STATE_DIR="${HOME}/.titane/proactive-monitor"
LOG_FILE="${STATE_DIR}/monitor-$(date +%Y%m%d).log"
ALERT_FILE="${STATE_DIR}/alerts.log"

# Monitoring intervals (in seconds)
CHECK_INTERVAL=${CHECK_INTERVAL:-300}  # 5 minutes
PERFORMANCE_WINDOW=${PERFORMANCE_WINDOW:-3600}  # 1 hour
DRIFT_CHECK_INTERVAL=${DRIFT_CHECK_INTERVAL:-600}  # 10 minutes

# Thresholds
BUILD_TIME_THRESHOLD=180  # 3 minutes
TEST_TIME_THRESHOLD=300   # 5 minutes
BUILD_TIME_INCREASE_PERCENT=50  # Alert if build time increases by 50%

# Setup
mkdir -p "$STATE_DIR"
cd "$PROJECT_ROOT"

log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date -Iseconds)
    echo "[${timestamp}] [${level}] ${message}" >> "$LOG_FILE"
}

alert() {
    local severity=$1
    shift
    local message="$*"
    local timestamp=$(date -Iseconds)
    echo "[${timestamp}] [${severity}] ${message}" >> "$ALERT_FILE"
    echo -e "${RED}🚨 ALERT [${severity}]:${NC} ${message}"
}

info() {
    echo -e "${CYAN}ℹ️  $*${NC}"
    log "INFO" "$*"
}

success() {
    echo -e "${GREEN}✓ $*${NC}"
    log "SUCCESS" "$*"
}

warning() {
    echo -e "${YELLOW}⚠️  $*${NC}"
    log "WARNING" "$*"
}

#═══════════════════════════════════════════════════════════════════════════════
# Configuration Drift Detection
#═══════════════════════════════════════════════════════════════════════════════
detect_configuration_drift() {
    info "Checking for configuration drift..."
    
    local drift_detected=false
    local config_files=(
        "package.json"
        "src-tauri/Cargo.toml"
        "src-tauri/tauri.conf.json"
        "tsconfig.json"
        "vite.config.ts"
        "vitest.config.ts"
    )
    
    for config_file in "${config_files[@]}"; do
        if [[ ! -f "$config_file" ]]; then
            warning "Config file missing: $config_file"
            continue
        fi
        
        local hash_file="${STATE_DIR}/hash_${config_file//\//_}"
        local current_hash=""
        
        # Cross-platform hash command (prefer shasum for portability)
        if command -v shasum &> /dev/null; then
            current_hash=$(shasum -a 256 "$config_file" 2>/dev/null | awk '{print $1}')
        elif command -v sha256sum &> /dev/null; then
            current_hash=$(sha256sum "$config_file" 2>/dev/null | awk '{print $1}')
        elif command -v md5sum &> /dev/null; then
            current_hash=$(md5sum "$config_file" 2>/dev/null | awk '{print $1}')
        elif command -v md5 &> /dev/null; then
            current_hash=$(md5 -q "$config_file" 2>/dev/null)
        else
            warning "No hash command available, skipping drift detection for $config_file"
            continue
        fi
        
        if [[ -z "$current_hash" ]]; then
            warning "Failed to calculate hash for $config_file"
            continue
        fi
        
        if [[ -f "$hash_file" ]]; then
            local stored_hash=$(cat "$hash_file")
            if [[ "$current_hash" != "$stored_hash" ]]; then
                warning "Configuration drift detected: $config_file"
                alert "MEDIUM" "Configuration drift: $config_file"
                drift_detected=true
                
                # Show diff if git is available
                if command -v git &> /dev/null; then
                    local changes=$(git diff "$config_file" 2>/dev/null | head -20)
                    if [[ -n "$changes" ]]; then
                        echo "$changes" >> "${STATE_DIR}/drift-${config_file//\//_}.diff"
                    fi
                fi
            fi
        fi
        
        # Update stored hash
        echo "$current_hash" > "$hash_file"
    done
    
    if [[ "$drift_detected" == "false" ]]; then
        success "No configuration drift detected"
    fi
    
    return 0
}

#═══════════════════════════════════════════════════════════════════════════════
# Performance Degradation Detection
#═══════════════════════════════════════════════════════════════════════════════
detect_performance_degradation() {
    info "Checking for performance degradation..."
    
    local perf_file="${STATE_DIR}/performance-metrics.json"
    local degradation_detected=false
    
    # Measure current build time (dry run to avoid actual build)
    if (command -v corepack >/dev/null 2>&1 && corepack pnpm --version >/dev/null 2>&1) || command -v pnpm >/dev/null 2>&1; then
        info "Measuring build time baseline..."
        
        # Check if dist exists and is recent
        if [[ -d "dist" ]]; then
            local dist_age=$(($(date +%s) - $(stat -c %Y dist 2>/dev/null || echo 0)))
            
            if [[ $dist_age -lt $PERFORMANCE_WINDOW ]]; then
                # Get build time from logs if available
                local last_build_log=$(find . -name "build-*.log" -mmin -60 2>/dev/null | head -1)
                if [[ -n "$last_build_log" ]]; then
                    local build_time=$(grep -oP "Build completed in \K[0-9]+" "$last_build_log" || echo "0")
                    
                    if [[ $build_time -gt $BUILD_TIME_THRESHOLD ]]; then
                        warning "Build time exceeds threshold: ${build_time}s > ${BUILD_TIME_THRESHOLD}s"
                        alert "MEDIUM" "Build performance degradation: ${build_time}s"
                        degradation_detected=true
                    fi
                    
                    # Compare with historical average (with safety checks)
                    if [[ -f "$perf_file" ]]; then
                        local avg_build_time=$(jq -r '.build_time_avg // 0' "$perf_file" 2>/dev/null || echo "0")
                        # Ensure avg_build_time is a valid positive integer
                        if [[ "$avg_build_time" =~ ^[0-9]+$ ]] && [[ $avg_build_time -gt 0 ]] && [[ $build_time -gt 0 ]]; then
                            local increase=$(( (build_time - avg_build_time) * 100 / avg_build_time ))
                            if [[ $increase -gt $BUILD_TIME_INCREASE_PERCENT ]]; then
                                alert "HIGH" "Build time increased by ${increase}% (${avg_build_time}s -> ${build_time}s)"
                                degradation_detected=true
                            fi
                        fi
                    fi
                fi
            fi
        fi
    fi
    
    # Check test execution time
    local test_log="${STATE_DIR}/last-test-run.log"
    if [[ -f "$test_log" ]]; then
        local test_time=$(grep -oP "Duration.*\K[0-9.]+" "$test_log" | cut -d. -f1 || echo "0")
        if [[ $test_time -gt $TEST_TIME_THRESHOLD ]]; then
            warning "Test execution time exceeds threshold: ${test_time}s > ${TEST_TIME_THRESHOLD}s"
            alert "MEDIUM" "Test performance degradation: ${test_time}s"
            degradation_detected=true
        fi
    fi
    
    if [[ "$degradation_detected" == "false" ]]; then
        success "No performance degradation detected"
    fi
    
    return 0
}

#═══════════════════════════════════════════════════════════════════════════════
# Dependency Vulnerability Monitoring
#═══════════════════════════════════════════════════════════════════════════════
monitor_dependency_vulnerabilities() {
    info "Scanning for dependency vulnerabilities..."
    
    local vuln_found=false
    
    # pnpm audit (if available)
    if ((command -v corepack >/dev/null 2>&1 && corepack pnpm --version >/dev/null 2>&1) || command -v pnpm >/dev/null 2>&1) && [[ -f "package.json" ]]; then
        local audit_output=$(pnpm audit --json 2>/dev/null || echo '{}')
        local critical=$(echo "$audit_output" | jq -r '.metadata.vulnerabilities.critical // 0' 2>/dev/null || echo "0")
        local high=$(echo "$audit_output" | jq -r '.metadata.vulnerabilities.high // 0' 2>/dev/null || echo "0")
        
        if [[ $critical -gt 0 ]] || [[ $high -gt 0 ]]; then
            alert "CRITICAL" "pnpm audit found ${critical} critical and ${high} high vulnerabilities"
            vuln_found=true
            
            # Save detailed report
            echo "$audit_output" > "${STATE_DIR}/dependency-audit-$(date +%Y%m%d-%H%M%S).json"
        else
            success "pnpm audit: No critical/high vulnerabilities"
        fi
    fi
    
    # cargo audit (if available)
    if command -v cargo &> /dev/null && [[ -f "src-tauri/Cargo.toml" ]]; then
        cd src-tauri
        if command -v cargo-audit &> /dev/null; then
            local cargo_audit_output=$(cargo audit 2>&1 || true)
            if echo "$cargo_audit_output" | grep -q "error:"; then
                alert "CRITICAL" "cargo audit found vulnerabilities"
                echo "$cargo_audit_output" > "${STATE_DIR}/cargo-audit-$(date +%Y%m%d-%H%M%S).txt"
                vuln_found=true
            else
                success "cargo audit: No vulnerabilities"
            fi
        else
            info "cargo-audit not installed, skipping Rust vulnerability scan"
        fi
        cd "$PROJECT_ROOT"
    fi
    
    if [[ "$vuln_found" == "false" ]]; then
        success "No dependency vulnerabilities found"
    fi
    
    return 0
}

#═══════════════════════════════════════════════════════════════════════════════
# Disk Space Monitoring
#═══════════════════════════════════════════════════════════════════════════════
monitor_disk_space() {
    info "Checking disk space..."
    
    local disk_usage=$(df -h "$PROJECT_ROOT" | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [[ $disk_usage -gt 90 ]]; then
        alert "HIGH" "Disk space critical: ${disk_usage}% used"
    elif [[ $disk_usage -gt 80 ]]; then
        warning "Disk space high: ${disk_usage}% used"
    else
        success "Disk space OK: ${disk_usage}% used"
    fi
    
    # Check for large directories
    local large_dirs=$(du -sh node_modules target dist .git 2>/dev/null | sort -hr | head -5)
    log "INFO" "Large directories:\n$large_dirs"
}

#═══════════════════════════════════════════════════════════════════════════════
# Process Monitoring
#═══════════════════════════════════════════════════════════════════════════════
monitor_processes() {
    info "Checking for problematic processes..."
    
    # Check for zombie processes
    local zombie_count=$(ps aux | grep -c 'Z' || echo "0")
    if [[ $zombie_count -gt 5 ]]; then
        warning "Multiple zombie processes detected: $zombie_count"
    fi
    
    # Check for high CPU processes related to TITANE
    local high_cpu=$(ps aux | grep -E 'titane|node|rust' | awk '$3 > 80 {print $3, $11}' || true)
    if [[ -n "$high_cpu" ]]; then
        warning "High CPU usage detected:\n$high_cpu"
    fi
    
    # Check for memory leaks (processes using > 2GB)
    local high_mem=$(ps aux | grep -E 'titane|node|rust' | awk '$4 > 20 {print $4, $11}' || true)
    if [[ -n "$high_mem" ]]; then
        warning "High memory usage detected:\n$high_mem"
    fi
}

#═══════════════════════════════════════════════════════════════════════════════
# Git Repository Health
#═══════════════════════════════════════════════════════════════════════════════
check_git_health() {
    info "Checking git repository health..."
    
    if ! command -v git &> /dev/null; then
        warning "git not available, skipping repository health check"
        return 0
    fi
    
    # Check for uncommitted changes
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
        warning "Uncommitted changes detected"
    else
        success "No uncommitted changes"
    fi
    
    # Check repository size
    local repo_size=$(du -sh .git 2>/dev/null | awk '{print $1}')
    log "INFO" "Repository size: $repo_size"
    
    # Check for large files
    local large_files=$(find . -type f -size +10M ! -path "./.git/*" ! -path "./node_modules/*" ! -path "./target/*" 2>/dev/null || true)
    if [[ -n "$large_files" ]]; then
        warning "Large files found (>10MB):\n$large_files"
    fi
}

#═══════════════════════════════════════════════════════════════════════════════
# Generate Health Report
#═══════════════════════════════════════════════════════════════════════════════
generate_health_report() {
    local report_file="${STATE_DIR}/health-report-$(date +%Y%m%d-%H%M%S).json"
    
    cat > "$report_file" <<EOF
{
  "timestamp": "$(date -Iseconds)",
  "project_root": "$PROJECT_ROOT",
  "checks": {
    "configuration_drift": "completed",
    "performance": "completed",
    "vulnerabilities": "completed",
    "disk_space": "completed",
    "processes": "completed",
    "git_health": "completed"
  },
  "alerts": $(jq -Rs 'split("\n") | map(select(length > 0))' "$ALERT_FILE" 2>/dev/null || echo '[]'),
  "next_check": "$(date -d "+${CHECK_INTERVAL} seconds" -Iseconds)"
}
EOF
    
    info "Health report generated: $report_file"
}

#═══════════════════════════════════════════════════════════════════════════════
# Main Monitoring Loop
#═══════════════════════════════════════════════════════════════════════════════
print_header() {
    echo -e "\n${PURPLE}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${NC}     ${CYAN}🔍 TITANE∞ PROACTIVE MONITORING SYSTEM 🔍${NC}               ${PURPLE}║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════════╝${NC}\n"
    echo -e "${BLUE}📅 Started:${NC} $(date)"
    echo -e "${BLUE}📁 Project:${NC} ${PROJECT_ROOT}"
    echo -e "${BLUE}📝 Log:${NC}     ${LOG_FILE}"
    echo -e "${BLUE}🚨 Alerts:${NC}  ${ALERT_FILE}"
    echo ""
}

main() {
    print_header
    
    info "Starting proactive monitoring (interval: ${CHECK_INTERVAL}s)..."
    
    # Run all checks once
    detect_configuration_drift
    detect_performance_degradation
    monitor_dependency_vulnerabilities
    monitor_disk_space
    monitor_processes
    check_git_health
    generate_health_report
    
    echo ""
    success "Monitoring cycle complete"
    info "Next check in ${CHECK_INTERVAL} seconds"
    
    # For continuous monitoring, uncomment the loop below
    # while true; do
    #     sleep "$CHECK_INTERVAL"
    #     detect_configuration_drift
    #     detect_performance_degradation
    #     monitor_dependency_vulnerabilities
    #     monitor_disk_space
    #     monitor_processes
    #     check_git_health
    #     generate_health_report
    # done
}

main "$@"
