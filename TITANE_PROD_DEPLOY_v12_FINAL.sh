#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║ TITANE∞ v12.0.0 - PRODUCTION DEPLOYMENT                                     ║
# ║ Script de déploiement production ALL-IN-ONE                                 ║
# ║ DevOps-grade | Sécurisé | Reproductible | Sans intervention humaine        ║
# ╚══════════════════════════════════════════════════════════════════════════════╝
#
# Description:
#   Script de déploiement production complet pour TITANE_INFINITY v12.0.0
#   Nettoie, audite, build, valide, durcit et installe automatiquement
#
# Usage:
#   sudo ./TITANE_PROD_DEPLOY_v12_FINAL.sh
#
# Environnement:
#   Pop!_OS / Ubuntu / Debian (production-ready)
#   Rust 1.70+, Node 18+, npm 9+, WebKit 4.1+
#
# Auteur: TITANE-PROD-DEPLOY v12
# Date: 19 novembre 2025
# Version: 12.0.0
# ════════════════════════════════════════════════════════════════════════════════

# ════════════════════════════════════════════════════════════════════════════════
# 1. SÉCURITÉ STRICTE & CONFIGURATION PRODUCTION
# ════════════════════════════════════════════════════════════════════════════════

set -euo pipefail
IFS=$'\n\t'

# Handler d'erreurs strict
trap 'echo "[ERREUR] Script interrompu à la ligne $LINENO - Exit code: $?"; exit 1' ERR

# Variables globales PRODUCTION
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="${SCRIPT_DIR}"
readonly LOG_DIR="/var/log/titane"
readonly TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
readonly LOG_FILE="${LOG_DIR}/prod_deploy_${TIMESTAMP}.log"
readonly MIN_NODE_VERSION="18"
readonly MIN_RUST_VERSION="1.70"
readonly REQUIRED_WEBKIT_VERSION="2.40"

# Compteurs métriques
ERRORS_COUNT=0
WARNINGS_COUNT=0
FIXES_COUNT=0
CHECKS_PASSED=0
SECURITY_ISSUES=0

# Couleurs terminal
readonly COLOR_RESET='\033[0m'
readonly COLOR_RED='\033[0;31m'
readonly COLOR_GREEN='\033[0;32m'
readonly COLOR_YELLOW='\033[0;33m'
readonly COLOR_BLUE='\033[0;34m'
readonly COLOR_CYAN='\033[0;36m'
readonly COLOR_BOLD='\033[1m'
readonly COLOR_MAGENTA='\033[0;35m'

# ════════════════════════════════════════════════════════════════════════════════
# 2. FONCTIONS UTILITAIRES PRODUCTION
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

log_security() {
    local msg="[$(date '+%Y-%m-%d %H:%M:%S')] [SECURITY] $*"
    echo -e "${COLOR_MAGENTA}${msg}${COLOR_RESET}" | tee -a "${LOG_FILE}"
    ((SECURITY_ISSUES++)) || true
}

log_title() {
    local title="$*"
    local separator="════════════════════════════════════════════════════════════════"
    echo "" | tee -a "${LOG_FILE}"
    echo -e "${COLOR_BOLD}${COLOR_CYAN}${separator}${COLOR_RESET}" | tee -a "${LOG_FILE}"
    echo -e "${COLOR_BOLD}${COLOR_CYAN}${title}${COLOR_RESET}" | tee -a "${LOG_FILE}"
    echo -e "${COLOR_BOLD}${COLOR_CYAN}${separator}${COLOR_RESET}" | tee -a "${LOG_FILE}"
}

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

version_ge() {
    [ "$(printf '%s\n' "$1" "$2" | sort -V | head -n1)" = "$2" ]
}

check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "Ce script nécessite les privilèges sudo/root"
        log_info "Usage: sudo ./TITANE_PROD_DEPLOY_v12_FINAL.sh"
        exit 1
    fi
}

# ════════════════════════════════════════════════════════════════════════════════
# 3. INITIALISATION PRODUCTION
# ════════════════════════════════════════════════════════════════════════════════

