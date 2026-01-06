#!/bin/bash
# ═════════════════════════════════════════════════════════════════
# TITANE∞ - Script de Validation Automatique Complète v25.3.2
# ═════════════════════════════════════════════════════════════════
# Description: Validation complète de la Perfect Fusion (Backend+Frontend)
# Author: Auto-generated
# Date: $(date +%Y-%m-%d)
# ═════════════════════════════════════════════════════════════════

# Note: set -e désactivé pour permettre la validation complète même si certains checks échouent
# set -e  # Exit on error

# ═══════════════════════════════════════════════════════════════
# COLORS & FORMATTING
# ═══════════════════════════════════════════════════════════════
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# ═══════════════════════════════════════════════════════════════
# VARIABLES
# ═══════════════════════════════════════════════════════════════
WORKSPACE_ROOT="$(pwd)"
ERRORS_FOUND=0
WARNINGS_FOUND=0
SUCCESS_COUNT=0
TOTAL_CHECKS=0

# Gestionnaire de paquets: pnpm-only (corepack préféré)
PNPM=()
resolve_pnpm_cmd() {
    if command -v corepack >/dev/null 2>&1 && corepack pnpm --version >/dev/null 2>&1; then
        PNPM=(corepack pnpm)
        return 0
    fi
    if command -v pnpm >/dev/null 2>&1; then
        PNPM=(pnpm)
        return 0
    fi
    return 1
}

# ═══════════════════════════════════════════════════════════════
# LOGGING FUNCTIONS
# ═══════════════════════════════════════════════════════════════
log_header() {
    echo -e "\n${BOLD}${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BOLD}${CYAN}  $1${NC}"
    echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════════════════${NC}\n"
}

log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
    ((SUCCESS_COUNT++))
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS_FOUND++))
}

log_error() {
    echo -e "${RED}✗${NC} $1"
    ((ERRORS_FOUND++))
}

log_step() {
    ((TOTAL_CHECKS++))
    echo -e "\n${MAGENTA}▶${NC} ${BOLD}[$TOTAL_CHECKS] $1${NC}"
}

# ═══════════════════════════════════════════════════════════════
# VALIDATION FUNCTIONS
# ═══════════════════════════════════════════════════════════════

# 1️⃣ Vérifier l'existence des fichiers critiques
check_critical_files() {
    log_step "Vérification fichiers critiques..."
    
    local files=(
        "src/hooks/useSingularitySync.ts"
        "src/hooks/useMemoryEngine.ts"
        "src/hooks/useSystemHealth.ts"
        "src/components/PerfectFusionDashboard.tsx"
        "src/hooks/__tests__/fusion-hooks.test.ts"
        "src/App.tsx"
    )
    
    for file in "${files[@]}"; do
        if [ -f "$WORKSPACE_ROOT/$file" ]; then
            log_success "Fichier trouvé: $file"
        else
            log_error "FICHIER MANQUANT: $file"
        fi
    done
}

# 2️⃣ Vérifier la syntaxe TypeScript
check_typescript() {
    log_step "Vérification syntaxe TypeScript..."

    if ! resolve_pnpm_cmd; then
        log_error "Gestionnaire de paquets requis introuvable (pnpm/corepack)"
        return 0
    fi

    if "${PNPM[@]}" exec tsc --noEmit 2>&1 | tee /tmp/tsc-errors.log; then
        log_success "TypeScript: Aucune erreur de syntaxe"
    else
        log_error "TypeScript: Erreurs détectées"
        log_warning "Voir détails: /tmp/tsc-errors.log"
    fi
}

# 3️⃣ Vérifier ESLint
check_eslint() {
    log_step "Vérification ESLint..."
    
    local files_to_lint=(
        "src/hooks/useSingularitySync.ts"
        "src/hooks/useMemoryEngine.ts"
        "src/hooks/useSystemHealth.ts"
        "src/components/PerfectFusionDashboard.tsx"
    )
    

    if ! resolve_pnpm_cmd; then
        log_error "Gestionnaire de paquets requis introuvable (pnpm/corepack)"
        return 0
    fi

    for file in "${files_to_lint[@]}"; do
        if "${PNPM[@]}" exec eslint "$WORKSPACE_ROOT/$file" 2>&1 | tee "/tmp/eslint-${TOTAL_CHECKS}.log"; then
            log_success "ESLint OK: $file"
        else
            log_warning "ESLint warnings: $file"
        fi
    done
}

# 4️⃣ Vérifier les tests unitaires
check_tests() {
    log_step "Exécution tests unitaires..."

    if ! resolve_pnpm_cmd; then
        log_error "Gestionnaire de paquets requis introuvable (pnpm/corepack)"
        return 0
    fi

    if "${PNPM[@]}" test -- src/hooks/__tests__/fusion-hooks.test.ts 2>&1 | tee /tmp/test-results.log; then
        log_success "Tests unitaires: PASS"
    else
        log_error "Tests unitaires: ÉCHEC"
        log_warning "Voir détails: /tmp/test-results.log"
    fi
}

