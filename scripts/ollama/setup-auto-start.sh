#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
#   TITANE∞ — OLLAMA PERMANENT (DÉMARRAGE AUTO SANS SYSTEMD)
#   Alternative: script de démarrage automatique dans .bashrc
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${BLUE}[INFO]${NC} $*"; }
success() { echo -e "${GREEN}✅${NC} $*"; }
warning() { echo -e "${YELLOW}⚠️${NC}  $*"; }

SHELL_CONFIG="${HOME}/.bashrc"
if [ -n "${ZSH_VERSION:-}" ]; then
    SHELL_CONFIG="${HOME}/.zshrc"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TITANE∞ — Configuration Ollama Auto-Start"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

log "Configuration du démarrage automatique d'Ollama..."

# Vérifier si déjà configuré
if grep -q "TITANE∞ Ollama Auto-Start" "$SHELL_CONFIG" 2>/dev/null; then
    warning "Configuration déjà présente dans $SHELL_CONFIG"
    read -p "Remplacer? (o/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Oo]$ ]]; then
        exit 0
    fi
    # Supprimer l'ancienne config
    sed -i '/# TITANE∞ Ollama Auto-Start/,/# End TITANE∞ Ollama/d' "$SHELL_CONFIG"
fi

# Ajouter la configuration
cat >> "$SHELL_CONFIG" << 'EOF'

# ═══════════════════════════════════════════════════════════════════════════
# TITANE∞ Ollama Auto-Start
# ═══════════════════════════════════════════════════════════════════════════

# Démarrer Ollama automatiquement si pas déjà actif
if command -v ollama &> /dev/null; then
    if ! pgrep -f "ollama serve" > /dev/null 2>&1; then
        # Démarrer Ollama en arrière-plan
        nohup ollama serve > /tmp/ollama-serve.log 2>&1 &
        echo "🚀 Ollama démarré automatiquement (PID: $!)"
    fi
fi

# End TITANE∞ Ollama
EOF

success "Configuration ajoutée à $SHELL_CONFIG"
echo ""
echo "Pour activer maintenant:"
echo "  source $SHELL_CONFIG"
echo ""
echo "Ollama démarrera automatiquement à chaque ouverture de terminal!"
echo ""
echo "Commandes utiles:"
echo "  pgrep -af ollama        # Vérifier si actif"
echo "  pkill -f 'ollama serve' # Arrêter"
echo "  tail -f /tmp/ollama-serve.log # Voir les logs"
