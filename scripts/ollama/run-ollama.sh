#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
#   TITANE∞ — OLLAMA LAUNCHER SCRIPT
#   Lance et configure les modèles Ollama nécessaires pour TITANE∞
#   Usage: ./run-ollama.sh [pull|serve|status|stop|restart]
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

# ─────────────────────────────────────────────────────────────────────────────
#   CONFIGURATION
# ─────────────────────────────────────────────────────────────────────────────

OLLAMA_BASE_URL="${OLLAMA_BASE_URL:-http://localhost:11434}"
OLLAMA_DEFAULT_MODEL="${OLLAMA_DEFAULT_MODEL:-qwen2.5:latest}"

# Modèles recommandés pour TITANE∞
MODELS=(
    "qwen2.5:latest"        # Modèle principal (rapide, multilingue)
    "llama3.1:8b"           # Alternative (mémoire réduite)
    "mistral:7b"            # Backup (français optimisé)
)

# Couleurs pour output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ─────────────────────────────────────────────────────────────────────────────
#   FONCTIONS UTILITAIRES
# ─────────────────────────────────────────────────────────────────────────────

log() {
    echo -e "${BLUE}[OLLAMA]${NC} $*"
}

success() {
    echo -e "${GREEN}✅${NC} $*"
}

error() {
    echo -e "${RED}❌${NC} $*" >&2
}

warning() {
    echo -e "${YELLOW}⚠️${NC} $*"
}

# ─────────────────────────────────────────────────────────────────────────────
#   VÉRIFICATIONS
# ─────────────────────────────────────────────────────────────────────────────

check_ollama_installed() {
    if ! command -v ollama &> /dev/null; then
        error "Ollama n'est pas installé"
        echo ""
        echo "Installation via curl:"
        echo "  curl -fsSL https://ollama.com/install.sh | sh"
        echo ""
        echo "Ou via package manager:"
        echo "  # Ubuntu/Debian"
        echo "  curl -fsSL https://ollama.com/install.sh | sh"
        echo ""
        echo "  # macOS"
        echo "  brew install ollama"
        echo ""
        exit 1
    fi
    success "Ollama installé: $(ollama --version)"
}

check_ollama_running() {
    if curl -sf "${OLLAMA_BASE_URL}/api/version" > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
#   COMMANDES PRINCIPALES
# ─────────────────────────────────────────────────────────────────────────────

cmd_status() {
    log "Vérification du statut Ollama..."
    
    if check_ollama_running; then
        success "Serveur Ollama actif: ${OLLAMA_BASE_URL}"
        
        # Liste des modèles installés
        log "Modèles installés:"
        ollama list | tail -n +2 | while read -r line; do
            echo "   📦 $line"
        done
    else
        warning "Serveur Ollama non actif"
        echo ""
        echo "Démarrez le serveur avec:"
        echo "  $0 serve"
    fi
}

cmd_serve() {
    log "Démarrage du serveur Ollama..."
    
    if check_ollama_running; then
        warning "Serveur Ollama déjà actif"
        cmd_status
        return 0
    fi
    
    log "Lancement du serveur en arrière-plan..."
    ollama serve > /tmp/ollama-serve.log 2>&1 &
    local pid=$!
    
    # Attendre que le serveur soit prêt
    local max_wait=30
    local waited=0
    
    while ! check_ollama_running; do
        if [ $waited -ge $max_wait ]; then
            error "Timeout: le serveur n'a pas démarré après ${max_wait}s"
            cat /tmp/ollama-serve.log
            exit 1
        fi
        sleep 1
        waited=$((waited + 1))
        echo -n "."
    done
    
    echo ""
    success "Serveur Ollama démarré (PID: $pid)"
    success "Logs: /tmp/ollama-serve.log"
    echo ""
    
    cmd_status
}

cmd_pull() {
    log "Téléchargement des modèles TITANE∞..."
    echo ""
    
    if ! check_ollama_running; then
        error "Le serveur Ollama n'est pas actif"
        echo "Démarrez-le avec: $0 serve"
        exit 1
    fi
    
    for model in "${MODELS[@]}"; do
        log "Téléchargement: ${model}"
        if ollama pull "$model"; then
            success "✓ ${model} téléchargé"
        else
            error "✗ Échec du téléchargement: ${model}"
        fi
        echo ""
    done
    
    success "Tous les modèles sont prêts!"
    echo ""
    cmd_status
}

cmd_stop() {
    log "Arrêt du serveur Ollama..."
    
    if ! check_ollama_running; then
        warning "Le serveur n'est pas actif"
        return 0
    fi
    
    # Tuer tous les processus ollama serve
    pkill -f "ollama serve" || true
    
    # Attendre l'arrêt
    local max_wait=10
    local waited=0
    
    while check_ollama_running; do
        if [ $waited -ge $max_wait ]; then
            error "Timeout: le serveur ne s'est pas arrêté"
            exit 1
        fi
        sleep 1
        waited=$((waited + 1))
    done
    
    success "Serveur Ollama arrêté"
}

cmd_restart() {
    cmd_stop
    sleep 2
    cmd_serve
}

cmd_test() {
    log "Test des modèles TITANE∞..."
    echo ""
    
    if ! check_ollama_running; then
        error "Le serveur Ollama n'est pas actif"
        echo "Démarrez-le avec: $0 serve"
        exit 1
    fi
    
    log "Test du modèle par défaut: ${OLLAMA_DEFAULT_MODEL}"
    
    response=$(ollama run "$OLLAMA_DEFAULT_MODEL" "Dis bonjour en une phrase." 2>&1 | head -n 1)
    
    if [ -n "$response" ]; then
        success "Test réussi!"
        echo ""
        echo "Réponse: $response"
    else
        error "Échec du test"
    fi
}

cmd_setup() {
    log "Configuration complète d'Ollama pour TITANE∞"
    echo ""
    
    check_ollama_installed
    
    cmd_serve
    
    echo ""
    log "Téléchargement des modèles (cela peut prendre plusieurs minutes)..."
    cmd_pull
    
    echo ""
    log "Test du système..."
    cmd_test
    
    echo ""
    success "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    success "Configuration Ollama terminée!"
    success "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Commandes disponibles:"
    echo "  $0 status    → Vérifier le statut"
    echo "  $0 restart   → Redémarrer le serveur"
    echo "  $0 test      → Tester le modèle"
    echo ""
    echo "Variables d'environnement (.env):"
    echo "  OLLAMA_BASE_URL=${OLLAMA_BASE_URL}"
    echo "  OLLAMA_DEFAULT_MODEL=${OLLAMA_DEFAULT_MODEL}"
}

cmd_permanent() {
    log "Configuration d'Ollama en service permanent..."
    echo ""
    echo "Deux options disponibles:"
    echo ""
    echo "1. Service systemd (Recommandé - Ubuntu/Debian/Fedora)"
    echo "   → Démarrage automatique au boot système"
    echo "   → Gestion via systemctl"
    echo ""
    echo "2. Auto-start bashrc (Compatible - tous systèmes)"
    echo "   → Démarrage automatique à l'ouverture de terminal"
    echo "   → Plus simple, sans sudo"
    echo ""
    read -p "Choisir: (1/2) " -n 1 -r
    echo ""
    
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    
    case "$REPLY" in
        1)
            if [ -f "$SCRIPT_DIR/setup-permanent-service.sh" ]; then
                "$SCRIPT_DIR/setup-permanent-service.sh"
            else
                error "Script setup-permanent-service.sh introuvable"
                exit 1
            fi
            ;;
        2)
            if [ -f "$SCRIPT_DIR/setup-auto-start.sh" ]; then
                "$SCRIPT_DIR/setup-auto-start.sh"
            else
                error "Script setup-auto-start.sh introuvable"
                exit 1
            fi
            ;;
        *)
            error "Choix invalide"
            exit 1
            ;;
    esac
}

