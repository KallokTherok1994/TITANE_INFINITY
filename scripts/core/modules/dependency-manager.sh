#!/bin/bash
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║         TITANE∞ CORE MODULE — DEPENDENCY MANAGER v1.0                      ║
# ║         Gestion intelligente des dépendances Node.js et Rust               ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
REPO_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
CACHE_KEY_PREFIX="dependency_manager"

# Charger les bibliothèques core
source "$SCRIPT_DIR/lib/cache.sh"
source "$SCRIPT_DIR/lib/telemetry.sh"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

################################################################################
# UTILITAIRES
################################################################################

log_info() {
    echo -e "${BLUE}[DEPS]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[DEPS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[DEPS]${NC} $1"
}

log_error() {
    echo -e "${RED}[DEPS]${NC} $1"
}

################################################################################
# GESTION DES DÉPENDANCES NODE.JS
################################################################################

check_pnpm_availability() {
    # Essayer corepack d'abord
    if command -v corepack &> /dev/null; then
        if corepack pnpm --version &> /dev/null; then
            echo "corepack"
            return 0
        fi
    fi

    # Puis pnpm direct
    if command -v pnpm &> /dev/null; then
        echo "pnpm"
        return 0
    fi

    # Enfin npm comme fallback
    if command -v npm &> /dev/null; then
        echo "npm"
        return 0
    fi

    return 1
}

setup_pnpm() {
    log_info "Setting up pnpm..."

    # Activer corepack si disponible
    if command -v corepack &> /dev/null; then
        log_info "Enabling corepack..."
        corepack enable 2>/dev/null || log_warning "corepack enable failed (non-critical)"
    fi

    # Installer pnpm via corepack si nécessaire
    if ! command -v pnpm &> /dev/null && command -v corepack &> /dev/null; then
        log_info "Installing pnpm via corepack..."
        corepack prepare pnpm@latest --activate 2>/dev/null || {
            log_warning "corepack pnpm install failed, trying direct install..."
            npm install -g pnpm 2>/dev/null || {
                log_error "Failed to install pnpm"
                return 1
            }
        }
    fi

    # Vérifier que pnpm fonctionne
    if pnpm --version &> /dev/null; then
        log_success "pnpm ready: $(pnpm --version)"
        return 0
    else
        log_error "pnpm setup failed"
        return 1
    fi
}

install_node_dependencies() {
    local package_manager
    package_manager=$(check_pnpm_availability)

    case "$package_manager" in
        corepack|pnpm)
            install_with_pnpm
            ;;
        npm)
            log_warning "pnpm not available, falling back to npm"
            install_with_npm
            ;;
        *)
            log_error "No package manager available"
            return 1
            ;;
    esac
}

install_with_pnpm() {
    log_info "Installing Node.js dependencies with pnpm..."

    cd "$REPO_ROOT"

    # Nettoyer node_modules si demandé
    if [[ "${CLEAN_DEPS:-false}" == "true" ]]; then
        log_info "Cleaning existing node_modules..."
        rm -rf node_modules
    fi

    # Installer avec cache si disponible
    local install_cmd="pnpm install"

    if [[ -f "pnpm-lock.yaml" ]]; then
        install_cmd="$install_cmd --frozen-lockfile"
        log_info "Using frozen lockfile for reproducible builds"
    fi

    # Démarrer télémétrie
    telemetry_start_timer "pnpm_install"

    if $install_cmd; then
        telemetry_stop_timer "pnpm_install"
        log_success "Node.js dependencies installed successfully"

        # Vérifier le nombre de packages installés
        local package_count=$(find node_modules -maxdepth 1 -type d 2>/dev/null | wc -l)
        log_info "Installed packages: $((package_count - 1))"

        return 0
    else
        telemetry_stop_timer "pnpm_install"
        log_error "Failed to install Node.js dependencies"
        return 1
    fi
}

install_with_npm() {
    log_info "Installing Node.js dependencies with npm..."

    cd "$REPO_ROOT"

    # Démarrer télémétrie
    telemetry_start_timer "npm_install"

    if npm install; then
        telemetry_stop_timer "npm_install"
        log_success "Node.js dependencies installed with npm"
        return 0
    else
        telemetry_stop_timer "npm_install"
        log_error "Failed to install Node.js dependencies with npm"
        return 1
    fi
}

audit_dependencies() {
    log_info "Auditing dependencies for security issues..."

    cd "$REPO_ROOT"

    local package_manager
    package_manager=$(check_pnpm_availability)

    case "$package_manager" in
        corepack|pnpm)
            if pnpm audit &> /dev/null; then
                log_success "Dependency audit passed"
                return 0
            else
                log_warning "Security vulnerabilities found in dependencies"
                if [[ "${AUTO_FIX:-false}" == "true" ]]; then
                    log_info "Attempting to fix vulnerabilities..."
                    pnpm audit fix 2>/dev/null || log_warning "Could not auto-fix all vulnerabilities"
                fi
                return 0  # Non-blocking
            fi
            ;;
        npm)
            if npm audit &> /dev/null; then
                log_success "Dependency audit passed (npm)"
                return 0
            else
                log_warning "Security issues found (npm)"
                return 0  # Non-blocking
            fi
            ;;
    esac
}

################################################################################
# GESTION DES DÉPENDANCES RUST
################################################################################

