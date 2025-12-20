#!/usr/bin/env bash

###############################################################################
# TITANE_INFINITY - Script d'Installation Automatisé Environnement Dev
###############################################################################
# Version: 1.0.0
# Compatibilité: macOS, Linux (Debian/Ubuntu, Fedora)
# Windows: Utiliser Git Bash ou WSL
###############################################################################

set -e  # Exit on error
set -u  # Exit on undefined variable

# Couleurs pour output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Détection OS
OS="$(uname -s)"
case "${OS}" in
    Linux*)     MACHINE=Linux;;
    Darwin*)    MACHINE=Mac;;
    CYGWIN*|MINGW*|MSYS*) MACHINE=Windows;;
    *)          MACHINE="UNKNOWN:${OS}"
esac

###############################################################################
# Fonctions Utilitaires
###############################################################################

print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE} $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

check_version() {
    local cmd=$1
    local required=$2
    local current=$($cmd)
    
    if [ "$(printf '%s\n' "$required" "$current" | sort -V | head -n1)" = "$required" ]; then
        return 0
    else
        return 1
    fi
}

###############################################################################
# Vérifications Prérequis
###############################################################################

check_prerequisites() {
    print_header "🔍 Vérification des Prérequis"
    
    local all_good=true
    
    # Git
    if command_exists git; then
        local git_version=$(git --version | awk '{print $3}')
        print_success "Git installé (version $git_version)"
    else
        print_error "Git n'est pas installé"
        all_good=false
    fi
    
    # Node.js
    if command_exists node; then
        local node_version=$(node --version | sed 's/v//')
        if check_version "echo $node_version" "18.0.0"; then
            print_success "Node.js installé (version $node_version)"
        else
            print_warning "Node.js version $node_version (requis: >= 18.0.0)"
            all_good=false
        fi
    else
        print_error "Node.js n'est pas installé"
        all_good=false
    fi
    
    # npm
    if command_exists npm; then
        local npm_version=$(npm --version)
        print_success "npm installé (version $npm_version)"
    else
        print_error "npm n'est pas installé"
        all_good=false
    fi
    
    # Rust
    if command_exists rustc; then
        local rust_version=$(rustc --version | awk '{print $2}')
        if check_version "echo $rust_version" "1.83.0"; then
            print_success "Rust installé (version $rust_version)"
        else
            print_warning "Rust version $rust_version (requis: >= 1.83.0)"
            print_info "Exécuter: rustup update"
        fi
    else
        print_error "Rust n'est pas installé"
        all_good=false
    fi
    
    # Cargo
    if command_exists cargo; then
        local cargo_version=$(cargo --version | awk '{print $2}')
        print_success "Cargo installé (version $cargo_version)"
    else
        print_error "Cargo n'est pas installé"
        all_good=false
    fi
    
    # Build tools (OS-specific)
    if [ "$MACHINE" = "Mac" ]; then
        if xcode-select -p >/dev/null 2>&1; then
            print_success "Xcode Command Line Tools installé"
        else
            print_error "Xcode Command Line Tools manquant"
            print_info "Installer avec: xcode-select --install"
            all_good=false
        fi
    elif [ "$MACHINE" = "Linux" ]; then
        if command_exists gcc; then
            print_success "Build tools installés"
        else
            print_error "Build tools manquants"
            print_info "Installer avec: sudo apt install build-essential"
            all_good=false
        fi
    fi
    
    if [ "$all_good" = false ]; then
        print_error "Certains prérequis manquent. Consulter DEVELOPMENT_SETUP.md"
        echo ""
        print_info "Installation automatique des prérequis manquants:"
        echo ""
        read -p "Tenter l'installation automatique? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            install_prerequisites
        else
            exit 1
        fi
    fi
    
    echo ""
}

###############################################################################
# Installation Prérequis (si manquants)
###############################################################################

install_prerequisites() {
    print_header "📦 Installation des Prérequis Manquants"
    
    # Node.js
    if ! command_exists node; then
        print_info "Installation de Node.js..."
        if [ "$MACHINE" = "Mac" ]; then
            if command_exists brew; then
                brew install node@20
            else
                print_error "Homebrew non installé. Installer manuellement Node.js"
            fi
        elif [ "$MACHINE" = "Linux" ]; then
            curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
            sudo apt-get install -y nodejs
        fi
    fi
    
    # Rust
    if ! command_exists rustc; then
        print_info "Installation de Rust..."
        curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
        source "$HOME/.cargo/env"
    fi
    
    # Build tools Linux
    if [ "$MACHINE" = "Linux" ]; then
        print_info "Installation des build tools Linux..."
        if command_exists apt-get; then
            sudo apt-get update
            sudo apt-get install -y \
                libwebkit2gtk-4.0-dev \
                build-essential \
                curl \
                wget \
                file \
                libssl-dev \
                libgtk-3-dev \
                libayatana-appindicator3-dev \
                librsvg2-dev
        elif command_exists dnf; then
            sudo dnf install -y \
                webkit2gtk4.0-devel \
                openssl-devel \
                curl \
                wget \
                file \
                libappindicator-gtk3-devel \
                librsvg2-devel
        fi
    fi
    
    print_success "Prérequis installés"
    echo ""
}

###############################################################################
# Installation Dépendances Projet
###############################################################################

