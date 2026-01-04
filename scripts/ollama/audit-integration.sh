#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
#   TITANE∞ — AUDIT COMPLET INTÉGRATION OLLAMA
#   Vérifie configuration, connexion, modèles et compatibilité TypeScript
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

log() { echo -e "${BLUE}[INFO]${NC} $*"; }
success() { echo -e "${GREEN}✅${NC} $*"; }
error() { echo -e "${RED}❌${NC} $*"; }
warning() { echo -e "${YELLOW}⚠️${NC}  $*"; }

ERRORS=0
WARNINGS=0

print_header() {
    echo ""
    echo -e "${BOLD}╔══════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}║       TITANE∞ v26.2.0 — AUDIT INTÉGRATION OLLAMA                        ║${NC}"
    echo -e "${BOLD}╚══════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

check_section() {
    echo ""
    echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}  $1${NC}"
    echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# ─────────────────────────────────────────────────────────────────────────────
#   1. CONFIGURATION .env
# ─────────────────────────────────────────────────────────────────────────────

check_env_config() {
    check_section "1️⃣  Configuration .env"
    
    if [ ! -f ".env" ]; then
        error "Fichier .env introuvable"
        ERRORS=$((ERRORS + 1))
        return
    fi
    
    # Vérifier OLLAMA_BASE_URL
    if grep -q "^OLLAMA_BASE_URL=" .env; then
        local url=$(grep "^OLLAMA_BASE_URL=" .env | cut -d= -f2)
        success "OLLAMA_BASE_URL configuré: $url"
    else
        error "OLLAMA_BASE_URL non configuré dans .env"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Vérifier OLLAMA_DEFAULT_MODEL
    if grep -q "^OLLAMA_DEFAULT_MODEL=" .env; then
        local model=$(grep "^OLLAMA_DEFAULT_MODEL=" .env | cut -d= -f2)
        success "OLLAMA_DEFAULT_MODEL configuré: $model"
    else
        error "OLLAMA_DEFAULT_MODEL non configuré dans .env"
        ERRORS=$((ERRORS + 1))
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
#   2. CONNEXION OLLAMA
# ─────────────────────────────────────────────────────────────────────────────

check_ollama_connection() {
    check_section "2️⃣  Connexion Serveur Ollama"
    
    # Vérifier installation
    if ! command -v ollama &> /dev/null; then
        error "Ollama non installé"
        ERRORS=$((ERRORS + 1))
        return
    fi
    success "Ollama installé: $(ollama --version | head -n 1)"
    
    # Vérifier serveur actif
    if curl -sf http://localhost:11434/api/version > /dev/null 2>&1; then
        local version=$(curl -sf http://localhost:11434/api/version | jq -r '.version' 2>/dev/null || echo "unknown")
        success "Serveur Ollama actif (version: $version)"
    else
        error "Serveur Ollama non actif sur localhost:11434"
        ERRORS=$((ERRORS + 1))
        warning "Démarrez avec: ollama serve"
        return
    fi
    
    # Test API tags (liste des modèles)
    if curl -sf http://localhost:11434/api/tags > /dev/null 2>&1; then
        success "API /api/tags accessible"
    else
        warning "API /api/tags non accessible"
        WARNINGS=$((WARNINGS + 1))
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
#   3. MODÈLES INSTALLÉS
# ─────────────────────────────────────────────────────────────────────────────

check_models() {
    check_section "3️⃣  Modèles Installés"
    
    if ! command -v ollama &> /dev/null; then
        warning "Ollama non installé, skip modèles"
        return
    fi
    
    local model_count=$(ollama list 2>/dev/null | tail -n +2 | wc -l)
    
    if [ "$model_count" -eq 0 ]; then
        error "Aucun modèle installé"
        ERRORS=$((ERRORS + 1))
        warning "Installez avec: /ollama pull ou ./scripts/ollama/install-models.sh"
        return
    fi
    
    success "$model_count modèle(s) installé(s)"
    echo ""
    
    # Vérifier modèles TITANE∞ recommandés
    local titane_models=("qwen2.5:latest" "llama3.1:8b" "mistral:7b")
    local found=0
    
    for model in "${titane_models[@]}"; do
        if ollama list 2>/dev/null | grep -q "^${model}"; then
            success "  ✓ $model"
            found=$((found + 1))
        else
            warning "  ✗ $model (recommandé)"
        fi
    done
    
    if [ "$found" -eq 0 ]; then
        warning "Aucun modèle TITANE∞ trouvé"
        WARNINGS=$((WARNINGS + 1))
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
#   4. INTÉGRATION TYPESCRIPT
# ─────────────────────────────────────────────────────────────────────────────

check_typescript_integration() {
    check_section "4️⃣  Intégration TypeScript"
    
    # Vérifier provider ollama.ts
    if [ -f "src/services/ai/providers/ollama.ts" ]; then
        success "Provider ollama.ts présent"
        
        # Vérifier exports
        if grep -q "export.*ollamaProvider" src/services/ai/providers/ollama.ts; then
            success "ollamaProvider exporté"
        else
            error "ollamaProvider non exporté"
            ERRORS=$((ERRORS + 1))
        fi
    else
        error "Provider ollama.ts introuvable"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Vérifier types
    if [ -f "src/services/ai/types.ts" ]; then
        if grep -q "'ollama'" src/services/ai/types.ts; then
            success "Type 'ollama' présent dans types.ts"
        else
            error "Type 'ollama' manquant dans types.ts"
            ERRORS=$((ERRORS + 1))
        fi
    fi
    
    # TypeScript compilation
    log "Compilation TypeScript..."
    if pnpm run check > /dev/null 2>&1; then
        success "TypeScript compile sans erreurs"
    else
        error "Erreurs TypeScript détectées"
        ERRORS=$((ERRORS + 1))
        pnpm run check 2>&1 | tail -n 20
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
#   5. INTÉGRATION RUST/TAURI
# ─────────────────────────────────────────────────────────────────────────────

check_rust_integration() {
    check_section "5️⃣  Intégration Rust/Tauri"
    
    if [ -f "src-tauri/src/ai/ollama.rs" ]; then
        success "Module ollama.rs présent"
        
        # Vérifier exports
        if grep -q "pub mod ollama" src-tauri/src/ai/mod.rs 2>/dev/null; then
            success "Module ollama exporté dans ai/mod.rs"
        else
            warning "Module ollama non exporté (peut être optionnel)"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        warning "Module ollama.rs Rust introuvable (peut être optionnel)"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    # Vérifier Cargo.toml
    if [ -f "src-tauri/Cargo.toml" ]; then
        if grep -q "reqwest" src-tauri/Cargo.toml; then
            success "Dépendance reqwest présente (pour HTTP)"
        else
            warning "Dépendance reqwest manquante"
            WARNINGS=$((WARNINGS + 1))
        fi
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
#   6. SCRIPTS OLLAMA
# ─────────────────────────────────────────────────────────────────────────────

check_ollama_scripts() {
    check_section "6️⃣  Scripts Ollama"
    
    local scripts_dir="scripts/ollama"
    
    if [ ! -d "$scripts_dir" ]; then
        error "Répertoire scripts/ollama introuvable"
        ERRORS=$((ERRORS + 1))
        return
    fi
    
    local required_scripts=(
        "run-ollama.sh"
        "install-models.sh"
        "setup-ollama-alias.sh"
        "setup-permanent-service.sh"
        "setup-auto-start.sh"
    )
    
    for script in "${required_scripts[@]}"; do
        if [ -f "$scripts_dir/$script" ]; then
            if [ -x "$scripts_dir/$script" ]; then
                success "  ✓ $script (exécutable)"
            else
                warning "  ✓ $script (non exécutable)"
                WARNINGS=$((WARNINGS + 1))
            fi
        else
            error "  ✗ $script manquant"
            ERRORS=$((ERRORS + 1))
        fi
    done
    
    # Vérifier documentation
    local docs=("INSTALL.md" "PERMANENT.md" "README.md")
    for doc in "${docs[@]}"; do
        if [ -f "$scripts_dir/$doc" ]; then
            success "  ✓ $doc"
        else
            warning "  ✗ $doc manquant"
            WARNINGS=$((WARNINGS + 1))
        fi
    done
}

# ─────────────────────────────────────────────────────────────────────────────
#   7. RÉFÉRENCES NPM VS PNPM
# ─────────────────────────────────────────────────────────────────────────────

check_npm_references() {
    check_section "7️⃣  Vérification npm vs pnpm"
    
    log "Recherche références 'npm' dans scripts..."
    
    local npm_count=$(grep -r "npm " scripts/ --include="*.sh" 2>/dev/null | grep -v "pnpm" | wc -l)
    
    if [ "$npm_count" -gt 0 ]; then
        warning "$npm_count référence(s) 'npm' trouvée(s) dans scripts/"
        WARNINGS=$((WARNINGS + 1))
        grep -rn "npm " scripts/ --include="*.sh" 2>/dev/null | grep -v "pnpm" | head -n 10
    else
        success "Aucune référence 'npm' dans scripts/"
    fi
    
    # Vérifier package.json
    if grep -q '"packageManager".*"pnpm' package.json; then
        success "package.json configure pnpm comme packageManager"
    else
        warning "packageManager non défini dans package.json"
        WARNINGS=$((WARNINGS + 1))
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
#   8. TEST CONNEXION OLLAMA
# ─────────────────────────────────────────────────────────────────────────────

test_ollama_request() {
    check_section "8️⃣  Test Requête Ollama"
    
    if ! curl -sf http://localhost:11434/api/version > /dev/null 2>&1; then
        warning "Serveur Ollama non actif, skip test"
        return
    fi
    
    local model=$(grep "^OLLAMA_DEFAULT_MODEL=" .env 2>/dev/null | cut -d= -f2 || echo "qwen2.5:latest")
    
    log "Test génération avec modèle: $model"
    
    local response=$(curl -sf -m 10 http://localhost:11434/api/generate -d "{
        \"model\": \"$model\",
        \"prompt\": \"Hello\",
        \"stream\": false
    }" 2>&1)
    
    if [ -n "$response" ] && echo "$response" | jq -e '.response' > /dev/null 2>&1; then
        success "Requête Ollama réussie"
        local preview=$(echo "$response" | jq -r '.response' | head -c 50)
        echo "   Réponse: ${preview}..."
    else
        error "Échec requête Ollama"
        ERRORS=$((ERRORS + 1))
        echo "$response" | head -n 5
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
#   RÉSUMÉ FINAL
# ─────────────────────────────────────────────────────────────────────────────

print_summary() {
    echo ""
    echo -e "${BOLD}╔══════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}║  RÉSUMÉ DE L'AUDIT                                                       ║${NC}"
    echo -e "${BOLD}╚══════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    if [ "$ERRORS" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
        success "Audit parfait! 🎉"
        success "  • 0 erreur"
        success "  • 0 avertissement"
        echo ""
        success "L'intégration Ollama est complète et fonctionnelle!"
        return 0
    elif [ "$ERRORS" -eq 0 ]; then
        success "Audit réussi avec $WARNINGS avertissement(s)"
        echo ""
        warning "Points à améliorer:"
        echo "  • Vérifiez les avertissements ci-dessus"
        return 0
    else
        error "Audit échoué: $ERRORS erreur(s), $WARNINGS avertissement(s)"
        echo ""
        error "Actions requises:"
        echo "  1. Corriger les erreurs listées ci-dessus"
        echo "  2. Relancer l'audit: ./scripts/ollama/audit-integration.sh"
        return 1
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
#   MAIN
# ─────────────────────────────────────────────────────────────────────────────

main() {
    print_header
    
    check_env_config
    check_ollama_connection
    check_models
    check_typescript_integration
    check_rust_integration
    check_ollama_scripts
    check_npm_references
    test_ollama_request
    
    print_summary
}

main "$@"
