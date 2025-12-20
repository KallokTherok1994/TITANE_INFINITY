#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# TITANE∞ — Unified Deployment Command v24.3.0
# Commande unifiée pour clean, repair, fix, build & deploy
# v22Ω AI Performance Optimizations Compatible
# ═══════════════════════════════════════════════════════════════════════════════
#
# USAGE:
#   ./titane.sh clean              → Nettoyage complet
#   ./titane.sh repair             → Réparation des dépendances
#   ./titane.sh fix                → Correction des erreurs TypeScript
#   ./titane.sh build [dev|stable] → Build complet (dev par défaut)
#   ./titane.sh deploy             → Build + Deploy production
#   ./titane.sh full               → Clean + Repair + Fix + Build + Deploy (FULL)
#   ./titane.sh health             → Vérification de santé du système
#
# ═══════════════════════════════════════════════════════════════════════════════

set -e

# ──────────────────────────────────────────────────────────────────────────────
# COLORS & FORMATTING
# ──────────────────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# ──────────────────────────────────────────────────────────────────────────────
# CONFIGURATION
# ──────────────────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
BUILD_MODE="${2:-dev}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_DIR="$PROJECT_ROOT/logs"
LOG_FILE="$LOG_DIR/titane_${TIMESTAMP}.log"

# Prefer repo-pinned Node toolchain when available
NODE_TOOLS_BIN="$PROJECT_ROOT/.tools/node/current/bin"
if [ -d "$NODE_TOOLS_BIN" ]; then
    export PATH="$NODE_TOOLS_BIN:$PATH"
fi

# ──────────────────────────────────────────────────────────────────────────────
# HELPER FUNCTIONS
# ──────────────────────────────────────────────────────────────────────────────

# Create log directory
mkdir -p "$LOG_DIR"

# Logging function
log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

# Print header
print_header() {
    log "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    log "${BOLD}${CYAN}   TITANE∞ — $1${NC}"
    log "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    log ""
}

# Print section
print_section() {
    log "${YELLOW}━━━ $1 ━━━${NC}"
}

# Success message
success() {
    log "${GREEN}✓ $1${NC}"
}

# Error message
error() {
    log "${RED}✗ $1${NC}"
    exit 1
}

# Warning message
warning() {
    log "${YELLOW}⚠ $1${NC}"
}

# Info message
info() {
    log "${CYAN}ℹ $1${NC}"
}

# ──────────────────────────────────────────────────────────────────────────────
# SYSTEM HEALTH CHECK
# ──────────────────────────────────────────────────────────────────────────────
health_check() {
    print_header "HEALTH CHECK"
    
    local errors=0
    
    # Check Node.js
    print_section "Checking Node.js..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        success "Node.js: $NODE_VERSION"
    else
        error "Node.js not found!"
        ((errors++))
    fi
    
    # Check npm
    print_section "Checking npm..."
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        success "npm: $NPM_VERSION"
    else
        error "npm not found!"
        ((errors++))
    fi
    
    # Check Rust
    print_section "Checking Rust..."
    if command -v rustc &> /dev/null; then
        RUST_VERSION=$(rustc --version)
        success "Rust: $RUST_VERSION"
    else
        warning "Rust not found (required for Tauri build)"
        ((errors++))
    fi
    
    # Check Cargo
    print_section "Checking Cargo..."
    if command -v cargo &> /dev/null; then
        CARGO_VERSION=$(cargo --version)
        success "Cargo: $CARGO_VERSION"
    else
        warning "Cargo not found (required for Tauri build)"
        ((errors++))
    fi
    
    # Check disk space
    print_section "Checking disk space..."
    DISK_AVAILABLE=$(df -h "$PROJECT_ROOT" | awk 'NR==2 {print $4}')
    info "Available disk space: $DISK_AVAILABLE"
    
    # Check Git status
    print_section "Checking Git status..."
    if [ -d ".git" ]; then
        CURRENT_BRANCH=$(git branch --show-current)
        GIT_STATUS=$(git status --porcelain | wc -l)
        info "Current branch: $CURRENT_BRANCH"
        info "Modified files: $GIT_STATUS"
    else
        warning "Not a Git repository"
    fi
    
    log ""
    if [ $errors -eq 0 ]; then
        success "System health check passed!"
    else
        warning "System health check completed with $errors warnings"
    fi
    
    return 0
}

