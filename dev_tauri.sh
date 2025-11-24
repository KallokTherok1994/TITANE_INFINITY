#!/bin/bash

##############################################################################
# TITANE∞ v17.3 - Script de lancement développement
# Lance Tauri en mode dev avec le serveur Vite intégré
##############################################################################

echo "🌌 TITANE∞ v17.3 - Démarrage mode développement"
echo ""

# Nettoyer les processus existants
echo "🧹 Nettoyage des processus Vite/Tauri existants..."
pkill -f "vite dev" 2>/dev/null
pkill -f "tauri dev" 2>/dev/null
sleep 1

# Vérifier que les ports sont libres
if lsof -Pi :1420 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Port 1420 déjà utilisé, nettoyage..."
    kill -9 $(lsof -t -i:1420) 2>/dev/null
fi

if lsof -Pi :1421 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Port 1421 déjà utilisé, nettoyage..."
    kill -9 $(lsof -t -i:1421) 2>/dev/null
fi

echo "✅ Ports 1420 et 1421 libérés"
echo ""

# Lancer Tauri (qui lancera automatiquement Vite via beforeDevCommand)
echo "🚀 Lancement de Tauri + Vite..."
echo "   → Vite dev server: http://localhost:1420"
echo "   → DevTools: F12 ou Ctrl+Shift+I"
echo ""

cd "$(dirname "$0")"
pnpm tauri dev

echo ""
echo "🛑 Tauri arrêté"