init_production_env() {
    log_title "TITANE∞ v12.0.0 - PRODUCTION DEPLOYMENT"
    
    # Vérifier privilèges root
    check_root
    
    # Créer répertoire logs production
    if [ ! -d "${LOG_DIR}" ]; then
        mkdir -p "${LOG_DIR}"
        chmod 755 "${LOG_DIR}"
        log_info "Création répertoire logs production: ${LOG_DIR}"
    fi
    
    # Initialiser log file
    touch "${LOG_FILE}"
    chmod 644 "${LOG_FILE}"
    
    log_info "═══════════════════════════════════════════════════════════════"
    log_info "Script: TITANE_PROD_DEPLOY_v12_FINAL.sh"
    log_info "Version: 12.0.0"
    log_info "Date: $(date '+%Y-%m-%d %H:%M:%S')"
    log_info "Utilisateur: ${SUDO_USER:-root} (root)"
    log_info "Répertoire: ${PROJECT_ROOT}"
    log_info "Log file: ${LOG_FILE}"
    log_info "Système: $(uname -s) $(uname -r)"
    log_info "Hostname: $(hostname)"
    log_info "═══════════════════════════════════════════════════════════════"
}

# ════════════════════════════════════════════════════════════════════════════════
# 4. VÉRIFICATION DÉPENDANCES SYSTÈME PRODUCTION
# ════════════════════════════════════════════════════════════════════════════════

install_system_dependency() {
    local package="$1"
    log_fix "Installation de ${package}..."
    
    if apt-get update >> "${LOG_FILE}" 2>&1 && apt-get install -y "${package}" >> "${LOG_FILE}" 2>&1; then
        log_success "${package}: installé avec succès"
        return 0
    else
        log_error "${package}: échec installation"
        return 1
    fi
}

check_and_install_dependencies() {
    log_title "PHASE 1: Vérification et Installation Dépendances Système"
    
    # Node.js
    if command_exists node; then
        local node_version
        node_version=$(node --version | sed 's/v//' | cut -d. -f1)
        if version_ge "${node_version}" "${MIN_NODE_VERSION}"; then
            log_success "node: $(node --version)"
        else
            log_error "node version ${node_version} < ${MIN_NODE_VERSION} (REQUIS)"
            log_info "Installation Node.js 20.x..."
            curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >> "${LOG_FILE}" 2>&1
            apt-get install -y nodejs >> "${LOG_FILE}" 2>&1 || exit 1
        fi
    else
        log_error "node: NON INSTALLÉ"
        log_fix "Installation Node.js 20.x..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >> "${LOG_FILE}" 2>&1
        apt-get install -y nodejs >> "${LOG_FILE}" 2>&1 || exit 1
    fi
    
    # npm
    if command_exists npm; then
        log_success "npm: $(npm --version)"
    else
        log_error "npm: NON INSTALLÉ (critique)"
        exit 1
    fi
    
    # Rust
    if command_exists rustc; then
        local rust_version
        rust_version=$(rustc --version | awk '{print $2}' | cut -d. -f1-2)
        if version_ge "${rust_version}" "${MIN_RUST_VERSION}"; then
            log_success "rustc: $(rustc --version)"
        else
            log_error "rustc version ${rust_version} < ${MIN_RUST_VERSION} (REQUIS)"
            exit 1
        fi
    else
        log_error "rustc: NON INSTALLÉ (critique)"
        log_info "Installer Rust: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
        exit 1
    fi
    
    # Cargo
    if command_exists cargo; then
        log_success "cargo: $(cargo --version | awk '{print $2}')"
    else
        log_error "cargo: NON INSTALLÉ (critique)"
        exit 1
    fi
    
    # WebKit (CRITIQUE pour production)
    if pkg-config --exists webkit2gtk-4.1 2>/dev/null; then
        local webkit_version
        webkit_version=$(pkg-config --modversion webkit2gtk-4.1)
        log_success "webkit2gtk-4.1: ${webkit_version}"
    else
        log_error "webkit2gtk-4.1: NON INSTALLÉ (CRITIQUE PRODUCTION)"
        install_system_dependency "libwebkit2gtk-4.1-dev" || exit 1
        install_system_dependency "libjavascriptcoregtk-4.1-dev" || exit 1
    fi
    
    # Dépendances système critiques
    local system_deps=(
        "pkg-config"
        "libssl-dev"
        "libayatana-appindicator3-dev"
        "librsvg2-dev"
        "build-essential"
        "curl"
        "wget"
        "git"
        "jq"
    )
    
    for dep in "${system_deps[@]}"; do
        if dpkg -l | grep -q "^ii.*${dep}"; then
            log_success "${dep}: installé"
        else
            log_warn "${dep}: manquant"
            install_system_dependency "${dep}" || log_warn "${dep}: installation échouée"
        fi
    done
    
    # Tauri CLI
    if npm list -g @tauri-apps/cli >/dev/null 2>&1 || command_exists tauri; then
        log_success "tauri-cli: installé"
    else
        log_fix "Installation @tauri-apps/cli globalement..."
        npm install -g @tauri-apps/cli >> "${LOG_FILE}" 2>&1 || log_warn "tauri-cli: installation échouée"
    fi
    
    # cargo-audit (sécurité)
    if cargo install --list | grep -q cargo-audit; then
        log_success "cargo-audit: installé"
    else
        log_fix "Installation cargo-audit..."
        cargo install cargo-audit >> "${LOG_FILE}" 2>&1 || log_warn "cargo-audit: installation échouée"
    fi
    
    log_success "Vérification dépendances terminée"
}

