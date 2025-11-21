#!/usr/bin/env bash
# ╔═══════════════════════════════════════════════════════════════════════╗
# ║  TITANE∞ v15.5.0 — Diagnostics Post-Installation                    ║
# ║  Script de diagnostic complet système TITANE∞                        ║
# ╚═══════════════════════════════════════════════════════════════════════╝

set -euo pipefail

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  CONFIGURATION GLOBALE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

readonly SCRIPT_VERSION="6.0.0"
readonly SCRIPT_NAME="diagnostics-postinstall.sh"
readonly TITANE_DIR="/opt/titane"
readonly LOG_DIR="${TITANE_DIR}/logs/diagnostics"
readonly TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
readonly LOG_FILE="${LOG_DIR}/diagnostics_${TIMESTAMP}.log"
readonly REPORT_FILE="${LOG_DIR}/diagnostics_${TIMESTAMP}.md"

# Couleurs
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly BOLD='\033[1m'
readonly NC='\033[0m'

# Compteurs
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  FONCTIONS UTILITAIRES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

log_info() {
    echo -e "${CYAN}ℹ${NC} $*" | tee -a "${LOG_FILE}"
}

log_success() {
    echo -e "${GREEN}✓${NC} $*" | tee -a "${LOG_FILE}"
    ((PASSED_CHECKS++))
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $*" | tee -a "${LOG_FILE}"
    ((WARNING_CHECKS++))
}

log_error() {
    echo -e "${RED}✗${NC} $*" | tee -a "${LOG_FILE}"
    ((FAILED_CHECKS++))
}

log_section() {
    echo "" | tee -a "${LOG_FILE}"
    echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}" | tee -a "${LOG_FILE}"
    echo -e "${BOLD}${BLUE}  $*${NC}" | tee -a "${LOG_FILE}"
    echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}" | tee -a "${LOG_FILE}"
    echo "" | tee -a "${LOG_FILE}"
}

check_command() {
    local cmd="$1"
    local name="${2:-$cmd}"
    ((TOTAL_CHECKS++))
    
    if command -v "$cmd" &> /dev/null; then
        local version=$("$cmd" --version 2>&1 | head -n1 || echo "N/A")
        log_success "${name}: ${version}"
        return 0
    else
        log_error "${name}: NON INSTALLÉ"
        return 1
    fi
}

check_file() {
    local file="$1"
    local name="${2:-$file}"
    ((TOTAL_CHECKS++))
    
    if [[ -f "$file" ]]; then
        log_success "${name}: EXISTS"
        return 0
    else
        log_error "${name}: MANQUANT"
        return 1
    fi
}

