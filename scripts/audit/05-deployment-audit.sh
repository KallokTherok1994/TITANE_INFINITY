#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════════
# TITANE∞ Deployment & AppImage Audit — Comprehensive Verification
# Duration: 5-10 minutes
# Output: reports/deployment-audit-YYYYMMDD-HHMMSS/
# ═══════════════════════════════════════════════════════════════════════════════
#
# This script performs a complete audit of all deployment methods:
# 1. Build configuration validation
# 2. AppImage packaging verification
# 3. Runtime configurations (dev/stable)
# 4. CI/CD pipeline validation
# 5. Installer scripts validation
# 6. Tauri configuration consistency
#
# ═══════════════════════════════════════════════════════════════════════════════

set -e

# ─────────────────────────────────────────────────────────────────────────────
# COLORS & FORMATTING
# ─────────────────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURATION
# ─────────────────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
REPORT_DIR="$PROJECT_ROOT/reports/deployment-audit-$TIMESTAMP"

cd "$PROJECT_ROOT"
mkdir -p "$REPORT_DIR"

# Counters
ERRORS=0
WARNINGS=0
PASSED=0

# ─────────────────────────────────────────────────────────────────────────────
# HELPER FUNCTIONS
# ─────────────────────────────────────────────────────────────────────────────
log_header() {
    echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BOLD}${CYAN}   $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}\n"
}

log_section() {
    echo -e "${MAGENTA}━━━ $1 ━━━${NC}"
}

log_success() {
    echo -e "${GREEN}✓ $1${NC}"
    ((PASSED++))
}

log_error() {
    echo -e "${RED}✗ $1${NC}"
    ((ERRORS++))
}

log_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
    ((WARNINGS++))
}

log_info() {
    echo -e "${CYAN}ℹ $1${NC}"
}

# Extract version from Cargo.toml
extract_cargo_version() {
    local cargo_file="$1"
    grep '^version' "$cargo_file" | head -1 | cut -d'"' -f2 || echo "unknown"
}

check_file_exists() {
    local file="$1"
    local description="$2"
    if [ -f "$file" ]; then
        log_success "$description exists: $file"
        return 0
    else
        log_error "$description missing: $file"
        return 1
    fi
}

