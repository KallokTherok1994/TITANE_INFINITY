#!/bin/bash
# Script d'activation automatique Node v24 pour TITANE_INFINITY

echo "🔄 Activation Node.js v24..."

# Charger nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"

# Activer Node v24
nvm use 24

# Vérification
echo ""
echo "✅ Node version active:"
node --version

echo ""
echo "✅ pnpm version:"
pnpm --version

echo ""
echo "🎯 Maintenant vous pouvez exécuter:"
echo "   pnpm install"
