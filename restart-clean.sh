#!/usr/bin/env bash
# Script de nettoyage et relance propre de TITANE∞

echo "🧹 Nettoyage Processus TITANE∞"
echo "══════════════════════════════════════════════"
echo ""

# 1. Arrêter tous les processus Tauri
echo "1️⃣ Arrêt des processus Tauri..."
pkill -9 -f "titane-infinity" 2>/dev/null && echo "   ✅ Processus Tauri arrêtés" || echo "   ℹ️  Aucun processus Tauri actif"

# 2. Arrêter Vite si actif
echo "2️⃣ Arrêt du serveur Vite..."
pkill -9 -f "vite" 2>/dev/null && echo "   ✅ Vite arrêté" || echo "   ℹ️  Vite non actif"

# 3. Nettoyer les ports
echo "3️⃣ Nettoyage du port 4000..."
PID_4000=$(lsof -ti:4000 2>/dev/null)
if [ -n "$PID_4000" ]; then
    kill -9 $PID_4000 2>/dev/null
    echo "   ✅ Port 4000 libéré"
else
    echo "   ℹ️  Port 4000 déjà libre"
fi

echo ""
echo "══════════════════════════════════════════════"
echo "✅ Nettoyage terminé!"
echo ""
echo "🚀 Lancement de TITANE∞ avec Tauri..."
echo ""
echo "Attendez l'ouverture de la fenêtre native..."
echo ""
echo "══════════════════════════════════════════════"
echo ""

# 4. Lancer l'application
cd "$(dirname "$0")"
exec pnpm run dev:tauri
