#!/bin/bash

###############################################################################
#                                                                             #
#   🚀 TITANE∞ v16.1 - Script de Déploiement Automatisé                     #
#                                                                             #
###############################################################################

set -e  # Exit on error

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Variables
VERSION="16.1"
BUILD_DIR="dist"
DEPLOY_DIR="deploy_v${VERSION}_prod"
ARCHIVE="${DEPLOY_DIR}.tar.gz"

###############################################################################
# Fonctions utilitaires
###############################################################################

print_header() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                                                              ║"
    echo "║       ✨ TITANE∞ v${VERSION} - DÉPLOIEMENT PRODUCTION ✨          ║"
    echo "║                                                              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_step() {
    echo -e "${CYAN}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

###############################################################################
# Étape 1: Nettoyage
###############################################################################

cleanup() {
    print_step "Nettoyage des anciens builds..."
    
    if [ -d "$BUILD_DIR" ]; then
        rm -rf "$BUILD_DIR"
        print_success "Ancien build supprimé"
    fi
    
    if [ -d "$DEPLOY_DIR" ]; then
        rm -rf "$DEPLOY_DIR"
        print_success "Ancien package de déploiement supprimé"
    fi
    
    if [ -f "$ARCHIVE" ]; then
        rm -f "$ARCHIVE"
        print_success "Ancienne archive supprimée"
    fi
}

###############################################################################
# Étape 2: Vérification des dépendances
###############################################################################

check_dependencies() {
    print_step "Vérification des dépendances..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js n'est pas installé"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm n'est pas installé"
        exit 1
    fi
    
    print_success "Node.js $(node --version) et npm $(npm --version) détectés"
}

###############################################################################
# Étape 3: Installation des dépendances
###############################################################################

install_deps() {
    print_step "Installation des dépendances npm..."
    
    if [ ! -d "node_modules" ]; then
        npm install
        print_success "Dépendances installées"
    else
        print_success "Dépendances déjà installées"
    fi
}

###############################################################################
# Étape 4: Vérification TypeScript
###############################################################################

typecheck() {
    print_step "Vérification TypeScript..."
    
    if npm run type-check; then
        print_success "TypeScript: 0 erreurs"
    else
        print_error "Erreurs TypeScript détectées"
        exit 1
    fi
}

###############################################################################
# Étape 5: Build de production
###############################################################################

build() {
    print_step "Build de production avec Vite..."
    
    local start_time=$(date +%s)
    
    if npm run build; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        print_success "Build réussi en ${duration}s"
    else
        print_error "Build échoué"
        exit 1
    fi
}

###############################################################################
# Étape 6: Vérification du build
###############################################################################

verify_build() {
    print_step "Vérification du build..."
    
    if [ ! -d "$BUILD_DIR" ]; then
        print_error "Le dossier dist/ n'existe pas"
        exit 1
    fi
    
    if [ ! -f "$BUILD_DIR/index.html" ]; then
        print_error "index.html manquant"
        exit 1
    fi
    
    if [ ! -d "$BUILD_DIR/assets" ]; then
        print_error "Dossier assets/ manquant"
        exit 1
    fi
    
    local size=$(du -sh "$BUILD_DIR" | cut -f1)
    print_success "Build vérifié (Taille: $size)"
}

###############################################################################
# Étape 7: Création du package de déploiement
###############################################################################

