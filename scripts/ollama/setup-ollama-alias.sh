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
echo "  TITANE∞ — Configuration Ollama Launcher"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Vérifier si la configuration existe déjà
if grep -q "ollama_titane()" "$SHELL_CONFIG" 2>/dev/null; then
    echo "⚠️  Configuration Ollama existe déjà dans $SHELL_CONFIG"
    echo ""
    read -p "Voulez-vous la remplacer? (o/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Oo]$ ]]; then
        echo "❌ Annulé"
        exit 0
    fi
    
    # Supprimer l'ancienne configuration
    sed -i '/ollama_titane/d' "$SHELL_CONFIG"
    sed -i '/TITANE∞ — Ollama Launcher/d' "$SHELL_CONFIG"
fi

# Ajouter une fonction shell (bash ne supporte pas les "/" dans les noms d'alias)
cat >> "$SHELL_CONFIG" << EOF

# ═══════════════════════════════════════════════════════════════════════════
# TITANE∞ — Ollama Launcher Function (aliases can't use "/" in their names)
# ═══════════════════════════════════════════════════════════════════════════
ollama_titane() {
  exec '$LAUNCHER_SCRIPT' "\$@"
}

# Make it available as a command
export PATH="$(dirname '$LAUNCHER_SCRIPT'):\$PATH"
EOF

echo "✅ Configuration ajoutée à $SHELL_CONFIG"
echo ""
echo "Pour l'activer immédiatement:"
echo "  source $SHELL_CONFIG"
echo ""
echo "Ou ouvrez un nouveau terminal et utilisez:"
echo "  ollama_titane help"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Configuration terminée!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
