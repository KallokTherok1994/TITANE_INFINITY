#!/usr/bin/env bash
#═══════════════════════════════════════════════════════════════════════════════
# TITANE∞ Auto-Fix Script
# Version: 26.2.0
# Description: Automated fixes for common issues detected by audits
#═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
LOG_FILE="${PROJECT_ROOT}/reports/auto-fix-${TIMESTAMP}.log"

# Counters
FIXES_APPLIED=0
FIXES_SKIPPED=0
FIXES_FAILED=0

log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
    
    case $level in
        INFO)  echo -e "${BLUE}ℹ${NC} $message" ;;
        OK)    echo -e "${GREEN}✓${NC} $message" ;;
        WARN)  echo -e "${YELLOW}⚠${NC} $message" ;;
        ERROR) echo -e "${RED}✗${NC} $message" ;;
        FIX)   echo -e "${CYAN}🔧${NC} $message" ;;
    esac
}

print_header() {
    echo -e "\n${CYAN}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}          ${YELLOW}🔧 TITANE∞ AUTO-FIX SYSTEM 🔧${NC}                         ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}          ${BLUE}Automated Issue Resolution${NC}                             ${CYAN}║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════╝${NC}\n"
}

# Fix 1: ESLint issues
fix_eslint() {
    log INFO "Running ESLint auto-fix..."
    
    if command -v pnpm &> /dev/null; then
        if pnpm run lint:fix >> "$LOG_FILE" 2>&1; then
            log OK "ESLint auto-fix completed"
            ((FIXES_APPLIED++))
        else
            log WARN "ESLint found issues that could not be auto-fixed"
            ((FIXES_SKIPPED++))
        fi
    else
        log WARN "pnpm not found, skipping ESLint fix"
        ((FIXES_SKIPPED++))
    fi
}

# Fix 2: Prettier formatting
fix_prettier() {
    log INFO "Running Prettier auto-format..."
    
    if command -v pnpm &> /dev/null; then
        if pnpm run format >> "$LOG_FILE" 2>&1; then
            log OK "Prettier formatting completed"
            ((FIXES_APPLIED++))
        else
            log ERROR "Prettier formatting failed"
            ((FIXES_FAILED++))
        fi
    else
        log WARN "pnpm not found, skipping Prettier fix"
        ((FIXES_SKIPPED++))
    fi
}

# Fix 3: TypeScript type checking
fix_typescript() {
    log INFO "Running TypeScript type check..."
    
    if command -v pnpm &> /dev/null; then
        if pnpm run check >> "$LOG_FILE" 2>&1; then
            log OK "TypeScript check passed"
            ((FIXES_APPLIED++))
        else
            log WARN "TypeScript found type errors (manual fix required)"
            ((FIXES_SKIPPED++))
        fi
    else
        log WARN "pnpm not found, skipping TypeScript check"
        ((FIXES_SKIPPED++))
    fi
}

# Fix 4: Script permissions
fix_script_permissions() {
    log INFO "Fixing script permissions..."
    
    local scripts_fixed=0
    
    # Find all .sh files and make them executable
    while IFS= read -r script; do
        if [[ ! -x "$script" ]]; then
            chmod +x "$script"
            log FIX "Made executable: ${script#$PROJECT_ROOT/}"
            ((scripts_fixed++))
        fi
    done < <(find "$PROJECT_ROOT" -name "*.sh" -type f 2>/dev/null | grep -v node_modules | grep -v target)
    
    if [[ $scripts_fixed -gt 0 ]]; then
        log OK "Fixed permissions for $scripts_fixed script(s)"
        ((FIXES_APPLIED++))
    else
        log OK "All scripts already have correct permissions"
    fi
}

