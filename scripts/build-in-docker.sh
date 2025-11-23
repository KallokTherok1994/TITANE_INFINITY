#!/bin/bash

# ============================================================================
# Build TITANE∞ dans container Docker
# ============================================================================
# Ce script contourne les limitations de Flatpak en construisant dans Docker
# ============================================================================

set -euo pipefail

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo -e "${BLUE}"
cat << "EOF"
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║              TITANE∞ v17.3.0 - DOCKER BUILD                   ║
║              Build Tauri dans container isolé                  ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Vérifier Docker
if ! command -v docker &> /dev/null; then
    log_error "Docker n'est pas installé"
    log_info "Installation: curl -fsSL https://get.docker.com | sh"
    exit 1
fi

log_success "Docker installé: $(docker --version)"

# Build l'image Docker si elle n'existe pas
if ! docker image inspect titane-builder &> /dev/null; then
    log_info "Construction de l'image Docker titane-builder..."
    cd "$PROJECT_ROOT"
    docker build -f Dockerfile.tauri-builder -t titane-builder .
    log_success "Image Docker créée"
else
    log_info "Image Docker titane-builder existe déjà"
fi

# Lancer le build dans le container
log_info "Lancement du build Tauri dans Docker..."
log_info "Cela peut prendre 5-15 minutes..."

docker run --rm \
    -v "$PROJECT_ROOT":/app \
    -w /app \
    titane-builder \
    bash -c "pnpm install --frozen-lockfile && pnpm tauri build --verbose"

if [ $? -eq 0 ]; then
    log_success "Build terminé avec succès!"
    log_info "Artefacts disponibles dans src-tauri/target/release/bundle/"

    # Lister les artefacts
    if [ -d "$PROJECT_ROOT/src-tauri/target/release/bundle" ]; then
        echo ""
        log_info "Artefacts générés:"
        find "$PROJECT_ROOT/src-tauri/target/release/bundle" -type f \( -name "*.deb" -o -name "*.AppImage" -o -name "*.rpm" \) -exec ls -lh {} \;
    fi
else
    log_error "Build échoué"
    exit 1
fi
