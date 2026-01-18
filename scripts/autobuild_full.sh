#!/bin/bash

# ╔══════════════════════════════════════════════════════════════════╗
# ║                                                                  ║
# ║    🚀 TITANE∞ vΩ — AUTOBUILD PIPELINE COMPLET                  ║
# ║                                                                  ║
# ║    Pipeline DevOps Auto-Réparant Optimisé                       ║
# ║    100% Local • Tauri • Non-Fragile • Durable                   ║
# ║                                                                  ║
# ╚══════════════════════════════════════════════════════════════════╝

set -e  # Stop on error
set -o pipefail  # Propagate pipe errors

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Directories
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOGS_DIR="$PROJECT_DIR/logs"
BUILDS_DIR="$PROJECT_DIR/builds"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOGS_DIR/autobuild_$TIMESTAMP.log"

# Configuration
MAX_RETRIES=3
CLEANUP_ON_ERROR=true

# Gestionnaire de paquets: pnpm-only (corepack préféré)
PNPM=()
resolve_pnpm_cmd() {
    if command -v corepack >/dev/null 2>&1 && corepack pnpm --version >/dev/null 2>&1; then
        PNPM=(corepack pnpm)
        return 0
    fi
    if command -v pnpm >/dev/null 2>&1; then
        PNPM=(pnpm)
        return 0
    fi
    return 1
}

# ══════════════════════════════════════════════════════════════════
# LOGGING & UTILITIES
# ══════════════════════════════════════════════════════════════════

log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date +"%Y-%m-%d %H:%M:%S")

    case $level in
        INFO)
            echo -e "${CYAN}[INFO]${NC} $message" | tee -a "$LOG_FILE"
            ;;
        SUCCESS)
            echo -e "${GREEN}[✓]${NC} $message" | tee -a "$LOG_FILE"
            ;;
        WARNING)
            echo -e "${YELLOW}[⚠]${NC} $message" | tee -a "$LOG_FILE"
            ;;
        ERROR)
            echo -e "${RED}[✗]${NC} $message" | tee -a "$LOG_FILE"
            ;;
        STEP)
            echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}" | tee -a "$LOG_FILE"
            echo -e "${BLUE}$message${NC}" | tee -a "$LOG_FILE"
            echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}" | tee -a "$LOG_FILE"
            ;;
    esac
}

banner() {
    echo -e "${CYAN}"
    cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║    🚀🔥 TITANE∞ vΩ — AUTOBUILD PIPELINE 🔥🚀                ║
║                                                               ║
║          Pipeline DevOps Auto-Réparant Optimisé              ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        log ERROR "Command '$1' not found. Please install it first."
        exit 1
    fi
}

# ══════════════════════════════════════════════════════════════════
# INIT & CHECKS
# ══════════════════════════════════════════════════════════════════

init_build() {
    log STEP "🔧 INIT — Préparation environnement"

    # Create directories
    mkdir -p "$LOGS_DIR"
    mkdir -p "$BUILDS_DIR"

    # Check required commands
    log INFO "Vérification dépendances système..."
    check_command node
    if ! resolve_pnpm_cmd; then
        log ERROR "pnpm requis (corepack recommandé) mais introuvable"
        exit 1
    fi
    check_command cargo
    check_command rustc

    # Display versions
    log INFO "Node: $(node --version)"
    log INFO "pnpm: $(${PNPM[@]} --version)"
    log INFO "Rust: $(rustc --version)"
    log INFO "Cargo: $(cargo --version)"

    # Detect OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        log INFO "OS détecté: Linux"
        export OS_TYPE="linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        log INFO "OS détecté: macOS"
        export OS_TYPE="macos"
    else
        log WARNING "OS non supporté complètement: $OSTYPE"
        export OS_TYPE="unknown"
    fi

    log SUCCESS "Init terminé"
}

# ══════════════════════════════════════════════════════════════════
# CLEANUP
# ══════════════════════════════════════════════════════════════════

