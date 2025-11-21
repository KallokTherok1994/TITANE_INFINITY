#!/bin/bash

# TITANE∞ - Lancement Direct Simplifié

echo "🚀 TITANE∞ - Lancement Direct"
echo ""

cd "$(dirname "$0")"

# 1. Arrêter processus existants
echo "→ Nettoyage processus..."
pkill -9 -f vite 2>/dev/null || true
pkill -9 -f tauri 2>/dev/null || true
sleep 2

# 2. Libérer port
echo "→ Libération port 5173..."
lsof -ti:5173 2>/dev/null | xargs kill -9 2>/dev/null || true
sleep 1

# 3. Build frontend si dist/ manquant
if [ ! -d "dist" ]; then
    echo "→ Build frontend..."
    npm install --silent
    npm run build
fi

# 4. Lancer Tauri
echo ""
echo "✓ Lancement de Tauri..."
echo ""
npm run tauri dev

