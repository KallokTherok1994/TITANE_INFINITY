#!/bin/bash
# TITANE∞ v24.2.0 - Lancement Dev Mode
# Script unifié pour démarrer le mode développement

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🚀 TITANE∞ v24.2.0 - Mode Développement                    ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Vérifier le répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Exécutez ce script depuis le répertoire TITANE_INFINITY"
    exit 1
fi

echo "✅ Prérequis OK"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Lancement de Tauri Dev avec Polling (mode conteneur safe)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Exporter les variables d'environnement pour éviter ENOSPC
export CHOKIDAR_USEPOLLING=true
export CHOKIDAR_INTERVAL=300

echo "📊 Configuration:"
echo "   CHOKIDAR_USEPOLLING=true"
echo "   CHOKIDAR_INTERVAL=300ms"
echo ""
echo "🖥️ Mode TAURI-ONLY: aucun serveur HTTP"
echo ""
echo "⚡ Commandes Tauri disponibles (npm run):"
echo "   • dev:tauri    → Lance Tauri + Vite (recommandé)"
echo "   • tauri:dev    → Alias de dev:tauri"
echo "   • dev          → Lance Titan-Dev (TAURI-ONLY)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Lancer l'application
exec pnpm run dev:tauri