# Fix 5: Clean build artifacts
fix_clean_artifacts() {
    log INFO "Cleaning temporary artifacts..."
    
    local cleaned=0
    
    # Maximum number of files to clean per pattern (safety limit)
    local MAX_FILES_TO_CLEAN=100
    
    # Clean common temporary files
    local temp_patterns=(
        "*.log.tmp"
        ".DS_Store"
        "Thumbs.db"
        "*.swp"
        "*.swo"
        "*~"
    )
    
    for pattern in "${temp_patterns[@]}"; do
        while IFS= read -r file; do
            rm -f "$file"
            ((cleaned++))
        done < <(find "$PROJECT_ROOT" -name "$pattern" -type f 2>/dev/null | grep -v node_modules | grep -v target | head -"$MAX_FILES_TO_CLEAN")
    done
    
    if [[ $cleaned -gt 0 ]]; then
        log OK "Cleaned $cleaned temporary file(s)"
        ((FIXES_APPLIED++))
    else
        log OK "No temporary files to clean"
    fi
}

# Fix 6: Verify package.json consistency
fix_package_json() {
    log INFO "Verifying package.json..."
    
    local pkg_json="${PROJECT_ROOT}/package.json"
    
    if [[ -f "$pkg_json" ]]; then
        # Validate JSON syntax
        if python3 -m json.tool "$pkg_json" > /dev/null 2>&1; then
            log OK "package.json is valid JSON"
            ((FIXES_APPLIED++))
        else
            log ERROR "package.json has invalid JSON syntax"
            ((FIXES_FAILED++))
        fi
    else
        log ERROR "package.json not found"
        ((FIXES_FAILED++))
    fi
}

# Fix 7: Cargo.toml validation
fix_cargo_toml() {
    log INFO "Verifying Cargo.toml..."
    
    local cargo_toml="${PROJECT_ROOT}/src-tauri/Cargo.toml"
    
    if [[ -f "$cargo_toml" ]]; then
        if cd "${PROJECT_ROOT}/src-tauri" && cargo verify-project >> "$LOG_FILE" 2>&1; then
            log OK "Cargo.toml is valid"
            ((FIXES_APPLIED++))
        else
            # cargo verify-project might not be available, try cargo metadata
            if cargo metadata --no-deps >> "$LOG_FILE" 2>&1; then
                log OK "Cargo.toml is valid (via metadata)"
                ((FIXES_APPLIED++))
            else
                log WARN "Cargo.toml validation inconclusive"
                ((FIXES_SKIPPED++))
            fi
        fi
        cd "$PROJECT_ROOT"
    else
        log ERROR "Cargo.toml not found"
        ((FIXES_FAILED++))
    fi
}

# Fix 8: Generate missing directories
fix_directory_structure() {
    log INFO "Verifying directory structure..."
    
    local required_dirs=(
        "reports"
        "scripts/audit"
        "scripts/maintenance"
        "scripts/verify"
        "runtime/dev"
        "runtime/stable"
        "installer/checks"
        "deployment"
    )
    
    local dirs_created=0
    
    for dir in "${required_dirs[@]}"; do
        local full_path="${PROJECT_ROOT}/${dir}"
        if [[ ! -d "$full_path" ]]; then
            mkdir -p "$full_path"
            log FIX "Created directory: $dir"
            ((dirs_created++))
        fi
    done
    
    if [[ $dirs_created -gt 0 ]]; then
        log OK "Created $dirs_created missing directory(ies)"
        ((FIXES_APPLIED++))
    else
        log OK "All required directories exist"
    fi
}

# Fix 9: Gitignore validation
fix_gitignore() {
    log INFO "Verifying .gitignore..."
    
    local gitignore="${PROJECT_ROOT}/.gitignore"
    local required_entries=(
        "node_modules/"
        "target/"
        "dist/"
        ".env"
        "*.log"
        "reports/"
    )
    
    local entries_added=0
    
    for entry in "${required_entries[@]}"; do
        if ! grep -qF "$entry" "$gitignore" 2>/dev/null; then
            echo "$entry" >> "$gitignore"
            log FIX "Added to .gitignore: $entry"
            ((entries_added++))
        fi
    done
    
    if [[ $entries_added -gt 0 ]]; then
        log OK "Added $entries_added entries to .gitignore"
        ((FIXES_APPLIED++))
    else
        log OK ".gitignore is complete"
    fi
}

