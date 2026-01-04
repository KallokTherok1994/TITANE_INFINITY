#!/bin/bash
# TITANE∞ - Script d'activation de l'environnement Node.js local
# Usage: source scripts/env/activate-node.sh

# Couleurs pour le feedback
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Détecter le répertoire du projet
if [ -n "$BASH_SOURCE" ]; then
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
elif [ -n "$ZSH_VERSION" ]; then
    SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
    PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
else
    PROJECT_ROOT="$(pwd)"
fi

# Chemins des outils locaux
NODE_LOCAL="$PROJECT_ROOT/.tools/node/current/bin"
PNPM_HOME="${PNPM_HOME:-$HOME/.local/share/pnpm}"

# Vérifier que Node local existe
if [ ! -d "$NODE_LOCAL" ]; then
    echo -e "${YELLOW}⚠️  Node.js local introuvable dans .tools/node/current${NC}"
    echo "Exécutez d'abord: ./scripts/install/setup-local-tools.sh"
    return 1 2>/dev/null || exit 1
fi

# Configurer le PATH (uniquement si pas déjà configuré)
if [[ ":$PATH:" != *":$NODE_LOCAL:"* ]]; then
    export PATH="$NODE_LOCAL:$PNPM_HOME:$PATH"
    echo -e "${GREEN}✅ Environnement TITANE∞ activé${NC}"
else
    echo -e "${GREEN}✅ Environnement TITANE∞ déjà activé${NC}"
fi

# Afficher les versions
echo ""
echo "📦 Node.js: $(node --version)"
if command -v corepack &>/dev/null && corepack pnpm --version &>/dev/null; then
    echo "📦 pnpm: $(corepack pnpm --version)"
elif command -v pnpm &>/dev/null; then
    echo "📦 pnpm: $(pnpm --version)"
else
    echo -e "${YELLOW}⚠️  pnpm non détecté. Recommandé: corepack enable && corepack prepare pnpm@latest --activate${NC}"
fi
echo ""
echo "💡 Pour rendre permanent, ajoutez à votre ~/.bashrc:"
echo "   source $PROJECT_ROOT/scripts/env/activate-node.sh"
