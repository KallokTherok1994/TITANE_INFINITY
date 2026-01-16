#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# TITANE∞ v26.2.0 — Script de Déploiement Complet Tauri Local
# Full deployment pipeline: clean → install → build → package → deploy
# ═══════════════════════════════════════════════════════════════════════════════
#
# USAGE:
#   ./scripts/deployment/tauri-full-deploy.sh [OPTIONS]
#
# OPTIONS:
#   --target PLATFORM    Plateforme cible: linux|windows|macos|all (default: current)
#   --mode MODE          Mode: dev|stable|production (default: stable)
#   --skip-clean         Ne pas nettoyer avant build
#   --skip-tests         Ne pas exécuter les tests
#   --skip-audit         Ne pas exécuter les audits sécurité
#   --install-only       Installer deps et arrêter
#   --build-only         Build seulement (pas de package)
#   --deploy-local PATH  Déployer vers PATH local (default: runtime/stable/)
#   --dry-run           Mode simulation
#   --verbose           Mode verbeux
#   --help              Afficher l'aide
#
# EXEMPLES:
#   ./scripts/deployment/tauri-full-deploy.sh
#   ./scripts/deployment/tauri-full-deploy.sh --mode production
#   ./scripts/deployment/tauri-full-deploy.sh --target linux --skip-tests
#   ./scripts/deployment/tauri-full-deploy.sh --deploy-local ~/Apps/
#
# RÉSULTAT:
#   - Linux:   runtime/stable/TITANE-Infinity_*.AppImage
#   - Windows: runtime/stable/TITANE-Infinity_*.exe
#   - macOS:   runtime/stable/TITANE-Infinity.app
#
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURATION
# ─────────────────────────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_DIR="$PROJECT_ROOT/logs/deployment"
LOG_FILE="$LOG_DIR/tauri-full-deploy-${TIMESTAMP}.log"

# Options par défaut
TARGET_PLATFORM="current"
BUILD_MODE="stable"
SKIP_CLEAN=false
SKIP_TESTS=false
SKIP_AUDIT=false
INSTALL_ONLY=false
BUILD_ONLY=false
DEPLOY_LOCAL=""
DRY_RUN=false
VERBOSE=false

# Détection OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    CURRENT_OS="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    CURRENT_OS="macos"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    CURRENT_OS="windows"
else
    CURRENT_OS="unknown"
fi

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
# HELPER FUNCTIONS
# ─────────────────────────────────────────────────────────────────────────────

mkdir -p "$LOG_DIR"

log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

log_verbose() {
    if [ "$VERBOSE" = true ]; then
        echo -e "${CYAN}[VERBOSE]${NC} $1" | tee -a "$LOG_FILE"
    fi
}

print_header() {
    log ""
    log "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    log "${BOLD}${CYAN}   $1${NC}"
    log "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    log ""
}

print_section() {
    log "${YELLOW}━━━ $1 ━━━${NC}"
}

success() {
    log "${GREEN}✓ $1${NC}"
}

error() {
    log "${RED}✗ ERROR: $1${NC}"
    exit 1
}

warning() {
    log "${YELLOW}⚠ WARNING: $1${NC}"
}

info() {
    log "${CYAN}ℹ $1${NC}"
}

run_cmd() {
    local cmd="$1"
    local desc="$2"
    
    log_verbose "Running: $cmd"
    
    if [ "$DRY_RUN" = true ]; then
        info "[DRY-RUN] Would execute: $cmd"
        return 0
    fi
    
    if eval "$cmd" >> "$LOG_FILE" 2>&1; then
        success "$desc"
        return 0
    else
        error "$desc failed. Check logs: $LOG_FILE"
        return 1
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
# PARSE ARGUMENTS
# ─────────────────────────────────────────────────────────────────────────────

parse_args() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --target)
                TARGET_PLATFORM="$2"
                shift 2
                ;;
            --mode)
                BUILD_MODE="$2"
                shift 2
                ;;
            --skip-clean)
                SKIP_CLEAN=true
                shift
                ;;
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --skip-audit)
                SKIP_AUDIT=true
                shift
                ;;
            --install-only)
                INSTALL_ONLY=true
                shift
                ;;
            --build-only)
                BUILD_ONLY=true
                shift
                ;;
            --deploy-local)
                DEPLOY_LOCAL="$2"
                shift 2
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --verbose)
                VERBOSE=true
                shift
                ;;
            --help|-h)
                cat << EOF
