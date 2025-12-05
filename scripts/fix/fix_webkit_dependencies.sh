#!/usr/bin/env bash
################################################################################
# TITANE∞ v12.0.0 - Fix Webkit Dependencies
# Correction et installation des dépendances WebKit
################################################################################

set -euo pipefail

# Charger fonctions communes
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../utils/common.sh"

log_header "TITANE∞ v12 - FIX WEBKIT DEPENDENCIES"

# Détection OS
if [ ! -f /etc/os-release ]; then
    log_error "Impossible de détecter l'OS"
    exit 1
fi

source /etc/os-release

log_info "OS: $NAME $VERSION"

# Vérification WebKit actuelle
log_header "VÉRIFICATION WEBKIT"

if pkg-config --exists webkit2gtk-4.1; then
    WEBKIT_VERSION=$(pkg-config --modversion webkit2gtk-4.1)
    log_success "WebKit2GTK-4.1 installé: $WEBKIT_VERSION"
    
    if pkg-config --exists javascriptcoregtk-4.1; then
        JSC_VERSION=$(pkg-config --modversion javascriptcoregtk-4.1)
        log_success "JavaScriptCoreGTK-4.1 installé: $JSC_VERSION"
        
        log_success "Dépendances WebKit OK"
        exit 0
    fi
fi

# Installation nécessaire
log_header "INSTALLATION WEBKIT"

log_warn "WebKit2GTK-4.1 manquant, installation requise"

case "$ID" in
    ubuntu|pop|debian)
        log_step "Installation via apt..."
        
        PACKAGES=(
            "libwebkit2gtk-4.1-dev"
            "libjavascriptcoregtk-4.1-dev"
            "libgtk-3-dev"
            "libsoup-3.0-dev"
            "libglib2.0-dev"
        )
        
        log_info "Mise à jour cache apt..."
        sudo apt update
        
        log_info "Installation packages..."
        for pkg in "${PACKAGES[@]}"; do
            log_step "  - $pkg"
            sudo apt install -y "$pkg"
        done
        ;;
        
    fedora)
        log_step "Installation via dnf..."
        sudo dnf install -y webkit2gtk4.1-devel
        ;;
        
    arch|manjaro)
        log_step "Installation via pacman..."
        sudo pacman -S --noconfirm webkit2gtk-4.1
        ;;
        
    *)
        log_error "Distribution non supportée: $ID"
        log_info "Installer manuellement webkit2gtk-4.1-dev"
        exit 1
        ;;
esac

# Vérification post-installation
log_header "VÉRIFICATION POST-INSTALLATION"

if ! pkg-config --exists webkit2gtk-4.1; then
    log_error "Installation échouée"
    exit 1
fi

WEBKIT_VERSION=$(pkg-config --modversion webkit2gtk-4.1)
log_success "WebKit2GTK-4.1: $WEBKIT_VERSION"

if pkg-config --exists javascriptcoregtk-4.1; then
    JSC_VERSION=$(pkg-config --modversion javascriptcoregtk-4.1)
    log_success "JavaScriptCoreGTK-4.1: $JSC_VERSION"
fi

log_header "INSTALLATION RÉUSSIE"
log_success "Dépendances WebKit installées et fonctionnelles"

exit 0