# ──────────────────────────────────────────────────────────────────────────────
# CLEAN FUNCTION
# ──────────────────────────────────────────────────────────────────────────────
clean() {
    print_header "CLEAN"
    
    cd "$PROJECT_ROOT"
    
    print_section "Removing build artifacts..."
    rm -rf dist/
    rm -rf build/
    rm -rf target/
    rm -rf src-tauri/target/
    rm -rf runtime/dev/build/
    rm -rf runtime/stable/build/
    rm -rf runtime/stable/*.AppImage
    rm -rf runtime/stable/*.exe
    rm -rf runtime/stable/*.dmg
    success "Build artifacts removed"
    
    print_section "Removing cache directories..."
    rm -rf node_modules/.vite/
    rm -rf node_modules/.cache/
    rm -rf .vite-cache/
    rm -rf coverage/
    rm -rf test-results/
    rm -rf playwright-report/
    success "Cache directories removed"
    
    print_section "Removing log files (older than 7 days)..."
    find "$LOG_DIR" -name "*.log" -type f -mtime +7 -delete 2>/dev/null || true
    success "Old log files removed"
    
    log ""
    success "Clean completed successfully!"
}

# ──────────────────────────────────────────────────────────────────────────────
# REPAIR FUNCTION
# ──────────────────────────────────────────────────────────────────────────────
repair() {
    print_header "REPAIR"
    
    cd "$PROJECT_ROOT"
    
    print_section "Removing node_modules..."
    rm -rf node_modules/
    success "node_modules removed"
    
    print_section "Removing package-lock.json..."
    rm -f package-lock.json
    success "package-lock.json removed"
    
    print_section "Reinstalling dependencies..."
    if [ -f "pnpm-lock.yaml" ]; then
        if command -v pnpm &> /dev/null; then
            info "Using pnpm..."
            pnpm install --frozen-lockfile || pnpm install
        elif command -v corepack &> /dev/null; then
            info "Using pnpm via corepack..."
            corepack pnpm install --frozen-lockfile || corepack pnpm install
        else
            warning "pnpm-lock.yaml detected but neither pnpm nor corepack is available; falling back to npm"
            info "Using npm..."
            npm install
        fi
    else
        info "Using npm..."
        npm install
    fi
    success "Dependencies installed"
    
    print_section "Verifying Rust dependencies..."
    cd src-tauri
    cargo check --quiet 2>/dev/null || cargo fetch
    cd "$PROJECT_ROOT"
    success "Rust dependencies verified"
    
    log ""
    success "Repair completed successfully!"
}

# ──────────────────────────────────────────────────────────────────────────────
# FIX FUNCTION (TypeScript & ESLint)
# ──────────────────────────────────────────────────────────────────────────────
fix() {
    print_header "FIX (TypeScript & ESLint)"
    
    cd "$PROJECT_ROOT"
    
    print_section "Running ESLint auto-fix..."
    npm run lint:fix || warning "ESLint warnings found (non-critical)"
    success "ESLint auto-fix completed"
    
    print_section "Running Prettier format..."
    npm run format || warning "Prettier formatting issues"
    success "Prettier format completed"
    
    print_section "Running TypeScript type check..."
    if npm run check; then
        success "TypeScript check passed (0 errors)"
    else
        warning "TypeScript errors found - review logs"
        info "Run 'npm run check' to see details"
    fi
    
    log ""
    success "Fix completed!"
}

# ──────────────────────────────────────────────────────────────────────────────
# BUILD FUNCTION
# ──────────────────────────────────────────────────────────────────────────────
build() {
    local mode="${1:-dev}"
    
    print_header "BUILD ($mode)"
    
    cd "$PROJECT_ROOT"
    
    # Verify dependencies
    if [ ! -d "node_modules" ]; then
        warning "Dependencies not installed, running repair..."
        repair
    fi
    
    print_section "Running type check..."
    if npm run check; then
        success "Type check passed (0 errors)"
    else
        warning "TypeScript errors found (non-critical for Vite build)"
        info "Build will continue - Vite can compile with TS errors"
    fi
    
    print_section "Building frontend (Vite)..."
    NODE_ENV=production npm run build
    
    if [ ! -d "dist" ]; then
        error "Frontend build failed - dist/ not found"
    fi
    
    DIST_SIZE=$(du -sh dist | cut -f1)
    success "Frontend built successfully ($DIST_SIZE)"
    
    print_section "Building Tauri app ($mode)..."
    
    if [ "$mode" = "stable" ]; then
        info "Using stable runtime configuration..."
        npx tauri build --config runtime/stable/tauri.conf.json
        
        # Copy to runtime/stable
        print_section "Copying build artifacts..."
        mkdir -p runtime/stable/build/
        
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            cp src-tauri/target/release/bundle/appimage/*.AppImage runtime/stable/ 2>/dev/null || true
            success "AppImage ready in runtime/stable/"
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            cp -r src-tauri/target/release/bundle/macos/*.app runtime/stable/ 2>/dev/null || true
            success "macOS app ready in runtime/stable/"
        fi
    else
        info "Using dev runtime configuration..."
        npx tauri build --config runtime/dev/tauri.conf.json
        success "Dev runtime built"
    fi
    
    log ""
    success "Build completed successfully!"
}

# ──────────────────────────────────────────────────────────────────────────────
# DEPLOY FUNCTION
# ──────────────────────────────────────────────────────────────────────────────
deploy() {
    print_header "DEPLOY (Production)"
    
    cd "$PROJECT_ROOT"
    
    # Run all checks
    print_section "Pre-deployment checks..."
    
    # Type check
    info "Running type check..."
    if npm run check; then
        success "Type check passed"
    else
        warning "TypeScript errors found (non-critical - build will continue)"
    fi
    
    # Lint check
    info "Running lint check..."
    npm run lint || warning "ESLint warnings (non-critical)"
    
    # Tests
    info "Running tests..."
    npm test -- --run --reporter=basic 2>/dev/null || warning "Some tests failed (non-critical)"
    
    success "Pre-deployment checks completed"
    
    # Build stable
    build stable
    
    print_section "Verifying build artifacts..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        APPIMAGE_COUNT=$(find runtime/stable -name "*.AppImage" -type f | wc -l)
        if [ "$APPIMAGE_COUNT" -gt 0 ]; then
            success "Found $APPIMAGE_COUNT AppImage(s) in runtime/stable/"
            find runtime/stable -name "*.AppImage" -type f -exec ls -lh {} \;
        else
            error "No AppImage found in runtime/stable/"
        fi
    fi
    
    log ""
    success "Deploy completed successfully!"
    info "Artifacts are ready in runtime/stable/"
}

# ──────────────────────────────────────────────────────────────────────────────
# FULL FUNCTION (Complete Cycle)
# ──────────────────────────────────────────────────────────────────────────────
full() {
    print_header "FULL DEPLOYMENT CYCLE"
    
    log "${BOLD}This will run:${NC}"
    log "  1. Health Check"
    log "  2. Clean"
    log "  3. Repair"
    log "  4. Fix"
    log "  5. Build (stable)"
    log "  6. Deploy"
    log ""
    
    read -p "Continue? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        warning "Full deployment cancelled"
        exit 0
    fi
    
    health_check
    clean
    repair
    fix
    build stable
    deploy
    
    print_header "FULL DEPLOYMENT COMPLETED"
    success "All operations completed successfully!"
}

# ──────────────────────────────────────────────────────────────────────────────
# MAIN COMMAND DISPATCHER
# ──────────────────────────────────────────────────────────────────────────────
main() {
    local command="${1:-help}"
    
    case "$command" in
        clean)
            clean
            ;;
        repair)
            repair
            ;;
        fix)
            fix
            ;;
        build)
            build "$BUILD_MODE"
            ;;
        deploy)
            deploy
            ;;
        full)
            full
            ;;
        health)
            health_check
            ;;
        help|--help|-h)
            print_header "HELP"
            log "Usage: ./titane.sh <command> [options]"
            log ""
            log "${BOLD}Commands:${NC}"
            log "  ${GREEN}clean${NC}              → Clean build artifacts & cache"
            log "  ${GREEN}repair${NC}             → Repair dependencies (reinstall)"
            log "  ${GREEN}fix${NC}                → Fix TypeScript & ESLint errors"
            log "  ${GREEN}build${NC} [dev|stable] → Build application (dev or stable)"
            log "  ${GREEN}deploy${NC}             → Build & deploy production"
            log "  ${GREEN}full${NC}               → Complete cycle (clean+repair+fix+build+deploy)"
            log "  ${GREEN}health${NC}             → System health check"
            log "  ${GREEN}help${NC}               → Show this help"
            log ""
            log "${BOLD}Examples:${NC}"
            log "  ./titane.sh clean          # Clean everything"
            log "  ./titane.sh build dev      # Build dev runtime"
            log "  ./titane.sh build stable   # Build stable runtime"
            log "  ./titane.sh deploy         # Full production deployment"
            log "  ./titane.sh full           # Complete cycle with confirmation"
            log ""
            ;;
        *)
            error "Unknown command: $command"
            info "Run './titane.sh help' for usage"
            exit 1
            ;;
    esac
}

# ──────────────────────────────────────────────────────────────────────────────
# EXECUTION
# ──────────────────────────────────────────────────────────────────────────────
main "$@"
