#!/bin/bash

################################################################################
# TITANE∞ v9.0.0 - Script de Correction Automatique Complète et Optimisé
# 
# Ce script effectue une correction automatique complète du projet :
# - Détection version Tauri (v1 vs v2)
# - Correction des imports TypeScript (Frontend + Backend + Memory)
# - Validation des commandes Rust
# - Vérification modules Memory (v1 & v2)
# - Correction des configurations
# - Build et validation complète
# - Optimisation des performances
#
# Usage: ./auto_fix_complete.sh [--verbose] [--skip-build]
################################################################################

set -e  # Arrêt en cas d'erreur

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Variables globales
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TAURI_VERSION=""
CORRECT_IMPORT=""
ERRORS_FOUND=0
FIXES_APPLIED=0
WARNINGS_FOUND=0
VERBOSE=false
SKIP_BUILD=false

# Options de ligne de commande
for arg in "$@"; do
    case $arg in
        --verbose) VERBOSE=true ;;
        --skip-build) SKIP_BUILD=true ;;
        --help)
            echo "Usage: $0 [--verbose] [--skip-build] [--help]"
            echo "  --verbose     Affichage détaillé"
            echo "  --skip-build  Ignorer le build npm"
            echo "  --help        Afficher cette aide"
            exit 0
            ;;
    esac
done

################################################################################
# Fonctions utilitaires
################################################################################

print_header() {
    echo -e "\n${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}  ${BOLD}$1${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}\n"
}

print_step() {
    echo -e "${BLUE}▶${NC} ${BOLD}$1${NC}"
}

print_success() {
    echo -e "  ${GREEN}✅${NC} $1"
}

print_error() {
    echo -e "  ${RED}❌${NC} $1"
    ((ERRORS_FOUND++))
}

print_warning() {
    echo -e "  ${YELLOW}⚠️${NC}  $1"
    ((WARNINGS_FOUND++))
}

print_info() {
    echo -e "  ${CYAN}ℹ️${NC}  $1"
}

print_fix() {
    echo -e "  ${MAGENTA}🔧${NC} $1"
    ((FIXES_APPLIED++))
}

print_verbose() {
    if [ "$VERBOSE" = true ]; then
        echo -e "  ${CYAN}→${NC} $1"
    fi
}

################################################################################
# 1. DÉTECTION VERSION TAURI
################################################################################

detect_tauri_version() {
    print_header "1. DÉTECTION VERSION TAURI"
    
    print_step "Recherche de la version Tauri dans Cargo.toml..."
    
    if [ -f "$PROJECT_ROOT/src-tauri/Cargo.toml" ]; then
        TAURI_VERSION=$(grep -E '^tauri = \{ version = "([^"]+)"' "$PROJECT_ROOT/src-tauri/Cargo.toml" | sed -E 's/.*version = "([0-9]+)\..*/\1/')
        
        if [ "$TAURI_VERSION" = "2" ]; then
            CORRECT_IMPORT="@tauri-apps/api/core"
            print_success "Tauri v2.x détecté"
            print_info "Import correct: import { invoke } from '$CORRECT_IMPORT';"
        elif [ "$TAURI_VERSION" = "1" ]; then
            CORRECT_IMPORT="@tauri-apps/api/tauri"
            print_success "Tauri v1.x détecté"
            print_info "Import correct: import { invoke } from '$CORRECT_IMPORT';"
        else
            print_error "Version Tauri non détectée ou invalide"
            exit 1
        fi
    else
        print_error "Fichier src-tauri/Cargo.toml introuvable"
        exit 1
    fi
}

################################################################################
# 2. VÉRIFICATION ET CORRECTION DES IMPORTS TYPESCRIPT
################################################################################

