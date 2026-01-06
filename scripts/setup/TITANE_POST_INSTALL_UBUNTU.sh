#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# 🚀 TITANE∞ — SUPER-PROMPT POST-INSTALLATION UBUNTU 24.04 LTS
# ═══════════════════════════════════════════════════════════════════════════════
# Script d'installation COMPLÈTE de l'environnement de développement TITANE∞
# À exécuter après une installation fraîche d'Ubuntu 24.04 LTS
# 
# Auteur: Kevin Thibault / Claude AI
# Date: $(date +%Y-%m-%d)
# Version: 1.0.0
# 
# USAGE:
#   chmod +x TITANE_POST_INSTALL_UBUNTU.sh
#   ./TITANE_POST_INSTALL_UBUNTU.sh
#
# Ce script effectue :
#   1. Mise à jour système complète
#   2. Installation des dépendances Tauri v2
#   3. Installation Rust + composants
#   4. Installation Node.js via NVM
#   5. Installation VSCode + extensions
#   6. Restauration des configurations (SSH, Git, etc.)
#   7. Clonage et configuration TITANE_INFINITY
#   8. Validation complète de l'environnement
# ═══════════════════════════════════════════════════════════════════════════════

set -e  # Arrêt en cas d'erreur

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_DIR="$HOME/.titane_install_logs"
LOG_FILE="$LOG_DIR/install_$TIMESTAMP.log"
TITANE_REPO="git@github.com:KallokTherok1994/TITANE_INFINITY.git"
PROJECTS_DIR="$HOME/Projets"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# ═══════════════════════════════════════════════════════════════════════════════
# FONCTIONS UTILITAIRES
# ═══════════════════════════════════════════════════════════════════════════════

log_header() {
    echo -e "\n${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${PURPLE}  $1${NC}"
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}\n"
    echo "[$TIMESTAMP] === $1 ===" >> "$LOG_FILE"
}

log_step() {
    echo -e "${CYAN}→ $1${NC}"
    echo "[$TIMESTAMP] STEP: $1" >> "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
    echo "[$TIMESTAMP] SUCCESS: $1" >> "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    echo "[$TIMESTAMP] WARNING: $1" >> "$LOG_FILE"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
    echo "[$TIMESTAMP] ERROR: $1" >> "$LOG_FILE"
}

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
    echo "[$TIMESTAMP] INFO: $1" >> "$LOG_FILE"
}

check_command() {
    if command -v "$1" &> /dev/null; then
        return 0
    else
        return 1
    fi
}

confirm_step() {
    echo -e "${YELLOW}"
    read -p "Continuer avec $1? [O/n] " response
    echo -e "${NC}"
    case "$response" in
        [nN][oO]|[nN]) 
            return 1
            ;;
        *)
            return 0
            ;;
    esac
}

# ═══════════════════════════════════════════════════════════════════════════════
# BANNIÈRE DE DÉMARRAGE
# ═══════════════════════════════════════════════════════════════════════════════

clear
echo -e "${PURPLE}"
cat << 'EOF'
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║   ████████╗██╗████████╗ █████╗ ███╗   ██╗███████╗    ∞                       ║
║   ╚══██╔══╝██║╚══██╔══╝██╔══██╗████╗  ██║██╔════╝                            ║
║      ██║   ██║   ██║   ███████║██╔██╗ ██║█████╗                              ║
║      ██║   ██║   ██║   ██╔══██║██║╚██╗██║██╔══╝                              ║
║      ██║   ██║   ██║   ██║  ██║██║ ╚████║███████╗                            ║
║      ╚═╝   ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝                            ║
║                                                                               ║
║            🚀 SUPER-PROMPT POST-INSTALLATION — UBUNTU 24.04 LTS              ║
║                   Configuration complète environnement TITANE∞               ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${YELLOW}Date: $(date '+%A %d %B %Y - %H:%M:%S')${NC}"
echo -e "${YELLOW}Utilisateur: $USER${NC}"
echo -e "${YELLOW}Système: $(lsb_release -d 2>/dev/null | cut -f2 || echo 'Ubuntu')${NC}"
echo ""