install_rust_dependencies() {
    log_info "Installing Rust dependencies..."

    cd "$REPO_ROOT/src-tauri"

    # Vérifier que Cargo.toml existe
    if [[ ! -f "Cargo.toml" ]]; then
        log_error "Cargo.toml not found in src-tauri/"
        return 1
    fi

    # Nettoyer si demandé
    if [[ "${CLEAN_DEPS:-false}" == "true" ]]; then
        log_info "Cleaning Rust target directory..."
        cargo clean
    fi

    # Démarrer télémétrie
    telemetry_start_timer "cargo_update"

    # Mettre à jour les dépendances
    if cargo update; then
        telemetry_stop_timer "cargo_update"
        log_success "Rust dependencies updated"

        # Vérifier et résoudre les dépendances
        telemetry_start_timer "cargo_check"
        if cargo check; then
            telemetry_stop_timer "cargo_check"
            log_success "Rust dependencies resolved successfully"
            return 0
        else
            telemetry_stop_timer "cargo_check"
            log_error "Failed to resolve Rust dependencies"
            return 1
        fi
    else
        telemetry_stop_timer "cargo_update"
        log_error "Failed to update Rust dependencies"
        return 1
    fi
}

################################################################################
# VÉRIFICATIONS POST-INSTALLATION
################################################################################

verify_node_dependencies() {
    log_info "Verifying Node.js dependencies..."

    cd "$REPO_ROOT"

    # Vérifier que node_modules existe
    if [[ ! -d "node_modules" ]]; then
        log_error "node_modules directory not found"
        return 1
    fi

    # Vérifier quelques packages critiques
    local critical_packages=(
        "@tauri-apps/api"
        "react"
        "react-dom"
        "@tanstack/react-query"
    )

    local missing_packages=()

    for package in "${critical_packages[@]}"; do
        if [[ ! -d "node_modules/$package" ]]; then
            missing_packages+=("$package")
        fi
    done

    if [[ ${#missing_packages[@]} -eq 0 ]]; then
        log_success "All critical Node.js packages installed"
        return 0
    else
        log_error "Missing critical packages: ${missing_packages[*]}"
        return 1
    fi
}

verify_rust_dependencies() {
    log_info "Verifying Rust dependencies..."

    cd "$REPO_ROOT/src-tauri"

    # Vérifier que Cargo.lock existe
    if [[ ! -f "Cargo.lock" ]]; then
        log_error "Cargo.lock not found - dependencies not resolved"
        return 1
    fi

    # Vérifier que les crates critiques sont présentes
    local critical_crates=(
        "tauri"
        "serde"
    )

    local lock_content=$(cat Cargo.lock 2>/dev/null || echo "")

    local missing_crates=()
    for crate in "${critical_crates[@]}"; do
        if ! echo "$lock_content" | grep -q "^name = \"$crate\""; then
            missing_crates+=("$crate")
        fi
    done

    if [[ ${#missing_crates[@]} -eq 0 ]]; then
        log_success "All critical Rust crates resolved"
        return 0
    else
        log_error "Missing critical crates: ${missing_crates[*]}"
        return 1
    fi
}

################################################################################
# OPTIMISATIONS ET NETTOYAGE
################################################################################

optimize_dependencies() {
    log_info "Optimizing dependencies..."

    cd "$REPO_ROOT"

    # Nettoyer le cache pnpm si disponible
    local package_manager
    package_manager=$(check_pnpm_availability)

    case "$package_manager" in
        corepack|pnpm)
            log_info "Cleaning pnpm cache..."
            pnpm store prune 2>/dev/null || log_warning "pnpm cache cleanup failed"
            ;;
    esac

    # Nettoyer le cache Rust
    log_info "Cleaning Rust cache..."
    if command -v cargo &> /dev/null; then
        cargo cache --autoclean 2>/dev/null || log_warning "cargo cache cleanup failed"
    fi

    log_success "Dependency optimization completed"
}

################################################################################
# FONCTIONS PRINCIPALES
################################################################################

install_all_dependencies() {
    log_info "Starting complete dependency installation..."
    echo ""

    # Installer pnpm si nécessaire
    setup_pnpm || return 1

    # Installer les dépendances Node.js
    install_node_dependencies || return 1

    # Auditer les dépendances
    audit_dependencies

    # Installer les dépendances Rust
    install_rust_dependencies || return 1

    echo ""

    # Vérifications finales
    verify_node_dependencies || return 1
    verify_rust_dependencies || return 1

    echo ""

    # Optimisations
    optimize_dependencies

    log_success "All dependencies installed and verified successfully"
    return 0
}

install_node_only() {
    log_info "Installing Node.js dependencies only..."

    setup_pnpm || return 1
    install_node_dependencies || return 1
    audit_dependencies
    verify_node_dependencies || return 1

    log_success "Node.js dependencies ready"
}

install_rust_only() {
    log_info "Installing Rust dependencies only..."

    install_rust_dependencies || return 1
    verify_rust_dependencies || return 1

    log_success "Rust dependencies ready"
}

################################################################################
# EXÉCUTION PRINCIPALE
################################################################################

main() {
    local mode="${1:-all}"

    case "$mode" in
        all)
            install_all_dependencies
            ;;
        node)
            install_node_only
            ;;
        rust)
            install_rust_only
            ;;
        *)
            log_error "Unknown mode: $mode"
            echo "Usage: $0 [all|node|rust]"
            exit 1
            ;;
    esac
}

# Démarrer télémétrie globale
telemetry_start_timer "dependency_install"

# Exécuter
main "$@"

# Finaliser télémétrie
telemetry_stop_timer "dependency_install"