install_dependencies() {
    print_header "📥 Installation des Dépendances"
    
    # Choisir package manager
    local pkg_manager="npm"
    if command_exists pnpm; then
        print_info "pnpm détecté (plus rapide)"
        read -p "Utiliser pnpm au lieu de npm? (Y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            pkg_manager="pnpm"
        fi
    fi
    
    # Installer dépendances Node
    print_info "Installation des dépendances Node.js..."
    if [ "$pkg_manager" = "pnpm" ]; then
        pnpm install
    else
        npm install
    fi
    print_success "Dépendances Node.js installées"
    
    # Installer dépendances Rust
    print_info "Installation des dépendances Rust (peut prendre 5-10 min)..."
    cd src-tauri
    cargo fetch
    cargo build
    cd ..
    print_success "Dépendances Rust installées"
    
    echo ""
}

###############################################################################
# Configuration Environnement
###############################################################################

setup_environment() {
    print_header "⚙️  Configuration de l'Environnement"
    
    # .env
    if [ ! -f .env ]; then
        print_info "Création du fichier .env..."
        cp .env.example .env
        print_success ".env créé"
        print_warning "Éditer .env pour configurer les variables (optionnel)"
    else
        print_info ".env existe déjà"
    fi
    
    # VSCode settings (optionnel)
    if [ ! -d .vscode ]; then
        print_info "Configuration VSCode..."
        mkdir -p .vscode
        
        cat > .vscode/extensions.json <<EOF
{
  "recommendations": [
    "rust-lang.rust-analyzer",
    "tauri-apps.tauri-vscode",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss"
  ]
}
EOF
        
        cat > .vscode/settings.json <<EOF
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "rust-analyzer.checkOnSave.command": "clippy"
}
EOF
        
        print_success "Configuration VSCode créée"
    fi
    
    echo ""
}

###############################################################################
# Vérification Installation
###############################################################################

verify_installation() {
    print_header "✅ Vérification de l'Installation"
    
    # TypeScript check
    print_info "Vérification TypeScript..."
    if npm run type-check 2>&1 | grep -q "error"; then
        print_warning "Erreurs TypeScript détectées (normal si projet modifié)"
    else
        print_success "TypeScript: OK"
    fi
    
    # Lint check
    print_info "Vérification ESLint..."
    if npm run lint 2>&1 | grep -q "error"; then
        print_warning "Erreurs ESLint détectées"
    else
        print_success "ESLint: OK"
    fi
    
    # Build test
    print_info "Test de build frontend..."
    if npm run build >/dev/null 2>&1; then
        print_success "Build frontend: OK"
    else
        print_warning "Build frontend a échoué (vérifier les logs)"
    fi
    
    echo ""
}

###############################################################################
# Afficher les Prochaines Étapes
###############################################################################

show_next_steps() {
    print_header "🎉 Installation Terminée!"
    
    echo ""
    print_success "Environnement de développement prêt!"
    echo ""
    print_info "Prochaines étapes:"
    echo ""
    echo "1. Lancer le serveur de développement:"
    echo "   ${GREEN}npm run dev${NC}              # Frontend seul (port 5173)"
    echo "   ${GREEN}npm run tauri dev${NC}        # Application complète (Tauri)"
    echo ""
    echo "2. Lancer les tests:"
    echo "   ${GREEN}npm run test${NC}             # Tests unitaires"
    echo "   ${GREEN}npm run test:e2e${NC}         # Tests E2E"
    echo ""
    echo "3. Build production:"
    echo "   ${GREEN}npm run build${NC}            # Build frontend"
    echo "   ${GREEN}npm run tauri build${NC}      # Build app complète"
    echo ""
    echo "4. Ouvrir dans VSCode:"
    echo "   ${GREEN}code .${NC}"
    echo ""
    print_info "Documentation complète: ${BLUE}DEVELOPMENT_SETUP.md${NC}"
    print_info "Commandes dev: ${BLUE}DEV_COMMANDS.md${NC}"
    echo ""
    print_warning "N'oubliez pas de configurer .env si nécessaire (Sentry, etc.)"
    echo ""
}

###############################################################################
# Main
###############################################################################

main() {
    clear
    
    cat << "EOF"
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   ████████╗██╗████████╗ █████╗ ███╗   ██╗███████╗            ║
║   ╚══██╔══╝██║╚══██╔══╝██╔══██╗████╗  ██║██╔════╝            ║
║      ██║   ██║   ██║   ███████║██╔██╗ ██║█████╗              ║
║      ██║   ██║   ██║   ██╔══██║██║╚██╗██║██╔══╝              ║
║      ██║   ██║   ██║   ██║  ██║██║ ╚████║███████╗            ║
║      ╚═╝   ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝            ║
║                    INFINITY                                    ║
║                                                                ║
║             Script d'Installation Automatisé                   ║
║                     Version 1.0.0                              ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
EOF
    
    echo ""
    print_info "Plateforme détectée: ${MACHINE}"
    echo ""
    
    # Vérifier si dans le bon répertoire
    if [ ! -f "package.json" ] || [ ! -d "src-tauri" ]; then
        print_error "Ce script doit être exécuté depuis la racine du projet TITANE_INFINITY"
        exit 1
    fi
    
    # Workflow d'installation
    check_prerequisites
    install_dependencies
    setup_environment
    verify_installation
    show_next_steps
    
    print_success "Setup terminé avec succès! 🚀"
}

# Exécuter main si script appelé directement
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    main "$@"
fi