fix_typescript_imports() {
    print_header "2. CORRECTION DES IMPORTS TYPESCRIPT"
    
    print_step "Recherche des fichiers TypeScript utilisant invoke()..."
    
    # Trouver tous les fichiers .ts et .tsx (excluant node_modules)
    FILES_WITH_INVOKE=$(find "$PROJECT_ROOT/core/frontend" "$PROJECT_ROOT/src" -type f \( -name "*.ts" -o -name "*.tsx" \) \
        ! -path "*/node_modules/*" \
        ! -path "*/dist/*" \
        ! -path "*/build/*" \
        ! -path "*/.d.ts" \
        -exec grep -l "invoke(" {} \; 2>/dev/null || true)
    
    if [ -z "$FILES_WITH_INVOKE" ]; then
        print_info "Aucun fichier TypeScript n'utilise invoke()"
        return
    fi
    
    local files_count=0
    local fixed_count=0
    
    echo "$FILES_WITH_INVOKE" | while read -r file; do
        ((files_count++))
        print_step "Analyse [$files_count]: ${file#$PROJECT_ROOT/}"
        
        # Vérifier si le fichier a déjà le bon import
        if grep -q "from '$CORRECT_IMPORT'" "$file"; then
            print_success "Import correct déjà présent"
            
            # Vérifier les doublons d'imports
            DUPLICATE_COUNT=$(grep -c "from '$CORRECT_IMPORT'" "$file" || true)
            if [ "$DUPLICATE_COUNT" -gt 1 ]; then
                print_warning "Import dupliqué détecté ($DUPLICATE_COUNT fois)"
                print_verbose "Suppression des doublons..."
                
                # Garder seulement le premier import
                awk '!seen[$0]++ || !/from.*@tauri-apps\/api/' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
                print_fix "Doublons d'imports supprimés"
                ((fixed_count++))
            fi
        else
            # Vérifier les imports incorrects
            WRONG_IMPORTS=$(grep -E "from ['\"]@tauri-apps/api/(tauri|core)['\"]" "$file" || true)
            
            if [ -n "$WRONG_IMPORTS" ]; then
                print_warning "Import incorrect détecté"
                print_verbose "Ancien: $WRONG_IMPORTS"
                
                # Correction automatique
                if [ "$TAURI_VERSION" = "2" ]; then
                    sed -i "s|from '@tauri-apps/api/tauri'|from '@tauri-apps/api/core'|g" "$file"
                    sed -i 's|from "@tauri-apps/api/tauri"|from "@tauri-apps/api/core"|g' "$file"
                else
                    sed -i "s|from '@tauri-apps/api/core'|from '@tauri-apps/api/tauri'|g" "$file"
                    sed -i 's|from "@tauri-apps/api/core"|from "@tauri-apps/api/tauri"|g' "$file"
                fi
                
                print_fix "Import corrigé vers: $CORRECT_IMPORT"
                ((fixed_count++))
            else
                # Aucun import, ajouter le bon
                print_warning "Import invoke manquant"
                
                # Ajouter l'import au début du fichier (après les imports existants)
                if grep -q "^import" "$file"; then
                    # Trouver la dernière ligne d'import
                    LAST_IMPORT_LINE=$(grep -n "^import" "$file" | tail -1 | cut -d: -f1)
                    sed -i "${LAST_IMPORT_LINE}a\\import { invoke } from '$CORRECT_IMPORT';" "$file"
                else
                    # Aucun import, ajouter en haut
                    sed -i "1i\\import { invoke } from '$CORRECT_IMPORT';" "$file"
                fi
                
                print_fix "Import ajouté: import { invoke } from '$CORRECT_IMPORT';"
                ((fixed_count++))
            fi
        fi
        
        # Vérifier les appels invoke() pour s'assurer qu'ils sont corrects
        INVOKE_CALLS=$(grep -o "invoke(['\"][^'\"]*['\"]" "$file" | sed "s/invoke(['\"]//g" | sed "s/['\"]//g" || true)
        if [ -n "$INVOKE_CALLS" ]; then
            print_verbose "Commandes invoke() utilisées: $(echo "$INVOKE_CALLS" | tr '\n' ', ' | sed 's/,$//')"
        fi
    done
    
    print_info "Fichiers analysés: $files_count"
    if [ $fixed_count -gt 0 ]; then
        print_info "Fichiers corrigés: $fixed_count"
    fi
}

