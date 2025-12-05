#!/usr/bin/env bash
################################################################################
# TITANE∞ v12.0.0 - Test Scripts
# Validation automatique de tous les scripts
################################################################################

set -euo pipefail

# Charger fonctions communes
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../utils/common.sh"

log_header "TITANE∞ v12 - TEST DES SCRIPTS"

SCRIPTS_ROOT="$PROJECT_ROOT/scripts"
ERRORS=0
WARNINGS=0
TESTED=0

# Fonction test d'un script
test_script() {
    local script=$1
    local name=$(basename "$script")
    
    log_step "Test: $name"
    
    # Vérifier shebang
    local shebang=$(head -n1 "$script")
    if [[ ! "$shebang" =~ ^#!/ ]]; then
        log_error "  ✗ Shebang manquant"
        ((ERRORS++))
        return 1
    fi
    
    # Vérifier permissions exécution
    if [ ! -x "$script" ]; then
        log_warn "  ⚠ Permissions exécution manquantes"
        chmod +x "$script"
        ((WARNINGS++))
    fi
    
    # Shellcheck si disponible
    if command -v shellcheck &> /dev/null; then
        if ! shellcheck -x "$script" 2>/dev/null; then
            log_warn "  ⚠ Shellcheck a trouvé des warnings"
            ((WARNINGS++))
        fi
    fi
    
    log_success "  ✓ $name OK"
    ((TESTED++))
}

# Test scripts build
log_header "SCRIPTS BUILD"
if [ -d "$SCRIPTS_ROOT/build" ]; then
    for script in "$SCRIPTS_ROOT/build"/*.sh; do
        [ -e "$script" ] && test_script "$script"
    done
fi

# Test scripts deploy
log_header "SCRIPTS DEPLOY"
if [ -d "$SCRIPTS_ROOT/deploy" ]; then
    for script in "$SCRIPTS_ROOT/deploy"/*.sh; do
        [ -e "$script" ] && test_script "$script"
    done
fi

# Test scripts fix
log_header "SCRIPTS FIX"
if [ -d "$SCRIPTS_ROOT/fix" ]; then
    for script in "$SCRIPTS_ROOT/fix"/*.sh; do
        [ -e "$script" ] && test_script "$script"
    done
fi

# Test scripts test
log_header "SCRIPTS TEST"
if [ -d "$SCRIPTS_ROOT/test" ]; then
    for script in "$SCRIPTS_ROOT/test"/*.sh; do
        [ -e "$script" ] && [ "$script" != "${BASH_SOURCE[0]}" ] && test_script "$script"
    done
fi

# Test scripts utils
log_header "SCRIPTS UTILS"
if [ -d "$SCRIPTS_ROOT/utils" ]; then
    for script in "$SCRIPTS_ROOT/utils"/*.sh; do
        [ -e "$script" ] && test_script "$script"
    done
fi

# Test scripts pipeline
log_header "SCRIPTS PIPELINE"
if [ -d "$SCRIPTS_ROOT/pipeline" ]; then
    for script in "$SCRIPTS_ROOT/pipeline"/*.sh; do
        [ -e "$script" ] && test_script "$script"
    done
fi

# Résumé
log_header "RÉSUMÉ DES TESTS"

log_info "Scripts testés: $TESTED"
if [ $WARNINGS -gt 0 ]; then
    log_warn "Warnings: $WARNINGS"
fi
if [ $ERRORS -gt 0 ]; then
    log_error "Erreurs: $ERRORS"
    exit 1
fi

log_success "Tous les tests passés ✓"

exit 0