check_dir() {
    local dir="$1"
    local name="${2:-$dir}"
    ((TOTAL_CHECKS++))
    
    if [[ -d "$dir" ]]; then
        log_success "${name}: EXISTS"
        return 0
    else
        log_error "${name}: MANQUANT"
        return 1
    fi
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  DIAGNOSTICS SYSTÈME
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

check_os_environment() {
    log_section "🖥️  Environnement Système"
    
    ((TOTAL_CHECKS++))
    local os_name=$(lsb_release -ds 2>/dev/null || echo "Unknown")
    log_info "OS: ${os_name}"
    if [[ "$os_name" =~ "Pop!_OS 24.04" ]] || [[ "$os_name" =~ "Ubuntu 24.04" ]]; then
        log_success "OS compatible détecté"
    else
        log_warning "OS non officiellement supporté"
    fi
    
    ((TOTAL_CHECKS++))
    local kernel=$(uname -r)
    log_success "Kernel: ${kernel}"
    
    ((TOTAL_CHECKS++))
    local glibc_version=$(ldd --version | head -n1 | grep -oP '\d+\.\d+$')
    log_info "GLIBC: ${glibc_version}"
    if [[ $(echo "${glibc_version} >= 2.39" | bc -l) -eq 1 ]]; then
        log_success "GLIBC ${glibc_version} OK (>= 2.39 requis pour Tauri v2)"
    else
        log_error "GLIBC ${glibc_version} < 2.39 (INCOMPATIBLE avec Tauri v2)"
    fi
    
    ((TOTAL_CHECKS++))
    local disk_usage=$(df -h / | tail -1 | awk '{print $5}' | sed 's/%//')
    log_info "Disk Usage: ${disk_usage}%"
    if [[ $disk_usage -lt 90 ]]; then
        log_success "Espace disque suffisant"
    else
        log_warning "Espace disque faible (${disk_usage}%)"
    fi
    
    ((TOTAL_CHECKS++))
    local ram_total=$(free -h | grep Mem | awk '{print $2}')
    local ram_used=$(free -h | grep Mem | awk '{print $3}')
    log_success "RAM: ${ram_used} / ${ram_total}"
    
    ((TOTAL_CHECKS++))
    local cpu_model=$(grep -m1 "model name" /proc/cpuinfo | cut -d: -f2 | xargs)
    log_success "CPU: ${cpu_model}"
    
    ((TOTAL_CHECKS++))
    if lspci | grep -i vga &>/dev/null; then
        local gpu_model=$(lspci | grep -i vga | cut -d: -f3 | xargs)
        log_success "GPU: ${gpu_model}"
    else
        log_info "GPU: Non détecté"
    fi
}

check_toolchain() {
    log_section "🔧 Toolchain Développement"
    
    # Rust
    if [[ -n "${SUDO_USER:-}" ]]; then
        local real_user="${SUDO_USER}"
        ((TOTAL_CHECKS++))
        if sudo -u "${real_user}" bash -c 'source ~/.cargo/env && rustc --version' &>/dev/null; then
            local rust_version=$(sudo -u "${real_user}" bash -c 'source ~/.cargo/env && rustc --version')
            log_success "Rust: ${rust_version}"
        else
            log_error "Rust: NON INSTALLÉ"
        fi
        
        ((TOTAL_CHECKS++))
        if sudo -u "${real_user}" bash -c 'source ~/.cargo/env && cargo --version' &>/dev/null; then
            local cargo_version=$(sudo -u "${real_user}" bash -c 'source ~/.cargo/env && cargo --version')
            log_success "Cargo: ${cargo_version}"
        else
            log_error "Cargo: NON INSTALLÉ"
        fi
        
        ((TOTAL_CHECKS++))
        if sudo -u "${real_user}" bash -c 'source ~/.cargo/env && rustup show' &>/dev/null; then
            local rustup_info=$(sudo -u "${real_user}" bash -c 'source ~/.cargo/env && rustup show' | grep "default" || echo "stable")
            log_success "Rustup: ${rustup_info}"
        else
            log_warning "Rustup: Non configuré"
        fi
        
        ((TOTAL_CHECKS++))
        if sudo -u "${real_user}" bash -c 'source ~/.cargo/env && cargo tauri --version' &>/dev/null; then
            local tauri_version=$(sudo -u "${real_user}" bash -c 'source ~/.cargo/env && cargo tauri --version')
            log_success "Tauri CLI: ${tauri_version}"
        else
            log_warning "Tauri CLI: NON INSTALLÉ (exécuter: cargo install tauri-cli)"
        fi
    else
        log_warning "SUDO_USER non défini, vérifications Rust sautées"
    fi
    
    # Node.js
    check_command node "Node.js"
    check_command npm "npm"
    
    ((TOTAL_CHECKS++))
    if command -v pnpm &> /dev/null; then
        local pnpm_version=$(pnpm --version)
        log_success "pnpm: ${pnpm_version} (optionnel)"
    else
        log_info "pnpm: Non installé (optionnel)"
    fi
    
    ((TOTAL_CHECKS++))
    if command -v vite &> /dev/null; then
        local vite_version=$(vite --version 2>&1 | head -n1)
        log_success "Vite: ${vite_version} (optionnel)"
    else
        log_info "Vite: Non installé (sera installé via npm)"
    fi
    
    # Build tools
    check_command gcc "GCC"
    check_command g++ "G++"
    check_command make "Make"
    check_command cmake "CMake"
    check_command pkg-config "pkg-config"
}

check_webkit_stack() {
    log_section "🌐 Stack WebKitGTK / GTK"
    
    ((TOTAL_CHECKS++))
    if pkg-config --exists webkit2gtk-4.1; then
        local webkit_version=$(pkg-config --modversion webkit2gtk-4.1)
        log_success "WebKitGTK 4.1: ${webkit_version}"
    else
        log_error "WebKitGTK 4.1: NON INSTALLÉ (requis pour Tauri v2)"
    fi
    
    ((TOTAL_CHECKS++))
    if pkg-config --exists javascriptcoregtk-4.1; then
        local jscore_version=$(pkg-config --modversion javascriptcoregtk-4.1)
        log_success "JavaScriptCoreGTK 4.1: ${jscore_version}"
    else
        log_error "JavaScriptCoreGTK 4.1: NON INSTALLÉ"
    fi
    
    ((TOTAL_CHECKS++))
    if pkg-config --exists libsoup-3.0; then
        local soup_version=$(pkg-config --modversion libsoup-3.0)
        log_success "libsoup-3.0: ${soup_version}"
    else
        log_error "libsoup-3.0: NON INSTALLÉ"
    fi
    
    ((TOTAL_CHECKS++))
    if pkg-config --exists gtk+-3.0; then
        local gtk3_version=$(pkg-config --modversion gtk+-3.0)
        log_success "GTK+ 3.0: ${gtk3_version}"
    else
        log_warning "GTK+ 3.0: Non détecté"
    fi
    
    ((TOTAL_CHECKS++))
    if pkg-config --exists gtk4; then
        local gtk4_version=$(pkg-config --modversion gtk4)
        log_success "GTK 4: ${gtk4_version}"
    else
        log_info "GTK 4: Non installé (optionnel)"
    fi
    
    # Vérifier conflits WebKitGTK 4.0
    ((TOTAL_CHECKS++))
    if pkg-config --exists webkit2gtk-4.0; then
        log_warning "WebKitGTK 4.0 détecté (peut causer des conflits avec 4.1)"
    else
        log_success "Pas de WebKitGTK 4.0 conflictuel"
    fi
}

check_titane_project() {
    log_section "📦 Projet TITANE∞"
    
    # Détecter le projet
    local titane_path=""
    if [[ -n "${SUDO_USER:-}" ]]; then
        local real_user="${SUDO_USER}"
        local real_home=$(eval echo "~${real_user}")
        
        # Chemins possibles
        local possible_paths=(
            "${real_home}/Documents/TITANE_NEWGEN/TITANE_INFINITY"
            "${real_home}/Documents/TITANE_INFINITY"
            "${real_home}/TITANE_INFINITY"
            "/opt/titane/TITANE_INFINITY"
        )
        
        for path in "${possible_paths[@]}"; do
            if [[ -d "$path" ]]; then
                titane_path="$path"
                break
            fi
        done
    fi
    
    if [[ -n "$titane_path" ]]; then
        log_success "Projet TITANE∞ trouvé: ${titane_path}"
        
        # Vérifier fichiers clés
        check_file "${titane_path}/package.json" "package.json"
        check_file "${titane_path}/tauri.conf.json" "tauri.conf.json"
        check_file "${titane_path}/vite.config.ts" "vite.config.ts"
        check_file "${titane_path}/src-tauri/Cargo.toml" "Cargo.toml (backend)"
        check_file "${titane_path}/src/App.tsx" "App.tsx"
        check_file "${titane_path}/src/main.tsx" "main.tsx"
        
        # Vérifier dossiers
        check_dir "${titane_path}/src" "src/"
        check_dir "${titane_path}/src-tauri/src" "src-tauri/src/"
        
        ((TOTAL_CHECKS++))
        if [[ -d "${titane_path}/node_modules" ]]; then
            log_success "node_modules/: EXISTS"
        else
            log_warning "node_modules/: MANQUANT (exécuter: npm install)"
        fi
        
        ((TOTAL_CHECKS++))
        if [[ -d "${titane_path}/dist" ]]; then
            log_success "dist/: EXISTS (frontend buildé)"
        else
            log_info "dist/: Pas encore généré (normal)"
        fi
        
        ((TOTAL_CHECKS++))
        if [[ -d "${titane_path}/src-tauri/target" ]]; then
            log_success "src-tauri/target/: EXISTS (backend buildé)"
        else
            log_info "src-tauri/target/: Pas encore généré (normal)"
        fi
        
        # Vérifier versions dans package.json
        ((TOTAL_CHECKS++))
        if [[ -f "${titane_path}/package.json" ]]; then
            local pkg_version=$(grep -oP '"version":\s*"\K[^"]+' "${titane_path}/package.json" | head -n1)
            log_success "Version TITANE∞: ${pkg_version}"
        fi
        
    else
        log_error "Projet TITANE∞ NON TROUVÉ dans les emplacements habituels"
        log_info "Cloner depuis: git clone <REPO_URL> ~/Documents/TITANE_NEWGEN/TITANE_INFINITY"
    fi
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  GÉNÉRATION RAPPORT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

generate_report() {
    log_section "📄 Génération Rapport"
    
    cat > "${REPORT_FILE}" << EOF
# Rapport Diagnostics TITANE∞ v15.5.0

**Date** : $(date +"%Y-%m-%d %H:%M:%S")  
**Script** : ${SCRIPT_NAME} v${SCRIPT_VERSION}  
**Système** : $(lsb_release -ds) $(uname -r)

---

## 📊 Résumé

| Métrique | Valeur |
|----------|--------|
| **Total Checks** | ${TOTAL_CHECKS} |
| **✅ Réussis** | ${PASSED_CHECKS} |
| **⚠️ Avertissements** | ${WARNING_CHECKS} |
| **❌ Échecs** | ${FAILED_CHECKS} |
| **Score** | $((PASSED_CHECKS * 100 / TOTAL_CHECKS))% |

---

## 🖥️ Système

- **OS** : $(lsb_release -ds)
- **Kernel** : $(uname -r)
- **GLIBC** : $(ldd --version | head -n1 | grep -oP '\d+\.\d+$')
- **CPU** : $(grep -m1 "model name" /proc/cpuinfo | cut -d: -f2 | xargs)
- **RAM** : $(free -h | grep Mem | awk '{print $2}')
- **Disk** : $(df -h / | tail -1 | awk '{print $4}') libre

---

## 🔧 Toolchain

| Outil | Version |
|-------|---------|
| **Rust** | $(sudo -u "${SUDO_USER:-$USER}" bash -c 'source ~/.cargo/env && rustc --version 2>/dev/null || echo "N/A"') |
| **Cargo** | $(sudo -u "${SUDO_USER:-$USER}" bash -c 'source ~/.cargo/env && cargo --version 2>/dev/null || echo "N/A"') |
| **Tauri CLI** | $(sudo -u "${SUDO_USER:-$USER}" bash -c 'source ~/.cargo/env && cargo tauri --version 2>/dev/null || echo "N/A"') |
| **Node.js** | $(node --version 2>/dev/null || echo "N/A") |
| **npm** | $(npm --version 2>/dev/null || echo "N/A") |

---

## 🌐 Stack WebKitGTK

| Composant | Version |
|-----------|---------|
| **WebKitGTK 4.1** | $(pkg-config --modversion webkit2gtk-4.1 2>/dev/null || echo "NON INSTALLÉ") |
| **JavaScriptCore 4.1** | $(pkg-config --modversion javascriptcoregtk-4.1 2>/dev/null || echo "NON INSTALLÉ") |
| **libsoup-3.0** | $(pkg-config --modversion libsoup-3.0 2>/dev/null || echo "NON INSTALLÉ") |
| **GTK+ 3** | $(pkg-config --modversion gtk+-3.0 2>/dev/null || echo "NON INSTALLÉ") |
| **GTK 4** | $(pkg-config --modversion gtk4 2>/dev/null || echo "NON INSTALLÉ") |

---

## 📦 Projet TITANE∞

EOF

    # Ajouter info projet si trouvé
    local titane_path=""
    if [[ -n "${SUDO_USER:-}" ]]; then
        local real_user="${SUDO_USER}"
        local real_home=$(eval echo "~${real_user}")
        titane_path="${real_home}/Documents/TITANE_NEWGEN/TITANE_INFINITY"
    fi
    
    if [[ -d "$titane_path" ]]; then
        cat >> "${REPORT_FILE}" << EOF
- **Path** : ${titane_path}
- **Version** : $(grep -oP '"version":\s*"\K[^"]+' "${titane_path}/package.json" 2>/dev/null || echo "N/A")
- **node_modules** : $([ -d "${titane_path}/node_modules" ] && echo "✅ OK" || echo "❌ Manquant")
- **dist** : $([ -d "${titane_path}/dist" ] && echo "✅ Buildé" || echo "⚠️ Non buildé")
- **target** : $([ -d "${titane_path}/src-tauri/target" ] && echo "✅ Buildé" || echo "⚠️ Non buildé")
EOF
    else
        cat >> "${REPORT_FILE}" << EOF
⚠️ **Projet non trouvé** — Cloner depuis Git
EOF
    fi
    
    cat >> "${REPORT_FILE}" << EOF

---

## 🎯 Recommandations

EOF
    
    if [[ $FAILED_CHECKS -eq 0 ]]; then
        cat >> "${REPORT_FILE}" << EOF
✅ **Système prêt pour TITANE∞**

Prochaines étapes :
1. \`cd ~/Documents/TITANE_NEWGEN/TITANE_INFINITY\`
2. \`npm install\`
3. \`npm run build\`
4. \`npm run tauri build\`
EOF
    else
        cat >> "${REPORT_FILE}" << EOF
⚠️ **${FAILED_CHECKS} problème(s) détecté(s)**

Actions requises :
1. Consulter le log : \`${LOG_FILE}\`
2. Réinstaller composants manquants
3. Relancer diagnostics : \`sudo bash ${SCRIPT_NAME}\`
EOF
    fi
    
    cat >> "${REPORT_FILE}" << EOF

---

**Log complet** : ${LOG_FILE}
EOF
    
    log_success "Rapport généré : ${REPORT_FILE}"
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  FONCTION PRINCIPALE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

main() {
    # Création dossiers si nécessaire
    log_info "Vérification structure /opt/titane..."
    
    # Création LOG_DIR
    if [[ ! -d "${LOG_DIR}" ]]; then
        mkdir -p "${LOG_DIR}" 2>/dev/null || sudo mkdir -p "${LOG_DIR}"
    fi
    
    # Création BACKUP_DIR (critique pour restore-environment.sh)
    if [[ ! -d "${BACKUP_DIR}" ]]; then
        echo "ℹ️  Création dossier backup : ${BACKUP_DIR}"
        mkdir -p "${BACKUP_DIR}" 2>/dev/null || sudo mkdir -p "${BACKUP_DIR}"
        chmod 755 "${BACKUP_DIR}" 2>/dev/null || sudo chmod 755 "${BACKUP_DIR}"
    fi
    
    # Vérification finale
    if [[ ! -d "${LOG_DIR}" ]] || [[ ! -d "${BACKUP_DIR}" ]]; then
        echo "❌ Impossible de créer structure /opt/titane"
        exit 1
    fi
    
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════════════╗"
    echo "║                                                                       ║"
    echo "║           TITANE∞ v15.5.0 — Diagnostics Post-Installation           ║"
    echo "║                                                                       ║"
    echo "║              Vérification complète du système TITANE∞                ║"
    echo "║                                                                       ║"
    echo "╚═══════════════════════════════════════════════════════════════════════╝"
    echo ""
    
    # Exécution diagnostics
    check_os_environment
    check_toolchain
    check_webkit_stack
    check_titane_project
    
    # Génération rapport
    generate_report
    
    # Résumé final
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════════════╗"
    echo "║                                                                       ║"
    echo "║                    📊 DIAGNOSTICS TERMINÉS                           ║"
    echo "║                                                                       ║"
    echo "║  Total Checks : ${TOTAL_CHECKS}"
    echo "║  ✅ Réussis   : ${PASSED_CHECKS}"
    echo "║  ⚠️  Warnings  : ${WARNING_CHECKS}"
    echo "║  ❌ Échecs    : ${FAILED_CHECKS}"
    echo "║  Score        : $((PASSED_CHECKS * 100 / TOTAL_CHECKS))%"
    echo "║                                                                       ║"
    echo "║  📄 Rapport : ${REPORT_FILE}"
    echo "║  📋 Log     : ${LOG_FILE}"
    echo "║                                                                       ║"
    echo "╚═══════════════════════════════════════════════════════════════════════╝"
    echo ""
    
    if [[ $FAILED_CHECKS -eq 0 ]]; then
        log_success "✅ Système TITANE∞ opérationnel"
        exit 0
    else
        log_warning "⚠️ ${FAILED_CHECKS} problème(s) détecté(s), consultez le rapport"
        exit 1
    fi
}

# Exécution
main "$@"