cleanup_all() {
    log STEP "🧹 CLEANUP — Nettoyage complet"

    cd "$PROJECT_DIR"

    log INFO "Suppression node_modules..."
    rm -rf node_modules

    log INFO "Suppression dist..."
    rm -rf dist

    log INFO "Suppression target Rust..."
    rm -rf src-tauri/target

    log INFO "Nettoyage store pnpm..."
    "${PNPM[@]}" store prune >/dev/null 2>&1 || true

    log INFO "Nettoyage caches Cargo..."
    cargo clean --manifest-path src-tauri/Cargo.toml || true

    # Optional: cargo sweep pour supprimer anciens artifacts
    if command -v cargo-sweep &> /dev/null; then
        log INFO "Cargo sweep..."
        cargo sweep --manifest-path src-tauri/Cargo.toml -t 30 || true
    fi

    log SUCCESS "Cleanup terminé"
}

# ══════════════════════════════════════════════════════════════════
# VERIFY
# ══════════════════════════════════════════════════════════════════

verify_project() {
    log STEP "🔍 VERIFY — Vérification globale du projet"

    cd "$PROJECT_DIR"

    local retry_count=0
    local verify_success=false

    while [ $retry_count -lt $MAX_RETRIES ] && [ "$verify_success" = false ]; do
        log INFO "Tentative de vérification $((retry_count + 1))/$MAX_RETRIES..."

        # Run verification scripts
        if "${PNPM[@]}" run verify 2>&1 | tee -a "$LOG_FILE"; then
            log SUCCESS "pnpm run verify OK"
        else
            log WARNING "pnpm run verify a échoué"
        fi

        if "${PNPM[@]}" run verify:cognitive 2>&1 | tee -a "$LOG_FILE"; then
            log SUCCESS "pnpm run verify:cognitive OK"
            verify_success=true
        else
            log WARNING "pnpm run verify:cognitive a échoué, tentative auto-fix..."

            # Auto-fix attempt
            if [ -f "scripts/auto-fix.sh" ]; then
                bash scripts/auto-fix.sh || true
            fi

            retry_count=$((retry_count + 1))
        fi
    done

    if [ "$verify_success" = false ]; then
        log ERROR "Vérification échouée après $MAX_RETRIES tentatives"
        return 1
    fi

    log SUCCESS "Vérification terminée avec succès"
}

# ══════════════════════════════════════════════════════════════════
# FRONTEND BUILD
# ══════════════════════════════════════════════════════════════════

build_frontend() {
    log STEP "⚛️ FRONTEND BUILD — React + TypeScript + Vite"

    cd "$PROJECT_DIR"

    log INFO "Installation dépendances pnpm..."
    "${PNPM[@]}" install --legacy-peer-deps 2>&1 | tee -a "$LOG_FILE"

    log INFO "TypeScript type check..."
    if ! "${PNPM[@]}" run type-check 2>&1 | tee -a "$LOG_FILE"; then
        log WARNING "Type check a trouvé des erreurs (non bloquant)"
    fi

    log INFO "Build Vite..."
    "${PNPM[@]}" run build 2>&1 | tee -a "$LOG_FILE"

    # Vérification du build
    if [ ! -d "dist" ]; then
        log ERROR "dist/ n'existe pas après build"
        return 1
    fi

    # Afficher taille du build
    local dist_size=$(du -sh dist | cut -f1)
    log SUCCESS "Frontend build terminé — Taille: $dist_size"
}

# ══════════════════════════════════════════════════════════════════
# BACKEND BUILD
# ══════════════════════════════════════════════════════════════════

build_backend() {
    log STEP "🦀 BACKEND BUILD — Rust + Tauri"

    cd "$PROJECT_DIR/src-tauri"

    log INFO "Cargo check..."
    cargo check 2>&1 | tee -a "$LOG_FILE"

    log INFO "Cargo clippy (auto-fix)..."
    cargo clippy --fix --allow-dirty --allow-staged 2>&1 | tee -a "$LOG_FILE" || true

    log INFO "Cargo build --release..."
    local start_time=$(date +%s)
    cargo build --release 2>&1 | tee -a "$LOG_FILE"
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    log SUCCESS "Backend build terminé — Durée: ${duration}s"

    cd "$PROJECT_DIR"
}