# Créer le répertoire de logs
mkdir -p "$LOG_DIR"
touch "$LOG_FILE"

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 0 : VÉRIFICATION DE L'ENVIRONNEMENT
# ═══════════════════════════════════════════════════════════════════════════════

log_header "PHASE 0 : VÉRIFICATION DE L'ENVIRONNEMENT"

# Vérifier qu'on est bien sur Ubuntu 24.04
log_step "Vérification du système d'exploitation..."
if lsb_release -d 2>/dev/null | grep -q "Ubuntu 24.04"; then
    log_success "Ubuntu 24.04 LTS détecté"
else
    OS_INFO=$(lsb_release -d 2>/dev/null | cut -f2 || echo "Système inconnu")
    log_warning "Système détecté: $OS_INFO"
    log_warning "Ce script est optimisé pour Ubuntu 24.04 LTS"
    if ! confirm_step "l'installation sur ce système"; then
        log_error "Installation annulée"
        exit 1
    fi
fi

# Vérifier la connexion internet
log_step "Vérification de la connexion internet..."
if ping -c 1 google.com &> /dev/null; then
    log_success "Connexion internet fonctionnelle"
else
    log_error "Pas de connexion internet détectée"
    log_error "Une connexion est requise pour l'installation"
    exit 1
fi

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 1 : MISE À JOUR SYSTÈME
# ═══════════════════════════════════════════════════════════════════════════════

log_header "PHASE 1 : MISE À JOUR SYSTÈME"

log_step "Mise à jour des sources APT..."
sudo apt update 2>&1 | tee -a "$LOG_FILE"
log_success "Sources mises à jour"

log_step "Mise à niveau des packages..."
sudo apt upgrade -y 2>&1 | tee -a "$LOG_FILE"
log_success "Packages mis à niveau"

log_step "Installation des outils essentiels..."
sudo apt install -y \
    curl \
    wget \
    git \
    build-essential \
    software-properties-common \
    ca-certificates \
    gnupg \
    lsb-release \
    apt-transport-https \
    pkg-config \
    file \
    2>&1 | tee -a "$LOG_FILE"
log_success "Outils essentiels installés"

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 2 : DÉPENDANCES TAURI v2 (CRITIQUE)
# ═══════════════════════════════════════════════════════════════════════════════

log_header "PHASE 2 : DÉPENDANCES TAURI v2"

log_step "Installation des dépendances système pour Tauri v2..."
sudo apt install -y \
    libgtk-3-dev \
    libwebkit2gtk-4.1-dev \
    libjavascriptcoregtk-4.1-dev \
    libsoup-3.0-dev \
    libayatana-appindicator3-dev \
    libasound2-dev \
    librsvg2-dev \
    patchelf \
    2>&1 | tee -a "$LOG_FILE"
log_success "Dépendances Tauri v2 installées"

# Vérification WebKit
log_step "Vérification de WebKit2GTK..."
WEBKIT_VERSION=$(pkg-config --modversion webkit2gtk-4.1 2>/dev/null || echo "NON TROUVÉ")
if [ "$WEBKIT_VERSION" != "NON TROUVÉ" ]; then
    log_success "WebKit2GTK version: $WEBKIT_VERSION"
else
    log_error "WebKit2GTK non trouvé - installation peut avoir échoué"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 3 : INSTALLATION RUST
# ═══════════════════════════════════════════════════════════════════════════════

log_header "PHASE 3 : INSTALLATION RUST"

if check_command rustc; then
    RUST_VERSION=$(rustc --version)
    log_info "Rust déjà installé: $RUST_VERSION"
    log_step "Mise à jour de Rust..."
    rustup update 2>&1 | tee -a "$LOG_FILE"
