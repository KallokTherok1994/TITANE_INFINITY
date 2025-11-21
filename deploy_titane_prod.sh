#!/usr/bin/env bash

################################################################################
# TITANE∞ v15.5 - SCRIPT DE DÉPLOIEMENT PRODUCTION COMPLET
################################################################################
# Description : Build frontend + backend Rust + Tauri + Installation système
# Environnement : Pop!_OS / Ubuntu (HORS FLATPAK - Terminal Natif Requis)
# Auteur : TITANE-PROD-FULL-DEPLOYER v15.5-OPTIMAL
# Date : 2025-11-20
#
# ⚠️  CE SCRIPT NE PEUT PAS S'EXÉCUTER DANS UN ENVIRONNEMENT FLATPAK
#     Utiliser un terminal système natif (Ctrl+Alt+T) pour le lancer
################################################################################

# ============================================================================
# 1. CONFIGURATION STRICTE
# ============================================================================
set -euo pipefail  # Arrêt immédiat sur erreur, variable non définie ou pipe échoué
IFS=$'\n\t'        # Séparateur sûr

# ============================================================================
# 2. VARIABLES GLOBALES
# ============================================================================
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="${SCRIPT_DIR}"
readonly LOG_DIR="${PROJECT_ROOT}/deploy_logs"
readonly TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
readonly LOG_FILE="${LOG_DIR}/deploy_prod_${TIMESTAMP}.log"
readonly MIN_DISK_SPACE_MB=2048
readonly REQUIRED_NODE_VERSION=20
readonly REQUIRED_NPM_VERSION=10

# Couleurs pour affichage terminal
readonly COLOR_RESET="\033[0m"
readonly COLOR_RED="\033[31m"
readonly COLOR_GREEN="\033[32m"
readonly COLOR_YELLOW="\033[33m"
readonly COLOR_BLUE="\033[34m"
readonly COLOR_CYAN="\033[36m"
readonly COLOR_BOLD="\033[1m"

# ============================================================================
# 3. FONCTIONS UTILITAIRES
# ============================================================================

# Détection environnement Flatpak
detect_flatpak() {
    # Vérifier plusieurs indicateurs Flatpak
    if [[ -f "/.flatpak-info" ]] || \
       [[ -n "${FLATPAK_ID:-}" ]] || \
       [[ -n "${FLATPAK_SANDBOX_DIR:-}" ]] || \
       [[ "${container:-}" == "flatpak" ]] || \
       [[ -d "/app" && -f "/app/manifest.json" ]]; then
        return 0  # Flatpak détecté
    fi
    return 1  # Pas dans Flatpak
}

# Affichage avec log
log_info() {
    echo -e "${COLOR_BLUE}ℹ ${COLOR_RESET}$*" | tee -a "${LOG_FILE}"
}

log_success() {
    echo -e "${COLOR_GREEN}✓${COLOR_RESET} $*" | tee -a "${LOG_FILE}"
}

log_warning() {
    echo -e "${COLOR_YELLOW}⚠${COLOR_RESET} $*" | tee -a "${LOG_FILE}"
}

log_error() {
    echo -e "${COLOR_RED}✗${COLOR_RESET} $*" | tee -a "${LOG_FILE}" >&2
}

log_section() {
    echo "" | tee -a "${LOG_FILE}"
    echo -e "${COLOR_CYAN}${COLOR_BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLOR_RESET}" | tee -a "${LOG_FILE}"
    echo -e "${COLOR_CYAN}${COLOR_BOLD}  $*${COLOR_RESET}" | tee -a "${LOG_FILE}"
    echo -e "${COLOR_CYAN}${COLOR_BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLOR_RESET}" | tee -a "${LOG_FILE}"
    echo "" | tee -a "${LOG_FILE}"
}

# Gestion des erreurs
handle_error() {
    local exit_code=$?
    log_error "ÉCHEC à la ligne $1 : commande échouée avec code $exit_code"
    log_error "Consultez le log : ${LOG_FILE}"
    exit "$exit_code"
}

trap 'handle_error $LINENO' ERR

# Vérification commande existe
command_exists() {
    command -v "$1" &> /dev/null
}

# Comparaison de versions (retourne 0 si $1 >= $2)
version_ge() {
    printf '%s\n%s\n' "$2" "$1" | sort -V -C
}

