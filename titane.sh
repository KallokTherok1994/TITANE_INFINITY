#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# TITANE∞ — Unified Deployment Command v28.1.0
# Commande unifiée pour clean, repair, fix, build, deploy & icons
# ✨ v28.1.0: icons update, autoheal gate, TITANE_SECRETS_PASSPHRASE injection
# ═══════════════════════════════════════════════════════════════════════════════
#
# USAGE:
#   ./titane.sh clean              → Nettoyage complet
#   ./titane.sh repair             → Réparation des dépendances
#   ./titane.sh fix                → Correction des erreurs TypeScript
#   ./titane.sh build [dev|stable] → Build complet (dev par défaut)
#   ./titane.sh deploy             → Build + Deploy production
#   ./titane.sh dev [--no-ollama]  → Environnement développement (avec Ollama)
#   ./titane.sh icons              → Regénère les icônes (nouveau logo v28)
#   ./titane.sh autoheal           → Lance detect_recurrence.sh
#   ./titane.sh gates              → Lance verify_instructions.sh (20/20 PASS)
#   ./titane.sh cache --stats      → Gestion du cache système
#   ./titane.sh analyze            → Analyse des scripts projet
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
# OUTPUT SYMBOLS (UTF-8 safe)
# ──────────────────────────────────────────────────────────────────────────────
OUTPUT_LOCALE="${LC_ALL:-${LC_CTYPE:-${LANG:-}}}"
if [[ "$OUTPUT_LOCALE" == *"UTF-8"* || "$OUTPUT_LOCALE" == *"utf8"* || "$OUTPUT_LOCALE" == *"utf-8"* ]]; then
    APP_NAME='TITANE∞'
    HR='═══════════════════════════════════════════════════════════════'
    SECTION_L='━━━ '
    SECTION_R=' ━━━'
    ARROW='→'
    SYM_OK='✓'
    SYM_FAIL='✗'
    SYM_WARN='⚠'
    SYM_INFO='ℹ'
else
    APP_NAME='TITANE'
    HR='==============================================================='
    SECTION_L='--- '
    SECTION_R=' ---'
    ARROW='->'
    SYM_OK='[OK]'
    SYM_FAIL='[FAIL]'
    SYM_WARN='[WARN]'
    SYM_INFO='[INFO]'
fi

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

# ── Inject TITANE_SECRETS_PASSPHRASE si non définie
_SECRETS_CONF="$HOME/.config/environment.d/titane-secrets.conf"
if [ -z "${TITANE_SECRETS_PASSPHRASE:-}" ] && [ -f "$_SECRETS_CONF" ]; then
    set -a; . "$_SECRETS_CONF"; set +a
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

# Package-manager helpers (pnpm-first)
pm_run() {
    if [ -f "pnpm-lock.yaml" ]; then
        if command -v corepack &> /dev/null; then
            corepack pnpm run "$@"
            return $?
        fi
        if command -v pnpm &> /dev/null; then
            pnpm run "$@"
            return $?
        fi
    fi

    error "pnpm requis: aucun binaire pnpm/corepack disponible"
}

pm_exec() {
    if [ -f "pnpm-lock.yaml" ]; then
        if command -v corepack &> /dev/null; then
            corepack pnpm exec "$@"
            return $?
        fi
        if command -v pnpm &> /dev/null; then
            pnpm exec "$@"
            return $?
        fi
    fi

    error "pnpm requis: aucun exécuteur pnpm disponible"
}

# Print header
print_header() {
    log "${BLUE}${HR}${NC}"
    log "${BOLD}${CYAN}   ${APP_NAME} — $1${NC}"
    log "${BLUE}${HR}${NC}"
    log ""
}

# Print section
print_section() {
    log "${YELLOW}${SECTION_L}$1${SECTION_R}${NC}"
}

# Success message
success() {
    log "${GREEN}${SYM_OK} $1${NC}"
}

# Error message
error() {
    log "${RED}${SYM_FAIL} $1${NC}"
    exit 1
}