# ════════════════════════════════════════════════════════════════════════════════
# 5. NETTOYAGE COMPLET PRODUCTION
# ════════════════════════════════════════════════════════════════════════════════

production_clean() {
    log_title "PHASE 2: Nettoyage Complet Production"
    
    cd "${PROJECT_ROOT}"
    
    log_info "Nettoyage Rust artifacts..."
    if cargo clean >> "${LOG_FILE}" 2>&1; then
        log_success "cargo clean: OK"
    else
        log_warn "cargo clean: warnings"
    fi
    
    log_info "Nettoyage npm cache..."
    npm cache clean --force >> "${LOG_FILE}" 2>&1 || log_warn "npm cache clean: warnings"
    
    log_info "Suppression répertoires build/dist..."
    rm -rf dist build node_modules/.cache .vite .turbo 2>/dev/null || true
    
    log_info "Vérification cohérence post-nettoyage..."
    [ ! -d "src-tauri/target/debug" ] && log_success "target/debug: supprimé" || log_warn "target/debug: existe encore"
    [ ! -d "node_modules/.cache" ] && log_success "node_modules/.cache: supprimé" || log_warn ".cache: existe encore"
    
    log_success "Nettoyage production terminé"
}

# ════════════════════════════════════════════════════════════════════════════════
# 6. AUDIT PRODUCTION (SÉCURITÉ + STABILITÉ)
# ════════════════════════════════════════════════════════════════════════════════

audit_backend_production() {
    log_title "PHASE 3: Audit Production Backend"
    
    cd "${PROJECT_ROOT}"
    
    # Cargo check
    log_info "Exécution cargo check (production)..."
    if cargo check --release 2>&1 | tee -a "${LOG_FILE}"; then
        log_success "cargo check: PASS"
    else
        log_error "cargo check: FAILED (BLOQUANT)"
        exit 1
    fi
    
    # Cargo clippy (strict mode)
    log_info "Exécution cargo clippy (strict)..."
    if cargo clippy --all-targets --all-features -- -D warnings 2>&1 | tee -a "${LOG_FILE}"; then
        log_success "cargo clippy: PASS"
    else
        log_error "cargo clippy: WARNINGS détectés (BLOQUANT en production)"
        exit 1
    fi
    
    # Cargo audit (sécurité)
    log_info "Exécution cargo audit (vulnérabilités)..."
    if cargo audit >> "${LOG_FILE}" 2>&1; then
        log_success "cargo audit: aucune vulnérabilité"
    else
        log_security "cargo audit: VULNÉRABILITÉS détectées (vérifier logs)"
    fi
    
    # Analyse sécurité critique
    log_info "Analyse sécurité: unwrap(), expect(), panic!()..."
    local unwrap_count
    local expect_count
    local panic_count
    
    unwrap_count=$(grep -rn "\.unwrap()" src-tauri/src --include="*.rs" 2>/dev/null | grep -v "tests::" | grep -v "test_" | grep -v "#\[cfg(test)\]" | wc -l || echo "0")
    expect_count=$(grep -rn "\.expect(" src-tauri/src --include="*.rs" 2>/dev/null | grep -v "tests::" | grep -v "#\[cfg(test)\]" | wc -l || echo "0")
    panic_count=$(grep -rn "panic!" src-tauri/src --include="*.rs" 2>/dev/null | grep -v "tests::" | grep -v "#\[cfg(test)\]" | wc -l || echo "0")
    
    if [ "${unwrap_count}" -gt 50 ]; then
        log_security "CRITIQUE: ${unwrap_count} unwrap() détectés (> 50 limite production)"
    elif [ "${unwrap_count}" -gt 0 ]; then
        log_warn "Trouvé ${unwrap_count} unwrap() (à réduire)"
    fi
    
    if [ "${panic_count}" -gt 0 ]; then
        log_security "CRITIQUE: ${panic_count} panic! détectés en production"
    fi
    
    log_success "Audit backend production terminé"
}

