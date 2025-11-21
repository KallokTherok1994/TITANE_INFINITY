#!/bin/bash

################################################################################
# TITANE∞ v9.0.0 - Script de Déploiement Complet
# 
# Ce script effectue un déploiement complet et automatisé du projet :
# - Vérification de l'environnement
# - Installation des dépendances (npm, cargo)
# - Correction automatique (via auto_fix_complete.sh)
# - Build production (frontend + backend)
# - Tests et validation
# - Génération des bundles Tauri
# - Packaging final
#
# Usage: ./deploy_complete.sh [--dev|--prod|--test] [--skip-tests]
################################################################################

set -e  # Arrêt en cas d'erreur critique

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

# Variables globales
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_MODE="prod"
SKIP_TESTS=false
START_TIME=$(date +%s)
ERRORS_COUNT=0
WARNINGS_COUNT=0

# Fichiers de logs
LOG_DIR="$PROJECT_ROOT/deploy_logs"
DEPLOY_LOG="$LOG_DIR/deploy_$(date +%Y%m%d_%H%M%S).log"

# Créer le dossier de logs
mkdir -p "$LOG_DIR"

################################################################################
# Fonctions utilitaires
################################################################################

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$DEPLOY_LOG"
}

print_banner() {
    echo -e "${CYAN}${BOLD}"
    cat << "EOF"
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     🚀 TITANE∞ v9.0.0                                     ║
║     Script de Déploiement Complet                         ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}\n"
}

print_header() {
    echo -e "\n${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}  ${BOLD}$1${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}\n"
    log ">>> $1"
}

print_step() {
    echo -e "${BLUE}▶${NC} ${BOLD}$1${NC}"
    log "STEP: $1"
}

print_success() {
    echo -e "  ${GREEN}✅${NC} $1"
    log "SUCCESS: $1"
}

print_error() {
    echo -e "  ${RED}❌${NC} $1"
    log "ERROR: $1"
    ((ERRORS_COUNT++))
}

print_warning() {
    echo -e "  ${YELLOW}⚠️${NC}  $1"
    log "WARNING: $1"
    ((WARNINGS_COUNT++))
}

print_info() {
    echo -e "  ${CYAN}ℹ️${NC}  $1"
    log "INFO: $1"
}

print_progress() {
    echo -e "  ${MAGENTA}⏳${NC} $1"
}

# Gestion des arguments
parse_arguments() {
    for arg in "$@"; do
        case $arg in
            --dev)
                DEPLOY_MODE="dev"
                ;;
            --prod)
                DEPLOY_MODE="prod"
                ;;
            --test)
                DEPLOY_MODE="test"
                ;;
            --skip-tests)
                SKIP_TESTS=true
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --dev         Mode développement"
                echo "  --prod        Mode production (défaut)"
                echo "  --test        Mode test"
                echo "  --skip-tests  Ignorer les tests"
                echo "  --help        Afficher cette aide"
                exit 0
                ;;
            *)
                print_error "Option inconnue: $arg"
                exit 1
                ;;
        esac
    done
}

################################################################################
# 1. VÉRIFICATION DE L'ENVIRONNEMENT
################################################################################

