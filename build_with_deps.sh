#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# TITANE∞ v∞ — Build Script Universal avec Dépendances
# Installation automatique WebKit + compilation complète
# ═══════════════════════════════════════════════════════════════

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     TITANE∞ v∞ — Universal Build Script                     ║"
echo "║     Auto-detection + installation dépendances                ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions utilitaires
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# ═══════════════════════════════════════════════════════════════
# ÉTAPE 1: Détection Distribution
# ═══════════════════════════════════════════════════════════════

log_info "Détection de la distribution Linux..."

if [ -f /etc/os-release ]; then
    . /etc/os-release
    DISTRO=$ID
    VERSION=$VERSION_ID
    log_success "Distribution détectée: $DISTRO $VERSION"
else
    log_error "Distribution non reconnue (/etc/os-release manquant)"
    exit 1
fi

# Vérifier si on est dans Flatpak
if [ -n "$container" ] && [ "$container" = "flatpak" ]; then
    log_warning "Environnement Flatpak détecté"
    log_warning "Les installations sudo ne fonctionneront pas"
    log_warning "Recommandation: Lancer ce script depuis un terminal hôte"
    echo ""
    read -p "Continuer quand même? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# ═══════════════════════════════════════════════════════════════
# ÉTAPE 2: Vérification Prérequis
# ═══════════════════════════════════════════════════════════════

log_info "Vérification des prérequis..."

# Rust
if ! command -v cargo &> /dev/null; then
    log_error "Rust/Cargo non installé"
    log_info "Installer via: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    exit 1
else
    RUST_VERSION=$(rustc --version | awk '{print $2}')
    log_success "Rust $RUST_VERSION installé"
fi

# Node.js
if ! command -v node &> /dev/null; then
    log_error "Node.js non installé"
    log_info "Installer via gestionnaire de packages ou nvm"
    exit 1
else
    NODE_VERSION=$(node --version)
    log_success "Node.js $NODE_VERSION installé"
fi

# npm/pnpm
if ! command -v npm &> /dev/null; then
    log_error "npm non installé"
    exit 1
else
    log_success "npm installé"
fi

# ═══════════════════════════════════════════════════════════════
# ÉTAPE 3: Installation Dépendances WebKit
# ═══════════════════════════════════════════════════════════════

log_info "Vérification WebKit GTK..."

if pkg-config --exists webkit2gtk-4.1 2>/dev/null; then
    WEBKIT_VERSION=$(pkg-config --modversion webkit2gtk-4.1)
    log_success "WebKit 4.1 déjà installé (version $WEBKIT_VERSION)"
else
    log_warning "WebKit 4.1 manquant, installation requise"

    case "$DISTRO" in
        ubuntu|debian|pop)
            log_info "Installation via apt..."
            sudo apt update
            sudo apt install -y \
                libwebkit2gtk-4.1-dev \
                libjavascriptcoregtk-4.1-dev \
                libgtk-3-dev \
                libayatana-appindicator3-dev \
                librsvg2-dev \
                patchelf \
                build-essential \
                pkg-config \
                libssl-dev
            ;;
        fedora|rhel|centos)
            log_info "Installation via dnf..."
            sudo dnf install -y \
                webkit2gtk4.1-devel \
                gtk3-devel \
                libappindicator-gtk3-devel \
                librsvg2-devel \
                openssl-devel
            ;;
        arch|manjaro)
            log_info "Installation via pacman..."
            sudo pacman -S --needed --noconfirm \
                webkit2gtk-4.1 \
                gtk3 \
                libappindicator-gtk3 \
                librsvg \
                base-devel \
                openssl
            ;;
        opensuse*)
            log_info "Installation via zypper..."
            sudo zypper install -y \
                webkit2gtk3-devel \
                gtk3-devel \
                libappindicator3-devel \
                librsvg-devel \
                libopenssl-devel
            ;;
        *)
            log_error "Distribution non supportée pour installation automatique: $DISTRO"
            log_info "Installer manuellement webkit2gtk-4.1-dev ou équivalent"
            log_info "Voir: WEBKIT_INSTALLATION_GUIDE.md"
            exit 1
            ;;
    esac

    # Vérification post-installation
    if pkg-config --exists webkit2gtk-4.1 2>/dev/null; then
        WEBKIT_VERSION=$(pkg-config --modversion webkit2gtk-4.1)
        log_success "WebKit 4.1 installé avec succès (version $WEBKIT_VERSION)"
    else
        log_error "Installation WebKit a échoué"
        exit 1
    fi
fi

# ═══════════════════════════════════════════════════════════════
# ÉTAPE 4: Installation Dépendances Node
# ═══════════════════════════════════════════════════════════════

log_info "Installation des dépendances Node.js..."

if [ ! -d "node_modules" ]; then
    log_info "Première installation, téléchargement des packages..."
    npm install
else
    log_info "node_modules existe, mise à jour..."
    npm install
fi

log_success "Dépendances Node.js installées"

# ═══════════════════════════════════════════════════════════════
# ÉTAPE 5: Nettoyage (Optionnel)
# ═══════════════════════════════════════════════════════════════

if [ "$1" = "--clean" ]; then
    log_warning "Mode clean activé, suppression target/"
    rm -rf src-tauri/target
    log_success "Cache Rust nettoyé"
fi

# ═══════════════════════════════════════════════════════════════
# ÉTAPE 6: Compilation Rust Backend
# ═══════════════════════════════════════════════════════════════

log_info "Compilation du backend Rust..."
cd src-tauri

if cargo build --release; then
    log_success "Backend Rust compilé avec succès"
else
    log_error "Échec de compilation Rust"
    log_info "Vérifier les logs ci-dessus pour plus de détails"
    exit 1
fi

cd ..

# ═══════════════════════════════════════════════════════════════
# ÉTAPE 7: Build Tauri Complet
# ═══════════════════════════════════════════════════════════════

log_info "Build Tauri complet (frontend + backend)..."

if npm run tauri build; then
    log_success "Build Tauri réussi !"
else
    log_error "Échec du build Tauri"
    exit 1
fi

# ═══════════════════════════════════════════════════════════════
# ÉTAPE 8: Vérification Binaire
# ═══════════════════════════════════════════════════════════════

log_info "Vérification du binaire..."

BINARY_PATH="src-tauri/target/release/titane-infinity"

if [ -f "$BINARY_PATH" ]; then
    BINARY_SIZE=$(du -h "$BINARY_PATH" | cut -f1)
    log_success "Binaire généré: $BINARY_PATH ($BINARY_SIZE)"

    # Test version
    if $BINARY_PATH --version 2>/dev/null; then
        log_success "Binaire fonctionnel"
    else
        log_warning "Binaire généré mais version check a échoué"
    fi
else
    log_error "Binaire non trouvé à $BINARY_PATH"
    exit 1
fi

# ═══════════════════════════════════════════════════════════════
# ÉTAPE 9: Résumé
# ═══════════════════════════════════════════════════════════════

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     🎉 BUILD RÉUSSI — TITANE∞ v19.1.0                       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
log_success "Binaire: $BINARY_PATH"
log_success "Distribution: $DISTRO $VERSION"
log_success "Rust: $RUST_VERSION"
log_success "Node: $NODE_VERSION"
log_success "WebKit: $WEBKIT_VERSION"
echo ""
log_info "Pour exécuter:"
echo "  $BINARY_PATH"
echo ""
log_info "Pour build dev (avec hot reload):"
echo "  npm run tauri dev"
echo ""