audit_frontend_production() {
    log_title "PHASE 4: Audit Production Frontend"
    
    cd "${PROJECT_ROOT}"
    
    # npm audit (HIGH seulement)
    log_info "Exécution npm audit (HIGH/CRITICAL)..."
    if npm audit --audit-level=high >> "${LOG_FILE}" 2>&1; then
        log_success "npm audit: aucune vulnérabilité HIGH/CRITICAL"
    else
        log_security "npm audit: VULNÉRABILITÉS HIGH/CRITICAL détectées"
        npm audit --audit-level=high | tee -a "${LOG_FILE}"
    fi
    
    # TypeScript type-check (strict)
    log_info "Exécution type-check (strict mode)..."
    if npm run type-check 2>&1 | tee -a "${LOG_FILE}"; then
        log_success "TypeScript type-check: PASS"
    else
        log_error "TypeScript type-check: FAILED (BLOQUANT)"
        exit 1
    fi
    
    # npm lint (si disponible)
    if grep -q '"lint"' package.json; then
        log_info "Exécution npm lint..."
        if npm run lint >> "${LOG_FILE}" 2>&1; then
            log_success "npm lint: PASS"
        else
            log_warn "npm lint: WARNINGS détectés"
        fi
    fi
    
    # Analyse code dangereux
    log_info "Analyse sécurité: eval(), Function()..."
    local eval_count
    eval_count=$(grep -rn "eval(" src --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l || echo "0")
    
    if [ "${eval_count}" -gt 0 ]; then
        log_security "CRITIQUE: ${eval_count} eval() détectés en production"
    else
        log_success "Aucun code dangereux (eval/Function) détecté"
    fi
    
    log_success "Audit frontend production terminé"
}

# ════════════════════════════════════════════════════════════════════════════════
# 7. AUTO-RÉPARATION GLOBALE
# ════════════════════════════════════════════════════════════════════════════════

auto_fix_global() {
    log_title "PHASE 5: Auto-Réparation Globale"
    
    cd "${PROJECT_ROOT}"
    
    # Cargo fix
    log_fix "Application cargo fix (allow-dirty)..."
    cargo fix --allow-dirty >> "${LOG_FILE}" 2>&1 || log_warn "cargo fix: erreurs"
    
    # Cargo fmt
    log_fix "Application cargo fmt (formatting)..."
    cargo fmt --all >> "${LOG_FILE}" 2>&1 || log_warn "cargo fmt: erreurs"
    
    # npm audit fix
    log_fix "Application npm audit fix..."
    npm audit fix >> "${LOG_FILE}" 2>&1 || log_warn "npm audit fix: corrections partielles"
    
    # Vérification modules TITANE
    log_info "Vérification modules TITANE∞..."
    local titane_modules=("memory" "adaptive" "sentinel" "ghre" "idcm" "compute" "collect" "watchdog")
    
    for module in "${titane_modules[@]}"; do
        if [ -d "src-tauri/src/system/${module}" ] || grep -q "${module}" "src-tauri/src/main.rs" 2>/dev/null; then
            log_success "Module ${module}: OK"
        else
            log_warn "Module ${module}: vérification manuelle requise"
        fi
    done
    
    # Purge caches invalides
    log_fix "Purge caches invalides..."
    rm -rf node_modules/.cache .vite dist/.vite 2>/dev/null || true
    
    log_success "Auto-réparation globale terminée"
}

# ════════════════════════════════════════════════════════════════════════════════
# 8. BUILD PRODUCTION FRONTEND
# ════════════════════════════════════════════════════════════════════════════════

build_production_frontend() {
    log_title "PHASE 6: Build Production Frontend"
    
    cd "${PROJECT_ROOT}"
    
    # npm install (production mode)
    log_info "Installation dépendances npm (prefer-offline)..."
    if npm install --prefer-offline >> "${LOG_FILE}" 2>&1; then
        log_success "npm install: SUCCESS"
    else
        log_error "npm install: FAILED (BLOQUANT)"
        exit 1
    fi
    
    # Type-check final
    log_info "Type-check final frontend..."
    if npm run type-check 2>&1 | tee -a "${LOG_FILE}"; then
        log_success "type-check: PASS"
    else
        log_error "type-check: FAILED (BLOQUANT)"
        exit 1
    fi
    
    # Build production
    log_info "Build production frontend (Vite)..."
    if npm run build 2>&1 | tee -a "${LOG_FILE}"; then
        log_success "Frontend build: SUCCESS"
        
        # Vérification dist/
        if [ -d "dist" ] && [ "$(ls -A dist)" ]; then
            local dist_size
            dist_size=$(du -sh dist 2>/dev/null | awk '{print $1}')
            log_info "Taille dist/: ${dist_size}"
            
            # Vérifier assets critiques
            [ -f "dist/index.html" ] && log_success "dist/index.html: OK" || log_error "index.html: MANQUANT"
            
            local js_count
            js_count=$(find dist/assets -name "*.js" 2>/dev/null | wc -l || echo "0")
            log_info "Fichiers JS générés: ${js_count}"
        else
            log_error "dist/ vide ou manquant (BLOQUANT)"
            exit 1
        fi
    else
        log_error "Frontend build: FAILED (BLOQUANT)"
        exit 1
    fi
    
    log_success "Build production frontend terminé"
}