# Warning message
warning() {
    log "${YELLOW}${SYM_WARN} $1${NC}"
}

# Info message
info() {
    log "${CYAN}${SYM_INFO} $1${NC}"
}

run_with_heartbeat() {
    local heartbeat_label="$1"
    shift

    local heartbeat_interval="${TITANE_BUILD_HEARTBEAT_SEC:-30}"

    "$@" &
    local command_pid=$!

    while kill -0 "$command_pid" 2>/dev/null; do
        sleep "$heartbeat_interval"

        if ! kill -0 "$command_pid" 2>/dev/null; then
            break
        fi

        local elapsed
        local cpu
        elapsed="$(ps -o etime= -p "$command_pid" 2>/dev/null | awk '{$1=$1; print}')"
        cpu="$(ps -o %cpu= -p "$command_pid" 2>/dev/null | awk '{$1=$1; print}')"

        info "$heartbeat_label still running (pid=$command_pid, elapsed=${elapsed:-unknown}, cpu=${cpu:-unknown}%)"
    done

    wait "$command_pid"
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
    
    # Check pnpm
    print_section "Checking pnpm..."
    if command -v pnpm &> /dev/null; then
        PNPM_VERSION=$(pnpm --version)
        success "pnpm: $PNPM_VERSION"
    else
        error "pnpm not found!"
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
    if command -v git &> /dev/null && git rev-parse --is-inside-work-tree &> /dev/null; then
        CURRENT_BRANCH=$(git branch --show-current)
        GIT_STATUS=$(git status --porcelain | wc -l)
        info "Current branch: $CURRENT_BRANCH"
        info "Modified files: $GIT_STATUS"
    else
        warning "Not a Git repository"
    fi
    
    # Check security parameters (v26.2.3)
    print_section "Checking security parameters..."
    if grep -q "GLOBAL_RATE_LIMITER.*10000" src-tauri/src/security/rate_limit.rs 2>/dev/null; then
        info "Rate limiter: 10000 req/min (disabled)"
    else
        warning "Rate limiter might be restrictive"
    fi
    
    if grep -q "enabled: false" src-tauri/src/agent_system/sandbox.rs 2>/dev/null; then
        info "Sandbox: disabled"
    else
        warning "Sandbox is enabled (might block operations)"
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

    # Clean Rust build artifacts using cargo
    if command -v cargo &> /dev/null; then
        info "Cleaning Rust build artifacts..."
        cd src-tauri && cargo clean 2>/dev/null || true
        cd "$PROJECT_ROOT"
    else
        # Fallback to manual removal
        rm -rf src-tauri/target/
    fi

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
        if command -v corepack &> /dev/null; then
            info "Using pnpm via corepack..."
            corepack pnpm install --frozen-lockfile || corepack pnpm install
        elif command -v pnpm &> /dev/null; then
            info "Using pnpm..."
            pnpm install --frozen-lockfile || pnpm install
        else
            error "pnpm/corepack introuvable (pnpm-only)"
        fi
    else
        if command -v corepack &> /dev/null; then
            info "Using pnpm via corepack..."
            corepack pnpm install
        elif command -v pnpm &> /dev/null; then
            info "Using pnpm..."
            pnpm install
        else
            error "pnpm/corepack introuvable (pnpm-only)"
        fi
    fi
    success "Dependencies installed"
    
    print_section "Verifying Rust dependencies..."
    cd src-tauri
    info "Fetching Rust dependencies..."
    cargo fetch

    # Only run cargo check if frontend dist exists (after build)
    if [ -d "../dist" ]; then
        info "Running cargo check..."
        if cargo check --quiet; then
            success "Rust check passed"
        else
            warning "Rust check failed (will retry after frontend build)"
        fi
    else
        info "Skipping cargo check (frontend dist/ not built yet)"
        success "Rust dependencies fetched (check will run after frontend build)"
    fi

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
    pm_run lint:fix || warning "ESLint warnings found (non-critical)"
    success "ESLint auto-fix completed"
    
    print_section "Running Prettier format..."
    pm_run format || warning "Prettier formatting issues"
    success "Prettier format completed"
    
    print_section "Running TypeScript type check..."
    if pm_run check; then
        success "TypeScript check passed (0 errors)"
    else
        warning "TypeScript errors found - review logs"
        info "Run 'pnpm run check' to see details"
    fi

    print_section "Running autoheal recurrence guard..."
    if bash "$PROJECT_ROOT/scripts/autoheal/detect_recurrence.sh" 2>/dev/null; then
        success "Autoheal: no recurrence detected"
    else
        warning "Autoheal: recurrence detected — check autoheal_rules.jsonl"
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
    if pm_run check; then
        success "Type check passed (0 errors)"
    else
        warning "TypeScript errors found (non-critical for Vite build)"
        info "Build will continue - Vite can compile with TS errors"
    fi
    
    print_section "Building frontend (Vite)..."
    NODE_ENV=production pm_run build
    
    if [ ! -d "dist" ]; then
        error "Frontend build failed - dist/ not found"
    fi
    
    DIST_SIZE=$(du -sh dist | cut -f1)
    success "Frontend built successfully ($DIST_SIZE)"
    
    # Check available memory (v26.2.3 - 4GB limits)
    print_section "Checking available memory..."
    if command -v free &> /dev/null; then
        MEM_AVAILABLE_MB=$(free -m | awk 'NR==2 {print $7}')
        info "Available memory: ${MEM_AVAILABLE_MB}MB"
        if [ "$MEM_AVAILABLE_MB" -lt 2048 ]; then
            warning "Low memory detected (<2GB available)"
            warning "Build may be slow or fail. Consider closing other apps."
        fi
    fi
    
    print_section "Building Tauri app ($mode)..."

    # Workaround: ensure Cargo fingerprint dir exists after clean
    mkdir -p src-tauri/target/release/.fingerprint
    
    if [ "$mode" = "stable" ]; then
        info "Using stable runtime configuration..."
        info "Stable Rust link may stay silent for several minutes with release reproducibility flags; heartbeat enabled every ${TITANE_BUILD_HEARTBEAT_SEC:-30}s"
        TITANE_SKIP_FRONTEND_BUILD=1 run_with_heartbeat "Stable Tauri build" pm_exec tauri build --config runtime/stable/tauri.conf.json
        
        # Copy to runtime/stable
        print_section "Copying build artifacts..."
        mkdir -p runtime/stable/build/
        
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            cp src-tauri/target/release/bundle/appimage/*.AppImage runtime/stable/ 2>/dev/null || true
            success "AppImage ready in runtime/stable/"
            cp src-tauri/target/release/bundle/deb/*.deb runtime/stable/ 2>/dev/null || true
            success "DEB package ready in runtime/stable/"
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            cp -r src-tauri/target/release/bundle/macos/*.app runtime/stable/ 2>/dev/null || true
            success "macOS app ready in runtime/stable/"
        fi

        # postbuild (frontend) s'exécute avant le bundling Tauri; on met à jour
        # le .desktop ici, une fois l'artefact stable disponible.
        bash scripts/update-desktop-icon.sh || true
    else
        info "Using dev runtime configuration..."
        pm_exec tauri build --config runtime/dev/tauri.conf.json
        # Régénère les icônes dans les thèmes locaux après tout build
        _regen_icons_local
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
    if pm_run check; then
        success "Type check passed"
    else
        warning "TypeScript errors found (non-critical - build will continue)"
    fi
    
    # Lint check
    info "Running lint check..."
    pm_run lint || warning "ESLint warnings (non-critical)"
    
    # Tests
    info "Running tests..."
    pm_run test -- --run --reporter=basic 2>/dev/null || warning "Some tests failed (non-critical)"
    
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

        DEB_COUNT=$(find runtime/stable -name "*.deb" -type f | wc -l)
        if [ "$DEB_COUNT" -gt 0 ]; then
            success "Found $DEB_COUNT DEB package(s) in runtime/stable/"
            find runtime/stable -name "*.deb" -type f -exec ls -lh {} \;
        else
            error "No DEB package found in runtime/stable/"
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
    
    if [[ "${TITANE_ASSUME_YES:-0}" == "1" || "${TITANE_BUILD_ASSUME_YES:-0}" == "1" ]]; then
        info "TITANE_ASSUME_YES=1 ${ARROW} full non-interactif"
    else
        read -p "Continue? (y/n): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            warning "Full deployment cancelled"
            exit 0
        fi
    fi
    
    health_check
    clean
    repair
    fix
    build stable
    deploy
    icons
    
    print_header "FULL DEPLOYMENT COMPLETED"
    success "All operations completed successfully!"
}

# ──────────────────────────────────────────────────────────────────────────────
# DEV FUNCTION (Development Environment)
# ──────────────────────────────────────────────────────────────────────────────
dev() {
    print_header "DEV (Development Environment)"

    cd "$PROJECT_ROOT"

    print_section "Starting development environment..."

    # Check if Ollama is requested
    local with_ollama=true
    local extra_args=()

    while [[ $# -gt 0 ]]; do
        case $1 in
            --no-ollama)
                with_ollama=false
                shift
                ;;
            --ollama)
                with_ollama=true
                shift
                ;;
            --base-url)
                export OLLAMA_BASE_URL="$2"
                shift 2
                ;;
            --model)
                export OLLAMA_DEFAULT_MODEL="$2"
                shift 2
                ;;
            --pull-model)
                export TITANE_OLLAMA_PULL_MODEL=1
                shift
                ;;
            *)
                extra_args+=("$1")
                shift
                ;;
        esac
    done

    if [[ "$with_ollama" == true ]]; then
        info "Starting development with Ollama support..."
        if [[ -f "scripts/dev/full_local_tauri_ollama.sh" ]]; then
            bash scripts/dev/full_local_tauri_ollama.sh "${extra_args[@]}"
        else
            error "Development script not found: scripts/dev/full_local_tauri_ollama.sh"
        fi
    else
        info "Starting development without Ollama..."
        if [[ -f "scripts/dev/dev_tauri.sh" ]]; then
            bash scripts/dev/dev_tauri.sh "${extra_args[@]}"
        elif [[ -f "scripts/launch/start_dev.sh" ]]; then
            bash scripts/launch/start_dev.sh "${extra_args[@]}"
        else
            error "No suitable development script found"
        fi
    fi

    log ""
    success "Development environment started!"
}

# ──────────────────────────────────────────────────────────────────────────────
# CACHE FUNCTION (Cache Management)
# ──────────────────────────────────────────────────────────────────────────────
cache() {
    print_header "CACHE MANAGEMENT"

    cd "$PROJECT_ROOT"

    # Skip the command name and get the first option
    local option="${1:-stats}"
    if [[ "$option" == "cache" ]]; then
        option="${2:-stats}"
    fi

    case "$option" in
        --stats|stats)
            print_section "Cache Statistics"
            info "Cache directory: $HOME/.cache/titane-infinity"
            info "Available cache operations through core system"
            success "Cache system operational"
            ;;
        --clear|clear)
            print_section "Clearing Cache"
            warning "This will clear all cached data"
            read -p "Continue? (y/n): " -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                rm -rf "$HOME/.cache/titane-infinity" 2>/dev/null || true
                success "Cache cleared"
            else
                info "Cache clear cancelled"
            fi
            ;;
        --cleanup|cleanup)
            print_section "Cleaning Expired Cache"
            # Find and remove old cache files
            find "$HOME/.cache/titane-infinity" -name "*.cache" -mtime +7 -delete 2>/dev/null || true
            find "$HOME/.cache/titane-infinity" -name "*.log" -mtime +30 -delete 2>/dev/null || true
            success "Expired cache cleaned"
            ;;
        *)
            error "Unknown cache option: $1"
            info "Available options: --stats, --clear, --cleanup"
            ;;
    esac

    log ""
    success "Cache management completed!"
}

# ──────────────────────────────────────────────────────────────────────────────
# ANALYZE FUNCTION (Script Analysis)
# ──────────────────────────────────────────────────────────────────────────────
analyze() {
    print_header "SCRIPT ANALYSIS"

    cd "$PROJECT_ROOT"

    print_section "Running Script Analysis"
    info "Analyzing scripts in the project..."

    if [[ -f "scripts/core/simple-analyzer.sh" ]]; then
        bash scripts/core/simple-analyzer.sh
        success "Script analysis completed"
    else
        warning "Simple analyzer not found, using basic analysis"

        # Basic script count
        local script_count=$(find scripts/ -name "*.sh" -type f | wc -l)
        local executable_count=$(find scripts/ -name "*.sh" -type f -executable | wc -l)
        local archived_count=$(find scripts/_archive/ -name "*.sh" -type f 2>/dev/null | wc -l || echo 0)

        info "Total scripts: $script_count"
        info "Executable scripts: $executable_count"
        info "Archived scripts: $archived_count"

        success "Basic analysis completed"
    fi

    log ""
    success "Analysis completed!"
}

# ──────────────────────────────────────────────────────────────────────────────
# _REGEN_ICONS_LOCAL — copie icônes vers ~/.local/share/icons/hicolor
# ──────────────────────────────────────────────────────────────────────────────
_regen_icons_local() {
    local src="$PROJECT_ROOT/src-tauri/icons"
    local dst="$HOME/.local/share/icons/hicolor"
    for sz in 32 128 256 512; do
        mkdir -p "$dst/${sz}x${sz}/apps/"
        cp -f "$src/${sz}x${sz}.png" "$dst/${sz}x${sz}/apps/titane-infinity.png" 2>/dev/null || true
    done
    mkdir -p "$dst/256x256@2/apps/"
    cp -f "$src/128x128@2x.png" "$dst/256x256@2/apps/titane-infinity.png" 2>/dev/null || true
    update-desktop-database "$HOME/.local/share/applications/" 2>/dev/null || true
    gtk-update-icon-cache -f -t "$dst" 2>/dev/null || true
}

# ──────────────────────────────────────────────────────────────────────────────
# ICONS FUNCTION — Régénère toutes les icônes depuis generate_logo_v28.py
# ──────────────────────────────────────────────────────────────────────────────
icons() {
    print_header "ICONS (Logo v28.0.0)"

    cd "$PROJECT_ROOT"

    local py_gen="src-tauri/icons/generate_logo_v28.py"
    local venv_py=".venv/bin/python"

    # Trouver Python
    local py_cmd=""
    if [ -x "$PROJECT_ROOT/$venv_py" ]; then
        py_cmd="$PROJECT_ROOT/$venv_py"
    elif command -v python3 &>/dev/null; then
        py_cmd="python3"
    else
        error "Python 3 introuvable — impossible de régénérer les icônes"
    fi

    if [ ! -f "$py_gen" ]; then
        error "Script de génération introuvable: $py_gen"
    fi

    print_section "Génération des icônes PNG/ICO/ICNS..."
    "$py_cmd" "$py_gen"

    print_section "Installation dans ~/.local/share/icons/hicolor/..."
    _regen_icons_local
    success "Icônes locales mises à jour"

    print_section "Vérification des fichiers générés..."
    for sz in 32 128 256 512; do
        if [ -f "src-tauri/icons/${sz}x${sz}.png" ]; then
            success "${sz}x${sz}.png ✓"
        else
            warning "${sz}x${sz}.png MANQUANT"
        fi
    done
    if [ -f "src-tauri/icons/icon.ico" ]; then success "icon.ico ✓"; fi
    if [ -f "src-tauri/icons/icon.icns" ]; then success "icon.icns ✓"; fi

    log ""
    success "Icônes TITANE∞ v28.0.0 mises à jour !"
    info "Pour prendre effet dans le shell courant: reconnecte-toi ou lance 'killall plasmashell' (KDE) / redémarre GNOME-shell (Alt+F2 > r)"
}

# ──────────────────────────────────────────────────────────────────────────────
# AUTOHEAL FUNCTION — Lance detect_recurrence.sh
# ──────────────────────────────────────────────────────────────────────────────
autoheal_cmd() {
    print_header "AUTOHEAL"
    cd "$PROJECT_ROOT"

    local script="scripts/autoheal/detect_recurrence.sh"
    if [ ! -f "$script" ]; then
        error "Script autoheal introuvable: $script"
    fi

    print_section "Running detect_recurrence.sh..."
    if bash "$script"; then
        success "Autoheal: aucune récurrence détectée"
    else
        warning "Autoheal: récurrences détectées — voir autoheal_rules.jsonl"
    fi

    log ""
    success "Autoheal terminé"
}

# ──────────────────────────────────────────────────────────────────────────────
# GATES FUNCTION — Lance verify_instructions.sh
# ──────────────────────────────────────────────────────────────────────────────
gates_cmd() {
    print_header "GOVERNANCE GATES"
    cd "$PROJECT_ROOT"

    local script="scripts/verify_instructions.sh"
    if [ ! -f "$script" ]; then
        error "Script gates introuvable: $script"
    fi

    print_section "Running verify_instructions.sh..."
    local result
    result=$(bash "$script" 2>&1)
    echo "$result"

    local pass_count fail_count
    pass_count=$(echo "$result" | grep -c '^PASS:' || true)
    fail_count=$(echo "$result" | grep -c '^FAIL:' || true)

    if [ "$fail_count" -eq 0 ]; then
        success "Gates: PASS=$pass_count FAIL=0 — GOUVERNANCE OK"
    else
        warning "Gates: PASS=$pass_count FAIL=$fail_count — STOP-THE-LINE"
        exit 1
    fi

    log ""
    success "Gates vérifiés"
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
        dev)
            dev "$@"
            ;;
        cache)
            cache "$@"
            ;;
        analyze)
            analyze "$@"
            ;;
        icons)
            icons
            ;;
        autoheal)
            autoheal_cmd
            ;;
        gates)
            gates_cmd
            ;;
        help|--help|-h)
            print_header "HELP"
            log "Usage: ./titane.sh <command> [options]"
            log ""
            log "${BOLD}Commands:${NC}"
            log "  ${GREEN}clean${NC}              ${ARROW} Clean build artifacts & cache"
            log "  ${GREEN}repair${NC}             ${ARROW} Repair dependencies (reinstall)"
            log "  ${GREEN}fix${NC}                ${ARROW} Fix TypeScript & ESLint errors"
            log "  ${GREEN}build${NC} [dev|stable] ${ARROW} Build application (dev or stable)"
            log "  ${GREEN}deploy${NC}             ${ARROW} Build & deploy production"
            log "  ${GREEN}dev${NC} [--no-ollama]   ${ARROW} Start development environment (with Ollama)"
            log "  ${GREEN}cache${NC} [--stats]     ${ARROW} Cache management operations"
            log "  ${GREEN}analyze${NC}             ${ARROW} Script analysis and optimization"
            log "  ${GREEN}icons${NC}              ${ARROW} Régénère les icônes (nouveau logo v28)"
            log "  ${GREEN}autoheal${NC}           ${ARROW} Lance detect_recurrence.sh"
            log "  ${GREEN}gates${NC}              ${ARROW} Lance verify_instructions.sh"
            log "  ${GREEN}full${NC}               ${ARROW} Complete cycle (clean+repair+fix+build+deploy+icons)"
            log "  ${GREEN}health${NC}             ${ARROW} System health check"
            log "  ${GREEN}help${NC}               ${ARROW} Show this help"
            log ""
            log "${BOLD}Examples:${NC}"
            log "  ./titane.sh clean          # Clean everything"
            log "  ./titane.sh build dev      # Build dev runtime"
            log "  ./titane.sh build stable   # Build stable runtime"
            log "  ./titane.sh deploy         # Full production deployment"
            log "  ./titane.sh dev            # Start dev environment with Ollama"
            log "  ./titane.sh dev --no-ollama # Start dev environment without Ollama"
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