cmd_help() {
    cat << EOF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  TITANE∞ — OLLAMA LAUNCHER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Usage: $0 [command]

COMMANDES:
  setup      Configuration complète (installation + téléchargement)
  serve      Démarrer le serveur Ollama
  pull       Télécharger les modèles TITANE∞
  status     Vérifier le statut du serveur
  test       Tester le modèle par défaut
  stop       Arrêter le serveur
  restart    Redémarrer le serveur
  permanent  Configurer démarrage automatique (service permanent)
  help       Afficher cette aide

MODÈLES INCLUS:
  • qwen2.5:latest  (Défaut - rapide, multilingue)
  • llama3.1:8b     (Alternative - mémoire réduite)
  • mistral:7b      (Backup - français optimisé)

CONFIGURATION:
  Éditez .env pour personnaliser:
    OLLAMA_BASE_URL=http://localhost:11434
    OLLAMA_DEFAULT_MODEL=qwen2.5:latest

EXEMPLES:
  # Configuration initiale
  $0 setup

  # Vérifier le statut
  $0 status

  # Tester le modèle
  $0 test

RACCOURCI GLOBAL:
  Pour utiliser '/ollama', ajoutez à ~/.bashrc:
    alias /ollama='$PWD/$0'

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EOF
}

# ─────────────────────────────────────────────────────────────────────────────
#   MAIN
# ─────────────────────────────────────────────────────────────────────────────

main() {
    local cmd="${1:-help}"
    
    case "$cmd" in
        setup)
            cmd_setup
            ;;
        serve|start)
            check_ollama_installed
            cmd_serve
            ;;
        pull)
            check_ollama_installed
            cmd_pull
            ;;
        status)
            check_ollama_installed
            cmd_status
            ;;
        test)
            check_ollama_installed
            cmd_test
            ;;
        stop)
            cmd_stop
            ;;
        restart)
            check_ollama_installed
            cmd_restart
            ;;
        permanent)
            check_ollama_installed
            cmd_permanent
            ;;
        help|--help|-h)
            cmd_help
            ;;
        *)
            error "Commande inconnue: $cmd"
            echo ""
            cmd_help
            exit 1
            ;;
    esac
}

main "$@"