################################################################################
# 3. VÉRIFICATION DES COMMANDES RUST TAURI + MODULES MEMORY
################################################################################

verify_rust_commands() {
    print_header "3. VÉRIFICATION COMMANDES RUST TAURI & MEMORY"
    
    print_step "Recherche des commandes Tauri dans le backend Rust..."
    
    # Chercher tous les #[tauri::command]
    RUST_COMMANDS=$(find "$PROJECT_ROOT/src-tauri/src" "$PROJECT_ROOT/core/backend" -type f -name "*.rs" \
        -exec grep -B 1 "#\[tauri::command\]" {} \; 2>/dev/null | \
        grep "^pub fn\|^fn" | \
        sed 's/pub fn //g' | sed 's/fn //g' | \
        sed 's/(.*//' | sort -u || true)
    
    if [ -z "$RUST_COMMANDS" ]; then
        print_warning "Aucune commande Tauri trouvée dans le backend"
    else
        print_success "Commandes Tauri détectées:"
        local cmd_count=0
        echo "$RUST_COMMANDS" | while read -r cmd; do
            ((cmd_count++))
            echo -e "    ${GREEN}•${NC} $cmd"
        done
        
        # Vérification spécifique des modules Memory
        print_step "Vérification des modules Memory..."
        
        # Memory v1
        MEMORY_V1_PATH="$PROJECT_ROOT/src-tauri/src/system/memory/mod.rs"
        if [ ! -f "$MEMORY_V1_PATH" ]; then
            MEMORY_V1_PATH="$PROJECT_ROOT/core/backend/system/memory/mod.rs"
        fi
        
        if [ -f "$MEMORY_V1_PATH" ]; then
            print_success "Module Memory v1 trouvé"
            
            # Vérifier les commandes Memory v1
            MEMORY_V1_CMDS=("save_entry" "load_entries" "clear_memory" "get_memory_state")
            for cmd in "${MEMORY_V1_CMDS[@]}"; do
                if grep -q "pub fn $cmd" "$MEMORY_V1_PATH"; then
                    print_verbose "  ✓ memory::$cmd"
                else
                    print_warning "Commande memory::$cmd manquante"
                fi
            done
        else
            print_warning "Module Memory v1 introuvable"
        fi
        
        # Memory v2
        MEMORY_V2_PATH="$PROJECT_ROOT/src-tauri/src/system/memory_v2/mod.rs"
        if [ ! -f "$MEMORY_V2_PATH" ]; then
            MEMORY_V2_PATH="$PROJECT_ROOT/core/backend/system/memory_v2/mod.rs"
        fi
        
        if [ -f "$MEMORY_V2_PATH" ]; then
            print_success "Module Memory v2 trouvé"
            
            # Vérifier les commandes Memory v2
            MEMORY_V2_CMDS=("save_entry" "load_entries" "clear_memory" "get_memory_state")
            for cmd in "${MEMORY_V2_CMDS[@]}"; do
                if grep -q "pub fn $cmd" "$MEMORY_V2_PATH"; then
                    print_verbose "  ✓ memory_v2::$cmd"
                else
                    print_warning "Commande memory_v2::$cmd manquante"
                fi
            done
        else
            print_warning "Module Memory v2 introuvable"
        fi
        
        # Vérifier que les commandes sont enregistrées dans invoke_handler
        print_step "Vérification de l'enregistrement des commandes..."
        
        MAIN_RS="$PROJECT_ROOT/src-tauri/src/main.rs"
        if [ ! -f "$MAIN_RS" ]; then
            MAIN_RS="$PROJECT_ROOT/core/backend/main.rs"
        fi
        
        if [ -f "$MAIN_RS" ]; then
            if grep -q "invoke_handler" "$MAIN_RS"; then
                print_success "invoke_handler trouvé dans main.rs"
                
                # Compter les commandes enregistrées
                REGISTERED_COUNT=$(grep -A 30 "invoke_handler" "$MAIN_RS" | grep -c "," || true)
                print_info "Nombre de commandes enregistrées: $REGISTERED_COUNT"
                
                # Vérifier les commandes Memory spécifiques
                if grep -A 30 "invoke_handler" "$MAIN_RS" | grep -q "system::memory::save_entry"; then
                    print_success "Commandes Memory v1 enregistrées"
                else
                    print_warning "Commandes Memory v1 non enregistrées dans invoke_handler"
                fi
                
                if grep -A 30 "invoke_handler" "$MAIN_RS" | grep -q "system::memory_v2::save_entry"; then
                    print_success "Commandes Memory v2 enregistrées"
                else
                    print_warning "Commandes Memory v2 non enregistrées dans invoke_handler"
                fi
            else
                print_error "invoke_handler non trouvé dans main.rs"
            fi
        else
            print_error "Fichier main.rs introuvable"
        fi
    fi
    
    # Vérifier la structure complète du backend
    print_step "Analyse de la structure complète du backend..."
    
    # Compter les modules par catégorie
    SYSTEM_MODULES=$(find "$PROJECT_ROOT/src-tauri/src/system" "$PROJECT_ROOT/core/backend/system" -type d 2>/dev/null | wc -l || echo 0)
    SHARED_MODULES=$(find "$PROJECT_ROOT/src-tauri/src/shared" "$PROJECT_ROOT/core/backend/shared" -type f -name "*.rs" 2>/dev/null | wc -l || echo 0)
    
    print_info "Modules système détectés: $SYSTEM_MODULES"
    print_info "Fichiers shared détectés: $SHARED_MODULES"
}

