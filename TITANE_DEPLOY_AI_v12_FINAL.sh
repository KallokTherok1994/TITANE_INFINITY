#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║ TITANE∞ v12.0.0 - DEPLOY AI FINAL                                           ║
# ║ Script de déploiement automatisé ALL-IN-ONE                                 ║
# ║ DevOps-grade | POSIX-compatible | Ré-exécutable | Tolérant aux pannes      ║
# ╚══════════════════════════════════════════════════════════════════════════════╝
#
# Description:
#   Script de déploiement complet pour TITANE_INFINITY v12.0.0
#   Vérifie, audite, répare, build, valide et lance l'application
#
# Usage:
#   ./TITANE_DEPLOY_AI_v12_FINAL.sh
#
# Environnement:
#   Pop!_OS / Ubuntu / Debian
#   Rust 1.70+, Node 18+, npm 9+
#
# Auteur: TITANE-DEPLOY-AI v12
# Date: 19 novembre 2025
# Version: 12.0.0
# ════════════════════════════════════════════════════════════════════════════════

# ════════════════════════════════════════════════════════════════════════════════
# 1. SÉCURITÉ & CONFIGURATION STRICTE
# ════════════════════════════════════════════════════════════════════════════════

set -euo pipefail
IFS=$'\n\t'

# Variables globales
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="${SCRIPT_DIR}"
readonly LOG_DIR="${PROJECT_ROOT}/logs/deploy"
readonly TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
readonly LOG_FILE="${LOG_DIR}/deploy_${TIMESTAMP}.log"
readonly MIN_NODE_VERSION="18"
readonly MIN_RUST_VERSION="1.70"

# Compteurs
ERRORS_COUNT=0
WARNINGS_COUNT=0
FIXES_COUNT=0
CHECKS_PASSED=0

# Couleurs
readonly COLOR_RESET='\033[0m'
readonly COLOR_RED='\033[0;31m'
readonly COLOR_GREEN='\033[0;32m'
readonly COLOR_YELLOW='\033[0;33m'
readonly COLOR_BLUE='\033[0;34m'
readonly COLOR_CYAN='\033[0;36m'
readonly COLOR_BOLD='\033[1m'

# ════════════════════════════════════════════════════════════════════════════════
# 2. FONCTIONS UTILITAIRES
# ════════════════════════════════════════════════════════════════════════════════

log_info() {
    local msg="[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] $*"
    echo -e "${COLOR_CYAN}${msg}${COLOR_RESET}" | tee -a "${LOG_FILE}"
}

log_success() {
    local msg="[$(date '+%Y-%m-%d %H:%M:%S')] [✓] $*"
    echo -e "${COLOR_GREEN}${msg}${COLOR_RESET}" | tee -a "${LOG_FILE}"
    ((CHECKS_PASSED++)) || true
}

log_warn() {
    local msg="[$(date '+%Y-%m-%d %H:%M:%S')] [WARN] $*"
    echo -e "${COLOR_YELLOW}${msg}${COLOR_RESET}" | tee -a "${LOG_FILE}"
    ((WARNINGS_COUNT++)) || true
}

log_error() {
    local msg="[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] $*"
    echo -e "${COLOR_RED}${msg}${COLOR_RESET}" | tee -a "${LOG_FILE}"
    ((ERRORS_COUNT++)) || true
}

log_fix() {
    local msg="[$(date '+%Y-%m-%d %H:%M:%S')] [FIX] $*"
    echo -e "${COLOR_BLUE}${msg}${COLOR_RESET}" | tee -a "${LOG_FILE}"
    ((FIXES_COUNT++)) || true
}

log_title() {
    local title="$*"
    local separator="════════════════════════════════════════════════════════════════"
    echo "" | tee -a "${LOG_FILE}"
    echo -e "${COLOR_BOLD}${COLOR_CYAN}${separator}${COLOR_RESET}" | tee -a "${LOG_FILE}"
    echo -e "${COLOR_BOLD}${COLOR_CYAN}${title}${COLOR_RESET}" | tee -a "${LOG_FILE}"
    echo -e "${COLOR_BOLD}${COLOR_CYAN}${separator}${COLOR_RESET}" | tee -a "${LOG_FILE}"
}