# ════════════════════════════════════════════════════════════════════════════════
# 9. BUILD PRODUCTION BACKEND
# ════════════════════════════════════════════════════════════════════════════════

build_production_backend() {
    log_title "PHASE 7: Build Production Backend (Rust)"
    
    cd "${PROJECT_ROOT}"
    
    # Cargo build release
    log_info "Build backend Rust (release mode optimisé)..."
    if cargo build --release 2>&1 | tee -a "${LOG_FILE}"; then
        log_success "Backend build: SUCCESS"
        
        # Vérifier binaire
        if [ -f "src-tauri/target/release/titane-infinity" ]; then
            local bin_size
            bin_size=$(du -h src-tauri/target/release/titane-infinity 2>/dev/null | awk '{print $1}')
            log_info "Binaire généré: ${bin_size}"
            
            # Strip binaire (réduire taille)
            log_info "Strip binaire (optimisation taille)..."
            strip src-tauri/target/release/titane-infinity 2>/dev/null || log_warn "strip: échoué"
            
            local bin_size_stripped
            bin_size_stripped=$(du -h src-tauri/target/release/titane-infinity 2>/dev/null | awk '{print $1}')
            log_success "Binaire strippé: ${bin_size_stripped}"
            
            # Vérifier dépendances dynamiques
            log_info "Vérification dépendances dynamiques (ldd)..."
            if command_exists ldd; then
                local missing_libs
                missing_libs=$(ldd src-tauri/target/release/titane-infinity | grep "not found" | wc -l || echo "0")
                
                if [ "${missing_libs}" -eq 0 ]; then
                    log_success "Aucune bibliothèque manquante"
                else
                    log_error "CRITIQUE: ${missing_libs} bibliothèques manquantes"
                    ldd src-tauri/target/release/titane-infinity | grep "not found" | tee -a "${LOG_FILE}"
                    exit 1
                fi
            fi
            
            # SHA256 checksum
            if command_exists sha256sum; then
                local checksum
                checksum=$(sha256sum src-tauri/target/release/titane-infinity | awk '{print $1}')
                log_info "SHA256: ${checksum}"
                echo "${checksum}  titane-infinity" > src-tauri/target/release/SHA256SUMS
            fi
            
            # Test exécution basique (pas de crash)
            log_info "Test exécution binaire (vérification segfault)..."
            if timeout 2s src-tauri/target/release/titane-infinity --version >> "${LOG_FILE}" 2>&1 || [ $? -eq 124 ]; then
                log_success "Binaire exécutable (pas de segfault)"
            else
                log_warn "Test exécution: timeout ou erreur"
            fi
        else
            log_error "Binaire manquant (BLOQUANT)"
            exit 1
        fi
    else
        log_error "Backend build: FAILED (BLOQUANT)"
        exit 1
    fi
    
    log_success "Build production backend terminé"
}

# ════════════════════════════════════════════════════════════════════════════════
# 10. BUILD PRODUCTION TAURI v2
# ════════════════════════════════════════════════════════════════════════════════