################################################################################
# 4. CORRECTION DES CONFIGURATIONS
################################################################################

fix_configurations() {
    print_header "4. CORRECTION DES CONFIGURATIONS"
    
    # 4.1 tsconfig.json
    print_step "Vérification de tsconfig.json..."
    
    TSCONFIG="$PROJECT_ROOT/tsconfig.json"
    if [ -f "$TSCONFIG" ]; then
        # Vérifier les deprecations
        if grep -q '"ignoreDeprecations"' "$TSCONFIG"; then
            print_warning "ignoreDeprecations détecté"
            
            # Supprimer ignoreDeprecations et baseUrl si présents
            sed -i '/"ignoreDeprecations"/d' "$TSCONFIG"
            
            if grep -q '"baseUrl"' "$TSCONFIG"; then
                sed -i '/"baseUrl"/d' "$TSCONFIG"
                print_fix "baseUrl et ignoreDeprecations supprimés"
            else
                print_fix "ignoreDeprecations supprimé"
            fi
        else
            print_success "tsconfig.json correct"
        fi
        
        # Vérifier les alias de chemin
        if grep -q '"paths"' "$TSCONFIG"; then
            print_verbose "Aliases de chemins configurés"
        fi
    else
        print_error "tsconfig.json introuvable"
    fi
    
    # 4.2 Cargo.toml
    print_step "Vérification de Cargo.toml..."
    
    CARGO_TOML="$PROJECT_ROOT/src-tauri/Cargo.toml"
    if [ -f "$CARGO_TOML" ]; then
        # Vérifier les features invalides pour Tauri v2
        if [ "$TAURI_VERSION" = "2" ]; then
            INVALID_FEATURES=$(grep -E '(clipboard-all|dialog-all|fs-all|notification-all|window-all)' "$CARGO_TOML" || true)
            
            if [ -n "$INVALID_FEATURES" ]; then
                print_warning "Features Tauri v2 invalides détectées"
                print_verbose "Features invalides: $INVALID_FEATURES"
                
                # Remplacer par features vides (plus sûr)
                sed -i 's/features = \[.*\]/features = []/' "$CARGO_TOML"
                print_fix "Features Tauri simplifiées (API disponibles par défaut)"
            else
                print_success "Cargo.toml correct pour Tauri v2"
            fi
        else
            print_success "Cargo.toml vérifié"
        fi
        
        # Vérifier les dépendances essentielles
        print_step "Vérification des dépendances Rust essentielles..."
        
        REQUIRED_DEPS=("serde" "serde_json" "log" "env_logger")
        local missing_deps=0
        
        for dep in "${REQUIRED_DEPS[@]}"; do
            if grep -q "^$dep = " "$CARGO_TOML"; then
                print_verbose "  ✓ $dep"
            else
                print_warning "$dep manquant"
                ((missing_deps++))
            fi
        done
        
        if [ $missing_deps -eq 0 ]; then
            print_success "Toutes les dépendances essentielles sont présentes"
        fi
        
        # Vérifier les dépendances pour Memory (crypto)
        print_step "Vérification dépendances Memory (chiffrement)..."
        
        CRYPTO_DEPS=("aes-gcm" "sha2" "base64" "uuid")
        local crypto_missing=0
        
        for dep in "${CRYPTO_DEPS[@]}"; do
            if grep -q "^$dep = " "$CARGO_TOML"; then
                print_verbose "  ✓ $dep"
            else
                print_warning "$dep manquant (requis pour Memory)"
                ((crypto_missing++))
            fi
        done
        
        if [ $crypto_missing -eq 0 ]; then
            print_success "Dépendances crypto pour Memory présentes"
        else
            print_warning "$crypto_missing dépendance(s) crypto manquante(s)"
        fi
    else
        print_error "Cargo.toml introuvable"
    fi
    
    # 4.3 vite.config.ts
    print_step "Vérification de vite.config.ts..."
    
    VITE_CONFIG="$PROJECT_ROOT/vite.config.ts"
    if [ -f "$VITE_CONFIG" ]; then
        if grep -q "defineConfig" "$VITE_CONFIG"; then
            print_success "vite.config.ts présent et valide"
            
            # Vérifier les alias
            if grep -q "alias:" "$VITE_CONFIG" || grep -q "resolve:" "$VITE_CONFIG"; then
                print_verbose "Aliases de chemins configurés dans Vite"
            fi
            
            # Vérifier la configuration du build
            if grep -q "build:" "$VITE_CONFIG"; then
                print_verbose "Configuration build personnalisée détectée"
            fi
        else
            print_error "vite.config.ts invalide"
        fi
    else
        print_error "vite.config.ts introuvable"
    fi
    
    # 4.4 package.json
    print_step "Vérification de package.json..."
    
    PACKAGE_JSON="$PROJECT_ROOT/package.json"
    if [ -f "$PACKAGE_JSON" ]; then
        # Vérifier les scripts essentiels
        REQUIRED_SCRIPTS=("dev" "build" "type-check")
        local missing_scripts=0
        
        for script in "${REQUIRED_SCRIPTS[@]}"; do
            if grep -q "\"$script\":" "$PACKAGE_JSON"; then
                print_verbose "  ✓ Script '$script'"
            else
                print_warning "Script '$script' manquant"
                ((missing_scripts++))
            fi
        done
        
        if [ $missing_scripts -eq 0 ]; then
            print_success "Scripts npm essentiels présents"
        fi
        
        # Vérifier les dépendances Tauri
        if grep -q "@tauri-apps/api" "$PACKAGE_JSON"; then
            TAURI_API_VERSION=$(grep "@tauri-apps/api" "$PACKAGE_JSON" | sed -E 's/.*"([0-9]+\.[0-9]+\.[0-9]+)".*/\1/' | head -1)
            print_success "@tauri-apps/api présent (version: $TAURI_API_VERSION)"
        else
            print_error "@tauri-apps/api manquant dans package.json"
        fi
    else
        print_error "package.json introuvable"
    fi
}