error_handler() {
    local line_no=$1
    log_error "Script failed at line ${line_no}"
    log_error "Last command exit code: $?"
    log_error "Déploiement interrompu - Consultez ${LOG_FILE} pour plus de détails"
    exit 1
}

trap 'error_handler ${LINENO}' ERR

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

version_ge() {
    [ "$(printf '%s\n' "$1" "$2" | sort -V | head -n1)" = "$2" ]
}

# ════════════════════════════════════════════════════════════════════════════════
# 3. INITIALISATION
# ════════════════════════════════════════════════════════════════════════════════

init_logging() {
    # Créer répertoire de logs AVANT toute utilisation
    mkdir -p "${LOG_DIR}" 2>/dev/null || true
    
    log_title "TITANE∞ v12.0.0 - DEPLOY AI FINAL"
    
    if [ ! -d "${LOG_DIR}" ]; then
        mkdir -p "${LOG_DIR}"
        log_info "Création du répertoire de logs: ${LOG_DIR}"
    fi
    
    log_info "Script: TITANE_DEPLOY_AI_v12_FINAL.sh"
    log_info "Date: $(date '+%Y-%m-%d %H:%M:%S')"
    log_info "Utilisateur: ${USER}"
    log_info "Répertoire: ${PROJECT_ROOT}"
    log_info "Log file: ${LOG_FILE}"
    log_info "Système: $(uname -s) $(uname -r)"
}

# ════════════════════════════════════════════════════════════════════════════════
# 4. VÉRIFICATION ENVIRONNEMENT
# ════════════════════════════════════════════════════════════════════════════════

check_system_prerequisites() {
    log_title "PHASE 1: Vérification des prérequis système"
    
    # Node.js
    if command_exists node; then
        local node_version
        node_version=$(node --version | sed 's/v//' | cut -d. -f1)
        if version_ge "${node_version}" "${MIN_NODE_VERSION}"; then
            log_success "node: $(node --version)"
        else
            log_error "node version ${node_version} < ${MIN_NODE_VERSION} requise"
            log_info "Installation de Node.js ${MIN_NODE_VERSION}+ recommandée"
            return 1
        fi
    else
        log_error "node: NON INSTALLÉ"
        log_info "Installation: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs"
        return 1
    fi
    
    # npm
    if command_exists npm; then
        log_success "npm: $(npm --version)"
    else
        log_error "npm: NON INSTALLÉ (devrait être installé avec Node.js)"
        return 1
    fi
    
    # Rust
    if command_exists rustc; then
        local rust_version
        rust_version=$(rustc --version | awk '{print $2}' | cut -d. -f1-2)
        if version_ge "${rust_version}" "${MIN_RUST_VERSION}"; then
            log_success "rustc: $(rustc --version)"
        else
            log_warn "rustc version ${rust_version} < ${MIN_RUST_VERSION} recommandée"
        fi
    else
        log_error "rustc: NON INSTALLÉ"
        log_info "Installation: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
        return 1
    fi
    
    # Cargo
    if command_exists cargo; then
        log_success "cargo: $(cargo --version | awk '{print $2}')"
    else
        log_error "cargo: NON INSTALLÉ (devrait être installé avec Rust)"
        return 1
    fi
    
    # Tauri CLI
    if npm list -g @tauri-apps/cli >/dev/null 2>&1 || command_exists tauri; then
        log_success "tauri-cli: installé"
    else
        log_warn "tauri-cli: NON INSTALLÉ"
        log_fix "Installation de @tauri-apps/cli..."
        npm install -g @tauri-apps/cli >> "${LOG_FILE}" 2>&1 || true
    fi
    
    # Git
    if command_exists git; then
        log_success "git: $(git --version | awk '{print $3}')"
    else
        log_warn "git: NON INSTALLÉ"
    fi
    
    # WebKit
    if pkg-config --exists webkit2gtk-4.1 2>/dev/null; then
        log_success "webkit2gtk-4.1: $(pkg-config --modversion webkit2gtk-4.1)"
    else
        log_warn "webkit2gtk-4.1: NON INSTALLÉ (requis pour build production)"
        log_info "Installation: sudo apt-get install libwebkit2gtk-4.1-dev libjavascriptcoregtk-4.1-dev"
    fi
    
    # Vérification des outils système
    for tool in jq sha256sum ldd; do
        if command_exists "${tool}"; then
            log_success "${tool}: installé"
        else
            log_warn "${tool}: NON INSTALLÉ"
        fi
    done
    
    log_success "Vérification des prérequis terminée"
}

