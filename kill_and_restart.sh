#!/bin/bash

# TITANE∞ v9.0.0 - Nettoyage et Relance
# Tue les processus Vite/Tauri existants et relance proprement

cd "$(dirname "$0")"

echo "🧹 TITANE∞ v9.0.0 - Nettoyage des processus..."
echo ""

# Tuer tous les processus Vite
echo "🔍 Recherche des processus Vite..."
if pgrep -f vite > /dev/null; then
    echo "   ⚠️  Processus Vite trouvés, arrêt en cours..."
    pkill -9 -f vite
    sleep 1
    echo "   ✅ Processus Vite arrêtés"
else
    echo "   ✅ Aucun processus Vite en cours"
fi

# Tuer tous les processus Node sur le port 5173
echo ""
echo "🔍 Vérification du port 5173..."
if lsof -ti:5173 > /dev/null 2>&1; then
    echo "   ⚠️  Port 5173 occupé, libération..."
    lsof -ti:5173 | xargs kill -9 2>/dev/null
    sleep 1
    echo "   ✅ Port 5173 libéré"
else
    echo "   ✅ Port 5173 libre"
fi

# Tuer les processus Tauri
echo ""
echo "🔍 Recherche des processus Tauri..."
if pgrep -f "tauri dev" > /dev/null; then
    echo "   ⚠️  Processus Tauri trouvés, arrêt en cours..."
    pkill -9 -f "tauri dev"
    sleep 1
    echo "   ✅ Processus Tauri arrêtés"
else
    echo "   ✅ Aucun processus Tauri en cours"
fi

# Attendre que tout soit bien arrêté
sleep 2

echo ""
echo "✅ Nettoyage terminé !"
echo ""
echo "🚀 Lancement de Tauri..."
echo ""

# Lancer Tauri
npm run tauri dev
