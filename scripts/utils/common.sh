#!/usr/bin/env bash
################################################################################
# TITANE∞ v12.0.0 - Common Functions Library
# Fonctions partagées pour tous les scripts TITANE
################################################################################

# Couleurs
export RED='\033[0;31m'
export GREEN='\033[0;32m'
export YELLOW='\033[1;33m'
export BLUE='\033[0;34m'
export MAGENTA='\033[0;35m'
export CYAN='\033[0;36m'
export NC='\033[0m'
export BOLD='\033[1m'

# Variables d'environnement essentielles
export PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export SRC_TAURI="$PROJECT_ROOT/src-tauri"
export FRONTEND="$PROJECT_ROOT"
export DIST="$PROJECT_ROOT/dist"
export LOGS_DIR="$PROJECT_ROOT/logs"
export TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Créer répertoire logs
mkdir -p "$LOGS_DIR"

################################################################################
# Logging Functions
################################################################################

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1" >&2
}

log_step() {
    echo -e "${CYAN}[STEP]${NC} $1"
}

log_header() {
    echo ""
    echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BOLD}${CYAN}  $1${NC}"
    echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
}

################################################################################
# Error Handling
################################################################################

error_handler() {
    local line=$1
    log_error "Erreur à la ligne $line"
    log_error "Commande: $BASH_COMMAND"
    exit 1
}

trap 'error_handler ${LINENO}' ERR

################################################################################
# Validation Functions
################################################################################

# Vérifie qu'une commande existe
check_command() {
    local cmd=$1
    if ! command -v "$cmd" &> /dev/null; then
        log_error "Commande '$cmd' introuvable"
        return 1
    fi
    return 0
}

# Vérifie que Cargo est installé et fonctionnel
check_cargo() {
    if ! check_command cargo; then
        log_error "Cargo n'est pas installé"
        log_info "Installer avec: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
        return 1
    fi
    
    # Source cargo env si disponible
    if [ -f "$HOME/.cargo/env" ]; then
        source "$HOME/.cargo/env"
    fi
    
    local version=$(cargo --version 2>/dev/null)
    log_success "Cargo: $version"
    return 0
}

# Vérifie que Node.js et npm sont installés
check_node() {
    if ! check_command node; then
        log_error "Node.js n'est pas installé"
        return 1
    fi
    
    if ! check_command npm; then
        log_error "npm n'est pas installé"
        return 1
    fi
    
    local node_version=$(node --version 2>/dev/null)
    local npm_version=$(npm --version 2>/dev/null)
    log_success "Node: $node_version | npm: $npm_version"
    return 0
}

# Vérifie que webkit2gtk est installé
check_webkit() {
    if ! pkg-config --exists webkit2gtk-4.1; then
        log_warn "webkit2gtk-4.1 n'est pas installé"
        log_info "Installer avec: sudo apt install libwebkit2gtk-4.1-dev"
        return 1
    fi
    
    local webkit_version=$(pkg-config --modversion webkit2gtk-4.1 2>/dev/null)
    log_success "WebKit2GTK: $webkit_version"
    return 0
}

# Vérifie l'environnement complet
check_environment() {
    log_header "VÉRIFICATION ENVIRONNEMENT"
    
    local errors=0
    
    check_cargo || ((errors++))
    check_node || ((errors++))
    check_webkit || ((errors++))
    
    if [ $errors -gt 0 ]; then
        log_error "$errors dépendance(s) manquante(s)"
        return 1
    fi
    
    log_success "Environnement validé"
    return 0
}

################################################################################
# Path Validation
################################################################################

# Vérifie que src-tauri existe
validate_src_tauri() {
    if [ ! -d "$SRC_TAURI" ]; then
        log_error "Répertoire src-tauri introuvable: $SRC_TAURI"
        return 1
    fi
    
    if [ ! -f "$SRC_TAURI/Cargo.toml" ]; then
        log_error "Cargo.toml introuvable dans src-tauri"
        return 1
    fi
    
    log_success "src-tauri: $SRC_TAURI"
    return 0
}

# Vérifie que package.json existe
validate_frontend() {
    if [ ! -f "$PROJECT_ROOT/package.json" ]; then
        log_error "package.json introuvable"
        return 1
    fi
    
    log_success "Frontend: $PROJECT_ROOT"
    return 0
}

################################################################################
# Build Functions
################################################################################

# Clean frontend dist
clean_frontend() {
    log_step "Nettoyage frontend dist..."
    rm -rf "$DIST" 2>/dev/null || true
    log_success "dist/ supprimé"
}

# Clean cargo target
clean_backend() {
    log_step "Nettoyage cargo target..."
    cd "$SRC_TAURI"
    cargo clean 2>/dev/null || true
    log_success "target/ nettoyé"
    cd "$PROJECT_ROOT"
}

# Install npm dependencies
install_npm_deps() {
    log_step "Installation dépendances npm..."
    cd "$PROJECT_ROOT"
    npm ci --prefer-offline --no-audit 2>&1 | grep -v "npm WARN" || true
    log_success "Dépendances npm installées"
}

# Build frontend
build_frontend() {
    log_step "Build frontend (React + Vite)..."
    cd "$PROJECT_ROOT"
    npm run build
    
    if [ ! -f "$DIST/index.html" ]; then
        log_error "dist/index.html non généré"
        return 1
    fi
    
    local dist_size=$(du -sh "$DIST" 2>/dev/null | cut -f1)
    log_success "Frontend buildé: $dist_size"
}

# Build backend
build_backend() {
    log_step "Build backend (Rust + Tauri)..."
    cd "$SRC_TAURI"
    
    # Source cargo env
    [ -f "$HOME/.cargo/env" ] && source "$HOME/.cargo/env"
    
    cargo build --release
    log_success "Backend buildé"
    cd "$PROJECT_ROOT"
}

################################################################################
# Validation Functions
################################################################################

# Vérifie que le build a réussi
validate_build() {
    log_step "Validation du build..."
    
    # Vérifier dist
    if [ ! -f "$DIST/index.html" ]; then
        log_error "Frontend build invalide"
        return 1
    fi
    
    # Vérifier binaire
    local binary="$SRC_TAURI/target/release/titane-infinity"
    if [ ! -f "$binary" ]; then
        log_error "Binaire backend introuvable"
        return 1
    fi
    
    log_success "Build validé"
}

################################################################################
# Cleanup Functions
################################################################################

# Nettoyage complet
cleanup_all() {
    log_header "NETTOYAGE COMPLET"
    clean_frontend
    clean_backend
    log_success "Nettoyage terminé"
}

################################################################################
# Export Functions
################################################################################

export -f log_info
export -f log_success
export -f log_warn
export -f log_error
export -f log_step
export -f log_header
export -f error_handler
export -f check_command
export -f check_cargo
export -f check_node
export -f check_webkit
export -f check_environment
export -f validate_src_tauri
export -f validate_frontend
export -f clean_frontend
export -f clean_backend
export -f install_npm_deps
export -f build_frontend
export -f build_backend
export -f validate_build
export -f cleanup_all

log_info "Common functions chargées"