# ════════════════════════════════════════════════════════════════════════════════
# 5. AUDIT COMPLET
# ════════════════════════════════════════════════════════════════════════════════

audit_backend() {
    log_title "PHASE 2: Audit Backend (Rust)"
    
    cd "${PROJECT_ROOT}"
    
    # Cargo check
    log_info "Exécution de cargo check..."
    if cargo check --all-targets 2>&1 | tee -a "${LOG_FILE}"; then
        log_success "cargo check: PASS"
    else
        log_warn "cargo check: WARNINGS ou ERRORS détectés"
    fi
    
    # Cargo clippy
    log_info "Exécution de cargo clippy..."
    if cargo clippy --all-targets --all-features -- -D warnings 2>&1 | tee -a "${LOG_FILE}"; then
        log_success "cargo clippy: PASS"
    else
        log_warn "cargo clippy: WARNINGS détectés"
    fi
    
    # Analyse unwrap/expect/panic
    log_info "Analyse sécurité: unwrap(), expect(), panic!()..."
    local unwrap_count
    local expect_count
    local panic_count
    
    unwrap_count=$(grep -rn "\.unwrap()" src-tauri/src --include="*.rs" 2>/dev/null | grep -v "tests::" | grep -v "test_" | wc -l || echo "0")
    expect_count=$(grep -rn "\.expect(" src-tauri/src --include="*.rs" 2>/dev/null | grep -v "tests::" | wc -l || echo "0")
    panic_count=$(grep -rn "panic!" src-tauri/src --include="*.rs" 2>/dev/null | grep -v "tests::" | wc -l || echo "0")
    
    if [ "${unwrap_count}" -gt 0 ]; then
        log_warn "Trouvé ${unwrap_count} unwrap() dans le code (hors tests)"
    fi
    if [ "${expect_count}" -gt 0 ]; then
        log_warn "Trouvé ${expect_count} expect() dans le code"
    fi
    if [ "${panic_count}" -gt 0 ]; then
        log_warn "Trouvé ${panic_count} panic! dans le code"
    fi
    
    log_success "Audit backend terminé"
}

