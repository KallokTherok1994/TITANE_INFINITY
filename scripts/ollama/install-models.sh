#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
#   TITANE∞ — INSTALLATION DES MODÈLES OLLAMA
#   Installe automatiquement les 3 modèles nécessaires pour TITANE∞
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

# ─────────────────────────────────────────────────────────────────────────────
#   CONFIGURATION
# ─────────────────────────────────────────────────────────────────────────────

# Modèles TITANE∞ (ordre de priorité)
MODELS=(
    "qwen2.5:latest"        # Modèle principal - Rapide, multilingue, excellent français
    "llama3.1:8b"           # Alternative - Meta, mémoire réduite, polyvalent  
    "mistral:7b"            # Backup - Français optimisé, Mistral AI
)

OLLAMA_URL="http://localhost:11434"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ─────────────────────────────────────────────────────────────────────────────
#   FONCTIONS
# ─────────────────────────────────────────────────────────────────────────────

print_header() {
    echo ""
    echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}  TITANE∞ — Installation des Modèles Ollama${NC}"
    echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

log() {
    echo -e "${BLUE}[INFO]${NC} $*"
}

success() {
    echo -e "${GREEN}✅${NC} $*"
}

error() {
    echo -e "${RED}❌ ERREUR:${NC} $*" >&2
}

warning() {
    echo -e "${YELLOW}⚠️${NC}  $*"
}

progress() {
    echo -e "${CYAN}▶${NC}  $*"
}

check_ollama() {
    log "Vérification d'Ollama..."
    
    if ! command -v ollama &> /dev/null; then
        error "Ollama n'est pas installé!"
        echo ""
        echo "Installation rapide:"
        echo "  curl -fsSL https://ollama.com/install.sh | sh"
        echo ""
        exit 1
    fi
    
    success "Ollama installé: $(ollama --version | head -n 1)"
}

check_server() {
    log "Vérification du serveur Ollama..."
    
    if ! curl -sf "${OLLAMA_URL}/api/version" > /dev/null 2>&1; then
        error "Le serveur Ollama n'est pas actif!"
        echo ""
        echo "Démarrez-le avec:"
        echo "  ollama serve"
        echo ""
        echo "Ou en arrière-plan:"
        echo "  nohup ollama serve > /tmp/ollama.log 2>&1 &"
        echo ""
        exit 1
    fi
    
    success "Serveur actif: ${OLLAMA_URL}"
}

model_exists() {
    local model="$1"
    ollama list 2>/dev/null | grep -q "^${model}\s" && return 0 || return 1
}

install_model() {
    local model="$1"
    local num="$2"
    local total="$3"
    
    echo ""
    echo -e "${BOLD}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BOLD}[$num/$total] Installation: ${model}${NC}"
    echo -e "${BOLD}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    
    if model_exists "$model"; then
        warning "Modèle déjà installé, mise à jour..."
    else
        progress "Téléchargement en cours (cela peut prendre plusieurs minutes)..."
    fi
    
    if ollama pull "$model"; then
        success "✓ ${model} installé avec succès"
        return 0
    else
        error "✗ Échec de l'installation: ${model}"
        return 1
    fi
}

show_summary() {
    local installed="$1"
    local failed="$2"
    
    echo ""
    echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}  RÉSUMÉ DE L'INSTALLATION${NC}"
    echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    if [ "$installed" -gt 0 ]; then
        success "Modèles installés: $installed"
    fi
    
    if [ "$failed" -gt 0 ]; then
        error "Échecs: $failed"
    fi
    
    echo ""
    log "Modèles disponibles dans Ollama:"
    echo ""
    ollama list | head -n 20
    echo ""
    
    if [ "$failed" -eq 0 ]; then
        success "Installation terminée avec succès! 🎉"
        echo ""
        echo "Prochaines étapes:"
        echo "  1. Lancer TITANE∞: pnpm run dev"
        echo "  2. Ouvrir les Paramètres (⚙️)"
        echo "  3. Activer le provider 'Ollama'"
        echo "  4. Sélectionner: ${MODELS[0]}"
        echo ""
    else
        warning "Installation terminée avec des erreurs"
        echo ""
        echo "Réessayez avec:"
        echo "  $0"
        echo ""
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
#   MAIN
# ─────────────────────────────────────────────────────────────────────────────

main() {
    print_header
    
    check_ollama
    check_server
    
    echo ""
    log "Modèles à installer: ${#MODELS[@]}"
    for model in "${MODELS[@]}"; do
        echo "  • $model"
    done
    
    echo ""
    read -p "Continuer l'installation? (O/n) " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Oo]$ ]] && [[ -n $REPLY ]]; then
        warning "Installation annulée"
        exit 0
    fi
    
    local installed=0
    local failed=0
    local num=1
    local total="${#MODELS[@]}"
    
    for model in "${MODELS[@]}"; do
        if install_model "$model" "$num" "$total"; then
            installed=$((installed + 1))
        else
            failed=$((failed + 1))
        fi
        num=$((num + 1))
    done
    
    show_summary "$installed" "$failed"
    
    if [ "$failed" -gt 0 ]; then
        exit 1
    fi
}

main "$@"