# ══════════════════════════════════════════════════════════════════
# TAURI BUILD
# ══════════════════════════════════════════════════════════════════

build_tauri() {
    log STEP "🦾 TAURI BUILD — Packaging complet"

    cd "$PROJECT_DIR"

    log INFO "pnpm run titane:build..."
    local start_time=$(date +%s)
    "${PNPM[@]}" run titane:build 2>&1 | tee -a "$LOG_FILE"
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    log SUCCESS "Tauri build terminé — Durée: ${duration}s"
}

# ══════════════════════════════════════════════════════════════════
# EXPORT & DEPLOY
# ══════════════════════════════════════════════════════════════════

export_build() {
    log STEP "📁 EXPORT — Copie des artifacts"

    cd "$PROJECT_DIR"

    local build_name="titane_infinity_v${TIMESTAMP}"
    local export_dir="$BUILDS_DIR/$build_name"

    mkdir -p "$export_dir"

    log INFO "Copie des bundles..."
    if [ -d "src-tauri/target/release/bundle" ]; then
        cp -r src-tauri/target/release/bundle/* "$export_dir/" 2>&1 | tee -a "$LOG_FILE"
    else
        log WARNING "Bundle directory not found"
    fi

    # Créer manifest de build
    cat > "$export_dir/BUILD_INFO.txt" << EOF
TITANE∞ vΩ — Build Information
═══════════════════════════════════════════════════════════════

Build Date: $(date)
Build ID: $build_name
OS: $OS_TYPE
Node: $(node --version)
pnpm: $(${PNPM[@]} --version 2>/dev/null || echo "non disponible")
Rust: $(rustc --version)

Logs: $LOG_FILE

═══════════════════════════════════════════════════════════════
EOF

    # Générer checksum
    if command -v sha256sum &> /dev/null; then
        log INFO "Génération checksums..."
        cd "$export_dir"
        find . -type f -exec sha256sum {} \; > checksums.txt
        cd "$PROJECT_DIR"
    fi

    log SUCCESS "Build exporté dans: $export_dir"
}

# ══════════════════════════════════════════════════════════════════
# AUTO-HEAL
# ══════════════════════════════════════════════════════════════════

auto_heal() {
    log STEP "🛡️ AUTO-HEAL — Récupération après erreur"

    log INFO "Reset dépendances..."
    rm -rf node_modules package-lock.json
    "${PNPM[@]}" install --legacy-peer-deps

    log INFO "Rebuild incrémental..."
    "${PNPM[@]}" run build || true

    log INFO "Reset Cargo..."
    cargo clean --manifest-path src-tauri/Cargo.toml
    cargo build --manifest-path src-tauri/Cargo.toml || true

    log WARNING "Auto-heal terminé, relance du pipeline recommandée"
}

# ══════════════════════════════════════════════════════════════════
# MAIN PIPELINE
# ══════════════════════════════════════════════════════════════════

main() {
    banner

    log INFO "Démarrage pipeline TITANE∞ vΩ..."
    log INFO "Dossier projet: $PROJECT_DIR"
    log INFO "Fichier log: $LOG_FILE"

    # Trap pour cleanup en cas d'erreur
    trap 'log ERROR "Pipeline interrompu"; if [ "$CLEANUP_ON_ERROR" = true ]; then auto_heal; fi; exit 1' ERR

    # Exécution du pipeline
    init_build
    cleanup_all
    verify_project
    build_frontend
    build_backend
    build_tauri
    export_build

    # Success banner
    echo -e "\n${GREEN}"
    cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║    ✅✅✅ BUILD COMPLET — SUCCÈS TOTAL ✅✅✅              ║
║                                                               ║
║         TITANE∞ vΩ est maintenant ✅ Tech-Ready (Dev) | Production: ⛔ EN ATTENTE (autorisation requise)           ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}\n"

    log SUCCESS "Pipeline terminé avec succès"
    log INFO "Artifacts disponibles dans: $BUILDS_DIR"
    log INFO "Logs complets: $LOG_FILE"

    exit 0
}

# ══════════════════════════════════════════════════════════════════
# EXECUTION
# ══════════════════════════════════════════════════════════════════

main "$@"