check_environment() {
    print_header "1. VÉRIFICATION DE L'ENVIRONNEMENT"
    
    # Vérifier Node.js
    print_step "Vérification de Node.js..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js installé: $NODE_VERSION"
        
        # Vérifier version minimale (v18+)
        NODE_MAJOR=$(echo "$NODE_VERSION" | sed 's/v//' | cut -d. -f1)
        if [ "$NODE_MAJOR" -lt 18 ]; then
            print_warning "Node.js v18+ recommandé (trouvé: $NODE_VERSION)"
        fi
    else
        print_error "Node.js non installé"
        exit 1
    fi
    
    # Vérifier npm
    print_step "Vérification de npm..."
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm installé: v$NPM_VERSION"
    else
        print_error "npm non installé"
        exit 1
    fi
    
    # Charger NVM si disponible
    if [ -f "$HOME/.nvm/nvm.sh" ]; then
        source "$HOME/.nvm/nvm.sh"
        print_info "NVM chargé"
    elif [ -f "$HOME/.var/app/com.visualstudio.code/config/nvm/nvm.sh" ]; then
        export NVM_DIR="$HOME/.var/app/com.visualstudio.code/config/nvm"
        source "$NVM_DIR/nvm.sh"
        print_info "NVM chargé (Flatpak)"
    fi
    
    # Vérifier Rust (optionnel pour build Tauri complet)
    print_step "Vérification de Rust..."
    if command -v cargo &> /dev/null; then
        CARGO_VERSION=$(cargo --version | cut -d' ' -f2)
        print_success "Cargo installé: v$CARGO_VERSION"
    else
        print_warning "Cargo non installé (requis pour build Tauri complet)"
    fi
    
    # Vérifier Tauri CLI
    print_step "Vérification de Tauri CLI..."
    cd "$PROJECT_ROOT"
    if npm list @tauri-apps/cli &> /dev/null; then
        print_success "Tauri CLI installé (via npm)"
    else
        print_info "Tauri CLI sera installé avec les dépendances"
    fi
    
    # Vérifier l'espace disque
    print_step "Vérification de l'espace disque..."
    AVAILABLE_SPACE=$(df -h "$PROJECT_ROOT" | awk 'NR==2 {print $4}')
    print_info "Espace disponible: $AVAILABLE_SPACE"
    
    # Afficher le mode de déploiement
    print_step "Configuration du déploiement..."
    print_info "Mode: ${BOLD}$DEPLOY_MODE${NC}"
    print_info "Tests: $([ "$SKIP_TESTS" = true ] && echo "Ignorés" || echo "Activés")"
    print_info "Répertoire: $PROJECT_ROOT"
}

################################################################################
# 2. INSTALLATION DES DÉPENDANCES
################################################################################

install_dependencies() {
    print_header "2. INSTALLATION DES DÉPENDANCES"
    
    cd "$PROJECT_ROOT"
    
    # Vérifier package.json
    if [ ! -f "package.json" ]; then
        print_error "package.json introuvable"
        exit 1
    fi
    
    # Nettoyer node_modules si nécessaire (mode prod)
    if [ "$DEPLOY_MODE" = "prod" ] && [ -d "node_modules" ]; then
        print_step "Nettoyage de node_modules..."
        rm -rf node_modules package-lock.json
        print_success "Nettoyage effectué"
    fi
    
    # Installer les dépendances npm
    print_step "Installation des dépendances npm..."
    print_progress "Cela peut prendre plusieurs minutes..."
    
    if npm install 2>&1 | tee -a "$DEPLOY_LOG" | tail -20; then
        print_success "Dépendances npm installées"
        
        # Compter les packages
        PACKAGE_COUNT=$(find node_modules -maxdepth 1 -type d | wc -l)
        print_info "Packages installés: $PACKAGE_COUNT"
    else
        print_error "Échec de l'installation des dépendances npm"
        exit 1
    fi
    
    # Installer les dépendances de développement si mode dev
    if [ "$DEPLOY_MODE" = "dev" ]; then
        print_step "Installation des outils de développement..."
        npm install --save-dev 2>&1 | tee -a "$DEPLOY_LOG" | tail -10
        print_success "Outils de dev installés"
    fi
}

################################################################################
# 3. CORRECTION AUTOMATIQUE
################################################################################

