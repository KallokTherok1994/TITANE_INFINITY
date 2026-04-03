#!/bin/bash
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║         TITANE∞ MASTER INSTALL SCRIPT v1.0                                 ║
# ║         Installation complète et optimisée avec orchestrateur             ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
CORE_DIR="$SCRIPT_DIR/core"

# Options par défaut
DRY_RUN="${TITANE_DRY_RUN:-false}"
VERBOSE="${TITANE_VERBOSE:-false}"
AUTO_FIX="${TITANE_AUTO_FIX:-false}"
CLEAN_BUILD="${TITANE_CLEAN_BUILD:-false}"

# Charger les bibliothèques core
source "$CORE_DIR/lib/cache.sh"
source "$CORE_DIR/lib/telemetry.sh"
source "$CORE_DIR/orchestrator.sh"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

################################################################################
# BANNER ET UTILITAIRES
################################################################################

show_banner() {
    echo -e "${MAGENTA}"
    cat << "EOF"
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║  ████████╗██╗████████╗ █████╗ ███╗   ██╗███████╗ ∞                       ║
║  ╚══██╔══╝██║╚══██╔══╝██╔══██╗████╗  ██║██╔════╝                           ║
║     ██║   ██║   ██║   ███████║██╔██╗ ██║█████╗                             ║
║     ██║   ██║   ██║   ██╔══██║██║╚██╗██║██╔══╝                             ║
║     ██║   ██║   ██║   ██║  ██║██║ ╚████║███████╗                           ║
║     ╚═╝   ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝                           ║
║                                                                            ║
║           COMPLETE INSTALLATION & DEPLOYMENT v1.0                         ║
║           System Check → Dependencies → Build → Deploy                     ║
║                                                                            ║
╚══════════════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

log_section() {
    echo -e "\n${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${MAGENTA}  $1${NC}"
    echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}\n"
}

log_info() {
    echo -e "${BLUE}[INSTALL]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[INSTALL]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[INSTALL]${NC} $1"
}

log_error() {
    echo -e "${RED}[INSTALL]${NC} $1"
}

################################################################################
# ANALYSE INITIALE ET CONFIGURATION
################################################################################

parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --dry-run)
                DRY_RUN=true
                export ORCHESTRATOR_DRY_RUN=true
                shift
                ;;
            --verbose)
                VERBOSE=true
                shift
                ;;
            --auto-fix)
                AUTO_FIX=true
                export TITANE_AUTO_FIX=true
                shift
                ;;
            --clean)
                CLEAN_BUILD=true
                export TITANE_CLEAN_BUILD=true
                shift
                ;;
            --help|-h)
                show_usage
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
}

show_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Complete TITANE∞ installation and deployment script with intelligent orchestration.

OPTIONS:
    --dry-run       Dry run mode - show what would be done without executing
    --verbose       Enable verbose output
    --auto-fix      Automatically fix issues when possible
    --clean         Clean build (remove existing artifacts)
    --help, -h      Show this help message

ENVIRONMENT VARIABLES:
    TITANE_DRY_RUN=true          Dry run mode
    TITANE_VERBOSE=true          Verbose output
    TITANE_AUTO_FIX=true         Auto-fix enabled
    TITANE_CLEAN_BUILD=true      Clean build
    TITANE_CACHE_DIR             Custom cache directory
    TITANE_TELEMETRY_ENABLED     Enable/disable telemetry

EXAMPLES:
    $0                           # Complete installation
    $0 --dry-run                 # Preview installation
    $0 --clean --verbose         # Clean install with verbose output
    $0 --auto-fix                # Installation with auto-fixing

EOF
}

check_prerequisites() {
    log_section "🔍 PREREQUISITE CHECK"

    # Vérifier que nous sommes dans le bon répertoire
    if [[ ! -f "package.json" ]] || [[ ! -d "src-tauri" ]]; then
        log_error "Must be run from TITANE∞ project root directory"
        log_info "Current directory: $(pwd)"
        exit 1
    fi

    # Vérifier les outils de base
    local missing_tools=()
    for tool in bash mkdir echo; do
        if ! command -v "$tool" &> /dev/null; then
            missing_tools+=("$tool")
        fi
    done

    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        log_error "Missing basic tools: ${missing_tools[*]}"
        exit 1
    fi

    log_success "Prerequisites check passed"
}