################################################################################
# 5. VALIDATION TYPESCRIPT
################################################################################

validate_typescript() {
    print_header "5. VALIDATION TYPESCRIPT"
    
    print_step "Exécution de tsc --noEmit..."
    
    cd "$PROJECT_ROOT"
    
    if command -v npm &> /dev/null; then
        # Charger NVM si disponible
        if [ -f "$HOME/.nvm/nvm.sh" ]; then
            source "$HOME/.nvm/nvm.sh"
        elif [ -f "$HOME/.var/app/com.visualstudio.code/config/nvm/nvm.sh" ]; then
            export NVM_DIR="$HOME/.var/app/com.visualstudio.code/config/nvm"
            source "$NVM_DIR/nvm.sh"
        fi
        
        # Type-check TypeScript
        if npm run type-check 2>&1 | tee /tmp/tsc_output.txt; then
            print_success "Type-check TypeScript: PASS"
        else
            print_error "Type-check TypeScript: FAIL"
            cat /tmp/tsc_output.txt
        fi
    else
        print_warning "npm non disponible, type-check ignoré"
    fi
}

################################################################################
# 6. BUILD PRODUCTION
################################################################################

build_production() {
    print_header "6. BUILD PRODUCTION"
    
    if [ "$SKIP_BUILD" = true ]; then
        print_warning "Build ignoré (--skip-build activé)"
        return
    fi
    
    print_step "Exécution de npm run build..."
    
    cd "$PROJECT_ROOT"
    
    if command -v npm &> /dev/null; then
        # Build production
        if npm run build 2>&1 | tee /tmp/build_output.txt | tail -20; then
            print_success "Build production: SUCCESS"
            
            # Afficher les statistiques
            if [ -d "$PROJECT_ROOT/dist" ]; then
                BUNDLE_SIZE=$(du -sh "$PROJECT_ROOT/dist" | cut -f1)
                FILE_COUNT=$(find "$PROJECT_ROOT/dist" -type f | wc -l)
                
                print_info "Taille du bundle: $BUNDLE_SIZE"
                print_info "Nombre de fichiers: $FILE_COUNT"
                
                # Lister les assets principaux
                if [ -d "$PROJECT_ROOT/dist/assets" ]; then
                    print_verbose "Assets générés:"
                    ls -lh "$PROJECT_ROOT/dist/assets" | tail -10 | while read -r line; do
                        print_verbose "  $line"
                    done
                fi
            fi
        else
            print_error "Build production: FAIL"
            print_verbose "Dernières lignes de sortie:"
            tail -50 /tmp/build_output.txt | while read -r line; do
                print_verbose "  $line"
            done
        fi
    else
        print_warning "npm non disponible, build ignoré"
    fi
}