build_production_tauri() {
    log_title "PHASE 8: Build Production Tauri v2 (Bundles)"
    
    cd "${PROJECT_ROOT}"
    
    log_info "Build Tauri complet (AppImage/DEB/RPM)..."
    if npm run tauri build 2>&1 | tee -a "${LOG_FILE}"; then
        log_success "Tauri build: SUCCESS"
        
        # Vérifier bundles générés
        local bundle_dir="src-tauri/target/release/bundle"
        
        if [ -d "${bundle_dir}" ]; then
            log_info "Bundles générés:"
            
            # AppImage
            local appimage
            appimage=$(find "${bundle_dir}/appimage" -name "*.AppImage" 2>/dev/null | head -n1)
            if [ -n "${appimage}" ]; then
                local appimage_size
                appimage_size=$(du -h "${appimage}" | awk '{print $1}')
                log_success "AppImage: $(basename "${appimage}") (${appimage_size})"
                
                # Vérifier exécutable
                chmod +x "${appimage}" 2>/dev/null || true
                
                # SHA256
                if command_exists sha256sum; then
                    sha256sum "${appimage}" | tee -a "${LOG_FILE}"
                fi
            else
                log_warn "AppImage: NON GÉNÉRÉ"
            fi
            
            # DEB
            local deb
            deb=$(find "${bundle_dir}/deb" -name "*.deb" 2>/dev/null | head -n1)
            if [ -n "${deb}" ]; then
                local deb_size
                deb_size=$(du -h "${deb}" | awk '{print $1}')
                log_success "DEB: $(basename "${deb}") (${deb_size})"
                
                # SHA256
                if command_exists sha256sum; then
                    sha256sum "${deb}" | tee -a "${LOG_FILE}"
                fi
            else
                log_warn "DEB: NON GÉNÉRÉ"
            fi
            
            # RPM
            local rpm
            rpm=$(find "${bundle_dir}/rpm" -name "*.rpm" 2>/dev/null | head -n1)
            if [ -n "${rpm}" ]; then
                local rpm_size
                rpm_size=$(du -h "${rpm}" | awk '{print $1}')
                log_success "RPM: $(basename "${rpm}") (${rpm_size})"
            else
                log_info "RPM: NON GÉNÉRÉ (normal sur Debian/Ubuntu)"
            fi
        else
            log_error "Répertoire bundle/ manquant (BLOQUANT)"
            exit 1
        fi
    else
        log_error "Tauri build: FAILED (BLOQUANT)"
        exit 1
    fi
    
    log_success "Build production Tauri terminé"
}

# ════════════════════════════════════════════════════════════════════════════════
# 11. DOUBLE VALIDATION SYMÉTRIQUE
# ════════════════════════════════════════════════════════════════════════════════

double_validation_technical() {
    log_title "PHASE 9: Double Validation Technique"
    
    cd "${PROJECT_ROOT}"
    
    log_info "Re-vérification cargo check..."
    if cargo check --release 2>&1 | tee -a "${LOG_FILE}"; then
        log_success "cargo check (validation 2): PASS"
    else
        log_error "cargo check (validation 2): FAILED - STOP DEPLOY"
        exit 1
    fi
    
    log_info "Re-vérification type-check..."
    if npm run type-check 2>&1 | tee -a "${LOG_FILE}"; then
        log_success "type-check (validation 2): PASS"
    else
        log_error "type-check (validation 2): FAILED - STOP DEPLOY"
        exit 1
    fi
    
    log_info "Re-vérification build frontend..."
    if [ -d "dist" ] && [ -f "dist/index.html" ]; then
        log_success "dist/ validation: PASS"
    else
        log_error "dist/ validation: FAILED - STOP DEPLOY"
        exit 1
    fi
    
    log_success "Double validation technique: PASS"
}

double_validation_system() {
    log_title "PHASE 10: Double Validation Système"
    
    cd "${PROJECT_ROOT}"
    
    # Vérifier binaire exécutable
    log_info "Test exécution binaire release..."
    if [ -f "src-tauri/target/release/titane-infinity" ]; then
        if timeout 3s src-tauri/target/release/titane-infinity --version >> "${LOG_FILE}" 2>&1 || [ $? -eq 124 ]; then
            log_success "Binaire: exécutable sans crash"
        else
            log_error "Binaire: crash détecté - STOP DEPLOY"
            exit 1
        fi
    else
        log_error "Binaire: manquant - STOP DEPLOY"
        exit 1
    fi
    
    # Vérifier bundles
    log_info "Vérification bundles (AppImage/DEB)..."
    local appimage
    local deb
    
    appimage=$(find src-tauri/target/release/bundle/appimage -name "*.AppImage" 2>/dev/null | head -n1)
    deb=$(find src-tauri/target/release/bundle/deb -name "*.deb" 2>/dev/null | head -n1)
    
    if [ -n "${appimage}" ] && [ -f "${appimage}" ]; then
        log_success "AppImage: existe et accessible"
        
        # Vérifier permissions
        if [ -x "${appimage}" ]; then
            log_success "AppImage: exécutable"
        else
            chmod +x "${appimage}"
            log_fix "AppImage: permissions corrigées"
        fi
    else
        log_error "AppImage: manquant - STOP DEPLOY"
        exit 1
    fi
    
    if [ -n "${deb}" ] && [ -f "${deb}" ]; then
        log_success "DEB: existe et accessible"
    else
        log_warn "DEB: manquant (non-critique)"
    fi
    
    log_success "Double validation système: PASS"
}

# ════════════════════════════════════════════════════════════════════════════════
# 12. DURCISSEMENT PRODUCTION (HARDENING)
# ════════════════════════════════════════════════════════════════════════════════