else
    log_step "Installation de Rust via rustup..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y 2>&1 | tee -a "$LOG_FILE"
    
    # Charger l'environnement Rust
    source "$HOME/.cargo/env"
    log_success "Rust installé"
fi

# Configuration des toolchains
log_step "Configuration des toolchains Rust..."
source "$HOME/.cargo/env"

rustup default stable 2>&1 | tee -a "$LOG_FILE"
log_success "Toolchain stable configurée"

rustup toolchain install nightly 2>&1 | tee -a "$LOG_FILE"
log_success "Toolchain nightly installée"

log_step "Installation des composants Rust..."
rustup component add rustfmt clippy 2>&1 | tee -a "$LOG_FILE"
log_success "rustfmt et clippy installés"

log_step "Installation du target wasm32..."
rustup target add wasm32-unknown-unknown 2>&1 | tee -a "$LOG_FILE"
log_success "Target wasm32-unknown-unknown installé"

# Vérification finale Rust
log_step "Vérification de l'installation Rust..."
echo -e "${CYAN}  rustc: $(rustc --version)${NC}"
echo -e "${CYAN}  cargo: $(cargo --version)${NC}"
echo -e "${CYAN}  rustfmt: $(rustfmt --version)${NC}"
log_success "Rust configuré correctement"

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 4 : INSTALLATION NODE.JS VIA NVM
# ═══════════════════════════════════════════════════════════════════════════════

log_header "PHASE 4 : INSTALLATION NODE.JS VIA NVM"

if check_command node; then
    NODE_VERSION=$(node --version)
    log_info "Node.js déjà installé: $NODE_VERSION"
