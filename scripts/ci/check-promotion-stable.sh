#!/bin/bash

# PHASE 6: Gate promotion STABLE - Validation automatisée
# Vérifie si une capacité peut être promue de QUALIFIED → STABLE
# Usage: ./check-promotion-stable.sh <capability-file>
# Statut: CONSTITUTIONNEL (PHASE 6 core)

set -euo pipefail

# === CONFIGURATION ===

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
CAPABILITIES_DIR="$REPO_ROOT/docs/capabilities"
REGISTRY_FILE="$REPO_ROOT/docs/CAPABILITIES_REGISTRY.md"

# Couleurs pour output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# === FONCTIONS UTILITAIRES ===

log() {
    echo -e "${BLUE}[GATE-PROMOTION]${NC} $*"
}

error() {
    echo -e "${RED}[ERROR]${NC} $*" >&2
}

success() {
    echo -e "${GREEN}[OK]${NC} $*"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $*"
}

# === VALIDATION CHECKLIST PROMOTION ===

check_capability_file() {
    local cap_file="$1"
    local cap_name
    
    cap_name="$(basename "$cap_file" .md)"
    log "Validating capability: $cap_name"
    
    if [[ ! -f "$cap_file" ]]; then
        error "Capability file not found: $cap_file"
        return 1
    fi
    
    # Vérifier que c'est bien QUALIFIED → STABLE
    if ! grep -q "Statut.*QUALIFIED\|\*\*Statut actuel\*\*.*QUALIFIED" "$cap_file"; then
        error "Capability must be QUALIFIED before promotion to STABLE"
        return 1
    fi
    
    success "Capability file exists and status is QUALIFIED"
    return 0
}

check_promotion_checklist() {
    local cap_file="$1"
    local errors=0
    
    log "Checking 11-item promotion checklist..."
    
    # Les 11 items obligatoires du protocole
    local checklist_items=(
        "justification technique et besoin métier documentés"
        "surface d'exposition minimale justifiée"
        "validation inputs/outputs avec contrats"
        "tests automatisés 90%+ coverage"
        "gates CI configurés et PASS"
        "observabilité et logs configurés"
        "procédure rollback testée"
        "mode dégradé local-first opérationnel"
        "documentation utilisateur complète"
        "review technique approuvée"
        "validation sécurité et privacy impact"
    )
    
    for item in "${checklist_items[@]}"; do
        # Vérifier que l'item est coché [x] dans le fichier
        # Approche simple : chercher ligne contenant "- [x]" puis vérifier si elle contient l'item
        if grep -- "- \[x\]" "$cap_file" | grep -qF "$item"; then
            success "✓ $item"
        else
            error "✗ Missing or unchecked: $item"
            ((errors++))
        fi
    done
    
    if [[ $errors -gt 0 ]]; then
        error "$errors checklist items not completed"
        return 1
    fi
    
    success "All 11 checklist items completed"
    return 0
}

check_tests_coverage() {
    local cap_name="$1"
    local test_files
    
    log "Checking test coverage for capability: $cap_name"
    
    # Chercher les fichiers de test associés
    test_files=$(find "$REPO_ROOT" -name "*${cap_name}*.test.ts" -o -name "*${cap_name}*.test.js" -o -name "*${cap_name}*.rs" | grep -i test || true)
    
    if [[ -z "$test_files" ]]; then
        warn "No specific test files found for capability: $cap_name"
        # Vérifier si les tests sont intégrés ailleurs
        if grep -r "describe.*$cap_name\|test.*$cap_name\|it.*$cap_name" "$REPO_ROOT/src" "$REPO_ROOT/src-tauri" --include="*.test.*" --include="*.spec.*" >/dev/null 2>&1; then
            success "Capability tests found in integrated test suites"
            return 0
        else
            error "No tests found for capability: $cap_name"
            return 1
        fi
    fi
    
    success "Test files found: $(echo "$test_files" | wc -l) files"
    return 0
}

check_ci_gates() {
    local cap_name="$1"
    
    log "Checking CI configuration for capability: $cap_name"
    
    # Vérifier que le capability est référencé dans les workflows CI
    if grep -r "$cap_name" "$REPO_ROOT/.github/workflows/" >/dev/null 2>&1; then
        success "Capability referenced in CI workflows"
        return 0
    fi
    
    # Vérifier si c'est couvert par les tests généraux
    if [[ -f "$REPO_ROOT/.github/workflows/capability-qualification.yml" ]]; then
        success "Capability covered by capability-qualification workflow"
        return 0
    fi
    
    error "No CI gates found for capability: $cap_name"
    return 1
}