################################################################################
# 7. VÉRIFICATION STRUCTURE BACKEND
################################################################################

verify_backend_structure() {
    print_header "7. VÉRIFICATION STRUCTURE BACKEND COMPLÈTE"
    
    print_step "Vérification de la structure du backend Rust..."
    
    # Vérifier src-tauri/src/lib.rs
    LIB_RS="$PROJECT_ROOT/src-tauri/src/lib.rs"
    if [ -f "$LIB_RS" ]; then
        if grep -q "pub use crate::main::run" "$LIB_RS" || grep -q "pub fn run()" "$LIB_RS"; then
            print_success "lib.rs correct"
        else
            print_warning "lib.rs pourrait être incorrect"
            
            # Vérifier si le backend est dans core/backend
            if [ -d "$PROJECT_ROOT/core/backend" ]; then
                print_info "Backend détecté dans core/backend/"
                
                if [ ! -f "$PROJECT_ROOT/src-tauri/src/main.rs" ]; then
                    print_warning "main.rs manquant dans src-tauri/src/"
                    print_info "Suggestion: Copier core/backend/* vers src-tauri/src/"
                    print_verbose "Commande: cp -r core/backend/* src-tauri/src/"
                fi
            fi
        fi
    else
        print_error "lib.rs introuvable"
    fi
    
    # Compter les modules
    print_step "Analyse des modules Rust..."
    
    RUST_FILES_COUNT=$(find "$PROJECT_ROOT/src-tauri/src" "$PROJECT_ROOT/core/backend" -type f -name "*.rs" 2>/dev/null | wc -l || echo 0)
    print_info "Nombre total de fichiers Rust: $RUST_FILES_COUNT"
    
    # Analyser la structure des modules
    if [ -d "$PROJECT_ROOT/src-tauri/src/system" ] || [ -d "$PROJECT_ROOT/core/backend/system" ]; then
        print_step "Modules système détectés:"
        
        SYSTEM_DIR="$PROJECT_ROOT/src-tauri/src/system"
        if [ ! -d "$SYSTEM_DIR" ]; then
            SYSTEM_DIR="$PROJECT_ROOT/core/backend/system"
        fi
        
        if [ -d "$SYSTEM_DIR" ]; then
            MODULE_CATEGORIES=$(find "$SYSTEM_DIR" -maxdepth 1 -type d ! -path "$SYSTEM_DIR" | wc -l)
            print_success "$MODULE_CATEGORIES catégories de modules détectées"
            
            # Lister les principaux modules
            if [ "$VERBOSE" = true ]; then
                find "$SYSTEM_DIR" -maxdepth 1 -type d ! -path "$SYSTEM_DIR" | while read -r dir; do
                    MODULE_NAME=$(basename "$dir")
                    FILE_COUNT=$(find "$dir" -name "*.rs" | wc -l)
                    print_verbose "  • $MODULE_NAME ($FILE_COUNT fichiers)"
                done
            fi
            
            # Vérifier les modules critiques
            CRITICAL_MODULES=("memory" "memory_v2" "helios" "nexus" "watchdog")
            print_step "Vérification modules critiques:"
            
            for module in "${CRITICAL_MODULES[@]}"; do
                if [ -d "$SYSTEM_DIR/$module" ]; then
                    print_success "Module $module présent"
                else
                    print_warning "Module $module manquant"
                fi
            done
        fi
    fi
    
    # Vérifier les types partagés
    print_step "Vérification des types partagés..."
    
    SHARED_DIR="$PROJECT_ROOT/src-tauri/src/shared"
    if [ ! -d "$SHARED_DIR" ]; then
        SHARED_DIR="$PROJECT_ROOT/core/backend/shared"
    fi
    
    if [ -d "$SHARED_DIR" ]; then
        SHARED_FILES=$(find "$SHARED_DIR" -name "*.rs" | wc -l)
        print_success "Types partagés: $SHARED_FILES fichiers"
    else
        print_warning "Dossier shared/ introuvable"
    fi
}