run_auto_fix() {
    print_header "3. CORRECTION AUTOMATIQUE"
    
    # Vérifier que le script auto_fix existe
    if [ ! -f "$PROJECT_ROOT/auto_fix_complete.sh" ]; then
        print_warning "Script auto_fix_complete.sh introuvable, étape ignorée"
        return
    fi
    
    print_step "Exécution du script de correction automatique..."
    
    # Rendre le script exécutable
    chmod +x "$PROJECT_ROOT/auto_fix_complete.sh"
    
    # Exécuter avec skip-build pour ne pas dupliquer le build
    if bash "$PROJECT_ROOT/auto_fix_complete.sh" --skip-build 2>&1 | tee -a "$DEPLOY_LOG" | tail -50; then
        print_success "Correction automatique terminée"
    else
        print_warning "Correction automatique avec avertissements"
    fi
}

################################################################################
# 4. BUILD FRONTEND
################################################################################

build_frontend() {
    print_header "4. BUILD FRONTEND"
    
    cd "$PROJECT_ROOT"
    
    # Nettoyer le dossier dist
    if [ -d "dist" ]; then
        print_step "Nettoyage du dossier dist..."
        rm -rf dist
        print_success "Dossier dist nettoyé"
    fi
    
    # Type-check TypeScript
    print_step "Vérification TypeScript..."
    if npm run type-check 2>&1 | tee -a "$DEPLOY_LOG" | tail -10; then
        print_success "Type-check TypeScript: PASS"
    else
        print_error "Type-check TypeScript: FAIL"
        
        if [ "$DEPLOY_MODE" = "prod" ]; then
            exit 1
        fi
    fi
    
    # Build selon le mode
    print_step "Build du frontend ($DEPLOY_MODE)..."
    print_progress "Compilation en cours..."
    
    if [ "$DEPLOY_MODE" = "dev" ]; then
        # Build dev (plus rapide, avec sourcemaps)
        if npm run build 2>&1 | tee -a "$DEPLOY_LOG" | tail -20; then
            print_success "Build frontend (dev): SUCCESS"
        else
            print_error "Build frontend (dev): FAIL"
            exit 1
        fi
    else
        # Build production (optimisé)
        if npm run build 2>&1 | tee -a "$DEPLOY_LOG" | tail -20; then
            print_success "Build frontend (prod): SUCCESS"
        else
            print_error "Build frontend (prod): FAIL"
            exit 1
        fi
    fi
    
    # Analyser le bundle
    print_step "Analyse du bundle..."
    if [ -d "dist" ]; then
        BUNDLE_SIZE=$(du -sh dist | cut -f1)
        FILE_COUNT=$(find dist -type f | wc -l)
        
        print_info "Taille du bundle: $BUNDLE_SIZE"
        print_info "Fichiers générés: $FILE_COUNT"
        
        # Lister les assets principaux
        if [ -d "dist/assets" ]; then
            print_info "Assets principaux:"
            ls -lh dist/assets/*.{js,css} 2>/dev/null | awk '{print "    " $9 " (" $5 ")"}'
        fi
    else
        print_error "Dossier dist non généré"
        exit 1
    fi
}

################################################################################
# 5. TESTS
################################################################################

run_tests() {
    print_header "5. TESTS ET VALIDATION"
    
    if [ "$SKIP_TESTS" = true ]; then
        print_warning "Tests ignorés (--skip-tests)"
        return
    fi
    
    cd "$PROJECT_ROOT"
    
    # Vérifier si des tests existent
    if grep -q '"test"' package.json; then
        print_step "Exécution des tests..."
        
        if npm test 2>&1 | tee -a "$DEPLOY_LOG" | tail -30; then
            print_success "Tests: PASS"
        else
            print_warning "Tests: FAIL ou non configurés"
        fi
    else
        print_info "Aucun test configuré dans package.json"
    fi
    
    # Validation des fichiers critiques
    print_step "Validation des fichiers critiques..."
    
    CRITICAL_FILES=(
        "dist/index.html"
        "src-tauri/Cargo.toml"
        "src-tauri/tauri.conf.json"
        "tsconfig.json"
        "vite.config.ts"
    )
    
    for file in "${CRITICAL_FILES[@]}"; do
        if [ -f "$PROJECT_ROOT/$file" ]; then
            print_success "$file présent"
        else
            print_error "$file manquant"
        fi
    done
}

################################################################################
# 6. BUILD BACKEND RUST (optionnel)
################################################################################

build_backend() {
    print_header "6. BUILD BACKEND RUST"
    
    # Vérifier si Cargo est disponible
    if ! command -v cargo &> /dev/null; then
        print_warning "Cargo non disponible, build backend ignoré"
        return
    fi
    
    cd "$PROJECT_ROOT/src-tauri"
    
    print_step "Vérification des dépendances Rust..."
    
    # Vérifier Cargo.toml
    if [ ! -f "Cargo.toml" ]; then
        print_error "Cargo.toml introuvable"
        return
    fi
    
    # Build backend selon le mode
    if [ "$DEPLOY_MODE" = "prod" ]; then
        print_step "Build backend Rust (release)..."
        print_progress "Compilation optimisée en cours (peut être long)..."
        
        if cargo build --release 2>&1 | tee -a "$DEPLOY_LOG" | tail -30; then
            print_success "Build backend (release): SUCCESS"
            
            # Taille du binaire
            if [ -f "target/release/titane-infinity" ]; then
                BINARY_SIZE=$(du -sh target/release/titane-infinity | cut -f1)
                print_info "Taille du binaire: $BINARY_SIZE"
            fi
        else
            print_warning "Build backend avec erreurs (peut nécessiter webkit2gtk)"
        fi
    else
        print_step "Vérification backend Rust (debug)..."
        
        if cargo check 2>&1 | tee -a "$DEPLOY_LOG" | tail -20; then
            print_success "Vérification backend: PASS"
        else
            print_warning "Vérification backend avec avertissements"
        fi
    fi
}

################################################################################
# 7. BUILD TAURI
################################################################################

build_tauri() {
    print_header "7. BUILD TAURI"
    
    cd "$PROJECT_ROOT"
    
    # Vérifier si Tauri CLI est disponible
    if ! npm list @tauri-apps/cli &> /dev/null; then
        print_warning "Tauri CLI non installé, build Tauri ignoré"
        return
    fi
    
    print_step "Build de l'application Tauri..."
    
    if [ "$DEPLOY_MODE" = "prod" ]; then
        print_progress "Génération des bundles (AppImage, DEB)..."
        
        # Build avec Tauri
        if npm run tauri build 2>&1 | tee -a "$DEPLOY_LOG" | tail -50; then
            print_success "Build Tauri: SUCCESS"
            
            # Lister les bundles générés
            print_step "Bundles générés:"
            
            BUNDLE_DIR="$PROJECT_ROOT/src-tauri/target/release/bundle"
            if [ -d "$BUNDLE_DIR" ]; then
                find "$BUNDLE_DIR" -type f \( -name "*.AppImage" -o -name "*.deb" -o -name "*.dmg" -o -name "*.exe" \) | while read -r bundle; do
                    BUNDLE_SIZE=$(du -sh "$bundle" | cut -f1)
                    print_info "$(basename "$bundle") ($BUNDLE_SIZE)"
                done
            fi
        else
            print_warning "Build Tauri incomplet (peut nécessiter dépendances système)"
        fi
    else
        print_step "Mode dev: Build Tauri ignoré"
        print_info "Utilisez 'npm run tauri dev' pour le développement"
    fi
}

################################################################################
# 8. PACKAGING FINAL
################################################################################

package_deployment() {
    print_header "8. PACKAGING FINAL"
    
    PACKAGE_DIR="$PROJECT_ROOT/deploy_package_$(date +%Y%m%d_%H%M%S)"
    
    print_step "Création du package de déploiement..."
    mkdir -p "$PACKAGE_DIR"
    
    # Copier les fichiers essentiels
    print_step "Copie des fichiers..."
    
    # Frontend build
    if [ -d "$PROJECT_ROOT/dist" ]; then
        cp -r "$PROJECT_ROOT/dist" "$PACKAGE_DIR/"
        print_success "Frontend copié"
    fi
    
    # Configuration
    cp "$PROJECT_ROOT/package.json" "$PACKAGE_DIR/" 2>/dev/null || true
    cp "$PROJECT_ROOT/README.md" "$PACKAGE_DIR/" 2>/dev/null || true
    
    # Tauri bundles (si disponibles)
    if [ -d "$PROJECT_ROOT/src-tauri/target/release/bundle" ]; then
        mkdir -p "$PACKAGE_DIR/bundles"
        cp -r "$PROJECT_ROOT/src-tauri/target/release/bundle"/* "$PACKAGE_DIR/bundles/" 2>/dev/null || true
        print_success "Bundles Tauri copiés"
    fi
    
    # Créer un fichier d'informations
    cat > "$PACKAGE_DIR/DEPLOY_INFO.txt" << EOF
TITANE∞ v9.0.0 - Package de Déploiement
========================================

Date de build: $(date '+%Y-%m-%d %H:%M:%S')
Mode: $DEPLOY_MODE
Node.js: $(node --version)
npm: v$(npm --version)

Contenu:
- dist/         : Frontend compilé
- bundles/      : Applications Tauri (si disponibles)
- package.json  : Configuration du projet

Installation:
1. Extraire le package
2. Pour le frontend: Servir le dossier dist/
3. Pour Tauri: Installer le bundle correspondant à votre OS

Support:
- Documentation: README.md
- Logs: voir deploy_logs/

EOF
    
    print_success "Fichier DEPLOY_INFO.txt créé"
    
    # Calculer la taille totale
    PACKAGE_SIZE=$(du -sh "$PACKAGE_DIR" | cut -f1)
    print_info "Taille du package: $PACKAGE_SIZE"
    print_info "Emplacement: $PACKAGE_DIR"
    
    # Créer une archive (optionnel)
    if command -v tar &> /dev/null; then
        print_step "Création de l'archive..."
        
        ARCHIVE_NAME="titane_infinity_v9_$(date +%Y%m%d_%H%M%S).tar.gz"
        tar -czf "$PROJECT_ROOT/$ARCHIVE_NAME" -C "$(dirname "$PACKAGE_DIR")" "$(basename "$PACKAGE_DIR")"
        
        if [ -f "$PROJECT_ROOT/$ARCHIVE_NAME" ]; then
            ARCHIVE_SIZE=$(du -sh "$PROJECT_ROOT/$ARCHIVE_NAME" | cut -f1)
            print_success "Archive créée: $ARCHIVE_NAME ($ARCHIVE_SIZE)"
        fi
    fi
}

################################################################################
# 9. RAPPORT FINAL
################################################################################

generate_report() {
    print_header "9. RAPPORT DE DÉPLOIEMENT"
    
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    DURATION_MIN=$((DURATION / 60))
    DURATION_SEC=$((DURATION % 60))
    
    # Déterminer le statut
    if [ $ERRORS_COUNT -eq 0 ] && [ $WARNINGS_COUNT -eq 0 ]; then
        STATUS="✅ SUCCÈS COMPLET"
        STATUS_COLOR="${GREEN}"
    elif [ $ERRORS_COUNT -eq 0 ]; then
        STATUS="⚠️  SUCCÈS AVEC AVERTISSEMENTS"
        STATUS_COLOR="${YELLOW}"
    else
        STATUS="❌ ÉCHEC"
        STATUS_COLOR="${RED}"
    fi
    
    echo -e "\n${BOLD}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BOLD}📊 RAPPORT DE DÉPLOIEMENT${NC}"
    echo -e "${BOLD}═══════════════════════════════════════════════════════════${NC}\n"
    
    echo -e "  ${CYAN}•${NC} Statut:        ${STATUS_COLOR}${BOLD}$STATUS${NC}"
    echo -e "  ${CYAN}•${NC} Mode:          ${BOLD}$DEPLOY_MODE${NC}"
    echo -e "  ${CYAN}•${NC} Durée:         ${BOLD}${DURATION_MIN}m ${DURATION_SEC}s${NC}"
    echo -e "  ${CYAN}•${NC} Erreurs:       ${RED}$ERRORS_COUNT${NC}"
    echo -e "  ${CYAN}•${NC} Avertissements: ${YELLOW}$WARNINGS_COUNT${NC}"
    
    echo -e "\n${BOLD}📁 FICHIERS GÉNÉRÉS:${NC}"
    
    if [ -d "$PROJECT_ROOT/dist" ]; then
        DIST_SIZE=$(du -sh "$PROJECT_ROOT/dist" | cut -f1)
        echo -e "  ${GREEN}✓${NC} dist/ ($DIST_SIZE)"
    fi
    
    if [ -d "$PROJECT_ROOT/src-tauri/target/release" ]; then
        echo -e "  ${GREEN}✓${NC} Backend Rust compilé"
    fi
    
    if [ -d "$PROJECT_ROOT/src-tauri/target/release/bundle" ]; then
        echo -e "  ${GREEN}✓${NC} Bundles Tauri"
    fi
    
    echo -e "\n${BOLD}📄 LOGS:${NC}"
    echo -e "  ${CYAN}•${NC} $DEPLOY_LOG"
    
    if [ $ERRORS_COUNT -gt 0 ]; then
        echo -e "\n${RED}${BOLD}⚠️  DES ERREURS ONT ÉTÉ DÉTECTÉES${NC}"
        echo -e "${RED}Consultez le fichier de log pour plus de détails.${NC}"
    fi
    
    echo -e "\n${BOLD}═══════════════════════════════════════════════════════════${NC}\n"
    
    # Sauvegarder le rapport
    {
        echo "TITANE∞ v9.0.0 - Rapport de Déploiement"
        echo "========================================"
        echo ""
        echo "Date: $(date '+%Y-%m-%d %H:%M:%S')"
        echo "Mode: $DEPLOY_MODE"
        echo "Durée: ${DURATION_MIN}m ${DURATION_SEC}s"
        echo ""
        echo "Résultat: $STATUS"
        echo "Erreurs: $ERRORS_COUNT"
        echo "Avertissements: $WARNINGS_COUNT"
        echo ""
        echo "Log détaillé: $DEPLOY_LOG"
    } > "$PROJECT_ROOT/DEPLOY_SUMMARY.txt"
    
    print_info "Résumé sauvegardé: DEPLOY_SUMMARY.txt"
}

################################################################################
# FONCTION PRINCIPALE
################################################################################

main() {
    clear
    print_banner
    
    # Parser les arguments
    parse_arguments "$@"
    
    log "╔════════════════════════════════════════════════════════════╗"
    log "║  TITANE∞ v9.0.0 - Déploiement démarré                     ║"
    log "╚════════════════════════════════════════════════════════════╝"
    log "Mode: $DEPLOY_MODE"
    
    # Exécuter les étapes de déploiement
    check_environment
    install_dependencies
    run_auto_fix
    build_frontend
    run_tests
    build_backend
    build_tauri
    package_deployment
    generate_report
    
    # Message final
    if [ $ERRORS_COUNT -eq 0 ]; then
        echo -e "${GREEN}${BOLD}"
        cat << "EOF"
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║  🎉 DÉPLOIEMENT TERMINÉ AVEC SUCCÈS                       ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
EOF
        echo -e "${NC}\n"
    else
        echo -e "${RED}${BOLD}"
        cat << "EOF"
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║  ⚠️  DÉPLOIEMENT TERMINÉ AVEC ERREURS                     ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
EOF
        echo -e "${NC}\n"
    fi
    
    log "Déploiement terminé"
}

# Gestion des signaux (Ctrl+C)
trap 'echo -e "\n${RED}Déploiement interrompu par utilisateur${NC}"; exit 130' INT

# Exécution
main "$@"
