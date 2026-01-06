#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
#   TITANE∞ — SETUP OLLAMA ALIAS
#   Configure l'alias global '/ollama' pour le launcher
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LAUNCHER_SCRIPT="$SCRIPT_DIR/run-ollama.sh"
SHELL_CONFIG="${HOME}/.bashrc"

# Détection du shell
if [ -n "${ZSH_VERSION:-}" ]; then
    SHELL_CONFIG="${HOME}/.zshrc"
elif [ -n "${BASH_VERSION:-}" ]; then
    SHELL_CONFIG="${HOME}/.bashrc"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TITANE∞ — Configuration de l'alias /ollama"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Vérifier si l'alias existe déjà
if grep -q "alias /ollama=" "$SHELL_CONFIG" 2>/dev/null; then
    echo "⚠️  L'alias /ollama existe déjà dans $SHELL_CONFIG"
    echo ""
    read -p "Voulez-vous le remplacer? (o/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Oo]$ ]]; then
        echo "❌ Annulé"
        exit 0
    fi
    
    # Supprimer l'ancien alias
    sed -i '/alias \/ollama=/d' "$SHELL_CONFIG"
fi

# Ajouter l'alias
cat >> "$SHELL_CONFIG" << EOF

# ═══════════════════════════════════════════════════════════════════════════
# TITANE∞ — Ollama Launcher Alias
# ═══════════════════════════════════════════════════════════════════════════
alias /ollama='$LAUNCHER_SCRIPT'
EOF

echo "✅ Alias ajouté à $SHELL_CONFIG"
echo ""
echo "Pour l'activer immédiatement:"
echo "  source $SHELL_CONFIG"
echo ""
echo "Ou ouvrez un nouveau terminal et tapez:"
echo "  /ollama help"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Configuration terminée!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