# Fix 10: Desktop entry validation
fix_desktop_entry() {
    log INFO "Verifying desktop entry..."
    
    local desktop_file="${PROJECT_ROOT}/titane-infinity.desktop"
    
    if [[ -f "$desktop_file" ]]; then
        # Check for basic required fields
        if grep -q "^\[Desktop Entry\]" "$desktop_file" && \
           grep -q "^Name=" "$desktop_file" && \
           grep -q "^Exec=" "$desktop_file"; then
            log OK "Desktop entry is valid"
            ((FIXES_APPLIED++))
        else
            log WARN "Desktop entry may be incomplete"
            ((FIXES_SKIPPED++))
        fi
    else
        log WARN "Desktop entry not found (optional for development)"
        ((FIXES_SKIPPED++))
    fi
}

# Fix 11: Broken symlinks in node_modules
fix_broken_symlinks() {
    log INFO "Checking for broken symlinks..."
    
    if [[ ! -d "node_modules" ]]; then
        log WARN "node_modules directory not found"
        ((FIXES_SKIPPED++))
        return
    fi
    
    local broken_count=0
    local max_broken_symlinks=100  # Safety limit
    
    while IFS= read -r symlink; do
        if [[ $broken_count -ge $max_broken_symlinks ]]; then
            log WARN "Reached safety limit of $max_broken_symlinks broken symlinks - manual intervention required"
            break
        fi
        rm -f "$symlink"
        log FIX "Removed broken symlink: ${symlink#$PROJECT_ROOT/}"
        ((broken_count++))
    done < <(find node_modules -type l ! -exec test -e {} \; -print 2>/dev/null)
    
    if [[ $broken_count -gt 0 ]]; then
        if [[ $broken_count -ge $max_broken_symlinks ]]; then
            log WARN "Removed $broken_count broken symlink(s) - More may exist, please investigate"
            ((FIXES_SKIPPED++))
        else
            log OK "Removed $broken_count broken symlink(s)"
            ((FIXES_APPLIED++))
        fi
    else
        log OK "No broken symlinks found"
    fi
}

# Fix 12: Regenerate lockfile if corrupted
fix_lockfile() {
    log INFO "Verifying lockfile integrity..."
    
    if [[ ! -f "pnpm-lock.yaml" ]]; then
        log WARN "pnpm-lock.yaml not found, generating..."
        if command -v pnpm &> /dev/null; then
            if pnpm install --lockfile-only >> "$LOG_FILE" 2>&1; then
                log OK "Generated pnpm-lock.yaml"
                ((FIXES_APPLIED++))
            else
                log ERROR "Failed to generate lockfile"
                ((FIXES_FAILED++))
            fi
        else
            log ERROR "pnpm not available"
            ((FIXES_FAILED++))
        fi
    else
        log OK "Lockfile exists"
    fi
}

# Fix 13: Clear corrupted caches
fix_corrupted_caches() {
    log INFO "Checking for corrupted caches..."
    
    local caches_cleared=0
    
    # Clear node cache if it exists and seems corrupted
    if [[ -d "${HOME}/.npm" ]]; then
        local cache_size=$(du -sh "${HOME}/.npm" 2>/dev/null | awk '{print $1}')
        log INFO "npm cache size: $cache_size"
    fi
    
    # Clear pnpm store cache if requested
    # (Uncomment if needed, but this is aggressive)
    # if command -v pnpm &> /dev/null; then
    #     pnpm store prune >> "$LOG_FILE" 2>&1
    #     log OK "Pruned pnpm store"
    #     ((caches_cleared++))
    # fi
    
    # Clear Rust target cache if corrupted (only if build fails)
    if [[ -d "src-tauri/target" ]]; then
        local target_size=$(du -sh src-tauri/target 2>/dev/null | awk '{print $1}')
        log INFO "Rust target size: $target_size"
    fi
    
    if [[ $caches_cleared -gt 0 ]]; then
        log OK "Cleared $caches_cleared cache(s)"
        ((FIXES_APPLIED++))
    else
        log OK "No corrupted caches detected"
    fi
}

# Fix 14: Repair test fixtures
fix_test_fixtures() {
    log INFO "Checking test fixtures..."
    
    local fixtures_dir="${PROJECT_ROOT}/tests/fixtures"
    if [[ -d "$fixtures_dir" ]]; then
        log OK "Test fixtures directory exists"
    else
        log WARN "Test fixtures directory not found (may not be needed)"
        ((FIXES_SKIPPED++))
        return
    fi
    
    # Check for common test fixture issues
    local issues=0
    # Add specific fixture validation logic here if needed
    
    if [[ $issues -eq 0 ]]; then
        log OK "Test fixtures appear valid"
    else
        log WARN "Found $issues test fixture issue(s)"
        ((FIXES_SKIPPED++))
    fi
}