show_configuration() {
    if [[ "$VERBOSE" == true ]]; then
        log_section "⚙️  CONFIGURATION"
        echo "Dry Run: $DRY_RUN"
        echo "Verbose: $VERBOSE"
        echo "Auto Fix: $AUTO_FIX"
        echo "Clean Build: $CLEAN_BUILD"
        echo "Cache Dir: ${TITANE_CACHE_DIR:-$HOME/.cache/titane-infinity}"
        echo "Telemetry: ${TITANE_TELEMETRY_ENABLED:-true}"
        echo ""
    fi
}

################################################################################
# WORKFLOW D'INSTALLATION PRINCIPAL
################################################################################

setup_installation_workflow() {
    log_section "🔧 SETUP INSTALLATION WORKFLOW"

    # Configuration des tâches d'installation
    orchestrator_register_task "system_check" "$CORE_DIR/modules/system-check.sh" "" "true"
    orchestrator_register_task "install_deps" "$CORE_DIR/modules/dependency-manager.sh" "system_check" "true"
    orchestrator_register_task "build_frontend" "$CORE_DIR/modules/build-engine.sh frontend" "install_deps" "true"
    orchestrator_register_task "build_backend" "$CORE_DIR/modules/build-engine.sh backend" "install_deps" "true"
    orchestrator_register_task "test_build" "$CORE_DIR/modules/test-engine.sh smoke" "build_frontend,build_backend" "false"
    orchestrator_register_task "deploy_local" "$CORE_DIR/modules/deploy-engine.sh local" "test_build" "true"
    orchestrator_register_task "create_shortcuts" "$CORE_DIR/modules/deploy-engine.sh shortcuts" "deploy_local" "false"

    log_success "Installation workflow configured"
}

run_installation() {
    log_section "🚀 EXECUTING INSTALLATION"

    local start_time=$(telemetry_start_timer "complete_install")

    if orchestrator_execute_workflow "complete_install"; then
        local duration=$(telemetry_stop_timer "complete_install" "$start_time")
        log_success "Installation completed successfully in ${duration}ms"
        return 0
    else
        local duration=$(telemetry_stop_timer "complete_install" "$start_time")
        log_error "Installation failed after ${duration}ms"
        return 1
    fi
}

################################################################################
# POST-INSTALLATION ET VÉRIFICATIONS
################################################################################

run_post_install_checks() {
    log_section "✅ POST-INSTALLATION CHECKS"

    local checks_passed=true

    # Vérifier que les artefacts existent
    if [[ -d "dist" ]] && [[ -f "dist/index.html" ]]; then
        log_success "Frontend build artifacts present"
    else
        log_error "Frontend build artifacts missing"
        checks_passed=false
    fi

    if [[ -f "src-tauri/target/release/titane-infinity" ]]; then
        log_success "Backend binary present"
    else
        log_error "Backend binary missing"
        checks_passed=false
    fi

    # Vérifier les bundles Tauri
    local bundle_count=$(find src-tauri/target/release/bundle -name "*.AppImage" -o -name "*.deb" 2>/dev/null | wc -l)
    if (( bundle_count > 0 )); then
        log_success "Tauri bundles created ($bundle_count found)"
    else
        log_warning "No Tauri bundles found (build may have failed)"
    fi

    # Vérifier la configuration Ollama si disponible
    if command -v ollama &> /dev/null; then
        log_success "Ollama available for AI features"
    else
        log_info "Ollama not found (AI features will use fallbacks)"
    fi

    return $((checks_passed ? 0 : 1))
}

################################################################################
# RAPPORT FINAL ET RECOMMANDATIONS
################################################################################