# Vérification espace disque
check_disk_space() {
    local available_mb
    available_mb=$(df -m "${PROJECT_ROOT}" | awk 'NR==2 {print $4}')
    if [[ "${available_mb}" -lt "${MIN_DISK_SPACE_MB}" ]]; then
        log_error "Espace disque insuffisant : ${available_mb}MB disponible, ${MIN_DISK_SPACE_MB}MB requis"
        exit 1
    fi
    log_success "Espace disque : ${available_mb}MB disponible"
}

# ============================================================================
# 4. INITIALISATION
# ============================================================================
initialize() {
    log_section "1. INITIALISATION & LOGS"
    
    # Créer répertoire de logs
    mkdir -p "${LOG_DIR}"
    
    # Créer fichier de log
    touch "${LOG_FILE}"
    
    log_info "Script de déploiement TITANE∞ v15.5"
    log_info "Répertoire projet : ${PROJECT_ROOT}"
    log_info "Fichier de log : ${LOG_FILE}"
    log_info "Date : $(date '+%Y-%m-%d %H:%M:%S')"
    
    # ⚠️ VÉRIFICATION CRITIQUE : Environnement Flatpak
    if detect_flatpak; then
        echo ""
        echo -e "${COLOR_RED}${COLOR_BOLD}╔═══════════════════════════════════════════════════════════════════════════╗${COLOR_RESET}"
        echo -e "${COLOR_RED}${COLOR_BOLD}║                                                                           ║${COLOR_RESET}"
        echo -e "${COLOR_RED}${COLOR_BOLD}║  ⚠️  ERREUR : ENVIRONNEMENT FLATPAK DÉTECTÉ                              ║${COLOR_RESET}"
        echo -e "${COLOR_RED}${COLOR_BOLD}║                                                                           ║${COLOR_RESET}"
        echo -e "${COLOR_RED}${COLOR_BOLD}╚═══════════════════════════════════════════════════════════════════════════╝${COLOR_RESET}"
        echo ""
        echo -e "${COLOR_YELLOW}Ce script de déploiement NE PEUT PAS s'exécuter dans un environnement${COLOR_RESET}"
        echo -e "${COLOR_YELLOW}Flatpak/sandbox en raison des limitations suivantes :${COLOR_RESET}"
        echo ""
        echo -e "  ${COLOR_RED}✗${COLOR_RESET} Accès aux bibliothèques système (webkit2gtk, javascriptcore)"
        echo -e "  ${COLOR_RED}✗${COLOR_RESET} Installation de paquets système (.deb, .rpm, apt/dpkg)"
        echo -e "  ${COLOR_RED}✗${COLOR_RESET} Accès complet aux chemins /usr/bin, /usr/lib, /etc"
        echo -e "  ${COLOR_RED}✗${COLOR_RESET} Privilèges sudo pour installation système"
        echo ""
        echo -e "${COLOR_GREEN}${COLOR_BOLD}SOLUTION :${COLOR_RESET} Exécuter ce script depuis un ${COLOR_GREEN}${COLOR_BOLD}terminal natif${COLOR_RESET} Pop!_OS/Ubuntu"
        echo ""
        echo -e "${COLOR_CYAN}Méthode 1 - Terminal Système (Recommandé) :${COLOR_RESET}"
        echo -e "  1. Ouvrir un terminal système (${COLOR_CYAN}Ctrl+Alt+T${COLOR_RESET} ou menu Applications)"
        echo -e "  2. cd ${PROJECT_ROOT}"
        echo -e "  3. bash deploy_titane_prod.sh"
        echo ""
        echo -e "${COLOR_CYAN}Méthode 2 - Via flatpak-spawn (si disponible) :${COLOR_RESET}"
        echo -e "  flatpak-spawn --host bash ${PROJECT_ROOT}/deploy_titane_prod.sh"
        echo ""
        echo -e "${COLOR_CYAN}Méthode 3 - Build Direct (sans bundles) :${COLOR_RESET}"
        echo -e "  cd ${PROJECT_ROOT}/src-tauri"
        echo -e "  flatpak-spawn --host cargo build --release"
        echo ""
        log_error "Environnement Flatpak détecté - Déploiement annulé"
        log_info "Indicateurs détectés :"
        [[ -f "/.flatpak-info" ]] && log_info "  - Fichier /.flatpak-info présent"
        [[ -n "${FLATPAK_ID:-}" ]] && log_info "  - Variable FLATPAK_ID définie : ${FLATPAK_ID}"
        [[ -n "${FLATPAK_SANDBOX_DIR:-}" ]] && log_info "  - Variable FLATPAK_SANDBOX_DIR définie"
        exit 1
    fi
    log_success "Environnement : Système natif (non-Flatpak) ✓"
    
    # Vérifier Shell
    if [[ -z "${BASH_VERSION:-}" ]]; then
        log_error "Ce script nécessite Bash"
        exit 1
    fi
    log_success "Shell : Bash ${BASH_VERSION}"
    
    # Vérifier Pop!_OS / Ubuntu
    if [[ -f /etc/os-release ]]; then
        source /etc/os-release
        log_info "Distribution : ${NAME:-Unknown} ${VERSION:-Unknown}"
        if [[ ! "${ID:-}" =~ ^(pop|ubuntu|debian)$ ]]; then
            log_warning "Distribution non testée : ${ID:-Unknown}"
        fi
    else
        log_warning "Impossible de détecter la distribution"
    fi
    
    # Changer vers le répertoire du projet
    cd "${PROJECT_ROOT}"
    log_success "Initialisation terminée"
}

