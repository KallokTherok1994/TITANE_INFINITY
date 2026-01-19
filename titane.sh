#!/bin/bash
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║         TITANE∞ — INTERFACE UNIFIÉE DE GESTION v1.0                         ║
# ║         Point d'entrée unique pour toutes les opérations TITANE∞           ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CORE_DIR="$SCRIPT_DIR/scripts/core"

# Charger les bibliothèques core
source "$CORE_DIR/lib/cache.sh"
source "$CORE_DIR/lib/telemetry.sh"
source "$CORE_DIR/orchestrator.sh"

# Couleurs pour output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

################################################################################
# FONCTIONS UTILITAIRES
################################################################################

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

show_banner() {
    echo -e "${MAGENTA}"
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
║           UNIFIED MANAGEMENT INTERFACE v1.0                   ║
║           Installation • Development • Deployment             ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

show_help() {
    cat << EOF
Usage: $0 <COMMAND> [OPTIONS]

TITANE∞ Unified Management Interface - Point d'entrée unique pour toutes les opérations

COMMANDS:
    install     Installation complète (dependencies + build + deploy)
    dev         Mode développement (avec Ollama)
    build       Construction de l'application
    deploy      Déploiement local
    health      Diagnostics système
    update      Mise à jour automatique
    analyze     Analyse des scripts
    cache       Gestion du cache
    clean       Nettoyage complet

INSTALL OPTIONS:
    --all       Installation complète (défaut)
    --deps      Dépendances uniquement
    --build     Build uniquement
    --deploy    Déploiement uniquement
    --dry-run   Simulation sans exécution

DEV OPTIONS:
    --ollama    Démarrer avec Ollama (défaut)
    --no-ollama Démarrer sans Ollama

BUILD OPTIONS:
    --release   Build production (défaut)
    --debug     Build debug
    --clean     Nettoyer avant build

DEPLOY OPTIONS:
    --local     Déploiement local (défaut)
    --system    Installation système
    --appimage  Format AppImage
    --deb       Format DEB

HEALTH OPTIONS:
    --full      Diagnostics complets
    --quick     Diagnostics rapides
    --cache     Statistiques cache

CACHE OPTIONS:
    --stats     Statistiques cache
    --clear     Vider le cache
    --cleanup   Nettoyer cache expiré

EXAMPLES:
    $0 install              # Installation complète
    $0 dev                  # Développement avec Ollama
    $0 build --clean        # Build propre
    $0 deploy --local       # Déploiement local
    $0 health --full        # Diagnostics complets
    $0 cache --stats        # Stats cache

CONFIGURATION:
    TITANE_CACHE_DIR        Répertoire cache personnalisé
    TITANE_TELEMETRY_ENABLED Activer/désactiver télémétrie
    ORCHESTRATOR_DRY_RUN    Mode simulation

EOF
}

################################################################################
# COMMANDES PRINCIPALES
################################################################################

cmd_install() {
    local mode="all"
    local dry_run=false

    while [[ $# -gt 0 ]]; do
        case $1 in
            --all)
                mode="all"
                shift
                ;;
            --deps)
                mode="deps"
                shift
                ;;
            --build)
                mode="build"
                shift
                ;;
            --deploy)
                mode="deploy"
                shift
                ;;
            --dry-run)
                dry_run=true
                export ORCHESTRATOR_DRY_RUN=true
                shift
                ;;
            *)
                log_error "Option inconnue: $1"
                show_help
                exit 1
                ;;
        esac
    done

    log_info "Installation mode: $mode"
    if [[ "$dry_run" == true ]]; then
        log_warning "DRY-RUN MODE - Aucune modification réelle"
    fi

    case $mode in
        all)
            orchestrator_setup_install_workflow
            orchestrator_execute_workflow "install_complete"
            ;;
        deps)
            orchestrator_register_task "install_deps" "scripts/core/modules/dependency-manager.sh" "" "true"
            orchestrator_execute_task "install_deps"
            ;;
        build)
            orchestrator_register_task "build_frontend" "scripts/core/modules/build-engine.sh frontend" "" "true"
            orchestrator_register_task "build_backend" "scripts/core/modules/build-engine.sh backend" "" "true"
            orchestrator_execute_task "build_frontend"
            orchestrator_execute_task "build_backend"
            ;;
        deploy)
            orchestrator_register_task "deploy_local" "scripts/core/modules/deploy-engine.sh local" "" "true"
            orchestrator_execute_task "deploy_local"
            ;;
    esac
}

cmd_dev() {
    local with_ollama=true

    while [[ $# -gt 0 ]]; do
        case $1 in
            --ollama)
                with_ollama=true
                shift
                ;;
            --no-ollama)
                with_ollama=false
                shift
                ;;
            *)
                log_error "Option inconnue: $1"
                show_help
                exit 1
                ;;
        esac
    done

    if [[ "$with_ollama" == true ]]; then
        log_info "Starting development environment with Ollama"
        orchestrator_setup_dev_workflow
        orchestrator_execute_workflow "dev_with_ollama"
    else
        log_info "Starting development environment without Ollama"
        orchestrator_register_task "dev_servers" "scripts/dev/full_local_tauri_ollama.sh --no-ollama" "" "false"
        orchestrator_execute_task "dev_servers"
    fi
}