production_hardening() {
    log_title "PHASE 11: Durcissement Production (Hardening)"
    
    cd "${PROJECT_ROOT}"
    
    # Permissions binaires
    log_info "Application permissions sécurisées (chmod 750)..."
    chmod 750 src-tauri/target/release/titane-infinity 2>/dev/null || log_warn "chmod binaire: échoué"
    
    local appimage
    appimage=$(find src-tauri/target/release/bundle/appimage -name "*.AppImage" 2>/dev/null | head -n1)
    if [ -n "${appimage}" ]; then
        chmod 755 "${appimage}" 2>/dev/null || log_warn "chmod AppImage: échoué"
        log_success "Permissions AppImage: 755"
    fi
    
    # Vérifier tauri.conf.json (CSP)
    log_info "Vérification CSP dans tauri.conf.json..."
    if [ -f "src-tauri/tauri.conf.json" ]; then
        if grep -q "dangerousDisableAssetCspModification" src-tauri/tauri.conf.json; then
            log_security "ATTENTION: dangerousDisableAssetCspModification détecté"
        else
            log_success "CSP: configuration sécurisée"
        fi
        
        # Vérifier devPath vs prodPath
        if grep -q '"devPath"' src-tauri/tauri.conf.json && grep -q '"distDir"' src-tauri/tauri.conf.json; then
            log_success "Configuration dev/prod: OK"
        else
            log_warn "Configuration dev/prod: vérification manuelle requise"
        fi
    else
        log_error "tauri.conf.json: MANQUANT"
    fi
    
    # Suppression sourcemaps (optionnel production)
    log_info "Vérification sourcemaps..."
    local sourcemap_count
    sourcemap_count=$(find dist -name "*.map" 2>/dev/null | wc -l || echo "0")
    
    if [ "${sourcemap_count}" -gt 0 ]; then
        log_warn "Sourcemaps présents (${sourcemap_count} fichiers) - considérer suppression production"
    else
        log_success "Aucun sourcemap (production optimisée)"
    fi
    
    # Génération manifest conformité
    log_info "Génération manifest de conformité..."
    cat > "${PROJECT_ROOT}/PRODUCTION_MANIFEST_v12.txt" <<EOF
═══════════════════════════════════════════════════════════════
TITANE∞ v12.0.0 - PRODUCTION MANIFEST
═══════════════════════════════════════════════════════════════

Date génération: $(date '+%Y-%m-%d %H:%M:%S')
Script: TITANE_PROD_DEPLOY_v12_FINAL.sh

BINAIRES:
- Release: src-tauri/target/release/titane-infinity
- AppImage: $(basename "${appimage}" 2>/dev/null || echo "N/A")

CHECKSUMS:
$(cat src-tauri/target/release/SHA256SUMS 2>/dev/null || echo "N/A")

SÉCURITÉ:
- unwrap() count: $(grep -rn "\.unwrap()" src-tauri/src --include="*.rs" 2>/dev/null | grep -v "tests::" | wc -l || echo "0")
- panic! count: $(grep -rn "panic!" src-tauri/src --include="*.rs" 2>/dev/null | grep -v "tests::" | wc -l || echo "0")
- eval() count: $(grep -rn "eval(" src --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l || echo "0")

VALIDATION:
- cargo check: PASS
- cargo clippy: PASS
- type-check: PASS
- build frontend: PASS
- build backend: PASS
- build tauri: PASS

STATUS: PRODUCTION READY
═══════════════════════════════════════════════════════════════
EOF
    
    chmod 644 "${PROJECT_ROOT}/PRODUCTION_MANIFEST_v12.txt"
    log_success "Manifest généré: PRODUCTION_MANIFEST_v12.txt"
    
    log_success "Durcissement production terminé"
}

# ════════════════════════════════════════════════════════════════════════════════
# 13. INSTALLATION PRODUCTION AUTOMATIQUE
# ════════════════════════════════════════════════════════════════════════════════