USAGE: $0 [OPTIONS]

Full Tauri deployment pipeline: clean → install → build → package → deploy

OPTIONS:
  --target PLATFORM    Target platform: linux|windows|macos|all (default: current)
  --mode MODE          Build mode: dev|stable|production (default: stable)
  --skip-clean         Skip clean step
  --skip-tests         Skip tests
  --skip-audit         Skip security audits
  --install-only       Install dependencies and stop
  --build-only         Build only (no packaging)
  --deploy-local PATH  Deploy to local PATH (default: runtime/stable/)
  --dry-run            Simulation mode
  --verbose            Verbose output
  --help               Show this help

EXAMPLES:
  $0                                    # Full deployment (current OS, stable)
  $0 --mode production                  # Production build
  $0 --target linux --skip-tests        # Linux build without tests
  $0 --deploy-local ~/Apps/             # Deploy to custom location

OUTPUT:
  Linux:   runtime/stable/TITANE-Infinity_*.AppImage
  Windows: runtime/stable/TITANE-Infinity_*.exe
  macOS:   runtime/stable/TITANE-Infinity.app

EOF
                exit 0
                ;;
            *)
                error "Unknown option: $1. Use --help for usage."
                ;;
        esac
    done
}

# ─────────────────────────────────────────────────────────────────────────────
# STEP 1: ENVIRONMENT CHECK
# ─────────────────────────────────────────────────────────────────────────────

step1_env_check() {
    print_header "STEP 1: ENVIRONMENT CHECK"
    
    cd "$PROJECT_ROOT"
    
    # ─── Check Node.js ───
    print_section "1.1: Node.js"
    
    if ! command -v node &> /dev/null; then
        error "Node.js not found. Install Node.js ≥20.0.0"
    fi
    
    NODE_VERSION=$(node --version | sed 's/v//' | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 20 ]; then
        error "Node.js too old: $(node --version). Required: ≥20.0.0"
    fi
    success "Node.js $(node --version)"
    
    # ─── Check Rust ───
    print_section "1.2: Rust"
    
    if ! command -v rustc &> /dev/null; then
        error "Rust not found. Install Rust ≥1.70"
    fi
    
    RUST_VERSION=$(rustc --version | awk '{print $2}' | cut -d'.' -f2)
    if [ "$RUST_VERSION" -lt 70 ]; then
        error "Rust too old: $(rustc --version). Required: ≥1.70"
    fi
    success "Rust $(rustc --version)"
    
    # ─── Check pnpm ───
    print_section "1.3: Package Manager"

    PM_CMD=""
    PM_LABEL=""
    if command -v corepack &> /dev/null && corepack pnpm --version &> /dev/null; then
        PM_CMD="corepack pnpm"
        PM_LABEL="pnpm (corepack)"
        success "pnpm $(corepack pnpm --version)"
    elif command -v pnpm &> /dev/null; then
        PM_CMD="pnpm"
        PM_LABEL="pnpm"
        success "pnpm $(pnpm --version)"
    else
        error "pnpm requis (corepack/pnpm introuvable)"
    fi
    
    # ─── Check Tauri CLI ───
    print_section "1.4: Tauri CLI"
    
    if ! command -v cargo-tauri &> /dev/null; then
        warning "Tauri CLI not installed globally"
        info "Will use: ${PM_LABEL} exec tauri"
    else
        success "Tauri CLI $(cargo-tauri --version)"
    fi
    
    # ─── Check disk space ───
    print_section "1.5: Disk Space"
    
    AVAILABLE=$(df -h "$PROJECT_ROOT" | awk 'NR==2 {print $4}')
    info "Available: $AVAILABLE"
    
    # ─── Display config ───
    print_section "1.6: Configuration"
    
    info "Current OS: $CURRENT_OS"
    info "Target: $TARGET_PLATFORM"
    info "Build mode: $BUILD_MODE"
    info "Package manager: $PM_LABEL"
    [ "$SKIP_CLEAN" = true ] && info "Skip clean: YES"
    [ "$SKIP_TESTS" = true ] && info "Skip tests: YES"
    [ "$SKIP_AUDIT" = true ] && info "Skip audit: YES"
    [ -n "$DEPLOY_LOCAL" ] && info "Deploy to: $DEPLOY_LOCAL"
    
    success "Environment check complete"
}