else
    log_step "Installation de NVM (Node Version Manager)..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash 2>&1 | tee -a "$LOG_FILE"
    
    # Charger NVM
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
    
    log_success "NVM installé"
    
    log_step "Installation de Node.js LTS..."
    nvm install --lts 2>&1 | tee -a "$LOG_FILE"
    nvm use --lts 2>&1 | tee -a "$LOG_FILE"
    nvm alias default lts/* 2>&1 | tee -a "$LOG_FILE"
    log_success "Node.js LTS installé"
fi

# Recharger NVM si nécessaire
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Vérification finale Node.js
log_step "Vérification de l'installation Node.js..."
echo -e "${CYAN}  node: $(node --version)${NC}"
if check_command corepack; then
    echo -e "${CYAN}  corepack: $(corepack --version 2>/dev/null | head -1)${NC}"
fi

if check_command pnpm; then
    echo -e "${CYAN}  pnpm: $(pnpm --version)${NC}"
elif check_command corepack; then
    echo -e "${CYAN}  pnpm (corepack): $(corepack pnpm --version 2>/dev/null)${NC}"
else
    echo -e "${CYAN}  pnpm: NON TROUVÉ${NC}"
fi
log_success "Node.js configuré correctement"

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 5 : INSTALLATION VSCODE
# ═══════════════════════════════════════════════════════════════════════════════

log_header "PHASE 5 : INSTALLATION VSCODE"

if check_command code; then
    log_info "VSCode déjà installé: $(code --version | head -1)"
else
    log_step "Ajout du repository Microsoft..."
    wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > /tmp/packages.microsoft.gpg
    sudo install -D -o root -g root -m 644 /tmp/packages.microsoft.gpg /etc/apt/keyrings/packages.microsoft.gpg
    sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/keyrings/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
    rm -f /tmp/packages.microsoft.gpg
    log_success "Repository Microsoft ajouté"
    
    log_step "Installation de VSCode..."
    sudo apt update 2>&1 | tee -a "$LOG_FILE"
    sudo apt install -y code 2>&1 | tee -a "$LOG_FILE"
    log_success "VSCode installé"
fi

# Installation des extensions
log_step "Installation des extensions VSCode essentielles..."

VSCODE_EXTENSIONS=(
    "rust-lang.rust-analyzer"
    "tauri-apps.tauri-vscode"
    "dbaeumer.vscode-eslint"
    "esbenp.prettier-vscode"
    "eamodio.gitlens"
    "yzhang.markdown-all-in-one"
    "bradlc.vscode-tailwindcss"
    "formulahendry.auto-rename-tag"
    "usernamehw.errorlens"
)

for ext in "${VSCODE_EXTENSIONS[@]}"; do
    log_info "Installation: $ext"
    code --install-extension "$ext" --force 2>&1 | tee -a "$LOG_FILE" || true
done
log_success "Extensions VSCode installées"

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 6 : RESTAURATION DES CONFIGURATIONS
# ═══════════════════════════════════════════════════════════════════════════════

log_header "PHASE 6 : RESTAURATION DES CONFIGURATIONS"

echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}  Cette phase nécessite votre backup précédent${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Demander le chemin du backup
read -p "Chemin vers le backup (ex: /media/usb/BACKUP_TITANE_*) [ou ENTER pour ignorer]: " BACKUP_PATH

if [ -n "$BACKUP_PATH" ] && [ -d "$BACKUP_PATH" ]; then
    log_step "Backup trouvé: $BACKUP_PATH"
    
    # 6.1 Restauration des clés SSH
    if [ -d "$BACKUP_PATH/ssh_keys" ]; then
        log_step "Restauration des clés SSH..."
        mkdir -p "$HOME/.ssh"
        cp -r "$BACKUP_PATH/ssh_keys/." "$HOME/.ssh/"
        chmod 700 "$HOME/.ssh"
        chmod 600 "$HOME/.ssh/id_"* 2>/dev/null || true
        chmod 644 "$HOME/.ssh/id_"*.pub 2>/dev/null || true
        chmod 644 "$HOME/.ssh/known_hosts" 2>/dev/null || true
        chmod 644 "$HOME/.ssh/config" 2>/dev/null || true
        log_success "Clés SSH restaurées"
        
        # Test connexion GitHub
        log_step "Test de connexion GitHub..."
        if ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
            log_success "Connexion GitHub fonctionnelle"
        else
            log_warning "Vérifiez la connexion GitHub manuellement"
        fi
    else
        log_warning "Pas de clés SSH dans le backup"
    fi
    
    # 6.2 Restauration de la configuration Git
    if [ -f "$BACKUP_PATH/system_configs/.gitconfig" ]; then
        log_step "Restauration de la configuration Git..."
        cp "$BACKUP_PATH/system_configs/.gitconfig" "$HOME/.gitconfig"
        log_success "Configuration Git restaurée"
    fi
    
    # 6.3 Restauration des paramètres VSCode
    if [ -d "$BACKUP_PATH/dev_env/vscode" ]; then
        log_step "Restauration des paramètres VSCode..."
        mkdir -p "$HOME/.config/Code/User"
        
        if [ -f "$BACKUP_PATH/dev_env/vscode/settings.json" ]; then
            cp "$BACKUP_PATH/dev_env/vscode/settings.json" "$HOME/.config/Code/User/"
        fi
        if [ -f "$BACKUP_PATH/dev_env/vscode/keybindings.json" ]; then
            cp "$BACKUP_PATH/dev_env/vscode/keybindings.json" "$HOME/.config/Code/User/"
        fi
        if [ -d "$BACKUP_PATH/dev_env/vscode/snippets" ]; then
            cp -r "$BACKUP_PATH/dev_env/vscode/snippets" "$HOME/.config/Code/User/"
        fi
        log_success "Paramètres VSCode restaurés"
        
        # Installer les extensions additionnelles du backup
        if [ -f "$BACKUP_PATH/dev_env/vscode/reinstall_extensions.sh" ]; then
            log_step "Installation des extensions VSCode du backup..."
            bash "$BACKUP_PATH/dev_env/vscode/reinstall_extensions.sh" 2>&1 | tee -a "$LOG_FILE" || true
            log_success "Extensions additionnelles installées"
        fi
    fi
    
else
    log_warning "Pas de backup spécifié ou introuvable"
    log_info "Vous devrez configurer manuellement:"
    echo "  - Clés SSH (ssh-keygen -t ed25519)"
    echo "  - Configuration Git (git config --global user.name/email)"
    echo ""
    
    # Configuration Git basique
    if ! [ -f "$HOME/.gitconfig" ]; then
        log_step "Configuration Git basique..."
        read -p "Votre nom pour Git: " GIT_NAME
        read -p "Votre email pour Git: " GIT_EMAIL
        
        if [ -n "$GIT_NAME" ] && [ -n "$GIT_EMAIL" ]; then
            git config --global user.name "$GIT_NAME"
            git config --global user.email "$GIT_EMAIL"
            git config --global init.defaultBranch main
            git config --global core.editor "code --wait"
            log_success "Configuration Git créée"
        fi
    fi
fi

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 7 : CLONAGE TITANE_INFINITY
# ═══════════════════════════════════════════════════════════════════════════════

log_header "PHASE 7 : CLONAGE TITANE_INFINITY"

# Créer le répertoire de projets
log_step "Création du répertoire de projets..."
mkdir -p "$PROJECTS_DIR"
cd "$PROJECTS_DIR"

if [ -d "$PROJECTS_DIR/TITANE_INFINITY" ]; then
    log_info "TITANE_INFINITY existe déjà"
    log_step "Mise à jour du repository..."
    cd "$PROJECTS_DIR/TITANE_INFINITY"
    git pull origin main 2>&1 | tee -a "$LOG_FILE" || log_warning "Pull échoué - vérifiez manuellement"
else
    log_step "Clonage de TITANE_INFINITY..."
    
    # Vérifier si SSH fonctionne, sinon utiliser HTTPS
    if ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
        git clone "$TITANE_REPO" 2>&1 | tee -a "$LOG_FILE"
        log_success "Repository cloné via SSH"
    else
        log_warning "SSH non configuré, utilisation de HTTPS"
        git clone "https://github.com/KallokTherok1994/TITANE_INFINITY.git" 2>&1 | tee -a "$LOG_FILE"
        log_success "Repository cloné via HTTPS"
    fi
fi

cd "$PROJECTS_DIR/TITANE_INFINITY"

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 8 : INSTALLATION DES DÉPENDANCES TITANE
# ═══════════════════════════════════════════════════════════════════════════════

log_header "PHASE 8 : INSTALLATION DES DÉPENDANCES TITANE"

cd "$PROJECTS_DIR/TITANE_INFINITY"

# Recharger l'environnement
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
source "$HOME/.cargo/env"

# Installation des dépendances Node
log_step "Installation des dépendances Node..."
if check_command corepack; then
    corepack enable 2>&1 | tee -a "$LOG_FILE" || true
    corepack prepare pnpm@latest --activate 2>&1 | tee -a "$LOG_FILE" || true
fi

if check_command corepack; then
    corepack pnpm install 2>&1 | tee -a "$LOG_FILE"
elif check_command pnpm; then
    pnpm install 2>&1 | tee -a "$LOG_FILE"
else
    log_error "pnpm requis (corepack/pnpm introuvable)"
    exit 1
fi
log_success "Dépendances pnpm installées"

# Vérification Tauri CLI
log_step "Vérification de Tauri CLI..."
TAURI_VERSION=$( (corepack pnpm exec tauri --version 2>/dev/null || pnpm exec tauri --version 2>/dev/null) || echo "NON TROUVÉ" )
if [ "$TAURI_VERSION" != "NON TROUVÉ" ]; then
    log_success "Tauri CLI: $TAURI_VERSION"
else
    log_warning "Tauri CLI introuvable via pnpm"
fi

# Build du backend Rust
log_step "Compilation du backend Rust (première fois peut être longue)..."
cd src-tauri
cargo check 2>&1 | tee -a "$LOG_FILE"
log_success "Vérification Cargo réussie"

cargo build 2>&1 | tee -a "$LOG_FILE"
log_success "Build Rust réussi"

cd ..

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 9 : VALIDATION FINALE
# ═══════════════════════════════════════════════════════════════════════════════

log_header "PHASE 9 : VALIDATION FINALE"

echo ""
echo -e "${BOLD}${CYAN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${CYAN}║              VÉRIFICATION DE L'ENVIRONNEMENT                  ║${NC}"
echo -e "${BOLD}${CYAN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Tableau de validation
VALIDATION_RESULTS=()

# OS
OS_VERSION=$(lsb_release -d 2>/dev/null | cut -f2 || echo "Inconnu")
if [[ "$OS_VERSION" == *"Ubuntu 24.04"* ]]; then
    echo -e "  ${GREEN}✅ OS${NC}          : $OS_VERSION"
    VALIDATION_RESULTS+=("OK")
else
    echo -e "  ${YELLOW}⚠️  OS${NC}          : $OS_VERSION"
    VALIDATION_RESULTS+=("WARN")
fi

# Rust
if check_command rustc; then
    RUST_VER=$(rustc --version | awk '{print $2}')
    echo -e "  ${GREEN}✅ Rust${NC}        : $RUST_VER"
    VALIDATION_RESULTS+=("OK")
else
    echo -e "  ${RED}❌ Rust${NC}        : Non installé"
    VALIDATION_RESULTS+=("FAIL")
fi

# Cargo
if check_command cargo; then
    CARGO_VER=$(cargo --version | awk '{print $2}')
    echo -e "  ${GREEN}✅ Cargo${NC}       : $CARGO_VER"
    VALIDATION_RESULTS+=("OK")
else
    echo -e "  ${RED}❌ Cargo${NC}       : Non installé"
    VALIDATION_RESULTS+=("FAIL")
fi

# Node.js
if check_command node; then
    NODE_VER=$(node --version)
    echo -e "  ${GREEN}✅ Node.js${NC}     : $NODE_VER"
    VALIDATION_RESULTS+=("OK")
else
    echo -e "  ${RED}❌ Node.js${NC}     : Non installé"
    VALIDATION_RESULTS+=("FAIL")
fi

# pnpm
if check_command pnpm; then
    PNPM_VER=$(pnpm --version)
    echo -e "  ${GREEN}✅ pnpm${NC}        : $PNPM_VER"
    VALIDATION_RESULTS+=("OK")
elif check_command corepack; then
    PNPM_VER=$(corepack pnpm --version 2>/dev/null || echo "Non disponible")
    echo -e "  ${GREEN}✅ pnpm${NC}        : $PNPM_VER"
    VALIDATION_RESULTS+=("OK")
else
    echo -e "  ${RED}❌ pnpm${NC}        : Non installé"
    VALIDATION_RESULTS+=("FAIL")
fi

# WebKit
WEBKIT_VER=$(pkg-config --modversion webkit2gtk-4.1 2>/dev/null || echo "Non trouvé")
if [ "$WEBKIT_VER" != "Non trouvé" ]; then
    echo -e "  ${GREEN}✅ WebKit${NC}      : $WEBKIT_VER"
    VALIDATION_RESULTS+=("OK")
else
    echo -e "  ${RED}❌ WebKit${NC}      : Non installé"
    VALIDATION_RESULTS+=("FAIL")
fi

# VSCode
if check_command code; then
    VSCODE_VER=$(code --version | head -1)
    echo -e "  ${GREEN}✅ VSCode${NC}      : $VSCODE_VER"
    VALIDATION_RESULTS+=("OK")
else
    echo -e "  ${YELLOW}⚠️  VSCode${NC}      : Non installé"
    VALIDATION_RESULTS+=("WARN")
fi

# Git
if check_command git; then
    GIT_VER=$(git --version | awk '{print $3}')
    echo -e "  ${GREEN}✅ Git${NC}         : $GIT_VER"
    VALIDATION_RESULTS+=("OK")
else
    echo -e "  ${RED}❌ Git${NC}         : Non installé"
    VALIDATION_RESULTS+=("FAIL")
fi

# SSH GitHub
if ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
    echo -e "  ${GREEN}✅ SSH GitHub${NC}  : Authentifié"
    VALIDATION_RESULTS+=("OK")
else
    echo -e "  ${YELLOW}⚠️  SSH GitHub${NC}  : Non configuré"
    VALIDATION_RESULTS+=("WARN")
fi

# TITANE Project
if [ -d "$PROJECTS_DIR/TITANE_INFINITY" ]; then
    echo -e "  ${GREEN}✅ TITANE${NC}      : Présent"
    VALIDATION_RESULTS+=("OK")
else
    echo -e "  ${RED}❌ TITANE${NC}      : Non cloné"
    VALIDATION_RESULTS+=("FAIL")
fi

echo ""

# Compter les résultats
OK_COUNT=$(printf '%s\n' "${VALIDATION_RESULTS[@]}" | grep -c "OK" || echo 0)
WARN_COUNT=$(printf '%s\n' "${VALIDATION_RESULTS[@]}" | grep -c "WARN" || echo 0)
FAIL_COUNT=$(printf '%s\n' "${VALIDATION_RESULTS[@]}" | grep -c "FAIL" || echo 0)
TOTAL=${#VALIDATION_RESULTS[@]}

# ═══════════════════════════════════════════════════════════════════════════════
# RAPPORT FINAL
# ═══════════════════════════════════════════════════════════════════════════════

echo ""
if [ "$FAIL_COUNT" -eq 0 ]; then
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  ✅ INSTALLATION TERMINÉE AVEC SUCCÈS!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
else
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}  ⚠️  INSTALLATION TERMINÉE AVEC AVERTISSEMENTS${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
fi

echo ""
echo -e "${CYAN}Résumé:${NC}"
echo -e "  ✅ Succès: $OK_COUNT/$TOTAL"
echo -e "  ⚠️  Warnings: $WARN_COUNT/$TOTAL"
echo -e "  ❌ Échecs: $FAIL_COUNT/$TOTAL"
echo ""

echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${PURPLE}  PROCHAINES ÉTAPES${NC}"
echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}1. Recharger le terminal:${NC}"
echo "   $ source ~/.bashrc"
echo ""
echo -e "${CYAN}2. Naviguer vers TITANE:${NC}"
echo "   $ cd $PROJECTS_DIR/TITANE_INFINITY"
echo ""
echo -e "${CYAN}3. Lancer en mode développement:${NC}"
echo "   $ pnpm run tauri dev"
echo ""
echo -e "${CYAN}4. Build de production:${NC}"
echo "   $ pnpm run tauri build"
echo ""

if [ "$WARN_COUNT" -gt 0 ] || [ "$FAIL_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}  ACTIONS REQUISES${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    
    if ! ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
        echo -e "${YELLOW}• Configurer les clés SSH pour GitHub:${NC}"
        echo "  $ ssh-keygen -t ed25519 -C \"votre_email@example.com\""
        echo "  $ cat ~/.ssh/id_ed25519.pub"
        echo "  (Ajouter la clé à https://github.com/settings/keys)"
        echo ""
    fi
fi

echo -e "${GREEN}📁 Logs disponibles: $LOG_FILE${NC}"
echo ""
echo -e "${PURPLE}🎉 Bienvenue sur Ubuntu 24.04 LTS!${NC}"
echo -e "${PURPLE}   TITANE∞ est prêt pour le développement.${NC}"
echo ""

# Écrire le résumé dans le log
{
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "  INSTALLATION COMPLETED"
    echo "═══════════════════════════════════════════════════════════════"
    echo "Success: $OK_COUNT/$TOTAL"
    echo "Warnings: $WARN_COUNT/$TOTAL"
    echo "Failures: $FAIL_COUNT/$TOTAL"
    echo "Timestamp: $(date)"
} >> "$LOG_FILE"
