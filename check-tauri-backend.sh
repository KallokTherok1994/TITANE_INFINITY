#!/usr/bin/env bash
# Script de diagnostic: Vérifier si Tauri est actif

echo "🔍 Diagnostic Backend Tauri"
echo "══════════════════════════════════════════════"
echo ""

# 1. Vérifier processus Tauri
echo "1️⃣ Processus Tauri:"
TAURI_PROC=$(ps aux | grep -E "(tauri|titane-infinity)" | grep -v grep | wc -l)
if [ "$TAURI_PROC" -gt 0 ]; then
    echo "   ✅ Trouvé $TAURI_PROC processus actif(s)"
    ps aux | grep -E "(tauri|titane-infinity)" | grep -v grep | awk '{print "      PID:", $2, "CMD:", $11, $12, $13}'
else
    echo "   ❌ Aucun processus Tauri détecté"
    echo "      → Lancer: pnpm run dev:tauri"
fi
echo ""

# 2. Vérifier port Vite
echo "2️⃣ Serveur Frontend (Vite):"
VITE_PORT=$(lsof -i :4000 2>/dev/null | grep LISTEN | wc -l)
if [ "$VITE_PORT" -gt 0 ]; then
    echo "   ✅ Port 4000 actif (Vite)"
    lsof -i :4000 | grep LISTEN | awk '{print "      PID:", $2, "COMMAND:", $1}'
else
    echo "   ❌ Port 4000 libre (Vite non démarré)"
fi
echo ""

# 3. Vérifier Ollama
echo "3️⃣ Backend IA (Ollama):"
if curl -sf http://127.0.0.1:11434/api/tags > /dev/null 2>&1; then
    echo "   ✅ Ollama actif (port 11434)"
    MODELS=$(curl -sf http://127.0.0.1:11434/api/tags 2>/dev/null | grep -o '"name":"[^"]*"' | wc -l)
    echo "      Modèles disponibles: $MODELS"
else
    echo "   ❌ Ollama inactif"
    echo "      → Lancer: ollama serve"
fi
echo ""

# 4. Recommandations
echo "══════════════════════════════════════════════"
echo "📋 État du Système:"
echo ""

if [ "$TAURI_PROC" -eq 0 ]; then
    echo "⚠️  Backend Tauri: INACTIF"
    echo ""
    echo "🔧 Pour corriger:"
    echo "   1. Fermer tous les onglets navigateur"
    echo "   2. Exécuter: pnpm run dev:tauri"
    echo "   3. Attendre l'ouverture de la fenêtre native"
    echo ""
    echo "❌ NE PAS utiliser: pnpm run dev (navigateur seul)"
    echo "✅ UTILISER: pnpm run dev:tauri (application complète)"
elif [ "$VITE_PORT" -eq 0 ]; then
    echo "⚠️  Tauri actif mais Vite non démarré"
    echo ""
    echo "🔧 Redémarrer l'application:"
    echo "   1. Arrêter Tauri (Ctrl+C)"
    echo "   2. Relancer: pnpm run dev:tauri"
else
    echo "✅ Système complet opérationnel!"
    echo ""
    echo "🎯 Pour tester le chat IA:"
    echo "   1. Ouvrir TITANE∞ (fenêtre native)"
    echo "   2. Section Conversation (🗨️)"
    echo "   3. Provider Ollama (🦙)"
    echo "   4. Envoyer un message"
fi

echo ""
echo "══════════════════════════════════════════════"