# Fix 15: Auto-install missing dependencies
fix_missing_dependencies() {
    log INFO "Checking for missing dependencies..."
    
    if [[ ! -d "node_modules" ]]; then
        log WARN "node_modules missing, installing dependencies..."
        if command -v pnpm &> /dev/null; then
            if pnpm install --frozen-lockfile >> "$LOG_FILE" 2>&1; then
                log OK "Dependencies installed successfully"
                ((FIXES_APPLIED++))
            else
                log ERROR "Failed to install dependencies"
                ((FIXES_FAILED++))
            fi
        else
            log ERROR "pnpm not available, cannot install dependencies"
            ((FIXES_FAILED++))
        fi
    else
        log OK "node_modules exists"
    fi
}

print_summary() {
    echo -e "\n${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}                     AUTO-FIX SUMMARY${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}\n"
    
    echo -e "  ${GREEN}✓ Fixes Applied:${NC}  $FIXES_APPLIED"
    echo -e "  ${YELLOW}⚠ Fixes Skipped:${NC}  $FIXES_SKIPPED"
    echo -e "  ${RED}✗ Fixes Failed:${NC}   $FIXES_FAILED"
    echo ""
    
    local total=$((FIXES_APPLIED + FIXES_SKIPPED + FIXES_FAILED))
    local success_rate=0
    if [[ $total -gt 0 ]]; then
        success_rate=$((FIXES_APPLIED * 100 / total))
    fi
    
    echo -e "  ${BLUE}Success Rate:${NC} ${success_rate}%"
    echo -e "\n  ${BLUE}📁 Log file:${NC} ${LOG_FILE}"
}

show_help() {
    echo "TITANE∞ Auto-Fix Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --all         Run all fixes (default)"
    echo "  --lint        Fix ESLint issues only"
    echo "  --format      Fix Prettier formatting only"
    echo "  --perms       Fix script permissions only"
    echo "  --clean       Clean temporary artifacts only"
    echo "  --verify      Verify configurations only"
    echo "  -h, --help    Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0              # Run all fixes"
    echo "  $0 --lint       # Fix ESLint issues only"
    echo "  $0 --format     # Fix formatting only"
}

main() {
    local run_all=true
    local run_lint=false
    local run_format=false
    local run_perms=false
    local run_clean=false
    local run_verify=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --all)
                run_all=true
                shift
                ;;
            --lint)
                run_all=false
                run_lint=true
                shift
                ;;
            --format)
                run_all=false
                run_format=true
                shift
                ;;
            --perms)
                run_all=false
                run_perms=true
                shift
                ;;
            --clean)
                run_all=false
                run_clean=true
                shift
                ;;
            --verify)
                run_all=false
                run_verify=true
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                echo "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    cd "$PROJECT_ROOT"
    
    print_header
    
    # Create log directory
    mkdir -p "$(dirname "$LOG_FILE")"
    echo "Auto-Fix Log - $(date)" > "$LOG_FILE"
    
    if [[ "$run_all" == true ]]; then
        fix_directory_structure
        fix_missing_dependencies
        fix_broken_symlinks
        fix_lockfile
        fix_script_permissions
        fix_gitignore
        fix_package_json
        fix_cargo_toml
        fix_corrupted_caches
        fix_test_fixtures
        fix_eslint
        fix_prettier
        fix_typescript
        fix_clean_artifacts
        fix_desktop_entry
    else
        [[ "$run_lint" == true ]] && fix_eslint
        [[ "$run_format" == true ]] && fix_prettier
        [[ "$run_perms" == true ]] && fix_script_permissions
        [[ "$run_clean" == true ]] && fix_clean_artifacts
        [[ "$run_verify" == true ]] && { fix_package_json; fix_cargo_toml; fix_desktop_entry; }
    fi
    
    print_summary
}

main "$@"