cmd_build() {
    local mode="release"
    local clean=false

    while [[ $# -gt 0 ]]; do
        case $1 in
            --release)
                mode="release"
                shift
                ;;
            --debug)
                mode="debug"
                shift
                ;;
            --clean)
                clean=true
                shift
                ;;
            *)
                log_error "Option inconnue: $1"
                show_help
                exit 1
                ;;
        esac
    done

    if [[ "$clean" == true ]]; then
        log_info "Cleaning before build..."
        rm -rf dist/ src-tauri/target/
    fi

    log_info "Building in $mode mode"
    orchestrator_register_task "build_app" "scripts/build_titane.sh $mode" "" "true"
    orchestrator_execute_task "build_app"
}

cmd_deploy() {
    local target="local"

    while [[ $# -gt 0 ]]; do
        case $1 in
            --local)
                target="local"
                shift
                ;;
            --system)
                target="system"
                shift
                ;;
            --appimage)
                target="appimage"
                shift
                ;;
            --deb)
                target="deb"
                shift
                ;;
            *)
                log_error "Option inconnue: $1"
                show_help
                exit 1
                ;;
        esac
    done

    log_info "Deploying to $target"
    case $target in
        local)
            orchestrator_register_task "deploy_local" "scripts/deploy_titane.sh" "" "true"
            orchestrator_execute_task "deploy_local"
            ;;
        system)
            orchestrator_register_task "deploy_system" "scripts/deploy-complete.sh --install" "" "true"
            orchestrator_execute_task "deploy_system"
            ;;
        appimage)
            orchestrator_register_task "deploy_appimage" "scripts/deploy_titane.sh appimage" "" "true"
            orchestrator_execute_task "deploy_appimage"
            ;;
        deb)
            orchestrator_register_task "deploy_deb" "scripts/deploy_titane.sh deb" "" "true"
            orchestrator_execute_task "deploy_deb"
            ;;
    esac
}

cmd_health() {
    local level="quick"

    while [[ $# -gt 0 ]]; do
        case $1 in
            --full)
                level="full"
                shift
                ;;
            --quick)
                level="quick"
                shift
                ;;
            --cache)
                level="cache"
                shift
                ;;
            *)
                log_error "Option inconnue: $1"
                show_help
                exit 1
                ;;
        esac
    done

    case $level in
        full)
            log_info "Running full health diagnostics"
            orchestrator_register_task "health_check" "scripts/titane_autofix.sh" "" "false"
            orchestrator_execute_task "health_check"
            ;;
        quick)
            log_info "Running quick health check"
            orchestrator_register_task "quick_health" "scripts/quick-boot-test.sh" "" "false"
            orchestrator_execute_task "quick_health"
            ;;
        cache)
            log_info "Cache health statistics"
            cache_stats
            ;;
    esac
}

cmd_update() {
    log_info "Checking for updates..."
    orchestrator_register_task "update_check" "scripts/auto/update-check.sh" "" "false"
    orchestrator_register_task "update_apply" "scripts/auto/update-apply.sh" "update_check" "true"
    orchestrator_execute_task "update_check"
    orchestrator_execute_task "update_apply"
}

cmd_analyze() {
    log_info "Analyzing scripts..."
    "$CORE_DIR/simple-analyzer.sh"
}

cmd_cache() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --stats)
                cache_stats
                shift
                ;;
            --clear)
                cache_clear_all
                log_success "Cache cleared"
                shift
                ;;
            --cleanup)
                cache_cleanup_expired
                log_success "Cache cleaned"
                shift
                ;;
            *)
                log_error "Option inconnue: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

cmd_clean() {
    log_warning "Cleaning all build artifacts and cache..."
    rm -rf node_modules dist src-tauri/target .vite
    cache_clear_all
    log_success "Clean completed"
}

################################################################################
# FONCTION PRINCIPALE
################################################################################

main() {
    # Vérifier que nous sommes dans le bon répertoire
    if [[ ! -f "package.json" ]] || [[ ! -d "src-tauri" ]]; then
        log_error "This script must be run from the TITANE∞ project root directory"
        exit 1
    fi

    # Afficher la bannière
    show_banner

    # Parser les arguments
    if [[ $# -eq 0 ]]; then
        show_help
        exit 0
    fi

    local command="$1"
    shift

    # Démarrer télémétrie
    telemetry_start_timer "titane_command_$command"

    case $command in
        install)
            cmd_install "$@"
            ;;
        dev)
            cmd_dev "$@"
            ;;
        build)
            cmd_build "$@"
            ;;
        deploy)
            cmd_deploy "$@"
            ;;
        health)
            cmd_health "$@"
            ;;
        update)
            cmd_update "$@"
            ;;
        analyze)
            cmd_analyze "$@"
            ;;
        cache)
            cmd_cache "$@"
            ;;
        clean)
            cmd_clean "$@"
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac

    # Finaliser télémétrie
    telemetry_stop_timer "titane_command_$command"
}

################################################################################
# EXÉCUTION
################################################################################

# Gestion des erreurs
trap 'log_error "Command failed with exit code $?"; exit 1' ERR

# Exécuter la commande principale
main "$@"
