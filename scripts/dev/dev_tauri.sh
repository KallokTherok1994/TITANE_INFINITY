#!/bin/bash

##############################################################################
# TITANE∞ - Script de lancement développement (TAURI-ONLY)
# Lance Titan-Dev via le runtime dev (aucun serveur HTTP)
##############################################################################

set -euo pipefail

echo "🌌 TITANE∞ - Démarrage mode développement (TAURI-ONLY)"
echo ""

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
DEV_RUNTIME="$ROOT_DIR/runtime/dev/run-dev.sh"

if [ ! -x "$DEV_RUNTIME" ]; then
    echo "❌ Runtime dev introuvable ou non exécutable: $DEV_RUNTIME"
    exit 1
fi

echo "🚀 Lancement de Titan-Dev..."
"$DEV_RUNTIME"

echo ""
echo "🛑 Titan-Dev arrêté"
