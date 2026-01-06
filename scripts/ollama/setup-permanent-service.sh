#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
#   TITANE∞ — CONFIGURATION OLLAMA SERVICE PERMANENT
#   Configure Ollama comme service systemd (démarrage automatique)
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

log() { echo -e "${BLUE}[INFO]${NC} $*"; }
success() { echo -e "${GREEN}✅${NC} $*"; }
warning() { echo -e "${YELLOW}⚠️${NC}  $*"; }
error() { echo -e "${RED}❌${NC} $*" >&2; }

print_header() {
    echo ""
    echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}  TITANE∞ — Configuration Ollama Service Permanent${NC}"
    echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

check_ollama() {
    if ! command -v ollama &> /dev/null; then
        error "Ollama n'est pas installé!"
        echo ""
        echo "Installation:"
        echo "  curl -fsSL https://ollama.com/install.sh | sh"
        exit 1
    fi
    success "Ollama installé: $(ollama --version | head -n 1)"
}

check_systemd() {
    if ! command -v systemctl &> /dev/null; then
        error "systemd non disponible (requis pour service permanent)"
        echo ""
        echo "Alternative: utilisez un script de démarrage"
        exit 1
    fi
    success "systemd disponible"
}

create_service() {
    local service_file="/tmp/ollama-titane.service"
    
    log "Création du fichier service..."
    
    cat > "$service_file" << 'EOF'
[Unit]
Description=Ollama Service for TITANE∞
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
ExecStart=/usr/local/bin/ollama serve
Environment="OLLAMA_HOST=127.0.0.1:11434"
Restart=always
RestartSec=3
User=%i

[Install]
WantedBy=multi-user.target
EOF
    
    success "Fichier service créé: $service_file"
    echo "$service_file"
}

install_service() {
    local service_file="$1"
    local service_name="ollama-titane.service"
    local service_path="/etc/systemd/system/$service_name"
    
    log "Installation du service système..."
    
    if [ -f "$service_path" ]; then
        warning "Service déjà installé"
        read -p "Remplacer? (o/N) " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Oo]$ ]]; then
            return 0
        fi
        sudo systemctl stop "$service_name" 2>/dev/null || true
    fi
    
    # Copier le service
    sudo cp "$service_file" "$service_path"
    sudo chmod 644 "$service_path"
    
    # Recharger systemd
    sudo systemctl daemon-reload
    
    success "Service installé: $service_path"
}

enable_service() {
    local service_name="ollama-titane.service"
    
    log "Activation du service (démarrage automatique)..."
    
    sudo systemctl enable "$service_name"
    
    success "Service activé (démarrera au boot)"
}

start_service() {
    local service_name="ollama-titane.service"
    
    log "Démarrage du service..."
    
    sudo systemctl start "$service_name"
    
    # Attendre le démarrage
    sleep 2
    
    if systemctl is-active --quiet "$service_name"; then
        success "Service démarré avec succès!"
    else
        error "Échec du démarrage"
        echo ""
        echo "Logs:"
        sudo journalctl -u "$service_name" -n 20 --no-pager
        exit 1
    fi
}

show_status() {
    local service_name="ollama-titane.service"
    
    echo ""
    log "Statut du service:"
    echo ""
    sudo systemctl status "$service_name" --no-pager || true
}

show_summary() {
    echo ""
    echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}  INSTALLATION TERMINÉE${NC}"
    echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    success "Ollama configuré comme service permanent!"
    echo ""
    echo "Commandes utiles:"
    echo ""
    echo "  Vérifier le statut:"
    echo "    sudo systemctl status ollama-titane"
    echo ""
    echo "  Voir les logs:"
    echo "    sudo journalctl -u ollama-titane -f"
    echo ""
    echo "  Redémarrer:"
    echo "    sudo systemctl restart ollama-titane"
    echo ""
    echo "  Arrêter:"
    echo "    sudo systemctl stop ollama-titane"
    echo ""
    echo "  Désactiver (ne plus démarrer au boot):"
    echo "    sudo systemctl disable ollama-titane"
    echo ""
    echo "URL Ollama: http://localhost:11434"
    echo ""
    echo "Le service démarrera automatiquement au prochain boot! 🚀"
    echo ""
}

# ─────────────────────────────────────────────────────────────────────────────
#   MAIN
# ─────────────────────────────────────────────────────────────────────────────

main() {
    print_header
    
    check_ollama
    check_systemd
    
    echo ""
    warning "Cette opération nécessite les droits sudo"
    read -p "Continuer? (O/n) " -n 1 -r
    echo ""
    echo ""
    
    if [[ ! $REPLY =~ ^[Oo]$ ]] && [[ -n $REPLY ]]; then
        error "Opération annulée"
        exit 0
    fi
    
    # Créer et installer le service
    service_file=$(create_service)
    install_service "$service_file"
    enable_service
    start_service
    
    # Afficher le résultat
    show_status
    show_summary
}

main "$@"