show_final_report() {
    log_section "📊 INSTALLATION REPORT"

    echo "🎯 TITANE∞ v26.3.0 Installation Complete"
    echo ""

    # Statistiques de cache
    cache_stats

    # Statistiques de télémétrie
    if [[ "$TITANE_TELEMETRY_ENABLED" != "false" ]]; then
        echo ""
        telemetry_get_stats "1d"
    fi

    echo ""
    echo "🚀 NEXT STEPS:"
    echo "  1. Run './titane.sh dev' to start development mode"
    echo "  2. Run './titane.sh build' to rebuild if needed"
    echo "  3. Run './titane.sh health' to check system status"
    echo "  4. Run './titane.sh analyze' to analyze scripts"
    echo ""

    echo "📁 IMPORTANT LOCATIONS:"
    echo "  Application: $(pwd)/src-tauri/target/release/bundle/"
    echo "  Frontend: $(pwd)/dist/"
    echo "  Cache: ${TITANE_CACHE_DIR:-$HOME/.cache/titane-infinity}"
    echo "  Logs: ${TITANE_CACHE_DIR:-$HOME/.cache/titane-infinity}/orchestrator/"
    echo ""

    echo "🔧 MAINTENANCE:"
    echo "  Clean cache: ./titane.sh cache --clear"
    echo "  Update: ./titane.sh update"
    echo "  Health check: ./titane.sh health"
    echo ""

    log_success "🎉 TITANE∞ is ready to use!"
}

################################################################################
# GESTION DES ERREURS ET NETTOYAGE
################################################################################

cleanup_on_failure() {
    log_section "🧹 CLEANUP AFTER FAILURE"

    log_warning "Installation failed - cleaning up partial artifacts..."

    # Nettoyer les artefacts partiels si demandé
    if [[ "${CLEAN_ON_FAILURE:-false}" == "true" ]]; then
        rm -rf dist/ 2>/dev/null || true
        rm -rf src-tauri/target/ 2>/dev/null || true
        log_info "Partial artifacts cleaned"
    fi

    # Sauvegarder les logs
    local log_backup="$REPO_ROOT/install_failure_$(date +%Y%m%d_%H%M%S).log"
    if [[ -d "${TITANE_CACHE_DIR:-$HOME/.cache/titane-infinity}" ]]; then
        cp "${TITANE_CACHE_DIR:-$HOME/.cache/titane-infinity}/orchestrator/orchestrator.log" "$log_backup" 2>/dev/null || true
        log_info "Failure logs saved to: $log_backup"
    fi

    log_error "Installation failed - check logs for details"
}

show_troubleshooting() {
    log_section "🔧 TROUBLESHOOTING"

    echo "Common issues and solutions:"
    echo ""
    echo "1. Node.js version issues:"
    echo "   - Ensure Node.js v18+ is installed"
    echo "   - Run: node --version"
    echo ""
    echo "2. Rust toolchain missing:"
    echo "   - Install Rust: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    echo "   - Run: rustc --version"
    echo ""
    echo "3. Dependencies issues:"
    echo "   - Clear cache: ./titane.sh cache --clear"
    echo "   - Reinstall: ./titane.sh install --clean"
    echo ""
    echo "4. Build failures:"
    echo "   - Check logs: ./titane.sh health --cache"
    echo "   - Clean build: ./titane.sh build --clean"
    echo ""
    echo "5. Permission issues:"
    echo "   - Ensure write access to project directory"
    echo "   - Check: ls -la"
    echo ""
    echo "For more help, run: ./titane.sh --help"
}

################################################################################
# FONCTION PRINCIPALE
################################################################################

main() {
    # Gestion des signaux
    trap cleanup_on_failure ERR

    # Démarrer télémétrie globale
    telemetry_start_timer "master_install"

    # Afficher la bannière
    show_banner

    # Parser les arguments
    parse_arguments "$@"

    # Vérifications préliminaires
    check_prerequisites

    # Afficher la configuration
    show_configuration

    # Mode dry-run
    if [[ "$DRY_RUN" == true ]]; then
        log_warning "DRY-RUN MODE: No actual changes will be made"
        export ORCHESTRATOR_DRY_RUN=true
    fi

    # Configurer le workflow d'installation
    setup_installation_workflow

    # Exécuter l'installation
    if run_installation; then
        # Vérifications post-installation
        if run_post_install_checks; then
            # Rapport final
            show_final_report

            telemetry_stop_timer "master_install"
            log_success "🎉 TITANE∞ installation completed successfully!"
            exit 0
        else
            log_error "Post-installation checks failed"
            show_troubleshooting
            exit 1
        fi
    else
        # Échec de l'installation
        cleanup_on_failure
        show_troubleshooting

        telemetry_stop_timer "master_install"
        exit 1
    fi
}

# Exécuter le script principal
main "$@"