# ─────────────────────────────────────────────────────────────────────────────
# STEP 2: CLEAN
# ─────────────────────────────────────────────────────────────────────────────

step2_clean() {
    if [ "$SKIP_CLEAN" = true ]; then
        warning "Skipping clean step"
        return 0
    fi
    
    print_header "STEP 2: CLEAN"
    
    cd "$PROJECT_ROOT"
    
    print_section "2.1: Clean build artifacts"
    
    if [ "$DRY_RUN" = false ]; then
        rm -rf dist/
        rm -rf build/
        rm -rf src-tauri/target/
        rm -rf runtime/dev/build/
        rm -rf runtime/stable/build/
        rm -rf runtime/stable/*.AppImage
        rm -rf runtime/stable/*.exe
        rm -rf runtime/stable/*.dmg
        success "Build artifacts removed"
        
        rm -rf node_modules/.vite/
        rm -rf node_modules/.cache/
        rm -rf .vite-cache/
        success "Cache directories removed"
    else
        info "[DRY-RUN] Would clean build artifacts and caches"
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
# STEP 3: INSTALL DEPENDENCIES
# ─────────────────────────────────────────────────────────────────────────────

step3_install() {
    print_header "STEP 3: INSTALL DEPENDENCIES"
    
    cd "$PROJECT_ROOT"
    
    # ─── Node dependencies ───
    print_section "3.1: Node.js dependencies"
    
    if [ ! -d "node_modules" ] || [ "$SKIP_CLEAN" = false ]; then
        run_cmd "$PM_CMD install --frozen-lockfile" "Install Node dependencies"
    else
        success "node_modules/ already present"
    fi
    
    # ─── Rust dependencies ───
    print_section "3.2: Rust dependencies"
    
    cd src-tauri
    run_cmd "cargo fetch" "Fetch Rust dependencies"
    cd "$PROJECT_ROOT"
    
    # ─── Verify .env ───
    print_section "3.3: Environment configuration"
    
    if [ ! -f ".env" ]; then
        if [ "$DRY_RUN" = false ]; then
            cp .env.example .env
            PASSPHRASE=$(openssl rand -base64 32 | tr -d '\n')
            echo "TITANE_SECRETS_PASSPHRASE=$PASSPHRASE" >> .env
            success "Created .env with passphrase"
        else
            info "[DRY-RUN] Would create .env"
        fi
    else
        success ".env exists"
    fi
    
    if [ "$INSTALL_ONLY" = true ]; then
        success "Dependencies installed. Stopping (--install-only)"
        exit 0
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
# STEP 4: LINT & TYPE CHECK
# ─────────────────────────────────────────────────────────────────────────────

step4_lint() {
    print_header "STEP 4: LINT & TYPE CHECK"
    
    cd "$PROJECT_ROOT"
    
    print_section "4.1: ESLint"
    run_cmd "$PM_CMD run lint" "ESLint check" || warning "ESLint warnings found"
    
    print_section "4.2: TypeScript"
    run_cmd "$PM_CMD run check" "TypeScript check" || warning "TypeScript errors found"
    
    print_section "4.3: Prettier"
    run_cmd "$PM_CMD run format:check" "Prettier check" || warning "Format issues found"
}

# ─────────────────────────────────────────────────────────────────────────────
# STEP 5: TESTS
# ─────────────────────────────────────────────────────────────────────────────

step5_tests() {
    if [ "$SKIP_TESTS" = true ]; then
        warning "Skipping tests"
        return 0
    fi
    
    print_header "STEP 5: TESTS"
    
    cd "$PROJECT_ROOT"
    
    print_section "5.1: Frontend tests (Vitest)"
    run_cmd "$PM_CMD run test -- --run --reporter=basic" "Frontend tests" || warning "Some tests failed"
    
    print_section "5.2: Architecture tests"
    run_cmd "$PM_CMD run test:architecture" "Architecture tests" || warning "Architecture tests failed"
    
    print_section "5.3: Compliance tests"
    run_cmd "$PM_CMD run test:compliance" "Compliance tests" || warning "Compliance tests failed"
    
    print_section "5.4: Rust tests"
    mkdir -p dist  # Required for Rust tests
    cd src-tauri
    run_cmd "cargo test" "Rust tests" || warning "Rust tests failed"
    cd "$PROJECT_ROOT"
}

# ─────────────────────────────────────────────────────────────────────────────
# STEP 6: SECURITY AUDIT
# ─────────────────────────────────────────────────────────────────────────────

step6_audit() {
    if [ "$SKIP_AUDIT" = true ]; then
        warning "Skipping security audit"
        return 0
    fi
    
    print_header "STEP 6: SECURITY AUDIT"
    
    cd "$PROJECT_ROOT"
    
    print_section "6.1: pnpm audit"
    run_cmd "$PM_CMD audit --audit-level=high" "pnpm audit" || warning "pnpm audit found issues"
    
    print_section "6.2: cargo audit"
    cd src-tauri
    cargo audit >> "$LOG_FILE" 2>&1 || warning "cargo audit found issues"
    cd "$PROJECT_ROOT"
    
    success "Security audit complete"
}

# ─────────────────────────────────────────────────────────────────────────────
# STEP 7: BUILD FRONTEND
# ─────────────────────────────────────────────────────────────────────────────

step7_build_frontend() {
    print_header "STEP 7: BUILD FRONTEND"
    
    cd "$PROJECT_ROOT"
    
    print_section "7.1: Vite build"
    
    run_cmd "NODE_ENV=production NODE_OPTIONS='--max-old-space-size=8192' $PM_CMD run build" "Build frontend"
    
    print_section "7.2: Verify dist/"
    
    if [ ! -f "dist/index.html" ]; then
        error "dist/index.html not found. Frontend build failed."
    fi
    success "dist/index.html present"
    
    DIST_SIZE=$(du -sh dist 2>/dev/null | cut -f1)
    info "Frontend size: $DIST_SIZE"
}

# ─────────────────────────────────────────────────────────────────────────────
# STEP 8: BUILD & PACKAGE TAURI
# ─────────────────────────────────────────────────────────────────────────────

step8_build_tauri() {
    print_header "STEP 8: BUILD & PACKAGE TAURI"
    
    cd "$PROJECT_ROOT"
    
    # ─── Determine config file ───
    if [ "$BUILD_MODE" = "production" ] || [ "$BUILD_MODE" = "stable" ]; then
        TAURI_CONFIG="runtime/stable/tauri.stable.conf.json"
        OUTPUT_DIR="runtime/stable"
    else
        TAURI_CONFIG="runtime/dev/tauri.dev.conf.json"
        OUTPUT_DIR="runtime/dev"
    fi
    
    print_section "8.1: Tauri build ($BUILD_MODE mode)"
    
    info "Config: $TAURI_CONFIG"
    info "Output: $OUTPUT_DIR"
    
    # ─── Build command ───
    if [ "$DRY_RUN" = false ]; then
        mkdir -p "$OUTPUT_DIR"

        info "Building Tauri app (this may take 10-15 minutes)..."
        run_cmd "$PM_CMD exec tauri build --config \"$TAURI_CONFIG\"" "Tauri build"
        success "Tauri build complete"
    else
        info "[DRY-RUN] Would build Tauri app"
    fi
    
    if [ "$BUILD_ONLY" = true ]; then
        success "Build complete. Stopping (--build-only)"
        exit 0
    fi
    
    # ─── Copy artifacts ───
    print_section "8.2: Copy build artifacts"
    
    if [ "$DRY_RUN" = false ]; then
        if [[ "$CURRENT_OS" == "linux" ]]; then
            # AppImage
            APPIMAGE_SRC="src-tauri/target/release/bundle/appimage"
            if [ -d "$APPIMAGE_SRC" ]; then
                cp "$APPIMAGE_SRC"/*.AppImage "$OUTPUT_DIR/" 2>/dev/null || warning "No AppImage found"
                success "AppImage copied to $OUTPUT_DIR/"
            fi
            
            # DEB (optional)
            DEB_SRC="src-tauri/target/release/bundle/deb"
            if [ -d "$DEB_SRC" ]; then
                cp "$DEB_SRC"/*.deb "$OUTPUT_DIR/" 2>/dev/null || info "No .deb package"
            fi
            
        elif [[ "$CURRENT_OS" == "macos" ]]; then
            # .app bundle
            APP_SRC="src-tauri/target/release/bundle/macos"
            if [ -d "$APP_SRC" ]; then
                cp -r "$APP_SRC"/*.app "$OUTPUT_DIR/" 2>/dev/null || warning "No .app bundle found"
                success "macOS app copied to $OUTPUT_DIR/"
            fi
            
            # DMG (optional)
            DMG_SRC="src-tauri/target/release/bundle/dmg"
            if [ -d "$DMG_SRC" ]; then
                cp "$DMG_SRC"/*.dmg "$OUTPUT_DIR/" 2>/dev/null || info "No .dmg image"
            fi
            
        elif [[ "$CURRENT_OS" == "windows" ]]; then
            # EXE
            EXE_SRC="src-tauri/target/release/bundle/nsis"
            if [ -d "$EXE_SRC" ]; then
                cp "$EXE_SRC"/*.exe "$OUTPUT_DIR/" 2>/dev/null || warning "No .exe found"
                success "Windows installer copied to $OUTPUT_DIR/"
            fi
            
            # MSI (optional)
            MSI_SRC="src-tauri/target/release/bundle/msi"
            if [ -d "$MSI_SRC" ]; then
                cp "$MSI_SRC"/*.msi "$OUTPUT_DIR/" 2>/dev/null || info "No .msi package"
            fi
        fi
    else
        info "[DRY-RUN] Would copy artifacts to $OUTPUT_DIR/"
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
# STEP 9: DEPLOY LOCAL
# ─────────────────────────────────────────────────────────────────────────────

step9_deploy_local() {
    if [ -z "$DEPLOY_LOCAL" ]; then
        info "No local deployment path specified (use --deploy-local)"
        return 0
    fi
    
    print_header "STEP 9: DEPLOY LOCAL"
    
    cd "$PROJECT_ROOT"
    
    print_section "9.1: Deploy to $DEPLOY_LOCAL"
    
    if [ ! -d "$DEPLOY_LOCAL" ]; then
        if [ "$DRY_RUN" = false ]; then
            mkdir -p "$DEPLOY_LOCAL"
            success "Created $DEPLOY_LOCAL"
        else
            info "[DRY-RUN] Would create $DEPLOY_LOCAL"
        fi
    fi
    
    # Determine output dir
    if [ "$BUILD_MODE" = "production" ] || [ "$BUILD_MODE" = "stable" ]; then
        OUTPUT_DIR="runtime/stable"
    else
        OUTPUT_DIR="runtime/dev"
    fi
    
    if [ "$DRY_RUN" = false ]; then
        if [[ "$CURRENT_OS" == "linux" ]]; then
            cp "$OUTPUT_DIR"/*.AppImage "$DEPLOY_LOCAL/" 2>/dev/null || warning "No AppImage to deploy"
            success "AppImage deployed to $DEPLOY_LOCAL/"
        elif [[ "$CURRENT_OS" == "macos" ]]; then
            cp -r "$OUTPUT_DIR"/*.app "$DEPLOY_LOCAL/" 2>/dev/null || warning "No .app to deploy"
            success "macOS app deployed to $DEPLOY_LOCAL/"
        elif [[ "$CURRENT_OS" == "windows" ]]; then
            cp "$OUTPUT_DIR"/*.exe "$DEPLOY_LOCAL/" 2>/dev/null || warning "No .exe to deploy"
            success "Windows installer deployed to $DEPLOY_LOCAL/"
        fi
    else
        info "[DRY-RUN] Would deploy to $DEPLOY_LOCAL"
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
# STEP 10: VERIFICATION
# ─────────────────────────────────────────────────────────────────────────────

step10_verify() {
    print_header "STEP 10: VERIFICATION"
    
    cd "$PROJECT_ROOT"
    
    # Determine output dir
    if [ "$BUILD_MODE" = "production" ] || [ "$BUILD_MODE" = "stable" ]; then
        OUTPUT_DIR="runtime/stable"
    else
        OUTPUT_DIR="runtime/dev"
    fi
    
    print_section "10.1: Build artifacts"
    
    if [[ "$CURRENT_OS" == "linux" ]]; then
        APPIMAGE_COUNT=$(find "$OUTPUT_DIR" -name "*.AppImage" -type f 2>/dev/null | wc -l)
        if [ "$APPIMAGE_COUNT" -gt 0 ]; then
            success "Found $APPIMAGE_COUNT AppImage(s)"
            find "$OUTPUT_DIR" -name "*.AppImage" -type f -exec ls -lh {} \;
        else
            warning "No AppImage found in $OUTPUT_DIR/"
        fi
    elif [[ "$CURRENT_OS" == "macos" ]]; then
        APP_COUNT=$(find "$OUTPUT_DIR" -name "*.app" -type d 2>/dev/null | wc -l)
        if [ "$APP_COUNT" -gt 0 ]; then
            success "Found $APP_COUNT .app bundle(s)"
            find "$OUTPUT_DIR" -name "*.app" -type d -exec ls -ldh {} \;
        else
            warning "No .app bundle found in $OUTPUT_DIR/"
        fi
    elif [[ "$CURRENT_OS" == "windows" ]]; then
        EXE_COUNT=$(find "$OUTPUT_DIR" -name "*.exe" -type f 2>/dev/null | wc -l)
        if [ "$EXE_COUNT" -gt 0 ]; then
            success "Found $EXE_COUNT installer(s)"
            find "$OUTPUT_DIR" -name "*.exe" -type f -exec ls -lh {} \;
        else
            warning "No .exe found in $OUTPUT_DIR/"
        fi
    fi
    
    print_section "10.2: Deployment summary"
    
    info "═══════════════════════════════════════════════════════════"
    info "BUILD MODE: $BUILD_MODE"
    info "OUTPUT DIR: $OUTPUT_DIR"
    [ -n "$DEPLOY_LOCAL" ] && info "DEPLOYED TO: $DEPLOY_LOCAL"
    info "═══════════════════════════════════════════════════════════"
}

# ─────────────────────────────────────────────────────────────────────────────
# MAIN EXECUTION
# ─────────────────────────────────────────────────────────────────────────────

main() {
    parse_args "$@"
    
    print_header "TITANE∞ v26.2.0 — Full Tauri Local Deployment"
    
    info "Log file: $LOG_FILE"
    if [ "$DRY_RUN" = true ]; then
        warning "DRY-RUN MODE: No changes will be made"
    fi
    
    START_TIME=$(date +%s)
    
    # Execute pipeline
    step1_env_check
    step2_clean
    step3_install
    step4_lint
    step5_tests
    step6_audit
    step7_build_frontend
    step8_build_tauri
    step9_deploy_local
    step10_verify
    
    END_TIME=$(date +%s)
    ELAPSED=$((END_TIME - START_TIME))
    ELAPSED_MIN=$((ELAPSED / 60))
    ELAPSED_SEC=$((ELAPSED % 60))
    
    print_header "DEPLOYMENT COMPLETE ✓"
    success "Total time: ${ELAPSED_MIN}m ${ELAPSED_SEC}s"
    success "Logs: $LOG_FILE"
    
    log ""
    log "${GREEN}${BOLD}DEPLOYMENT SUCCESSFUL ✓${NC}"
    log ""
    log "Build artifacts: ${CYAN}$OUTPUT_DIR/${NC}"
    [ -n "$DEPLOY_LOCAL" ] && log "Deployed to: ${CYAN}$DEPLOY_LOCAL${NC}"
    log ""
}

# ─────────────────────────────────────────────────────────────────────────────
# RUN
# ─────────────────────────────────────────────────────────────────────────────

main "$@"