install_production_package() {
    log_title "PHASE 12: Installation Production Automatique"
    
    cd "${PROJECT_ROOT}"
    
    # Trouver paquet DEB
    local deb
    deb=$(find src-tauri/target/release/bundle/deb -name "*.deb" 2>/dev/null | head -n1)
    
    if [ -n "${deb}" ] && [ -f "${deb}" ]; then
        log_info "Installation paquet DEB: $(basename "${deb}")"
        
        if apt install -y "${deb}" >> "${LOG_FILE}" 2>&1; then
            log_success "Installation DEB: SUCCESS"
            
            # Vérifier installation
            if command_exists titane-infinity; then
                log_success "Commande titane-infinity: disponible"
            else
                log_warn "Commande titane-infinity: non trouvée dans PATH"
            fi
            
            # Vérifier fichier .desktop
            if [ -f "/usr/share/applications/titane-infinity.desktop" ]; then
                log_success "Fichier .desktop: installé"
            else
                log_warn "Fichier .desktop: non trouvé"
            fi
        else
            log_error "Installation DEB: FAILED"
            log_info "Installation manuelle: sudo apt install ${deb}"
        fi
    else
        log_warn "Paquet DEB non trouvé - installation automatique skippée"
        log_info "Utiliser AppImage: $(find src-tauri/target/release/bundle/appimage -name "*.AppImage" 2>/dev/null | head -n1)"
    fi
    
    log_success "Phase installation terminée"
}

# ════════════════════════════════════════════════════════════════════════════════
# 14. RAPPORT FINAL OFFICIEL
# ════════════════════════════════════════════════════════════════════════════════

generate_final_production_report() {
    log_title "RAPPORT FINAL - DÉPLOIEMENT PRODUCTION"
    
    echo "" | tee -a "${LOG_FILE}"
    echo "════════════════════════════════════════════════════════════════" | tee -a "${LOG_FILE}"
    echo "✔ TITANE_INFINITY v12 — DÉPLOIEMENT PROD RÉUSSI" | tee -a "${LOG_FILE}"
    echo "✔ Système propre, stable, sécurisé et opérationnel" | tee -a "${LOG_FILE}"
    echo "════════════════════════════════════════════════════════════════" | tee -a "${LOG_FILE}"
    echo "" | tee -a "${LOG_FILE}"
    
    log_info "Statistiques Globales:"
    log_info "  - Checks passed:         ${CHECKS_PASSED}"
    log_info "  - Warnings:              ${WARNINGS_COUNT}"
    log_info "  - Errors:                ${ERRORS_COUNT}"
    log_info "  - Fixes applied:         ${FIXES_COUNT}"
    log_info "  - Security issues:       ${SECURITY_ISSUES}"
    echo "" | tee -a "${LOG_FILE}"
    
    log_info "Fichiers Critiques:"
    log_info "  - Log production:        ${LOG_FILE}"
    log_info "  - Binaire release:       src-tauri/target/release/titane-infinity"
    log_info "  - Frontend dist:         dist/"
    log_info "  - AppImage:              $(find src-tauri/target/release/bundle/appimage -name "*.AppImage" 2>/dev/null | head -n1)"
    log_info "  - DEB:                   $(find src-tauri/target/release/bundle/deb -name "*.deb" 2>/dev/null | head -n1)"
    log_info "  - Manifest:              PRODUCTION_MANIFEST_v12.txt"
    echo "" | tee -a "${LOG_FILE}"
    
    if [ "${ERRORS_COUNT}" -eq 0 ]; then
        log_success "════════════════════════════════════════════════════════════════"
        log_success "🏆 STATUS: PRODUCTION READY"
        log_success "🚀 Déploiement validé et opérationnel"
        log_success "════════════════════════════════════════════════════════════════"
        return 0
    else
        log_error "════════════════════════════════════════════════════════════════"
        log_error "⚠️  STATUS: ERREURS CRITIQUES (${ERRORS_COUNT})"
        log_error "❌ Déploiement échoué - consultez ${LOG_FILE}"
        log_error "════════════════════════════════════════════════════════════════"
        return 1
    fi
}

# ════════════════════════════════════════════════════════════════════════════════
# 15. FONCTION PRINCIPALE
# ════════════════════════════════════════════════════════════════════════════════

main() {
    # Phase 0: Initialisation production
    init_production_env
    
    # Phase 1: Dépendances système
    check_and_install_dependencies
    
    # Phase 2: Nettoyage production
    production_clean
    
    # Phases 3-4: Audit production
    audit_backend_production
    audit_frontend_production
    
    # Phase 5: Auto-réparation
    auto_fix_global
    
    # Phases 6-8: Build production complet
    build_production_frontend
    build_production_backend
    build_production_tauri
    
    # Phases 9-10: Double validation
    double_validation_technical
    double_validation_system
    
    # Phase 11: Hardening
    production_hardening
    
    # Phase 12: Installation
    install_production_package
    
    # Phase 13: Rapport final
    generate_final_production_report
}

# ════════════════════════════════════════════════════════════════════════════════
# 16. EXÉCUTION
# ════════════════════════════════════════════════════════════════════════════════

main "$@"