# 5️⃣ Vérifier l'intégration dans App.tsx
check_app_integration() {
    log_step "Vérification intégration App.tsx..."
    
    local app_file="$WORKSPACE_ROOT/src/App.tsx"
    
    # Check lazy load
    if grep -q "const PerfectFusionDashboard = lazy" "$app_file"; then
        log_success "Lazy load PerfectFusionDashboard trouvé"
    else
        log_error "Lazy load PerfectFusionDashboard MANQUANT"
    fi
    
    # Check route
    if grep -q 'path="/fusion"' "$app_file"; then
        log_success "Route /fusion trouvée"
    else
        log_error "Route /fusion MANQUANTE"
    fi
    
    # Check sidebar item
    if grep -q "'/fusion'" "$app_file" && grep -q "FUSION" "$app_file"; then
        log_success "Item sidebar FUSION trouvé"
    else
        log_warning "Item sidebar FUSION peut-être manquant"
    fi
}

# 6️⃣ Vérifier les imports
check_imports() {
    log_step "Vérification imports/dépendances..."
    
    local files=(
        "src/hooks/useSingularitySync.ts"
        "src/hooks/useMemoryEngine.ts"
        "src/hooks/useSystemHealth.ts"
        "src/components/PerfectFusionDashboard.tsx"
    )
    
    for file in "${files[@]}"; do
        if [ -f "$WORKSPACE_ROOT/$file" ]; then
            # Check for common imports
            if grep -q "import.*react" "$WORKSPACE_ROOT/$file"; then
                log_success "Imports React OK: $file"
            else
                log_warning "Aucun import React: $file (peut-être normal)"
            fi
        fi
    done
}

# 7️⃣ Statistiques fichiers
check_file_stats() {
    log_step "Statistiques fichiers..."
    
    local files=(
        "src/hooks/useSingularitySync.ts"
        "src/hooks/useMemoryEngine.ts"
        "src/hooks/useSystemHealth.ts"
        "src/components/PerfectFusionDashboard.tsx"
        "src/hooks/__tests__/fusion-hooks.test.ts"
    )
    
    for file in "${files[@]}"; do
        if [ -f "$WORKSPACE_ROOT/$file" ]; then
            local lines=$(wc -l < "$WORKSPACE_ROOT/$file")
            log_info "$(basename $file): $lines lignes"
        fi
    done
}

# 8️⃣ Vérifier la documentation
check_documentation() {
    log_step "Vérification documentation..."
    
    local docs=(
        "docs/FUSION_INTEGRATION_GUIDE.md"
        "docs/FUSION_HOOKS_API.md"
        "docs/FUSION_EXAMPLES.md"
        "docs/FUSION_TESTS.md"
    )
    
    for doc in "${docs[@]}"; do
        if [ -f "$WORKSPACE_ROOT/$doc" ]; then
            log_success "Documentation trouvée: $doc"
        else
            log_warning "Documentation manquante: $doc"
        fi
    done
}

# ═══════════════════════════════════════════════════════════════
# MAIN EXECUTION
# ═══════════════════════════════════════════════════════════════

main() {
    log_header "🌌 TITANE∞ - VALIDATION AUTOMATIQUE COMPLÈTE v25.3.2"
    
    log_info "Workspace: $WORKSPACE_ROOT"
    log_info "Date: $(date)"
    
    # Exécuter toutes les vérifications
    check_critical_files
    check_app_integration
    check_imports
    check_file_stats
    check_documentation
    check_typescript
    check_eslint
    check_tests
    
    # ═══════════════════════════════════════════════════════════
    # RAPPORT FINAL
    # ═══════════════════════════════════════════════════════════
    log_header "📊 RAPPORT FINAL"
    
    echo -e "${BOLD}Statistiques:${NC}"
    echo -e "  Total vérifications: ${CYAN}$TOTAL_CHECKS${NC}"
    echo -e "  Succès: ${GREEN}$SUCCESS_COUNT${NC}"
    echo -e "  Avertissements: ${YELLOW}$WARNINGS_FOUND${NC}"
    echo -e "  Erreurs: ${RED}$ERRORS_FOUND${NC}"
    
    echo ""
    
    if [ $ERRORS_FOUND -eq 0 ]; then
        echo -e "${BOLD}${GREEN}═══════════════════════════════════════════════════════════════${NC}"
        echo -e "${BOLD}${GREEN}  ✓ VALIDATION RÉUSSIE - Prêt pour production!${NC}"
        echo -e "${BOLD}${GREEN}═══════════════════════════════════════════════════════════════${NC}"
        exit 0
    else
        echo -e "${BOLD}${RED}═══════════════════════════════════════════════════════════════${NC}"
        echo -e "${BOLD}${RED}  ✗ VALIDATION ÉCHOUÉE - Erreurs détectées${NC}"
        echo -e "${BOLD}${RED}═══════════════════════════════════════════════════════════════${NC}"
        exit 1
    fi
}

# Lancer le script
main "$@"