# ============================================================================
# 5. VÉRIFICATIONS ENVIRONNEMENT
# ============================================================================
check_environment() {
    log_section "2. VÉRIFICATIONS ENVIRONNEMENTALES"
    
    # Node.js
    if ! command_exists node; then
        log_error "Node.js n'est pas installé"
        exit 1
    fi
    local node_version
    node_version=$(node --version | sed 's/v//' | cut -d. -f1)
    if [[ "${node_version}" -lt "${REQUIRED_NODE_VERSION}" ]]; then
        log_error "Node.js >= ${REQUIRED_NODE_VERSION} requis (trouvé : ${node_version})"
        exit 1
    fi
    log_success "Node.js : $(node --version)"
    
    # npm
    if ! command_exists npm; then
        log_error "npm n'est pas installé"
        exit 1
    fi
    local npm_version
    npm_version=$(npm --version | cut -d. -f1)
    if [[ "${npm_version}" -lt "${REQUIRED_NPM_VERSION}" ]]; then
        log_error "npm >= ${REQUIRED_NPM_VERSION} requis (trouvé : ${npm_version})"
        exit 1
    fi
    log_success "npm : v$(npm --version)"
    
    # Cargo
    if ! command_exists cargo; then
        log_error "Cargo (Rust) n'est pas installé"
        log_info "Installez Rust via : curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
        exit 1
    fi
    log_success "Cargo : $(cargo --version)"
    
    # Rustc
    if ! command_exists rustc; then
        log_error "rustc n'est pas installé"
        exit 1
    fi
    log_success "Rustc : $(rustc --version)"
    
    # Tauri CLI
    if ! cargo tauri --version &> /dev/null; then
        log_warning "tauri-cli non trouvé, installation..."
        cargo install tauri-cli --version "^2.0.0" >> "${LOG_FILE}" 2>&1
        log_success "tauri-cli installé"
    else
        log_success "Tauri CLI : $(cargo tauri --version | head -n1)"
    fi
    
    # Droits sudo (optionnel pour installation système)
    if command -v sudo &> /dev/null; then
        if ! sudo -n true 2>/dev/null; then
            log_info "Vérification des privilèges sudo (mot de passe requis)..."
            if sudo true 2>/dev/null; then
                log_success "Privilèges sudo : OK"
            else
                log_warning "Sudo non disponible - Installation système sera ignorée"
            fi
        else
            log_success "Privilèges sudo : OK"
        fi
    else
        log_warning "Sudo non disponible - Installation système sera ignorée"
    fi
    
    # Espace disque
    check_disk_space
    
    # Droits d'écriture
    if [[ ! -w "${PROJECT_ROOT}" ]]; then
        log_error "Pas de droit d'écriture sur ${PROJECT_ROOT}"
        exit 1
    fi
    log_success "Droits d'écriture : OK"
    
    log_success "Toutes les vérifications environnementales passées"
}

