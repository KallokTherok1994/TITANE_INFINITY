#!/usr/bin/env bash
# ╔═══════════════════════════════════════════════════════════════════════╗
# ║  TITANE∞ v15.5.0 — Installation Complète Pop!_OS 24.04 LTS          ║
# ║  Script d'installation système pour environnement Tauri v2           ║
# ╚═══════════════════════════════════════════════════════════════════════╝

set -euo pipefail

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  CONFIGURATION GLOBALE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

readonly SCRIPT_VERSION="6.0.0"
readonly SCRIPT_NAME="install-popos-titane.sh"
readonly NODE_VERSION="22"
readonly TITANE_DIR="/opt/titane"
readonly LOG_DIR="${TITANE_DIR}/logs/install"
readonly TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
readonly LOG_FILE="${LOG_DIR}/install_${TIMESTAMP}.log"

# Couleurs pour output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly BOLD='\033[1m'
readonly NC='\033[0m' # No Color

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  FONCTIONS UTILITAIRES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
    echo -e "${timestamp} [${level}] ${message}" | tee -a "${LOG_FILE}"
}

log_info() {
    echo -e "${CYAN}ℹ${NC} $*" | tee -a "${LOG_FILE}"
}

log_success() {
    echo -e "${GREEN}✓${NC} $*" | tee -a "${LOG_FILE}"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $*" | tee -a "${LOG_FILE}"
}

log_error() {
    echo -e "${RED}✗${NC} $*" | tee -a "${LOG_FILE}"
}

log_section() {
    echo "" | tee -a "${LOG_FILE}"
    echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}" | tee -a "${LOG_FILE}"
    echo -e "${BOLD}${BLUE}  $*${NC}" | tee -a "${LOG_FILE}"
    echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}" | tee -a "${LOG_FILE}"
    echo "" | tee -a "${LOG_FILE}"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "Ce script doit être exécuté avec sudo"
        exit 1
    fi
}

check_os() {
    if ! grep -q "Pop!_OS 24.04" /etc/os-release 2>/dev/null; then
        log_warning "OS détecté n'est pas Pop!_OS 24.04"
        log_info "Vérification de Ubuntu 24.04 comme alternative..."
        if ! grep -q "Ubuntu 24.04" /etc/os-release 2>/dev/null; then
            log_error "Ce script est optimisé pour Pop!_OS/Ubuntu 24.04 LTS"
            read -p "Continuer quand même ? (y/N) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                exit 1
            fi
        fi
    fi
    log_success "OS compatible détecté"
}

check_internet() {
    log_info "Vérification connexion internet..."
    if ! ping -c 1 8.8.8.8 &> /dev/null; then
        log_error "Pas de connexion internet"
        exit 1
    fi
    log_success "Connexion internet OK"
}