################################################################################
# 8. GÉNÉRATION DU RAPPORT
################################################################################

generate_report() {
    print_header "8. RAPPORT FINAL DÉTAILLÉ"
    
    print_step "Résumé des opérations effectuées:"
    
    echo -e "\n${BOLD}📊 STATISTIQUES COMPLÈTES${NC}"
    echo -e "  ${CYAN}•${NC} Erreurs détectées:      ${RED}$ERRORS_FOUND${NC}"
    echo -e "  ${CYAN}•${NC} Avertissements:         ${YELLOW}$WARNINGS_FOUND${NC}"
    echo -e "  ${CYAN}•${NC} Corrections appliquées: ${GREEN}$FIXES_APPLIED${NC}"
    echo -e "  ${CYAN}•${NC} Version Tauri:          ${BLUE}v$TAURI_VERSION${NC}"
    echo -e "  ${CYAN}•${NC} Import correct:         ${MAGENTA}$CORRECT_IMPORT${NC}"
    
    # Déterminer le statut global
    if [ $ERRORS_FOUND -eq 0 ] && [ $WARNINGS_FOUND -eq 0 ]; then
        echo -e "\n${GREEN}${BOLD}✅ PROJET 100% STABLE${NC}"
        echo -e "${GREEN}Tous les tests ont réussi, aucune erreur ni avertissement.${NC}\n"
        STATUS="EXCELLENT"
    elif [ $ERRORS_FOUND -eq 0 ] && [ $WARNINGS_FOUND -le 3 ]; then
        echo -e "\n${GREEN}${BOLD}✅ PROJET STABLE${NC}"
        echo -e "${GREEN}Aucune erreur détectée. Quelques avertissements mineurs.${NC}\n"
        STATUS="GOOD"
    elif [ $ERRORS_FOUND -eq 0 ]; then
        echo -e "\n${YELLOW}${BOLD}⚠️  PROJET FONCTIONNEL${NC}"
        echo -e "${YELLOW}Aucune erreur critique mais plusieurs avertissements.${NC}\n"
        STATUS="WARNING"
    else
        echo -e "\n${RED}${BOLD}❌ ATTENTION${NC}"
        echo -e "${RED}$ERRORS_FOUND erreur(s) détectée(s). Correction manuelle requise.${NC}\n"
        STATUS="ERROR"
    fi
    
    # Créer un fichier de rapport détaillé
    REPORT_FILE="$PROJECT_ROOT/auto_fix_report_$(date +%Y%m%d_%H%M%S).txt"
    {
        echo "╔════════════════════════════════════════════════════════════╗"
        echo "║  TITANE∞ v9.0.0 - Rapport de Correction Automatique      ║"
        echo "╚════════════════════════════════════════════════════════════╝"
        echo ""
        echo "Date: $(date '+%d/%m/%Y %H:%M:%S')"
        echo "Répertoire: $PROJECT_ROOT"
        echo ""
        echo "═══════════════════════════════════════════════════════════"
        echo "CONFIGURATION DÉTECTÉE"
        echo "═══════════════════════════════════════════════════════════"
        echo "Version Tauri:    v$TAURI_VERSION"
        echo "Import correct:   $CORRECT_IMPORT"
        echo ""
        echo "═══════════════════════════════════════════════════════════"
        echo "STATISTIQUES"
        echo "═══════════════════════════════════════════════════════════"
        echo "Erreurs détectées:      $ERRORS_FOUND"
        echo "Avertissements:         $WARNINGS_FOUND"
        echo "Corrections appliquées: $FIXES_APPLIED"
        echo ""
        echo "═══════════════════════════════════════════════════════════"
        echo "RÉSULTAT"
        echo "═══════════════════════════════════════════════════════════"
        echo "Statut global: $STATUS"
        echo ""
        if [ $ERRORS_FOUND -eq 0 ]; then
            echo "✅ VALIDATION: Le projet est prêt pour le développement"
        else
            echo "❌ ACTION REQUISE: Corriger les erreurs manuellement"
        fi
        echo ""
        echo "═══════════════════════════════════════════════════════════"
        echo "FIN DU RAPPORT"
        echo "═══════════════════════════════════════════════════════════"
    } > "$REPORT_FILE"
    
    print_info "Rapport sauvegardé: ${REPORT_FILE#$PROJECT_ROOT/}"
    
    # Afficher les recommandations
    if [ $WARNINGS_FOUND -gt 0 ] || [ $ERRORS_FOUND -gt 0 ]; then
        echo -e "\n${BOLD}💡 RECOMMANDATIONS:${NC}"
        
        if [ $ERRORS_FOUND -gt 0 ]; then
            echo -e "  ${RED}1.${NC} Consulter le rapport détaillé ci-dessus"
            echo -e "  ${RED}2.${NC} Corriger les erreurs manuellement"
            echo -e "  ${RED}3.${NC} Réexécuter ce script pour vérification"
        fi
        
        if [ $WARNINGS_FOUND -gt 0 ]; then
            echo -e "  ${YELLOW}•${NC} Vérifier les avertissements dans le rapport"
            echo -e "  ${YELLOW}•${NC} Ajouter les dépendances manquantes si nécessaire"
        fi
    fi
    
    echo ""
}

################################################################################
# FONCTION PRINCIPALE
################################################################################

main() {
    clear
    
    echo -e "${CYAN}${BOLD}"
    cat << "EOF"
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     🌌 TITANE∞ v9.0.0                                     ║
║     Script de Correction Automatique Complète             ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}\n"
    
    print_info "Répertoire projet: $PROJECT_ROOT"
    
    # Exécution des étapes
    detect_tauri_version
    fix_typescript_imports
    verify_rust_commands
    fix_configurations
    validate_typescript
    build_production
    verify_backend_structure
    generate_report
    
    echo -e "\n${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}  ${BOLD}Correction automatique terminée${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}\n"
}

# Exécution
main "$@"