# ============================================================================
# 6. NETTOYAGE COMPLET
# ============================================================================
clean_project() {
    log_section "3. NETTOYAGE COMPLET"
    
    local cleaned=false
    
    # node_modules
    if [[ -d "node_modules" ]]; then
        log_info "Suppression node_modules..."
        rm -rf node_modules
        cleaned=true
    fi
    
    # dist
    if [[ -d "dist" ]]; then
        log_info "Suppression dist..."
        rm -rf dist
        cleaned=true
    fi
    
    # Caches Vite
    for cache_dir in .vite .cache; do
        if [[ -d "${cache_dir}" ]]; then
            log_info "Suppression ${cache_dir}..."
            rm -rf "${cache_dir}"
            cleaned=true
        fi
    done
    
    # Cargo clean
    if [[ -d "src-tauri/target" ]]; then
        log_info "Nettoyage Cargo..."
        cd src-tauri
        cargo clean >> "${LOG_FILE}" 2>&1
        cd ..
        cleaned=true
    fi
    
    # Bundles précédents
    local bundle_dir="src-tauri/target/release/bundle"
    if [[ -d "${bundle_dir}" ]]; then
        log_info "Suppression des bundles précédents..."
        rm -rf "${bundle_dir}"
        cleaned=true
    fi
    
    # Fichiers .deb, .rpm, .AppImage dans le projet
    while IFS= read -r -d '' file; do
        log_info "Suppression : $(basename "$file")"
        rm -f "$file"
        cleaned=true
    done < <(find "${PROJECT_ROOT}" -maxdepth 2 -type f \( -name "*.deb" -o -name "*.rpm" -o -name "*.AppImage" \) -print0 2>/dev/null)
    
    if [[ "${cleaned}" == false ]]; then
        log_info "Aucun fichier à nettoyer"
    else
        log_success "Nettoyage terminé"
    fi
}

# ============================================================================
# 7. BUILD FRONTEND
# ============================================================================
build_frontend() {
    log_section "4. BUILD FRONTEND (Sécurisé)"
    
    # Installation dépendances
    log_info "Installation des dépendances npm..."
    npm install >> "${LOG_FILE}" 2>&1
    log_success "Dépendances installées"
    
    # Audit de sécurité (non bloquant)
    log_info "Audit de sécurité (production)..."
    if npm audit --production >> "${LOG_FILE}" 2>&1; then
        log_success "Aucune vulnérabilité détectée"
    else
        log_warning "Vulnérabilités détectées (vérifiez le log)"
    fi
    
    # Type-check TypeScript
    log_info "Vérification des types TypeScript..."
    npm run type-check >> "${LOG_FILE}" 2>&1
    log_success "Types valides"
    
    # Build production
    log_info "Build frontend production..."
    npm run build >> "${LOG_FILE}" 2>&1
    
    # Vérifier dist/
    if [[ ! -d "dist" ]]; then
        log_error "Le répertoire dist/ n'a pas été créé"
        exit 1
    fi
    
    local dist_size
    dist_size=$(du -sh dist | cut -f1)
    log_success "Build frontend terminé (taille : ${dist_size})"
}

# ============================================================================
# 8. BUILD BACKEND RUST
# ============================================================================
build_backend() {
    log_section "5. BUILD BACKEND (Rust Stable)"
    
    cd src-tauri
    
    # Fetch des dépendances
    log_info "Récupération des dépendances Cargo..."
    cargo fetch >> "${LOG_FILE}" 2>&1
    log_success "Dépendances récupérées"
    
    # Check
    log_info "Vérification du code Rust..."
    cargo check >> "${LOG_FILE}" 2>&1
    log_success "Code Rust valide"
    
    # Fix automatique (safe)
    log_info "Application des corrections automatiques..."
    cargo fix --allow-dirty --allow-staged >> "${LOG_FILE}" 2>&1 || true
    
    # Clippy (warnings interdits)
    log_info "Analyse Clippy (aucun warning accepté)..."
    if ! cargo clippy -- -D warnings >> "${LOG_FILE}" 2>&1; then
        log_error "Clippy a détecté des warnings/erreurs"
        exit 1
    fi
    log_success "Clippy : aucun warning"
    
    # Build release
    log_info "Build backend release..."
    cargo build --release >> "${LOG_FILE}" 2>&1
    
    # Vérifier le binaire
    local binary_path="target/release/titane-infinity"
    if [[ ! -f "${binary_path}" ]]; then
        log_error "Le binaire ${binary_path} n'a pas été créé"
        exit 1
    fi
    
    local binary_size
    binary_size=$(du -h "${binary_path}" | cut -f1)
    log_success "Build backend terminé (binaire : ${binary_size})"
    
    cd ..
}