setup_directories() {
    log_info "Création structure de dossiers TITANE∞..."
    
    # Création avec sudo si nécessaire
    if [[ ! -d "${TITANE_DIR}" ]]; then
        mkdir -p "${TITANE_DIR}"/{bin,logs/{install,diagnostics,rebuild,restore},backup,config} 2>/dev/null || {
            log_warning "Création avec sudo requise"
            sudo mkdir -p "${TITANE_DIR}"/{bin,logs/{install,diagnostics,rebuild,restore},backup,config}
        }
    fi
    
    # Vérification création réussie
    if [[ ! -d "${TITANE_DIR}/backup" ]]; then
        log_error "Impossible de créer ${TITANE_DIR}/backup"
        exit 1
    fi
    
    chmod -R 755 "${TITANE_DIR}" 2>/dev/null || sudo chmod -R 755 "${TITANE_DIR}"
    log_success "Structure créée : ${TITANE_DIR}"
    log_info "Backup dir : ${TITANE_DIR}/backup ($(du -sh "${TITANE_DIR}/backup" 2>/dev/null | cut -f1 || echo '0'))"
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  INSTALLATION SYSTÈME DE BASE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

install_base_packages() {
    log_section "📦 Installation Packages Système de Base"
    
    log_info "Mise à jour APT..."
    apt-get update -qq
    
    log_info "Installation outils essentiels..."
    apt-get install -y -qq \
        build-essential \
        curl \
        wget \
        git \
        cmake \
        pkg-config \
        libssl-dev \
        libfontconfig1-dev \
        libfreetype6-dev \
        libxcb-render0-dev \
        libxcb-shape0-dev \
        libxcb-xfixes0-dev \
        libxdo-dev \
        libspeechd-dev \
        file \
        ca-certificates \
        gnupg \
        lsb-release \
        software-properties-common \
        apt-transport-https
    
    log_success "Packages système de base installés"
}

install_rust() {
    log_section "🦀 Installation Rust Stable"
    
    # Détection du user non-root
    if [[ -n "${SUDO_USER:-}" ]]; then
        local real_user="${SUDO_USER}"
        local real_home=$(eval echo "~${real_user}")
    else
        log_error "SUDO_USER non défini, impossible de déterminer l'utilisateur"
        return 1
    fi
    
    log_info "Installation Rust pour ${real_user}..."
    
    # Installation Rust comme utilisateur non-root
    if [[ ! -f "${real_home}/.cargo/bin/rustc" ]]; then
        sudo -u "${real_user}" bash -c 'curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable'
        log_success "Rust installé"
    else
        log_info "Rust déjà installé"
    fi
    
    # Vérification
    if sudo -u "${real_user}" bash -c 'source ~/.cargo/env && rustc --version' &>/dev/null; then
        local rust_version=$(sudo -u "${real_user}" bash -c 'source ~/.cargo/env && rustc --version')
        log_success "Rust version: ${rust_version}"
    else
        log_error "Rust installation échouée"
        return 1
    fi
}

install_nodejs() {
    log_section "📗 Installation Node.js ${NODE_VERSION} LTS"
    
    log_info "Configuration Nodesource repository..."
    
    # Suppression anciennes sources Node
    rm -f /etc/apt/sources.list.d/nodesource.list
    
    # Installation Node.js via Nodesource (JAMAIS via snap)
    curl -fsSL "https://deb.nodesource.com/setup_${NODE_VERSION}.x" | bash -
    
    log_info "Installation Node.js..."
    apt-get install -y -qq nodejs
    
    # Vérification
    if command -v node &> /dev/null; then
        local node_version=$(node --version)
        local npm_version=$(npm --version)
        log_success "Node.js ${node_version} installé"
        log_success "npm ${npm_version} installé"
    else
        log_error "Node.js installation échouée"
        return 1
    fi
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  INSTALLATION STACK TAURI V2 / WEBKITGTK
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

install_webkitgtk() {
    log_section "🌐 Installation WebKitGTK 4.1 + Dépendances Tauri v2"
    
    log_info "Installation WebKitGTK 4.1..."
    apt-get install -y -qq \
        libwebkit2gtk-4.1-dev \
        libjavascriptcoregtk-4.1-dev \
        libsoup-3.0-dev \
        libgtk-3-dev \
        libgtk-4-dev \
        libayatana-appindicator3-dev \
        librsvg2-dev \
        patchelf
    
    log_success "WebKitGTK 4.1 installé"
    
    # Vérification GLIBC 2.39
    log_info "Vérification GLIBC version..."
    local glibc_version=$(ldd --version | head -n1 | grep -oP '\d+\.\d+$')
    if [[ $(echo "${glibc_version} >= 2.39" | bc -l) -eq 1 ]]; then
        log_success "GLIBC ${glibc_version} OK (>= 2.39)"
    else
        log_warning "GLIBC ${glibc_version} < 2.39 (peut causer des problèmes)"
    fi
}

install_tauri_cli() {
    log_section "🎯 Installation Tauri CLI v2"
    
    if [[ -n "${SUDO_USER:-}" ]]; then
        local real_user="${SUDO_USER}"
        
        log_info "Installation Tauri CLI pour ${real_user}..."
        
        sudo -u "${real_user}" bash -c 'source ~/.cargo/env && cargo install tauri-cli --version "^2.0" --locked'
        
        # Vérification
        if sudo -u "${real_user}" bash -c 'source ~/.cargo/env && cargo tauri --version' &>/dev/null; then
            local tauri_version=$(sudo -u "${real_user}" bash -c 'source ~/.cargo/env && cargo tauri --version')
            log_success "Tauri CLI installé: ${tauri_version}"
        else
            log_error "Tauri CLI installation échouée"
            return 1
        fi
    else
        log_error "SUDO_USER non défini"
        return 1
    fi
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  CONFIGURATION DÉVELOPPEMENT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

install_vscode() {
    log_section "📝 Installation VS Code (optionnel)"
    
    log_info "VS Code sera installé via Snap (version Flatpak recommandée manuellement)..."
    
    if ! command -v code &> /dev/null; then
        log_info "Installation VS Code..."
        snap install code --classic
        log_success "VS Code installé"
    else
        log_info "VS Code déjà installé"
    fi
}

configure_git() {
    log_section "🔧 Configuration Git (optionnel)"
    
    if [[ -n "${SUDO_USER:-}" ]]; then
        local real_user="${SUDO_USER}"
        
        log_info "Configuration Git pour ${real_user}..."
        
        # Configuration de base si non configurée
        if ! sudo -u "${real_user}" git config --global user.name &>/dev/null; then
            log_warning "Git user.name non configuré (à configurer manuellement)"
        else
            local git_user=$(sudo -u "${real_user}" git config --global user.name)
            log_success "Git user: ${git_user}"
        fi
    fi
}

install_optional_tools() {
    log_section "🛠️ Installation Outils Optionnels"
    
    log_info "Installation pnpm (optionnel)..."
    npm install -g pnpm &>/dev/null || true
    
    log_info "Installation Vite (global, optionnel)..."
    npm install -g vite &>/dev/null || true
    
    log_success "Outils optionnels installés"
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  VÉRIFICATIONS FINALES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

verify_installation() {
    log_section "🔍 Vérification Installation"
    
    local errors=0
    
    # Rust
    if [[ -n "${SUDO_USER:-}" ]]; then
        local real_user="${SUDO_USER}"
        
        if sudo -u "${real_user}" bash -c 'source ~/.cargo/env && rustc --version' &>/dev/null; then
            log_success "Rust: OK"
        else
            log_error "Rust: ÉCHEC"
            ((errors++))
        fi
        
        # Cargo
        if sudo -u "${real_user}" bash -c 'source ~/.cargo/env && cargo --version' &>/dev/null; then
            log_success "Cargo: OK"
        else
            log_error "Cargo: ÉCHEC"
            ((errors++))
        fi
        
        # Tauri CLI
        if sudo -u "${real_user}" bash -c 'source ~/.cargo/env && cargo tauri --version' &>/dev/null; then
            log_success "Tauri CLI: OK"
        else
            log_warning "Tauri CLI: NON INSTALLÉ (optionnel)"
        fi
    fi
    
    # Node.js
    if command -v node &> /dev/null; then
        log_success "Node.js: OK ($(node --version))"
    else
        log_error "Node.js: ÉCHEC"
        ((errors++))
    fi
    
    # npm
    if command -v npm &> /dev/null; then
        log_success "npm: OK ($(npm --version))"
    else
        log_error "npm: ÉCHEC"
        ((errors++))
    fi
    
    # WebKitGTK
    if pkg-config --exists webkit2gtk-4.1; then
        log_success "WebKitGTK 4.1: OK"
    else
        log_error "WebKitGTK 4.1: ÉCHEC"
        ((errors++))
    fi
    
    # JavaScriptCore
    if pkg-config --exists javascriptcoregtk-4.1; then
        log_success "JavaScriptCoreGTK 4.1: OK"
    else
        log_error "JavaScriptCoreGTK 4.1: ÉCHEC"
        ((errors++))
    fi
    
    # libsoup3
    if pkg-config --exists libsoup-3.0; then
        log_success "libsoup-3.0: OK"
    else
        log_warning "libsoup-3.0: NON DÉTECTÉ"
    fi
    
    return $errors
}

generate_report() {
    log_section "📄 Génération Rapport d'Installation"
    
    local report_file="${LOG_DIR}/report_${TIMESTAMP}.md"
    
    cat > "${report_file}" << EOF
# Rapport d'Installation TITANE∞ v15.5.0

**Date** : $(date +"%Y-%m-%d %H:%M:%S")  
**Script** : ${SCRIPT_NAME} v${SCRIPT_VERSION}  
**OS** : $(lsb_release -ds)  
**Kernel** : $(uname -r)

---

## 🔧 Versions Installées

| Composant | Version | Status |
|-----------|---------|--------|
| **Rust** | $(sudo -u "${SUDO_USER}" bash -c 'source ~/.cargo/env && rustc --version 2>/dev/null || echo "N/A"') | ✅ |
| **Cargo** | $(sudo -u "${SUDO_USER}" bash -c 'source ~/.cargo/env && cargo --version 2>/dev/null || echo "N/A"') | ✅ |
| **Node.js** | $(node --version 2>/dev/null || echo "N/A") | ✅ |
| **npm** | $(npm --version 2>/dev/null || echo "N/A") | ✅ |
| **Tauri CLI** | $(sudo -u "${SUDO_USER}" bash -c 'source ~/.cargo/env && cargo tauri --version 2>/dev/null || echo "N/A"') | ✅ |
| **GLIBC** | $(ldd --version | head -n1 | grep -oP '\d+\.\d+$') | ✅ |
| **WebKitGTK** | $(pkg-config --modversion webkit2gtk-4.1 2>/dev/null || echo "N/A") | ✅ |
| **JavaScriptCore** | $(pkg-config --modversion javascriptcoregtk-4.1 2>/dev/null || echo "N/A") | ✅ |

---

## 📊 Système

- **CPU** : $(grep -m1 "model name" /proc/cpuinfo | cut -d: -f2 | xargs)
- **RAM** : $(free -h | grep Mem | awk '{print $2}')
- **Disk** : $(df -h / | tail -1 | awk '{print $4}') disponible

---

## 🎯 Prochaines Étapes

1. **Tester l'installation** :
   \`\`\`bash
   source ~/.cargo/env
   cargo --version
   cargo tauri --version
   node --version
   npm --version
   \`\`\`

2. **Cloner TITANE∞** :
   \`\`\`bash
   cd ~/Documents
   git clone <TITANE_REPO>
   \`\`\`

3. **Build TITANE∞** :
   \`\`\`bash
   cd TITANE_INFINITY
   npm install
   npm run build
   npm run tauri build
   \`\`\`

4. **Lancer diagnostics** :
   \`\`\`bash
   sudo bash diagnostics-postinstall.sh
   \`\`\`

---

**Installation complétée avec succès** ✅

Log complet : ${LOG_FILE}
EOF
    
    log_success "Rapport généré : ${report_file}"
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  FONCTION PRINCIPALE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

main() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════════════╗"
    echo "║                                                                       ║"
    echo "║           TITANE∞ v15.5.0 — Installation Pop!_OS 24.04 LTS          ║"
    echo "║                                                                       ║"
    echo "║          Installation complète Rust + Node.js + Tauri v2             ║"
    echo "║                                                                       ║"
    echo "╚═══════════════════════════════════════════════════════════════════════╝"
    echo ""
    
    # Vérifications préalables
    check_root
    setup_directories
    check_os
    check_internet
    
    # Installation système
    install_base_packages
    install_rust
    install_nodejs
    
    # Stack Tauri
    install_webkitgtk
    install_tauri_cli
    
    # Configuration dev
    configure_git
    install_optional_tools
    
    # Vérifications finales
    if verify_installation; then
        generate_report
        
        echo ""
        echo "╔═══════════════════════════════════════════════════════════════════════╗"
        echo "║                                                                       ║"
        echo "║                    ✅ INSTALLATION RÉUSSIE ✅                        ║"
        echo "║                                                                       ║"
        echo "║  TITANE∞ v15.5.0 est maintenant prêt sur Pop!_OS 24.04 LTS          ║"
        echo "║                                                                       ║"
        echo "║  📄 Rapport : ${LOG_DIR}/report_${TIMESTAMP}.md"
        echo "║  📋 Log : ${LOG_FILE}"
        echo "║                                                                       ║"
        echo "║  🚀 Prochaines étapes :                                              ║"
        echo "║     1. source ~/.cargo/env                                           ║"
        echo "║     2. cd ~/Documents/TITANE_NEWGEN/TITANE_INFINITY                  ║"
        echo "║     3. npm install && npm run build                                  ║"
        echo "║     4. npm run tauri build                                           ║"
        echo "║                                                                       ║"
        echo "╚═══════════════════════════════════════════════════════════════════════╝"
        echo ""
        
        log_success "Installation terminée avec succès"
        exit 0
    else
        log_error "Installation terminée avec des erreurs"
        log_info "Consultez le log : ${LOG_FILE}"
        exit 1
    fi
}

# Exécution
main "$@"