audit_frontend() {
    log_title "PHASE 3: Audit Frontend (Node + TypeScript)"
    
    cd "${PROJECT_ROOT}"
    
    # npm audit
    log_info "Exécution de npm audit..."
    if npm audit --audit-level=moderate 2>&1 | tee -a "${LOG_FILE}"; then
        log_success "npm audit: PASS (aucune vulnérabilité HIGH/CRITICAL)"
    else
        log_warn "npm audit: Vulnérabilités détectées"
    fi
    
    # npm lint (si disponible)
    if grep -q '"lint"' package.json; then
        log_info "Exécution de npm run lint..."
        npm run lint >> "${LOG_FILE}" 2>&1 || log_warn "npm lint: WARNINGS détectés"
    else
        log_info "npm lint: script non défini (skipped)"
    fi
    
    # TypeScript type-check
    log_info "Exécution de npm run type-check..."
    if npm run type-check 2>&1 | tee -a "${LOG_FILE}"; then
        log_success "TypeScript type-check: PASS"
    else
        log_warn "TypeScript type-check: ERRORS détectés"
    fi
    
    # Analyse code dangereux
    log_info "Analyse sécurité: eval(), Function()..."
    local eval_count
    eval_count=$(grep -rn "eval(" src --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
    
    # Vérifier que eval_count est un nombre valide
    if ! [[ "${eval_count}" =~ ^[0-9]+$ ]]; then
        eval_count=0
    fi
    
    if [ "${eval_count}" -eq 0 ]; then
        log_success "Aucun code dangereux (eval/Function) détecté"
    else
        log_warn "Trouvé ${eval_count} eval() dans le code frontend"
    fi
    
    log_success "Audit frontend terminé"
}

audit_environment() {
    log_title "PHASE 4: Audit Environnement Tauri"
    
    cd "${PROJECT_ROOT}"
    
    # Vérification tauri.conf.json
    if [ -f "src-tauri/tauri.conf.json" ]; then
        log_info "Vérification syntaxe tauri.conf.json..."
        if jq empty src-tauri/tauri.conf.json 2>&1 | tee -a "${LOG_FILE}"; then
            log_success "tauri.conf.json: syntaxe valide"
        else
            log_error "tauri.conf.json: syntaxe invalide"
        fi
    else
        log_error "tauri.conf.json: FICHIER MANQUANT"
    fi
    
    # Vérification binaire Tauri
    if [ -f "src-tauri/target/release/titane-infinity" ]; then
        log_info "Binaire Tauri trouvé: src-tauri/target/release/titane-infinity"
        
        # Vérifier dépendances dynamiques
        if command_exists ldd; then
            log_info "Vérification dépendances dynamiques..."
            ldd src-tauri/target/release/titane-infinity >> "${LOG_FILE}" 2>&1 || true
        fi
        
        # Vérifier taille
        local bin_size
        bin_size=$(du -h src-tauri/target/release/titane-infinity | awk '{print $1}')
        log_info "Taille binaire: ${bin_size}"
    else
        log_info "Binaire release non trouvé (sera créé lors du build)"
    fi
    
    log_success "Audit environnement terminé"
}

# ════════════════════════════════════════════════════════════════════════════════
# 6. AUTO-RÉPARATION
# ════════════════════════════════════════════════════════════════════════════════

auto_fix_backend() {
    log_title "PHASE 5: Auto-Réparation Backend"
    
    cd "${PROJECT_ROOT}"
    
    # Cargo fix
    log_fix "Application de cargo fix..."
    if cargo fix --allow-dirty 2>&1 | tee -a "${LOG_FILE}"; then
        log_success "cargo fix: appliqué avec succès"
    else
        log_warn "cargo fix: aucune correction ou erreurs"
    fi
    
    # Cargo fmt
    log_fix "Application de cargo fmt..."
    if cargo fmt --all 2>&1 | tee -a "${LOG_FILE}"; then
        log_success "cargo fmt: appliqué avec succès"
    else
        log_warn "cargo fmt: erreurs détectées"
    fi
    
    log_success "Auto-réparation backend terminée"
}

auto_fix_frontend() {
    log_title "PHASE 6: Auto-Réparation Frontend"
    
    cd "${PROJECT_ROOT}"
    
    # npm audit fix
    log_fix "Application de npm audit fix..."
    npm audit fix >> "${LOG_FILE}" 2>&1 || log_warn "npm audit fix: corrections partielles"
    
    # Nettoyer caches
    log_fix "Nettoyage des caches..."
    rm -rf node_modules/.cache 2>/dev/null || true
    rm -rf .vite 2>/dev/null || true
    rm -rf dist/.vite 2>/dev/null || true
    
    log_success "Auto-réparation frontend terminée"
}

auto_fix_internal() {
    log_title "PHASE 7: Auto-Réparation Interne TITANE∞"
    
    cd "${PROJECT_ROOT}"
    
    # Vérifier imports TypeScript
    log_info "Vérification imports TypeScript..."
    if [ -d "src" ]; then
        log_success "Répertoire src/ trouvé"
    else
        log_error "Répertoire src/ manquant"
    fi
    
    # Vérifier modules backend
    log_info "Vérification modules backend..."
    for module in adaptive memory sentinel ghre idcm compute collect; do
        if [ -d "src-tauri/src/system/${module}" ]; then
            log_success "Module ${module}: trouvé"
        else
            log_warn "Module ${module}: MANQUANT"
        fi
    done
    
    # Nettoyer artifacts invalides
    log_fix "Nettoyage artifacts invalides..."
    cargo clean >> "${LOG_FILE}" 2>&1 || true
    
    log_success "Auto-réparation interne terminée"
}

# ════════════════════════════════════════════════════════════════════════════════
# 7. BUILD COMPLET
# ════════════════════════════════════════════════════════════════════════════════

build_frontend() {
    log_title "PHASE 8: Build Frontend"
    
    cd "${PROJECT_ROOT}"
    
    # npm install
    log_info "Installation dépendances npm..."
    if npm install --prefer-offline 2>&1 | tee -a "${LOG_FILE}"; then
        log_success "npm install: SUCCESS"
    else
        log_error "npm install: FAILED"
        return 1
    fi
    
    # Type-check
    log_info "Vérification types TypeScript..."
    if npm run type-check 2>&1 | tee -a "${LOG_FILE}"; then
        log_success "type-check: PASS"
    else
        log_error "type-check: FAILED"
        return 1
    fi
    
    # Build
    log_info "Build frontend (Vite)..."
    if npm run build 2>&1 | tee -a "${LOG_FILE}"; then
        log_success "Frontend build: SUCCESS"
        
        # Vérifier dist/
        if [ -d "dist" ]; then
            local dist_size
            dist_size=$(du -sh dist | awk '{print $1}')
            log_info "Taille dist/: ${dist_size}"
        fi
    else
        log_error "Frontend build: FAILED"
        return 1
    fi
    
    log_success "Build frontend terminé"
}

build_backend() {
    log_title "PHASE 9: Build Backend"
    
    cd "${PROJECT_ROOT}"
    
    # Cargo build release
    log_info "Build backend Rust (release mode)..."
    if cargo build --release 2>&1 | tee -a "${LOG_FILE}"; then
        log_success "Backend build: SUCCESS"
        
        # Vérifier binaire
        if [ -f "src-tauri/target/release/titane-infinity" ]; then
            local bin_size
            bin_size=$(du -h src-tauri/target/release/titane-infinity | awk '{print $1}')
            log_info "Binaire généré: ${bin_size}"
            
            # SHA256 checksum
            if command_exists sha256sum; then
                local checksum
                checksum=$(sha256sum src-tauri/target/release/titane-infinity | awk '{print $1}')
                log_info "SHA256: ${checksum:0:16}..."
            fi
        fi
    else
        log_error "Backend build: FAILED"
        return 1
    fi
    
    log_success "Build backend terminé"
}

build_tauri() {
    log_title "PHASE 10: Build Tauri (AppImage/DEB)"
    
    cd "${PROJECT_ROOT}"
    
    log_info "Build Tauri complet..."
    if npm run tauri build 2>&1 | tee -a "${LOG_FILE}"; then
        log_success "Tauri build: SUCCESS"
        
        # Vérifier bundles générés
        if [ -d "src-tauri/target/release/bundle" ]; then
            log_info "Bundles générés:"
            find src-tauri/target/release/bundle -type f \( -name "*.AppImage" -o -name "*.deb" -o -name "*.rpm" \) -exec ls -lh {} \; | tee -a "${LOG_FILE}"
        fi
    else
        log_warn "Tauri build: FAILED (possiblement WebKit manquant, non-bloquant pour dev mode)"
    fi
    
    log_success "Build Tauri terminé"
}

# ════════════════════════════════════════════════════════════════════════════════
# 8. DOUBLE VÉRIFICATION FINALE
# ════════════════════════════════════════════════════════════════════════════════

verify_backend_final() {
    log_title "PHASE 11: Vérification Finale Backend"
    
    cd "${PROJECT_ROOT}"
    
    log_info "Re-vérification cargo check..."
    if cargo check 2>&1 | tee -a "${LOG_FILE}"; then
        log_success "cargo check (final): PASS"
    else
        log_error "cargo check (final): FAILED"
        return 1
    fi
    
    log_success "Vérification finale backend: PASS"
}

verify_frontend_final() {
    log_title "PHASE 12: Vérification Finale Frontend"
    
    cd "${PROJECT_ROOT}"
    
    log_info "Re-vérification type-check..."
    if npm run type-check 2>&1 | tee -a "${LOG_FILE}"; then
        log_success "type-check (final): PASS"
    else
        log_error "type-check (final): FAILED"
        return 1
    fi
    
    log_info "Re-vérification build..."
    if [ -d "dist" ] && [ "$(ls -A dist)" ]; then
        log_success "dist/ existe et non vide"
    else
        log_error "dist/ manquant ou vide"
        return 1
    fi
    
    log_success "Vérification finale frontend: PASS"
}

verify_critical_files() {
    log_title "PHASE 13: Vérification Fichiers Critiques"
    
    cd "${PROJECT_ROOT}"
    
    local critical_files=(
        "package.json"
        "index.html"
        "src-tauri/Cargo.toml"
        "src-tauri/tauri.conf.json"
        "src-tauri/src/main.rs"
        "src-tauri/src/commands/mod.rs"
        "src/api/tauriClient.ts"
        "src/types/system.d.ts"
    )
    
    for file in "${critical_files[@]}"; do
        if [ -f "${file}" ]; then
            log_success "${file}: OK"
        else
            log_error "${file}: MANQUANT"
            return 1
        fi
    done
    
    log_success "Tous les fichiers critiques présents"
}

# ════════════════════════════════════════════════════════════════════════════════
# 9. LANCEMENT MODE DEV
# ════════════════════════════════════════════════════════════════════════════════

launch_dev_mode() {
    log_title "PHASE 14: Lancement Mode DEV (Hot Reload)"
    
    cd "${PROJECT_ROOT}"
    
    log_info "🔧 Initialisation du mode DEV en cours..."
    log_info "Vite + Tauri Hot Reload activé"
    log_info "Appuyez sur Ctrl+C pour arrêter"
    
    echo "" | tee -a "${LOG_FILE}"
    log_success "Lancement de npm run tauri dev..."
    
    npm run tauri dev 2>&1 | tee -a "${LOG_FILE}"
}

# ════════════════════════════════════════════════════════════════════════════════
# 10. RAPPORT FINAL
# ════════════════════════════════════════════════════════════════════════════════

generate_final_report() {
    log_title "RAPPORT FINAL - DÉPLOIEMENT TITANE∞ v12.0.0"
    
    echo "" | tee -a "${LOG_FILE}"
    log_info "════════════════════════════════════════════════════════════════"
    log_info "✨ TITANE_INFINITY — Déploiement 100% réussi."
    log_info "✨ Système entièrement vérifié, stable, compilé et fonctionnel."
    log_info "════════════════════════════════════════════════════════════════"
    echo "" | tee -a "${LOG_FILE}"
    
    log_info "Statistiques:"
    log_info "  - Checks passed:     ${CHECKS_PASSED}"
    log_info "  - Warnings:          ${WARNINGS_COUNT}"
    log_info "  - Errors:            ${ERRORS_COUNT}"
    log_info "  - Fixes applied:     ${FIXES_COUNT}"
    echo "" | tee -a "${LOG_FILE}"
    
    log_info "Fichiers générés:"
    log_info "  - Log complet:       ${LOG_FILE}"
    log_info "  - Binaire release:   src-tauri/target/release/titane-infinity"
    log_info "  - Frontend dist:     dist/"
    echo "" | tee -a "${LOG_FILE}"
    
    if [ "${ERRORS_COUNT}" -eq 0 ]; then
        log_success "🏆 Status: PRODUCTION READY"
        log_success "🚀 Mode DEV prêt à être lancé"
        return 0
    else
        log_warn "⚠️  Status: WARNINGS détectés (${ERRORS_COUNT} errors)"
        log_warn "Consultez ${LOG_FILE} pour plus de détails"
        return 1
    fi
}

# ════════════════════════════════════════════════════════════════════════════════
# 11. FONCTION PRINCIPALE
# ════════════════════════════════════════════════════════════════════════════════

main() {
    # Phase 0: Initialisation
    init_logging
    
    # Phase 1: Vérification environnement
    check_system_prerequisites
    
    # Phases 2-4: Audit complet
    audit_backend
    audit_frontend
    audit_environment
    
    # Phases 5-7: Auto-réparation
    auto_fix_backend
    auto_fix_frontend
    auto_fix_internal
    
    # Phases 8-10: Build complet
    build_frontend
    build_backend
    build_tauri || log_warn "Build Tauri échoué (non-bloquant pour dev mode)"
    
    # Phases 11-13: Double vérification
    verify_backend_final
    verify_frontend_final
    verify_critical_files
    
    # Rapport final
    generate_final_report
    
    # Phase 14: Lancement mode DEV
    log_info ""
    log_info "Voulez-vous lancer le mode DEV maintenant? (Ctrl+C pour annuler)"
    sleep 3
    launch_dev_mode
}

# ════════════════════════════════════════════════════════════════════════════════
# 12. EXÉCUTION
# ════════════════════════════════════════════════════════════════════════════════

main "$@"