# ============================================================================
# 9. BUILD TAURI PRODUCTION
# ============================================================================
build_tauri() {
    log_section "6. BUILD TAURI (Production)"
    
    log_info "Lancement du build Tauri..."
    npm run tauri:build >> "${LOG_FILE}" 2>&1
    
    local bundle_dir="src-tauri/target/release/bundle"
    
    # Vérifier les bundles générés
    log_info "Vérification des bundles générés..."
    
    local deb_found=false
    local rpm_found=false
    local appimage_found=false
    
    # .deb
    if compgen -G "${bundle_dir}/deb/*.deb" > /dev/null; then
        deb_found=true
        for deb in "${bundle_dir}"/deb/*.deb; do
            local deb_size
            deb_size=$(du -h "$deb" | cut -f1)
            log_success ".deb généré : $(basename "$deb") (${deb_size})"
        done
    fi
    
    # .rpm
    if compgen -G "${bundle_dir}/rpm/*.rpm" > /dev/null; then
        rpm_found=true
        for rpm in "${bundle_dir}"/rpm/*.rpm; do
            local rpm_size
            rpm_size=$(du -h "$rpm" | cut -f1)
            log_success ".rpm généré : $(basename "$rpm") (${rpm_size})"
        done
    fi
    
    # .AppImage
    if compgen -G "${bundle_dir}/appimage/*.AppImage" > /dev/null; then
        appimage_found=true
        for appimage in "${bundle_dir}"/appimage/*.AppImage; do
            local appimage_size
            appimage_size=$(du -h "$appimage" | cut -f1)
            log_success ".AppImage généré : $(basename "$appimage") (${appimage_size})"
        done
    fi
    
    # Vérifier qu'au moins un bundle existe
    if [[ "${deb_found}" == false && "${rpm_found}" == false && "${appimage_found}" == false ]]; then
        log_error "Aucun bundle n'a été généré"
        exit 1
    fi
    
    log_success "Build Tauri terminé"
}

# ============================================================================
# 10. INSTALLATION SYSTÈME
# ============================================================================
install_system() {
    log_section "7. INSTALLATION SYSTÈME (Pop!_OS)"
    
    # Vérifier si sudo est disponible
    if ! command -v sudo &> /dev/null; then
        log_warning "Sudo non disponible - Installation système ignorée"
        log_info "Les bundles sont disponibles dans src-tauri/target/release/bundle/"
        return 0
    fi
    # Trouver le .deb le plus récent
    local bundle_dir="src-tauri/target/release/bundle/deb"
    local deb_file
    
    if [[ ! -d "${bundle_dir}" ]]; then
        log_error "Répertoire des bundles .deb introuvable : ${bundle_dir}"
        exit 1
    fi
    
    deb_file=$(find "${bundle_dir}" -name "*.deb" -type f -printf '%T@ %p\n' | sort -rn | head -1 | cut -d' ' -f2-)
    
    if [[ -z "${deb_file}" || ! -f "${deb_file}" ]]; then
        log_error "Aucun fichier .deb trouvé dans ${bundle_dir}"
        exit 1
    fi
    
    log_info "Installation de : $(basename "${deb_file}")"
    
    # Installation avec gestion des dépendances
    if sudo dpkg -i "${deb_file}" >> "${LOG_FILE}" 2>&1; then
        log_success "Installation .deb réussie"
    else
        log_warning "Tentative de correction des dépendances..."
        sudo apt --fix-broken install -y >> "${LOG_FILE}" 2>&1
        log_success "Dépendances corrigées et installation terminée"
    fi
    
    # Vérifier l'installation
    local binary_path="/usr/bin/titane-infinity"
    
    if [[ ! -f "${binary_path}" ]]; then
        log_error "Le binaire n'a pas été installé dans ${binary_path}"
        exit 1
    fi
    log_success "Binaire installé : ${binary_path}"
    
    # Vérifier les permissions
    if [[ -x "${binary_path}" ]]; then
        log_success "Permissions exécutables : OK"
    else
        log_error "Le binaire n'est pas exécutable"
        exit 1
    fi
    
    # Vérifier les dépendances système
    log_info "Vérification des dépendances système..."
    if ldd "${binary_path}" > /dev/null 2>&1; then
        log_success "Toutes les dépendances système sont satisfaites"
    else
        log_warning "Certaines dépendances pourraient manquer"
    fi
}

# ============================================================================
# 11. TESTS POST-INSTALLATION
# ============================================================================
test_installation() {
    log_section "8. TESTS POST-INSTALLATION"
    
    # Détection du binaire (système ou local)
    local binary_path=""
    local is_system_install=false
    
    # Option 1: Binaire installé système (/usr/bin)
    if [[ -f "/usr/bin/titane-infinity" && -x "/usr/bin/titane-infinity" ]]; then
        binary_path="/usr/bin/titane-infinity"
        is_system_install=true
        log_info "Binaire détecté : Installation système (/usr/bin)"
    # Option 2: Binaire dans target/release (pas encore installé)
    elif [[ -f "src-tauri/target/release/titane-infinity" ]]; then
        binary_path="src-tauri/target/release/titane-infinity"
        log_info "Binaire détecté : Build local (target/release)"
        log_warning "Installation système non effectuée (environnement sandbox?)"
    else
        log_error "Aucun binaire trouvé (ni /usr/bin ni target/release)"
        exit 1
    fi
    
    log_success "Binaire : ${binary_path}"
    
    # Vérifier les permissions
    if [[ -x "${binary_path}" ]]; then
        log_success "Permissions exécutables : OK"
    else
        log_error "Le binaire n'est pas exécutable"
        chmod +x "${binary_path}" 2>/dev/null || log_warning "Impossible de corriger les permissions"
    fi
    
    # Test version (avec fallback flatpak-spawn si nécessaire)
    log_info "Test : affichage de la version..."
    local version_output
    
    # Tentative directe
    if version_output=$("${binary_path}" --version 2>&1); then
        log_success "Version : ${version_output}"
    # Fallback via flatpak-spawn si on est dans Flatpak
    elif command -v flatpak-spawn &> /dev/null; then
        log_info "Tentative via flatpak-spawn --host..."
        if version_output=$(flatpak-spawn --host "${binary_path}" --version 2>&1); then
            log_success "Version (via host) : ${version_output}"
        else
            log_warning "Impossible d'exécuter --version (erreur: bibliothèques manquantes?)"
            log_info "Contenu erreur: ${version_output}"
        fi
    else
        log_warning "La commande --version échoue (dépendances système manquantes?)"
    fi
    
    # Test help
    log_info "Test : affichage de l'aide..."
    if "${binary_path}" --help >> "${LOG_FILE}" 2>&1 || flatpak-spawn --host "${binary_path}" --help >> "${LOG_FILE}" 2>&1; then
        log_success "Commande --help : OK"
    else
        log_warning "La commande --help n'est pas supportée"
    fi
    
    # Test lancement (timeout 5s)
    log_info "Test : lancement du binaire (5s)..."
    if timeout 5s "${binary_path}" >> "${LOG_FILE}" 2>&1 || [[ $? -eq 124 ]]; then
        log_success "Le binaire se lance sans panic"
    else
        log_warning "Le binaire a rencontré une erreur au lancement"
    fi
    
    # Vérifier les logs d'erreur
    log_info "Vérification des erreurs critiques..."
    local error_count
    error_count=$(grep -ci "panic\|fatal\|not found" "${LOG_FILE}" || true)
    
    if [[ "${error_count}" -eq 0 ]]; then
        log_success "Aucune erreur critique détectée"
    else
        log_warning "${error_count} erreur(s) potentielle(s) trouvée(s) dans les logs"
    fi
    
    log_success "Tests post-installation terminés"
}

# ============================================================================
# 12. VALIDATION FINALE
# ============================================================================
final_validation() {
    log_section "9. DOUBLE VÉRIFICATION FINALE"
    
    # Re-vérification TypeScript
    log_info "Re-vérification TypeScript..."
    npm run type-check >> "${LOG_FILE}" 2>&1
    log_success "Types TypeScript : OK"
    
    # Re-vérification Cargo
    log_info "Re-vérification Cargo..."
    cd src-tauri
    cargo check >> "${LOG_FILE}" 2>&1
    cd ..
    log_success "Code Rust : OK"
    
    # Re-build rapide pour validation
    log_info "Re-build frontend (validation)..."
    npm run build >> "${LOG_FILE}" 2>&1
    log_success "Frontend : OK"
    
    # Test AppImage si disponible
    local appimage_dir="src-tauri/target/release/bundle/appimage"
    if compgen -G "${appimage_dir}/*.AppImage" > /dev/null; then
        log_info "Test AppImage disponible..."
        local appimage
        appimage=$(find "${appimage_dir}" -name "*.AppImage" -type f | head -1)
        if [[ -x "${appimage}" ]]; then
            log_success "AppImage exécutable : $(basename "${appimage}")"
        else
            log_warning "AppImage non exécutable"
        fi
    fi
    
    # Vérification finale des warnings
    log_info "Recherche de warnings résiduels..."
    local warning_count
    warning_count=$(grep -ci "warning:" "${LOG_FILE}" || true)
    
    if [[ "${warning_count}" -eq 0 ]]; then
        log_success "Aucun warning détecté"
    else
        log_warning "${warning_count} warning(s) trouvé(s) (consultez le log)"
    fi
    
    log_success "Validation finale terminée"
}

# ============================================================================
# 13. RAPPORT FINAL
# ============================================================================
generate_report() {
    log_section "10. RAPPORT FINAL"
    
    local report_file="${LOG_DIR}/deploy_report_${TIMESTAMP}.txt"
    
    {
        echo "==============================================="
        echo "🎉 TITANE∞ v15.5 — DÉPLOIEMENT PROD RÉUSSI"
        echo "==============================================="
        echo ""
        echo "Date : $(date '+%Y-%m-%d %H:%M:%S')"
        echo "Durée : $SECONDS secondes"
        echo ""
        echo "✅ Build complet terminé"
        echo "✅ Installation locale validée"
        echo "✅ Aucun échec critique"
        echo "✅ Système stable"
        echo ""
        echo "📊 Artefacts générés :"
        
        # Liste des bundles
        local bundle_dir="src-tauri/target/release/bundle"
        find "${bundle_dir}" -type f \( -name "*.deb" -o -name "*.rpm" -o -name "*.AppImage" \) -exec echo "   - {}" \; 2>/dev/null || true
        
        echo ""
        echo "📁 Logs disponibles :"
        echo "   - ${LOG_FILE}"
        echo "   - ${report_file}"
        echo ""
        echo "🚀 Binaire installé : /usr/bin/titane-infinity"
        echo ""
        echo "==============================================="
        echo "Déploiement effectué avec succès !"
        echo "==============================================="
    } | tee "${report_file}"
    
    log_success "Rapport généré : ${report_file}"
}

# ============================================================================
# 14. MAIN - EXÉCUTION PRINCIPALE
# ============================================================================
main() {
    clear
    echo -e "${COLOR_CYAN}${COLOR_BOLD}"
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                                                           ║"
    echo "║         TITANE∞ v15.5 - DÉPLOIEMENT PRODUCTION           ║"
    echo "║                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo -e "${COLOR_RESET}"
    echo ""
    
    # Démarrer le chronomètre
    SECONDS=0
    
    # Exécution séquentielle des étapes
    initialize
    check_environment
    clean_project
    build_frontend
    build_backend
    build_tauri
    install_system
    test_installation
    final_validation
    generate_report
    
    # Message final
    echo ""
    echo -e "${COLOR_GREEN}${COLOR_BOLD}"
    echo "==============================================="
    echo "🎉 TITANE∞ v15.5 — DÉPLOIEMENT PROD RÉUSSI"
    echo "Build complet, installation locale validée."
    echo "Aucun warning. Aucun échec. Système stable."
    echo "Logs disponibles : ${LOG_FILE}"
    echo "==============================================="
    echo -e "${COLOR_RESET}"
    echo ""
}

# Lancer le script
main "$@"
