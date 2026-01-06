#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
nvm use 24
node --version
echo ""
echo "✅ Node v24 activé. Maintenant exécutez: pnpm install"