create_deploy_package() {
    print_step "Création du package de déploiement..."
    
    # Créer le dossier
    mkdir -p "$DEPLOY_DIR"
    
    # Copier les fichiers du build
    cp -r "$BUILD_DIR"/* "$DEPLOY_DIR/"
    
    # Copier la documentation
    if [ -f "GUIDE_DEPLOIEMENT_v${VERSION}.md" ]; then
        cp "GUIDE_DEPLOIEMENT_v${VERSION}.md" "$DEPLOY_DIR/"
    fi
    
    if [ -f "OPTIMISATIONS_UI_UX_v${VERSION}.md" ]; then
        cp "OPTIMISATIONS_UI_UX_v${VERSION}.md" "$DEPLOY_DIR/"
    fi
    
    # Créer README
    cat > "$DEPLOY_DIR/README.md" << 'EOFREADME'
# 🚀 TITANE∞ v16.1 - Package de Déploiement Production

**Date**: $(date '+%d %B %Y')
**Version**: 16.1
**Status**: ✅ Production Ready

## Déploiement Rapide

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Vercel
```bash
npm install -g vercel
vercel --prod
```

### Serveur Web
```bash
scp -r * user@server:/var/www/titane-infinity/
```

## Test Local
```bash
python3 -m http.server 8080
# Ouvrir http://localhost:8080
```

Voir GUIDE_DEPLOIEMENT_v16.1.md pour plus de détails.
EOFREADME
    
    print_success "Package créé: $DEPLOY_DIR/"
}

###############################################################################
# Étape 8: Création de l'archive
###############################################################################

create_archive() {
    print_step "Création de l'archive compressée..."
    
    tar -czf "$ARCHIVE" "$DEPLOY_DIR/"
    
    local size=$(du -sh "$ARCHIVE" | cut -f1)
    print_success "Archive créée: $ARCHIVE ($size)"
}

###############################################################################
# Étape 9: Statistiques du build
###############################################################################

show_stats() {
    print_step "Statistiques du build..."
    echo ""
    
    # Taille totale
    local dist_size=$(du -sh "$BUILD_DIR" | cut -f1)
    echo -e "  ${BLUE}📦 Build total:${NC} $dist_size"
    
    # Assets
    if [ -d "$BUILD_DIR/assets" ]; then
        echo -e "  ${BLUE}📂 Assets:${NC}"
        ls -lh "$BUILD_DIR/assets/" | tail -n +2 | while read -r line; do
            local size=$(echo "$line" | awk '{print $5}')
            local name=$(echo "$line" | awk '{print $9}')
            echo -e "     • $name: $size"
        done
    fi
    
    # Archive
    local archive_size=$(du -sh "$ARCHIVE" | cut -f1)
    echo -e "  ${BLUE}🗜️  Archive:${NC} $archive_size"
    
    echo ""
}

###############################################################################
# Étape 10: Options de déploiement
###############################################################################

show_deploy_options() {
    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✨ Déploiement réussi!${NC}"
    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${CYAN}🚀 Options de déploiement:${NC}"
    echo ""
    echo -e "  ${YELLOW}1. Netlify (Recommandé)${NC}"
    echo -e "     cd $DEPLOY_DIR && netlify deploy --prod"
    echo ""
    echo -e "  ${YELLOW}2. Vercel${NC}"
    echo -e "     cd $DEPLOY_DIR && vercel --prod"
    echo ""
    echo -e "  ${YELLOW}3. Serveur Web${NC}"
    echo -e "     scp -r $DEPLOY_DIR/* user@server:/var/www/titane/"
    echo ""
    echo -e "  ${YELLOW}4. Test Local${NC}"
    echo -e "     cd $DEPLOY_DIR && python3 -m http.server 8080"
    echo ""
    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${CYAN}📖 Documentation:${NC}"
    echo -e "  • GUIDE_DEPLOIEMENT_v${VERSION}.md"
    echo -e "  • OPTIMISATIONS_UI_UX_v${VERSION}.md"
    echo -e "  • DEPLOYMENT_SUCCESS_v${VERSION}.txt"
    echo ""
}

###############################################################################
# Menu principal
###############################################################################

show_menu() {
    echo ""
    echo -e "${CYAN}Que souhaitez-vous faire?${NC}"
    echo ""
    echo "  1) Build complet (clean + build + package)"
    echo "  2) Build seulement"
    echo "  3) Package seulement (si build existe)"
    echo "  4) Test local"
    echo "  5) Déployer sur Netlify"
    echo "  6) Déployer sur Vercel"
    echo "  7) Quitter"
    echo ""
    read -p "Choix [1-7]: " choice
    
    case $choice in
        1) full_deploy ;;
        2) build_only ;;
        3) package_only ;;
        4) test_local ;;
        5) deploy_netlify ;;
        6) deploy_vercel ;;
        7) exit 0 ;;
        *) print_error "Choix invalide"; show_menu ;;
    esac
}

###############################################################################
# Workflows
###############################################################################

full_deploy() {
    print_header
    cleanup
    check_dependencies
    install_deps
    typecheck
    build
    verify_build
    create_deploy_package
    create_archive
    show_stats
    show_deploy_options
}

build_only() {
    print_header
    check_dependencies
    install_deps
    typecheck
    build
    verify_build
    print_success "Build terminé!"
}

package_only() {
    print_header
    if [ ! -d "$BUILD_DIR" ]; then
        print_error "Aucun build trouvé. Lancez d'abord un build."
        exit 1
    fi
    create_deploy_package
    create_archive
    show_stats
    show_deploy_options
}

test_local() {
    if [ ! -d "$DEPLOY_DIR" ]; then
        print_error "Package de déploiement introuvable. Créez-le d'abord."
        exit 1
    fi
    
    print_step "Lancement du serveur de test local..."
    cd "$DEPLOY_DIR"
    print_success "Serveur lancé sur http://localhost:8080"
    print_warning "Appuyez sur Ctrl+C pour arrêter"
    python3 -m http.server 8080
}

deploy_netlify() {
    if [ ! -d "$DEPLOY_DIR" ]; then
        print_error "Package de déploiement introuvable. Créez-le d'abord."
        exit 1
    fi
    
    if ! command -v netlify &> /dev/null; then
        print_warning "Netlify CLI non installé"
        read -p "Installer maintenant? (y/n) " install_netlify
        if [ "$install_netlify" = "y" ]; then
            npm install -g netlify-cli
        else
            exit 1
        fi
    fi
    
    print_step "Déploiement sur Netlify..."
    cd "$DEPLOY_DIR"
    netlify deploy --prod
}

deploy_vercel() {
    if [ ! -d "$DEPLOY_DIR" ]; then
        print_error "Package de déploiement introuvable. Créez-le d'abord."
        exit 1
    fi
    
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI non installé"
        read -p "Installer maintenant? (y/n) " install_vercel
        if [ "$install_vercel" = "y" ]; then
            npm install -g vercel
        else
            exit 1
        fi
    fi
    
    print_step "Déploiement sur Vercel..."
    cd "$DEPLOY_DIR"
    vercel --prod
}

###############################################################################
# Point d'entrée
###############################################################################

main() {
    # Mode interactif si aucun argument
    if [ $# -eq 0 ]; then
        show_menu
    else
        # Mode CLI
        case "$1" in
            build) full_deploy ;;
            deploy) full_deploy ;;
            test) test_local ;;
            netlify) deploy_netlify ;;
            vercel) deploy_vercel ;;
            clean) cleanup; print_success "Nettoyage terminé" ;;
            *)
                echo "Usage: $0 [build|deploy|test|netlify|vercel|clean]"
                echo ""
                echo "  build    - Build complet + package"
                echo "  deploy   - Alias pour build"
                echo "  test     - Serveur de test local"
                echo "  netlify  - Déployer sur Netlify"
                echo "  vercel   - Déployer sur Vercel"
                echo "  clean    - Nettoyer les builds"
                exit 1
                ;;
        esac
    fi
}

# Lancer le script
main "$@"