check_dir_exists() {
    local dir="$1"
    local description="$2"
    if [ -d "$dir" ]; then
        log_success "$description exists: $dir"
        return 0
    else
        log_error "$description missing: $dir"
        return 1
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
# PRINT BANNER
# ─────────────────────────────────────────────────────────────────────────────
print_banner() {
    echo -e "${BLUE}"
    cat << "EOF"
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║  ████████╗██╗████████╗ █████╗ ███╗   ██╗███████╗ ∞           ║
║  ╚══██╔══╝██║╚══██╔══╝██╔══██╗████╗  ██║██╔════╝              ║
║     ██║   ██║   ██║   ███████║██╔██╗ ██║█████╗                ║
║     ██║   ██║   ██║   ██╔══██║██║╚██╗██║██╔══╝                ║
║     ██║   ██║   ██║   ██║  ██║██║ ╚████║███████╗              ║
║     ╚═╝   ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝              ║
║                                                                ║
║       DEPLOYMENT & APPIMAGE AUDIT v26.2.0                     ║
║       Comprehensive Verification Suite                         ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    echo -e "${CYAN}Report directory: $REPORT_DIR${NC}\n"
}

# ─────────────────────────────────────────────────────────────────────────────
# 1. BUILD CONFIGURATION VALIDATION
# ─────────────────────────────────────────────────────────────────────────────
audit_build_config() {
    log_header "[1/8] Build Configuration Validation"
    
    local report_file="$REPORT_DIR/01-build-config.txt"
    {
        echo "═══ BUILD CONFIGURATION AUDIT ═══"
        echo "Timestamp: $(date)"
        echo ""
    } > "$report_file"
    
    # Check package.json
    log_section "Package.json validation"
    if check_file_exists "package.json" "package.json"; then
        local pkg_version=$(jq -r '.version' package.json)
        local pkg_name=$(jq -r '.name' package.json)
        log_info "Package name: $pkg_name"
        log_info "Package version: $pkg_version"
        
        # Check build scripts
        if jq -e '.scripts.build' package.json > /dev/null 2>&1; then
            log_success "Build script defined"
        else
            log_error "Build script missing in package.json"
        fi
        
        if jq -e '.scripts["build:production"]' package.json > /dev/null 2>&1; then
            log_success "Production build script defined"
        else
            log_warning "Production build script recommended"
        fi
        
        echo "Package version: $pkg_version" >> "$report_file"
    fi
    
    # Check Cargo.toml
    log_section "Cargo.toml validation"
    if check_file_exists "src-tauri/Cargo.toml" "Cargo.toml"; then
        local cargo_version=$(extract_cargo_version "src-tauri/Cargo.toml")
        log_info "Cargo version: $cargo_version"
        
        # Check release profile
        if grep -q '\[profile.release\]' src-tauri/Cargo.toml; then
            log_success "Release profile configured"
            
            # Check optimizations
            if grep -q 'opt-level = 3' src-tauri/Cargo.toml; then
                log_success "Maximum optimizations enabled (opt-level = 3)"
            fi
            
            if grep -q 'lto' src-tauri/Cargo.toml; then
                log_success "LTO (Link Time Optimization) configured"
            else
                log_warning "Consider enabling LTO for smaller binaries"
            fi
        else
            log_warning "Release profile not explicitly configured"
        fi
        
        echo "Cargo version: $cargo_version" >> "$report_file"
    fi
    
    echo "" >> "$report_file"
}

# ─────────────────────────────────────────────────────────────────────────────
# 2. TAURI CONFIGURATION AUDIT
# ─────────────────────────────────────────────────────────────────────────────
audit_tauri_config() {
    log_header "[2/8] Tauri Configuration Audit"
    
    local report_file="$REPORT_DIR/02-tauri-config.txt"
    {
        echo "═══ TAURI CONFIGURATION AUDIT ═══"
        echo "Timestamp: $(date)"
        echo ""
    } > "$report_file"
    
    log_section "Main tauri.conf.json"
    if check_file_exists "src-tauri/tauri.conf.json" "Main Tauri config"; then
        local tauri_version=$(jq -r '.version' src-tauri/tauri.conf.json)
        local product_name=$(jq -r '.productName' src-tauri/tauri.conf.json)
        local identifier=$(jq -r '.identifier' src-tauri/tauri.conf.json)
        
        log_info "Product name: $product_name"
        log_info "Version: $tauri_version"
        log_info "Identifier: $identifier"
        
        # Check bundle configuration
        log_section "Bundle configuration"
        if jq -e '.bundle.active' src-tauri/tauri.conf.json | grep -q 'true'; then
            log_success "Bundle is active"
        else
            log_warning "Bundle is not active"
        fi
        
        local bundle_targets=$(jq -r '.bundle.targets' src-tauri/tauri.conf.json)
        log_info "Bundle targets: $bundle_targets"
        
        # Check CSP
        log_section "Security (CSP)"
        if jq -e '.app.security.csp' src-tauri/tauri.conf.json > /dev/null 2>&1; then
            log_success "CSP configured"
        else
            log_warning "CSP not explicitly configured"
        fi
        
        {
            echo "Product: $product_name"
            echo "Version: $tauri_version"
            echo "Identifier: $identifier"
            echo "Bundle targets: $bundle_targets"
        } >> "$report_file"
    fi
    
    # Check base config
    log_section "Base configuration"
    if [ -f "tauri.base.json" ] || [ -f "src-tauri/tauri.base.json" ]; then
        log_success "Base Tauri config exists"
    else
        log_info "No base Tauri config (optional)"
    fi
    
    echo "" >> "$report_file"
}

# ─────────────────────────────────────────────────────────────────────────────
# 3. RUNTIME CONFIGURATIONS AUDIT
# ─────────────────────────────────────────────────────────────────────────────
audit_runtime_configs() {
    log_header "[3/8] Runtime Configurations Audit"
    
    local report_file="$REPORT_DIR/03-runtime-configs.txt"
    {
        echo "═══ RUNTIME CONFIGURATIONS AUDIT ═══"
        echo "Timestamp: $(date)"
        echo ""
    } > "$report_file"
    
    # Dev runtime
    log_section "Development runtime (runtime/dev)"
    if check_dir_exists "runtime/dev" "Dev runtime directory"; then
        if check_file_exists "runtime/dev/tauri.conf.json" "Dev Tauri config"; then
            local dev_version=$(jq -r '.version' runtime/dev/tauri.conf.json)
            local dev_product=$(jq -r '.productName' runtime/dev/tauri.conf.json)
            log_info "Dev product: $dev_product"
            log_info "Dev version: $dev_version"
            
            # Check dev-specific settings
            if jq -e '.app.windows[0].devtools' runtime/dev/tauri.conf.json | grep -q 'true'; then
                log_success "DevTools enabled in dev runtime"
            fi
            
            echo "Dev product: $dev_product v$dev_version" >> "$report_file"
        fi
        
        if check_file_exists "runtime/dev/run-dev.sh" "Dev run script"; then
            if [ -x "runtime/dev/run-dev.sh" ]; then
                log_success "Dev run script is executable"
            else
                log_warning "Dev run script is not executable"
            fi
        fi
    fi
    
    # Stable runtime
    log_section "Stable runtime (runtime/stable)"
    if check_dir_exists "runtime/stable" "Stable runtime directory"; then
        if check_file_exists "runtime/stable/tauri.conf.json" "Stable Tauri config"; then
            local stable_version=$(jq -r '.version' runtime/stable/tauri.conf.json)
            local stable_product=$(jq -r '.productName' runtime/stable/tauri.conf.json)
            log_info "Stable product: $stable_product"
            log_info "Stable version: $stable_version"
            
            # Verify no -dev suffix in stable
            if [[ "$stable_version" == *"-dev"* ]]; then
                log_error "Stable version should NOT contain -dev suffix"
            else
                log_success "Stable version correctly formatted"
            fi
            
            echo "Stable product: $stable_product v$stable_version" >> "$report_file"
        fi
        
        if check_file_exists "runtime/stable/build.sh" "Stable build script"; then
            if [ -x "runtime/stable/build.sh" ]; then
                log_success "Stable build script is executable"
            else
                log_warning "Stable build script is not executable"
            fi
        fi
    fi
    
    # Version consistency check
    log_section "Version consistency"
    local main_version=$(jq -r '.version' src-tauri/tauri.conf.json 2>/dev/null || echo "unknown")
    local pkg_version=$(jq -r '.version' package.json 2>/dev/null || echo "unknown")
    local cargo_version=$(extract_cargo_version "src-tauri/Cargo.toml")
    
    log_info "Main tauri.conf.json: $main_version"
    log_info "package.json: $pkg_version"
    log_info "Cargo.toml: $cargo_version"
    
    if [ "$main_version" = "$pkg_version" ] && [ "$main_version" = "$cargo_version" ]; then
        log_success "All versions are consistent: $main_version"
    else
        log_warning "Version mismatch detected"
    fi
    
    echo "" >> "$report_file"
}

# ─────────────────────────────────────────────────────────────────────────────
# 4. APPIMAGE PACKAGING VERIFICATION
# ─────────────────────────────────────────────────────────────────────────────
audit_appimage() {
    log_header "[4/8] AppImage Packaging Verification"
    
    local report_file="$REPORT_DIR/04-appimage.txt"
    {
        echo "═══ APPIMAGE PACKAGING AUDIT ═══"
        echo "Timestamp: $(date)"
        echo ""
    } > "$report_file"
    
    log_section "AppImage configuration"
    
    # Check bundle targets include appimage
    local bundle_targets=$(jq -r '.bundle.targets' src-tauri/tauri.conf.json 2>/dev/null || echo "[]")
    if echo "$bundle_targets" | grep -q "appimage"; then
        log_success "AppImage is in bundle targets"
    elif [ "$bundle_targets" = '"all"' ] || [ "$bundle_targets" = 'all' ]; then
        log_success "All bundle targets enabled (includes AppImage)"
    else
        log_warning "AppImage may not be included in bundle targets"
    fi
    
    # Check stable runtime targets
    if [ -f "runtime/stable/tauri.conf.json" ]; then
        local stable_targets=$(jq -r '.bundle.targets' runtime/stable/tauri.conf.json 2>/dev/null || echo "[]")
        if echo "$stable_targets" | grep -q "appimage"; then
            log_success "AppImage in stable runtime targets"
        fi
        echo "Stable bundle targets: $stable_targets" >> "$report_file"
    fi
    
    # Check for existing AppImage builds
    log_section "Existing AppImage builds"
    local appimage_count=0
    
    if [ -d "src-tauri/target/release/bundle/appimage" ]; then
        appimage_count=$(find src-tauri/target/release/bundle/appimage -name "*.AppImage" 2>/dev/null | wc -l)
        if [ "$appimage_count" -gt 0 ]; then
            log_success "Found $appimage_count AppImage(s) in build directory"
            find src-tauri/target/release/bundle/appimage -name "*.AppImage" -exec ls -lh {} \; | while read line; do
                log_info "  $line"
            done
        fi
    fi
    
    if [ -d "runtime/stable" ]; then
        local runtime_appimage_count=$(find runtime/stable -name "*.AppImage" 2>/dev/null | wc -l)
        if [ "$runtime_appimage_count" -gt 0 ]; then
            log_success "Found $runtime_appimage_count AppImage(s) in runtime/stable"
            find runtime/stable -name "*.AppImage" -exec ls -lh {} \; | while read line; do
                log_info "  $line"
            done
        fi
    fi
    
    if [ "$appimage_count" -eq 0 ]; then
        log_info "No AppImage builds found (run build first)"
    fi
    
    # Check icons for AppImage
    log_section "Icons for bundling"
    if check_dir_exists "src-tauri/icons" "Icons directory"; then
        local icon_files=(
            "src-tauri/icons/32x32.png"
            "src-tauri/icons/128x128.png"
            "src-tauri/icons/icon.png"
        )
        for icon in "${icon_files[@]}"; do
            if [ -f "$icon" ]; then
                local size=$(ls -lh "$icon" | awk '{print $5}')
                log_success "Icon: $(basename $icon) ($size)"
            fi
        done
    fi
    
    echo "AppImage count in build: $appimage_count" >> "$report_file"
    echo "" >> "$report_file"
}

# ─────────────────────────────────────────────────────────────────────────────
# 5. CI/CD PIPELINE VALIDATION
# ─────────────────────────────────────────────────────────────────────────────
audit_cicd() {
    log_header "[5/8] CI/CD Pipeline Validation"
    
    local report_file="$REPORT_DIR/05-cicd.txt"
    {
        echo "═══ CI/CD PIPELINE AUDIT ═══"
        echo "Timestamp: $(date)"
        echo ""
    } > "$report_file"
    
    log_section "GitHub Actions workflows"
    if check_dir_exists ".github/workflows" "Workflows directory"; then
        local workflow_count=$(ls -1 .github/workflows/*.yml 2>/dev/null | wc -l)
        log_info "Found $workflow_count workflow file(s)"
        
        # Check specific workflows
        local required_workflows=(
            ".github/workflows/ci.yml:CI workflow"
            ".github/workflows/release.yml:Release workflow"
            ".github/workflows/ci-cd.yml:CI/CD workflow"
        )
        
        for workflow_entry in "${required_workflows[@]}"; do
            IFS=':' read -r workflow_file workflow_name <<< "$workflow_entry"
            if [ -f "$workflow_file" ]; then
                log_success "$workflow_name exists"
                
                # Check for Linux build job
                if grep -q "ubuntu" "$workflow_file"; then
                    log_success "  └─ Linux build configured"
                fi
                
                # Check for AppImage in release
                if grep -q -i "appimage" "$workflow_file"; then
                    log_success "  └─ AppImage mentioned in workflow"
                fi
            else
                log_warning "$workflow_name not found"
            fi
        done
        
        echo "Workflow count: $workflow_count" >> "$report_file"
    fi
    
    # Check for required secrets documentation
    log_section "Secrets documentation"
    if grep -r "TAURI_SIGNING_PRIVATE_KEY" .github/workflows/*.yml > /dev/null 2>&1; then
        log_success "Tauri signing key referenced in workflows"
        log_info "Ensure TAURI_SIGNING_PRIVATE_KEY secret is configured in GitHub"
    fi
    
    echo "" >> "$report_file"
}

# ─────────────────────────────────────────────────────────────────────────────
# 6. INSTALLER SCRIPTS VALIDATION
# ─────────────────────────────────────────────────────────────────────────────
audit_installers() {
    log_header "[6/8] Installer Scripts Validation"
    
    local report_file="$REPORT_DIR/06-installers.txt"
    {
        echo "═══ INSTALLER SCRIPTS AUDIT ═══"
        echo "Timestamp: $(date)"
        echo ""
    } > "$report_file"
    
    log_section "Installer directory"
    if check_dir_exists "installer" "Installer directory"; then
        local installer_scripts=(
            "installer/install.sh"
            "installer/uninstall.sh"
            "installer/update.sh"
            "installer/self_heal.sh"
        )
        
        for script in "${installer_scripts[@]}"; do
            if [ -f "$script" ]; then
                log_success "$(basename $script) exists"
                
                # Check if executable
                if [ -x "$script" ]; then
                    log_success "  └─ Is executable"
                else
                    log_warning "  └─ Not executable (chmod +x needed)"
                fi
                
                # Basic syntax check
                if bash -n "$script" 2>/dev/null; then
                    log_success "  └─ Syntax valid"
                else
                    log_error "  └─ Syntax errors detected"
                fi
            else
                log_warning "$(basename $script) not found"
            fi
        done
        
        # Check dependency checker
        if check_file_exists "installer/checks/check_dependencies.sh" "Dependency checker"; then
            if [ -x "installer/checks/check_dependencies.sh" ]; then
                log_success "  └─ Dependency checker is executable"
            fi
        fi
    fi
    
    echo "" >> "$report_file"
}

# ─────────────────────────────────────────────────────────────────────────────
# 7. DEPLOYMENT SCRIPTS VALIDATION
# ─────────────────────────────────────────────────────────────────────────────
audit_deployment_scripts() {
    log_header "[7/8] Deployment Scripts Validation"
    
    local report_file="$REPORT_DIR/07-deployment-scripts.txt"
    {
        echo "═══ DEPLOYMENT SCRIPTS AUDIT ═══"
        echo "Timestamp: $(date)"
        echo ""
    } > "$report_file"
    
    log_section "Main deployment scripts"
    local deployment_scripts=(
        "titane.sh:Main unified deployment command"
        "scripts/build_titane.sh:Build script"
        "scripts/deploy-production.sh:Production deployment"
        "runtime/stable/build.sh:Stable build"
        "deployment/deploy-to-server.sh:Server deployment"
    )
    
    for script_entry in "${deployment_scripts[@]}"; do
        IFS=':' read -r script_file script_name <<< "$script_entry"
        
        if [ -f "$script_file" ]; then
            log_success "$script_name"
            log_info "  └─ $script_file"
            
            if [ -x "$script_file" ]; then
                log_success "  └─ Executable ✓"
            else
                log_warning "  └─ Not executable"
            fi
            
            # Syntax check
            if bash -n "$script_file" 2>/dev/null; then
                log_success "  └─ Syntax valid ✓"
            else
                log_error "  └─ Syntax errors"
            fi
        else
            log_warning "$script_name not found"
        fi
    done
    
    # Check titane.sh commands
    log_section "titane.sh commands verification"
    if [ -f "titane.sh" ]; then
        local commands=("clean" "repair" "fix" "build" "deploy" "full" "health")
        for cmd in "${commands[@]}"; do
            # Check for both quoted and unquoted command formats in case statement
            if grep -qE "^\s*${cmd}\)" titane.sh || grep -qE "^\s*\"${cmd}\"\)" titane.sh; then
                log_success "Command '$cmd' implemented"
            else
                log_warning "Command '$cmd' not found"
            fi
        done
    fi
    
    echo "" >> "$report_file"
}

# ─────────────────────────────────────────────────────────────────────────────
# 8. DESKTOP ENTRY & INTEGRATION
# ─────────────────────────────────────────────────────────────────────────────
audit_desktop_integration() {
    log_header "[8/8] Desktop Integration"
    
    local report_file="$REPORT_DIR/08-desktop-integration.txt"
    {
        echo "═══ DESKTOP INTEGRATION AUDIT ═══"
        echo "Timestamp: $(date)"
        echo ""
    } > "$report_file"
    
    log_section "Desktop entry files"
    local desktop_files=(
        "titane-infinity.desktop"
        "scripts/titane-infinity.desktop"
    )
    
    for desktop_file in "${desktop_files[@]}"; do
        if [ -f "$desktop_file" ]; then
            log_success "Desktop entry: $desktop_file"
            
            # Validate desktop entry
            if grep -q "^\[Desktop Entry\]" "$desktop_file"; then
                log_success "  └─ Valid desktop entry format"
            fi
            
            if grep -q "^Exec=" "$desktop_file"; then
                log_success "  └─ Exec command defined"
            fi
            
            if grep -q "^Icon=" "$desktop_file"; then
                log_success "  └─ Icon path defined"
            fi
        fi
    done
    
    # Check update-desktop-icon.sh
    if check_file_exists "scripts/update-desktop-icon.sh" "Desktop icon updater"; then
        if [ -x "scripts/update-desktop-icon.sh" ]; then
            log_success "  └─ Is executable"
        fi
    fi
    
    echo "" >> "$report_file"
}

# ─────────────────────────────────────────────────────────────────────────────
# GENERATE SUMMARY REPORT
# ─────────────────────────────────────────────────────────────────────────────
generate_summary() {
    log_header "AUDIT SUMMARY"
    
    local summary_file="$REPORT_DIR/SUMMARY.md"
    
    local total=$((PASSED + WARNINGS + ERRORS))
    local score=0
    if [ "$total" -gt 0 ]; then
        score=$(( (PASSED * 100) / total ))
    fi
    
    # Determine grade
    local grade="F"
    local grade_color="$RED"
    if [ "$score" -ge 95 ]; then
        grade="A+"
        grade_color="$GREEN"
    elif [ "$score" -ge 90 ]; then
        grade="A"
        grade_color="$GREEN"
    elif [ "$score" -ge 85 ]; then
        grade="B+"
        grade_color="$BLUE"
    elif [ "$score" -ge 80 ]; then
        grade="B"
        grade_color="$BLUE"
    elif [ "$score" -ge 70 ]; then
        grade="C"
        grade_color="$YELLOW"
    elif [ "$score" -ge 60 ]; then
        grade="D"
        grade_color="$YELLOW"
    fi
    
    # Console output
    echo -e "${BOLD}Results:${NC}"
    echo -e "  ${GREEN}✓ Passed:   $PASSED${NC}"
    echo -e "  ${YELLOW}⚠ Warnings: $WARNINGS${NC}"
    echo -e "  ${RED}✗ Errors:   $ERRORS${NC}"
    echo ""
    echo -e "  ${BOLD}Score: ${grade_color}$score/100 ($grade)${NC}"
    echo ""
    echo -e "  ${CYAN}Full report: $REPORT_DIR/${NC}"
    
    # Generate markdown summary
    cat > "$summary_file" << EOF
# TITANE∞ Deployment & AppImage Audit Report

**Generated:** $(date)  
**Score:** $score/100 ($grade)

## Summary

| Category | Count |
|----------|-------|
| ✓ Passed | $PASSED |
| ⚠ Warnings | $WARNINGS |
| ✗ Errors | $ERRORS |

## Audit Categories

1. **Build Configuration** - package.json, Cargo.toml optimization
2. **Tauri Configuration** - Main config, bundle settings, CSP
3. **Runtime Configurations** - Dev/Stable runtime configs
4. **AppImage Packaging** - Bundle targets, existing builds, icons
5. **CI/CD Pipelines** - GitHub Actions workflows
6. **Installer Scripts** - install.sh, uninstall.sh, update.sh
7. **Deployment Scripts** - titane.sh, build scripts
8. **Desktop Integration** - .desktop files, icons

## Recommendations

EOF

    if [ "$ERRORS" -gt 0 ]; then
        echo "### Critical Issues (Fix Required)" >> "$summary_file"
        echo "" >> "$summary_file"
        echo "- Review error messages in detailed reports" >> "$summary_file"
        echo "" >> "$summary_file"
    fi
    
    if [ "$WARNINGS" -gt 0 ]; then
        echo "### Warnings (Review Recommended)" >> "$summary_file"
        echo "" >> "$summary_file"
        echo "- Review warning messages for potential improvements" >> "$summary_file"
        echo "" >> "$summary_file"
    fi
    
    echo "## Files Generated" >> "$summary_file"
    echo "" >> "$summary_file"
    for f in "$REPORT_DIR"/*.txt; do
        if [ -f "$f" ]; then
            echo "- \`$(basename "$f")\`" >> "$summary_file"
        fi
    done
    
    echo "" >> "$summary_file"
    echo "---" >> "$summary_file"
    echo "_TITANE∞ Deployment Audit v26.2.0_" >> "$summary_file"
}

# ─────────────────────────────────────────────────────────────────────────────
# MAIN EXECUTION
# ─────────────────────────────────────────────────────────────────────────────
main() {
    print_banner
    
    audit_build_config
    audit_tauri_config
    audit_runtime_configs
    audit_appimage
    audit_cicd
    audit_installers
    audit_deployment_scripts
    audit_desktop_integration
    
    generate_summary
    
    # Exit with appropriate code
    if [ "$ERRORS" -gt 0 ]; then
        exit 1
    else
        exit 0
    fi
}

main "$@"