check_documentation() {
    local cap_file="$1"
    
    log "Checking documentation completeness..."
    
    local required_sections=(
        "## 1\. Nom & But"
        "## 2\. Statut"
        "## 3\. Surface Exposée"
        "## 4\. Inputs/Outputs"
        "## 5\. Risques"
        "## 6\. Tests & Validation"
        "## 7\. Observabilité"
        "## 8\. Critères d'Acceptation"
        "## 9\. Plan de Rollback"
        "## 10\. Promotion Checklist"
    )
    
    local missing_sections=0
    
    for section in "${required_sections[@]}"; do
        if grep -q "$section" "$cap_file"; then
            success "✓ Section: $section"
        else
            error "✗ Missing section: $section"
            ((missing_sections++))
        fi
    done
    
    if [[ $missing_sections -gt 0 ]]; then
        error "$missing_sections required sections missing"
        return 1
    fi
    
    success "All required documentation sections present"
    return 0
}

check_registry_alignment() {
    local cap_name="$1"
    
    log "Checking registry alignment..."
    
    if [[ ! -f "$REGISTRY_FILE" ]]; then
        error "Registry file not found: $REGISTRY_FILE"
        return 1
    fi
    
    # Vérifier que la capacité est listée dans le registry
    if grep -q "$cap_name" "$REGISTRY_FILE"; then
        success "Capability found in registry"
        return 0
    fi
    
    error "Capability not found in registry: $cap_name"
    return 1
}

check_no_secrets() {
    local cap_file="$1"
    
    log "Checking for secrets in capability documentation..."
    
    # Pattern basiques pour détecter des secrets
    local secret_patterns=(
        "[A-Za-z0-9]{40,}"  # Tokens longs
        "sk-[A-Za-z0-9]+"   # OpenAI style
        "ghp_[A-Za-z0-9]+"  # GitHub tokens
        "password.*="       # Password assignments
        "secret.*="         # Secret assignments
    )
    
    for pattern in "${secret_patterns[@]}"; do
        if grep -iE "$pattern" "$cap_file" >/dev/null 2>&1; then
            error "Potential secret found matching pattern: $pattern"
            return 1
        fi
    done
    
    success "No secrets detected in capability documentation"
    return 0
}

# === VALIDATION PRINCIPALE ===

validate_promotion() {
    local cap_file="$1"
    local cap_name
    local validation_errors=0
    
    cap_name="$(basename "$cap_file" .md)"
    
    log "Starting QUALIFIED → STABLE promotion validation for: $cap_name"
    echo "=================================="
    
    # 1. Vérifier le fichier capability
    if ! check_capability_file "$cap_file"; then
        ((validation_errors++))
    fi
    
    # 2. Vérifier la checklist
    if ! check_promotion_checklist "$cap_file"; then
        ((validation_errors++))
    fi
    
    # 3. Vérifier les tests
    if ! check_tests_coverage "$cap_name"; then
        ((validation_errors++))
    fi
    
    # 4. Vérifier les gates CI
    if ! check_ci_gates "$cap_name"; then
        ((validation_errors++))
    fi
    
    # 5. Vérifier la documentation
    if ! check_documentation "$cap_file"; then
        ((validation_errors++))
    fi
    
    # 6. Vérifier l'alignement registry
    if ! check_registry_alignment "$cap_name"; then
        ((validation_errors++))
    fi
    
    # 7. Vérifier l'absence de secrets
    if ! check_no_secrets "$cap_file"; then
        ((validation_errors++))
    fi
    
    echo "=================================="
    
    if [[ $validation_errors -eq 0 ]]; then
        success "✅ PROMOTION APPROVED: $cap_name can be promoted to STABLE"
        return 0
    else
        error "❌ PROMOTION BLOCKED: $validation_errors validation errors found"
        error "Fix all errors before attempting promotion to STABLE"
        return 1
    fi
}

# === MAIN ===

main() {
    if [[ $# -ne 1 ]]; then
        error "Usage: $0 <capability-file.md>"
        error "Example: $0 docs/capabilities/chat-engine.md"
        exit 1
    fi
    
    local cap_file="$1"
    
    # Résoudre le chemin absolu
    if [[ ! "$cap_file" =~ ^/ ]]; then
        cap_file="$REPO_ROOT/$cap_file"
    fi
    
    log "PHASE 6 Promotion Gate - QUALIFIED → STABLE"
    log "Repository: $(basename "$REPO_ROOT")"
    log "Capability: $cap_file"
    echo ""
    
    if validate_promotion "$cap_file"; then
        exit 0
    else
        exit 1
    fi
}

# Exécuter si appelé directement
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi