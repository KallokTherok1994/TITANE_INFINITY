#!/bin/bash
# Script de vérification et lancement de Tauri Dev
# TITANE∞ v24.2.0

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🚀 TITANE∞ - Vérification Tauri Dev                        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Vérifier la limite inotify
CURRENT_LIMIT=$(cat /proc/sys/fs/inotify/max_user_watches)
REQUIRED_LIMIT=524288

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Vérification limite inotify"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Limite actuelle:  $CURRENT_LIMIT"
echo "Limite requise:   $REQUIRED_LIMIT"
echo ""

if [ "$CURRENT_LIMIT" -lt "$REQUIRED_LIMIT" ]; then
    echo "❌ LIMITE INSUFFISANTE !"
    echo ""
    echo "Exécutez cette commande pour corriger:"
    echo ""
    echo "  sudo sysctl fs.inotify.max_user_watches=524288"
    echo ""
    echo "Ou pour une correction permanente:"
    echo ""
    echo "  echo 'fs.inotify.max_user_watches=524288' | sudo tee /etc/sysctl.d/60-inotify.conf"
    echo "  sudo sysctl -p /etc/sysctl.d/60-inotify.conf"
    echo ""
    exit 1
else
    echo "✅ Limite OK"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. Vérification prérequis"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Vérifier Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js: $NODE_VERSION"
else
    echo "❌ Node.js non installé"
    exit 1
fi

# Vérifier npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm: v$NPM_VERSION"
else
    echo "❌ npm non installé"
    exit 1
fi

# Vérifier Cargo
if command -v cargo &> /dev/null; then
    CARGO_VERSION=$(cargo --version | cut -d' ' -f2)
    echo "✅ Cargo: v$CARGO_VERSION"
else
    echo "❌ Cargo non installé"
    exit 1
fi

# Vérifier Tauri CLI
if npm list -g @tauri-apps/cli &> /dev/null || [ -f "node_modules/.bin/tauri" ]; then
    echo "✅ Tauri CLI installé"
else
    echo "⚠️  Tauri CLI non trouvé (sera utilisé depuis node_modules)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. Lancement de Tauri Dev"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 Lancement de npm run tauri dev..."
echo ""

exec npm run tauri dev
